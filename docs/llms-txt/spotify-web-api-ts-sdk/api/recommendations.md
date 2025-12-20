# Recommendations API

The Recommendations API generates personalized track suggestions based on seed entities (artists, tracks, or genres) and tunable audio attributes.

## Get Recommendations

Generate track recommendations based on seed entities and optional audio attribute filters.

### Method

```typescript
sdk.recommendations.get(request: RecommendationsRequest): Promise<RecommendationsResponse>
```

### Parameters

The request accepts seed parameters and optional tunable attributes:

#### Required Seeds

You must provide at least one seed type. **Maximum 5 seeds total** across all types combined:

- `seed_artists`: Array of Spotify artist IDs (e.g., `["4NHQUGzhtTLFvgF5SZesLK"]`)
- `seed_tracks`: Array of Spotify track IDs (e.g., `["0c6xIDDpzE81m2q797ordA"]`)
- `seed_genres`: Array of genre names from available genre seeds (e.g., `["pop", "rock"]`)

#### Optional Parameters

- `limit`: Number of recommendations to return (default: 20, range: 1-100)
- `market`: ISO 3166-1 alpha-2 country code for content availability filtering

#### Tunable Track Attributes

Each attribute supports three variants: `min_*`, `max_*`, and `target_*` (all `number` type):

| Attribute | Range | Description |
|-----------|-------|-------------|
| acousticness | 0-1 | Confidence measure of acoustic vs. electronic |
| danceability | 0-1 | Suitability for dancing based on tempo, rhythm, beat strength |
| duration_ms | any | Track length in milliseconds |
| energy | 0-1 | Perceptual measure of intensity and activity |
| instrumentalness | 0-1 | Predicts whether track contains vocals (>0.5 likely instrumental) |
| key | 0-11 | Pitch class (0=C, 1=C#, 2=D, etc.) |
| liveness | 0-1 | Probability of live audience presence (>0.8 likely live) |
| loudness | any | Overall loudness in decibels (typically -60 to 0) |
| mode | 0-1 | Modality (0=minor, 1=major) |
| popularity | 0-100 | Current track popularity based on play history |
| speechiness | 0-1 | Presence of spoken words (>0.66 likely spoken word) |
| tempo | any | Beats per minute (BPM) |
| time_signature | varies | Estimated time signature (3-7) |
| valence | 0-1 | Musical positiveness (high=happy/cheerful, low=sad/angry) |

**Usage:**
- `min_*`: Sets hard floor for attribute value
- `max_*`: Sets hard ceiling for attribute value
- `target_*`: Specifies desired target value (soft preference)

### Response

Returns a `RecommendationsResponse` object containing:

```typescript
interface RecommendationsResponse {
  seeds: RecommendationSeed[];
  tracks: SimplifiedTrack[];
}

interface RecommendationSeed {
  afterFilteringSize: number;      // Pool size after filtering
  afterRelinkingSize: number;      // Pool size after relinking
  href: string | null;             // Link to full track/artist object
  id: string;                      // Seed ID
  initialPoolSize: number;         // Initial pool size
  type: "artist" | "track" | "genre";
}

interface SimplifiedTrack {
  id: string;
  name: string;
  artists: SimplifiedArtist[];
  album: SimplifiedAlbum;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;
  uri: string;
  external_urls: ExternalUrls;
}
```

### Examples

#### Basic Recommendations with Seeds

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withClientCredentials(
  "client-id",
  "client-secret"
);

// Get recommendations based on track seeds
const recommendations = await sdk.recommendations.get({
  seed_tracks: ["0c6xIDDpzE81m2q797ordA", "3n3Ppam7vgaVa1iaRUc9Lp"],
  limit: 10
});

recommendations.tracks.forEach(track => {
  console.log(`${track.name} - ${track.artists[0].name}`);
});

// Check seed information
recommendations.seeds.forEach(seed => {
  console.log(`Seed ${seed.id} (${seed.type}): ${seed.initialPoolSize} initial tracks`);
});
```

#### Recommendations with Mixed Seeds

```typescript
// Combine different seed types (max 5 total)
const recommendations = await sdk.recommendations.get({
  seed_artists: ["4NHQUGzhtTLFvgF5SZesLK"],  // Tove Lo
  seed_tracks: ["0c6xIDDpzE81m2q797ordA"],   // 1 track
  seed_genres: ["pop", "dance"],              // 2 genres
  limit: 20,
  market: "US"
});

console.log(`Found ${recommendations.tracks.length} recommendations`);
```

#### Recommendations with Tunable Attributes

```typescript
// Get upbeat, danceable recommendations
const upbeatTracks = await sdk.recommendations.get({
  seed_genres: ["pop", "dance"],
  limit: 15,
  target_energy: 0.8,           // High energy
  min_energy: 0.6,              // At least moderately energetic
  target_danceability: 0.75,    // Very danceable
  min_danceability: 0.5,        // At least somewhat danceable
  target_valence: 0.7,          // Positive mood
  min_tempo: 120,               // At least 120 BPM
  max_tempo: 140                // No more than 140 BPM
});
```

#### Recommendations for Specific Mood

```typescript
// Get calm, acoustic tracks for relaxation
const calmTracks = await sdk.recommendations.get({
  seed_genres: ["acoustic", "ambient"],
  limit: 20,
  target_acousticness: 0.9,     // Very acoustic
  min_acousticness: 0.6,        // At least somewhat acoustic
  target_energy: 0.2,           // Low energy
  max_energy: 0.4,              // Keep it mellow
  target_valence: 0.5,          // Neutral to slightly positive
  min_instrumentalness: 0.3,    // Some instrumental preferred
  max_loudness: -10             // Not too loud
});
```

#### Recommendations Based on Audio Features

```typescript
// Get recommendations similar to a track's audio features
const originalTrack = await sdk.tracks.audioFeatures("11dFghVXANMlKmJXsNCbNl");

const similarTracks = await sdk.recommendations.get({
  seed_tracks: ["11dFghVXANMlKmJXsNCbNl"],
  limit: 10,
  target_danceability: originalTrack.danceability,
  target_energy: originalTrack.energy,
  target_valence: originalTrack.valence,
  target_tempo: originalTrack.tempo,
  target_acousticness: originalTrack.acousticness
});
```

## Get Available Genre Seeds

Retrieve the list of available genre seeds for recommendations.

### Method

```typescript
sdk.recommendations.genreSeeds(): Promise<Genres>
```

### Response

```typescript
interface Genres {
  genres: string[];
}
```

### Example

```typescript
const availableGenres = await sdk.recommendations.genreSeeds();

console.log(`Available genres: ${availableGenres.genres.length}`);
console.log(availableGenres.genres.slice(0, 10).join(", "));

// Check if a genre is available
const hasJazz = availableGenres.genres.includes("jazz");
console.log(`Jazz available: ${hasJazz}`);

// Use genres in recommendations
const jazzRecs = await sdk.recommendations.get({
  seed_genres: ["jazz", "blues"],
  limit: 10
});
```

## Error Handling

```typescript
try {
  const recommendations = await sdk.recommendations.get({
    seed_tracks: ["invalid-id"],
    limit: 10
  });
} catch (error) {
  if (error.status === 400) {
    console.log("Bad request - check seed IDs and parameters");
  } else if (error.status === 401) {
    console.log("Authentication failed");
  } else if (error.status === 429) {
    console.log("Rate limited - retry after delay");
  } else {
    console.log("API error:", error.message);
  }
}
```

## Validation and Constraints

### Maximum Seeds Constraint

The API enforces a maximum of **5 total seeds** across all seed types:

```typescript
// Valid: 5 seeds total
await sdk.recommendations.get({
  seed_artists: ["artist1", "artist2"],
  seed_tracks: ["track1"],
  seed_genres: ["pop", "rock"]
});

// Invalid: 6 seeds total (will return 400 error)
await sdk.recommendations.get({
  seed_artists: ["artist1", "artist2", "artist3"],
  seed_tracks: ["track1", "track2"],
  seed_genres: ["pop"]
});
```

### At Least One Seed Required

```typescript
// Invalid: No seeds provided (will return 400 error)
await sdk.recommendations.get({
  limit: 10,
  target_energy: 0.8
});
```

### Limit Range

```typescript
// Valid
await sdk.recommendations.get({
  seed_genres: ["pop"],
  limit: 50  // Range: 1-100
});

// Invalid: limit out of range
await sdk.recommendations.get({
  seed_genres: ["pop"],
  limit: 150  // Exceeds maximum
});
```

## Best Practices

1. **Use appropriate seed combinations:** Mix seed types for better diversity
2. **Don't over-constrain:** Too many tunable attributes may reduce result quality
3. **Use target over min/max:** Target values are soft preferences, min/max are hard constraints
4. **Cache genre seeds:** The available genres list changes infrequently
5. **Respect the 5-seed limit:** Plan seed distribution across types
6. **Consider market parameter:** Improves availability of recommended tracks
7. **Test attribute combinations:** Different genres respond better to different tunable attributes
8. **Use audio features as reference:** Base tunable attributes on existing tracks when possible

## Use Cases

### Playlist Generation

```typescript
// Generate a workout playlist
const workoutPlaylist = await sdk.recommendations.get({
  seed_genres: ["workout", "edm"],
  limit: 30,
  target_energy: 0.9,
  min_energy: 0.7,
  target_tempo: 130,
  min_tempo: 120
});
```

### Discovery by Similarity

```typescript
// Discover tracks similar to favorite artists
const discovery = await sdk.recommendations.get({
  seed_artists: [
    "4NHQUGzhtTLFvgF5SZesLK",  // Tove Lo
    "6qqNVTkY8uBg9cP3Jd7DAH"   // Billie Eilish
  ],
  limit: 20,
  market: "US"
});
```

### Mood-Based Selection

```typescript
// Create a happy, uplifting playlist
const happyPlaylist = await sdk.recommendations.get({
  seed_genres: ["pop", "indie-pop"],
  limit: 25,
  target_valence: 0.85,      // Very positive
  min_valence: 0.6,
  target_energy: 0.7,
  min_danceability: 0.5
});
```

## TypeScript Types

```typescript
interface RecommendationsRequest {
  // Seed parameters (at least one required, max 5 total)
  seed_artists?: string[];
  seed_genres?: string[];
  seed_tracks?: string[];

  // Optional parameters
  limit?: number;
  market?: string;

  // Tunable attributes - all support min/max/target variants
  min_acousticness?: number;
  max_acousticness?: number;
  target_acousticness?: number;

  min_danceability?: number;
  max_danceability?: number;
  target_danceability?: number;

  min_duration_ms?: number;
  max_duration_ms?: number;
  target_duration_ms?: number;

  min_energy?: number;
  max_energy?: number;
  target_energy?: number;

  min_instrumentalness?: number;
  max_instrumentalness?: number;
  target_instrumentalness?: number;

  min_key?: number;
  max_key?: number;
  target_key?: number;

  min_liveness?: number;
  max_liveness?: number;
  target_liveness?: number;

  min_loudness?: number;
  max_loudness?: number;
  target_loudness?: number;

  min_mode?: number;
  max_mode?: number;
  target_mode?: number;

  min_popularity?: number;
  max_popularity?: number;
  target_popularity?: number;

  min_speechiness?: number;
  max_speechiness?: number;
  target_speechiness?: number;

  min_tempo?: number;
  max_tempo?: number;
  target_tempo?: number;

  min_time_signature?: number;
  max_time_signature?: number;
  target_time_signature?: number;

  min_valence?: number;
  max_valence?: number;
  target_valence?: number;
}

interface RecommendationsResponse {
  seeds: RecommendationSeed[];
  tracks: SimplifiedTrack[];
}

interface RecommendationSeed {
  afterFilteringSize: number;
  afterRelinkingSize: number;
  href: string | null;
  id: string;
  initialPoolSize: number;
  type: "artist" | "track" | "genre";
}
```

## Related APIs

- [Tracks API](tracks.md): Get audio features for tunable attribute values
- [Artists API](artists.md): Get artist IDs for seed_artists
- [Search API](search.md): Search for tracks, artists, and genres

## Important Notes

- Spotify content may not be used to train machine learning or AI models
- Recommendations are generated based on collaborative filtering and audio analysis
- The algorithm considers both seed similarity and attribute constraints
- Results are ordered by relevance to the provided parameters
- Genre seeds are Spotify-defined categories and may not match all music taxonomies
