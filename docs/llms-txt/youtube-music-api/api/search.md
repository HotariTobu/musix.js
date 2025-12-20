# Search API

The Search API enables searching for videos, channels, and playlists on YouTube. Essential for discovering music content by query, artist, or other criteria.

## Endpoint

```
GET https://www.googleapis.com/youtube/v3/search
```

## Quota Cost

100 units per request (high cost - use carefully)

## Authentication

- API key: Supported for public searches
- OAuth 2.0: Required for user-specific searches (`forMine`, `forContentOwner`)

## Parameters

### Required Parameters

**part** (string)
Must be set to `snippet`.

### Query Parameters

**q** (string)
Search query term. Supports Boolean operators:
- `-` for NOT (e.g., `music -remix`)
- `|` for OR (e.g., `jazz | blues`)

```typescript
q: "jazz piano"
q: "rock music -cover"
q: "pop | electronic"
```

### Filter Parameters

**type** (string)
Comma-separated resource types to return. Default: all three.

Valid values: `video`, `channel`, `playlist`

```typescript
type: "video"                    // Only videos
type: "channel,playlist"         // Channels and playlists
```

**channelId** (string)
Restricts search to specific channel.

**regionCode** (string)
ISO 3166-1 alpha-2 country code (e.g., US, GB, JP)

### Optional Parameters

**maxResults** (integer)
Number of items to return (0-50, default: 5)

**order** (string)
Sort order for results.

Valid values:
- `relevance` (default) - Most relevant first
- `date` - Newest first
- `rating` - Highest rated first
- `title` - Alphabetical by title
- `videoCount` - By number of videos (channels only)
- `viewCount` - By view count

**pageToken** (string)
Token for pagination

**publishedAfter** (datetime)
RFC 3339 timestamp (e.g., `2024-01-01T00:00:00Z`)

**publishedBefore** (datetime)
RFC 3339 timestamp

**safeSearch** (string)
Content filtering.

Valid values: `moderate` (default), `none`, `strict`

### Video-Specific Filters

These filters require `type=video`:

**eventType** (string)
- `completed` - Completed broadcasts
- `live` - Live broadcasts
- `upcoming` - Upcoming broadcasts

**videoCaption** (string)
- `any` - All videos
- `closedCaption` - Only videos with captions
- `none` - Only videos without captions

**videoCategoryId** (string)
Filter by category (e.g., `10` for Music)

**videoDefinition** (string)
- `any` (default)
- `high` - HD only
- `standard` - SD only

**videoDimension** (string)
- `any` (default)
- `2d` - 2D videos only
- `3d` - 3D videos only

**videoDuration** (string)
- `any` (default)
- `short` - Less than 4 minutes
- `medium` - 4-20 minutes
- `long` - More than 20 minutes

**videoEmbeddable** (string)
- `any` (default)
- `true` - Only embeddable videos

**videoLicense** (string)
- `any` (default)
- `youtube` - Standard YouTube license
- `creativeCommon` - Creative Commons

**videoType** (string)
- `any` (default)
- `episode` - TV episode
- `movie` - Feature film

## Response Structure

```typescript
interface SearchListResponse {
  kind: "youtube#searchListResponse";
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  regionCode?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: SearchResult[];
}

interface SearchResult {
  kind: "youtube#searchResult";
  etag: string;
  id: SearchResultId;
  snippet: SearchResultSnippet;
}

interface SearchResultId {
  kind: string;
  videoId?: string;      // If type is video
  channelId?: string;    // If type is channel
  playlistId?: string;   // If type is playlist
}

interface SearchResultSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default: Thumbnail;
    medium: Thumbnail;
    high: Thumbnail;
  };
  channelTitle: string;
  liveBroadcastContent: "none" | "upcoming" | "live";
}
```

## Common Use Cases

### Basic Video Search

```typescript
async function searchVideos(query: string, apiKey: string, maxResults: number = 25) {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", maxResults.toString());
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  return data.items.map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    thumbnailUrl: item.snippet.thumbnails.high.url
  }));
}

// Usage
const videos = await searchVideos("jazz piano music", API_KEY, 10);
```

### Search Music Videos Only

```typescript
async function searchMusicVideos(query: string, apiKey: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("q", query);
  url.searchParams.set("videoCategoryId", "10"); // Music category
  url.searchParams.set("maxResults", "25");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  return data.items;
}

// Usage
const musicVideos = await searchMusicVideos("rock music", API_KEY);
```

### Search with Filters

```typescript
interface SearchFilters {
  query: string;
  type?: "video" | "channel" | "playlist";
  maxResults?: number;
  order?: "relevance" | "date" | "rating" | "viewCount";
  publishedAfter?: Date;
  videoDuration?: "short" | "medium" | "long";
  videoDefinition?: "high" | "standard";
  regionCode?: string;
}

async function searchWithFilters(filters: SearchFilters, apiKey: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", filters.query);

  if (filters.type) url.searchParams.set("type", filters.type);
  if (filters.maxResults) url.searchParams.set("maxResults", filters.maxResults.toString());
  if (filters.order) url.searchParams.set("order", filters.order);
  if (filters.publishedAfter) {
    url.searchParams.set("publishedAfter", filters.publishedAfter.toISOString());
  }
  if (filters.videoDuration) url.searchParams.set("videoDuration", filters.videoDuration);
  if (filters.videoDefinition) url.searchParams.set("videoDefinition", filters.videoDefinition);
  if (filters.regionCode) url.searchParams.set("regionCode", filters.regionCode);

  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  return response.json();
}

// Usage
const results = await searchWithFilters({
  query: "electronic music",
  type: "video",
  maxResults: 20,
  order: "viewCount",
  videoDuration: "medium",
  regionCode: "US"
}, API_KEY);
```

### Search Recent Videos

```typescript
async function searchRecentVideos(query: string, daysAgo: number, apiKey: string) {
  const publishedAfter = new Date();
  publishedAfter.setDate(publishedAfter.getDate() - daysAgo);

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("q", query);
  url.searchParams.set("order", "date");
  url.searchParams.set("publishedAfter", publishedAfter.toISOString());
  url.searchParams.set("maxResults", "25");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  return data.items;
}

// Usage - videos from last 7 days
const recentVideos = await searchRecentVideos("new music releases", 7, API_KEY);
```

### Search in Specific Channel

```typescript
async function searchInChannel(
  channelId: string,
  query: string,
  apiKey: string
) {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("channelId", channelId);
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "50");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  return data.items;
}

// Usage
const channelVideos = await searchInChannel(
  "UC-lHJZR3Gqxm24_Vd_AJ5Yw",
  "tutorial",
  API_KEY
);
```

### Paginated Search

```typescript
async function* paginateSearch(query: string, apiKey: string) {
  let pageToken: string | undefined;

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    yield data.items;
    pageToken = data.nextPageToken;

    // Rate limiting and quota consideration
    if (pageToken) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } while (pageToken);
}

// Usage with async iteration
for await (const resultsBatch of paginateSearch("jazz music", API_KEY)) {
  console.log(`Processing ${resultsBatch.length} results`);
  // Process batch
}
```

### Get Video Details from Search

Search results don't include full video details. Fetch them separately:

```typescript
async function searchWithDetails(query: string, apiKey: string) {
  // First, search for videos
  const searchResults = await searchVideos(query, apiKey, 25);
  const videoIds = searchResults.map(item => item.videoId);

  // Then get full video details
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,contentDetails,statistics");
  url.searchParams.set("id", videoIds.join(","));
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  return data.items;
}

// Usage
const videosWithDetails = await searchWithDetails("acoustic guitar", API_KEY);
```

### Search Multiple Types

```typescript
async function searchAll(query: string, apiKey: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video,channel,playlist");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "25");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  // Categorize results
  const videos = data.items.filter((item: any) => item.id.videoId);
  const channels = data.items.filter((item: any) => item.id.channelId);
  const playlists = data.items.filter((item: any) => item.id.playlistId);

  return { videos, channels, playlists };
}

// Usage
const results = await searchAll("jazz", API_KEY);
console.log(`Found ${results.videos.length} videos`);
console.log(`Found ${results.channels.length} channels`);
console.log(`Found ${results.playlists.length} playlists`);
```

## Quota Optimization

Search is expensive (100 units). Optimize usage:

```typescript
class SearchCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 60 * 60 * 1000; // 1 hour

  getCacheKey(query: string, filters: any): string {
    return JSON.stringify({ query, filters });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async search(
    query: string,
    filters: any,
    apiKey: string
  ): Promise<any> {
    const cacheKey = this.getCacheKey(query, filters);
    const cached = this.get(cacheKey);

    if (cached) {
      console.log("Using cached results");
      return cached;
    }

    const results = await searchWithFilters({ query, ...filters }, apiKey);
    this.set(cacheKey, results);

    return results;
  }
}

// Usage
const searchCache = new SearchCache();
const results = await searchCache.search("piano music", {}, API_KEY);
```

## Error Handling

```typescript
async function safeSearch(query: string, apiKey: string) {
  try {
    return await searchVideos(query, apiKey);
  } catch (error: any) {
    if (error.status === 400) {
      if (error.message.includes("invalidSearchFilter")) {
        console.error("Invalid filter combination");
      }
      throw error;
    } else if (error.status === 403) {
      console.error("Quota exceeded or invalid API key");
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
| 400 | `invalidSearchFilter` | Incompatible filter parameters |
| 400 | `invalidChannelId` | Malformed channel ID |
| 400 | `invalidLocation` | Invalid location/radius values |
| 403 | `quotaExceeded` | Daily quota limit reached |

## Best Practices

1. **Cache aggressively**: Search is expensive (100 units)
2. **Use specific queries**: More specific = better results
3. **Filter by type**: Reduce irrelevant results
4. **Limit results**: Request only needed amount
5. **Combine with Videos API**: Get full details separately
6. **Implement debouncing**: For search-as-you-type features
7. **Use pagination carefully**: Each page costs 100 units
8. **Consider alternatives**: Browse by category or playlists when possible
9. **Monitor quota**: Track usage closely
10. **Handle empty results**: Not all queries return results

## Related Topics

- [Videos API](videos.md): Get full video details
- [Channels API](channels.md): Get channel information
- [Playlists API](playlists.md): Get playlist details
- [Error Handling](../core/error-handling.md): Handle API errors
- [Quota Management](../core/quota-management.md): Optimize quota usage
