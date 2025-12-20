# Rate Limits

Apple Music API implements rate limiting to ensure service stability and fair usage. Understanding and respecting these limits is essential for reliable applications.

## Rate Limit Policy

Apple does not publicly document specific rate limits, but they exist and are enforced. Exceeding limits results in `429 Too Many Requests` responses.

## HTTP 429 Response

When rate limited, the API returns:

```json
{
  "errors": [
    {
      "id": "...",
      "status": "429",
      "code": "RATE_LIMIT_EXCEEDED",
      "title": "Rate Limit Exceeded",
      "detail": "Too many requests"
    }
  ]
}
```

### Retry-After Header

The response may include a `Retry-After` header indicating when to retry:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

The value is in seconds.

## Best Practices

### 1. Implement Exponential Backoff

```typescript
async function fetchWithBackoff<T>(
  fetchFn: () => Promise<Response>,
  maxRetries: number = 5
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetchFn();

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter
        ? parseInt(retryAfter) * 1000
        : Math.pow(2, attempt) * 1000; // Exponential: 1s, 2s, 4s, 8s, 16s

      console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);

      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }

  throw new Error('Max retries exceeded for rate limit');
}
```

### 2. Request Batching

Reduce API calls by batching requests:

```typescript
// Bad: Multiple individual requests
for (const id of albumIds) {
  await getAlbum('us', id, token);
}

// Good: Single batch request
const albums = await getAlbums('us', albumIds, token);
```

### 3. Caching

Cache responses to minimize API calls:

```typescript
class RateLimitedCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly ttl: number;

  constructor(ttlMinutes: number = 10) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  async get<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);

    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < this.ttl) {
        return cached.data;
      }
    }

    const data = await fetchFn();

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    return data;
  }
}

// Usage
const cache = new RateLimitedCache(10);

const album = await cache.get(`album-us-123`, () =>
  getAlbum('us', '123', token)
);
```

### 4. Request Throttling

Limit concurrent requests:

```typescript
class RequestThrottler {
  private queue: Array<() => Promise<any>> = [];
  private activeRequests = 0;

  constructor(
    private maxConcurrent: number = 5,
    private minDelay: number = 100 // ms between requests
  ) {}

  async enqueue<T>(fetchFn: () => Promise<T>): Promise<T> {
    while (this.activeRequests >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.activeRequests++;

    try {
      await new Promise(resolve => setTimeout(resolve, this.minDelay));
      return await fetchFn();
    } finally {
      this.activeRequests--;
    }
  }
}

// Usage
const throttler = new RequestThrottler(5, 200);

const results = await Promise.all(
  albumIds.map(id =>
    throttler.enqueue(() => getAlbum('us', id, token))
  )
);
```

## Rate Limit Tracker

Track request rates and estimate limits:

```typescript
class RateLimitTracker {
  private requests: number[] = [];
  private readonly windowMs: number;

  constructor(windowMinutes: number = 1) {
    this.windowMs = windowMinutes * 60 * 1000;
  }

  recordRequest(): void {
    const now = Date.now();
    this.requests.push(now);
    this.cleanup();
  }

  getRequestCount(): number {
    this.cleanup();
    return this.requests.length;
  }

  getRate(): number {
    const count = this.getRequestCount();
    return count / (this.windowMs / 60000); // requests per minute
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.windowMs;
    this.requests = this.requests.filter(time => time > cutoff);
  }

  shouldThrottle(maxPerMinute: number): boolean {
    return this.getRate() >= maxPerMinute;
  }
}

// Usage
const tracker = new RateLimitTracker(1);

async function fetchWithTracking<T>(
  fetchFn: () => Promise<T>
): Promise<T> {
  if (tracker.shouldThrottle(100)) { // Estimate: 100 req/min
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  tracker.recordRequest();
  return await fetchFn();
}
```

## Handling 429 Errors

Comprehensive rate limit handler:

```typescript
class RateLimitHandler {
  private retryCount = 0;
  private maxRetries: number;

  constructor(maxRetries: number = 5) {
    this.maxRetries = maxRetries;
  }

  async handle<T>(
    fetchFn: () => Promise<Response>
  ): Promise<T> {
    this.retryCount = 0;

    while (this.retryCount < this.maxRetries) {
      try {
        const response = await fetchFn();

        if (response.status === 429) {
          await this.handleRateLimit(response);
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        this.retryCount = 0;
        return await response.json();
      } catch (error) {
        if (this.retryCount >= this.maxRetries - 1) {
          throw error;
        }
      }
    }

    throw new Error('Max retries exceeded');
  }

  private async handleRateLimit(response: Response): Promise<void> {
    this.retryCount++;

    const retryAfter = response.headers.get('Retry-After');
    const baseDelay = retryAfter
      ? parseInt(retryAfter) * 1000
      : Math.pow(2, this.retryCount) * 1000;

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 1000;
    const delay = baseDelay + jitter;

    console.log(
      `Rate limited. Retry ${this.retryCount}/${this.maxRetries} after ${Math.round(delay)}ms`
    );

    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Usage
const handler = new RateLimitHandler(5);

const album = await handler.handle<Album>(() =>
  fetch(url, { headers })
);
```

## Adaptive Rate Limiting

Automatically adjust request rate based on responses:

```typescript
class AdaptiveRateLimiter {
  private requestDelay = 100; // Initial delay in ms
  private readonly minDelay = 50;
  private readonly maxDelay = 5000;

  async request<T>(fetchFn: () => Promise<Response>): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, this.requestDelay));

    const response = await fetchFn();

    if (response.status === 429) {
      // Increase delay on rate limit
      this.requestDelay = Math.min(this.requestDelay * 2, this.maxDelay);

      const retryAfter = response.headers.get('Retry-After');
      if (retryAfter) {
        this.requestDelay = Math.max(
          parseInt(retryAfter) * 1000,
          this.requestDelay
        );
      }

      throw new Error('Rate limited');
    } else {
      // Decrease delay on success
      this.requestDelay = Math.max(this.requestDelay * 0.9, this.minDelay);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }

  getCurrentDelay(): number {
    return this.requestDelay;
  }
}

// Usage
const limiter = new AdaptiveRateLimiter();

for (const id of albumIds) {
  try {
    const album = await limiter.request<Album>(() =>
      fetch(`https://api.music.apple.com/v1/catalog/us/albums/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    );
    console.log(album.attributes.name);
  } catch (error) {
    if (error.message === 'Rate limited') {
      // Retry with backoff
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}
```

## Request Queue

Implement a queue system for rate-limited requests:

```typescript
class RequestQueue {
  private queue: Array<{
    execute: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  private processing = false;
  private requestsPerSecond: number;

  constructor(requestsPerSecond: number = 10) {
    this.requestsPerSecond = requestsPerSecond;
  }

  async add<T>(fetchFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        execute: fetchFn,
        resolve,
        reject
      });

      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;

      try {
        const result = await item.execute();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }

      // Wait before next request
      const delay = 1000 / this.requestsPerSecond;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.processing = false;
  }

  size(): number {
    return this.queue.length;
  }
}

// Usage
const queue = new RequestQueue(10); // 10 requests per second

const albums = await Promise.all(
  albumIds.map(id =>
    queue.add(() => getAlbum('us', id, token))
  )
);
```

## Monitoring

Track rate limit metrics:

```typescript
interface RateLimitMetrics {
  totalRequests: number;
  rateLimitedRequests: number;
  averageDelay: number;
  maxDelay: number;
}

class RateLimitMonitor {
  private metrics: RateLimitMetrics = {
    totalRequests: 0,
    rateLimitedRequests: 0,
    averageDelay: 0,
    maxDelay: 0
  };

  private delays: number[] = [];

  recordRequest(wasRateLimited: boolean, delay?: number): void {
    this.metrics.totalRequests++;

    if (wasRateLimited) {
      this.metrics.rateLimitedRequests++;
    }

    if (delay !== undefined) {
      this.delays.push(delay);
      this.metrics.maxDelay = Math.max(this.metrics.maxDelay, delay);
      this.metrics.averageDelay =
        this.delays.reduce((a, b) => a + b, 0) / this.delays.length;
    }
  }

  getMetrics(): RateLimitMetrics {
    return { ...this.metrics };
  }

  getRateLimitPercentage(): number {
    if (this.metrics.totalRequests === 0) return 0;
    return (this.metrics.rateLimitedRequests / this.metrics.totalRequests) * 100;
  }
}

// Usage
const monitor = new RateLimitMonitor();

async function monitoredFetch<T>(fetchFn: () => Promise<Response>): Promise<T> {
  const startTime = Date.now();

  try {
    const response = await fetchFn();

    if (response.status === 429) {
      const delay = Date.now() - startTime;
      monitor.recordRequest(true, delay);
      throw new Error('Rate limited');
    }

    monitor.recordRequest(false);
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// View metrics
console.log('Rate Limit Stats:', monitor.getMetrics());
console.log('Rate Limited:', monitor.getRateLimitPercentage().toFixed(2) + '%');
```

## Best Practices Summary

1. **Implement retry logic**: Always retry 429 errors with exponential backoff
2. **Respect Retry-After**: Use the header value when provided
3. **Batch requests**: Combine multiple requests when possible
4. **Cache responses**: Store frequently accessed data
5. **Throttle requests**: Limit concurrent and per-second requests
6. **Add jitter**: Randomize retry delays to prevent thundering herd
7. **Monitor metrics**: Track rate limit occurrences
8. **Adaptive limiting**: Adjust request rate based on responses
9. **Use queues**: Implement request queues for large batches
10. **Be conservative**: Start with lower rates and increase carefully

## Related Documentation

- [Error Handling](../core/error-handling.md): Handling 429 errors
- [Request Format](../core/request-format.md): Optimizing requests
