# TypeScript Usage

Type definitions and usage patterns for TypeScript and JavaScript developers using the YouTube Data API.

## Type Definitions

### Core Response Types

```typescript
// Base response structure
interface YouTubeResponse<T> {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: T[];
}

// Thumbnail
interface Thumbnail {
  url: string;
  width?: number;
  height?: number;
}

interface ThumbnailSet {
  default: Thumbnail;
  medium: Thumbnail;
  high: Thumbnail;
  standard?: Thumbnail;
  maxres?: Thumbnail;
}
```

### Video Types

```typescript
interface Video {
  kind: "youtube#video";
  etag: string;
  id: string;
  snippet?: VideoSnippet;
  contentDetails?: VideoContentDetails;
  statistics?: VideoStatistics;
  status?: VideoStatus;
  player?: VideoPlayer;
  topicDetails?: VideoTopicDetails;
}

interface VideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: ThumbnailSet;
  channelTitle: string;
  tags?: string[];
  categoryId: string;
  liveBroadcastContent: "none" | "upcoming" | "live";
  defaultLanguage?: string;
  localized?: {
    title: string;
    description: string;
  };
  defaultAudioLanguage?: string;
}

interface VideoContentDetails {
  duration: string;  // ISO 8601 format
  dimension: "2d" | "3d";
  definition: "sd" | "hd";
  caption: "true" | "false";
  licensedContent: boolean;
  regionRestriction?: {
    allowed?: string[];
    blocked?: string[];
  };
  contentRating: Record<string, string>;
  projection: "rectangular" | "360";
}

interface VideoStatistics {
  viewCount: string;
  likeCount?: string;
  dislikeCount?: string;
  favoriteCount: string;
  commentCount?: string;
}

interface VideoStatus {
  uploadStatus: "uploaded" | "processed" | "failed" | "rejected" | "deleted";
  privacyStatus: "public" | "unlisted" | "private";
  license: "youtube" | "creativeCommon";
  embeddable: boolean;
  publicStatsViewable: boolean;
  madeForKids: boolean;
  selfDeclaredMadeForKids?: boolean;
}

interface VideoPlayer {
  embedHtml: string;
  embedHeight?: number;
  embedWidth?: number;
}

interface VideoTopicDetails {
  topicIds?: string[];
  relevantTopicIds?: string[];
  topicCategories?: string[];
}

type VideoListResponse = YouTubeResponse<Video>;
```

### Channel Types

```typescript
interface Channel {
  kind: "youtube#channel";
  etag: string;
  id: string;
  snippet?: ChannelSnippet;
  contentDetails?: ChannelContentDetails;
  statistics?: ChannelStatistics;
  brandingSettings?: ChannelBrandingSettings;
  status?: ChannelStatus;
}

interface ChannelSnippet {
  title: string;
  description: string;
  customUrl?: string;
  publishedAt: string;
  thumbnails: ThumbnailSet;
  defaultLanguage?: string;
  localized?: {
    title: string;
    description: string;
  };
  country?: string;
}

interface ChannelContentDetails {
  relatedPlaylists: {
    likes?: string;
    favorites?: string;
    uploads: string;
  };
}

interface ChannelStatistics {
  viewCount: string;
  subscriberCount?: string;
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

interface ChannelStatus {
  privacyStatus: "public" | "unlisted" | "private";
  isLinked: boolean;
  longUploadsStatus: "allowed" | "eligible" | "disallowed";
  madeForKids: boolean;
  selfDeclaredMadeForKids?: boolean;
}

type ChannelListResponse = YouTubeResponse<Channel>;
```

### Playlist Types

```typescript
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
  thumbnails: ThumbnailSet;
  channelTitle: string;
  defaultLanguage?: string;
  localized?: {
    title: string;
    description: string;
  };
  tags?: string[];
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

type PlaylistListResponse = YouTubeResponse<Playlist>;

// Playlist Items
interface PlaylistItem {
  kind: "youtube#playlistItem";
  etag: string;
  id: string;
  snippet?: PlaylistItemSnippet;
  contentDetails?: PlaylistItemContentDetails;
  status?: PlaylistItemStatus;
}

interface PlaylistItemSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: ThumbnailSet;
  channelTitle: string;
  playlistId: string;
  position: number;
  resourceId: {
    kind: string;
    videoId: string;
  };
  videoOwnerChannelTitle?: string;
  videoOwnerChannelId?: string;
}

interface PlaylistItemContentDetails {
  videoId: string;
  videoPublishedAt?: string;
}

interface PlaylistItemStatus {
  privacyStatus: "public" | "unlisted" | "private";
}

type PlaylistItemListResponse = YouTubeResponse<PlaylistItem>;
```

### Search Types

```typescript
interface SearchResult {
  kind: "youtube#searchResult";
  etag: string;
  id: SearchResultId;
  snippet: SearchResultSnippet;
}

interface SearchResultId {
  kind: "youtube#video" | "youtube#channel" | "youtube#playlist";
  videoId?: string;
  channelId?: string;
  playlistId?: string;
}

interface SearchResultSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: ThumbnailSet;
  channelTitle: string;
  liveBroadcastContent: "none" | "upcoming" | "live";
}

interface SearchListResponse extends YouTubeResponse<SearchResult> {
  regionCode?: string;
}
```

## API Client with Types

```typescript
class TypedYouTubeClient {
  constructor(private apiKey: string) {}

  private async request<T>(
    endpoint: string,
    params: Record<string, string>
  ): Promise<T> {
    const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
    url.searchParams.set("key", this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    return response.json();
  }

  async getVideo(videoId: string): Promise<Video> {
    const response = await this.request<VideoListResponse>("videos", {
      part: "snippet,contentDetails,statistics",
      id: videoId
    });

    if (!response.items || response.items.length === 0) {
      throw new Error("Video not found");
    }

    return response.items[0];
  }

  async getVideos(videoIds: string[]): Promise<Video[]> {
    const response = await this.request<VideoListResponse>("videos", {
      part: "snippet,contentDetails,statistics",
      id: videoIds.join(",")
    });

    return response.items;
  }

  async getChannel(channelId: string): Promise<Channel> {
    const response = await this.request<ChannelListResponse>("channels", {
      part: "snippet,statistics,contentDetails",
      id: channelId
    });

    if (!response.items || response.items.length === 0) {
      throw new Error("Channel not found");
    }

    return response.items[0];
  }

  async getPlaylist(playlistId: string): Promise<Playlist> {
    const response = await this.request<PlaylistListResponse>("playlists", {
      part: "snippet,contentDetails,status",
      id: playlistId
    });

    if (!response.items || response.items.length === 0) {
      throw new Error("Playlist not found");
    }

    return response.items[0];
  }

  async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    const response = await this.request<PlaylistItemListResponse>(
      "playlistItems",
      {
        part: "snippet,contentDetails",
        playlistId,
        maxResults: "50"
      }
    );

    return response.items;
  }

  async search(query: string, type: "video" | "channel" | "playlist" = "video"): Promise<SearchResult[]> {
    const response = await this.request<SearchListResponse>("search", {
      part: "snippet",
      q: query,
      type,
      maxResults: "25"
    });

    return response.items;
  }
}
```

## Type Guards

```typescript
function isVideo(item: Video | Channel | Playlist): item is Video {
  return item.kind === "youtube#video";
}

function isChannel(item: Video | Channel | Playlist): item is Channel {
  return item.kind === "youtube#channel";
}

function isPlaylist(item: Video | Channel | Playlist): item is Playlist {
  return item.kind === "youtube#playlist";
}

function isVideoSearchResult(result: SearchResult): result is SearchResult & { id: { videoId: string } } {
  return result.id.kind === "youtube#video" && !!result.id.videoId;
}

function isChannelSearchResult(result: SearchResult): result is SearchResult & { id: { channelId: string } } {
  return result.id.kind === "youtube#channel" && !!result.id.channelId;
}

// Usage
const results = await client.search("music");

for (const result of results) {
  if (isVideoSearchResult(result)) {
    console.log("Video:", result.id.videoId);
  } else if (isChannelSearchResult(result)) {
    console.log("Channel:", result.id.channelId);
  }
}
```

## Generic Request Builder

```typescript
type YouTubePart<T> = T extends "video"
  ? "snippet" | "contentDetails" | "statistics" | "status" | "player"
  : T extends "channel"
  ? "snippet" | "contentDetails" | "statistics" | "brandingSettings"
  : T extends "playlist"
  ? "snippet" | "contentDetails" | "status" | "player"
  : never;

interface RequestOptions<T extends string> {
  parts: YouTubePart<T>[];
  maxResults?: number;
  pageToken?: string;
}

class RequestBuilder<T extends "video" | "channel" | "playlist"> {
  private params = new URLSearchParams();

  constructor(
    private endpoint: string,
    private apiKey: string
  ) {
    this.params.set("key", apiKey);
  }

  parts(...parts: YouTubePart<T>[]): this {
    this.params.set("part", parts.join(","));
    return this;
  }

  id(id: string): this {
    this.params.set("id", id);
    return this;
  }

  maxResults(max: number): this {
    this.params.set("maxResults", max.toString());
    return this;
  }

  pageToken(token: string): this {
    this.params.set("pageToken", token);
    return this;
  }

  build(): string {
    return `https://www.googleapis.com/youtube/v3/${this.endpoint}?${this.params}`;
  }

  async execute<R>(): Promise<R> {
    const response = await fetch(this.build());
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
  }
}

// Usage
const video = await new RequestBuilder<"video">("videos", API_KEY)
  .parts("snippet", "statistics")
  .id("dQw4w9WgXcQ")
  .execute<VideoListResponse>();
```

## Utility Types

```typescript
// Extract video IDs from search results
type VideoId = string;
type ChannelId = string;
type PlaylistId = string;

function extractVideoIds(results: SearchResult[]): VideoId[] {
  return results
    .filter(isVideoSearchResult)
    .map(r => r.id.videoId);
}

// Parse duration to seconds
function parseDuration(iso8601: string): number {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  return hours * 3600 + minutes * 60 + seconds;
}

// Format video for music adapter
interface Track {
  id: VideoId;
  name: string;
  artistName: string;
  duration: number;
  thumbnailUrl: string;
  viewCount: number;
}

function formatVideoAsTrack(video: Video): Track {
  if (!video.snippet || !video.contentDetails || !video.statistics) {
    throw new Error("Missing required video parts");
  }

  return {
    id: video.id,
    name: video.snippet.title,
    artistName: video.snippet.channelTitle,
    duration: parseDuration(video.contentDetails.duration),
    thumbnailUrl: video.snippet.thumbnails.high.url,
    viewCount: parseInt(video.statistics.viewCount)
  };
}

// Format channel as artist
interface Artist {
  id: ChannelId;
  name: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount?: number;
  videoCount: number;
}

function formatChannelAsArtist(channel: Channel): Artist {
  if (!channel.snippet || !channel.statistics) {
    throw new Error("Missing required channel parts");
  }

  return {
    id: channel.id,
    name: channel.snippet.title,
    description: channel.snippet.description,
    thumbnailUrl: channel.snippet.thumbnails.high.url,
    subscriberCount: channel.statistics.hiddenSubscriberCount
      ? undefined
      : parseInt(channel.statistics.subscriberCount!),
    videoCount: parseInt(channel.statistics.videoCount)
  };
}
```

## Async Iterators

```typescript
async function* paginateVideos(
  playlistId: string,
  client: TypedYouTubeClient
): AsyncGenerator<PlaylistItem[], void, unknown> {
  let pageToken: string | undefined;

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url.toString());
    const data: PlaylistItemListResponse = await response.json();

    yield data.items;
    pageToken = data.nextPageToken;
  } while (pageToken);
}

// Usage with for-await-of
for await (const items of paginateVideos("PLxxx", client)) {
  console.log(`Processing ${items.length} items`);
  for (const item of items) {
    console.log(item.snippet?.title);
  }
}
```

## Error Types

```typescript
interface YouTubeErrorResponse {
  error: {
    code: number;
    message: string;
    errors: Array<{
      domain: string;
      reason: string;
      message: string;
      locationType?: string;
      location?: string;
    }>;
  };
}

class YouTubeAPIError extends Error {
  constructor(
    public code: number,
    public reason: string,
    message: string,
    public errors: YouTubeErrorResponse["error"]["errors"]
  ) {
    super(message);
    this.name = "YouTubeAPIError";
  }

  static async fromResponse(response: Response): Promise<YouTubeAPIError> {
    const data: YouTubeErrorResponse = await response.json();
    return new YouTubeAPIError(
      data.error.code,
      data.error.errors[0]?.reason || "unknown",
      data.error.message,
      data.error.errors
    );
  }

  is(reason: string): boolean {
    return this.reason === reason;
  }
}

// Usage
try {
  const video = await client.getVideo("invalid-id");
} catch (error) {
  if (error instanceof YouTubeAPIError) {
    if (error.is("videoNotFound")) {
      console.log("Video not found");
    } else if (error.is("quotaExceeded")) {
      console.log("Quota exceeded");
    }
  }
}
```

## Best Practices

1. **Use strict types**: Enable `strict` mode in tsconfig.json
2. **Type all responses**: Define interfaces for API responses
3. **Use type guards**: Safely narrow union types
4. **Generic utilities**: Create reusable type-safe helpers
5. **Async iterators**: For paginated results
6. **Custom error types**: Better error handling
7. **Readonly properties**: Prevent accidental mutations
8. **Utility functions**: Type-safe data transformations

## Related Topics

- [API Methods](../api/videos.md): Endpoint-specific types
- [Error Handling](error-handling.md): Typed error handling
- [Getting Started](../getting-started.md): Basic usage patterns
