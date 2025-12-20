# Playlists API

The Playlists API provides access to playlist metadata, tracks, and management capabilities.

## Get Playlist

Retrieve detailed information about a specific playlist.

### Method

```typescript
sdk.playlists.getPlaylist(
  playlistId: string,
  market?: string,
  fields?: string,
  additionalTypes?: string[]
): Promise<Playlist>
```

### Parameters

- `playlistId` (required): The Spotify ID for the playlist
- `market` (optional): ISO 3166-1 alpha-2 country code
- `fields` (optional): Comma-separated list of fields to return
- `additionalTypes` (optional): Array of item types: ["track", "episode"]

### Response

Returns a `Playlist` object containing:

- `id`: Spotify ID
- `name`: Playlist name
- `description`: Playlist description
- `owner`: User object of playlist owner
- `public`: Boolean for public visibility
- `collaborative`: Boolean for collaborative editing
- `followers`: Follower count
- `images`: Array of playlist cover images
- `tracks`: Paginated list of playlist items
- `snapshot_id`: Version identifier
- `uri`: Spotify URI

### Example

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withClientCredentials(
  "client-id",
  "client-secret"
);

// Get playlist details
const playlist = await sdk.playlists.getPlaylist("37i9dQZF1DXcBWIGoYBM5M");

console.log({
  name: playlist.name,
  description: playlist.description,
  owner: playlist.owner.display_name,
  tracks: playlist.tracks.total,
  followers: playlist.followers.total.toLocaleString()
});

// List first 20 tracks
playlist.tracks.items.forEach((item, index) => {
  if (item.track) {
    console.log(`${index + 1}. ${item.track.name} - ${item.track.artists[0].name}`);
  }
});
```

### TypeScript Types

```typescript
interface Playlist {
  id: string;
  name: string;
  description: string;
  owner: {
    id: string;
    display_name: string;
    uri: string;
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

interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
}
```

## Get Playlist Items

Retrieve playlist tracks with pagination support.

### Method

```typescript
sdk.playlists.getPlaylistItems(
  playlistId: string,
  market?: string,
  fields?: string,
  limit?: number,
  offset?: number,
  additionalTypes?: string[]
): Promise<Paginated<PlaylistItem>>
```

### Parameters

- `playlistId` (required): The Spotify playlist ID
- `market` (optional): ISO 3166-1 alpha-2 country code
- `fields` (optional): Comma-separated fields to filter
- `limit` (optional): Number of items (1-100, default 20)
- `offset` (optional): Index of first item (default 0)
- `additionalTypes` (optional): Item types to include

### Example

```typescript
// Get first 100 tracks
const items = await sdk.playlists.getPlaylistItems(
  "37i9dQZF1DXcBWIGoYBM5M",
  "US",
  undefined,
  100
);

console.log(`Showing ${items.items.length} of ${items.total} tracks`);

items.items.forEach((item, index) => {
  if (item.track && item.track.type === "track") {
    const track = item.track;
    const duration = Math.floor(track.duration_ms / 1000);
    console.log(`${index + 1}. ${track.name} - ${track.artists[0].name} (${duration}s)`);
    console.log(`   Added: ${new Date(item.added_at).toLocaleDateString()}`);
  }
});
```

## Fields Filter

Use the `fields` parameter to request only specific data:

```typescript
// Get only basic info (faster response)
const playlist = await sdk.playlists.getPlaylist(
  "37i9dQZF1DXcBWIGoYBM5M",
  undefined,
  "id,name,description,tracks.total"
);

console.log(playlist.name, "-", playlist.tracks.total, "tracks");
// Other fields will be undefined

// Get tracks with limited fields
const items = await sdk.playlists.getPlaylistItems(
  "37i9dQZF1DXcBWIGoYBM5M",
  undefined,
  "items(track(id,name,artists(name)))",
  50
);
```

## User Playlists (Requires User Auth)

Get playlists for the current user or a specific user.

### Method

```typescript
// Current user's playlists (requires user authentication)
sdk.currentUser.playlists.playlists(limit?: number, offset?: number): Promise<Paginated<SimplifiedPlaylist>>

// Specific user's playlists
sdk.playlists.getUsersPlaylists(userId: string, limit?: number, offset?: number): Promise<Paginated<SimplifiedPlaylist>>
```

### Example

```typescript
// Requires user authentication (Authorization Code with PKCE)
const sdk = SpotifyApi.withUserAuthorization(
  "client-id",
  "redirect-uri",
  ["playlist-read-private", "playlist-read-collaborative"]
);

const userPlaylists = await sdk.currentUser.playlists.playlists(50);

console.log(`You have ${userPlaylists.total} playlists:`);
userPlaylists.items.forEach(playlist => {
  console.log(`${playlist.name} (${playlist.tracks.total} tracks)`);
});
```

## Manage Playlists (Requires User Auth)

Create, modify, and manage playlists.

### Create Playlist

```typescript
const newPlaylist = await sdk.currentUser.playlists.createPlaylist(
  "userId",
  {
    name: "My New Playlist",
    description: "Created with Spotify SDK",
    public: false
  }
);

console.log(`Created: ${newPlaylist.name} (${newPlaylist.id})`);
```

### Add Tracks

```typescript
await sdk.playlists.addItemsToPlaylist(
  "playlistId",
  [
    "spotify:track:11dFghVXANMlKmJXsNCbNl",
    "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp"
  ]
);
```

### Remove Tracks

```typescript
await sdk.playlists.removeItemsFromPlaylist(
  "playlistId",
  {
    tracks: [
      { uri: "spotify:track:11dFghVXANMlKmJXsNCbNl" }
    ]
  }
);
```

### Update Details

```typescript
await sdk.playlists.changePlaylistDetails(
  "playlistId",
  {
    name: "Updated Name",
    description: "New description",
    public: true
  }
);
```

## TypeScript Usage Examples

### Get all playlist tracks

```typescript
async function getAllPlaylistTracks(playlistId: string): Promise<PlaylistItem[]> {
  const allItems: PlaylistItem[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const page = await sdk.playlists.getPlaylistItems(
      playlistId,
      undefined,
      undefined,
      limit,
      offset
    );

    allItems.push(...page.items);

    if (!page.next) break;
    offset += limit;
  }

  return allItems;
}

const tracks = await getAllPlaylistTracks("37i9dQZF1DXcBWIGoYBM5M");
console.log(`Retrieved ${tracks.length} tracks`);
```

### Analyze playlist

```typescript
interface PlaylistAnalysis {
  totalDuration: number;
  averageDuration: number;
  explicitCount: number;
  artistCount: number;
  oldestTrack: Date;
  newestTrack: Date;
}

async function analyzePlaylist(playlistId: string): Promise<PlaylistAnalysis> {
  const items = await getAllPlaylistTracks(playlistId);
  const tracks = items
    .map(item => item.track)
    .filter((track): track is Track => track?.type === "track");

  const artists = new Set(
    tracks.flatMap(track => track.artists.map(a => a.id))
  );

  const dates = items.map(item => new Date(item.added_at));

  return {
    totalDuration: tracks.reduce((sum, t) => sum + t.duration_ms, 0),
    averageDuration: tracks.reduce((sum, t) => sum + t.duration_ms, 0) / tracks.length,
    explicitCount: tracks.filter(t => t.explicit).length,
    artistCount: artists.size,
    oldestTrack: new Date(Math.min(...dates.map(d => d.getTime()))),
    newestTrack: new Date(Math.max(...dates.map(d => d.getTime())))
  };
}

const analysis = await analyzePlaylist("37i9dQZF1DXcBWIGoYBM5M");
console.log({
  totalHours: (analysis.totalDuration / 3600000).toFixed(1),
  avgMinutes: (analysis.averageDuration / 60000).toFixed(1),
  explicitPercentage: ((analysis.explicitCount / 50) * 100).toFixed(0),
  uniqueArtists: analysis.artistCount
});
```

### Filter and sort tracks

```typescript
const items = await getAllPlaylistTracks("37i9dQZF1DXcBWIGoYBM5M");

// Get only explicit tracks
const explicitTracks = items.filter(item =>
  item.track?.type === "track" && item.track.explicit
);

// Sort by date added (newest first)
const sortedByDate = [...items].sort((a, b) =>
  new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
);

// Get tracks added this year
const thisYear = new Date().getFullYear();
const recentlyAdded = items.filter(item => {
  const year = new Date(item.added_at).getFullYear();
  return year === thisYear;
});
```

## Error Handling

```typescript
try {
  const playlist = await sdk.playlists.getPlaylist("invalid-id");
} catch (error) {
  if (error.status === 404) {
    console.log("Playlist not found or is private");
  } else if (error.status === 401) {
    console.log("Authentication required");
  } else if (error.status === 403) {
    console.log("Access forbidden - may need additional scopes");
  } else if (error.status === 429) {
    console.log("Rate limit exceeded");
  } else {
    console.log("API error:", error.message);
  }
}
```

## Best Practices

1. **Pagination:** Handle large playlists with proper pagination
2. **Fields filter:** Request only needed fields for faster responses
3. **Market parameter:** Specify for accurate availability
4. **Null checks:** Tracks can be null (removed/unavailable)
5. **Rate limiting:** Batch operations and add delays for large playlists
6. **Scopes:** Ensure proper scopes for private playlist access
7. **Snapshot ID:** Track playlist versions for change detection

## Required Scopes

For user-specific playlist operations:

- `playlist-read-private`: Read private playlists
- `playlist-read-collaborative`: Read collaborative playlists
- `playlist-modify-public`: Create/modify public playlists
- `playlist-modify-private`: Create/modify private playlists

## Common Patterns

### Deduplicate playlist

```typescript
async function deduplicatePlaylist(playlistId: string) {
  const items = await getAllPlaylistTracks(playlistId);
  const seen = new Set<string>();
  const duplicates: { uri: string }[] = [];

  items.forEach(item => {
    if (item.track) {
      if (seen.has(item.track.id)) {
        duplicates.push({ uri: item.track.uri });
      } else {
        seen.add(item.track.id);
      }
    }
  });

  if (duplicates.length > 0) {
    await sdk.playlists.removeItemsFromPlaylist(playlistId, {
      tracks: duplicates
    });
    console.log(`Removed ${duplicates.length} duplicates`);
  }
}
```

### Copy playlist

```typescript
async function copyPlaylist(sourceId: string, userId: string, newName: string) {
  const source = await sdk.playlists.getPlaylist(sourceId);
  const items = await getAllPlaylistTracks(sourceId);

  const newPlaylist = await sdk.currentUser.playlists.createPlaylist(userId, {
    name: newName,
    description: `Copy of ${source.name}`,
    public: false
  });

  const trackUris = items
    .map(item => item.track?.uri)
    .filter((uri): uri is string => uri !== undefined);

  // Add tracks in batches of 100
  for (let i = 0; i < trackUris.length; i += 100) {
    await sdk.playlists.addItemsToPlaylist(
      newPlaylist.id,
      trackUris.slice(i, i + 100)
    );
  }

  return newPlaylist;
}
```

## Related Methods

- [Tracks API](tracks.md): Get detailed track information
- [Search API](search.md): Search for playlists
- [Albums API](albums.md): Compare with album structure
