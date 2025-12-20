# Albums API

The Albums API provides access to album metadata, tracks, and related information from Spotify's catalog.

## Get Album

Retrieve detailed information about a single album.

### Method

```typescript
sdk.albums.get(albumId: string, market?: string): Promise<Album>
```

### Parameters

- `albumId` (required): The Spotify ID for the album
- `market` (optional): ISO 3166-1 alpha-2 country code

### Response

Returns an `Album` object containing:

- `id`: Spotify ID
- `name`: Album title
- `artists`: Array of artist objects
- `album_type`: "album", "single", or "compilation"
- `total_tracks`: Number of tracks
- `release_date`: Release date (YYYY-MM-DD or YYYY)
- `release_date_precision`: "year", "month", or "day"
- `genres`: Array of genre strings
- `label`: Record label
- `popularity`: Value 0-100
- `images`: Array of cover art images
- `tracks`: Paginated list of simplified track objects
- `copyrights`: Copyright information
- `external_ids`: UPC identifier
- `available_markets`: Array of country codes

### Example

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withClientCredentials(
  "client-id",
  "client-secret"
);

// Get album details
const album = await sdk.albums.get("4aawyAB9vmqN3uQ7FjRGTy");

console.log({
  name: album.name,
  artist: album.artists[0].name,
  releaseDate: album.release_date,
  tracks: album.total_tracks,
  popularity: album.popularity
});

// List all tracks
album.tracks.items.forEach((track, index) => {
  console.log(`${index + 1}. ${track.name} (${Math.floor(track.duration_ms / 1000)}s)`);
});
```

### TypeScript Types

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
}

interface SimplifiedTrack {
  id: string;
  name: string;
  artists: SimplifiedArtist[];
  duration_ms: number;
  explicit: boolean;
  track_number: number;
  preview_url: string | null;
  uri: string;
}

interface Image {
  url: string;
  height: number;
  width: number;
}
```

## Get Multiple Albums

Retrieve information for multiple albums in a single request.

### Method

```typescript
sdk.albums.getAlbums(albumIds: string[], market?: string): Promise<Album[]>
```

### Parameters

- `albumIds`: Array of Spotify album IDs (max 20)
- `market` (optional): ISO 3166-1 alpha-2 country code

### Example

```typescript
const albumIds = [
  "4aawyAB9vmqN3uQ7FjRGTy",
  "6DEjYFkNZh67HP7R9PSZvv",
  "1DFixLWuPkv3KT3TnV35m3"
];

const albums = await sdk.albums.getAlbums(albumIds);

albums.forEach(album => {
  if (album) {
    console.log(`${album.name} (${album.release_date.substring(0, 4)})`);
  }
});
```

## Get Album Tracks

Retrieve all tracks from an album with pagination support.

### Method

```typescript
sdk.albums.tracks(albumId: string, limit?: number, offset?: number, market?: string): Promise<Paginated<SimplifiedTrack>>
```

### Parameters

- `albumId` (required): The Spotify album ID
- `limit` (optional): Number of tracks to return (1-50, default 20)
- `offset` (optional): Index of first track to return (default 0)
- `market` (optional): ISO 3166-1 alpha-2 country code

### Example

```typescript
// Get first 50 tracks
const tracksPage = await sdk.albums.tracks("4aawyAB9vmqN3uQ7FjRGTy", 50);

console.log(`Total tracks: ${tracksPage.total}`);
console.log(`Showing: ${tracksPage.items.length}`);

tracksPage.items.forEach(track => {
  const duration = Math.floor(track.duration_ms / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = String(duration % 60).padStart(2, '0');
  console.log(`${track.track_number}. ${track.name} (${minutes}:${seconds})`);
});

// Paginate through all tracks if total > limit
if (tracksPage.next) {
  const nextPage = await sdk.albums.tracks("4aawyAB9vmqN3uQ7FjRGTy", 50, 50);
  // Process next page...
}
```

## Get New Releases

Browse new album releases featured on Spotify.

### Method

```typescript
sdk.browse.getNewReleases(limit?: number, offset?: number, country?: string): Promise<Paginated<SimplifiedAlbum>>
```

### Example

```typescript
const newReleases = await sdk.browse.getNewReleases(20, 0, "US");

console.log("New Releases:");
newReleases.albums.items.forEach(album => {
  console.log(`${album.name} - ${album.artists[0].name}`);
});
```

## TypeScript Usage

### Working with Images

```typescript
const album = await sdk.albums.get("4aawyAB9vmqN3uQ7FjRGTy");

// Get largest image
const largestImage = album.images[0];

// Find specific size
const mediumImage = album.images.find(img =>
  img.width >= 300 && img.width <= 600
);

console.log(`Cover art: ${mediumImage?.url || largestImage.url}`);
```

### Type Guards

```typescript
interface AlbumWithMetadata extends Album {
  avgTrackDuration: number;
}

function calculateMetadata(album: Album): AlbumWithMetadata {
  const totalDuration = album.tracks.items.reduce(
    (sum, track) => sum + track.duration_ms,
    0
  );

  return {
    ...album,
    avgTrackDuration: totalDuration / album.total_tracks
  };
}

const album = await sdk.albums.get("4aawyAB9vmqN3uQ7FjRGTy");
const withMetadata = calculateMetadata(album);
console.log(`Average track: ${Math.floor(withMetadata.avgTrackDuration / 1000)}s`);
```

## Error Handling

```typescript
try {
  const album = await sdk.albums.get("invalid-id");
} catch (error) {
  if (error.status === 404) {
    console.log("Album not found");
  } else if (error.status === 400) {
    console.log("Invalid album ID format");
  } else if (error.status === 401) {
    console.log("Authentication required");
  } else if (error.status === 429) {
    console.log("Rate limit exceeded");
    // Retry after delay specified in error.headers['retry-after']
  } else {
    console.log("API error:", error.message);
  }
}
```

## Best Practices

1. **Batch requests:** Use `getAlbums()` for multiple albums instead of separate calls
2. **Handle pagination:** Large albums may require paginating through tracks
3. **Market parameter:** Specify to get accurate availability and pricing
4. **Cache album metadata:** Album info rarely changes, suitable for caching
5. **Image selection:** Albums have multiple image sizes - choose appropriate size
6. **Release date precision:** Check `release_date_precision` when parsing dates

## Common Patterns

### Get all tracks from an album

```typescript
async function getAllAlbumTracks(albumId: string): Promise<SimplifiedTrack[]> {
  const allTracks: SimplifiedTrack[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const page = await sdk.albums.tracks(albumId, limit, offset);
    allTracks.push(...page.items);

    if (!page.next) break;
    offset += limit;
  }

  return allTracks;
}

const tracks = await getAllAlbumTracks("4aawyAB9vmqN3uQ7FjRGTy");
console.log(`Retrieved ${tracks.length} tracks`);
```

### Filter explicit content

```typescript
const album = await sdk.albums.get("4aawyAB9vmqN3uQ7FjRGTy");
const cleanTracks = album.tracks.items.filter(track => !track.explicit);
console.log(`${cleanTracks.length} clean tracks out of ${album.total_tracks}`);
```

## Related Methods

- [Artists API](artists.md): Get artist's albums
- [Tracks API](tracks.md): Get detailed track information
- [Search API](search.md): Search for albums
