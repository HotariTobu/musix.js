# Error Handling

The Apple Music API uses standard HTTP status codes and JSON error responses. Proper error handling ensures robust applications and good user experience.

## HTTP Status Codes

### Success Codes

- `200 OK`: Request successful, data returned
- `202 Accepted`: Request accepted (async operations like adding to library)
- `204 No Content`: Request successful, no data returned (deletions)

### Client Error Codes

- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Invalid or missing developer token
- `403 Forbidden`: User doesn't have permission or active subscription
- `404 Not Found`: Resource doesn't exist
- `429 Too Many Requests`: Rate limit exceeded

### Server Error Codes

- `500 Internal Server Error`: Server-side error
- `503 Service Unavailable`: Service temporarily unavailable

## Error Response Structure

All errors follow a consistent JSON format:

```typescript
interface ErrorResponse {
  errors: Array<{
    id: string;           // Unique error identifier
    status: string;       // HTTP status code as string
    code: string;         // Apple Music specific error code
    title: string;        // Human-readable error summary
    detail: string;       // Detailed error description
    source?: {
      parameter?: string; // Parameter that caused the error
      pointer?: string;   // JSON pointer to error location
    };
  }>;
}
```

### Example Error Response

```json
{
  "errors": [
    {
      "id": "ABC123",
      "status": "404",
      "code": "RESOURCE_NOT_FOUND",
      "title": "Resource Not Found",
      "detail": "The requested resource was not found",
      "source": {
        "parameter": "ids"
      }
    }
  ]
}
```

## Basic Error Handling

### Simple Try-Catch

```typescript
async function fetchAlbum(
  storefront: string,
  albumId: string,
  developerToken: string
) {
  try {
    const response = await fetch(
      `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}`,
      {
        headers: {
          'Authorization': `Bearer ${developerToken}`
        }
      }
    );

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new AppleMusicError(errorData.errors[0], response.status);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch album:', error);
    throw error;
  }
}
```

### Custom Error Class

```typescript
class AppleMusicError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly id: string;
  public readonly detail: string;

  constructor(error: ErrorResponse['errors'][0], status: number) {
    super(error.title);
    this.name = 'AppleMusicError';
    this.status = status;
    this.code = error.code;
    this.id = error.id;
    this.detail = error.detail;
  }

  isAuthError(): boolean {
    return this.status === 401;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isRateLimit(): boolean {
    return this.status === 429;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }
}
```

## Handling Specific Errors

### Authentication Errors (401)

```typescript
async function handleAuthError(
  fetchFn: () => Promise<Response>,
  tokenManager: TokenManager
): Promise<Response> {
  let response = await fetchFn();

  if (response.status === 401) {
    console.log('Token expired, refreshing...');

    // Refresh developer token
    await tokenManager.refreshToken();

    // Retry request
    response = await fetchFn();

    if (response.status === 401) {
      throw new Error('Authentication failed after token refresh');
    }
  }

  return response;
}

// Usage
const response = await handleAuthError(
  () => fetch(url, {
    headers: {
      'Authorization': `Bearer ${tokenManager.getToken()}`
    }
  }),
  tokenManager
);
```

### Not Found Errors (404)

```typescript
async function getAlbumOrNull(
  storefront: string,
  albumId: string,
  developerToken: string
): Promise<Album | null> {
  try {
    const response = await fetch(
      `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}`,
      {
        headers: {
          'Authorization': `Bearer ${developerToken}`
        }
      }
    );

    if (response.status === 404) {
      console.log(`Album ${albumId} not found`);
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.data[0];
  } catch (error) {
    console.error('Failed to fetch album:', error);
    return null;
  }
}
```

### Rate Limit Errors (429)

```typescript
async function fetchWithRateLimitRetry<T>(
  fetchFn: () => Promise<Response>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetchFn();

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter
        ? parseInt(retryAfter) * 1000
        : Math.pow(2, attempt) * 1000; // Exponential backoff

      console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new AppleMusicError(errorData.errors[0], response.status);
    }

    return await response.json();
  }

  throw new Error('Max retries exceeded for rate limit');
}
```

### Subscription Errors (403)

```typescript
async function requiresSubscription<T>(
  fetchFn: () => Promise<T>
): Promise<T | { requiresSubscription: true }> {
  try {
    return await fetchFn();
  } catch (error) {
    if (error instanceof AppleMusicError && error.isForbidden()) {
      console.error('User does not have an active Apple Music subscription');
      return { requiresSubscription: true };
    }
    throw error;
  }
}

// Usage
const result = await requiresSubscription(() =>
  getUserLibrary(developerToken, userToken)
);

if ('requiresSubscription' in result) {
  // Show subscription prompt to user
  showSubscriptionPrompt();
} else {
  // Process library data
  displayLibrary(result);
}
```

## Comprehensive Error Handler

```typescript
class AppleMusicErrorHandler {
  async handleRequest<T>(
    fetchFn: () => Promise<Response>,
    options: {
      maxRetries?: number;
      retryableStatuses?: number[];
      onRetry?: (attempt: number, error: AppleMusicError) => void;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryableStatuses = [429, 500, 503],
      onRetry
    } = options;

    let lastError: AppleMusicError | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetchFn();

        if (!response.ok) {
          const errorData: ErrorResponse = await response.json();
          const error = new AppleMusicError(errorData.errors[0], response.status);

          // Check if error is retryable
          if (retryableStatuses.includes(response.status)) {
            lastError = error;

            if (onRetry) {
              onRetry(attempt + 1, error);
            }

            // Calculate backoff time
            const waitTime = this.calculateBackoff(attempt, response);
            await this.wait(waitTime);
            continue;
          }

          throw error;
        }

        return await response.json();
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw lastError || error;
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  private calculateBackoff(attempt: number, response: Response): number {
    const retryAfter = response.headers.get('Retry-After');

    if (retryAfter) {
      return parseInt(retryAfter) * 1000;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    return Math.pow(2, attempt) * 1000;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const errorHandler = new AppleMusicErrorHandler();

const album = await errorHandler.handleRequest<Album>(
  () => fetch(url, { headers }),
  {
    maxRetries: 3,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt} after error: ${error.title}`);
    }
  }
);
```

## Network Error Handling

```typescript
async function fetchWithNetworkRetry<T>(
  fetchFn: () => Promise<Response>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetchFn();

      if (!response.ok) {
        const errorData = await response.json();
        throw new AppleMusicError(errorData.errors[0], response.status);
      }

      return await response.json();
    } catch (error) {
      // Network errors (connection refused, timeout, etc.)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error(`Network error on attempt ${attempt + 1}:`, error);

        if (attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }

      throw error;
    }
  }

  throw new Error('Max retries exceeded');
}
```

## Timeout Handling

```typescript
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);

    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }

    throw error;
  }
}

// Usage
try {
  const response = await fetchWithTimeout(
    url,
    { headers: { 'Authorization': `Bearer ${token}` } },
    5000 // 5 second timeout
  );
} catch (error) {
  console.error('Request failed or timed out:', error);
}
```

## Validation Errors

```typescript
function validateStorefront(storefront: string): void {
  const validStorefronts = ['us', 'jp', 'gb', 'fr', 'de', 'ca', 'au'];

  if (!validStorefronts.includes(storefront.toLowerCase())) {
    throw new Error(
      `Invalid storefront: ${storefront}. Valid values: ${validStorefronts.join(', ')}`
    );
  }
}

function validateLimit(limit: number, max: number = 100): void {
  if (limit < 1 || limit > max) {
    throw new Error(`Limit must be between 1 and ${max}, got ${limit}`);
  }
}

// Usage
try {
  validateStorefront('us');
  validateLimit(25);

  const results = await searchCatalog('us', 'Beatles', ['songs'], token, 25);
} catch (error) {
  console.error('Validation error:', error);
}
```

## Best Practices

1. **Use custom error classes**: Create specific error types for better error handling
2. **Implement retry logic**: Retry failed requests with exponential backoff
3. **Handle rate limits**: Respect Retry-After headers and implement backoff
4. **Validate inputs**: Check parameters before making API calls
5. **Log errors**: Record errors for debugging and monitoring
6. **Provide user feedback**: Show meaningful error messages to users
7. **Handle network errors**: Detect and retry network failures
8. **Set timeouts**: Prevent hanging requests with timeout limits
9. **Graceful degradation**: Provide fallback behavior when API fails
10. **Monitor errors**: Track error rates and patterns

## Error Logging

```typescript
class ErrorLogger {
  log(error: AppleMusicError | Error, context?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        ...(error instanceof AppleMusicError && {
          status: error.status,
          code: error.code,
          detail: error.detail
        })
      },
      context,
      stack: error.stack
    };

    console.error('Apple Music API Error:', JSON.stringify(logEntry, null, 2));

    // Send to error tracking service
    // reportToSentry(logEntry);
  }
}

// Usage
const logger = new ErrorLogger();

try {
  const album = await getAlbum('us', 'invalid-id', token);
} catch (error) {
  logger.log(error, {
    operation: 'getAlbum',
    storefront: 'us',
    albumId: 'invalid-id'
  });
}
```

## Related Documentation

- [Developer Tokens](../auth/developer-tokens.md): Token authentication errors
- [User Authentication](../auth/user-authentication.md): User token errors
- [Rate Limits](../reference/rate-limits.md): Rate limiting details
