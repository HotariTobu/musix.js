# Request Format

Apple Music API requests follow consistent patterns for headers, parameters, and URL structure. Understanding these conventions ensures correct API usage.

## Base URL

All requests use the same base URL:

```
https://api.music.apple.com/v1/
```

Endpoints are appended to this base URL:

```
https://api.music.apple.com/v1/catalog/{storefront}/albums/{id}
```

## Request Headers

### Required Headers

Every request must include the `Authorization` header with your developer token:

```typescript
const headers = {
  'Authorization': `Bearer ${developerToken}`
};
```

### User-Specific Requests

For user-specific endpoints, include both developer and user tokens:

```typescript
const headers = {
  'Authorization': `Bearer ${developerToken}`,
  'Music-User-Token': userToken
};
```

### Content-Type Header

For POST, PUT, and PATCH requests with JSON body:

```typescript
const headers = {
  'Authorization': `Bearer ${developerToken}`,
  'Music-User-Token': userToken,
  'Content-Type': 'application/json'
};
```

### Accept-Language Header

Request localized content:

```typescript
const headers = {
  'Authorization': `Bearer ${developerToken}`,
  'Accept-Language': 'ja-JP' // Japanese localization
};
```

## URL Structure

### Catalog Endpoints

Access public catalog resources:

```
GET /v1/catalog/{storefront}/{resource-type}/{id}
GET /v1/catalog/{storefront}/{resource-type}
```

Examples:

```
GET /v1/catalog/us/albums/1440935637
GET /v1/catalog/jp/artists/136975
GET /v1/catalog/gb/playlists/pl.acc464c750b94302b8806e5fcbe56e17
```

### User Library Endpoints

Access user's library (requires user token):

```
GET /v1/me/library/{resource-type}
GET /v1/me/library/{resource-type}/{id}
```

Examples:

```
GET /v1/me/library/albums
GET /v1/me/library/playlists/p.abc123
```

### Relationship Endpoints

Access related resources:

```
GET /v1/catalog/{storefront}/{resource-type}/{id}/{relationship}
```

Examples:

```
GET /v1/catalog/us/albums/1440935637/tracks
GET /v1/catalog/us/artists/136975/albums
```

## Query Parameters

### Common Parameters

#### include

Include related resources in response:

```typescript
const url = new URL('https://api.music.apple.com/v1/catalog/us/albums/123');
url.searchParams.set('include', 'artists,tracks');
// Result: /v1/catalog/us/albums/123?include=artists,tracks
```

#### ids

Fetch multiple resources:

```typescript
url.searchParams.set('ids', '123,456,789');
// Result: ?ids=123,456,789
```

#### limit

Control number of results:

```typescript
url.searchParams.set('limit', '25');
// Result: ?limit=25
```

#### offset

Pagination offset:

```typescript
url.searchParams.set('offset', '50');
// Result: ?offset=50
```

#### l (language)

Request localized content:

```typescript
url.searchParams.set('l', 'ja-JP');
// Result: ?l=ja-JP
```

### Search Parameters

#### term

Search query:

```typescript
url.searchParams.set('term', 'The Beatles');
// Result: ?term=The%20Beatles
```

#### types

Resource types to search:

```typescript
url.searchParams.set('types', 'songs,albums,artists');
// Result: ?types=songs,albums,artists
```

### Filter Parameters

Filter resources by attribute:

```typescript
url.searchParams.set('filter[isrc]', 'USRC17607839');
// Result: ?filter[isrc]=USRC17607839
```

## Building Requests

### GET Request Example

```typescript
async function getAlbum(
  storefront: string,
  albumId: string,
  developerToken: string,
  options?: {
    include?: string[];
    language?: string;
  }
) {
  const url = new URL(
    `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}`
  );

  if (options?.include) {
    url.searchParams.set('include', options.include.join(','));
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${developerToken}`
  };

  if (options?.language) {
    headers['Accept-Language'] = options.language;
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers
  });

  return await response.json();
}

// Usage
const album = await getAlbum('us', '1440935637', token, {
  include: ['artists', 'tracks'],
  language: 'ja-JP'
});
```

### POST Request Example

```typescript
async function createPlaylist(
  name: string,
  description: string,
  developerToken: string,
  userToken: string
) {
  const url = 'https://api.music.apple.com/v1/me/library/playlists';

  const body = {
    attributes: {
      name,
      description
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${developerToken}`,
      'Music-User-Token': userToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  return await response.json();
}
```

### DELETE Request Example

```typescript
async function deletePlaylist(
  playlistId: string,
  developerToken: string,
  userToken: string
) {
  const url = `https://api.music.apple.com/v1/me/library/playlists/${playlistId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${developerToken}`,
      'Music-User-Token': userToken
    }
  });

  return response.status === 204; // No Content
}
```

## Request Builder

Reusable request builder class:

```typescript
class AppleMusicRequest {
  private baseUrl = 'https://api.music.apple.com/v1';
  private headers: Record<string, string> = {};
  private params = new URLSearchParams();

  constructor(
    private developerToken: string,
    private userToken?: string
  ) {
    this.headers['Authorization'] = `Bearer ${developerToken}`;

    if (userToken) {
      this.headers['Music-User-Token'] = userToken;
    }
  }

  catalog(storefront: string) {
    return new CatalogRequestBuilder(
      this.baseUrl,
      storefront,
      this.headers
    );
  }

  me() {
    if (!this.userToken) {
      throw new Error('User token required for /me endpoints');
    }

    return new UserLibraryRequestBuilder(
      this.baseUrl,
      this.headers
    );
  }
}

class CatalogRequestBuilder {
  constructor(
    private baseUrl: string,
    private storefront: string,
    private headers: Record<string, string>
  ) {}

  albums(id?: string) {
    const path = id
      ? `${this.baseUrl}/catalog/${this.storefront}/albums/${id}`
      : `${this.baseUrl}/catalog/${this.storefront}/albums`;

    return new ResourceRequest(path, this.headers);
  }

  artists(id?: string) {
    const path = id
      ? `${this.baseUrl}/catalog/${this.storefront}/artists/${id}`
      : `${this.baseUrl}/catalog/${this.storefront}/artists`;

    return new ResourceRequest(path, this.headers);
  }

  songs(id?: string) {
    const path = id
      ? `${this.baseUrl}/catalog/${this.storefront}/songs/${id}`
      : `${this.baseUrl}/catalog/${this.storefront}/songs`;

    return new ResourceRequest(path, this.headers);
  }

  search() {
    return new SearchRequestBuilder(
      `${this.baseUrl}/catalog/${this.storefront}/search`,
      this.headers
    );
  }
}

class ResourceRequest {
  private params = new URLSearchParams();

  constructor(
    private url: string,
    private headers: Record<string, string>
  ) {}

  include(...relationships: string[]) {
    this.params.set('include', relationships.join(','));
    return this;
  }

  limit(limit: number) {
    this.params.set('limit', limit.toString());
    return this;
  }

  offset(offset: number) {
    this.params.set('offset', offset.toString());
    return this;
  }

  language(lang: string) {
    this.headers['Accept-Language'] = lang;
    return this;
  }

  async get<T>(): Promise<T> {
    const url = this.buildUrl();

    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }

  private buildUrl(): string {
    const params = this.params.toString();
    return params ? `${this.url}?${params}` : this.url;
  }
}

// Usage
const api = new AppleMusicRequest(developerToken, userToken);

// Catalog request
const album = await api
  .catalog('us')
  .albums('1440935637')
  .include('artists', 'tracks')
  .language('ja-JP')
  .get();

// Search request
const results = await api
  .catalog('us')
  .search()
  .term('Beatles')
  .types(['songs', 'albums'])
  .limit(10)
  .get();
```

## Best Practices

1. **Use URL builders**: Construct URLs programmatically to avoid errors
2. **Encode parameters**: Always URL-encode query parameters
3. **Validate storefronts**: Check storefront codes before requests
4. **Reuse headers**: Create header objects once and reuse
5. **Handle optional params**: Only include parameters when needed
6. **Use TypeScript**: Type request/response for compile-time safety
7. **Set timeouts**: Implement request timeouts to prevent hanging
8. **Log requests**: Log URLs and headers for debugging (exclude tokens)

## Request Logging

```typescript
class RequestLogger {
  logRequest(url: string, options: RequestInit): void {
    const headers = { ...options.headers };

    // Redact sensitive headers
    if ('Authorization' in headers) {
      headers['Authorization'] = 'Bearer ***REDACTED***';
    }
    if ('Music-User-Token' in headers) {
      headers['Music-User-Token'] = '***REDACTED***';
    }

    console.log('API Request:', {
      method: options.method || 'GET',
      url,
      headers,
      body: options.body
    });
  }

  logResponse(url: string, status: number, data?: any): void {
    console.log('API Response:', {
      url,
      status,
      dataSize: JSON.stringify(data).length
    });
  }
}

// Usage
const logger = new RequestLogger();

async function fetchWithLogging(url: string, options: RequestInit) {
  logger.logRequest(url, options);

  const response = await fetch(url, options);
  const data = await response.json();

  logger.logResponse(url, response.status, data);

  return data;
}
```

## Related Documentation

- [Response Format](response-format.md): Understanding API responses
- [Error Handling](error-handling.md): Handling request errors
- [Developer Tokens](../auth/developer-tokens.md): Authentication headers
