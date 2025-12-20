# Search API

The Search API provides comprehensive search capabilities across the Apple Music catalog, including songs, albums, artists, and playlists.

## Search Catalog

Search for resources in the Apple Music catalog.

### Endpoint

```
GET /v1/catalog/{storefront}/search
```

### Parameters

- `storefront` (required): Two-letter country code (e.g., 'us', 'jp', 'gb')
- `term` (required): Search query string (URL-encoded)
- `types` (required): Comma-separated resource types to search
  - `songs`: Search for tracks
  - `albums`: Search for albums
  - `artists`: Search for artists
  - `playlists`: Search for playlists
  - `music-videos`: Search for music videos
  - `stations`: Search for radio stations
- `limit` (optional): Maximum results per type (default: 5, max: 25)
- `offset` (optional): Offset for pagination (default: 0)
- `l` (optional): Language tag for localized content

### Example

```typescript
async function searchCatalog(
  storefront: string,
  term: string,
  types: string[],
  developerToken: string,
  limit: number = 5
) {
  const url = new URL(`https://api.music.apple.com/v1/catalog/${storefront}/search`);
  url.searchParams.set('term', term);
  url.searchParams.set('types', types.join(','));
  url.searchParams.set('limit', limit.toString());

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const data = await response.json();
  return data.results;
}

// Usage
const results = await searchCatalog(
  'us',
  'The Beatles',
  ['artists', 'albums', 'songs'],
  developerToken,
  10
);

console.log('Artists:', results.artists?.data.length || 0);
console.log('Albums:', results.albums?.data.length || 0);
console.log('Songs:', results.songs?.data.length || 0);
```

### Response Structure

```typescript
interface SearchResults {
  artists?: {
    href: string;
    next?: string;
    data: Artist[];
  };
  albums?: {
    href: string;
    next?: string;
    data: Album[];
  };
  songs?: {
    href: string;
    next?: string;
    data: Track[];
  };
  playlists?: {
    href: string;
    next?: string;
    data: Playlist[];
  };
  'music-videos'?: {
    href: string;
    next?: string;
    data: MusicVideo[];
  };
}
```

## Search by Type

Convenience functions for searching specific resource types.

### Search Songs

```typescript
async function searchSongs(
  storefront: string,
  term: string,
  developerToken: string,
  limit: number = 25
) {
  const results = await searchCatalog(
    storefront,
    term,
    ['songs'],
    developerToken,
    limit
  );

  return results.songs?.data || [];
}

// Usage
const songs = await searchSongs('us', 'Abbey Road', developerToken);

songs.forEach(song => {
  console.log(`${song.attributes.name} - ${song.attributes.artistName}`);
});
```

### Search Albums

```typescript
async function searchAlbums(
  storefront: string,
  term: string,
  developerToken: string,
  limit: number = 25
) {
  const results = await searchCatalog(
    storefront,
    term,
    ['albums'],
    developerToken,
    limit
  );

  return results.albums?.data || [];
}

// Usage
const albums = await searchAlbums('us', 'Abbey Road', developerToken);

albums.forEach(album => {
  console.log(`${album.attributes.name} - ${album.attributes.artistName} (${album.attributes.releaseDate})`);
});
```

### Search Artists

```typescript
async function searchArtists(
  storefront: string,
  term: string,
  developerToken: string,
  limit: number = 25
) {
  const results = await searchCatalog(
    storefront,
    term,
    ['artists'],
    developerToken,
    limit
  );

  return results.artists?.data || [];
}

// Usage
const artists = await searchArtists('us', 'The Beatles', developerToken);

artists.forEach(artist => {
  console.log(`${artist.attributes.name} - ${artist.attributes.genreNames.join(', ')}`);
});
```

### Search Playlists

```typescript
async function searchPlaylists(
  storefront: string,
  term: string,
  developerToken: string,
  limit: number = 25
) {
  const results = await searchCatalog(
    storefront,
    term,
    ['playlists'],
    developerToken,
    limit
  );

  return results.playlists?.data || [];
}

// Usage
const playlists = await searchPlaylists('us', 'rock classics', developerToken);

playlists.forEach(playlist => {
  console.log(`${playlist.attributes.name} (${playlist.attributes.trackCount} tracks)`);
});
```

## Search with Hints

Get search suggestions/hints as user types.

### Example

```typescript
async function searchHints(
  storefront: string,
  term: string,
  developerToken: string,
  types: string[] = ['artists', 'albums', 'songs']
) {
  if (term.length < 2) {
    return { artists: [], albums: [], songs: [] };
  }

  const results = await searchCatalog(
    storefront,
    term,
    types,
    developerToken,
    5 // Small limit for hints
  );

  return {
    artists: results.artists?.data || [],
    albums: results.albums?.data || [],
    songs: results.songs?.data || []
  };
}

// Usage - Real-time search
let searchTimeout: NodeJS.Timeout;

function onSearchInput(input: string) {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(async () => {
    const hints = await searchHints('us', input, developerToken);
    displayHints(hints);
  }, 300); // Debounce 300ms
}
```

## Search User Library

Search within user's library (requires user token).

### Endpoint

```
GET /v1/me/library/search
```

### Example

```typescript
async function searchUserLibrary(
  term: string,
  types: string[],
  developerToken: string,
  userToken: string,
  limit: number = 25
) {
  const url = new URL('https://api.music.apple.com/v1/me/library/search');
  url.searchParams.set('term', term);
  url.searchParams.set('types', types.join(','));
  url.searchParams.set('limit', limit.toString());

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${developerToken}`,
      'Music-User-Token': userToken
    }
  });

  const data = await response.json();
  return data.results;
}

// Usage
const libraryResults = await searchUserLibrary(
  'rock',
  ['library-songs', 'library-albums', 'library-artists'],
  developerToken,
  userToken
);

console.log('Library Songs:', libraryResults['library-songs']?.data.length || 0);
console.log('Library Albums:', libraryResults['library-albums']?.data.length || 0);
```

## Advanced Search Patterns

### Filter by Genre

```typescript
async function searchByGenre(
  storefront: string,
  term: string,
  genre: string,
  developerToken: string
) {
  const results = await searchCatalog(
    storefront,
    term,
    ['songs', 'albums'],
    developerToken,
    25
  );

  return {
    songs: results.songs?.data.filter(song =>
      song.attributes.genreNames.some(g =>
        g.toLowerCase().includes(genre.toLowerCase())
      )
    ) || [],
    albums: results.albums?.data.filter(album =>
      album.attributes.genreNames.some(g =>
        g.toLowerCase().includes(genre.toLowerCase())
      )
    ) || []
  };
}

// Usage
const rockResults = await searchByGenre('us', 'classic', 'rock', developerToken);
```

### Filter by Release Year

```typescript
async function searchByYear(
  storefront: string,
  term: string,
  year: number,
  developerToken: string
) {
  const results = await searchCatalog(
    storefront,
    term,
    ['albums'],
    developerToken,
    25
  );

  return results.albums?.data.filter(album => {
    const releaseYear = parseInt(album.attributes.releaseDate.substring(0, 4));
    return releaseYear === year;
  }) || [];
}

// Usage
const albums2020 = await searchByYear('us', 'pop', 2020, developerToken);
```

### Search with Pagination

```typescript
async function* paginateSearch(
  storefront: string,
  term: string,
  type: string,
  developerToken: string
) {
  let offset = 0;
  const limit = 25;

  while (true) {
    const url = new URL(`https://api.music.apple.com/v1/catalog/${storefront}/search`);
    url.searchParams.set('term', term);
    url.searchParams.set('types', type);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${developerToken}`
      }
    });

    const data = await response.json();
    const results = data.results[type]?.data || [];

    yield* results;

    if (results.length < limit) {
      break;
    }

    offset += limit;
  }
}

// Usage - Fetch all matching songs
const allSongs = [];
for await (const song of paginateSearch('us', 'rock', 'songs', developerToken)) {
  allSongs.push(song);
  if (allSongs.length >= 100) break; // Limit total results
}
```

## Query Formatting

### URL Encoding

```typescript
function formatSearchTerm(term: string): string {
  return encodeURIComponent(term.trim());
}

// Usage
const searchTerm = 'The Beatles: Abbey Road';
const encoded = formatSearchTerm(searchTerm);
// Result: 'The%20Beatles%3A%20Abbey%20Road'
```

### Multi-word Queries

```typescript
async function searchExact(
  storefront: string,
  term: string,
  type: string,
  developerToken: string
) {
  // Wrap in quotes for exact match
  const exactTerm = `"${term}"`;

  const results = await searchCatalog(
    storefront,
    exactTerm,
    [type],
    developerToken
  );

  return results[type]?.data || [];
}

// Usage
const exactMatches = await searchExact('us', 'Abbey Road', 'albums', developerToken);
```

## TypeScript Types

Complete type definitions for search:

```typescript
interface SearchResults {
  artists?: SearchResultSet<Artist>;
  albums?: SearchResultSet<Album>;
  songs?: SearchResultSet<Track>;
  playlists?: SearchResultSet<Playlist>;
  'music-videos'?: SearchResultSet<MusicVideo>;
  stations?: SearchResultSet<Station>;
}

interface SearchResultSet<T> {
  href: string;
  next?: string;
  data: T[];
}

interface SearchOptions {
  term: string;
  types: ResourceType[];
  limit?: number;
  offset?: number;
  storefront: string;
  language?: string;
}

type ResourceType =
  | 'songs'
  | 'albums'
  | 'artists'
  | 'playlists'
  | 'music-videos'
  | 'stations';

type LibraryResourceType =
  | 'library-songs'
  | 'library-albums'
  | 'library-artists'
  | 'library-playlists';
```

## Error Handling

```typescript
async function searchSafe(
  storefront: string,
  term: string,
  types: string[],
  developerToken: string
): Promise<SearchResults | null> {
  try {
    if (!term || term.trim().length === 0) {
      throw new Error('Search term cannot be empty');
    }

    const url = new URL(`https://api.music.apple.com/v1/catalog/${storefront}/search`);
    url.searchParams.set('term', term);
    url.searchParams.set('types', types.join(','));

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${developerToken}`
      }
    });

    if (response.status === 400) {
      console.error('Invalid search parameters');
      return null;
    }

    if (response.status === 401) {
      throw new Error('Invalid or expired developer token');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.title || 'Search failed');
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Search failed:', error);
    return null;
  }
}
```

## Performance Optimization

### Debounced Search

```typescript
class SearchDebouncer {
  private timeout: NodeJS.Timeout | null = null;
  private readonly delay: number;

  constructor(delay: number = 300) {
    this.delay = delay;
  }

  search<T>(
    searchFn: () => Promise<T>,
    callback: (results: T) => void
  ): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(async () => {
      const results = await searchFn();
      callback(results);
    }, this.delay);
  }

  cancel(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

// Usage
const debouncer = new SearchDebouncer(300);

function onSearchInput(input: string) {
  debouncer.search(
    () => searchCatalog('us', input, ['songs'], developerToken),
    (results) => {
      displayResults(results.songs?.data || []);
    }
  );
}
```

### Cached Search

```typescript
class SearchCache {
  private cache = new Map<string, { results: any; timestamp: number }>();
  private readonly ttl: number;

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  getCacheKey(storefront: string, term: string, types: string[]): string {
    return `${storefront}:${term}:${types.sort().join(',')}`;
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);

    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.results;
  }

  set(key: string, results: any): void {
    this.cache.set(key, {
      results,
      timestamp: Date.now()
    });
  }
}

// Usage
const searchCache = new SearchCache(5);

async function cachedSearch(
  storefront: string,
  term: string,
  types: string[],
  developerToken: string
) {
  const cacheKey = searchCache.getCacheKey(storefront, term, types);
  const cached = searchCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const results = await searchCatalog(storefront, term, types, developerToken);
  searchCache.set(cacheKey, results);

  return results;
}
```

## Best Practices

1. **Debounce user input**: Wait for user to finish typing before searching
2. **Cache results**: Store recent searches to reduce API calls
3. **Limit result count**: Use appropriate limits for UI display
4. **Handle empty results**: Provide helpful feedback when no results found
5. **URL encode terms**: Always encode search terms properly
6. **Progressive search**: Search as user types for better UX
7. **Type-specific limits**: Use different limits for different resource types

## Related Documentation

- [Albums API](albums.md): Get album details from search results
- [Artists API](artists.md): Get artist details from search results
- [Tracks API](tracks.md): Get track details from search results
- [Playlists API](playlists.md): Get playlist details from search results
- [Error Handling](../core/error-handling.md): API error handling patterns
