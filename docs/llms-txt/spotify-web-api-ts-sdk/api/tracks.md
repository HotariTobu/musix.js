# Tracks API

The Tracks API provides access to Spotify's track catalog, including metadata, audio features, and analysis.

## Get Track

Retrieve detailed information about a single track.

### Method

```typescript
sdk.tracks.get(trackId: string, market?: string): Promise<Track>
```

### Parameters

- `trackId` (required): The Spotify ID for the track
- `market` (optional): ISO 3166-1 alpha-2 country code to filter available content

### Response

Returns a `Track` object containing:

- `id`: Spotify ID
- `name`: Track title
- `artists`: Array of artist objects
- `album`: Album information
- `duration_ms`: Length in milliseconds
- `explicit`: Boolean for explicit content
- `popularity`: Value 0-100 based on play history
- `track_number`: Position on album
- `available_markets`: Array of country codes where playable
- `external_ids`: ISRC, EAN, UPC identifiers
- `external_urls`: Link to Spotify web player
- `preview_url`: 30-second MP3 preview (may be null)
- `is_playable`: Playability in specified market
- `uri`: Spotify URI

### Example

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withClientCredentials(
  "client-id",
  "client-secret"
);

// Get a specific track
const track = await sdk.tracks.get("11dFghVXANMlKmJXsNCbNl");

console.log({
  name: track.name,
  artist: track.artists[0].name,
  album: track.album.name,
  duration: `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`,
  popularity: track.popularity
});
```

### TypeScript Types

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
  type: "track";
  uri: string;
  external_urls: ExternalUrls;
  preview_url: string | null;
  available_markets: string[];
  is_playable?: boolean;
  external_ids: ExternalIds;
}

interface SimplifiedArtist {
  id: string;
  name: string;
  uri: string;
  external_urls: ExternalUrls;
}

interface SimplifiedAlbum {
  id: string;
  name: string;
  artists: SimplifiedArtist[];
  release_date: string;
  images: Image[];
  uri: string;
}
```

## Get Multiple Tracks

Retrieve information for multiple tracks in a single request.

### Method

```typescript
sdk.tracks.getTracks(trackIds: string[], market?: string): Promise<Track[]>
```

### Parameters

- `trackIds`: Array of Spotify track IDs (max 50)
- `market` (optional): ISO 3166-1 alpha-2 country code

### Example

```typescript
const trackIds = [
  "11dFghVXANMlKmJXsNCbNl",
  "3n3Ppam7vgaVa1iaRUc9Lp",
  "0eGsygTp906u18L0Oimnem"
];

const tracks = await sdk.tracks.getTracks(trackIds);

tracks.forEach(track => {
  if (track) {
    console.log(`${track.name} by ${track.artists[0].name}`);
  }
});
```

## Get Track Audio Features

Get audio features for a track (danceability, energy, tempo, etc.).

### Method

```typescript
sdk.tracks.audioFeatures(trackId: string): Promise<AudioFeatures>
```

### Response

```typescript
interface AudioFeatures {
  id: string;
  danceability: number;      // 0.0 to 1.0
  energy: number;            // 0.0 to 1.0
  key: number;               // -1 to 11 (pitch class)
  loudness: number;          // Typical range -60 to 0 db
  mode: number;              // 0 = minor, 1 = major
  speechiness: number;       // 0.0 to 1.0
  acousticness: number;      // 0.0 to 1.0
  instrumentalness: number;  // 0.0 to 1.0
  liveness: number;          // 0.0 to 1.0
  valence: number;           // 0.0 to 1.0 (musical positivity)
  tempo: number;             // BPM
  duration_ms: number;
  time_signature: number;    // 3 to 7
}
```

### Example

```typescript
const features = await sdk.tracks.audioFeatures("11dFghVXANMlKmJXsNCbNl");

console.log({
  tempo: `${features.tempo.toFixed(0)} BPM`,
  energy: (features.energy * 100).toFixed(0) + "%",
  danceability: (features.danceability * 100).toFixed(0) + "%",
  valence: (features.valence * 100).toFixed(0) + "% positive"
});
```

## Get Track Audio Analysis

Get detailed audio analysis including beats, bars, sections, and segments.

### Method

```typescript
sdk.tracks.audioAnalysis(trackId: string): Promise<AudioAnalysis>
```

### Example

```typescript
const analysis = await sdk.tracks.audioAnalysis("11dFghVXANMlKmJXsNCbNl");

console.log({
  duration: analysis.track.duration,
  tempo: analysis.track.tempo,
  sections: analysis.sections.length,
  segments: analysis.segments.length
});
```

## Get Recommendations

Get track recommendations based on seed tracks, artists, or genres.

### Method

```typescript
sdk.tracks.getRecommendations(options: RecommendationsOptions): Promise<Recommendations>
```

### Example

```typescript
const recommendations = await sdk.tracks.getRecommendations({
  seed_tracks: ["11dFghVXANMlKmJXsNCbNl"],
  limit: 10,
  target_energy: 0.8,
  target_danceability: 0.7
});

recommendations.tracks.forEach(track => {
  console.log(`${track.name} - ${track.artists[0].name}`);
});
```

## Error Handling

```typescript
try {
  const track = await sdk.tracks.get("invalid-id");
} catch (error) {
  if (error.status === 404) {
    console.log("Track not found");
  } else if (error.status === 401) {
    console.log("Authentication failed");
  } else if (error.status === 429) {
    console.log("Rate limited - retry after delay");
  } else {
    console.log("API error:", error.message);
  }
}
```

## Best Practices

1. **Use market parameter:** Specify market to get accurate availability information
2. **Batch requests:** Use `getTracks()` for multiple tracks instead of multiple `get()` calls
3. **Handle nulls:** `preview_url` and other fields may be null
4. **Cache responses:** Track metadata rarely changes, consider caching
5. **Check availability:** Use `is_playable` and `available_markets` for regional availability

## Related Methods

- [Search API](search.md): Search for tracks
- [Albums API](albums.md): Get album tracks
- [Playlists API](playlists.md): Get playlist tracks
