# Channels API

The Channels API retrieves channel information, statistics, and branding settings. In the context of YouTube Music, channels often represent artists or content creators.

## Endpoint

```
GET https://www.googleapis.com/youtube/v3/channels
```

## Quota Cost

1 unit per request

## Authentication

- API key: Supported for public channels
- OAuth 2.0: Required for accessing private channels or using the `mine` filter

## Parameters

### Required Parameters

**part** (string)
Comma-separated list of channel resource properties to include.

Valid values:
- `snippet` - Basic details (title, description, thumbnails, customUrl)
- `contentDetails` - Related playlists (uploads, likes, favorites)
- `statistics` - Subscriber count, view count, video count
- `brandingSettings` - Channel branding and customization
- `status` - Privacy status, made for kids
- `topicDetails` - Associated topics
- `localizations` - Localized metadata

### Filter Parameters (choose exactly one)

**id** (string)
Comma-separated list of channel IDs (up to 50).

```typescript
id: "UC-lHJZR3Gqxm24_Vd_AJ5Yw"
```

**forHandle** (string)
YouTube handle (with or without @ prefix) to find associated channel.

```typescript
forHandle: "@YouTubeCreators"
// or
forHandle: "YouTubeCreators"
```

**forUsername** (string)
YouTube username (legacy identifier).

```typescript
forUsername: "GoogleDevelopers"
```

**mine** (boolean)
Returns channels owned by authenticated user. Requires OAuth 2.0.

```typescript
mine: true
```

### Optional Parameters

**maxResults** (integer)
Number of items to return (0-50, default: 5)

**pageToken** (string)
Token for pagination

**hl** (string)
Language code for localized metadata

## Response Structure

```typescript
interface ChannelListResponse {
  kind: "youtube#channelListResponse";
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: Channel[];
}

interface Channel {
  kind: "youtube#channel";
  etag: string;
  id: string;
  snippet?: ChannelSnippet;
  contentDetails?: ChannelContentDetails;
  statistics?: ChannelStatistics;
  brandingSettings?: ChannelBrandingSettings;
}

interface ChannelSnippet {
  title: string;
  description: string;
  customUrl?: string;
  publishedAt: string;
  thumbnails: {
    default: Thumbnail;
    medium: Thumbnail;
    high: Thumbnail;
  };
  defaultLanguage?: string;
  localized?: {
    title: string;
    description: string;
  };
  country?: string;
}

interface ChannelContentDetails {
  relatedPlaylists: {
    uploads: string;      // Playlist ID of all uploads
    likes?: string;       // Liked videos playlist
    favorites?: string;   // Favorites playlist
  };
}

interface ChannelStatistics {
  viewCount: string;
  subscriberCount?: string;  // Hidden if channel privacy settings
  hiddenSubscriberCount: boolean;
  videoCount: string;
}

interface ChannelBrandingSettings {
  channel: {
    title: string;
    description: string;
    keywords?: string;
    trackingAnalyticsAccountId?: string;
    moderateComments?: boolean;
    unsubscribedTrailer?: string;
    defaultLanguage?: string;
    country?: string;
  };
  image?: {
    bannerExternalUrl: string;
  };
}

interface Thumbnail {
  url: string;
  width?: number;
  height?: number;
}
```

## Common Use Cases

### Get Channel by ID

```typescript
async function getChannel(channelId: string, apiKey: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "snippet,statistics,brandingSettings");
  url.searchParams.set("id", channelId);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("Channel not found");
  }

  return data.items[0];
}

// Usage
const channel = await getChannel("UC-lHJZR3Gqxm24_Vd_AJ5Yw", API_KEY);
console.log(channel.snippet.title);
console.log(channel.statistics.subscriberCount);
```

### Get Channel by Handle

```typescript
async function getChannelByHandle(handle: string, apiKey: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "snippet,statistics");
  url.searchParams.set("forHandle", handle.replace("@", ""));
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("Channel not found");
  }

  return data.items[0];
}

// Usage
const channel = await getChannelByHandle("@YouTubeCreators", API_KEY);
```

### Get Multiple Channels

```typescript
async function getChannels(channelIds: string[], apiKey: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "snippet,statistics");
  url.searchParams.set("id", channelIds.join(","));
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  return data.items;
}

// Usage
const channels = await getChannels([
  "UC-lHJZR3Gqxm24_Vd_AJ5Yw",
  "UCbLt9t3lB5XEBHW0_lH5Jig"
], API_KEY);
```

### Get Authenticated User's Channels

Requires OAuth 2.0 authentication.

```typescript
async function getMyChannels(accessToken: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "snippet,contentDetails,statistics");
  url.searchParams.set("mine", "true");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  return data.items;
}

// Usage
const myChannels = await getMyChannels(accessToken);
```

### Get Channel Upload Playlist

Every channel has a playlist containing all uploads:

```typescript
async function getChannelUploads(channelId: string, apiKey: string) {
  // First, get the channel to find uploads playlist ID
  const channel = await getChannel(channelId, apiKey);
  const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

  // Then fetch playlist items
  const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("playlistId", uploadsPlaylistId);
  url.searchParams.set("maxResults", "50");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  return data.items.map((item: any) => ({
    videoId: item.contentDetails.videoId,
    title: item.snippet.title,
    publishedAt: item.snippet.publishedAt
  }));
}

// Usage
const uploads = await getChannelUploads("UC-lHJZR3Gqxm24_Vd_AJ5Yw", API_KEY);
```

### Format Channel as Artist

```typescript
interface Artist {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount?: number;
  videoCount: number;
}

function formatChannelAsArtist(channel: any): Artist {
  return {
    id: channel.id,
    name: channel.snippet.title,
    description: channel.snippet.description,
    thumbnailUrl: channel.snippet.thumbnails.high.url,
    subscriberCount: channel.statistics.hiddenSubscriberCount
      ? undefined
      : parseInt(channel.statistics.subscriberCount),
    videoCount: parseInt(channel.statistics.videoCount)
  };
}

// Usage
const channel = await getChannel("UC-lHJZR3Gqxm24_Vd_AJ5Yw", API_KEY);
const artist = formatChannelAsArtist(channel);
```

## Extract Channel ID from Video

```typescript
async function getChannelIdFromVideo(videoId: string, apiKey: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("Video not found");
  }

  return data.items[0].snippet.channelId;
}

// Then get full channel details
const channelId = await getChannelIdFromVideo("dQw4w9WgXcQ", API_KEY);
const channel = await getChannel(channelId, API_KEY);
```

## Batch Channel Retrieval

```typescript
async function getAllChannels(channelIds: string[], apiKey: string) {
  const allChannels: any[] = [];
  const batchSize = 50; // Maximum allowed

  for (let i = 0; i < channelIds.length; i += batchSize) {
    const batch = channelIds.slice(i, i + batchSize);
    const channels = await getChannels(batch, apiKey);
    allChannels.push(...channels);

    // Rate limiting
    if (i + batchSize < channelIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return allChannels;
}
```

## Error Handling

```typescript
async function getChannelSafely(channelId: string, apiKey: string) {
  try {
    return await getChannel(channelId, apiKey);
  } catch (error: any) {
    if (error.message === "Channel not found") {
      console.log(`Channel ${channelId} not found`);
      return null;
    } else if (error.status === 403) {
      if (error.message.includes("channelForbidden")) {
        console.log("Channel is private or restricted");
        return null;
      }
      throw error;
    } else {
      throw error;
    }
  }
}
```

## Common Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | `invalidCriteria` | Multiple conflicting filter parameters |
| 403 | `channelForbidden` | Channel is private or request not authorized |
| 403 | `channelClosed` | Channel has been closed |
| 404 | `channelNotFound` | Channel ID does not exist |

## TypeScript Types

```typescript
type ChannelPart =
  | "snippet"
  | "contentDetails"
  | "statistics"
  | "brandingSettings"
  | "status"
  | "topicDetails"
  | "localizations";

interface GetChannelOptions {
  parts: ChannelPart[];
  id?: string;
  forHandle?: string;
  forUsername?: string;
  mine?: boolean;
  maxResults?: number;
  pageToken?: string;
  hl?: string;
}

async function getChannelWithOptions(
  options: GetChannelOptions,
  apiKey: string
) {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", options.parts.join(","));

  if (options.id) url.searchParams.set("id", options.id);
  if (options.forHandle) url.searchParams.set("forHandle", options.forHandle);
  if (options.forUsername) url.searchParams.set("forUsername", options.forUsername);
  if (options.mine) url.searchParams.set("mine", "true");
  if (options.maxResults) url.searchParams.set("maxResults", options.maxResults.toString());
  if (options.pageToken) url.searchParams.set("pageToken", options.pageToken);
  if (options.hl) url.searchParams.set("hl", options.hl);

  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  return data;
}
```

## Best Practices

1. **Request only needed parts**: Minimize response size and processing
2. **Batch requests**: Request up to 50 channels per call
3. **Cache channel data**: Channel metadata changes infrequently
4. **Handle hidden subscribers**: Check `hiddenSubscriberCount` before using count
5. **Use handles when available**: Handles are more stable than usernames
6. **Get uploads playlist**: Access all channel videos via uploads playlist
7. **Check channel status**: Verify channel isn't closed or suspended
8. **Implement rate limiting**: Add delays between batched requests

## Related Topics

- [Videos API](videos.md): Get video information from channels
- [Playlists API](playlists.md): Access channel playlists
- [Search API](search.md): Search for channels
- [Error Handling](../core/error-handling.md): Handle API errors
