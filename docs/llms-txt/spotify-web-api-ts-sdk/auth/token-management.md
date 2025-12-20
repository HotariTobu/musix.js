# Token Management

The SDK handles token lifecycle automatically, including refresh, expiration tracking, and caching. Understanding this behavior helps you build robust applications.

## Automatic Token Refresh

The SDK automatically refreshes expired tokens when a refresh token is available. This happens transparently during API calls.

### How It Works

1. SDK makes an API call
2. If the access token is expired, the SDK:
   - Uses the refresh token to request a new access token
   - Updates the cached token
   - Retries the original API call
3. If refresh fails, an authentication error is thrown

### Token Refresh Implementation

Internally, the SDK:

- Calculates token expiry: `Date.now() + (expires_in * 1000)`
- Stores tokens with expiration timestamps
- Checks expiration before each request
- Makes refresh requests to `https://accounts.spotify.com/api/token`

## Token Expiration

Access tokens expire after a certain period (typically 1 hour). The SDK tracks expiration using:

```typescript
// Pseudo-code showing internal logic
const expiryTime = Date.now() + (token.expires_in * 1000);

if (Date.now() >= expiryTime) {
  // Token is expired, refresh it
  await refreshToken();
}
```

Special case: Tokens with `expires` set to `-1` bypass automatic expiration, allowing for perpetual tokens in specific scenarios.

## Caching Strategies

The SDK uses different caching strategies based on environment:

### Browser Environment

- Tokens stored in **localStorage**
- Persists across page reloads
- Shared across tabs from the same origin
- Key format: typically based on client ID and auth method

```typescript
// Automatic in browser
const sdk = SpotifyApi.withUserAuthorization(
  "client-id",
  "redirect-uri",
  ["scopes"]
);
// Tokens automatically cached in localStorage
```

### Node.js Environment

- Tokens stored in **memory**
- Lost when process restarts
- Not shared across processes
- Suitable for server applications

```typescript
// Automatic in Node.js
const sdk = SpotifyApi.withClientCredentials(
  "client-id",
  "client-secret"
);
// Tokens cached in memory during process lifetime
```

## Custom Caching

You can implement custom caching strategies:

```typescript
import { SpotifyApi, ICachingStrategy } from "@spotify/web-api-ts-sdk";

class CustomCacheStrategy implements ICachingStrategy {
  async getOrCreate(key: string, fetch: () => Promise<any>) {
    // Check your custom cache (Redis, database, etc.)
    const cached = await yourCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached;
    }

    // Not in cache or expired, fetch new token
    const fresh = await fetch();
    await yourCache.set(key, fresh);
    return fresh;
  }

  async remove(key: string) {
    await yourCache.delete(key);
  }
}

// Use custom strategy
const sdk = new SpotifyApi(
  authenticator,
  {
    cachingStrategy: new CustomCacheStrategy()
  }
);
```

## Token Lifecycle

### Client Credentials Flow

1. SDK requests token with client ID and secret
2. Spotify returns access token (no refresh token)
3. Token cached with expiration time
4. When expired, SDK requests a new token

### Authorization Code with PKCE

1. User authorizes, SDK receives authorization code
2. SDK exchanges code for access token + refresh token
3. Both tokens cached with expiration time
4. When access token expires, SDK uses refresh token to get new access token
5. Refresh token remains valid (until revoked by user)

## Manual Token Management

In some cases, you may want manual control:

### Get Current Token

```typescript
// Access the internal authenticator
const token = await sdk.getAccessToken();
console.log(token.access_token);
console.log(token.expires);
```

### Force Token Refresh

```typescript
// Logout and re-authenticate
await sdk.logOut();

// Or for user auth, trigger re-authentication
const sdk = SpotifyApi.withUserAuthorization(/* ... */);
```

### Use External Token

If you manage tokens externally:

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withAccessToken(
  "client-id",
  {
    access_token: "your-token",
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "refresh-token" // optional
  }
);
```

## Best Practices

1. **Let the SDK handle refresh:** Don't manually refresh unless necessary
2. **Store refresh tokens securely:** Never expose refresh tokens to untrusted clients
3. **Handle authentication errors:** Be prepared for refresh failures (user revoked access)
4. **Use appropriate caching:** Choose caching strategy based on your environment
5. **Don't share tokens:** Each instance should have its own token

## Error Scenarios

### Refresh Token Expired or Revoked

If a refresh token is invalid:

```typescript
try {
  const data = await sdk.currentUser.profile();
} catch (error) {
  if (error.status === 401) {
    // Token refresh failed - re-authenticate user
    console.log("Please log in again");
    // Redirect to authentication flow
  }
}
```

### No Refresh Token Available

Client Credentials flow doesn't provide refresh tokens. The SDK automatically requests a new access token when needed.

## Token Security

- **Never log tokens:** Avoid printing tokens in logs or console
- **Use HTTPS:** Always transmit tokens over secure connections
- **Minimize scope:** Request only necessary scopes
- **Handle storage securely:** Be aware of XSS risks with localStorage
- **Revoke when done:** Allow users to revoke access in their Spotify account settings

## Monitoring Token Usage

You can hook into token refresh events using custom middleware:

```typescript
const sdk = new SpotifyApi(authenticator, {
  beforeRequest: async (url, request) => {
    console.log("Making request to:", url);
    return request;
  },
  afterRequest: async (url, request, response) => {
    if (url.includes("/api/token")) {
      console.log("Token refreshed");
    }
    return response;
  }
});
```

This allows you to track authentication events and debug token-related issues.
