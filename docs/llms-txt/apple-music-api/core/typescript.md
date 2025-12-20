# TypeScript Usage

TypeScript provides type safety when working with the Apple Music API. This guide covers type definitions, best practices, and common patterns.

## Core Type Definitions

### Resource Types

```typescript
interface Resource<T = any> {
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
```

### Album Types

```typescript
interface Album extends Resource<AlbumAttributes> {
  type: 'albums';
}

interface AlbumAttributes {
  name: string;
  artistName: string;
  artwork: Artwork;
  releaseDate: string;
  trackCount: number;
  genreNames: string[];
  recordLabel?: string;
  copyright?: string;
  contentRating?: 'explicit' | 'clean';
  isCompilation: boolean;
  isSingle: boolean;
  isComplete: boolean;
  editorialNotes?: EditorialNotes;
  url: string;
  playParams?: PlayParameters;
}
```

### Artist Types

```typescript
interface Artist extends Resource<ArtistAttributes> {
  type: 'artists';
}

interface ArtistAttributes {
  name: string;
  genreNames: string[];
  url: string;
  editorialNotes?: EditorialNotes;
}
```

### Track Types

```typescript
interface Track extends Resource<TrackAttributes> {
  type: 'songs';
}

interface TrackAttributes {
  name: string;
  artistName: string;
  albumName: string;
  artwork: Artwork;
  durationInMillis: number;
  releaseDate: string;
  genreNames: string[];
  composerName?: string;
  contentRating?: 'explicit' | 'clean';
  discNumber: number;
  trackNumber: number;
  isrc?: string;
  url: string;
  playParams?: PlayParameters;
  previews?: Preview[];
  hasLyrics?: boolean;
}
```

### Playlist Types

```typescript
interface Playlist extends Resource<PlaylistAttributes> {
  type: 'playlists';
}

interface PlaylistAttributes {
  name: string;
  curatorName?: string;
  description?: EditorialNotes;
  artwork?: Artwork;
  lastModifiedDate?: string;
  playlistType: 'editorial' | 'user-shared' | 'replay';
  url: string;
  trackCount: number;
  isChart: boolean;
  playParams?: PlayParameters;
}
```

### Common Shared Types

```typescript
interface Artwork {
  width: number;
  height: number;
  url: string;
  bgColor?: string;
  textColor1?: string;
  textColor2?: string;
  textColor3?: string;
  textColor4?: string;
}

interface EditorialNotes {
  standard?: string;
  short?: string;
}

interface PlayParameters {
  id: string;
  kind: 'song' | 'album' | 'playlist';
  catalogId?: string;
  isLibrary?: boolean;
  globalId?: string;
}

interface Preview {
  url: string;
}
```

## Response Types

### Single Resource Response

```typescript
interface SingleResourceResponse<T> {
  data: Resource<T>;
  next?: string;
  meta?: ResponseMeta;
}

// Usage
async function getAlbum(
  storefront: string,
  id: string,
  token: string
): Promise<Album> {
  const response = await fetch(
    `https://api.music.apple.com/v1/catalog/${storefront}/albums/${id}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  const data: SingleResourceResponse<AlbumAttributes> = await response.json();
  return data.data as Album;
}
```

### Multiple Resource Response

```typescript
interface MultipleResourceResponse<T> {
  data: Resource<T>[];
  next?: string;
  meta?: ResponseMeta;
}

// Usage
async function getAlbums(
  storefront: string,
  ids: string[],
  token: string
): Promise<Album[]> {
  const url = new URL(`https://api.music.apple.com/v1/catalog/${storefront}/albums`);
  url.searchParams.set('ids', ids.join(','));

  const response = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data: MultipleResourceResponse<AlbumAttributes> = await response.json();
  return data.data as Album[];
}
```

### Search Response

```typescript
interface SearchResponse {
  results: {
    artists?: SearchResultSet<Artist>;
    albums?: SearchResultSet<Album>;
    songs?: SearchResultSet<Track>;
    playlists?: SearchResultSet<Playlist>;
  };
}

interface SearchResultSet<T> {
  href: string;
  next?: string;
  data: T[];
}

// Usage
async function search(
  storefront: string,
  term: string,
  token: string
): Promise<SearchResponse> {
  const url = new URL(`https://api.music.apple.com/v1/catalog/${storefront}/search`);
  url.searchParams.set('term', term);
  url.searchParams.set('types', 'songs,albums,artists');

  const response = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return await response.json();
}
```

## Type Guards

Use type guards to safely narrow types:

```typescript
function isAlbum(resource: Resource): resource is Album {
  return resource.type === 'albums';
}

function isArtist(resource: Resource): resource is Artist {
  return resource.type === 'artists';
}

function isTrack(resource: Resource): resource is Track {
  return resource.type === 'songs';
}

function isPlaylist(resource: Resource): resource is Playlist {
  return resource.type === 'playlists';
}

// Usage
function processResource(resource: Resource): void {
  if (isAlbum(resource)) {
    console.log('Album:', resource.attributes.name);
    console.log('Track count:', resource.attributes.trackCount);
  } else if (isArtist(resource)) {
    console.log('Artist:', resource.attributes.name);
    console.log('Genres:', resource.attributes.genreNames.join(', '));
  } else if (isTrack(resource)) {
    console.log('Track:', resource.attributes.name);
    console.log('Duration:', resource.attributes.durationInMillis);
  }
}
```

## Generic API Client

Type-safe API client with generics:

```typescript
class AppleMusicClient {
  constructor(
    private developerToken: string,
    private userToken?: string
  ) {}

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(
      `https://api.music.apple.com/v1${endpoint}`,
      {
        headers: this.getHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }

  async post<T, R>(endpoint: string, body: T): Promise<R> {
    const response = await fetch(
      `https://api.music.apple.com/v1${endpoint}`,
      {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }

  async delete(endpoint: string): Promise<boolean> {
    const response = await fetch(
      `https://api.music.apple.com/v1${endpoint}`,
      {
        method: 'DELETE',
        headers: this.getHeaders()
      }
    );

    return response.status === 204;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.developerToken}`
    };

    if (this.userToken) {
      headers['Music-User-Token'] = this.userToken;
    }

    return headers;
  }
}

// Usage with type inference
const client = new AppleMusicClient(developerToken);

const albumResponse = await client.get<SingleResourceResponse<AlbumAttributes>>(
  '/catalog/us/albums/1440935637'
);

const album: Album = albumResponse.data as Album;
```

## Request Options Types

Type-safe request options:

```typescript
interface GetResourceOptions {
  include?: string[];
  language?: string;
}

interface SearchOptions {
  term: string;
  types: Array<'songs' | 'albums' | 'artists' | 'playlists'>;
  limit?: number;
  offset?: number;
}

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

// Usage
async function getAlbumWithOptions(
  storefront: string,
  id: string,
  token: string,
  options?: GetResourceOptions
): Promise<Album> {
  const url = new URL(
    `https://api.music.apple.com/v1/catalog/${storefront}/albums/${id}`
  );

  if (options?.include) {
    url.searchParams.set('include', options.include.join(','));
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`
  };

  if (options?.language) {
    headers['Accept-Language'] = options.language;
  }

  const response = await fetch(url.toString(), { headers });
  const data: SingleResourceResponse<AlbumAttributes> = await response.json();

  return data.data as Album;
}

// Type-safe function call
const album = await getAlbumWithOptions('us', '123', token, {
  include: ['tracks', 'artists'],
  language: 'ja-JP'
});
```

## Utility Types

Useful utility types for working with the API:

```typescript
// Extract just the attributes from a resource
type AttributesOf<T extends Resource> = T extends Resource<infer A> ? A : never;

// Create a partial resource (for updates)
type PartialResource<T extends Resource> = {
  id: T['id'];
  type: T['type'];
  attributes: Partial<AttributesOf<T>>;
};

// Library resource types
type LibraryResource<T extends Resource> = T & {
  type: `library-${T['type']}`;
};

// Extract resource by type string
type ResourceByType<T extends string> =
  T extends 'albums' ? Album :
  T extends 'artists' ? Artist :
  T extends 'songs' ? Track :
  T extends 'playlists' ? Playlist :
  never;

// Usage
function getResourceAttributes<T extends Resource>(
  resource: T
): AttributesOf<T> {
  return resource.attributes;
}

const album: Album = { /* ... */ };
const attrs = getResourceAttributes(album); // Type: AlbumAttributes
```

## Async Iterator Types

Type-safe pagination with async iterators:

```typescript
async function* paginateResources<T extends Resource>(
  initialUrl: string,
  token: string
): AsyncGenerator<T, void, undefined> {
  let nextUrl: string | undefined = initialUrl;

  while (nextUrl) {
    const response = await fetch(
      `https://api.music.apple.com${nextUrl}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const data: MultipleResourceResponse<any> = await response.json();

    for (const resource of data.data) {
      yield resource as T;
    }

    nextUrl = data.next;
  }
}

// Usage with type inference
const albums: Album[] = [];

for await (const album of paginateResources<Album>(
  '/catalog/us/artists/136975/albums',
  token
)) {
  albums.push(album);
}
```

## Error Types

Type-safe error handling:

```typescript
interface ApiError {
  id: string;
  status: string;
  code: string;
  title: string;
  detail: string;
  source?: {
    parameter?: string;
    pointer?: string;
  };
}

interface ErrorResponse {
  errors: ApiError[];
}

class AppleMusicApiError extends Error {
  constructor(
    public readonly errors: ApiError[],
    public readonly status: number
  ) {
    super(errors[0]?.title || 'API Error');
    this.name = 'AppleMusicApiError';
  }

  get firstError(): ApiError {
    return this.errors[0];
  }

  hasErrorCode(code: string): boolean {
    return this.errors.some(e => e.code === code);
  }
}

// Usage
async function fetchWithTypedErrors<T>(
  url: string,
  token: string
): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json();
    throw new AppleMusicApiError(errorData.errors, response.status);
  }

  return await response.json();
}
```

## Strict Type Checking

Enable strict TypeScript settings in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Best Practices

1. **Define all types**: Create interfaces for all API responses
2. **Use generics**: Leverage TypeScript generics for reusable code
3. **Type guards**: Use type guards to narrow union types
4. **Strict mode**: Enable strict TypeScript compiler options
5. **Avoid any**: Never use `any` type, use `unknown` if needed
6. **Null checks**: Always check for optional/nullable fields
7. **Const assertions**: Use `as const` for literal types
8. **Utility types**: Use TypeScript utility types (Partial, Pick, Omit)

## Complete Example

Fully typed Apple Music client:

```typescript
class TypedAppleMusicClient {
  constructor(
    private readonly developerToken: string,
    private readonly userToken?: string
  ) {}

  async getAlbum(
    storefront: string,
    id: string,
    options?: GetResourceOptions
  ): Promise<Album> {
    const response = await this.fetch<SingleResourceResponse<AlbumAttributes>>(
      this.buildUrl(`/catalog/${storefront}/albums/${id}`, options)
    );

    return response.data as Album;
  }

  async getArtist(
    storefront: string,
    id: string,
    options?: GetResourceOptions
  ): Promise<Artist> {
    const response = await this.fetch<SingleResourceResponse<ArtistAttributes>>(
      this.buildUrl(`/catalog/${storefront}/artists/${id}`, options)
    );

    return response.data as Artist;
  }

  async search(
    storefront: string,
    options: SearchOptions
  ): Promise<SearchResponse> {
    const params = new URLSearchParams({
      term: options.term,
      types: options.types.join(',')
    });

    if (options.limit) params.set('limit', options.limit.toString());
    if (options.offset) params.set('offset', options.offset.toString());

    return this.fetch<SearchResponse>(
      `/catalog/${storefront}/search?${params}`
    );
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(
      `https://api.music.apple.com/v1${endpoint}`,
      {
        headers: {
          'Authorization': `Bearer ${this.developerToken}`,
          ...(this.userToken && { 'Music-User-Token': this.userToken })
        }
      }
    );

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new AppleMusicApiError(errorData.errors, response.status);
    }

    return await response.json();
  }

  private buildUrl(path: string, options?: GetResourceOptions): string {
    if (!options) return path;

    const params = new URLSearchParams();
    if (options.include) {
      params.set('include', options.include.join(','));
    }

    const query = params.toString();
    return query ? `${path}?${query}` : path;
  }
}

// Usage
const client = new TypedAppleMusicClient(developerToken);

const album = await client.getAlbum('us', '1440935637', {
  include: ['tracks', 'artists']
});

console.log(album.attributes.name); // Type-safe!
console.log(album.attributes.trackCount); // Type-safe!
```

## Related Documentation

- [Response Format](response-format.md): API response structure
- [Request Format](request-format.md): API request structure
- [Error Handling](error-handling.md): Error types and handling
