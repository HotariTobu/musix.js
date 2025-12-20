# TypeScript Usage

The SDK is built with TypeScript and provides comprehensive type definitions for all API methods, responses, and configuration options.

## Type Imports

Import types from the SDK:

```typescript
import {
  SpotifyApi,
  Track,
  Artist,
  Album,
  Playlist,
  SimplifiedTrack,
  SimplifiedArtist,
  SimplifiedAlbum,
  SimplifiedPlaylist,
  SearchResults,
  AudioFeatures,
  Paginated,
  Market
} from "@spotify/web-api-ts-sdk";
```

## Core Types

### Track

```typescript
interface Track {
  id: string;
  name: string;
  artists: SimplifiedArtist[];
  album: SimplifiedAlbum;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  track_number: number;
  disc_number: number;
  type: "track";
  uri: string;
  external_urls: ExternalUrls;
  external_ids: ExternalIds;
  preview_url: string | null;
  is_playable?: boolean;
  available_markets: string[];
  is_local: boolean;
}
```

### Artist

```typescript
interface Artist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: {
    total: number;
  };
  images: Image[];
  external_urls: ExternalUrls;
  uri: string;
  type: "artist";
}

interface SimplifiedArtist {
  id: string;
  name: string;
  uri: string;
  external_urls: ExternalUrls;
  type: "artist";
}
```

### Album

```typescript
interface Album {
  id: string;
  name: string;
  artists: SimplifiedArtist[];
  album_type: "album" | "single" | "compilation";
  total_tracks: number;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  genres: string[];
  label: string;
  popularity: number;
  images: Image[];
  tracks: Paginated<SimplifiedTrack>;
  copyrights: Copyright[];
  external_ids: { upc?: string };
  external_urls: ExternalUrls;
  uri: string;
  available_markets: string[];
  type: "album";
}

interface SimplifiedAlbum {
  id: string;
  name: string;
  artists: SimplifiedArtist[];
  album_type: "album" | "single" | "compilation";
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  images: Image[];
  external_urls: ExternalUrls;
  uri: string;
  available_markets: string[];
  total_tracks: number;
  type: "album";
}
```

### Playlist

```typescript
interface Playlist {
  id: string;
  name: string;
  description: string;
  owner: {
    id: string;
    display_name: string;
    uri: string;
    external_urls: ExternalUrls;
  };
  public: boolean;
  collaborative: boolean;
  followers: {
    total: number;
  };
  images: Image[];
  tracks: Paginated<PlaylistItem>;
  snapshot_id: string;
  uri: string;
  external_urls: ExternalUrls;
  type: "playlist";
}

interface PlaylistItem {
  added_at: string;
  added_by: {
    id: string;
    uri: string;
  };
  is_local: boolean;
  track: Track | Episode;
}
```

### Pagination

```typescript
interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
  href: string;
}
```

### Common Types

```typescript
interface Image {
  url: string;
  height: number;
  width: number;
}

interface ExternalUrls {
  spotify: string;
}

interface ExternalIds {
  isrc?: string;
  ean?: string;
  upc?: string;
}

interface Copyright {
  text: string;
  type: "C" | "P";
}

type Market = string; // ISO 3166-1 alpha-2 country code
```

## Generic Type Patterns

### Typed API Responses

```typescript
// Type-safe search function
async function searchByType<T extends "track" | "album" | "artist">(
  query: string,
  type: T
): Promise<Paginated<T extends "track" ? Track : T extends "album" ? SimplifiedAlbum : Artist>> {
  const results = await sdk.search(query, [type]);
  return results[`${type}s`] as any;
}

// Usage with type inference
const tracks = await searchByType("Beatles", "track"); // Type: Paginated<Track>
const albums = await searchByType("Beatles", "album"); // Type: Paginated<SimplifiedAlbum>
```

### Generic Data Fetcher

```typescript
type SpotifyResource = Track | Album | Artist | Playlist;
type ResourceType = "track" | "album" | "artist" | "playlist";

async function getResource<T extends ResourceType>(
  type: T,
  id: string
): Promise<
  T extends "track" ? Track :
  T extends "album" ? Album :
  T extends "artist" ? Artist :
  T extends "playlist" ? Playlist :
  never
> {
  switch (type) {
    case "track":
      return sdk.tracks.get(id) as any;
    case "album":
      return sdk.albums.get(id) as any;
    case "artist":
      return sdk.artists.get(id) as any;
    case "playlist":
      return sdk.playlists.getPlaylist(id) as any;
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

// Usage
const track = await getResource("track", "id"); // Type: Track
const album = await getResource("album", "id"); // Type: Album
```

## Type Guards

### Check Resource Type

```typescript
function isTrack(item: any): item is Track {
  return item && item.type === "track";
}

function isAlbum(item: any): item is Album {
  return item && item.type === "album";
}

function isArtist(item: any): item is Artist {
  return item && item.type === "artist";
}

// Usage
const results = await sdk.search("query", ["track", "album"]);

const allItems = [
  ...(results.tracks?.items || []),
  ...(results.albums?.items || [])
];

allItems.forEach(item => {
  if (isTrack(item)) {
    console.log(`Track: ${item.name} by ${item.artists[0].name}`);
  } else if (isAlbum(item)) {
    console.log(`Album: ${item.name} (${item.total_tracks} tracks)`);
  }
});
```

### Playlist Item Type Guard

```typescript
function isTrackItem(item: PlaylistItem): item is PlaylistItem & { track: Track } {
  return item.track !== null && item.track.type === "track";
}

// Usage
const playlist = await sdk.playlists.getPlaylist("id");

playlist.tracks.items.forEach(item => {
  if (isTrackItem(item)) {
    console.log(`${item.track.name} - ${item.track.artists[0].name}`);
  }
});
```

## Custom Type Extensions

### Extended Track with Metadata

```typescript
interface TrackWithMetadata extends Track {
  addedAt?: Date;
  playCount?: number;
  lastPlayed?: Date;
}

function enrichTrack(track: Track, metadata: Partial<TrackWithMetadata>): TrackWithMetadata {
  return {
    ...track,
    ...metadata
  };
}

const track = await sdk.tracks.get("id");
const enriched = enrichTrack(track, {
  addedAt: new Date(),
  playCount: 42
});
```

### Playlist Summary

```typescript
interface PlaylistSummary {
  id: string;
  name: string;
  trackCount: number;
  duration: number;
  explicitCount: number;
  artists: Set<string>;
}

async function summarizePlaylist(playlistId: string): Promise<PlaylistSummary> {
  const playlist = await sdk.playlists.getPlaylist(playlistId);

  const artists = new Set<string>();
  let duration = 0;
  let explicitCount = 0;

  playlist.tracks.items.forEach(item => {
    if (item.track && item.track.type === "track") {
      duration += item.track.duration_ms;
      if (item.track.explicit) explicitCount++;
      item.track.artists.forEach(artist => artists.add(artist.name));
    }
  });

  return {
    id: playlist.id,
    name: playlist.name,
    trackCount: playlist.tracks.total,
    duration,
    explicitCount,
    artists
  };
}
```

## Utility Types

### Partial Updates

```typescript
type UpdatePlaylist = Partial<Pick<Playlist, "name" | "description" | "public">>;

async function updatePlaylist(id: string, updates: UpdatePlaylist) {
  await sdk.playlists.changePlaylistDetails(id, updates);
}

// Type-safe updates
await updatePlaylist("id", {
  name: "New Name",
  public: false
  // Can't update other fields - TypeScript prevents it
});
```

### Required Fields

```typescript
type CreatePlaylistParams = Required<Pick<Playlist, "name">> &
  Partial<Pick<Playlist, "description" | "public" | "collaborative">>;

async function createPlaylist(userId: string, params: CreatePlaylistParams) {
  return sdk.currentUser.playlists.createPlaylist(userId, params);
}

// Must provide name
await createPlaylist("userId", {
  name: "My Playlist",
  public: false
});
```

## Mapped Types

### Extract IDs

```typescript
type WithId = { id: string };

function extractIds<T extends WithId>(items: T[]): string[] {
  return items.map(item => item.id);
}

const tracks = await sdk.search("query", ["track"]);
if (tracks.tracks) {
  const trackIds = extractIds(tracks.tracks.items);
}
```

### Pick Fields

```typescript
type TrackBasic = Pick<Track, "id" | "name" | "artists" | "duration_ms">;

function simplifyTrack(track: Track): TrackBasic {
  return {
    id: track.id,
    name: track.name,
    artists: track.artists,
    duration_ms: track.duration_ms
  };
}
```

## Async Type Handling

### Promise Utilities

```typescript
async function batchFetch<T>(
  ids: string[],
  fetcher: (id: string) => Promise<T>
): Promise<T[]> {
  return Promise.all(ids.map(fetcher));
}

// Usage
const trackIds = ["id1", "id2", "id3"];
const tracks = await batchFetch(trackIds, id => sdk.tracks.get(id));
// Type: Track[]
```

### Conditional Types

```typescript
type ApiResponse<T> = T extends "single"
  ? Track
  : T extends "multiple"
  ? Track[]
  : never;

async function getTracks<T extends "single" | "multiple">(
  mode: T,
  ids: T extends "single" ? string : string[]
): Promise<ApiResponse<T>> {
  if (mode === "single") {
    return sdk.tracks.get(ids as string) as any;
  } else {
    return sdk.tracks.getTracks(ids as string[]) as any;
  }
}

// Type inference works correctly
const single = await getTracks("single", "id");       // Type: Track
const multiple = await getTracks("multiple", ["id"]); // Type: Track[]
```

## Error Type Handling

```typescript
interface TypedError {
  status: number;
  message: string;
  type: "auth" | "not_found" | "rate_limit" | "server" | "unknown";
}

function categorizeError(error: any): TypedError {
  const status = error.status || 0;

  let type: TypedError["type"];
  if (status === 401 || status === 403) type = "auth";
  else if (status === 404) type = "not_found";
  else if (status === 429) type = "rate_limit";
  else if (status >= 500) type = "server";
  else type = "unknown";

  return {
    status,
    message: error.message || "Unknown error",
    type
  };
}

// Usage
try {
  await sdk.tracks.get("id");
} catch (error) {
  const typedError = categorizeError(error);
  switch (typedError.type) {
    case "auth":
      // Handle auth errors
      break;
    case "rate_limit":
      // Handle rate limiting
      break;
  }
}
```

## Best Practices

1. **Use type imports:** Import types explicitly for better IDE support
2. **Type guards:** Use type guards for runtime type checking
3. **Avoid `any`:** Use proper types instead of `any`
4. **Generic functions:** Use generics for reusable type-safe functions
5. **Null checks:** Handle optional/nullable fields properly
6. **Type assertions sparingly:** Only use `as` when absolutely necessary
7. **Enable strict mode:** Use `strict: true` in tsconfig.json
8. **Document types:** Add JSDoc comments for custom types
9. **Use utility types:** Leverage built-in utility types (Pick, Partial, etc.)
10. **Type inference:** Let TypeScript infer types when possible

## TSConfig Recommendations

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Related Topics

- [Error Handling](error-handling.md): Type-safe error handling
- [API Methods](../api/tracks.md): Type definitions for API responses
