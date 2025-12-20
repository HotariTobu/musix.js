# Customization

The SDK is highly extensible, allowing you to customize fetch behavior, caching, error handling, validation, and more through configuration options.

## Configuration Options

The SDK accepts configuration options when instantiating:

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = new SpotifyApi(authenticator, {
  fetch: customFetch,
  beforeRequest: customBeforeRequest,
  afterRequest: customAfterRequest,
  deserializer: customDeserializer,
  responseValidator: customValidator,
  errorHandler: customErrorHandler,
  cachingStrategy: customCache,
  redirectionStrategy: customRedirect
});
```

## Custom Fetch Implementation

Replace the default fetch with your own implementation:

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

// Custom fetch with logging
const customFetch = async (url: string, options?: RequestInit) => {
  console.log(`[FETCH] ${options?.method || 'GET'} ${url}`);
  const start = Date.now();

  const response = await fetch(url, options);

  console.log(`[FETCH] ${response.status} ${url} (${Date.now() - start}ms)`);
  return response;
};

const sdk = new SpotifyApi(authenticator, {
  fetch: customFetch
});
```

### Fetch with Retry

```typescript
const fetchWithRetry = async (
  url: string,
  options?: RequestInit,
  retries: number = 3
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.ok || i === retries - 1) {
        return response;
      }

      // Retry on server errors
      if (response.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }

      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw new Error("Max retries exceeded");
};

const sdk = new SpotifyApi(authenticator, {
  fetch: fetchWithRetry
});
```

## Request/Response Hooks

### Before Request Hook

Modify requests before they are sent:

```typescript
const beforeRequest = async (url: string, request: RequestInit): Promise<RequestInit> => {
  // Add custom headers
  const headers = new Headers(request.headers);
  headers.set("X-Client-Version", "1.0.0");
  headers.set("X-Request-ID", crypto.randomUUID());

  // Log request
  console.log("Request:", {
    url,
    method: request.method,
    timestamp: new Date().toISOString()
  });

  return {
    ...request,
    headers
  };
};

const sdk = new SpotifyApi(authenticator, {
  beforeRequest
});
```

### After Request Hook

Process responses before they are returned:

```typescript
const afterRequest = async (
  url: string,
  request: RequestInit,
  response: Response
): Promise<Response> => {
  // Log response
  console.log("Response:", {
    url,
    status: response.status,
    timestamp: new Date().toISOString()
  });

  // Track rate limit headers
  if (response.headers.get("X-RateLimit-Remaining")) {
    console.log("Rate limit remaining:", response.headers.get("X-RateLimit-Remaining"));
  }

  return response;
};

const sdk = new SpotifyApi(authenticator, {
  afterRequest
});
```

### Combined Request/Response Logging

```typescript
interface RequestLog {
  requestId: string;
  url: string;
  method: string;
  startTime: number;
  status?: number;
  duration?: number;
}

const requestLogs = new Map<string, RequestLog>();

const loggingConfig = {
  beforeRequest: async (url: string, request: RequestInit) => {
    const requestId = crypto.randomUUID();
    const headers = new Headers(request.headers);
    headers.set("X-Request-ID", requestId);

    requestLogs.set(requestId, {
      requestId,
      url,
      method: request.method || "GET",
      startTime: Date.now()
    });

    return { ...request, headers };
  },

  afterRequest: async (url: string, request: RequestInit, response: Response) => {
    const requestId = request.headers?.["X-Request-ID"];
    if (requestId && requestLogs.has(requestId)) {
      const log = requestLogs.get(requestId)!;
      log.status = response.status;
      log.duration = Date.now() - log.startTime;

      console.log("Request completed:", log);
      requestLogs.delete(requestId);
    }

    return response;
  }
};

const sdk = new SpotifyApi(authenticator, loggingConfig);
```

## Custom Caching Strategy

Implement your own caching mechanism:

```typescript
import { ICachingStrategy } from "@spotify/web-api-ts-sdk";

class RedisCacheStrategy implements ICachingStrategy {
  constructor(private redisClient: any) {}

  async getOrCreate<T>(
    key: string,
    fetch: () => Promise<T>
  ): Promise<T> {
    // Check cache
    const cached = await this.redisClient.get(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.expires > Date.now()) {
        return parsed.value;
      }
    }

    // Not in cache or expired, fetch new value
    const value = await fetch();

    // Cache the value
    await this.redisClient.set(
      key,
      JSON.stringify({ value, expires: Date.now() + 3600000 }),
      { EX: 3600 }
    );

    return value;
  }

  async remove(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}

// Usage
const sdk = new SpotifyApi(authenticator, {
  cachingStrategy: new RedisCacheStrategy(redisClient)
});
```

### In-Memory LRU Cache

```typescript
class LRUCache implements ICachingStrategy {
  private cache = new Map<string, { value: any; expires: number }>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  async getOrCreate<T>(key: string, fetch: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);

    if (cached && cached.expires > Date.now()) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, cached);
      return cached.value;
    }

    // Fetch new value
    const value = await fetch();
    const expires = Date.now() + 3600000; // 1 hour

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, { value, expires });
    return value;
  }

  async remove(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

const sdk = new SpotifyApi(authenticator, {
  cachingStrategy: new LRUCache(200)
});
```

## Custom Error Handler

Implement custom error handling logic:

```typescript
const customErrorHandler = async (error: any) => {
  // Log to monitoring service
  console.error("Spotify API Error:", {
    status: error.status,
    message: error.message,
    timestamp: new Date().toISOString(),
    stack: error.stack
  });

  // Send to error tracking service
  // await errorTracker.captureException(error);

  // Transform error for client
  if (error.status === 401) {
    throw new Error("Please log in again");
  } else if (error.status === 429) {
    throw new Error("Too many requests - please wait");
  }

  throw error;
};

const sdk = new SpotifyApi(authenticator, {
  errorHandler: customErrorHandler
});
```

## Custom Response Validator

Validate API responses:

```typescript
import { IResponseValidator } from "@spotify/web-api-ts-sdk";

class CustomValidator implements IResponseValidator {
  async validateResponse(response: Response): Promise<void> {
    // Check content type
    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      throw new Error(`Unexpected content type: ${contentType}`);
    }

    // Check rate limits
    const remaining = response.headers.get("X-RateLimit-Remaining");
    if (remaining && parseInt(remaining) < 10) {
      console.warn("Rate limit warning: only", remaining, "requests remaining");
    }

    // Validate status
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || "Request failed");
    }
  }
}

const sdk = new SpotifyApi(authenticator, {
  responseValidator: new CustomValidator()
});
```

## Custom Deserializer

Customize how responses are parsed:

```typescript
import { IResponseDeserializer } from "@spotify/web-api-ts-sdk";

class CustomDeserializer implements IResponseDeserializer {
  async deserialize<T>(response: Response): Promise<T> {
    const text = await response.text();

    // Empty response
    if (!text) {
      return {} as T;
    }

    try {
      const data = JSON.parse(text);

      // Transform dates
      return this.transformDates(data);
    } catch (error) {
      console.error("Failed to parse response:", text);
      throw error;
    }
  }

  private transformDates(obj: any): any {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.transformDates(item));
    }

    const transformed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Convert ISO date strings to Date objects
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        transformed[key] = new Date(value);
      } else {
        transformed[key] = this.transformDates(value);
      }
    }

    return transformed;
  }
}

const sdk = new SpotifyApi(authenticator, {
  deserializer: new CustomDeserializer()
});
```

## Custom Redirection Strategy

Customize OAuth redirect behavior for browser applications:

```typescript
import { IRedirectionStrategy } from "@spotify/web-api-ts-sdk";

class CustomRedirection implements IRedirectionStrategy {
  async redirect(url: string): Promise<void> {
    // Store redirect intent
    localStorage.setItem("oauth_redirect_intent", Date.now().toString());

    // Custom redirect logic
    console.log("Redirecting to:", url);
    window.location.href = url;
  }

  async onReturnFromRedirect(): Promise<void> {
    // Handle return from OAuth
    const intent = localStorage.getItem("oauth_redirect_intent");
    if (intent) {
      console.log("Returned from OAuth redirect");
      localStorage.removeItem("oauth_redirect_intent");
    }
  }
}

const sdk = new SpotifyApi(authenticator, {
  redirectionStrategy: new CustomRedirection()
});
```

## Complete Custom Configuration Example

```typescript
import { SpotifyApi, ICachingStrategy, IResponseValidator } from "@spotify/web-api-ts-sdk";

// Custom cache with metrics
class MetricsCache implements ICachingStrategy {
  private cache = new Map();
  private hits = 0;
  private misses = 0;

  async getOrCreate<T>(key: string, fetch: () => Promise<T>): Promise<T> {
    if (this.cache.has(key)) {
      this.hits++;
      return this.cache.get(key);
    }

    this.misses++;
    const value = await fetch();
    this.cache.set(key, value);
    return value;
  }

  async remove(key: string): Promise<void> {
    this.cache.delete(key);
  }

  getMetrics() {
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits / (this.hits + this.misses)
    };
  }
}

// Custom validator with detailed logging
class DetailedValidator implements IResponseValidator {
  async validateResponse(response: Response): Promise<void> {
    console.log("Validating response:", {
      url: response.url,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }
}

// Combine all customizations
const cache = new MetricsCache();

const sdk = new SpotifyApi(
  SpotifyApi.performUserAuthorization(
    "client-id",
    "redirect-uri",
    ["user-read-private"]
  ),
  {
    cachingStrategy: cache,
    responseValidator: new DetailedValidator(),

    beforeRequest: async (url, request) => {
      console.log(`→ ${request.method} ${url}`);
      return request;
    },

    afterRequest: async (url, request, response) => {
      console.log(`← ${response.status} ${url}`);
      return response;
    },

    errorHandler: async (error) => {
      console.error("API Error:", error);
      throw error;
    }
  }
);

// Later, check cache metrics
console.log("Cache metrics:", cache.getMetrics());
```

## Best Practices

1. **Keep it simple:** Only customize what you need
2. **Handle errors:** Custom implementations should handle edge cases
3. **Performance:** Ensure custom logic doesn't slow down requests
4. **Type safety:** Use TypeScript interfaces for custom implementations
5. **Testing:** Test custom implementations thoroughly
6. **Documentation:** Document custom behavior for team members
7. **Monitoring:** Log custom behavior for debugging
8. **Fallbacks:** Provide fallback behavior for failures
9. **Configuration:** Make customizations configurable
10. **Compatibility:** Ensure custom implementations work across environments

## Related Topics

- [Error Handling](error-handling.md): Custom error handling patterns
- [Token Management](../auth/token-management.md): Custom caching for tokens
- [TypeScript Usage](typescript.md): Type-safe customization
