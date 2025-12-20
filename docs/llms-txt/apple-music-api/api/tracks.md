# Tracks API

The Tracks API (Songs) provides access to individual track information from the Apple Music catalog, including metadata, audio features, and relationships.

## Get Track

Retrieve detailed information about a specific track.

### Endpoint

```
GET /v1/catalog/{storefront}/songs/{id}
```

### Parameters

- `storefront` (required): Two-letter country code (e.g., 'us', 'jp', 'gb')
- `id` (required): Apple Music catalog song ID
- `include` (optional): Relationships to include
  - `albums`: Include album information
  - `artists`: Include artist information
  - `genres`: Include genre information
- `l` (optional): Language tag for localized content

### Example

```typescript
async function getTrack(
  storefront: string,
  trackId: string,
  developerToken: string
) {
  const url = `https://api.music.apple.com/v1/catalog/${storefront}/songs/${trackId}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const data = await response.json();
  return data.data[0];
}

// Usage
const track = await getTrack('us', '1440935467', developerToken);

console.log({
  name: track.attributes.name,
  artist: track.attributes.artistName,
  album: track.attributes.albumName,
  duration: `${Math.floor(track.attributes.durationInMillis / 60000)}:${String(Math.floor((track.attributes.durationInMillis % 60000) / 1000)).padStart(2, '0')}`,
  releaseDate: track.attributes.releaseDate
});
```

### Response Structure

```typescript
interface Track {
  id: string;
  type: 'songs';
  href: string;
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    artwork: {
      width: number;
      height: number;
      url: string;
    };
    durationInMillis: number;
    releaseDate: string;      // YYYY-MM-DD format
    genreNames: string[];
    composerName?: string;
    contentRating?: 'explicit' | 'clean';
    discNumber: number;
    trackNumber: number;
    isrc?: string;            // International Standard Recording Code
    url: string;              // Apple Music web URL
    playParams?: {
      id: string;
      kind: 'song';
    };
    previews?: Array<{
      url: string;            // Preview audio URL
    }>;
    hasLyrics?: boolean;
  };
  relationships?: {
    albums?: {
      href: string;
      data: Array<{ id: string; type: 'albums'; href: string }>;
    };
    artists?: {
      href: string;
      data: Array<{ id: string; type: 'artists'; href: string }>;
    };
    genres?: {
      href: string;
      data: Array<{ id: string; type: 'genres'; href: string }>;
    };
  };
}
```

## Get Multiple Tracks

Fetch information for multiple tracks in a single request.

### Endpoint

```
GET /v1/catalog/{storefront}/songs
```

### Parameters

- `ids` (required): Comma-separated list of song IDs (max 300)
- `include` (optional): Relationships to include

### Example

```typescript
async function getTracks(
  storefront: string,
  trackIds: string[],
  developerToken: string
) {
  const url = new URL(`https://api.music.apple.com/v1/catalog/${storefront}/songs`);
  url.searchParams.set('ids', trackIds.join(','));

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const data = await response.json();
  return data.data;
}

// Usage
const tracks = await getTracks(
  'us',
  ['1440935467', '1440935468', '1440935469'],
  developerToken
);

tracks.forEach(track => {
  console.log(`${track.attributes.name} - ${track.attributes.artistName}`);
});
```

## Get Track by ISRC

Retrieve a track using its International Standard Recording Code.

### Endpoint

```
GET /v1/catalog/{storefront}/songs
```

### Example

```typescript
async function getTrackByIsrc(
  storefront: string,
  isrc: string,
  developerToken: string
) {
  const url = new URL(`https://api.music.apple.com/v1/catalog/${storefront}/songs`);
  url.searchParams.set('filter[isrc]', isrc);

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const data = await response.json();
  return data.data[0] || null;
}

// Usage
const track = await getTrackByIsrc('us', 'USRC17607839', developerToken);
if (track) {
  console.log(`Found: ${track.attributes.name}`);
}
```

## Get Track with Relationships

Fetch a track with all related data in one request.

### Example

```typescript
async function getTrackWithRelationships(
  storefront: string,
  trackId: string,
  developerToken: string
) {
  const url = new URL(
    `https://api.music.apple.com/v1/catalog/${storefront}/songs/${trackId}`
  );
  url.searchParams.set('include', 'albums,artists');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${developerToken}`
    }
  });

  const result = await response.json();

  return {
    track: result.data[0],
    albums: result.data[0].relationships?.albums?.data || [],
    artists: result.data[0].relationships?.artists?.data || []
  };
}

// Usage
const { track, albums, artists } = await getTrackWithRelationships(
  'us',
  '1440935467',
  developerToken
);

console.log('Track:', track.attributes.name);
console.log('Albums:', albums.length);
console.log('Artists:', artists.length);
```

## User Library Songs

Access user's library songs (requires user token).

### Get User Library Songs

```typescript
async function getUserLibrarySongs(
  developerToken: string,
  userToken: string,
  limit: number = 25,
  offset: number = 0
) {
  const url = new URL('https://api.music.apple.com/v1/me/library/songs');
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

### Add Song to Library

```typescript
async function addSongToLibrary(
  songId: string,
  developerToken: string,
  userToken: string
) {
  const url = `https://api.music.apple.com/v1/me/library?ids[songs]=${songId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${developerToken}`,
      'Music-User-Token': userToken
    }
  });

  return response.status === 202; // Accepted
}

// Usage
const added = await addSongToLibrary('1440935467', developerToken, userToken);
if (added) {
  console.log('Song added to library');
}
```

### Remove Song from Library

```typescript
async function removeSongFromLibrary(
  librarySongId: string,
  developerToken: string,
  userToken: string
) {
  const url = `https://api.music.apple.com/v1/me/library/songs/${librarySongId}`;

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

## Get Recently Played

Get user's recently played tracks.

### Example

```typescript
async function getRecentlyPlayed(
  developerToken: string,
  userToken: string,
  limit: number = 10
) {
  const url = new URL('https://api.music.apple.com/v1/me/recent/played/tracks');
  url.searchParams.set('limit', limit.toString());

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${developerToken}`,
      'Music-User-Token': userToken
    }
  });

  const data = await response.json();
  return data.data;
}

// Usage
const recent = await getRecentlyPlayed(developerToken, userToken, 20);

recent.forEach((track, index) => {
  console.log(`${index + 1}. ${track.attributes.name} - ${track.attributes.artistName}`);
});
```

## Format Duration

Helper function to format track duration.

### Example

```typescript
function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// Usage
const track = await getTrack('us', '1440935467', developerToken);
console.log(`Duration: ${formatDuration(track.attributes.durationInMillis)}`);
```

## Get Preview URL

Get the preview audio URL for a track.

### Example

```typescript
function getPreviewUrl(track: Track): string | null {
  return track.attributes.previews?.[0]?.url || null;
}

// Usage
const track = await getTrack('us', '1440935467', developerToken);
const previewUrl = getPreviewUrl(track);

if (previewUrl) {
  console.log('Preview available:', previewUrl);
  // Use in an <audio> element
  const audio = new Audio(previewUrl);
  await audio.play();
}
```

## Check Content Rating

Determine if a track has explicit content.

### Example

```typescript
function isExplicit(track: Track): boolean {
  return track.attributes.contentRating === 'explicit';
}

function getContentRatingLabel(track: Track): string {
  switch (track.attributes.contentRating) {
    case 'explicit':
      return 'Explicit';
    case 'clean':
      return 'Clean';
    default:
      return 'Not Rated';
  }
}

// Usage
const track = await getTrack('us', '1440935467', developerToken);
console.log(`Content Rating: ${getContentRatingLabel(track)}`);
```

## TypeScript Types

Complete type definitions for tracks:

```typescript
interface Track {
  id: string;
  type: 'songs';
  href: string;
  attributes: TrackAttributes;
  relationships?: TrackRelationships;
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
  playParams?: {
    id: string;
    kind: 'song';
    catalogId?: string;
    isLibrary?: boolean;
  };
  previews?: Array<{
    url: string;
  }>;
  hasLyrics?: boolean;
}

interface TrackRelationships {
  albums?: {
    href: string;
    data: Array<{ id: string; type: 'albums'; href: string }>;
  };
  artists?: {
    href: string;
    data: Array<{ id: string; type: 'artists'; href: string }>;
  };
  genres?: {
    href: string;
    data: Array<{ id: string; type: 'genres'; href: string }>;
  };
}

interface LibraryTrack extends Track {
  type: 'library-songs';
  attributes: TrackAttributes & {
    dateAdded?: string;
  };
}
```

## Error Handling

```typescript
async function getTrackSafe(
  storefront: string,
  trackId: string,
  developerToken: string
): Promise<Track | null> {
  try {
    const url = `https://api.music.apple.com/v1/catalog/${storefront}/songs/${trackId}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${developerToken}`
      }
    });

    if (response.status === 404) {
      console.error('Track not found');
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
    console.error('Failed to fetch track:', error);
    return null;
  }
}
```

## Best Practices

1. **Batch requests**: Use multiple IDs parameter for multiple tracks
2. **Use ISRC when available**: Provides consistent track identification across regions
3. **Handle missing previews**: Preview URLs may not be available for all tracks
4. **Cache track data**: Track metadata rarely changes
5. **Check playParams**: Verify track is playable in the user's region
6. **Use include parameter**: Fetch related data in one request

## Related Documentation

- [Albums API](albums.md): Get album information
- [Artists API](artists.md): Get artist information
- [Search API](search.md): Search for tracks
- [Playlists API](playlists.md): Get playlist tracks
- [Error Handling](../core/error-handling.md): API error handling patterns
