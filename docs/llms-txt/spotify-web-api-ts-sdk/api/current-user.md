# Current User API

The Current User API provides access to the authenticated user's profile, library, playlists, and personalized content including top items and followed artists.

## Get Current User Profile

Retrieve detailed profile information for the authenticated user.

### Method

```typescript
sdk.currentUser.profile(): Promise<UserProfile>
```

### Required OAuth Scopes

- `user-read-private`: Access subscription details and country
- `user-read-email`: Get email address

### Response

Returns a `UserProfile` object containing:

- `id`: Spotify user ID
- `display_name`: Profile display name (may be null)
- `email`: Email address (unverified, requires user-read-email scope)
- `country`: ISO 3166-1 alpha-2 country code
- `product`: Subscription level ("premium", "free", "open")
- `explicit_content`: Content filter settings with `filter_enabled` and `filter_locked`
- `followers`: Object with `total` follower count
- `images`: Array of profile images
- `external_urls`: Links to Spotify web player
- `uri`: Spotify URI for the user

### Example

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withUserAuthorization(
  "client-id",
  "redirect-uri",
  ["user-read-private", "user-read-email"]
);

const user = await sdk.currentUser.profile();

console.log({
  name: user.display_name,
  email: user.email,
  country: user.country,
  subscription: user.product,
  followers: user.followers.total
});
```

## Get User's Top Items

Retrieve the current user's top artists or tracks based on calculated affinity over different time periods.

### Method

```typescript
sdk.currentUser.topItems<T extends "artists" | "tracks">(
  type: T,
  time_range?: "short_term" | "medium_term" | "long_term",
  limit?: number,
  offset?: number
): Promise<Page<T extends "artists" ? Artist : Track>>
```

### Parameters

- `type` (required): Type of items to retrieve - `"artists"` or `"tracks"`
- `time_range` (optional): Time period for affinity calculation
  - `"short_term"`: Approximately last 4 weeks
  - `"medium_term"`: Approximately last 6 months (default)
  - `"long_term"`: Calculated from several years of data
- `limit` (optional): Maximum number of items to return (1-50, default: 20)
- `offset` (optional): Index of first item for pagination (default: 0)

### Required OAuth Scope

- `user-top-read`: Read top artists and content

### Response

Returns a `Page` object containing:

- `href`: API endpoint URL
- `limit`: Maximum items in response
- `offset`: Starting position
- `total`: Total items available
- `items`: Array of Artist or Track objects
- `next`: URL to next page (null if last page)
- `previous`: URL to previous page (null if first page)

### Examples

```typescript
// Get user's top artists over the last 6 months
const topArtists = await sdk.currentUser.topItems("artists", "medium_term", 20);

console.log("Your top artists:");
topArtists.items.forEach((artist, i) => {
  console.log(`${i + 1}. ${artist.name} (${artist.genres.join(", ")})`);
});

// Get user's top tracks in the last 4 weeks
const topTracks = await sdk.currentUser.topItems("tracks", "short_term", 50);

topTracks.items.forEach(track => {
  console.log(`${track.name} - ${track.artists[0].name}`);
});

// Get long-term top artists with pagination
const longTermTop = await sdk.currentUser.topItems(
  "artists",
  "long_term",
  50,
  0
);
```

### TypeScript Types

```typescript
type TimeRange = "short_term" | "medium_term" | "long_term";

interface Page<T> {
  href: string;
  limit: number;
  offset: number;
  total: number;
  items: T[];
  next: string | null;
  previous: string | null;
}
```

## Get Followed Artists

Retrieve the current user's followed artists with cursor-based pagination.

### Method

```typescript
sdk.currentUser.followedArtists(
  after?: string,
  limit?: number
): Promise<FollowedArtists>
```

### Parameters

- `after` (optional): Cursor for pagination - the last artist ID from previous request
- `limit` (optional): Maximum number of items to return (1-50, default: 20)

### Required OAuth Scope

- `user-follow-read`: Access followers and following

### Response

Returns a `FollowedArtists` object containing:

```typescript
interface FollowedArtists {
  artists: {
    href: string;
    limit: number;
    next: string | null;
    cursors: {
      after: string;
      before: string;
    };
    total: number;
    items: Artist[];
  };
}
```

### Example

```typescript
// Get first page of followed artists
const followed = await sdk.currentUser.followedArtists(undefined, 50);

console.log(`Following ${followed.artists.total} artists`);
followed.artists.items.forEach(artist => {
  console.log(`- ${artist.name}`);
});

// Pagination using cursor
if (followed.artists.next) {
  const nextPage = await sdk.currentUser.followedArtists(
    followed.artists.cursors.after,
    50
  );
}
```

## Follow/Unfollow Artists or Users

Add or remove artists or users from the current user's following list.

### Methods

```typescript
sdk.currentUser.followArtistsOrUsers(
  ids: string[],
  type: "artist" | "user"
): Promise<void>

sdk.currentUser.unfollowArtistsOrUsers(
  ids: string[],
  type: "artist" | "user"
): Promise<void>

sdk.currentUser.followsArtistsOrUsers(
  ids: string[],
  type: "artist" | "user"
): Promise<boolean[]>
```

### Parameters

- `ids`: Array of Spotify IDs (max 50)
- `type`: ID type - `"artist"` or `"user"`

### Required OAuth Scope

- `user-follow-modify`: Manage followed artists and users

### Examples

```typescript
// Follow multiple artists
await sdk.currentUser.followArtistsOrUsers(
  ["0OdUWJ0sBjDrqHygGUXeCF", "1Xyo4u8uXC1ZmMpatF05PJ"],
  "artist"
);

// Unfollow an artist
await sdk.currentUser.unfollowArtistsOrUsers(
  ["0OdUWJ0sBjDrqHygGUXeCF"],
  "artist"
);

// Check if following artists
const artistIds = ["0OdUWJ0sBjDrqHygGUXeCF", "1Xyo4u8uXC1ZmMpatF05PJ"];
const following = await sdk.currentUser.followsArtistsOrUsers(artistIds, "artist");

artistIds.forEach((id, i) => {
  console.log(`Following ${id}: ${following[i]}`);
});
```

## Saved Tracks

Manage the user's "Your Music" library for tracks.

### Methods

```typescript
sdk.currentUser.tracks.savedTracks(
  limit?: number,
  offset?: number,
  market?: string
): Promise<Page<SavedTrack>>

sdk.currentUser.tracks.saveTracks(ids: string[]): Promise<void>

sdk.currentUser.tracks.removeSavedTracks(ids: string[]): Promise<void>

sdk.currentUser.tracks.hasSavedTracks(ids: string[]): Promise<boolean[]>
```

### Required OAuth Scopes

- `user-library-read`: Access saved content
- `user-library-modify`: Manage saved content (for save/remove)

### Parameters

- `limit` (optional): Maximum items to return (1-50, default: 20)
- `offset` (optional): Index of first item for pagination
- `market` (optional): ISO 3166-1 alpha-2 country code for availability
- `ids`: Array of track Spotify IDs (max 50)

### Response

```typescript
interface SavedTrack {
  added_at: string;  // ISO 8601 timestamp
  track: Track;
}
```

### Examples

```typescript
// Get saved tracks
const saved = await sdk.currentUser.tracks.savedTracks(50, 0);

console.log(`You have ${saved.total} saved tracks`);
saved.items.forEach(item => {
  console.log(`${item.track.name} (added ${item.added_at})`);
});

// Save tracks to library
await sdk.currentUser.tracks.saveTracks([
  "11dFghVXANMlKmJXsNCbNl",
  "3n3Ppam7vgaVa1iaRUc9Lp"
]);

// Remove tracks from library
await sdk.currentUser.tracks.removeSavedTracks([
  "11dFghVXANMlKmJXsNCbNl"
]);

// Check if tracks are saved
const trackIds = ["11dFghVXANMlKmJXsNCbNl", "3n3Ppam7vgaVa1iaRUc9Lp"];
const saved = await sdk.currentUser.tracks.hasSavedTracks(trackIds);

trackIds.forEach((id, i) => {
  console.log(`Track ${id} saved: ${saved[i]}`);
});
```

## Saved Albums

Manage the user's "Your Music" library for albums.

### Methods

```typescript
sdk.currentUser.albums.savedAlbums(
  limit?: number,
  offset?: number,
  market?: string
): Promise<Page<SavedAlbum>>

sdk.currentUser.albums.saveAlbums(ids: string[]): Promise<void>

sdk.currentUser.albums.removeSavedAlbums(ids: string[]): Promise<void>

sdk.currentUser.albums.hasSavedAlbums(ids: string[]): Promise<boolean[]>
```

### Required OAuth Scopes

- `user-library-read`: Access saved content
- `user-library-modify`: Manage saved content (for save/remove)

### Parameters

- `limit` (optional): Maximum items to return (1-50, default: 20)
- `offset` (optional): Index of first item for pagination
- `market` (optional): ISO 3166-1 alpha-2 country code
- `ids`: Array of album Spotify IDs (max 50)

### Response

```typescript
interface SavedAlbum {
  added_at: string;  // ISO 8601 timestamp
  album: Album;
}
```

### Examples

```typescript
// Get saved albums with market filtering
const albums = await sdk.currentUser.albums.savedAlbums(20, 0, "US");

albums.items.forEach(item => {
  console.log(`${item.album.name} by ${item.album.artists[0].name}`);
  console.log(`Added: ${new Date(item.added_at).toLocaleDateString()}`);
});

// Save albums to library
await sdk.currentUser.albums.saveAlbums([
  "2noRn2Aes5aoNVsU6iWThc",
  "0JGOiO34nwfUdDrD612dOp"
]);

// Remove albums from library
await sdk.currentUser.albums.removeSavedAlbums([
  "2noRn2Aes5aoNVsU6iWThc"
]);

// Check save status
const albumIds = ["2noRn2Aes5aoNVsU6iWThc", "0JGOiO34nwfUdDrD612dOp"];
const savedStatus = await sdk.currentUser.albums.hasSavedAlbums(albumIds);
```

## User's Playlists

Access and manage the current user's playlists.

### Methods

```typescript
sdk.currentUser.playlists.playlists(
  limit?: number,
  offset?: number
): Promise<Page<SimplifiedPlaylist>>

sdk.currentUser.playlists.follow(playlistId: string): Promise<void>

sdk.currentUser.playlists.unfollow(playlistId: string): Promise<void>

sdk.currentUser.playlists.isFollowing(
  playlistId: string,
  userIds: string[]
): Promise<boolean[]>
```

### Required OAuth Scopes

- `playlist-read-private`: Access private playlists
- `playlist-read-collaborative`: Access collaborative playlists
- `playlist-modify-public`: Modify public playlists (for follow/unfollow)
- `playlist-modify-private`: Modify private playlists (for follow/unfollow)

### Parameters

- `limit` (optional): Maximum items to return (1-50, default: 20)
- `offset` (optional): Index of first playlist (0-100,000)
- `playlistId`: Spotify playlist ID
- `userIds`: Array of user IDs to check following status

### Response

```typescript
interface SimplifiedPlaylist {
  id: string;
  name: string;
  description: string;
  public: boolean | null;
  collaborative: boolean;
  owner: {
    id: string;
    display_name: string;
  };
  tracks: {
    href: string;
    total: number;
  };
  images: Image[];
  uri: string;
  external_urls: ExternalUrls;
}
```

### Examples

```typescript
// Get user's playlists
const playlists = await sdk.currentUser.playlists.playlists(50);

console.log(`You have ${playlists.total} playlists`);
playlists.items.forEach(playlist => {
  console.log(`- ${playlist.name} (${playlist.tracks.total} tracks)`);
  console.log(`  Owner: ${playlist.owner.display_name}`);
  console.log(`  ${playlist.public ? 'Public' : 'Private'}`);
});

// Follow a playlist
await sdk.currentUser.playlists.follow("3cEYpjA9oz9GiPac4AsH4n");

// Unfollow a playlist
await sdk.currentUser.playlists.unfollow("3cEYpjA9oz9GiPac4AsH4n");

// Check if users follow a playlist
const followers = await sdk.currentUser.playlists.isFollowing(
  "3cEYpjA9oz9GiPac4AsH4n",
  ["jmperezperez", "thelinmichael"]
);

console.log(`User 1 follows: ${followers[0]}`);
console.log(`User 2 follows: ${followers[1]}`);
```

## Complete Example: User Music Dashboard

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const scopes = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "user-follow-read",
  "user-library-read",
  "playlist-read-private"
];

const sdk = SpotifyApi.withUserAuthorization(
  "your-client-id",
  "http://localhost:3000/callback",
  scopes
);

async function getUserDashboard() {
  // Get user profile
  const user = await sdk.currentUser.profile();
  console.log(`\n=== ${user.display_name}'s Music Dashboard ===\n`);

  // Top artists (short term - last 4 weeks)
  const topArtists = await sdk.currentUser.topItems("artists", "short_term", 5);
  console.log("Your Top 5 Artists (Last Month):");
  topArtists.items.forEach((artist, i) => {
    console.log(`  ${i + 1}. ${artist.name}`);
  });

  // Top tracks (medium term - last 6 months)
  const topTracks = await sdk.currentUser.topItems("tracks", "medium_term", 5);
  console.log("\nYour Top 5 Tracks (Last 6 Months):");
  topTracks.items.forEach((track, i) => {
    console.log(`  ${i + 1}. ${track.name} - ${track.artists[0].name}`);
  });

  // Followed artists count
  const followed = await sdk.currentUser.followedArtists(undefined, 1);
  console.log(`\nFollowing: ${followed.artists.total} artists`);

  // Library stats
  const savedTracks = await sdk.currentUser.tracks.savedTracks(1);
  const savedAlbums = await sdk.currentUser.albums.savedAlbums(1);
  const playlists = await sdk.currentUser.playlists.playlists(1);

  console.log(`\nLibrary:`);
  console.log(`  Saved Tracks: ${savedTracks.total}`);
  console.log(`  Saved Albums: ${savedAlbums.total}`);
  console.log(`  Playlists: ${playlists.total}`);
}

getUserDashboard();
```

## Error Handling

```typescript
try {
  const topItems = await sdk.currentUser.topItems("artists", "short_term");
} catch (error) {
  if (error.status === 401) {
    console.log("Access token expired - re-authenticate required");
  } else if (error.status === 403) {
    console.log("Missing required OAuth scope");
  } else if (error.status === 429) {
    console.log("Rate limited - wait before retrying");
  } else {
    console.log("API error:", error.message);
  }
}
```

## Best Practices

1. **Request minimal scopes:** Only request OAuth scopes needed for your features
2. **Use time ranges effectively:**
   - `short_term` for recent preferences (mood-based playlists)
   - `medium_term` for balanced recommendations
   - `long_term` for core music taste analysis
3. **Batch operations:** Use arrays to save/remove multiple tracks/albums in one request
4. **Pagination:** Always check `next` and `total` for complete data access
5. **Cache profile data:** User profile rarely changes, consider caching
6. **Handle cursor pagination:** For followed artists, use `after` cursor instead of offset
7. **Market awareness:** Use market parameter to get accurate availability

## Rate Limiting

The Spotify API enforces rate limits. Best practices:

- Implement exponential backoff on 429 responses
- Cache responses where appropriate
- Batch requests when possible
- Monitor `Retry-After` header in 429 responses

## Related Methods

- [Playlists API](playlists.md): Create and manage playlists
- [Tracks API](tracks.md): Get track details and audio features
- [Artists API](artists.md): Get artist information
- [Albums API](albums.md): Get album details
- [Search API](search.md): Search for music content
