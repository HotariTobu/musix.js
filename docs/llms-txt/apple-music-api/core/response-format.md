# Response Format

Apple Music API responses follow the JSON:API specification, providing a consistent structure for all resource types.

## JSON:API Specification

The API conforms to [JSON:API v1.0](https://jsonapi.org/format/1.0/), which defines standard formats for:

- Resource objects
- Relationships
- Links
- Metadata
- Errors

## Basic Response Structure

### Single Resource

```json
{
  "data": {
    "id": "1440935637",
    "type": "albums",
    "href": "/v1/catalog/us/albums/1440935637",
    "attributes": { ... },
    "relationships": { ... }
  }
}
```

### Multiple Resources

```json
{
  "data": [
    {
      "id": "1440935637",
      "type": "albums",
      "href": "/v1/catalog/us/albums/1440935637",
      "attributes": { ... }
    },
    {
      "id": "1469577723",
      "type": "albums",
      "href": "/v1/catalog/us/albums/1469577723",
      "attributes": { ... }
    }
  ]
}
```

## Resource Object

Every resource has a consistent structure:

```typescript
interface Resource<T = any> {
  id: string;              // Unique resource identifier
  type: string;            // Resource type (e.g., 'albums', 'songs')
  href: string;            // API endpoint for this resource
  attributes: T;           // Resource-specific data
  relationships?: {        // Related resources
    [key: string]: Relationship;
  };
}
```

### Example

```typescript
const album: Resource<AlbumAttributes> = {
  id: "1440935637",
  type: "albums",
  href: "/v1/catalog/us/albums/1440935637",
  attributes: {
    name: "Abbey Road",
    artistName: "The Beatles",
    releaseDate: "1969-09-26",
    trackCount: 17
  },
  relationships: {
    tracks: {
      href: "/v1/catalog/us/albums/1440935637/tracks",
      data: [
        { id: "1440935467", type: "songs", href: "..." }
      ]
    }
  }
};
```

## Attributes

The `attributes` object contains resource-specific data. Each resource type has its own attribute schema.

### Common Attributes

Most resources share these attributes:

```typescript
interface CommonAttributes {
  name: string;            // Display name
  url: string;             // Apple Music web URL
  artwork?: Artwork;       // Album/playlist artwork
}

interface Artwork {
  width: number;
  height: number;
  url: string;             // Template URL: replace {w}x{h}
  bgColor?: string;        // Hex color
  textColor1?: string;     // Primary text color
  textColor2?: string;     // Secondary text color
  textColor3?: string;     // Tertiary text color
  textColor4?: string;     // Quaternary text color
}
```

## Relationships

Relationships link resources together.

### Structure

```typescript
interface Relationship {
  href: string;            // Endpoint to fetch related resources
  next?: string;           // Next page URL (for pagination)
  data?: RelatedResource[];
  meta?: {
    total?: number;        // Total count of related resources
  };
}

interface RelatedResource {
  id: string;
  type: string;
  href: string;
}
```

### Example

```json
{
  "relationships": {
    "tracks": {
      "href": "/v1/catalog/us/albums/1440935637/tracks",
      "next": "/v1/catalog/us/albums/1440935637/tracks?offset=25",
      "data": [
        {
          "id": "1440935467",
          "type": "songs",
          "href": "/v1/catalog/us/songs/1440935467"
        }
      ],
      "meta": {
        "total": 17
      }
    }
  }
}
```

### Accessing Relationships

```typescript
interface AlbumResponse {
  data: Resource<AlbumAttributes>[];
}

async function getAlbumWithTracks(
  storefront: string,
  albumId: string,
  token: string
) {
  const url = `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}?include=tracks`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data: AlbumResponse = await response.json();
  const album = data.data[0];

  // Access related tracks
  const trackIds = album.relationships?.tracks?.data?.map(t => t.id) || [];

  return {
    album,
    trackIds
  };
}
```

## Pagination

Paginated responses include navigation links.

### Response with Pagination

```json
{
  "data": [ ... ],
  "next": "/v1/catalog/us/artists/136975/albums?offset=25&limit=25",
  "meta": {
    "total": 150
  }
}
```

### Handling Pagination

```typescript
interface PaginatedResponse<T> {
  data: T[];
  next?: string;
  meta?: {
    total?: number;
  };
}

async function fetchAllPages<T>(
  initialUrl: string,
  token: string
): Promise<T[]> {
  const allResults: T[] = [];
  let nextUrl: string | undefined = initialUrl;

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data: PaginatedResponse<T> = await response.json();

    allResults.push(...data.data);

    // Check if there's a next page
    nextUrl = data.next
      ? `https://api.music.apple.com${data.next}`
      : undefined;
  }

  return allResults;
}

// Usage
const allAlbums = await fetchAllPages<Album>(
  '/v1/catalog/us/artists/136975/albums?limit=100',
  token
);
```

## Metadata

The `meta` object contains additional information.

### Common Metadata

```typescript
interface ResponseMeta {
  total?: number;          // Total number of resources
}
```

### Example

```json
{
  "data": [ ... ],
  "meta": {
    "total": 150
  }
}
```

## Search Response Format

Search responses group results by type.

```typescript
interface SearchResponse {
  results: {
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
  };
}
```

### Example

```json
{
  "results": {
    "artists": {
      "href": "/v1/catalog/us/search?term=Beatles&types=artists",
      "data": [ ... ]
    },
    "albums": {
      "href": "/v1/catalog/us/search?term=Beatles&types=albums",
      "data": [ ... ]
    }
  }
}
```

## Response Parsing

### Type-Safe Response Parser

```typescript
class ResponseParser {
  parseSingle<T>(response: any): T | null {
    if (!response.data) {
      return null;
    }

    return Array.isArray(response.data)
      ? response.data[0] || null
      : response.data;
  }

  parseMultiple<T>(response: any): T[] {
    if (!response.data) {
      return [];
    }

    return Array.isArray(response.data)
      ? response.data
      : [response.data];
  }

  parseSearch<T>(response: any, type: string): T[] {
    return response.results?.[type]?.data || [];
  }

  extractPagination(response: any): {
    next: string | null;
    total: number | null;
  } {
    return {
      next: response.next || null,
      total: response.meta?.total || null
    };
  }
}

// Usage
const parser = new ResponseParser();

const rawResponse = await fetch(url).then(r => r.json());

const album = parser.parseSingle<Album>(rawResponse);
const albums = parser.parseMultiple<Album>(rawResponse);
const { next, total } = parser.extractPagination(rawResponse);
```

## Response Validation

### Validate Response Structure

```typescript
function isValidResource(obj: any): obj is Resource {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.href === 'string' &&
    typeof obj.attributes === 'object'
  );
}

function validateResponse<T>(response: any): Resource<T>[] {
  if (!response.data) {
    throw new Error('Invalid response: missing data field');
  }

  const data = Array.isArray(response.data)
    ? response.data
    : [response.data];

  for (const resource of data) {
    if (!isValidResource(resource)) {
      throw new Error('Invalid resource structure');
    }
  }

  return data;
}

// Usage
try {
  const response = await fetch(url).then(r => r.json());
  const albums = validateResponse<AlbumAttributes>(response);
} catch (error) {
  console.error('Response validation failed:', error);
}
```

## TypeScript Response Types

Complete type definitions for responses:

```typescript
interface ApiResponse<T> {
  data: Resource<T> | Resource<T>[];
  next?: string;
  meta?: ResponseMeta;
}

interface Resource<T> {
  id: string;
  type: string;
  href: string;
  attributes: T;
  relationships?: Record<string, Relationship>;
}

interface Relationship {
  href: string;
  next?: string;
  data?: RelatedResource[];
  meta?: {
    total?: number;
  };
}

interface RelatedResource {
  id: string;
  type: string;
  href: string;
}

interface ResponseMeta {
  total?: number;
  [key: string]: any;
}

interface SearchResponse {
  results: Record<string, {
    href: string;
    next?: string;
    data: Resource<any>[];
  }>;
}
```

## Response Transformation

### Transform API Response to Domain Model

```typescript
interface SimplifiedAlbum {
  id: string;
  name: string;
  artist: string;
  releaseDate: Date;
  trackCount: number;
  artworkUrl: string;
}

function transformAlbum(resource: Resource<AlbumAttributes>): SimplifiedAlbum {
  return {
    id: resource.id,
    name: resource.attributes.name,
    artist: resource.attributes.artistName,
    releaseDate: new Date(resource.attributes.releaseDate),
    trackCount: resource.attributes.trackCount,
    artworkUrl: resource.attributes.artwork.url
      .replace('{w}', '600')
      .replace('{h}', '600')
  };
}

// Usage
const response = await fetch(url).then(r => r.json());
const album = transformAlbum(response.data[0]);

console.log(album.name);
console.log(album.releaseDate.getFullYear());
```

## Best Practices

1. **Type responses**: Use TypeScript interfaces for all responses
2. **Validate structure**: Check response structure before processing
3. **Handle arrays**: Always check if `data` is array or single object
4. **Extract helpers**: Create helper functions for common parsing tasks
5. **Transform data**: Convert API responses to domain models
6. **Handle pagination**: Use `next` links for paginated results
7. **Cache responses**: Store API responses to reduce requests
8. **Check metadata**: Use `meta` for total counts and other info

## Response Caching

```typescript
class ResponseCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl: number;

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    const isExpired = Date.now() - cached.timestamp > this.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Usage
const cache = new ResponseCache(10); // 10 minutes TTL

async function fetchWithCache<T>(url: string, token: string): Promise<T> {
  const cached = cache.get<T>(url);

  if (cached) {
    return cached;
  }

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  cache.set(url, data);

  return data;
}
```

## Related Documentation

- [Request Format](request-format.md): Constructing API requests
- [Error Handling](error-handling.md): Handling error responses
- [TypeScript Usage](typescript.md): TypeScript type definitions
