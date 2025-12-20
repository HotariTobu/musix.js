# OAuth 2.0 Client-Side Authentication

OAuth 2.0 implicit grant flow for JavaScript applications running in browsers. This flow provides access tokens directly without a server-side token exchange, suitable for single-page applications.

## When to Use Client-Side OAuth 2.0

Use this flow for:

- Browser-based single-page applications (SPAs)
- Applications that cannot securely store client secrets
- Temporary access without refresh tokens
- Quick prototyping and testing

Do NOT use this flow for:

- Applications that need long-term access (no refresh tokens)
- Server-side applications (use server-side flow instead)
- Applications that can securely store secrets

## Limitations

- No refresh tokens (access tokens expire after ~1 hour)
- Less secure than server-side flow
- Access token exposed in browser
- User must re-authenticate when token expires

## Prerequisites

1. Google Cloud project with YouTube Data API v3 enabled
2. OAuth 2.0 credentials configured as "Web application"
3. Authorized JavaScript origins configured (e.g., https://yourdomain.com)
4. Authorized redirect URIs configured

## Authorization Flow

1. Redirect user to Google's OAuth server
2. User grants permission
3. Google redirects back with access token in URL fragment
4. Extract and use access token for API requests

## Step 1: Configure OAuth Client

```typescript
interface ClientConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

const config: ClientConfig = {
  clientId: "your-client-id.apps.googleusercontent.com",
  redirectUri: "https://yourdomain.com/oauth/callback",
  scopes: [
    "https://www.googleapis.com/auth/youtube.readonly"
  ]
};
```

## Step 2: Generate Authorization URL

```typescript
function generateAuthUrl(config: ClientConfig): string {
  const state = generateRandomState();
  sessionStorage.setItem("oauth_state", state);

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "token"); // Note: 'token', not 'code'
  url.searchParams.set("scope", config.scopes.join(" "));
  url.searchParams.set("state", state);

  return url.toString();
}

function generateRandomState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
}

// Initiate authorization
function authorize() {
  const authUrl = generateAuthUrl(config);
  window.location.href = authUrl;
}

// Trigger on button click
document.getElementById("login-btn")?.addEventListener("click", authorize);
```

## Step 3: Handle OAuth Callback

```typescript
interface OAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  state: string;
  error?: string;
}

function parseOAuthResponse(): OAuthResponse | null {
  // Access token is in URL fragment (after #)
  const hash = window.location.hash.substring(1);
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const response: any = {};

  params.forEach((value, key) => {
    response[key] = value;
  });

  return response;
}

function handleOAuthCallback() {
  const response = parseOAuthResponse();

  if (!response) {
    console.log("No OAuth response found");
    return;
  }

  // Validate state parameter (CSRF protection)
  const savedState = sessionStorage.getItem("oauth_state");
  if (response.state !== savedState) {
    console.error("Invalid state parameter - possible CSRF attack");
    return;
  }

  if (response.error) {
    console.error("Authorization failed:", response.error);
    return;
  }

  if (response.access_token) {
    // Store token and expiration time
    const expiresAt = Date.now() + (parseInt(response.expires_in) * 1000);
    sessionStorage.setItem("access_token", response.access_token);
    sessionStorage.setItem("token_expires_at", expiresAt.toString());

    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);

    // Clear state
    sessionStorage.removeItem("oauth_state");

    console.log("Authentication successful!");
    loadUserData();
  }
}

// Call on page load
if (window.location.hash) {
  handleOAuthCallback();
}
```

## Step 4: Use Access Token for API Requests

```typescript
class YouTubeClient {
  private baseUrl = "https://www.googleapis.com/youtube/v3";

  private getAccessToken(): string | null {
    const token = sessionStorage.getItem("access_token");
    const expiresAt = sessionStorage.getItem("token_expires_at");

    if (!token || !expiresAt) return null;

    // Check if token is expired
    if (Date.now() >= parseInt(expiresAt)) {
      this.clearTokens();
      return null;
    }

    return token;
  }

  private clearTokens(): void {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("token_expires_at");
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  async request(endpoint: string, params: Record<string, string> = {}) {
    const token = this.getAccessToken();

    if (!token) {
      throw new Error("Not authenticated - please log in");
    }

    const url = new URL(`${this.baseUrl}/${endpoint}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      this.clearTokens();
      throw new Error("Token expired - please log in again");
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.error.message}`);
    }

    return response.json();
  }

  async getMyPlaylists() {
    return this.request("playlists", {
      part: "snippet,contentDetails",
      mine: "true",
      maxResults: "50"
    });
  }

  async getMySubscriptions() {
    return this.request("subscriptions", {
      part: "snippet",
      mine: "true",
      maxResults: "50"
    });
  }

  async searchVideos(query: string) {
    return this.request("search", {
      part: "snippet",
      type: "video",
      q: query,
      maxResults: "25"
    });
  }
}
```

## Complete Authentication Flow

```typescript
class YouTubeAuth {
  private config: ClientConfig;
  private client: YouTubeClient;

  constructor(config: ClientConfig) {
    this.config = config;
    this.client = new YouTubeClient();

    // Handle OAuth callback on page load
    if (window.location.hash.includes("access_token")) {
      this.handleCallback();
    }
  }

  login(): void {
    const state = this.generateState();
    sessionStorage.setItem("oauth_state", state);

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", this.config.clientId);
    url.searchParams.set("redirect_uri", this.config.redirectUri);
    url.searchParams.set("response_type", "token");
    url.searchParams.set("scope", this.config.scopes.join(" "));
    url.searchParams.set("state", state);

    window.location.href = url.toString();
  }

  logout(): void {
    const token = sessionStorage.getItem("access_token");
    if (token) {
      // Revoke token
      fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: "POST"
      }).catch(console.error);
    }

    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("token_expires_at");
    sessionStorage.removeItem("oauth_state");

    window.location.reload();
  }

  isAuthenticated(): boolean {
    return this.client.isAuthenticated();
  }

  getClient(): YouTubeClient {
    return this.client;
  }

  private handleCallback(): void {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const state = params.get("state");
    const savedState = sessionStorage.getItem("oauth_state");

    if (state !== savedState) {
      console.error("Invalid state parameter");
      return;
    }

    const accessToken = params.get("access_token");
    const expiresIn = params.get("expires_in");

    if (accessToken && expiresIn) {
      const expiresAt = Date.now() + (parseInt(expiresIn) * 1000);
      sessionStorage.setItem("access_token", accessToken);
      sessionStorage.setItem("token_expires_at", expiresAt.toString());
      sessionStorage.removeItem("oauth_state");

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
  }
}

// Usage
const auth = new YouTubeAuth(config);

// Login button
document.getElementById("login")?.addEventListener("click", () => {
  auth.login();
});

// Logout button
document.getElementById("logout")?.addEventListener("click", () => {
  auth.logout();
});

// Check authentication status
if (auth.isAuthenticated()) {
  const client = auth.getClient();

  // Load user data
  client.getMyPlaylists().then(playlists => {
    console.log("User playlists:", playlists);
  });
}
```

## Using Google's JavaScript Client Library

Google provides an official JavaScript client library that simplifies OAuth 2.0:

```html
<script src="https://accounts.google.com/gsi/client"></script>
```

```typescript
// Initialize Google Identity Services
function initializeGoogleAuth() {
  google.accounts.oauth2.initTokenClient({
    client_id: config.clientId,
    scope: config.scopes.join(" "),
    callback: (response) => {
      if (response.access_token) {
        sessionStorage.setItem("access_token", response.access_token);
        loadUserData();
      }
    }
  });
}

// Request access token
function requestAccessToken() {
  const client = google.accounts.oauth2.initTokenClient({
    client_id: config.clientId,
    scope: config.scopes.join(" "),
    callback: (tokenResponse) => {
      if (tokenResponse.access_token) {
        sessionStorage.setItem("access_token", tokenResponse.access_token);
        const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
        sessionStorage.setItem("token_expires_at", expiresAt.toString());
      }
    }
  });

  client.requestAccessToken();
}
```

## Token Expiration Handling

```typescript
class TokenManager {
  private static TOKEN_KEY = "access_token";
  private static EXPIRES_KEY = "token_expires_at";

  static getToken(): string | null {
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    const expiresAt = sessionStorage.getItem(this.EXPIRES_KEY);

    if (!token || !expiresAt) return null;

    // Check expiration (with 5-minute buffer)
    if (Date.now() >= parseInt(expiresAt) - 5 * 60 * 1000) {
      this.clearToken();
      return null;
    }

    return token;
  }

  static setToken(token: string, expiresIn: number): void {
    const expiresAt = Date.now() + (expiresIn * 1000);
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.EXPIRES_KEY, expiresAt.toString());
  }

  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.EXPIRES_KEY);
  }

  static isValid(): boolean {
    return this.getToken() !== null;
  }

  static getTimeUntilExpiry(): number {
    const expiresAt = sessionStorage.getItem(this.EXPIRES_KEY);
    if (!expiresAt) return 0;
    return Math.max(0, parseInt(expiresAt) - Date.now());
  }
}
```

## Security Considerations

1. **State Parameter**: Always validate state to prevent CSRF attacks
2. **HTTPS Only**: Never use HTTP for OAuth flows (except localhost)
3. **Token Storage**: Use sessionStorage (cleared on tab close) not localStorage
4. **No Client Secret**: Never include client secret in client-side code
5. **Minimal Scopes**: Request only necessary permissions
6. **Token Revocation**: Revoke tokens on logout
7. **Secure Origins**: Configure authorized JavaScript origins in API Console

## Best Practices

1. Clear tokens from URL fragment after extraction
2. Implement token expiration checks before API calls
3. Show login prompt when token expires
4. Use sessionStorage for automatic cleanup on tab close
5. Validate state parameter for every callback
6. Handle errors gracefully with user-friendly messages
7. Consider using Google's official JavaScript library

## Error Handling

```typescript
async function safeApiCall<T>(apiCall: () => Promise<T>): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error: any) {
    if (error.message.includes("Not authenticated")) {
      // Redirect to login
      auth.login();
      return null;
    } else if (error.message.includes("Token expired")) {
      // Token expired - re-authenticate
      alert("Your session has expired. Please log in again.");
      auth.login();
      return null;
    } else {
      console.error("API call failed:", error);
      throw error;
    }
  }
}
```

## Related Topics

- [OAuth 2.0 Server-Side](oauth-server-side.md): Server-side authentication with refresh tokens
- [Token Management](token-management.md): Advanced token handling
- [API Scopes](../reference/scopes.md): Available OAuth scopes
- [Error Handling](../core/error-handling.md): Handle authentication errors
