# Error Handling

Comprehensive guide to handling errors, HTTP status codes, and implementing retry strategies for the YouTube Data API.

## HTTP Status Codes

### 400 Bad Request

Invalid request parameters or malformed request.

```typescript
try {
  const video = await getVideo("", apiKey);  // Empty ID
} catch (error: any) {
  if (error.status === 400) {
    console.error("Bad request:", error.message);
    // Fix request parameters
  }
}
```

**Common causes:**
- Missing required parameters
- Invalid parameter values (e.g., empty video ID)
- Incompatible parameter combinations
- Malformed query strings
- Invalid date formats

### 401 Unauthorized

Authentication failed or token expired.

```typescript
try {
  const playlists = await getMyPlaylists(accessToken);
} catch (error: any) {
  if (error.status === 401) {
    console.error("Authentication failed - token expired");
    // Refresh token or re-authenticate
    await refreshAccessToken();
  }
}
```

**Common causes:**
- Expired access token
- Invalid access token
- Missing Authorization header
- Revoked token

### 403 Forbidden

Valid authentication but insufficient permissions or quota exceeded.

```typescript
try {
  const results = await searchVideos("music", apiKey);
} catch (error: any) {
  if (error.status === 403) {
    const errorData = await error.response.json();

    if (errorData.error.errors[0].reason === "quotaExceeded") {
      console.error("Daily quota exceeded");
      // Wait until quota resets (midnight Pacific Time)
    } else if (errorData.error.errors[0].reason === "insufficientPermissions") {
      console.error("Need additional OAuth scopes");
      // Re-authenticate with required scopes
    }
  }
}
```

**Common causes:**
- Daily quota exceeded (10,000 units)
- Missing OAuth scopes
- Invalid API key
- API key restrictions (domain, IP, API)
- User denied permission

### 404 Not Found

Resource does not exist or is unavailable.

```typescript
try {
  const video = await getVideo("invalid-id", apiKey);
} catch (error: any) {
  if (error.status === 404) {
    console.error("Resource not found");
    // Handle missing resource gracefully
    return null;
  }
}
```

**Common causes:**
- Invalid YouTube ID
- Deleted resource
- Private resource without access
- Resource not available in specified market

### 429 Rate Limited

Too many requests in a short period.

```typescript
try {
  const video = await getVideo(videoId, apiKey);
} catch (error: any) {
  if (error.status === 429) {
    const retryAfter = parseInt(error.headers?.['retry-after'] || '60');
    console.log(`Rate limited - retry after ${retryAfter} seconds`);

    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    // Retry request
    return getVideo(videoId, apiKey);
  }
}
```

**Rate limit details:**
- Enforced per-user basis
- Separate from quota limits
- Retry-After header indicates wait time
- Use exponential backoff for retries

### 500 Internal Server Error

YouTube server error - usually temporary.

```typescript
try {
  const video = await getVideo(videoId, apiKey);
} catch (error: any) {
  if (error.status === 500) {
    console.error("Server error - retrying with backoff");
    // Implement exponential backoff
  }
}
```

### 503 Service Unavailable

YouTube service temporarily unavailable.

```typescript
try {
  const video = await getVideo(videoId, apiKey);
} catch (error: any) {
  if (error.status === 503) {
    console.error("Service unavailable");
    // Retry with exponential backoff
  }
}
```

## Error Response Structure

```typescript
interface YouTubeError {
  error: {
    code: number;
    message: string;
    errors: Array<{
      domain: string;
      reason: string;
      message: string;
      locationType?: string;
      location?: string;
    }>;
  };
}
```

## Common Error Reasons

| Reason | Description | Recovery |
|--------|-------------|----------|
| `quotaExceeded` | Daily quota limit reached | Wait until reset (midnight PT) |
| `insufficientPermissions` | Missing OAuth scopes | Re-authenticate with scopes |
| `invalidCredentials` | API key invalid | Check API key configuration |
| `badRequest` | Invalid parameters | Validate request parameters |
| `videoNotFound` | Video doesn't exist | Handle missing resource |
| `channelNotFound` | Channel doesn't exist | Handle missing resource |
| `playlistNotFound` | Playlist doesn't exist | Handle missing resource |
| `forbidden` | Access denied | Check permissions |
| `invalidSearchFilter` | Incompatible filters | Review filter combinations |

## Comprehensive Error Handler

```typescript
class YouTubeAPIError extends Error {
  constructor(
    public status: number,
    public reason: string,
    message: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "YouTubeAPIError";
  }
}

async function handleYouTubeError(response: Response): Promise<never> {
  const data = await response.json();
  const error = data.error;
  const reason = error.errors[0]?.reason || "unknown";

  const retryableStatuses = [429, 500, 502, 503, 504];
  const isRetryable = retryableStatuses.includes(response.status);

  throw new YouTubeAPIError(
    response.status,
    reason,
    error.message,
    isRetryable
  );
}

async function makeRequest(url: string): Promise<any> {
  const response = await fetch(url);

  if (!response.ok) {
    await handleYouTubeError(response);
  }

  return response.json();
}
```

## Retry Strategies

### Exponential Backoff

```typescript
async function exponentialRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();

    } catch (error: any) {
      lastError = error;

      // Don't retry non-retryable errors
      if (!error.retryable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        32000 // Max 32 seconds
      );

      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Usage
const video = await exponentialRetry(
  () => getVideo(videoId, apiKey),
  5,
  1000
);
```

### Retry with Specific Error Handling

```typescript
async function retryWithErrorHandling<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();

    } catch (error: any) {
      lastError = error;

      switch (error.status) {
        case 400:
        case 404:
          // Don't retry client errors
          throw error;

        case 401:
          // Try to refresh token
          console.log("Refreshing token...");
          await refreshAccessToken();
          continue;

        case 403:
          if (error.reason === "quotaExceeded") {
            throw new Error("Quota exceeded - cannot retry");
          }
          throw error;

        case 429:
          const retryAfter = parseInt(error.headers?.['retry-after'] || '60');
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;

        case 500:
        case 502:
        case 503:
        case 504:
          const backoff = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, backoff));
          continue;

        default:
          throw error;
      }
    }
  }

  throw lastError;
}
```

## Rate Limiting Queue

Prevent rate limiting by queuing requests:

```typescript
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private minDelay = 100; // Minimum delay between requests
  private lastRequestTime = 0;

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

      // Ensure minimum delay between requests
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.minDelay) {
        await new Promise(resolve =>
          setTimeout(resolve, this.minDelay - timeSinceLastRequest)
        );
      }

      try {
        await fn();
      } catch (error: any) {
        if (error.status === 429) {
          const retryAfter = parseInt(error.headers?.['retry-after'] || '60');
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          this.queue.unshift(fn); // Re-add to front of queue
        }
      }

      this.lastRequestTime = Date.now();
    }

    this.processing = false;
  }
}

// Usage
const queue = new RequestQueue();

const results = await Promise.all([
  queue.add(() => getVideo("id1", apiKey)),
  queue.add(() => getVideo("id2", apiKey)),
  queue.add(() => getVideo("id3", apiKey))
]);
```

## Circuit Breaker

Prevent cascading failures:

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();

      if (this.state === "half-open") {
        this.state = "closed";
        this.failures = 0;
      }

      return result;

    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.threshold) {
        this.state = "open";
        console.error("Circuit breaker opened");
      }

      throw error;
    }
  }

  reset() {
    this.state = "closed";
    this.failures = 0;
  }
}

// Usage
const breaker = new CircuitBreaker(5, 60000);

try {
  const video = await breaker.execute(() => getVideo(videoId, apiKey));
} catch (error: any) {
  if (error.message === "Circuit breaker is open") {
    // Use fallback or cached data
  }
}
```

## Error Logging

```typescript
interface ErrorLog {
  timestamp: Date;
  endpoint: string;
  status: number;
  reason: string;
  message: string;
  retryAttempt?: number;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];

  log(error: YouTubeAPIError, endpoint: string, retryAttempt?: number) {
    this.logs.push({
      timestamp: new Date(),
      endpoint,
      status: error.status,
      reason: error.reason,
      message: error.message,
      retryAttempt
    });

    // Send to monitoring service
    this.sendToMonitoring(error);
  }

  private sendToMonitoring(error: YouTubeAPIError) {
    // Implementation for external monitoring
    console.error("YouTube API Error:", {
      status: error.status,
      reason: error.reason,
      message: error.message
    });
  }

  getRecentErrors(limit: number = 10): ErrorLog[] {
    return this.logs.slice(-limit);
  }

  getErrorsByStatus(status: number): ErrorLog[] {
    return this.logs.filter(log => log.status === status);
  }
}

// Usage
const logger = new ErrorLogger();

try {
  await getVideo(videoId, apiKey);
} catch (error: any) {
  logger.log(error, "videos.get");
}
```

## Graceful Degradation

```typescript
async function getVideoSafely(videoId: string, apiKey: string) {
  try {
    return await retryWithErrorHandling(() => getVideo(videoId, apiKey));
  } catch (error: any) {
    console.error(`Failed to fetch video ${videoId}:`, error.message);

    // Return fallback data
    return {
      id: videoId,
      snippet: {
        title: "Video Unavailable",
        description: "",
        channelTitle: "Unknown"
      },
      available: false
    };
  }
}
```

## Best Practices

1. **Always handle errors**: Wrap API calls in try-catch
2. **Implement exponential backoff**: For server errors (5xx)
3. **Respect rate limits**: Use Retry-After header
4. **Don't retry 4xx errors**: Except 401 (after token refresh)
5. **Log errors**: Track patterns for debugging
6. **Monitor quota**: Watch for quotaExceeded errors
7. **Validate inputs**: Catch errors before API calls
8. **Use circuit breakers**: Prevent cascading failures
9. **Implement timeouts**: Don't wait indefinitely
10. **Provide user feedback**: Show meaningful error messages

## Related Topics

- [Quota Management](quota-management.md): Understand quota limits
- [Token Management](../auth/token-management.md): Handle authentication errors
- [API Methods](../api/videos.md): Endpoint-specific errors
