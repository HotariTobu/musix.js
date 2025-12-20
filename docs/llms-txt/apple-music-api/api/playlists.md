# Playlists API

The Playlists API provides access to Apple Music playlists, including curated playlists, user-created playlists, and playlist tracks.

## Get Playlist

Retrieve detailed information about a specific playlist.

### Endpoint

```
GET /v1/catalog/{storefront}/playlists/{id}
```

### Parameters

- `storefront` (required): Two-letter country code (e.g., 'us', 'jp', 'gb')
- `id` (required): Apple Music catalog playlist ID
- `include` (optional): Relationships to include
  - `tracks`: Include playlist tracks
  - `curator`: Include curator information
- `l` (optional): Language tag for localized content

### Example

```typescript
async function getPlaylist(
  storefront: string,
  playlistId: string,
  developerToken: string
) {
  const url = `https://api.music.apple.com/v1/catalog/${storefront}/playlists/${playlistId}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const data = await response.json();
  return data.data[0];
}

// Usage
const playlist = await getPlaylist('us', 'pl.acc464c750b94302b8806e5fcbe56e17', developerToken);

console.log({
  name: playlist.attributes.name,
  curator: playlist.attributes.curatorName,
  description: playlist.attributes.description?.standard,
  trackCount: playlist.attributes.trackCount,
  lastModified: playlist.attributes.lastModifiedDate
});
```

### Response Structure

```typescript
interface Playlist {
  id: string;
  type: 'playlists';
  href: string;
  attributes: {
    name: string;
    curatorName?: string;
    description?: {
      standard?: string;
      short?: string;
    };
    artwork?: {
      width: number;
      height: number;
      url: string;
    };
    lastModifiedDate?: string;  // ISO 8601 format
    playlistType: 'editorial' | 'user-shared' | 'replay';
    url: string;                 // Apple Music web URL
    trackCount: number;
    isChart: boolean;
  };
  relationships?: {
    tracks?: {
      href: string;
      data: Array<{ id: string; type: 'songs'; href: string }>;
      next?: string;
    };
    curator?: {
      href: string;
      data: Array<{ id: string; type: 'apple-curators'; href: string }>;
    };
  };
}
```

## Get Multiple Playlists

Fetch information for multiple playlists in a single request.

### Endpoint

```
GET /v1/catalog/{storefront}/playlists
```

### Parameters

- `ids` (required): Comma-separated list of playlist IDs (max 100)
- `include` (optional): Relationships to include

### Example

```typescript
async function getPlaylists(
  storefront: string,
  playlistIds: string[],
  developerToken: string
) {
  const url = new URL(`https://api.music.apple.com/v1/catalog/${storefront}/playlists`);
  url.searchParams.set('ids', playlistIds.join(','));

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const data = await response.json();
  return data.data;
}

// Usage
const playlists = await getPlaylists(
  'us',
  [
    'pl.acc464c750b94302b8806e5fcbe56e17',
    'pl.d60efc3b63504815a11dc2a5db531d46'
  ],
  developerToken
);

playlists.forEach(playlist => {
  console.log(`${playlist.attributes.name} (${playlist.attributes.trackCount} tracks)`);
});
```

## Get Playlist Tracks

Retrieve all tracks from a specific playlist.

### Endpoint

```
GET /v1/catalog/{storefront}/playlists/{id}/tracks
```

### Parameters

- `limit` (optional): Maximum number of results (default: 100, max: 300)
- `offset` (optional): Offset for pagination

### Example

```typescript
async function getPlaylistTracks(
  storefront: string,
  playlistId: string,
  developerToken: string,
  limit: number = 100,
  offset: number = 0
) {
  const url = new URL(
    `https://api.music.apple.com/v1/catalog/${storefront}/playlists/${playlistId}/tracks`
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
    tracks: data.data,
    next: data.next
  };
}

// Usage
const result = await getPlaylistTracks(
  'us',
  'pl.acc464c750b94302b8806e5fcbe56e17',
  developerToken
);

result.tracks.forEach((track, index) => {
  console.log(`${index + 1}. ${track.attributes.name} - ${track.attributes.artistName}`);
});
```

## Get Playlist with Tracks

Fetch a playlist with all tracks included.

### Example

```typescript
async function getPlaylistWithTracks(
  storefront: string,
  playlistId: string,
  developerToken: string
) {
  const url = new URL(
    `https://api.music.apple.com/v1/catalog/${storefront}/playlists/${playlistId}`
  );
  url.searchParams.set('include', 'tracks');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const result = await response.json();

  return {
    playlist: result.data[0],
    tracks: result.data[0].relationships?.tracks?.data || []
  };
}

// Usage
const { playlist, tracks } = await getPlaylistWithTracks(
  'us',
  'pl.acc464c750b94302b8806e5fcbe56e17',
  developerToken
);

console.log('Playlist:', playlist.attributes.name);
console.log('Tracks:', tracks.length);
```

## User Library Playlists

Access user's library playlists (requires user token).

### Get User Library Playlists

```typescript
async function getUserLibraryPlaylists(
  developerToken: string,
  userToken: string,
  limit: number = 25,
  offset: number = 0
) {
  const url = new URL('https://api.music.apple.com/v1/me/library/playlists');
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

### Create User Playlist

```typescript
interface CreatePlaylistRequest {
  name: string;
  description?: string;
  tracks?: Array<{ id: string; type: 'songs' }>;
}

async function createUserPlaylist(
  request: CreatePlaylistRequest,
  developerToken: string,
  userToken: string
) {
  const url = 'https://api.music.apple.com/v1/me/library/playlists';

  const body = {
    attributes: {
      name: request.name,
      description: request.description
    },
    relationships: request.tracks
      ? {
          tracks: {
            data: request.tracks
          }
        }
      : undefined
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

  const data = await response.json();
  return data.data[0];
}

// Usage
const newPlaylist = await createUserPlaylist(
  {
    name: 'My Awesome Playlist',
    description: 'A collection of my favorite songs',
    tracks: [
      { id: '1440935467', type: 'songs' },
      { id: '1440935468', type: 'songs' }
    ]
  },
  developerToken,
  userToken
);
```

### Add Tracks to Playlist

```typescript
async function addTracksToPlaylist(
  playlistId: string,
  trackIds: string[],
  developerToken: string,
  userToken: string
) {
  const url = `https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`;

  const body = {
    data: trackIds.map(id => ({ id, type: 'songs' }))
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

  return response.status === 204; // No Content
}

// Usage
await addTracksToPlaylist(
  'p.abc123',
  ['1440935467', '1440935468'],
  developerToken,
  userToken
);
```

### Remove Tracks from Playlist

```typescript
async function removeTracksFromPlaylist(
  playlistId: string,
  trackIds: string[],
  developerToken: string,
  userToken: string
) {
  const url = `https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`;

  const body = {
    data: trackIds.map(id => ({ id, type: 'songs' }))
  };

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${developerToken}`,
      'Music-User-Token': userToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  return response.status === 204; // No Content
}
```

### Delete Playlist

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

## Paginate All Tracks

Helper function to fetch all tracks from a large playlist.

### Example

```typescript
async function* paginatePlaylistTracks(
  storefront: string,
  playlistId: string,
  developerToken: string
) {
  let offset = 0;
  const limit = 300;

  while (true) {
    const result = await getPlaylistTracks(
      storefront,
      playlistId,
      developerToken,
      limit,
      offset
    );

    yield* result.tracks;

    if (!result.next || result.tracks.length < limit) {
      break;
    }

    offset += limit;
  }
}

// Usage - Fetch all tracks
const allTracks = [];
for await (const track of paginatePlaylistTracks(
  'us',
  'pl.acc464c750b94302b8806e5fcbe56e17',
  developerToken
)) {
  allTracks.push(track);
}

console.log(`Total tracks: ${allTracks.length}`);
```

## TypeScript Types

Complete type definitions for playlists:

```typescript
interface Playlist {
  id: string;
  type: 'playlists';
  href: string;
  attributes: PlaylistAttributes;
  relationships?: PlaylistRelationships;
}

interface PlaylistAttributes {
  name: string;
  curatorName?: string;
  description?: {
    standard?: string;
    short?: string;
  };
  artwork?: Artwork;
  lastModifiedDate?: string;
  playlistType: 'editorial' | 'user-shared' | 'replay';
  url: string;
  trackCount: number;
  isChart: boolean;
  playParams?: {
    id: string;
    kind: 'playlist';
    isLibrary?: boolean;
    globalId?: string;
  };
}

interface PlaylistRelationships {
  tracks?: {
    href: string;
    data: Array<{ id: string; type: 'songs'; href: string }>;
    next?: string;
  };
  curator?: {
    href: string;
    data: Array<{ id: string; type: 'apple-curators'; href: string }>;
  };
}

interface LibraryPlaylist extends Playlist {
  type: 'library-playlists';
  attributes: PlaylistAttributes & {
    canEdit: boolean;
    canDelete: boolean;
    hasCatalog: boolean;
    dateAdded?: string;
  };
}
```

## Error Handling

```typescript
async function getPlaylistSafe(
  storefront: string,
  playlistId: string,
  developerToken: string
): Promise<Playlist | null> {
  try {
    const url = `https://api.music.apple.com/v1/catalog/${storefront}/playlists/${playlistId}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${developerToken}`
      }
    });

    if (response.status === 404) {
      console.error('Playlist not found');
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
    console.error('Failed to fetch playlist:', error);
    return null;
  }
}
```

## Best Practices

1. **Use include parameter**: Fetch tracks with playlist in one request when needed
2. **Handle pagination**: Large playlists require multiple requests
3. **Cache catalog playlists**: Editorial playlists change infrequently
4. **Check permissions**: User must own playlist to modify it
5. **Batch operations**: Add/remove multiple tracks in single request
6. **Handle nulls**: Description and artwork may be null

## Related Documentation

- [Tracks API](tracks.md): Get track information
- [Search API](search.md): Search for playlists
- [User Authentication](../auth/user-authentication.md): Managing user playlists
- [Error Handling](../core/error-handling.md): API error handling patterns
