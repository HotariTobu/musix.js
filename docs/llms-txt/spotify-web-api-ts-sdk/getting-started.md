# Getting Started

## Installation

Install the SDK via npm:

```bash
npm install @spotify/web-api-ts-sdk
```

## Requirements

- Node.js 18.0.0 or higher
- Modern browser with fetch API support
- Spotify Developer account and application credentials

## Quick Start

### 1. Create Spotify App

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Note your Client ID and Client Secret
4. Configure Redirect URIs if using user authentication

### 2. Initialize the SDK

**Client Credentials Flow (Server-side):**

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withClientCredentials(
  "your-client-id",
  "your-client-secret"
);
```

**Authorization Code with PKCE (Browser-based):**

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withUserAuthorization(
  "your-client-id",
  "https://localhost:3000/callback",
  ["user-read-private", "user-read-email"]
);
```

### 3. Make API Calls

```typescript
// Search for artists
const results = await sdk.search("The Beatles", ["artist"]);

console.table(results.artists.items.map((item) => ({
  name: item.name,
  followers: item.followers.total,
  popularity: item.popularity
})));

// Get a specific track
const track = await sdk.tracks.get("11dFghVXANMlKmJXsNCbNl");
console.log(track.name, "-", track.artists[0].name);
```

## Package Formats

The SDK is distributed in both formats:

- **ESM (ES Modules):** `dist/mjs/index.js`
- **CommonJS:** `dist/cjs/index.js`
- **TypeScript Definitions:** `dist/mjs/index.d.ts`

Both Node.js and browser environments are fully supported.

## Next Steps

- Explore [authentication methods](auth/client-credentials.md) for different use cases
- Learn about [available API methods](api/tracks.md)
- Understand [error handling](core/error-handling.md) and token refresh behavior
