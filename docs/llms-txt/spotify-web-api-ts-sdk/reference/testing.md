# Testing

The Spotify Web API TypeScript SDK can be tested using various strategies, from mocking API responses to integration testing with real Spotify credentials.

## Unit Testing with Mocks

### Mocking the SDK

Create a mock SDK instance for unit tests:

```typescript
import { Track, Artist } from "@spotify/web-api-ts-sdk";

// Mock track data
const mockTrack: Track = {
  id: "mock-track-id",
  name: "Mock Track",
  artists: [
    {
      id: "mock-artist-id",
      name: "Mock Artist",
      uri: "spotify:artist:mock-artist-id",
      external_urls: { spotify: "https://open.spotify.com/artist/mock" },
      type: "artist"
    }
  ],
  album: {
    id: "mock-album-id",
    name: "Mock Album",
    artists: [],
    album_type: "album",
    release_date: "2024-01-01",
    release_date_precision: "day",
    images: [],
    external_urls: { spotify: "https://open.spotify.com/album/mock" },
    uri: "spotify:album:mock-album-id",
    available_markets: ["US"],
    total_tracks: 10,
    type: "album"
  },
  duration_ms: 200000,
  explicit: false,
  popularity: 75,
  track_number: 1,
  disc_number: 1,
  type: "track",
  uri: "spotify:track:mock-track-id",
  external_urls: { spotify: "https://open.spotify.com/track/mock" },
  external_ids: { isrc: "MOCK123456" },
  preview_url: "https://example.com/preview.mp3",
  available_markets: ["US"],
  is_local: false
};

// Mock SDK
const mockSdk = {
  tracks: {
    get: jest.fn().mockResolvedValue(mockTrack),
    getTracks: jest.fn().mockResolvedValue([mockTrack]),
    audioFeatures: jest.fn().mockResolvedValue({
      id: "mock-track-id",
      danceability: 0.8,
      energy: 0.7,
      key: 5,
      loudness: -5,
      mode: 1,
      speechiness: 0.05,
      acousticness: 0.2,
      instrumentalness: 0.0,
      liveness: 0.1,
      valence: 0.6,
      tempo: 120,
      duration_ms: 200000,
      time_signature: 4
    })
  },
  search: jest.fn().mockResolvedValue({
    tracks: {
      items: [mockTrack],
      total: 1,
      limit: 20,
      offset: 0,
      next: null,
      previous: null,
      href: "https://api.spotify.com/v1/search"
    }
  })
};

// Test
describe("Music Service", () => {
  it("should fetch track", async () => {
    const track = await mockSdk.tracks.get("mock-track-id");
    expect(track.name).toBe("Mock Track");
    expect(mockSdk.tracks.get).toHaveBeenCalledWith("mock-track-id");
  });
});
```

### Using Jest

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

// Mock the entire module
jest.mock("@spotify/web-api-ts-sdk");

describe("Spotify Integration", () => {
  let sdk: jest.Mocked<SpotifyApi>;

  beforeEach(() => {
    sdk = {
      tracks: {
        get: jest.fn(),
      },
      search: jest.fn(),
    } as any;
  });

  it("should search for tracks", async () => {
    const mockResults = {
      tracks: {
        items: [mockTrack],
        total: 1,
        limit: 20,
        offset: 0,
        next: null,
        previous: null,
        href: ""
      }
    };

    sdk.search.mockResolvedValue(mockResults);

    const results = await sdk.search("test query", ["track"]);
    expect(results.tracks?.items).toHaveLength(1);
    expect(sdk.search).toHaveBeenCalledWith("test query", ["track"]);
  });
});
```

### Using Vitest

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

describe("Spotify Service", () => {
  let sdk: any;

  beforeEach(() => {
    sdk = {
      tracks: {
        get: vi.fn().mockResolvedValue(mockTrack)
      }
    };
  });

  it("fetches track by id", async () => {
    const track = await sdk.tracks.get("track-id");
    expect(track.id).toBe("mock-track-id");
  });
});
```

## Integration Testing

### Setup for Integration Tests

Integration tests require real Spotify credentials:

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

describe("Spotify API Integration", () => {
  let sdk: SpotifyApi;

  beforeAll(() => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Missing Spotify credentials");
    }

    sdk = SpotifyApi.withClientCredentials(clientId, clientSecret);
  });

  it("should fetch a real track", async () => {
    const track = await sdk.tracks.get("11dFghVXANMlKmJXsNCbNl");
    expect(track.id).toBe("11dFghVXANMlKmJXsNCbNl");
    expect(track.name).toBeTruthy();
  });

  it("should search for artists", async () => {
    const results = await sdk.search("Beatles", ["artist"]);
    expect(results.artists).toBeDefined();
    expect(results.artists!.items.length).toBeGreaterThan(0);
  });
});
```

### Environment Variables

Create a `.env.test` file:

```bash
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REFRESH_TOKEN=your_refresh_token  # For user-specific tests
```

Load in tests:

```typescript
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });
```

## Testing with User Authentication

For endpoints requiring user authentication:

```typescript
describe("User-specific endpoints", () => {
  let sdk: SpotifyApi;

  beforeAll(() => {
    const clientId = process.env.SPOTIFY_CLIENT_ID!;
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN!;

    sdk = SpotifyApi.withAccessToken(clientId, {
      access_token: "",  // Will be refreshed
      token_type: "Bearer",
      expires_in: 0,
      refresh_token: refreshToken
    });
  });

  it("should get user profile", async () => {
    const profile = await sdk.currentUser.profile();
    expect(profile.id).toBeTruthy();
  });

  it("should get user playlists", async () => {
    const playlists = await sdk.currentUser.playlists.playlists(10);
    expect(playlists.items).toBeDefined();
  });
});
```

## Testing Error Handling

### Test Error Scenarios

```typescript
describe("Error handling", () => {
  let sdk: any;

  beforeEach(() => {
    sdk = {
      tracks: {
        get: vi.fn()
      }
    };
  });

  it("should handle 404 errors", async () => {
    const error = {
      status: 404,
      message: "Track not found"
    };
    sdk.tracks.get.mockRejectedValue(error);

    await expect(sdk.tracks.get("invalid-id")).rejects.toMatchObject({
      status: 404
    });
  });

  it("should handle rate limiting", async () => {
    const error = {
      status: 429,
      message: "Rate limit exceeded",
      headers: { "retry-after": "60" }
    };
    sdk.tracks.get.mockRejectedValue(error);

    await expect(sdk.tracks.get("track-id")).rejects.toMatchObject({
      status: 429
    });
  });
});
```

## Mock Data Factories

Create reusable mock data factories:

```typescript
// test/factories/spotify.ts
export class SpotifyMockFactory {
  static createTrack(overrides?: Partial<Track>): Track {
    return {
      id: "mock-id",
      name: "Mock Track",
      artists: [this.createSimplifiedArtist()],
      album: this.createSimplifiedAlbum(),
      duration_ms: 200000,
      explicit: false,
      popularity: 50,
      track_number: 1,
      disc_number: 1,
      type: "track",
      uri: "spotify:track:mock-id",
      external_urls: { spotify: "https://open.spotify.com/track/mock" },
      external_ids: {},
      preview_url: null,
      available_markets: ["US"],
      is_local: false,
      ...overrides
    };
  }

  static createArtist(overrides?: Partial<Artist>): Artist {
    return {
      id: "mock-artist-id",
      name: "Mock Artist",
      genres: ["rock", "pop"],
      popularity: 75,
      followers: { total: 10000 },
      images: [],
      external_urls: { spotify: "https://open.spotify.com/artist/mock" },
      uri: "spotify:artist:mock-artist-id",
      type: "artist",
      ...overrides
    };
  }

  static createSimplifiedArtist(overrides?: Partial<SimplifiedArtist>): SimplifiedArtist {
    return {
      id: "mock-artist-id",
      name: "Mock Artist",
      uri: "spotify:artist:mock-artist-id",
      external_urls: { spotify: "https://open.spotify.com/artist/mock" },
      type: "artist",
      ...overrides
    };
  }

  static createSimplifiedAlbum(overrides?: Partial<SimplifiedAlbum>): SimplifiedAlbum {
    return {
      id: "mock-album-id",
      name: "Mock Album",
      artists: [this.createSimplifiedArtist()],
      album_type: "album",
      release_date: "2024-01-01",
      release_date_precision: "day",
      images: [],
      external_urls: { spotify: "https://open.spotify.com/album/mock" },
      uri: "spotify:album:mock-album-id",
      available_markets: ["US"],
      total_tracks: 10,
      type: "album",
      ...overrides
    };
  }

  static createPaginatedResponse<T>(
    items: T[],
    overrides?: Partial<Paginated<T>>
  ): Paginated<T> {
    return {
      items,
      total: items.length,
      limit: 20,
      offset: 0,
      next: null,
      previous: null,
      href: "https://api.spotify.com/v1/mock",
      ...overrides
    };
  }
}

// Usage in tests
const mockTrack = SpotifyMockFactory.createTrack({
  name: "Custom Track Name",
  popularity: 90
});
```

## Testing Async Behavior

### Test Pagination

```typescript
describe("Pagination", () => {
  it("should paginate through all results", async () => {
    const mockSdk = {
      artists: {
        albums: vi.fn()
          .mockResolvedValueOnce({
            items: [{ id: "1" }, { id: "2" }],
            total: 4,
            next: "next-url",
            offset: 0,
            limit: 2
          })
          .mockResolvedValueOnce({
            items: [{ id: "3" }, { id: "4" }],
            total: 4,
            next: null,
            offset: 2,
            limit: 2
          })
      }
    };

    const allAlbums = [];
    let offset = 0;

    while (true) {
      const page = await mockSdk.artists.albums("artist-id", undefined, undefined, 2, offset);
      allAlbums.push(...page.items);
      if (!page.next) break;
      offset += 2;
    }

    expect(allAlbums).toHaveLength(4);
    expect(mockSdk.artists.albums).toHaveBeenCalledTimes(2);
  });
});
```

## Snapshot Testing

Test entire response structures:

```typescript
describe("Spotify responses", () => {
  it("should match track structure", async () => {
    const track = await sdk.tracks.get("11dFghVXANMlKmJXsNCbNl");

    expect(track).toMatchSnapshot({
      id: expect.any(String),
      name: expect.any(String),
      popularity: expect.any(Number),
      duration_ms: expect.any(Number)
    });
  });
});
```

## Performance Testing

Test response times and throughput:

```typescript
describe("Performance", () => {
  it("should fetch track within 1 second", async () => {
    const start = Date.now();
    await sdk.tracks.get("11dFghVXANMlKmJXsNCbNl");
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000);
  });

  it("should handle concurrent requests", async () => {
    const trackIds = Array.from({ length: 10 }, (_, i) => `track-${i}`);

    const start = Date.now();
    await Promise.all(
      trackIds.map(id => sdk.tracks.get("11dFghVXANMlKmJXsNCbNl"))
    );
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5000); // All requests in 5 seconds
  });
});
```

## Best Practices

1. **Use mocks for unit tests:** Don't hit real API in unit tests
2. **Separate integration tests:** Use different test suites for integration tests
3. **Environment variables:** Never commit real credentials
4. **Test error cases:** Include tests for error scenarios
5. **Mock factories:** Create reusable mock data generators
6. **Snapshot tests:** Verify response structures
7. **Rate limit awareness:** Add delays in integration tests to avoid rate limits
8. **Clean up:** Remove test data after integration tests
9. **CI/CD:** Only run integration tests in CI with proper credentials
10. **Documentation:** Document how to run tests and obtain credentials

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/test/setup.ts"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["**/*.d.ts", "**/*.test.ts"]
    }
  }
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        env:
          SPOTIFY_CLIENT_ID: ${{ secrets.SPOTIFY_CLIENT_ID }}
          SPOTIFY_CLIENT_SECRET: ${{ secrets.SPOTIFY_CLIENT_SECRET }}
        run: npm run test:integration
```

## Related Topics

- [Error Handling](../core/error-handling.md): Testing error scenarios
- [TypeScript Usage](../core/typescript.md): Type-safe mocks
