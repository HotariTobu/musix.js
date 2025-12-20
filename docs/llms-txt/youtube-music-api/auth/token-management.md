# Token Management

Comprehensive guide to managing OAuth 2.0 access tokens, refresh tokens, expiration, and revocation for the YouTube Data API.

## Token Types

### Access Token

- Short-lived token for API requests
- Expires after approximately 1 hour (3600 seconds)
- Included in Authorization header for API calls
- Cannot be renewed directly (must use refresh token)

### Refresh Token

- Long-lived token for obtaining new access tokens
- Only provided in server-side OAuth flow with `access_type=offline`
- Not provided in client-side (implicit) flow
- Remains valid until revoked or expired (no fixed expiration)

## Token Response Structure

```typescript
interface TokenResponse {
  access_token: string;      // Use for API requests
  refresh_token?: string;    // Only in server-side flow
  expires_in: number;        // Seconds until expiration (typically 3600)
  scope: string;             // Granted scopes (space-delimited)
  token_type: string;        // Always "Bearer"
}
```

## Storing Tokens Securely

### Server-Side Storage

```typescript
interface StoredTokens {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;        // Unix timestamp
  scopes: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Example with database
class TokenStore {
  async saveTokens(userId: string, tokens: TokenResponse): Promise<void> {
    const expiresAt = Date.now() + (tokens.expires_in * 1000);

    await db.tokens.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: this.encrypt(tokens.access_token),
        refreshToken: this.encrypt(tokens.refresh_token!),
        expiresAt,
        scopes: tokens.scope.split(" "),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      update: {
        accessToken: this.encrypt(tokens.access_token),
        expiresAt,
        updatedAt: new Date()
      }
    });
  }

  async getTokens(userId: string): Promise<StoredTokens | null> {
    const tokens = await db.tokens.findUnique({ where: { userId } });
    if (!tokens) return null;

    return {
      ...tokens,
      accessToken: this.decrypt(tokens.accessToken),
      refreshToken: this.decrypt(tokens.refreshToken)
    };
  }

  private encrypt(value: string): string {
    // Use encryption library (e.g., crypto-js, node:crypto)
    return encryptionService.encrypt(value);
  }

  private decrypt(value: string): string {
    return encryptionService.decrypt(value);
  }
}
```

### Client-Side Storage

```typescript
class ClientTokenStore {
  private static ACCESS_TOKEN_KEY = "yt_access_token";
  private static EXPIRES_AT_KEY = "yt_token_expires";

  static saveToken(token: string, expiresIn: number): void {
    const expiresAt = Date.now() + (expiresIn * 1000);
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    sessionStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString());
  }

  static getToken(): string | null {
    const token = sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
    const expiresAt = sessionStorage.getItem(this.EXPIRES_AT_KEY);

    if (!token || !expiresAt) return null;

    if (Date.now() >= parseInt(expiresAt)) {
      this.clearTokens();
      return null;
    }

    return token;
  }

  static clearTokens(): void {
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  static isValid(): boolean {
    return this.getToken() !== null;
  }
}
```

## Automatic Token Refresh

### Proactive Refresh (Recommended)

Refresh tokens before they expire to avoid interruptions:

```typescript
class TokenManager {
  private config: OAuthConfig;
  private tokens: StoredTokens | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  async getValidAccessToken(): Promise<string> {
    if (!this.tokens) {
      throw new Error("No tokens available - authentication required");
    }

    // Refresh if token expires within 5 minutes
    const bufferTime = 5 * 60 * 1000;
    if (Date.now() >= this.tokens.expiresAt - bufferTime) {
      await this.refreshAccessToken();
    }

    return this.tokens.accessToken;
  }

  private async refreshAccessToken(): Promise<void> {
    // Prevent concurrent refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<void> {
    if (!this.tokens?.refreshToken) {
      throw new Error("No refresh token available");
    }

    const params = new URLSearchParams({
      refresh_token: this.tokens.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: "refresh_token"
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Token refresh failed: ${error.error_description}`);
    }

    const newTokens = await response.json();

    // Update tokens (refresh_token not included in response)
    this.tokens.accessToken = newTokens.access_token;
    this.tokens.expiresAt = Date.now() + (newTokens.expires_in * 1000);

    // Persist to database
    await this.saveTokens(this.tokens);
  }
}
```

### Reactive Refresh (On 401 Error)

Refresh only when receiving 401 Unauthorized:

```typescript
class APIClient {
  private tokenManager: TokenManager;

  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const accessToken = await this.tokenManager.getValidAccessToken();

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/${endpoint}`,
      {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    // Handle token expiration
    if (response.status === 401) {
      try {
        // Refresh token and retry
        await this.tokenManager.forceRefresh();
        const newToken = await this.tokenManager.getValidAccessToken();

        const retryResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/${endpoint}`,
          {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`
            }
          }
        );

        if (!retryResponse.ok) {
          throw new Error(`Request failed: ${retryResponse.status}`);
        }

        return retryResponse.json();
      } catch (error) {
        throw new Error("Authentication failed - please log in again");
      }
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  }
}
```

## Token Expiration Handling

### Check Token Validity

```typescript
interface TokenStatus {
  isValid: boolean;
  expiresIn: number;      // Milliseconds until expiration
  needsRefresh: boolean;  // True if expiring soon
}

function checkTokenStatus(expiresAt: number): TokenStatus {
  const now = Date.now();
  const expiresIn = expiresAt - now;
  const bufferTime = 5 * 60 * 1000; // 5 minutes

  return {
    isValid: expiresIn > 0,
    expiresIn: Math.max(0, expiresIn),
    needsRefresh: expiresIn < bufferTime
  };
}

// Usage
const status = checkTokenStatus(tokens.expiresAt);
if (!status.isValid) {
  await refreshToken();
} else if (status.needsRefresh) {
  refreshToken().catch(console.error); // Refresh in background
}
```

### Auto-Refresh Timer

```typescript
class TokenRefreshScheduler {
  private timerId: NodeJS.Timeout | null = null;
  private tokenManager: TokenManager;

  constructor(tokenManager: TokenManager) {
    this.tokenManager = tokenManager;
  }

  scheduleRefresh(expiresAt: number): void {
    this.cancelRefresh();

    // Schedule refresh 5 minutes before expiration
    const refreshTime = expiresAt - Date.now() - 5 * 60 * 1000;

    if (refreshTime > 0) {
      this.timerId = setTimeout(async () => {
        try {
          await this.tokenManager.refreshAccessToken();
          console.log("Token refreshed automatically");
        } catch (error) {
          console.error("Auto-refresh failed:", error);
        }
      }, refreshTime);
    }
  }

  cancelRefresh(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}
```

## Token Revocation

### Revoke Single Token

```typescript
async function revokeToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/revoke?token=${token}`,
      { method: "POST" }
    );

    return response.ok;
  } catch (error) {
    console.error("Token revocation failed:", error);
    return false;
  }
}

// Usage on logout
async function logout(userId: string) {
  const tokens = await tokenStore.getTokens(userId);

  if (tokens?.accessToken) {
    await revokeToken(tokens.accessToken);
  }

  await tokenStore.deleteTokens(userId);
}
```

### Revoke All Tokens for User

```typescript
async function revokeAllTokens(userId: string): Promise<void> {
  const tokens = await tokenStore.getTokens(userId);

  if (!tokens) return;

  // Revoke access token
  if (tokens.accessToken) {
    await revokeToken(tokens.accessToken);
  }

  // Revoke refresh token (this invalidates all associated tokens)
  if (tokens.refreshToken) {
    await revokeToken(tokens.refreshToken);
  }

  // Remove from database
  await tokenStore.deleteTokens(userId);
}
```

## Error Handling

### Common Token Errors

```typescript
enum TokenError {
  EXPIRED = "token_expired",
  INVALID = "invalid_token",
  REFRESH_FAILED = "refresh_failed",
  NOT_FOUND = "token_not_found"
}

class TokenException extends Error {
  constructor(
    public code: TokenError,
    message: string
  ) {
    super(message);
    this.name = "TokenException";
  }
}

async function handleTokenError(error: any): Promise<void> {
  if (error.message?.includes("invalid_grant")) {
    throw new TokenException(
      TokenError.REFRESH_FAILED,
      "Refresh token expired or revoked - re-authentication required"
    );
  } else if (error.message?.includes("401")) {
    throw new TokenException(
      TokenError.EXPIRED,
      "Access token expired"
    );
  } else {
    throw error;
  }
}
```

## Multi-User Token Management

```typescript
class MultiUserTokenManager {
  private tokenStore: TokenStore;
  private activeTokens: Map<string, TokenManager> = new Map();

  async getManagerForUser(userId: string): Promise<TokenManager> {
    if (this.activeTokens.has(userId)) {
      return this.activeTokens.get(userId)!;
    }

    const tokens = await this.tokenStore.getTokens(userId);
    if (!tokens) {
      throw new Error("User not authenticated");
    }

    const manager = new TokenManager(config);
    manager.setTokens(tokens);
    this.activeTokens.set(userId, manager);

    return manager;
  }

  async refreshForUser(userId: string): Promise<void> {
    const manager = await this.getManagerForUser(userId);
    await manager.refreshAccessToken();
  }

  async revokeForUser(userId: string): Promise<void> {
    const manager = this.activeTokens.get(userId);
    if (manager) {
      await manager.revokeTokens();
      this.activeTokens.delete(userId);
    }

    await this.tokenStore.deleteTokens(userId);
  }
}
```

## Best Practices

1. **Encrypt Tokens**: Always encrypt tokens in database storage
2. **Proactive Refresh**: Refresh tokens before expiration (5-minute buffer)
3. **Handle Concurrent Requests**: Prevent multiple simultaneous refresh requests
4. **Graceful Degradation**: Handle refresh failures gracefully
5. **Token Rotation**: Update stored tokens after successful refresh
6. **Secure Storage**: Never store tokens in localStorage (use sessionStorage for client-side)
7. **Revoke on Logout**: Always revoke tokens when user logs out
8. **Monitor Expiration**: Implement auto-refresh timers for long-running applications
9. **Error Recovery**: Re-authenticate user when refresh token expires
10. **Audit Logging**: Log token refresh and revocation events

## Security Considerations

1. Never expose refresh tokens to client-side code
2. Use HTTPS for all token-related operations
3. Implement rate limiting for token refresh endpoints
4. Rotate client secrets periodically
5. Monitor for suspicious token usage patterns
6. Implement token binding where possible
7. Clear tokens from memory after use
8. Use secure session management
9. Validate token audience and issuer
10. Implement proper CSRF protection

## Related Topics

- [OAuth 2.0 Server-Side](oauth-server-side.md): Server-side authentication flow
- [OAuth 2.0 Client-Side](oauth-client-side.md): Client-side authentication
- [Error Handling](../core/error-handling.md): Handle token-related errors
