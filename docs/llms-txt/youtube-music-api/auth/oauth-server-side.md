# OAuth 2.0 Server-Side Authentication

OAuth 2.0 server-side flow enables web applications to access user-specific YouTube data with refresh tokens for long-term access. This is the recommended authentication method for server-side applications.

## When to Use Server-Side OAuth 2.0

Use this flow when you need to:

- Access private user data (liked videos, subscriptions, playlists)
- Upload videos on behalf of users
- Create and modify playlists
- Manage channel settings
- Post comments or rate videos
- Maintain long-term access via refresh tokens

## Prerequisites

1. Google Cloud project with YouTube Data API v3 enabled
2. OAuth 2.0 credentials configured as "Web application"
3. Authorized redirect URIs configured (must use HTTPS except localhost)
4. Client ID and client secret from credentials

## Authorization Flow

The OAuth 2.0 server-side flow consists of six steps:

1. Set authorization parameters
2. Redirect user to Google's OAuth server
3. User grants permission
4. Handle OAuth response with authorization code
5. Exchange authorization code for access and refresh tokens
6. Use access token for API requests

## Step 1: Configure OAuth 2.0 Client

```typescript
interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

const config: OAuthConfig = {
  clientId: "your-client-id.apps.googleusercontent.com",
  clientSecret: "your-client-secret",
  redirectUri: "https://yourdomain.com/oauth/callback",
  scopes: [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.force-ssl"
  ]
};
```

## Step 2: Generate Authorization URL

```typescript
function generateAuthUrl(config: OAuthConfig): string {
  const state = generateRandomState(); // Store this in session
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scopes.join(" "));
  url.searchParams.set("access_type", "offline"); // Required for refresh tokens
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "consent"); // Force consent to get refresh token

  return url.toString();
}

function generateRandomState(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Redirect user to authorization URL
app.get("/auth/google", (req, res) => {
  const authUrl = generateAuthUrl(config);
  req.session.oauthState = state; // Store state for validation
  res.redirect(authUrl);
});
```

## Step 3: Handle OAuth Callback

```typescript
app.get("/oauth/callback", async (req, res) => {
  const { code, state, error } = req.query;

  // Validate state parameter (CSRF protection)
  if (state !== req.session.oauthState) {
    return res.status(400).send("Invalid state parameter");
  }

  if (error) {
    return res.status(400).send(`Authorization failed: ${error}`);
  }

  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  try {
    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code as string, config);

    // Store tokens securely (database, session, etc.)
    req.session.accessToken = tokens.access_token;
    req.session.refreshToken = tokens.refresh_token;
    req.session.expiresAt = Date.now() + (tokens.expires_in * 1000);

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Token exchange failed:", error);
    res.status(500).send("Authentication failed");
  }
});
```

## Step 4: Exchange Authorization Code for Tokens

```typescript
interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

async function exchangeCodeForTokens(
  code: string,
  config: OAuthConfig
): Promise<TokenResponse> {
  const tokenUrl = "https://oauth2.googleapis.com/token";

  const params = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code"
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error_description}`);
  }

  return response.json();
}
```

## Step 5: Use Access Token for API Requests

```typescript
async function makeAuthenticatedRequest(
  endpoint: string,
  accessToken: string,
  params: Record<string, string> = {}
) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API request failed: ${error.error.message}`);
  }

  return response.json();
}

// Example: Get user's playlists
async function getUserPlaylists(accessToken: string) {
  return makeAuthenticatedRequest("playlists", accessToken, {
    part: "snippet,contentDetails",
    mine: "true",
    maxResults: "50"
  });
}
```

## Step 6: Refresh Access Tokens

Access tokens expire after approximately 1 hour. Use refresh tokens to obtain new access tokens without user interaction.

```typescript
async function refreshAccessToken(
  refreshToken: string,
  config: OAuthConfig
): Promise<TokenResponse> {
  const tokenUrl = "https://oauth2.googleapis.com/token";

  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token"
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token refresh failed: ${error.error_description}`);
  }

  return response.json();
}
```

## Complete OAuth Client Class

```typescript
class YouTubeOAuthClient {
  private config: OAuthConfig;
  private accessToken?: string;
  private refreshToken?: string;
  private expiresAt?: number;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  getAuthUrl(state: string): string {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", this.config.clientId);
    url.searchParams.set("redirect_uri", this.config.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", this.config.scopes.join(" "));
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "consent");
    return url.toString();
  }

  async exchangeCode(code: string): Promise<void> {
    const tokens = await exchangeCodeForTokens(code, this.config);
    this.setTokens(tokens);
  }

  private setTokens(tokens: TokenResponse): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.expiresAt = Date.now() + (tokens.expires_in * 1000);
  }

  async getValidAccessToken(): Promise<string> {
    // Check if token is expired or about to expire (within 5 minutes)
    if (!this.accessToken || !this.expiresAt ||
        Date.now() >= this.expiresAt - 5 * 60 * 1000) {
      await this.refresh();
    }
    return this.accessToken!;
  }

  private async refresh(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const tokens = await refreshAccessToken(this.refreshToken, this.config);
    this.accessToken = tokens.access_token;
    this.expiresAt = Date.now() + (tokens.expires_in * 1000);
    // Note: refresh_token is not included in refresh response (keep existing)
  }

  async request(endpoint: string, params: Record<string, string> = {}) {
    const accessToken = await this.getValidAccessToken();
    return makeAuthenticatedRequest(endpoint, accessToken, params);
  }

  async getUserPlaylists() {
    return this.request("playlists", {
      part: "snippet,contentDetails",
      mine: "true",
      maxResults: "50"
    });
  }

  async uploadVideo(videoData: any) {
    const accessToken = await this.getValidAccessToken();
    // Implementation for video upload
  }
}
```

## Token Storage

Store tokens securely in your database:

```typescript
interface UserTokens {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scopes: string[];
}

// Save tokens to database
async function saveUserTokens(userId: string, tokens: TokenResponse) {
  await db.tokens.upsert({
    where: { userId },
    create: {
      userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000),
      scopes: tokens.scope.split(" ")
    },
    update: {
      accessToken: tokens.access_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000)
    }
  });
}

// Load tokens from database
async function getUserTokens(userId: string): Promise<UserTokens | null> {
  return db.tokens.findUnique({
    where: { userId }
  });
}
```

## Security Best Practices

1. **Validate State Parameter**: Always verify the state parameter to prevent CSRF attacks
2. **Use HTTPS**: All redirect URIs must use HTTPS (except localhost for development)
3. **Protect Client Secret**: Never expose client secret in client-side code
4. **Store Tokens Securely**: Encrypt tokens in database, use secure session storage
5. **Request Minimal Scopes**: Only request permissions your application needs
6. **Implement Token Rotation**: Refresh tokens before expiration
7. **Revoke on Logout**: Revoke tokens when users log out
8. **Handle Expired Tokens**: Implement automatic refresh on 401 errors

## Error Handling

```typescript
async function safeRequest(requestFn: () => Promise<any>) {
  try {
    return await requestFn();
  } catch (error: any) {
    if (error.message.includes("401")) {
      // Token expired - should have been refreshed automatically
      throw new Error("Authentication required - please log in again");
    } else if (error.message.includes("403")) {
      throw new Error("Insufficient permissions for this operation");
    } else if (error.message.includes("invalid_grant")) {
      // Refresh token expired or revoked
      throw new Error("Session expired - please log in again");
    }
    throw error;
  }
}
```

## Incremental Authorization

Request additional scopes when needed:

```typescript
function getAuthUrlWithAdditionalScopes(
  existingScopes: string[],
  newScopes: string[]
): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", newScopes.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true"); // Include existing scopes
  return url.toString();
}
```

## Token Revocation

Revoke tokens when user logs out:

```typescript
async function revokeToken(token: string): Promise<void> {
  const response = await fetch(
    `https://oauth2.googleapis.com/revoke?token=${token}`,
    { method: "POST" }
  );

  if (!response.ok) {
    console.error("Token revocation failed");
  }
}

// Usage on logout
app.post("/logout", async (req, res) => {
  if (req.session.accessToken) {
    await revokeToken(req.session.accessToken);
  }
  req.session.destroy();
  res.redirect("/");
});
```

## Related Topics

- [OAuth 2.0 Client-Side](oauth-client-side.md): Browser-based authentication
- [Token Management](token-management.md): Advanced token handling strategies
- [API Scopes](../reference/scopes.md): Available OAuth scopes
- [Error Handling](../core/error-handling.md): Handle authentication errors
