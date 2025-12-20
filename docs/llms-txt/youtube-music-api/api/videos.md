# Videos API

The Videos API retrieves video information, statistics, content details, and metadata for YouTube videos. This is essential for accessing track information when using YouTube as a music source.

## Endpoint

```
GET https://www.googleapis.com/youtube/v3/videos
```

## Quota Cost

1 unit per request

## Authentication

- API key: Supported for public videos
- OAuth 2.0: Required for accessing private videos or using the `myRating` filter

## Parameters

### Required Parameters

**part** (string)
Comma-separated list of video resource properties to include in the response.

Valid values:
- `snippet` - Basic details (title, description, thumbnails, channelId, tags, categoryId)
- `contentDetails` - Duration, definition, dimension, caption status
- `statistics` - View count, like count, comment count
- `status` - Upload status, privacy status, license
- `player` - Embed HTML
- `topicDetails` - Associated topics
- `recordingDetails` - Recording location and date
- `liveStreamingDetails` - Live stream information

### Filter Parameters (choose exactly one)

**id** (string)
Comma-separated list of video IDs to retrieve (up to 50 IDs).

```typescript
id: "dQw4w9WgXcQ,9bZkp7q19f0"
```

**chart** (string)
Returns most popular videos for specified region.

Valid value: `mostPopular`

**myRating** (string)
Returns videos rated by authenticated user. Requires OAuth 2.0.

Valid values: `like`, `dislike`

### Optional Parameters

**maxResults** (integer)
Number of items to return (1-50, default: 5)

**pageToken** (string)
Token for pagination

**regionCode** (string)
ISO 3166-1 alpha-2 country code (e.g., US, GB, JP)

**videoCategoryId** (string)
Filter by video category

**hl** (string)
Language code for localized metadata (e.g., en, ja, es)

## Response Structure

```typescript
interface VideoListResponse {
  kind: "youtube#videoListResponse";
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: Video[];
}

interface Video {
  kind: "youtube#video";
  etag: string;
  id: string;
  snippet?: VideoSnippet;
  contentDetails?: VideoContentDetails;
  statistics?: VideoStatistics;
  status?: VideoStatus;
}

interface VideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default: Thumbnail;
    medium: Thumbnail;
    high: Thumbnail;
    standard?: Thumbnail;
    maxres?: Thumbnail;
  };
  channelTitle: string;
  tags?: string[];
  categoryId: string;
  liveBroadcastContent: "none" | "upcoming" | "live";
  defaultLanguage?: string;
  localized?: {
    title: string;
    description: string;
  };
}

interface VideoContentDetails {
  duration: string;           // ISO 8601 format (PT4M33S)
  dimension: "2d" | "3d";
  definition: "sd" | "hd";
  caption: "true" | "false";
  licensedContent: boolean;
  contentRating: Record<string, string>;
}

interface VideoStatistics {
  viewCount: string;
  likeCount?: string;
  dislikeCount?: string;      // Hidden since 2021
  favoriteCount: string;
  commentCount?: string;
}

interface VideoStatus {
  uploadStatus: "uploaded" | "processed" | "failed" | "rejected" | "deleted";
  privacyStatus: "public" | "unlisted" | "private";
  license: "youtube" | "creativeCommon";
  embeddable: boolean;
  publicStatsViewable: boolean;
}
```

## Common Use Cases

### Get Single Video

```typescript
async function getVideo(videoId: string, apiKey: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,contentDetails,statistics");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("Video not found");
  }

  return data.items[0];
}

// Usage
const video = await getVideo("dQw4w9WgXcQ", API_KEY);
console.log(video.snippet.title);
console.log(video.statistics.viewCount);
console.log(video.contentDetails.duration);
```

### Get Multiple Videos

```typescript
async function getVideos(videoIds: string[], apiKey: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,statistics");
  url.searchParams.set("id", videoIds.join(","));
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  return data.items;
}

// Usage
const videos = await getVideos(
  ["dQw4w9WgXcQ", "9bZkp7q19f0", "kJQP7kiw5Fk"],
  API_KEY
);
```

### Get Most Popular Videos

```typescript
async function getMostPopularVideos(
  regionCode: string = "US",
  maxResults: number = 25,
  apiKey: string
) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,statistics");
  url.searchParams.set("chart", "mostPopular");
  url.searchParams.set("regionCode", regionCode);
  url.searchParams.set("maxResults", maxResults.toString());
  url.searchParams.set("videoCategoryId", "10"); // Music category
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  return data.items;
}

// Usage
const popularMusic = await getMostPopularVideos("US", 50, API_KEY);
```

### Get User's Liked Videos

Requires OAuth 2.0 authentication.

```typescript
async function getLikedVideos(accessToken: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("myRating", "like");
  url.searchParams.set("maxResults", "50");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  return data.items;
}
```

### Parse Video Duration

YouTube returns duration in ISO 8601 format (e.g., PT4M33S). Convert to seconds:

```typescript
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return 0;

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  return hours * 3600 + minutes * 60 + seconds;
}

// Usage
const video = await getVideo("dQw4w9WgXcQ", API_KEY);
const durationInSeconds = parseDuration(video.contentDetails.duration);
console.log(`Duration: ${durationInSeconds} seconds`);
```

### Format Video Data for Music Adapter

```typescript
interface Track {
  id: string;
  name: string;
  artistName: string;
  duration: number;
  thumbnailUrl: string;
  viewCount: number;
}

function formatVideoAsTrack(video: any): Track {
  return {
    id: video.id,
    name: video.snippet.title,
    artistName: video.snippet.channelTitle,
    duration: parseDuration(video.contentDetails.duration),
    thumbnailUrl: video.snippet.thumbnails.high.url,
    viewCount: parseInt(video.statistics.viewCount)
  };
}

// Usage
const video = await getVideo("dQw4w9WgXcQ", API_KEY);
const track = formatVideoAsTrack(video);
```

## Pagination

Handle large result sets with pagination:

```typescript
async function getAllVideos(videoIds: string[], apiKey: string) {
  const allVideos: any[] = [];
  const batchSize = 50; // Maximum allowed

  for (let i = 0; i < videoIds.length; i += batchSize) {
    const batch = videoIds.slice(i, i + batchSize);
    const videos = await getVideos(batch, apiKey);
    allVideos.push(...videos);

    // Rate limiting
    if (i + batchSize < videoIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return allVideos;
}
```

## Error Handling

```typescript
async function getVideoSafely(videoId: string, apiKey: string) {
  try {
    const video = await getVideo(videoId, apiKey);
    return video;
  } catch (error: any) {
    if (error.message === "Video not found") {
      console.log(`Video ${videoId} not found or is private`);
      return null;
    } else if (error.status === 403) {
      console.error("API key invalid or quota exceeded");
      throw error;
    } else {
      console.error("Failed to fetch video:", error);
      throw error;
    }
  }
}
```

## Common Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | `badRequest` | Invalid parameter combination |
| 400 | `videoChartNotFound` | Invalid chart parameter |
| 403 | `forbidden` | Insufficient permissions or quota exceeded |
| 404 | `videoNotFound` | Video does not exist or is private |

## Best Practices

1. **Request only needed parts**: Each part adds to response size
2. **Batch requests**: Request up to 50 videos per call
3. **Cache responses**: Store video metadata to reduce API calls
4. **Handle missing data**: Some fields may be unavailable (e.g., `likeCount`)
5. **Check privacy status**: Filter out private/deleted videos
6. **Parse durations**: Convert ISO 8601 to seconds for calculations
7. **Use region codes**: Get region-specific popular videos
8. **Implement rate limiting**: Add delays between requests

## Related Topics

- [Search API](search.md): Find videos by query
- [Channels API](channels.md): Get artist/channel information
- [Playlists API](playlists.md): Retrieve playlist contents
- [Error Handling](../core/error-handling.md): Handle API errors
- [Quota Management](../core/quota-management.md): Optimize quota usage
