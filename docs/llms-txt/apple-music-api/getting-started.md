# Getting Started

## Overview

The Apple Music API is a RESTful web service that provides access to Apple Music catalog resources. All requests use HTTPS and return JSON responses following the JSON:API specification.

## Base URL

```
https://api.music.apple.com/v1/
```

All API endpoints are relative to this base URL.

## Requirements

- Apple Developer account (free)
- MusicKit identifier and private key
- Understanding of JWT (JSON Web Tokens)
- HTTPS-capable client (all requests must use HTTPS)

## Quick Start

### 1. Register for MusicKit

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Sign in with your Apple ID
3. Navigate to Certificates, Identifiers & Profiles
4. Create a MusicKit Identifier
5. Generate a MusicKit private key (.p8 file)
6. Note your Team ID and Key ID

### 2. Generate Developer Token

Create a JWT token signed with your private key:

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Load your private key
const privateKey = fs.readFileSync('AuthKey_XXXXXXXXXX.p8', 'utf8');

// Token payload
const payload = {
  iss: 'YOUR_TEAM_ID',        // 10-character Team ID
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (86400 * 180), // 180 days
};

// Token header
const header = {
  alg: 'ES256',
  kid: 'YOUR_KEY_ID'          // 10-character Key ID
};

// Generate token
const token = jwt.sign(payload, privateKey, {
  algorithm: 'ES256',
  header: header
});

console.log('Developer Token:', token);
```

### 3. Make Your First Request

```typescript
const DEVELOPER_TOKEN = 'your_generated_token';
const STOREFRONT = 'us'; // or 'jp', 'gb', etc.

async function searchArtist(term: string) {
  const url = `https://api.music.apple.com/v1/catalog/${STOREFRONT}/search`;
  const params = new URLSearchParams({
    term: term,
    types: 'artists',
    limit: '5'
  });

  const response = await fetch(`${url}?${params}`, {
    headers: {
      'Authorization': `Bearer ${DEVELOPER_TOKEN}`,
      'Music-User-Token': '' // Optional, for user-specific requests
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.results.artists.data;
}

// Usage
searchArtist('The Beatles').then(artists => {
  artists.forEach(artist => {
    console.log(`${artist.attributes.name} - ${artist.attributes.genreNames.join(', ')}`);
  });
});
```

## Common Patterns

### Fetching a Resource

```typescript
async function getAlbum(albumId: string, storefront: string = 'us') {
  const url = `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${DEVELOPER_TOKEN}`
    }
  });

  const data = await response.json();
  return data.data[0];
}
```

### Including Relationships

```typescript
async function getAlbumWithTracks(albumId: string, storefront: string = 'us') {
  const url = `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}`;
  const params = new URLSearchParams({
    include: 'tracks,artists'
  });

  const response = await fetch(`${url}?${params}`, {
    headers: {
      'Authorization': `Bearer ${DEVELOPER_TOKEN}`
    }
  });

  const data = await response.json();
  return data;
}
```

## Response Structure

All responses follow the JSON:API specification:

```json
{
  "data": [
    {
      "id": "1234567890",
      "type": "albums",
      "href": "/v1/catalog/us/albums/1234567890",
      "attributes": {
        "name": "Album Name",
        "artistName": "Artist Name",
        "releaseDate": "2020-01-01",
        "trackCount": 12
      },
      "relationships": {
        "tracks": {
          "href": "/v1/catalog/us/albums/1234567890/tracks",
          "data": [...]
        }
      }
    }
  ]
}
```

## Storefronts

Specify the storefront (country/region) in the URL path:

- `us` - United States
- `jp` - Japan
- `gb` - United Kingdom
- `fr` - France
- `de` - Germany

Example: `https://api.music.apple.com/v1/catalog/us/albums/123`

## Error Handling

```typescript
async function fetchWithErrorHandling(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${DEVELOPER_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData.errors);
      throw new Error(`HTTP ${response.status}: ${errorData.errors[0]?.title}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}
```

## Next Steps

- Learn about [Developer Tokens](auth/developer-tokens.md) in detail
- Explore [API Endpoints](api/albums.md) for specific resources
- Understand [Error Handling](core/error-handling.md) patterns
- Review [TypeScript Usage](core/typescript.md) for type safety
