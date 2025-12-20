# Quota Management

Understanding and optimizing quota usage for the YouTube Data API to maximize efficiency and avoid quota exhaustion.

## Quota Basics

### Default Allocation

- New projects: 10,000 units per day
- Resets at midnight Pacific Time (PT)
- Sufficient for most use cases

### Quota Calculation

Each API request consumes quota units based on the operation:

| Endpoint | Cost |
|----------|------|
| videos.list | 1 unit |
| channels.list | 1 unit |
| playlists.list | 1 unit |
| playlistItems.list | 1 unit |
| search.list | 100 units |
| commentThreads.list | 1 unit |
| videos.insert | 1600 units |
| playlists.insert | 50 units |
| playlistItems.insert | 50 units |

## Monitoring Quota Usage

### Google API Console

1. Go to [Google API Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Dashboard"
4. Click "YouTube Data API v3"
5. View "Quotas" tab for current usage

### Track Programmatically

```typescript
class QuotaTracker {
  private usage = 0;
  private dailyLimit = 10000;
  private resetTime: Date;

  constructor(dailyLimit: number = 10000) {
    this.dailyLimit = dailyLimit;
    this.resetTime = this.getNextResetTime();
  }

  private getNextResetTime(): Date {
    const now = new Date();
    const reset = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    reset.setDate(reset.getDate() + 1);
    reset.setHours(0, 0, 0, 0);
    return reset;
  }

  addUsage(cost: number): void {
    if (Date.now() >= this.resetTime.getTime()) {
      this.reset();
    }

    this.usage += cost;
  }

  getRemainingQuota(): number {
    if (Date.now() >= this.resetTime.getTime()) {
      this.reset();
    }

    return Math.max(0, this.dailyLimit - this.usage);
  }

  canMakeRequest(cost: number): boolean {
    return this.getRemainingQuota() >= cost;
  }

  getUsagePercentage(): number {
    return (this.usage / this.dailyLimit) * 100;
  }

  private reset(): void {
    this.usage = 0;
    this.resetTime = this.getNextResetTime();
  }

  getTimeUntilReset(): number {
    return Math.max(0, this.resetTime.getTime() - Date.now());
  }
}

// Usage
const tracker = new QuotaTracker();

if (tracker.canMakeRequest(100)) {
  const results = await searchVideos("music", apiKey);
  tracker.addUsage(100);
} else {
  console.log(`Quota exceeded. Resets in ${tracker.getTimeUntilReset()}ms`);
}
```

## Optimization Strategies

### 1. Cache Aggressively

```typescript
class CachedYouTubeClient {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl: { [key: string]: number } = {
    video: 60 * 60 * 1000,      // 1 hour
    channel: 24 * 60 * 60 * 1000, // 24 hours
    playlist: 60 * 60 * 1000,   // 1 hour
    search: 30 * 60 * 1000      // 30 minutes
  };

  private getCacheKey(type: string, params: any): string {
    return `${type}:${JSON.stringify(params)}`;
  }

  async getVideo(videoId: string, apiKey: string): Promise<any> {
    const key = this.getCacheKey("video", { videoId });
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.ttl.video) {
      console.log("Cache hit");
      return cached.data;
    }

    console.log("Cache miss - fetching from API");
    const data = await fetchVideo(videoId, apiKey);

    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      const type = key.split(":")[0];
      if (now - value.timestamp > this.ttl[type]) {
        this.cache.delete(key);
      }
    }
  }
}
```

### 2. Batch Requests

```typescript
// Instead of individual requests (50 units)
for (const id of videoIds) {
  await getVideo(id, apiKey); // 1 unit each × 50 = 50 units
}

// Batch them (1 unit)
const videos = await getVideos(videoIds, apiKey); // 1 unit for up to 50 IDs
```

### 3. Request Only Needed Parts

```typescript
// Bad - requests all parts
await getVideo(videoId, apiKey, "snippet,contentDetails,statistics,status,player");

// Good - request only what you need
await getVideo(videoId, apiKey, "snippet,statistics");
```

### 4. Use Playlists Instead of Search

```typescript
// Expensive - 100 units
const results = await searchVideos("music", apiKey);

// Cheaper - 1 unit for playlist + 1 unit for items
const playlist = await getPlaylist("popular-music-playlist-id", apiKey);
const items = await getPlaylistItems(playlist.id, apiKey);
```

### 5. Minimize Search Usage

```typescript
class SearchOptimizer {
  private searchCache = new Map<string, any>();

  async search(query: string, apiKey: string): Promise<any> {
    // Check cache first
    if (this.searchCache.has(query)) {
      return this.searchCache.get(query);
    }

    // Use search only when necessary
    const results = await searchVideos(query, apiKey);
    this.searchCache.set(query, results);

    return results;
  }

  // Use channel uploads instead of search when possible
  async getChannelVideos(channelId: string, apiKey: string): Promise<any> {
    const channel = await getChannel(channelId, apiKey); // 1 unit
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;
    return getPlaylistItems(uploadsPlaylistId, apiKey); // 1 unit
    // Total: 2 units instead of 100 for search
  }
}
```

### 6. Implement Request Deduplication

```typescript
class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();

  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      console.log("Deduplicating request");
      return this.pending.get(key)!;
    }

    const promise = fn();
    this.pending.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.pending.delete(key);
    }
  }
}

// Usage
const deduplicator = new RequestDeduplicator();

// Multiple simultaneous requests for same video = only 1 API call
const [video1, video2, video3] = await Promise.all([
  deduplicator.dedupe("video:abc123", () => getVideo("abc123", apiKey)),
  deduplicator.dedupe("video:abc123", () => getVideo("abc123", apiKey)),
  deduplicator.dedupe("video:abc123", () => getVideo("abc123", apiKey))
]);
```

## Quota-Aware Client

```typescript
class QuotaAwareYouTubeClient {
  private tracker: QuotaTracker;
  private cache: CachedYouTubeClient;
  private deduplicator: RequestDeduplicator;

  constructor(dailyLimit: number = 10000) {
    this.tracker = new QuotaTracker(dailyLimit);
    this.cache = new CachedYouTubeClient();
    this.deduplicator = new RequestDeduplicator();
  }

  private async executeRequest<T>(
    cost: number,
    cacheKey: string,
    fn: () => Promise<T>
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Check quota
    if (!this.tracker.canMakeRequest(cost)) {
      const resetTime = this.tracker.getTimeUntilReset();
      throw new Error(`Quota exceeded. Resets in ${Math.ceil(resetTime / 1000)}s`);
    }

    // Deduplicate and execute
    const result = await this.deduplicator.dedupe(cacheKey, fn);

    // Track usage
    this.tracker.addUsage(cost);

    // Cache result
    this.cache.set(cacheKey, result);

    return result;
  }

  async getVideo(videoId: string, apiKey: string): Promise<any> {
    return this.executeRequest(
      1,
      `video:${videoId}`,
      () => fetchVideo(videoId, apiKey)
    );
  }

  async searchVideos(query: string, apiKey: string): Promise<any> {
    return this.executeRequest(
      100,
      `search:${query}`,
      () => fetchSearchResults(query, apiKey)
    );
  }

  getQuotaStatus() {
    return {
      remaining: this.tracker.getRemainingQuota(),
      used: this.tracker.getUsagePercentage(),
      resetTime: this.tracker.getTimeUntilReset()
    };
  }
}
```

## Quota Extension

If 10,000 units/day is insufficient:

1. Go to [YouTube API Services - Audit and Quota Extension Form](https://support.google.com/youtube/contact/yt_api_form)
2. Complete compliance audit demonstrating adherence to Terms of Service
3. Provide details about your application and usage
4. Wait for approval (can take several weeks)

### Requirements for Extension

- Demonstrate legitimate use case
- Show compliance with YouTube API Terms of Service
- Provide accurate usage estimates
- Explain why default quota is insufficient

## Cost Analysis

### Example Usage Patterns

**Music Streaming App:**
```typescript
// Daily operations
const searchCost = 100;      // 1 search
const videoCost = 1 * 50;    // 50 video lookups
const playlistCost = 1 * 10; // 10 playlist lookups
const channelCost = 1 * 5;   // 5 channel lookups

const totalDaily = searchCost + videoCost + playlistCost + channelCost;
// = 100 + 50 + 10 + 5 = 165 units/day
// Can support ~60 users with this pattern
```

**Heavy Search App:**
```typescript
// 100 searches per day
const dailyCost = 100 * 100; // = 10,000 units
// Uses entire quota with searches alone
// Needs optimization or quota extension
```

## Best Practices

1. **Cache everything**: Especially search results (expensive)
2. **Batch requests**: Request up to 50 items per call
3. **Use parts wisely**: Request only needed properties
4. **Avoid search when possible**: Use playlists, channels, or browse
5. **Implement rate limiting**: Prevent quota exhaustion
6. **Monitor usage**: Track quota consumption
7. **Plan for quota limits**: Design around constraints
8. **Request extensions early**: If you'll need more quota
9. **Deduplicate requests**: Avoid redundant API calls
10. **Use webhooks**: For updates instead of polling (when available)

## Quota Calculator

```typescript
class QuotaCalculator {
  private costs = {
    "videos.list": 1,
    "channels.list": 1,
    "playlists.list": 1,
    "playlistItems.list": 1,
    "search.list": 100,
    "videos.insert": 1600,
    "playlists.insert": 50
  };

  calculate(operations: Record<string, number>): number {
    let total = 0;

    for (const [operation, count] of Object.entries(operations)) {
      const cost = this.costs[operation as keyof typeof this.costs] || 0;
      total += cost * count;
    }

    return total;
  }

  estimateDaily(operations: Record<string, number>): {
    total: number;
    percentage: number;
    canFit: boolean;
  } {
    const total = this.calculate(operations);
    const percentage = (total / 10000) * 100;

    return {
      total,
      percentage,
      canFit: total <= 10000
    };
  }

  maxOperations(operation: string, budget: number = 10000): number {
    const cost = this.costs[operation as keyof typeof this.costs] || 1;
    return Math.floor(budget / cost);
  }
}

// Usage
const calculator = new QuotaCalculator();

const estimate = calculator.estimateDaily({
  "search.list": 50,
  "videos.list": 100,
  "playlists.list": 20
});

console.log(`Daily cost: ${estimate.total} units (${estimate.percentage.toFixed(1)}%)`);
console.log(`Can fit: ${estimate.canFit}`);
console.log(`Max searches: ${calculator.maxOperations("search.list")}`);
```

## Related Topics

- [Error Handling](error-handling.md): Handle quota exceeded errors
- [Search API](../api/search.md): Optimize expensive searches
- [Videos API](../api/videos.md): Batch video requests
