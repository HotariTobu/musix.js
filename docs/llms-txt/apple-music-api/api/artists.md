# Artists API

The Artists API provides access to artist information from the Apple Music catalog, including biographical data, albums, and related artists.

## Get Artist

Retrieve detailed information about a specific artist.

### Endpoint

```
GET /v1/catalog/{storefront}/artists/{id}
```

### Parameters

- `storefront` (required): Two-letter country code (e.g., 'us', 'jp', 'gb')
- `id` (required): Apple Music catalog artist ID
- `include` (optional): Relationships to include
  - `albums`: Include artist's albums
  - `genres`: Include genre information
- `l` (optional): Language tag for localized content

### Example

```typescript
async function getArtist(
  storefront: string,
  artistId: string,
  developerToken: string
) {
  const url = `https://api.music.apple.com/v1/catalog/${storefront}/artists/${artistId}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const data = await response.json();
  return data.data[0];
}

// Usage
const artist = await getArtist('us', '136975', developerToken);

console.log({
  name: artist.attributes.name,
  genres: artist.attributes.genreNames,
  url: artist.attributes.url
});
```

### Response Structure

```typescript
interface Artist {
  id: string;
  type: 'artists';
  href: string;
  attributes: {
    name: string;
    genreNames: string[];
    url: string;             // Apple Music web URL
    editorialNotes?: {
      standard?: string;     // Full editorial description
      short?: string;        // Short editorial description
    };
  };
  relationships?: {
    albums?: {
      href: string;
      data: Array<{ id: string; type: 'albums'; href: string }>;
    };
    genres?: {
      href: string;
      data: Array<{ id: string; type: 'genres'; href: string }>;
    };
  };
}
```

## Get Multiple Artists

Fetch information for multiple artists in a single request.

### Endpoint

```
GET /v1/catalog/{storefront}/artists
```

### Parameters

- `ids` (required): Comma-separated list of artist IDs (max 100)
- `include` (optional): Relationships to include

### Example

```typescript
async function getArtists(
  storefront: string,
  artistIds: string[],
  developerToken: string
) {
  const url = new URL(`https://api.music.apple.com/v1/catalog/${storefront}/artists`);
  url.searchParams.set('ids', artistIds.join(','));

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const data = await response.json();
  return data.data;
}

// Usage
const artists = await getArtists(
  'us',
  ['136975', '657515', '462006'],
  developerToken
);

artists.forEach(artist => {
  console.log(`${artist.attributes.name} - ${artist.attributes.genreNames.join(', ')}`);
});
```

## Get Artist Albums

Retrieve all albums by a specific artist.

### Endpoint

```
GET /v1/catalog/{storefront}/artists/{id}/albums
```

### Parameters

- `limit` (optional): Maximum number of results (default: 25, max: 100)
- `offset` (optional): Offset for pagination (default: 0)
- `include` (optional): Relationships to include

### Example

```typescript
async function getArtistAlbums(
  storefront: string,
  artistId: string,
  developerToken: string,
  limit: number = 25,
  offset: number = 0
) {
  const url = new URL(
    `https://api.music.apple.com/v1/catalog/${storefront}/artists/${artistId}/albums`
  );
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('offset', offset.toString());

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const data = await response.json();
  return {
    albums: data.data,
    next: data.next,
    total: data.meta?.total
  };
}

// Usage
const result = await getArtistAlbums('us', '136975', developerToken);

console.log(`Total albums: ${result.total}`);
result.albums.forEach(album => {
  console.log(`${album.attributes.name} (${album.attributes.releaseDate})`);
});

// Pagination
if (result.next) {
  const nextPage = await getArtistAlbums('us', '136975', developerToken, 25, 25);
}
```

## Get Artist's Top Songs

Retrieve an artist's most popular songs.

### Endpoint

```
GET /v1/catalog/{storefront}/artists/{id}/view/top-songs
```

### Example

```typescript
async function getArtistTopSongs(
  storefront: string,
  artistId: string,
  developerToken: string,
  limit: number = 10
) {
  const url = new URL(
    `https://api.music.apple.com/v1/catalog/${storefront}/artists/${artistId}/view/top-songs`
  );
  url.searchParams.set('limit', limit.toString());

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const data = await response.json();
  return data.data;
}

// Usage
const topSongs = await getArtistTopSongs('us', '136975', developerToken, 10);

topSongs.forEach((song, index) => {
  console.log(`${index + 1}. ${song.attributes.name}`);
});
```

## Get Artist with Relationships

Fetch an artist with all related data in one request.

### Example

```typescript
async function getArtistWithAlbums(
  storefront: string,
  artistId: string,
  developerToken: string
) {
  const url = new URL(
    `https://api.music.apple.com/v1/catalog/${storefront}/artists/${artistId}`
  );
  url.searchParams.set('include', 'albums');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const result = await response.json();

  return {
    artist: result.data[0],
    albums: result.data[0].relationships?.albums?.data || []
  };
}

// Usage
const { artist, albums } = await getArtistWithAlbums(
  'us',
  '136975',
  developerToken
);

console.log('Artist:', artist.attributes.name);
console.log('Albums:', albums.length);
```

## User Library Artists

Access user's library artists (requires user token).

### Get User Library Artists

```typescript
async function getUserLibraryArtists(
  developerToken: string,
  userToken: string,
  limit: number = 25,
  offset: number = 0
) {
  const url = new URL('https://api.music.apple.com/v1/me/library/artists');
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('offset', offset.toString());

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${developerToken}`,
      'Music-User-Token': userToken
    }
  });

  const data = await response.json();
  return data.data;
}
```

### Get Library Artist Albums

```typescript
async function getLibraryArtistAlbums(
  libraryArtistId: string,
  developerToken: string,
  userToken: string
) {
  const url = `https://api.music.apple.com/v1/me/library/artists/${libraryArtistId}/albums`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${developerToken}`,
      'Music-User-Token': userToken
    }
  });

  const data = await response.json();
  return data.data;
}
```

## Filtering Albums

Filter artist albums by type.

### Example

```typescript
interface ArtistAlbumsFilter {
  includeCompilations?: boolean;
  includeSingles?: boolean;
  includeAlbums?: boolean;
}

async function getFilteredArtistAlbums(
  storefront: string,
  artistId: string,
  developerToken: string,
  filter: ArtistAlbumsFilter = {}
) {
  const albums = await getArtistAlbums(storefront, artistId, developerToken, 100);

  return albums.albums.filter(album => {
    const attrs = album.attributes;

    if (attrs.isCompilation && !filter.includeCompilations) return false;
    if (attrs.isSingle && !filter.includeSingles) return false;
    if (!attrs.isSingle && !attrs.isCompilation && !filter.includeAlbums) return false;

    return true;
  });
}

// Usage - Only full albums, no singles or compilations
const fullAlbums = await getFilteredArtistAlbums(
  'us',
  '136975',
  developerToken,
  {
    includeAlbums: true,
    includeCompilations: false,
    includeSingles: false
  }
);
```

## Sorting Albums

Sort artist albums by release date or name.

### Example

```typescript
type AlbumSortKey = 'releaseDate' | 'name';
type SortOrder = 'asc' | 'desc';

function sortAlbums(
  albums: Album[],
  sortBy: AlbumSortKey,
  order: SortOrder = 'desc'
): Album[] {
  return albums.sort((a, b) => {
    const aVal = a.attributes[sortBy];
    const bVal = b.attributes[sortBy];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// Usage - Latest releases first
const albums = await getArtistAlbums('us', '136975', developerToken);
const sorted = sortAlbums(albums.albums, 'releaseDate', 'desc');

sorted.forEach(album => {
  console.log(`${album.attributes.releaseDate}: ${album.attributes.name}`);
});
```

## TypeScript Types

Complete type definitions for artists:

```typescript
interface Artist {
  id: string;
  type: 'artists';
  href: string;
  attributes: ArtistAttributes;
  relationships?: ArtistRelationships;
}

interface ArtistAttributes {
  name: string;
  genreNames: string[];
  url: string;
  editorialNotes?: {
    standard?: string;
    short?: string;
  };
}

interface ArtistRelationships {
  albums?: {
    href: string;
    data: Array<{ id: string; type: 'albums'; href: string }>;
    next?: string;
  };
  genres?: {
    href: string;
    data: Array<{ id: string; type: 'genres'; href: string }>;
  };
}

interface ArtistAlbumsResponse {
  data: Album[];
  next?: string;
  meta?: {
    total?: number;
  };
}
```

## Error Handling

```typescript
async function getArtistSafe(
  storefront: string,
  artistId: string,
  developerToken: string
): Promise<Artist | null> {
  try {
    const url = `https://api.music.apple.com/v1/catalog/${storefront}/artists/${artistId}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${developerToken}`
      }
    });

    if (response.status === 404) {
      console.error('Artist not found');
      return null;
    }

    if (response.status === 401) {
      throw new Error('Invalid or expired developer token');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.title || 'API request failed');
    }

    const data = await response.json();
    return data.data[0];
  } catch (error) {
    console.error('Failed to fetch artist:', error);
    return null;
  }
}
```

## Pagination Helper

```typescript
async function* paginateArtistAlbums(
  storefront: string,
  artistId: string,
  developerToken: string
) {
  let offset = 0;
  const limit = 100;

  while (true) {
    const result = await getArtistAlbums(
      storefront,
      artistId,
      developerToken,
      limit,
      offset
    );

    yield* result.albums;

    if (!result.next || result.albums.length < limit) {
      break;
    }

    offset += limit;
  }
}

// Usage - Fetch all albums with pagination
const allAlbums: Album[] = [];
for await (const album of paginateArtistAlbums('us', '136975', developerToken)) {
  allAlbums.push(album);
}

console.log(`Total albums: ${allAlbums.length}`);
```

## Best Practices

1. **Use include parameter**: Fetch related data in one request
2. **Handle pagination**: Artist catalogs can be large, use offset/limit
3. **Cache artist data**: Artist metadata changes infrequently
4. **Filter client-side**: Apply filters after fetching to reduce requests
5. **Batch requests**: Use multiple IDs parameter for multiple artists
6. **Handle missing editorials**: Editorial notes are optional

## Related Documentation

- [Albums API](albums.md): Get album details
- [Tracks API](tracks.md): Get track information
- [Search API](search.md): Search for artists
- [Error Handling](../core/error-handling.md): API error handling patterns
