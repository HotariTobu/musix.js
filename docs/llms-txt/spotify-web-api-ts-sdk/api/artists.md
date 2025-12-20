# Artists API

The Artists API provides access to artist information, discography, related artists, and top tracks.

## Get Artist

Retrieve detailed information about a single artist.

### Method

```typescript
sdk.artists.get(artistId: string): Promise<Artist>
```

### Parameters

- `artistId` (required): The Spotify ID for the artist

### Response

Returns an `Artist` object containing:

- `id`: Spotify ID
- `name`: Artist name
- `genres`: Array of genre strings
- `popularity`: Value 0-100
- `followers`: Follower count
- `images`: Array of artist images
- `external_urls`: Link to Spotify web player
- `uri`: Spotify URI

### Example

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withClientCredentials(
  "client-id",
  "client-secret"
);

// Get artist information
const artist = await sdk.artists.get("0OdUWJ0sBjDrqHygGUXeCF");

console.log({
  name: artist.name,
  genres: artist.genres.join(", "),
  followers: artist.followers.total.toLocaleString(),
  popularity: artist.popularity
});
```

### TypeScript Types

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

interface Image {
  url: string;
  height: number;
  width: number;
}
```

## Get Multiple Artists

Retrieve information for multiple artists in a single request.

### Method

```typescript
sdk.artists.getArtists(artistIds: string[]): Promise<Artist[]>
```

### Parameters

- `artistIds`: Array of Spotify artist IDs (max 50)

### Example

```typescript
const artistIds = [
  "0OdUWJ0sBjDrqHygGUXeCF",  // Band of Horses
  "3WrFJ7ztbogyGnTHbHJFl2",  // The Beatles
  "1Xyo4u8uXC1ZmMpatF05PJ"   // The Weeknd
];

const artists = await sdk.artists.getArtists(artistIds);

artists.forEach(artist => {
  if (artist) {
    console.log(`${artist.name}: ${artist.followers.total.toLocaleString()} followers`);
  }
});
```

## Get Artist's Albums

Retrieve an artist's albums, singles, and compilations.

### Method

```typescript
sdk.artists.albums(
  artistId: string,
  includeGroups?: string[],
  market?: string,
  limit?: number,
  offset?: number
): Promise<Paginated<SimplifiedAlbum>>
```

### Parameters

- `artistId` (required): The Spotify artist ID
- `includeGroups` (optional): Array of types: "album", "single", "appears_on", "compilation"
- `market` (optional): ISO 3166-1 alpha-2 country code
- `limit` (optional): Number of albums (1-50, default 20)
- `offset` (optional): Index of first album (default 0)

### Example

```typescript
// Get all albums (not singles or compilations)
const albums = await sdk.artists.albums(
  "0OdUWJ0sBjDrqHygGUXeCF",
  ["album"],
  "US",
  50
);

console.log(`${albums.total} albums found`);

albums.items.forEach(album => {
  console.log(`${album.name} (${album.release_date.substring(0, 4)})`);
});

// Get everything (albums, singles, compilations, appearances)
const allReleases = await sdk.artists.albums(
  "0OdUWJ0sBjDrqHygGUXeCF",
  ["album", "single", "appears_on", "compilation"],
  "US"
);
```

## Get Artist's Top Tracks

Get an artist's most popular tracks in a specific market.

### Method

```typescript
sdk.artists.topTracks(artistId: string, market: string): Promise<Track[]>
```

### Parameters

- `artistId` (required): The Spotify artist ID
- `market` (required): ISO 3166-1 alpha-2 country code

### Example

```typescript
const topTracks = await sdk.artists.topTracks("0OdUWJ0sBjDrqHygGUXeCF", "US");

console.log("Top Tracks:");
topTracks.forEach((track, index) => {
  console.log(`${index + 1}. ${track.name} (${track.album.name})`);
  console.log(`   Popularity: ${track.popularity}`);
});
```

## Get Related Artists

Find artists similar to a given artist.

### Method

```typescript
sdk.artists.relatedArtists(artistId: string): Promise<Artist[]>
```

### Example

```typescript
const related = await sdk.artists.relatedArtists("0OdUWJ0sBjDrqHygGUXeCF");

console.log("Related Artists:");
related.forEach(artist => {
  console.log(`${artist.name} - ${artist.genres.join(", ")}`);
});
```

## TypeScript Usage Examples

### Get artist with full discography

```typescript
interface ArtistDiscography {
  artist: Artist;
  albums: SimplifiedAlbum[];
  topTracks: Track[];
  related: Artist[];
}

async function getFullArtistInfo(artistId: string, market: string): Promise<ArtistDiscography> {
  // Parallel requests for better performance
  const [artist, albums, topTracks, related] = await Promise.all([
    sdk.artists.get(artistId),
    sdk.artists.albums(artistId, ["album"], market, 50),
    sdk.artists.topTracks(artistId, market),
    sdk.artists.relatedArtists(artistId)
  ]);

  return {
    artist,
    albums: albums.items,
    topTracks,
    related
  };
}

const info = await getFullArtistInfo("0OdUWJ0sBjDrqHygGUXeCF", "US");
console.log(`${info.artist.name} has ${info.albums.length} albums`);
```

### Filter by release date

```typescript
const albums = await sdk.artists.albums("0OdUWJ0sBjDrqHygGUXeCF", ["album"]);

const recentAlbums = albums.items.filter(album => {
  const year = parseInt(album.release_date.substring(0, 4));
  return year >= 2020;
});

console.log("Recent albums:");
recentAlbums.forEach(album => {
  console.log(`${album.name} (${album.release_date})`);
});
```

### Pagination through all albums

```typescript
async function getAllArtistAlbums(artistId: string): Promise<SimplifiedAlbum[]> {
  const allAlbums: SimplifiedAlbum[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const page = await sdk.artists.albums(artistId, undefined, undefined, limit, offset);
    allAlbums.push(...page.items);

    if (!page.next) break;
    offset += limit;
  }

  return allAlbums;
}

const allAlbums = await getAllArtistAlbums("0OdUWJ0sBjDrqHygGUXeCF");
console.log(`Total releases: ${allAlbums.length}`);
```

### Genre analysis

```typescript
const artists = await sdk.artists.getArtists([
  "0OdUWJ0sBjDrqHygGUXeCF",
  "3WrFJ7ztbogyGnTHbHJFl2",
  "1Xyo4u8uXC1ZmMpatF05PJ"
]);

const genreCount = new Map<string, number>();

artists.forEach(artist => {
  if (artist) {
    artist.genres.forEach(genre => {
      genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
    });
  }
});

console.log("Genre distribution:");
Array.from(genreCount.entries())
  .sort((a, b) => b[1] - a[1])
  .forEach(([genre, count]) => {
    console.log(`${genre}: ${count}`);
  });
```

## Error Handling

```typescript
try {
  const artist = await sdk.artists.get("invalid-id");
} catch (error) {
  if (error.status === 404) {
    console.log("Artist not found");
  } else if (error.status === 400) {
    console.log("Invalid artist ID format");
  } else if (error.status === 401) {
    console.log("Authentication required");
  } else if (error.status === 429) {
    console.log("Rate limit exceeded");
  } else {
    console.log("API error:", error.message);
  }
}
```

## Best Practices

1. **Batch requests:** Use `getArtists()` for multiple artists
2. **Parallel requests:** Fetch artist, albums, and top tracks simultaneously with `Promise.all()`
3. **Market parameter:** Specify market for accurate album availability and top tracks
4. **Include groups:** Filter album types to get only what you need
5. **Pagination:** Handle large discographies with proper pagination
6. **Cache artist data:** Artist info changes infrequently
7. **Genre filtering:** Not all artists have genre data

## Common Patterns

### Find artist's most popular album

```typescript
const albums = await sdk.artists.albums("0OdUWJ0sBjDrqHygGUXeCF", ["album"]);

// Get full album details to check popularity
const albumDetails = await sdk.albums.getAlbums(
  albums.items.slice(0, 20).map(a => a.id)
);

const mostPopular = albumDetails.reduce((prev, current) =>
  (current && current.popularity > (prev?.popularity || 0)) ? current : prev
);

console.log(`Most popular: ${mostPopular.name} (${mostPopular.popularity})`);
```

### Build artist network

```typescript
async function buildArtistNetwork(artistId: string, depth: number = 1): Promise<Set<string>> {
  const visited = new Set<string>();
  const queue: Array<{ id: string; level: number }> = [{ id: artistId, level: 0 }];

  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    if (visited.has(id) || level >= depth) continue;

    visited.add(id);
    const related = await sdk.artists.relatedArtists(id);

    related.forEach(artist => {
      if (!visited.has(artist.id)) {
        queue.push({ id: artist.id, level: level + 1 });
      }
    });
  }

  return visited;
}

const network = await buildArtistNetwork("0OdUWJ0sBjDrqHygGUXeCF", 2);
console.log(`Network size: ${network.size} artists`);
```

## Related Methods

- [Albums API](albums.md): Get album details
- [Tracks API](tracks.md): Get track details
- [Search API](search.md): Search for artists
