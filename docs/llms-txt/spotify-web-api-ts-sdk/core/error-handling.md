# Error Handling

The SDK provides comprehensive error handling for HTTP errors, authentication failures, rate limiting, and network issues.

## Error Types

### HTTP Status Errors

The SDK throws errors for non-2xx HTTP responses with the following structure:

```typescript
interface SpotifyApiError {
  status: number;
  message: string;
  headers?: Record<string, string>;
  response?: any;
}
```

## Common HTTP Status Codes

### 400 Bad Request

Invalid request parameters or malformed request.

```typescript
try {
  const track = await sdk.tracks.get("");  // Empty ID
} catch (error) {
  if (error.status === 400) {
    console.log("Invalid request:", error.message);
    // Fix the request parameters
  }
}
```

**Common causes:**
- Invalid ID format
- Missing required parameters
- Invalid parameter values
- Malformed query strings

### 401 Unauthorized

Authentication failed or token expired.

```typescript
try {
  const profile = await sdk.currentUser.profile();
} catch (error) {
  if (error.status === 401) {
    console.log("Authentication failed - please log in again");
    // Redirect to login or refresh token
  }
}
```

**Common causes:**
- Expired access token (refresh token also expired)
- Invalid access token
- Missing Authorization header
- Revoked token

### 403 Forbidden

Valid token but insufficient permissions.

```typescript
try {
  const playlists = await sdk.currentUser.playlists.playlists();
} catch (error) {
  if (error.status === 403) {
    console.log("Insufficient permissions - need additional scopes");
    // Re-authenticate with required scopes
  }
}
```

**Common causes:**
- Missing required OAuth scopes
- User denied permission
- Invalid OAuth request

### 404 Not Found

Resource does not exist or is unavailable.

```typescript
try {
  const track = await sdk.tracks.get("invalid-id");
} catch (error) {
  if (error.status === 404) {
    console.log("Track not found");
    // Handle missing resource
  }
}
```

**Common causes:**
- Invalid Spotify ID
- Resource deleted
- Private resource without access
- Resource not available in specified market

### 429 Rate Limited

Too many requests - exceeded rate limits.

```typescript
try {
  const track = await sdk.tracks.get("trackId");
} catch (error) {
  if (error.status === 429) {
    const retryAfter = parseInt(error.headers?.['retry-after'] || '60');
    console.log(`Rate limited - retry after ${retryAfter} seconds`);

    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    const track = await sdk.tracks.get("trackId");
  }
}
```

**Rate limit details:**
- Spotify enforces rate limits per application
- Limits vary by endpoint
- `Retry-After` header indicates wait time in seconds
- Use exponential backoff for retries

### 500 Internal Server Error

Spotify server error - usually temporary.

```typescript
try {
  const track = await sdk.tracks.get("trackId");
} catch (error) {
  if (error.status === 500) {
    console.log("Server error - retrying...");
    // Retry with exponential backoff
  }
}
```

### 503 Service Unavailable

Spotify service temporarily unavailable.

```typescript
try {
  const track = await sdk.tracks.get("trackId");
} catch (error) {
  if (error.status === 503) {
    console.log("Service unavailable - try again later");
    // Implement retry logic
  }
}
```

## Comprehensive Error Handler

```typescript
async function handleSpotifyRequest<T>(
  request: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await request();

    } catch (error: any) {
      lastError = error;

      switch (error.status) {
        case 400:
          console.error("Bad request:", error.message);
          throw error; // Don't retry

        case 401:
          console.error("Unauthorized - re-authenticate required");
          throw error; // Don't retry

        case 403:
          console.error("Forbidden - insufficient permissions");
          throw error; // Don't retry

        case 404:
          console.error("Resource not found");
          throw error; // Don't retry

        case 429:
          const retryAfter = parseInt(error.headers?.['retry-after'] || '60');
          console.log(`Rate limited - waiting ${retryAfter}s`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue; // Retry

        case 500:
        case 502:
        case 503:
        case 504:
          const backoff = Math.pow(2, attempt) * 1000;
          console.log(`Server error - retrying in ${backoff}ms`);
          await new Promise(resolve => setTimeout(resolve, backoff));
          continue; // Retry

        default:
          console.error("Unexpected error:", error);
          throw error;
      }
    }
  }

  throw lastError;
}

// Usage
const track = await handleSpotifyRequest(() =>
  sdk.tracks.get("11dFghVXANMlKmJXsNCbNl")
);
```

## Retry Strategies

### Exponential Backoff

```typescript
async function exponentialRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;

      const isRetryable = [429, 500, 502, 503, 504].includes(error.status);
      if (!isRetryable) throw error;

      const delay = Math.min(Math.pow(2, i) * 1000, 32000); // Max 32s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

// Usage
const results = await exponentialRetry(() =>
  sdk.search("Beatles", ["artist"])
);
```

### Rate Limit Queue

```typescript
class RateLimitedQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private minDelay = 100; // Minimum 100ms between requests

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.process();
      }
    });
  }

  private async process() {
    this.processing = true;

    while (this.queue.length > 0) {
      const fn = this.queue.shift();
      if (!fn) break;

      try {
        await fn();
      } catch (error: any) {
        if (error.status === 429) {
          const retryAfter = parseInt(error.headers?.['retry-after'] || '60');
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          this.queue.unshift(fn); // Re-add to front of queue
        }
      }

      await new Promise(resolve => setTimeout(resolve, this.minDelay));
    }

    this.processing = false;
  }
}

// Usage
const queue = new RateLimitedQueue();

const tracks = await Promise.all([
  queue.add(() => sdk.tracks.get("id1")),
  queue.add(() => sdk.tracks.get("id2")),
  queue.add(() => sdk.tracks.get("id3"))
]);
```

## Network Errors

Handle network failures and timeouts:

```typescript
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
  );

  return Promise.race([promise, timeout]);
}

// Usage
try {
  const track = await withTimeout(
    sdk.tracks.get("trackId"),
    5000 // 5 second timeout
  );
} catch (error) {
  if (error.message === "Request timeout") {
    console.log("Request took too long");
  }
}
```

## Custom Error Handler

Implement custom error handling with hooks:

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = new SpotifyApi(authenticator, {
  errorHandler: async (error) => {
    console.error("Spotify API Error:", {
      status: error.status,
      message: error.message,
      timestamp: new Date().toISOString()
    });

    // Log to monitoring service
    // await logToMonitoring(error);

    // Re-throw to allow caller to handle
    throw error;
  }
});
```

## TypeScript Error Types

Define typed error handlers:

```typescript
interface SpotifyError extends Error {
  status: number;
  headers?: Record<string, string>;
}

function isSpotifyError(error: any): error is SpotifyError {
  return error && typeof error.status === "number";
}

async function safeRequest<T>(request: () => Promise<T>): Promise<T | null> {
  try {
    return await request();
  } catch (error) {
    if (isSpotifyError(error)) {
      console.log(`Spotify error ${error.status}: ${error.message}`);
      return null;
    }
    throw error; // Re-throw non-Spotify errors
  }
}

// Usage
const track = await safeRequest(() => sdk.tracks.get("id"));
if (track) {
  console.log(track.name);
} else {
  console.log("Failed to fetch track");
}
```

## Best Practices

1. **Always handle 429:** Implement rate limit retry logic
2. **Use exponential backoff:** For server errors (500, 503)
3. **Don't retry 4xx errors:** These indicate client errors
4. **Check Retry-After header:** For accurate rate limit delays
5. **Log errors:** Track error patterns for debugging
6. **Set timeouts:** Prevent hanging requests
7. **Handle token expiration:** Re-authenticate when needed
8. **Validate inputs:** Catch errors before API calls
9. **Use try-catch:** Always wrap API calls
10. **Provide user feedback:** Show meaningful error messages

## Error Logging

```typescript
interface ErrorLog {
  timestamp: Date;
  endpoint: string;
  status: number;
  message: string;
  userId?: string;
}

const errorLogs: ErrorLog[] = [];

async function loggedRequest<T>(
  endpoint: string,
  request: () => Promise<T>
): Promise<T> {
  try {
    return await request();
  } catch (error: any) {
    errorLogs.push({
      timestamp: new Date(),
      endpoint,
      status: error.status,
      message: error.message
    });
    throw error;
  }
}

// Usage
const track = await loggedRequest(
  "tracks.get",
  () => sdk.tracks.get("trackId")
);
```

## Graceful Degradation

Handle errors gracefully in production:

```typescript
async function getTrackSafely(trackId: string) {
  try {
    return await sdk.tracks.get(trackId);
  } catch (error: any) {
    console.error(`Failed to fetch track ${trackId}:`, error.message);

    // Return fallback data
    return {
      id: trackId,
      name: "Unknown Track",
      artists: [{ name: "Unknown Artist" }],
      available: false
    };
  }
}
```

## Related Topics

- [Token Management](../auth/token-management.md): Handle authentication errors
- [Customization](customization.md): Implement custom error handlers
