# Search API

The Search API allows you to search for tracks, albums, artists, playlists, shows, and episodes across Spotify's catalog.

## Search Method

Perform a search across multiple item types with a single query.

### Method

```typescript
sdk.search(
  query: string,
  types: Array<"album" | "artist" | "playlist" | "track" | "show" | "episode">,
  market?: string,
  limit?: number,
  offset?: number,
  includeExternal?: "audio"
): Promise<SearchResults>
```

### Parameters

- `query` (required): Search query string
- `types` (required): Array of item types to search for
- `market` (optional): ISO 3166-1 alpha-2 country code
- `limit` (optional): Number of results per type (1-50, default 20)
- `offset` (optional): Index of first result (default 0)
- `includeExternal` (optional): Include externally hosted audio

### Response

Returns a `SearchResults` object containing results for each requested type:

```typescript
interface SearchResults {
  tracks?: Paginated<Track>;
  albums?: Paginated<SimplifiedAlbum>;
  artists?: Paginated<Artist>;
  playlists?: Paginated<SimplifiedPlaylist>;
  shows?: Paginated<SimplifiedShow>;
  episodes?: Paginated<SimplifiedEpisode>;
}
```

## Basic Search Examples

### Search for Artists

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withClientCredentials(
  "client-id",
  "client-secret"
);

// Search for artists
const results = await sdk.search("The Beatles", ["artist"]);

if (results.artists) {
  console.table(results.artists.items.map(artist => ({
    name: artist.name,
    followers: artist.followers.total.toLocaleString(),
    popularity: artist.popularity,
    genres: artist.genres.slice(0, 3).join(", ")
  })));
}
```

### Search for Tracks

```typescript
const results = await sdk.search("bohemian rhapsody", ["track"], "US", 10);

if (results.tracks) {
  console.log(`Found ${results.tracks.total} tracks:`);

  results.tracks.items.forEach((track, index) => {
    console.log(`${index + 1}. ${track.name}`);
    console.log(`   Artist: ${track.artists[0].name}`);
    console.log(`   Album: ${track.album.name}`);
    console.log(`   Popularity: ${track.popularity}`);
  });
}
```

### Search Multiple Types

```typescript
const results = await sdk.search(
  "radiohead",
  ["artist", "album", "track"],
  "US",
  5
);

console.log("Artists:", results.artists?.items.length);
console.log("Albums:", results.albums?.items.length);
console.log("Tracks:", results.tracks?.items.length);

// Process each type
if (results.artists && results.artists.items.length > 0) {
  const topArtist = results.artists.items[0];
  console.log(`Top artist: ${topArtist.name} (${topArtist.followers.total.toLocaleString()} followers)`);
}
```

## Query Syntax

### Basic Search

```typescript
// Simple keyword search
await sdk.search("love", ["track"]);

// Multiple keywords
await sdk.search("love song", ["track"]);
```

### Field Filters

Use field filters for more precise searches:

```typescript
// Search by artist
await sdk.search("artist:Coldplay", ["track"]);

// Search by album
await sdk.search("album:Abbey Road", ["track"]);

// Search by track name
await sdk.search("track:Yesterday", ["track"]);

// Search by year
await sdk.search("year:2020", ["album"]);

// Search by genre
await sdk.search("genre:rock", ["artist"]);
```

### Combining Filters

```typescript
// Track by specific artist
await sdk.search("track:Fix You artist:Coldplay", ["track"]);

// Album from specific year
await sdk.search("album:Parachutes year:2000", ["album"]);

// Multiple conditions
await sdk.search("genre:jazz year:1960-1970", ["album"]);
```

### Advanced Operators

```typescript
// NOT operator
await sdk.search("rock NOT metal", ["artist"]);

// OR operator
await sdk.search("jazz OR blues", ["artist"]);

// Exact phrase (quotes)
await sdk.search('"dark side of the moon"', ["album"]);

// Wildcard (*)
await sdk.search("happ*", ["track"]);
```

## TypeScript Usage Examples

### Type-Safe Search Results

```typescript
interface SearchResult<T> {
  items: T[];
  total: number;
}

async function searchTracks(query: string, limit: number = 20): Promise<SearchResult<Track>> {
  const results = await sdk.search(query, ["track"], "US", limit);

  return {
    items: results.tracks?.items || [],
    total: results.tracks?.total || 0
  };
}

const { items, total } = await searchTracks("love songs", 10);
console.log(`Found ${total} tracks, showing ${items.length}`);
```

### Search with Pagination

```typescript
async function searchAll(
  query: string,
  type: "track" | "album" | "artist",
  maxResults: number = 100
): Promise<any[]> {
  const allResults: any[] = [];
  let offset = 0;
  const limit = 50;

  while (allResults.length < maxResults) {
    const results = await sdk.search(query, [type], "US", limit, offset);

    const items = results[`${type}s`]?.items || [];
    if (items.length === 0) break;

    allResults.push(...items);
    offset += limit;

    if (!results[`${type}s`]?.next) break;
  }

  return allResults.slice(0, maxResults);
}

const tracks = await searchAll("rock", "track", 200);
console.log(`Retrieved ${tracks.length} rock tracks`);
```

### Search and Filter Results

```typescript
const results = await sdk.search("holiday", ["track"], "US", 50);

if (results.tracks) {
  // Filter explicit content
  const cleanTracks = results.tracks.items.filter(track => !track.explicit);

  // Filter by popularity
  const popularTracks = results.tracks.items.filter(track => track.popularity >= 70);

  // Filter by release year
  const recentTracks = results.tracks.items.filter(track => {
    const year = parseInt(track.album.release_date.substring(0, 4));
    return year >= 2020;
  });

  console.log(`Total: ${results.tracks.items.length}`);
  console.log(`Clean: ${cleanTracks.length}`);
  console.log(`Popular: ${popularTracks.length}`);
  console.log(`Recent: ${recentTracks.length}`);
}
```

### Find Best Match

```typescript
async function findBestMatch(
  trackName: string,
  artistName: string
): Promise<Track | null> {
  const query = `track:${trackName} artist:${artistName}`;
  const results = await sdk.search(query, ["track"], "US", 5);

  if (!results.tracks || results.tracks.items.length === 0) {
    return null;
  }

  // Return track with highest popularity
  return results.tracks.items.reduce((prev, current) =>
    current.popularity > prev.popularity ? current : prev
  );
}

const track = await findBestMatch("Fix You", "Coldplay");
if (track) {
  console.log(`Found: ${track.name} by ${track.artists[0].name}`);
  console.log(`Popularity: ${track.popularity}`);
}
```

## Search Playlists

```typescript
const results = await sdk.search("workout", ["playlist"], "US", 20);

if (results.playlists) {
  console.log(`Found ${results.playlists.total} workout playlists:`);

  results.playlists.items.forEach(playlist => {
    console.log(`${playlist.name}`);
    console.log(`  Owner: ${playlist.owner.display_name}`);
    console.log(`  Tracks: ${playlist.tracks.total}`);
    console.log(`  Description: ${playlist.description || "No description"}`);
  });
}
```

## Search Albums

```typescript
const results = await sdk.search("greatest hits", ["album"], "US", 20);

if (results.albums) {
  // Sort by release date
  const sortedAlbums = [...results.albums.items].sort((a, b) =>
    b.release_date.localeCompare(a.release_date)
  );

  sortedAlbums.forEach(album => {
    console.log(`${album.name} - ${album.artists[0].name} (${album.release_date.substring(0, 4)})`);
  });
}
```

## Market-Specific Search

```typescript
// Search in different markets
const markets = ["US", "GB", "JP"];

for (const market of markets) {
  const results = await sdk.search("top hits", ["playlist"], market, 5);

  if (results.playlists) {
    console.log(`\n${market} Top Playlists:`);
    results.playlists.items.forEach(p => console.log(`  ${p.name}`));
  }
}
```

## Error Handling

```typescript
try {
  const results = await sdk.search("", ["track"]);
} catch (error) {
  if (error.status === 400) {
    console.log("Invalid search query");
  } else if (error.status === 401) {
    console.log("Authentication required");
  } else if (error.status === 429) {
    console.log("Rate limit exceeded");
    // Wait and retry
  } else {
    console.log("Search error:", error.message);
  }
}
```

## Best Practices

1. **Use field filters:** More precise results with `artist:`, `track:`, `album:`
2. **Specify market:** Get accurate availability and regional content
3. **Limit results:** Request only what you need (default 20, max 50 per type)
4. **Handle pagination:** For comprehensive results, paginate through all matches
5. **Validate queries:** Check for empty strings before searching
6. **Use wildcards sparingly:** Can return unexpected results
7. **Cache results:** Search results are relatively stable, suitable for caching
8. **Sanitize user input:** Escape special characters in user-provided queries

## Query Examples

```typescript
// Find specific track
"track:Wonderwall artist:Oasis"

// Find albums from year range
"year:2020-2023 genre:pop"

// Exclude explicit content
"love songs NOT explicit:true"

// Multiple artists
"artist:Beatles OR artist:Stones"

// Recent albums
"tag:new year:2024"

// Popular tracks
"genre:electronic popularity:>80"
```

## Performance Tips

1. **Batch searches:** Combine multiple types in one request
2. **Use appropriate limits:** Don't fetch more than needed
3. **Cache frequent searches:** Popular queries can be cached
4. **Debounce user input:** Wait for user to finish typing
5. **Use specific queries:** More specific = faster results

## Common Patterns

### Auto-complete search

```typescript
let searchTimeout: NodeJS.Timeout;

function autoCompleteSearch(input: string, callback: (results: any[]) => void) {
  clearTimeout(searchTimeout);

  if (input.length < 2) {
    callback([]);
    return;
  }

  searchTimeout = setTimeout(async () => {
    const results = await sdk.search(input, ["track", "artist"], "US", 5);
    const combined = [
      ...(results.artists?.items || []).map(a => ({ type: "artist", ...a })),
      ...(results.tracks?.items || []).map(t => ({ type: "track", ...t }))
    ];
    callback(combined);
  }, 300); // Debounce 300ms
}
```

### Multi-type search with priority

```typescript
async function smartSearch(query: string) {
  const results = await sdk.search(
    query,
    ["artist", "track", "album"],
    "US",
    10
  );

  // Prioritize exact artist match
  if (results.artists && results.artists.items.length > 0) {
    const exactMatch = results.artists.items.find(
      a => a.name.toLowerCase() === query.toLowerCase()
    );
    if (exactMatch) {
      return { type: "artist", item: exactMatch };
    }
  }

  // Otherwise, return highest popularity item
  const allItems = [
    ...(results.artists?.items || []).map(i => ({ type: "artist", ...i })),
    ...(results.tracks?.items || []).map(i => ({ type: "track", ...i })),
    ...(results.albums?.items || []).map(i => ({ type: "album", ...i }))
  ];

  return allItems.reduce((prev, current) =>
    current.popularity > (prev.popularity || 0) ? current : prev
  );
}
```

## Related Methods

- [Tracks API](tracks.md): Get detailed track information
- [Albums API](albums.md): Get album details
- [Artists API](artists.md): Get artist information
- [Playlists API](playlists.md): Get playlist details
