# Authorization Code with PKCE

The Authorization Code flow with PKCE (Proof Key for Code Exchange) is the recommended authentication method for browser-based applications. It securely handles user authorization without exposing client secrets on the client side.

## When to Use

Use Authorization Code with PKCE when:

- Building a browser-based or single-page application
- Need access to user-specific data (library, playlists, playback)
- Cannot securely store a client secret
- Want users to authorize your app with their Spotify account

## Basic Usage

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withUserAuthorization(
  "your-client-id",
  "https://localhost:3000/callback",
  ["user-read-private", "user-read-email", "user-library-read"]
);

// The SDK automatically handles the OAuth redirect flow
const profile = await sdk.currentUser.profile();
console.log(profile.display_name);
```

## Configuration

### 1. Set Up Redirect URI

In your Spotify Developer Dashboard:

1. Go to your app settings
2. Add your redirect URI (e.g., `https://localhost:3000/callback`)
3. Save changes

### 2. Request Appropriate Scopes

Scopes determine what data your app can access:

```typescript
const scopes = [
  "user-read-private",           // Access user profile
  "user-read-email",             // Access user email
  "user-library-read",           // Read saved content
  "user-library-modify",         // Modify saved content
  "playlist-read-private",       // Read private playlists
  "playlist-modify-public",      // Modify public playlists
  "user-read-playback-state",    // Read playback state
  "user-modify-playback-state",  // Control playback
];

const sdk = SpotifyApi.withUserAuthorization(
  "client-id",
  "https://localhost:3000/callback",
  scopes
);
```

## OAuth Flow

The authorization flow works as follows:

1. User initiates authentication
2. SDK redirects to Spotify's authorization page
3. User grants permissions
4. Spotify redirects back to your redirect URI with an authorization code
5. SDK exchanges the code for an access token
6. Token is stored in browser's localStorage

## Token Storage and Refresh

The SDK automatically:

- Stores tokens in localStorage (browser) or in-memory (Node.js)
- Refreshes expired tokens using the refresh token
- Handles token expiration transparently

You don't need to manually manage tokens in most cases.

## Complete Browser Example

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

// Initialize with PKCE
const sdk = SpotifyApi.withUserAuthorization(
  "your-client-id",
  "https://localhost:3000/callback",
  ["user-read-private", "user-library-read"]
);

// Use the SDK - first call will trigger OAuth redirect if not authenticated
async function loadUserData() {
  try {
    // Get user profile
    const profile = await sdk.currentUser.profile();
    console.log("Welcome,", profile.display_name);

    // Get saved tracks
    const savedTracks = await sdk.currentUser.tracks.savedTracks();
    console.log("You have", savedTracks.total, "saved tracks");

  } catch (error) {
    console.error("Authentication or API error:", error);
  }
}

loadUserData();
```

## Mixed Server/Client Authentication

For apps with both frontend and backend:

1. Perform PKCE authorization on the client side
2. Send the access token to your backend server
3. Initialize SDK on server with the token:

```typescript
// On server
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withAccessToken(
  "your-client-id",
  userAccessToken  // Received from client
);
```

This allows your server to make API calls on behalf of the user.

## Available Scopes

Common scopes for user data:

- **User Profile:** `user-read-private`, `user-read-email`
- **Library:** `user-library-read`, `user-library-modify`
- **Playlists:** `playlist-read-private`, `playlist-read-collaborative`, `playlist-modify-public`, `playlist-modify-private`
- **Playback:** `user-read-playback-state`, `user-modify-playback-state`, `user-read-currently-playing`
- **History:** `user-read-recently-played`, `user-top-read`
- **Following:** `user-follow-read`, `user-follow-modify`

See the [official Spotify scopes documentation](https://developer.spotify.com/documentation/web-api/concepts/scopes) for a complete list.

## Security Considerations

- PKCE eliminates the need for client secrets in browser apps
- Tokens are stored in localStorage - be aware of XSS vulnerabilities
- Always use HTTPS in production
- Never share access tokens publicly
- Request only the scopes you need

## Troubleshooting

**Redirect URI Mismatch:**
Ensure the redirect URI in your code exactly matches the one configured in the Spotify Developer Dashboard (including trailing slashes).

**Invalid Scopes:**
Check that all requested scopes are valid. Invalid scopes will cause the authorization to fail.

**Token Expired:**
The SDK should automatically refresh tokens. If you encounter authentication errors, the refresh token may have been revoked. Re-authenticate the user.
