# Playlists API

The Playlists API retrieves playlist metadata and contents. Essential for accessing curated music collections, albums, and user-created playlists on YouTube.

## Endpoint

```
GET https://www.googleapis.com/youtube/v3/playlists
```

## Quota Cost

1 unit per request

## Authentication

- API key: Supported for public playlists
- OAuth 2.0: Required for private playlists or using the `mine` filter

## Parameters

### Required Parameters

**part** (string)
Comma-separated list of playlist resource properties.

Valid values:
- `snippet` - Basic details (title, description, thumbnails, channelId, channelTitle)
- `contentDetails` - Item count
- `status` - Privacy status
- `player` - Embed HTML
- `localizations` - Localized metadata

### Filter Parameters (choose exactly one)

**id** (string)
Comma-separated list of playlist IDs (up to 50).

```typescript
id: "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
```

**channelId** (string)
Returns playlists created by specified channel.

```typescript
channelId: "UC-lHJZR3Gqxm24_Vd_AJ5Yw"
```

**mine** (boolean)
Returns playlists owned by authenticated user. Requires OAuth 2.0.

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
interface PlaylistListResponse {
  kind: "youtube#playlistListResponse";
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: Playlist[];
}

interface Playlist {
  kind: "youtube#playlist";
  etag: string;
  id: string;
  snippet?: PlaylistSnippet;
  contentDetails?: PlaylistContentDetails;
  status?: PlaylistStatus;
  player?: PlaylistPlayer;
}

interface PlaylistSnippet {
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
  defaultLanguage?: string;
  localized?: {
    title: string;
    description: string;
  };
}

interface PlaylistContentDetails {
  itemCount: number;
}

interface PlaylistStatus {
  privacyStatus: "public" | "unlisted" | "private";
}

interface PlaylistPlayer {
  embedHtml: string;
}
```

## Common Use Cases

### Get Playlist by ID

```typescript
async function getPlaylist(playlistId: string, apiKey: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/playlists");
  url.searchParams.set("part", "snippet,contentDetails,status");
  url.searchParams.set("id", playlistId);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("Playlist not found");
  }

  return data.items[0];
}

// Usage
const playlist = await getPlaylist("PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf", API_KEY);
console.log(playlist.snippet.title);
console.log(playlist.contentDetails.itemCount);
```

### Get Multiple Playlists

```typescript
async function getPlaylists(playlistIds: string[], apiKey: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/playlists");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("id", playlistIds.join(","));
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  return data.items;
}

// Usage
const playlists = await getPlaylists([
  "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
  "PLBCF2DAC6FFB574DE"
], API_KEY);
```

### Get Channel's Playlists

```typescript
async function getChannelPlaylists(
  channelId: string,
  apiKey: string,
  maxResults: number = 50
) {
  const url = new URL("https://www.googleapis.com/youtube/v3/playlists");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("channelId", channelId);
  url.searchParams.set("maxResults", maxResults.toString());
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  return data.items;
}

// Usage
const playlists = await getChannelPlaylists("UC-lHJZR3Gqxm24_Vd_AJ5Yw", API_KEY);
```

### Get User's Playlists

Requires OAuth 2.0 authentication.

```typescript
async function getMyPlaylists(accessToken: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/playlists");
  url.searchParams.set("part", "snippet,contentDetails,status");
  url.searchParams.set("mine", "true");
  url.searchParams.set("maxResults", "50");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  return data.items;
}

// Usage
const myPlaylists = await getMyPlaylists(accessToken);
```

## Get Playlist Items

To retrieve videos in a playlist, use the `playlistItems` endpoint:

```typescript
async function getPlaylistItems(playlistId: string, apiKey: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("playlistId", playlistId);
  url.searchParams.set("maxResults", "50");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  return data.items.map((item: any) => ({
    videoId: item.contentDetails.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    position: item.snippet.position,
    publishedAt: item.snippet.publishedAt
  }));
}

// Usage
const items = await getPlaylistItems("PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf", API_KEY);
```

### Get All Playlist Items (with pagination)

```typescript
async function getAllPlaylistItems(playlistId: string, apiKey: string) {
  const allItems: any[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    allItems.push(...data.items);
    pageToken = data.nextPageToken;

    // Rate limiting
    if (pageToken) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } while (pageToken);

  return allItems;
}

// Usage
const allItems = await getAllPlaylistItems("PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf", API_KEY);
console.log(`Total items: ${allItems.length}`);
```

### Format Playlist Data

```typescript
interface PlaylistInfo {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  itemCount: number;
  isPublic: boolean;
  ownerName: string;
}

function formatPlaylist(playlist: any): PlaylistInfo {
  return {
    id: playlist.id,
    name: playlist.snippet.title,
    description: playlist.snippet.description,
    thumbnailUrl: playlist.snippet.thumbnails.high?.url ||
                  playlist.snippet.thumbnails.medium.url,
    itemCount: playlist.contentDetails.itemCount,
    isPublic: playlist.status?.privacyStatus === "public",
    ownerName: playlist.snippet.channelTitle
  };
}

// Usage
const playlist = await getPlaylist("PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf", API_KEY);
const info = formatPlaylist(playlist);
```

### Get Playlist with Videos

Combine playlist metadata and video details:

```typescript
async function getPlaylistWithVideos(playlistId: string, apiKey: string) {
  // Get playlist metadata
  const playlist = await getPlaylist(playlistId, apiKey);

  // Get playlist items (video IDs)
  const items = await getAllPlaylistItems(playlistId, apiKey);
  const videoIds = items.map(item => item.contentDetails.videoId);

  // Get video details in batches
  const videos: any[] = [];
  const batchSize = 50;

  for (let i = 0; i < videoIds.length; i += batchSize) {
    const batch = videoIds.slice(i, i + batchSize);

    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "snippet,contentDetails,statistics");
    url.searchParams.set("id", batch.join(","));
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();
    videos.push(...data.items);

    if (i + batchSize < videoIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return {
    playlist: formatPlaylist(playlist),
    videos: videos.map(video => ({
      id: video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      duration: video.contentDetails.duration,
      viewCount: parseInt(video.statistics.viewCount)
    }))
  };
}

// Usage
const playlistData = await getPlaylistWithVideos("PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf", API_KEY);
console.log(`${playlistData.playlist.name} has ${playlistData.videos.length} videos`);
```

## Pagination Helper

```typescript
async function* paginatePlaylistItems(playlistId: string, apiKey: string) {
  let pageToken: string | undefined;

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    yield data.items;
    pageToken = data.nextPageToken;

    if (pageToken) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } while (pageToken);
}

// Usage with async iteration
for await (const itemsBatch of paginatePlaylistItems("PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf", API_KEY)) {
  console.log(`Processing ${itemsBatch.length} items`);
  // Process batch
}
```

## Error Handling

```typescript
async function getPlaylistSafely(playlistId: string, apiKey: string) {
  try {
    return await getPlaylist(playlistId, apiKey);
  } catch (error: any) {
    if (error.message === "Playlist not found") {
      console.log(`Playlist ${playlistId} not found or is private`);
      return null;
    } else if (error.status === 403) {
      if (error.message.includes("playlistForbidden")) {
        console.log("Playlist is private or restricted");
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
| 403 | `playlistForbidden` | Playlist is private or request not authorized |
| 404 | `playlistNotFound` | Playlist ID does not exist |
| 404 | `channelNotFound` | Channel ID does not exist |
| 400 | `playlistOperationUnsupported` | Cannot list this playlist type |

## TypeScript Types

```typescript
type PlaylistPart = "snippet" | "contentDetails" | "status" | "player" | "localizations";

interface GetPlaylistOptions {
  parts: PlaylistPart[];
  id?: string;
  channelId?: string;
  mine?: boolean;
  maxResults?: number;
  pageToken?: string;
  hl?: string;
}

async function getPlaylistWithOptions(
  options: GetPlaylistOptions,
  apiKey: string
) {
  const url = new URL("https://www.googleapis.com/youtube/v3/playlists");
  url.searchParams.set("part", options.parts.join(","));

  if (options.id) url.searchParams.set("id", options.id);
  if (options.channelId) url.searchParams.set("channelId", options.channelId);
  if (options.mine) url.searchParams.set("mine", "true");
  if (options.maxResults) url.searchParams.set("maxResults", options.maxResults.toString());
  if (options.pageToken) url.searchParams.set("pageToken", options.pageToken);
  if (options.hl) url.searchParams.set("hl", options.hl);

  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  return response.json();
}
```

## Best Practices

1. **Request only needed parts**: Minimize response size
2. **Batch requests**: Request up to 50 playlists per call
3. **Cache playlist metadata**: Playlists change less frequently than videos
4. **Paginate playlist items**: Large playlists require pagination
5. **Handle deleted videos**: Playlist items may reference deleted videos
6. **Check privacy status**: Respect private playlist restrictions
7. **Implement rate limiting**: Add delays between paginated requests
8. **Combine with Videos API**: Get full video details for playlist items

## Related Topics

- [Videos API](videos.md): Get video details for playlist items
- [Channels API](channels.md): Get channel information for playlist owners
- [Search API](search.md): Search for playlists
- [Error Handling](../core/error-handling.md): Handle API errors
- [Quota Management](../core/quota-management.md): Optimize quota usage
