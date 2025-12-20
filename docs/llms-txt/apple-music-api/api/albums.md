# Albums API

The Albums API provides access to album information from the Apple Music catalog, including metadata, tracks, and relationships.

## Get Album

Retrieve detailed information about a specific album.

### Endpoint

```
GET /v1/catalog/{storefront}/albums/{id}
```

### Parameters

- `storefront` (required): Two-letter country code (e.g., 'us', 'jp', 'gb')
- `id` (required): Apple Music catalog album ID
- `include` (optional): Comma-separated list of relationships to include
  - `artists`: Include artist information
  - `tracks`: Include album tracks
  - `genres`: Include genre information
- `l` (optional): Language tag for localized content (e.g., 'en-US', 'ja-JP')

### Example

```typescript
async function getAlbum(
  storefront: string,
  albumId: string,
  developerToken: string
) {
  const url = `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const data = await response.json();
  return data.data[0];
}

// Usage
const album = await getAlbum('us', '1440935637', developerToken);

console.log({
  name: album.attributes.name,
  artist: album.attributes.artistName,
  releaseDate: album.attributes.releaseDate,
  trackCount: album.attributes.trackCount,
  genres: album.attributes.genreNames
});
```

### Response Structure

```typescript
interface Album {
  id: string;
  type: 'albums';
  href: string;
  attributes: {
    name: string;
    artistName: string;
    artwork: {
      width: number;
      height: number;
      url: string;  // Template URL with {w}x{h}bb.jpg
    };
    releaseDate: string;      // YYYY-MM-DD format
    trackCount: number;
    genreNames: string[];
    recordLabel?: string;
    copyright?: string;
    contentRating?: 'explicit' | 'clean';
    isCompilation: boolean;
    isSingle: boolean;
    isComplete: boolean;
    editorialNotes?: {
      standard?: string;
      short?: string;
    };
    url: string;              // Apple Music web URL
  };
  relationships?: {
    artists: {
      href: string;
      data: Array<{ id: string; type: 'artists'; href: string }>;
    };
    tracks: {
      href: string;
      data: Array<{ id: string; type: 'songs'; href: string }>;
    };
  };
}
```

## Get Multiple Albums

Fetch information for multiple albums in a single request.

### Endpoint

```
GET /v1/catalog/{storefront}/albums
```

### Parameters

- `ids` (required): Comma-separated list of album IDs (max 100)
- `include` (optional): Relationships to include

### Example

```typescript
async function getAlbums(
  storefront: string,
  albumIds: string[],
  developerToken: string
) {
  const url = new URL(`https://api.music.apple.com/v1/catalog/${storefront}/albums`);
  url.searchParams.set('ids', albumIds.join(','));

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const data = await response.json();
  return data.data;
}

// Usage
const albums = await getAlbums(
  'us',
  ['1440935637', '1469577723', '1193701079'],
  developerToken
);

albums.forEach(album => {
  console.log(`${album.attributes.name} - ${album.attributes.artistName}`);
});
```

## Get Album Tracks

Retrieve all tracks from a specific album.

### Endpoint

```
GET /v1/catalog/{storefront}/albums/{id}/tracks
```

### Example

```typescript
async function getAlbumTracks(
  storefront: string,
  albumId: string,
  developerToken: string
) {
  const url = `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}/tracks`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const data = await response.json();
  return data.data;
}

// Usage
const tracks = await getAlbumTracks('us', '1440935637', developerToken);

tracks.forEach((track, index) => {
  console.log(`${index + 1}. ${track.attributes.name} (${formatDuration(track.attributes.durationInMillis)})`);
});

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
```

## Get Album with Relationships

Fetch an album with all related data in one request.

### Example

```typescript
async function getAlbumWithRelationships(
  storefront: string,
  albumId: string,
  developerToken: string
) {
  const url = new URL(
    `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}`
  );
  url.searchParams.set('include', 'artists,tracks');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const result = await response.json();

  return {
    album: result.data[0],
    tracks: result.data[0].relationships?.tracks?.data || [],
    artists: result.data[0].relationships?.artists?.data || []
  };
}

// Usage
const { album, tracks, artists } = await getAlbumWithRelationships(
  'us',
  '1440935637',
  developerToken
);

console.log('Album:', album.attributes.name);
console.log('Artists:', artists.map(a => a.id));
console.log('Tracks:', tracks.length);
```

## Artwork URLs

Apple Music provides templated artwork URLs that can be customized for different sizes.

### Example

```typescript
function getArtworkUrl(
  artworkTemplate: string,
  width: number,
  height: number
): string {
  return artworkTemplate
    .replace('{w}', width.toString())
    .replace('{h}', height.toString());
}

// Usage
const album = await getAlbum('us', '1440935637', developerToken);
const artworkUrl = album.attributes.artwork.url;

// Get different sizes
const thumbnail = getArtworkUrl(artworkUrl, 100, 100);
const medium = getArtworkUrl(artworkUrl, 300, 300);
const large = getArtworkUrl(artworkUrl, 600, 600);
const highRes = getArtworkUrl(artworkUrl, 3000, 3000);

console.log('Thumbnail:', thumbnail);
console.log('High Res:', highRes);
```

## User Library Albums

Access user's library albums (requires user token).

### Get User Library Albums

```typescript
async function getUserLibraryAlbums(
  developerToken: string,
  userToken: string,
  limit: number = 25,
  offset: number = 0
) {
  const url = new URL('https://api.music.apple.com/v1/me/library/albums');
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

### Add Album to Library

```typescript
async function addAlbumToLibrary(
  albumId: string,
  developerToken: string,
  userToken: string
) {
  const url = `https://api.music.apple.com/v1/me/library?ids[albums]=${albumId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${developerToken}`,
      'Music-User-Token': userToken
    }
  });

  return response.status === 202; // Accepted
}
```

### Remove Album from Library

```typescript
async function removeAlbumFromLibrary(
  libraryAlbumId: string,
  developerToken: string,
  userToken: string
) {
  const url = `https://api.music.apple.com/v1/me/library/albums/${libraryAlbumId}`;

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

## TypeScript Types

Complete type definitions for albums:

```typescript
interface Album {
  id: string;
  type: 'albums';
  href: string;
  attributes: AlbumAttributes;
  relationships?: AlbumRelationships;
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
  editorialNotes?: {
    standard?: string;
    short?: string;
  };
  url: string;
  playParams?: {
    id: string;
    kind: 'album';
  };
}

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

interface AlbumRelationships {
  artists?: {
    href: string;
    data: Array<{ id: string; type: 'artists'; href: string }>;
  };
  tracks?: {
    href: string;
    data: Array<{ id: string; type: 'songs'; href: string }>;
  };
  genres?: {
    href: string;
    data: Array<{ id: string; type: 'genres'; href: string }>;
  };
}
```

## Error Handling

```typescript
async function getAlbumSafe(
  storefront: string,
  albumId: string,
  developerToken: string
): Promise<Album | null> {
  try {
    const url = `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${developerToken}`
      }
    });

    if (response.status === 404) {
      console.error('Album not found');
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
    console.error('Failed to fetch album:', error);
    return null;
  }
}
```

## Best Practices

1. **Use include parameter**: Fetch related data in single request to reduce API calls
2. **Cache artwork URLs**: Artwork URLs are stable and can be cached
3. **Handle missing data**: Optional fields may be null or undefined
4. **Batch requests**: Use multiple IDs parameter instead of individual requests
5. **Respect rate limits**: Implement exponential backoff for retries
6. **Validate storefronts**: Ensure storefront codes are valid before requests

## Related Documentation

- [Artists API](artists.md): Get artist information
- [Tracks API](tracks.md): Get track details
- [Search API](search.md): Search for albums
- [Error Handling](../core/error-handling.md): API error handling patterns
