# Client Credentials Flow

The Client Credentials flow is designed for server-side applications where you have both Client ID and Client Secret available. This flow does not provide access to user-specific data but is ideal for accessing public catalog information.

## When to Use

Use Client Credentials Flow when:

- Running on a server or backend service
- Accessing public catalog data (tracks, albums, artists, playlists)
- No user-specific data is needed (no access to user's library, playback state, etc.)
- You can securely store the client secret

## Basic Usage

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withClientCredentials(
  "your-client-id",
  "your-client-secret"
);

// Now you can make API calls
const track = await sdk.tracks.get("11dFghVXANMlKmJXsNCbNl");
```

## With Optional Scopes

While Client Credentials typically doesn't require scopes (since it's not user-specific), you can specify them if needed:

```typescript
const sdk = SpotifyApi.withClientCredentials(
  "your-client-id",
  "your-client-secret",
  ["scope1", "scope2"]  // Optional
);
```

## What You Can Access

With Client Credentials Flow, you can:

- Search for tracks, albums, artists, and playlists
- Get detailed information about tracks, albums, artists
- Retrieve audio features and analysis
- Browse categories and new releases
- Get recommendations

## What You Cannot Access

Client Credentials does NOT provide access to:

- User's library (saved tracks, albums, playlists)
- User's playback state or player controls
- User's currently playing track
- User profile information
- Following/follower information

## Security Considerations

**Never expose your client secret in client-side code.** The Client Credentials flow should only be used in secure server environments where the secret can be kept confidential.

For browser-based applications requiring user data, use [Authorization Code with PKCE](authorization-code-pkce.md) instead.

## Token Management

The SDK automatically handles token refresh when using Client Credentials flow. Tokens are:

- Cached automatically (in-memory for Node.js)
- Refreshed automatically when expired
- Valid for a limited time (typically 1 hour)

You don't need to manually manage token expiration or renewal.

## Example: Complete Server Setup

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

// Initialize SDK
const sdk = SpotifyApi.withClientCredentials(
  process.env.SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!
);

// Use in your application
async function getTrackInfo(trackId: string) {
  try {
    const track = await sdk.tracks.get(trackId);
    return {
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      duration: track.duration_ms,
    };
  } catch (error) {
    console.error("Failed to fetch track:", error);
    throw error;
  }
}
```

## Error Handling

See [Error Handling](../core/error-handling.md) for details on handling authentication errors, rate limits, and network issues.
