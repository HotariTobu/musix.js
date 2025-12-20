import { afterEach, describe, expect, mock, test } from "bun:test";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import {
  AuthenticationError,
  NetworkError,
  NoActiveDeviceError,
  NotFoundError,
  PremiumRequiredError,
  RateLimitError,
  SpotifyApiError,
  ValidationError,
} from "../../core/errors";
import type { SpotifyAdapter, SpotifyConfig } from "../../core/types";

// Import the factory function (will fail until FR-001 is implemented)
import { createSpotifyAdapter } from "./index";

// Store original withClientCredentials to restore after each test
const originalWithClientCredentials = SpotifyApi.withClientCredentials;

// Restore mock after each test to prevent test pollution
afterEach(() => {
  SpotifyApi.withClientCredentials = originalWithClientCredentials;
});

// Mock Spotify SDK response data
const createMockSpotifyTrack = (overrides: Record<string, unknown> = {}) => ({
  id: "4iV5W9uYEdYUVa79Axb7Rh",
  name: "Hotel California",
  duration_ms: 391376,
  preview_url: "https://p.scdn.co/mp3-preview/abc123",
  external_urls: {
    spotify: "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh",
  },
  artists: [
    {
      id: "0ECwFtbIWEVNwjlrfc6xoL",
      name: "Eagles",
      external_urls: {
        spotify: "https://open.spotify.com/artist/0ECwFtbIWEVNwjlrfc6xoL",
      },
    },
  ],
  album: {
    id: "2widuo17g5CEC66IbzveRu",
    name: "Hotel California",
    release_date: "1976-12-08",
    total_tracks: 9,
    images: [
      { url: "https://i.scdn.co/image/abc123", width: 640, height: 640 },
      { url: "https://i.scdn.co/image/abc456", width: 300, height: 300 },
    ],
    external_urls: {
      spotify: "https://open.spotify.com/album/2widuo17g5CEC66IbzveRu",
    },
    artists: [
      {
        id: "0ECwFtbIWEVNwjlrfc6xoL",
        name: "Eagles",
        external_urls: {
          spotify: "https://open.spotify.com/artist/0ECwFtbIWEVNwjlrfc6xoL",
        },
      },
    ],
  },
  ...overrides,
});

// Create mock SDK with configurable behavior
const createMockSdk = (
  trackData: unknown = createMockSpotifyTrack(),
  shouldThrow = false,
  errorStatus = 404,
) => {
  const mockGet = mock(async (id: string) => {
    if (shouldThrow) {
      const error = new Error("Not found") as Error & { status: number };
      error.status = errorStatus;
      throw error;
    }
    return trackData;
  });

  return {
    tracks: { get: mockGet },
  };
};

// AC-001: Adapter initialization [FR-001]
describe("createSpotifyAdapter", () => {
  describe("Factory Function", () => {
    // AC-001: Given valid Client ID and Client Secret
    test("should be exported and be a function", () => {
      expect(createSpotifyAdapter).toBeDefined();
      expect(typeof createSpotifyAdapter).toBe("function");
    });

    // AC-001: When createSpotifyAdapter is called, Then SpotifyAdapter instance is returned
    test("should return an object when called with valid config", () => {
      // Given: valid Client ID and Client Secret
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: createSpotifyAdapter is called
      const adapter = createSpotifyAdapter(config);

      // Then: an object is returned
      expect(adapter).toBeDefined();
      expect(typeof adapter).toBe("object");
      expect(adapter).not.toBeNull();
    });

    // AC-001: Instance has all required methods
    test("should return adapter with getTrack method", () => {
      // Given: valid config
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: adapter is created
      const adapter = createSpotifyAdapter(config);

      // Then: getTrack method exists and is a function
      expect(adapter.getTrack).toBeDefined();
      expect(typeof adapter.getTrack).toBe("function");
    });

    test("should return adapter with searchTracks method", () => {
      // Given: valid config
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: adapter is created
      const adapter = createSpotifyAdapter(config);

      // Then: searchTracks method exists and is a function
      expect(adapter.searchTracks).toBeDefined();
      expect(typeof adapter.searchTracks).toBe("function");
    });

    test("should return adapter with getAlbum method", () => {
      // Given: valid config
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: adapter is created
      const adapter = createSpotifyAdapter(config);

      // Then: getAlbum method exists and is a function
      expect(adapter.getAlbum).toBeDefined();
      expect(typeof adapter.getAlbum).toBe("function");
    });

    test("should return adapter with getArtist method", () => {
      // Given: valid config
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: adapter is created
      const adapter = createSpotifyAdapter(config);

      // Then: getArtist method exists and is a function
      expect(adapter.getArtist).toBeDefined();
      expect(typeof adapter.getArtist).toBe("function");
    });

    test("should return adapter with getPlaylist method", () => {
      // Given: valid config
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: adapter is created
      const adapter = createSpotifyAdapter(config);

      // Then: getPlaylist method exists and is a function
      expect(adapter.getPlaylist).toBeDefined();
      expect(typeof adapter.getPlaylist).toBe("function");
    });
  });

  describe("Adapter Interface Compliance", () => {
    // AC-001: Verify the returned object conforms to SpotifyAdapter interface
    test("should return object that satisfies SpotifyAdapter interface", () => {
      // Given: valid config
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: adapter is created
      const adapter = createSpotifyAdapter(config);

      // Then: adapter has all required methods from SpotifyAdapter interface
      const expectedMethods = [
        "getTrack",
        "searchTracks",
        "getAlbum",
        "getArtist",
        "getPlaylist",
      ];

      for (const method of expectedMethods) {
        expect(adapter).toHaveProperty(method);
        expect(typeof adapter[method as keyof SpotifyAdapter]).toBe("function");
      }
    });

    test("should return object assignable to SpotifyAdapter type", () => {
      // Given: valid config
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: adapter is created
      const adapter = createSpotifyAdapter(config);

      // Then: TypeScript should accept assignment to SpotifyAdapter type
      const typedAdapter: SpotifyAdapter = adapter;
      expect(typedAdapter).toBeDefined();
    });
  });

  describe("Configuration Handling", () => {
    // AC-001: Config with clientId and clientSecret
    test("should accept config with clientId and clientSecret", () => {
      // Given: config with both required fields
      const config: SpotifyConfig = {
        clientId: "my-client-id",
        clientSecret: "my-client-secret",
      };

      // When/Then: should not throw
      expect(() => createSpotifyAdapter(config)).not.toThrow();
    });

    test("should handle different clientId values", () => {
      // Given: configs with different clientId formats
      const configs = [
        { clientId: "short", clientSecret: "secret" },
        { clientId: "a1b2c3d4e5f6g7h8", clientSecret: "secret" },
        { clientId: "client-with-dashes", clientSecret: "secret" },
        { clientId: "CLIENT_UPPERCASE", clientSecret: "secret" },
      ];

      // When/Then: all should create adapters successfully
      for (const config of configs) {
        const adapter = createSpotifyAdapter(config);
        expect(adapter).toBeDefined();
        expect(typeof adapter).toBe("object");
      }
    });

    test("should handle different clientSecret values", () => {
      // Given: configs with different clientSecret formats
      const configs = [
        { clientId: "client", clientSecret: "short" },
        { clientId: "client", clientSecret: "fake-secret-for-testing" },
        { clientId: "client", clientSecret: "secret-with-dashes" },
        { clientId: "client", clientSecret: "SECRET_UPPERCASE" },
      ];

      // When/Then: all should create adapters successfully
      for (const config of configs) {
        const adapter = createSpotifyAdapter(config);
        expect(adapter).toBeDefined();
        expect(typeof adapter).toBe("object");
      }
    });
  });

  describe("Multiple Instances", () => {
    // Verify that multiple adapter instances can be created
    test("should allow creating multiple adapter instances", () => {
      // Given: multiple configs
      const config1: SpotifyConfig = {
        clientId: "client-1",
        clientSecret: "secret-1",
      };
      const config2: SpotifyConfig = {
        clientId: "client-2",
        clientSecret: "secret-2",
      };

      // When: multiple adapters are created
      const adapter1 = createSpotifyAdapter(config1);
      const adapter2 = createSpotifyAdapter(config2);

      // Then: both adapters exist and are distinct objects
      expect(adapter1).toBeDefined();
      expect(adapter2).toBeDefined();
      expect(adapter1).not.toBe(adapter2);
    });

    test("should create independent adapter instances", () => {
      // Given: same config used twice
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: two adapters are created with the same config
      const adapter1 = createSpotifyAdapter(config);
      const adapter2 = createSpotifyAdapter(config);

      // Then: they should be independent instances
      expect(adapter1).not.toBe(adapter2);
      expect(adapter1.getTrack).toBeDefined();
      expect(adapter2.getTrack).toBeDefined();
    });
  });
});

// AC-003 & AC-004: Track Retrieval [FR-002]
describe("getTrack", () => {
  // Helper to create adapter with mocked SDK
  const createMockedAdapter = (mockSdk: ReturnType<typeof createMockSdk>) => {
    SpotifyApi.withClientCredentials = mock(
      () =>
        mockSdk as unknown as ReturnType<
          typeof SpotifyApi.withClientCredentials
        >,
    );
    const config: SpotifyConfig = {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
    };
    return createSpotifyAdapter(config);
  };

  describe("Successful Track Retrieval", () => {
    // AC-003: Given valid auth config, When existing track ID, Then returns Track object
    test("should return Track object with all required properties when track exists", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdk();
      const adapter = createMockedAdapter(mockSdk);

      // When: getTrack is called with existing track ID
      const trackId = "4iV5W9uYEdYUVa79Axb7Rh"; // Hotel California
      const track = await adapter.getTrack(trackId);

      // Then: Track object is returned with required properties
      expect(track).toBeDefined();
      expect(track.id).toBe(trackId);
      expect(typeof track.name).toBe("string");
      expect(track.name.length).toBeGreaterThan(0);
      expect(typeof track.externalUrl).toBe("string");
      expect(track.externalUrl.length).toBeGreaterThan(0);
    });

    // AC-003: artists array contains at least one Artist object
    test("should return Track with at least one artist", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdk();
      const adapter = createMockedAdapter(mockSdk);

      // When: getTrack is called
      const track = await adapter.getTrack("4iV5W9uYEdYUVa79Axb7Rh");

      // Then: artists array contains at least one Artist object
      expect(Array.isArray(track.artists)).toBe(true);
      expect(track.artists.length).toBeGreaterThan(0);
      expect(track.artists[0]).toBeDefined();
      expect(typeof track.artists[0].id).toBe("string");
      expect(typeof track.artists[0].name).toBe("string");
      expect(typeof track.artists[0].externalUrl).toBe("string");
    });

    // AC-003: album object has id and name
    test("should return Track with album containing id and name", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdk();
      const adapter = createMockedAdapter(mockSdk);

      // When: getTrack is called
      const track = await adapter.getTrack("4iV5W9uYEdYUVa79Axb7Rh");

      // Then: album object has id and name
      expect(track.album).toBeDefined();
      expect(typeof track.album.id).toBe("string");
      expect(track.album.id.length).toBeGreaterThan(0);
      expect(typeof track.album.name).toBe("string");
      expect(track.album.name.length).toBeGreaterThan(0);
    });

    // AC-003: durationMs is positive integer
    test("should return Track with positive durationMs", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdk();
      const adapter = createMockedAdapter(mockSdk);

      // When: getTrack is called
      const track = await adapter.getTrack("4iV5W9uYEdYUVa79Axb7Rh");

      // Then: durationMs is positive integer
      expect(typeof track.durationMs).toBe("number");
      expect(track.durationMs).toBeGreaterThan(0);
      expect(Number.isInteger(track.durationMs)).toBe(true);
    });

    // AC-003: Complete Track type structure validation
    test("should return Track conforming to Track type", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdk();
      const adapter = createMockedAdapter(mockSdk);

      // When: getTrack is called
      const track = await adapter.getTrack("4iV5W9uYEdYUVa79Axb7Rh");

      // Then: Track conforms to Track interface
      // Required string properties
      expect(typeof track.id).toBe("string");
      expect(typeof track.name).toBe("string");
      expect(typeof track.externalUrl).toBe("string");

      // Artists array with Artist objects
      expect(Array.isArray(track.artists)).toBe(true);
      for (const artist of track.artists) {
        expect(typeof artist.id).toBe("string");
        expect(typeof artist.name).toBe("string");
        expect(typeof artist.externalUrl).toBe("string");
      }

      // Album object
      expect(typeof track.album).toBe("object");
      expect(track.album).not.toBeNull();
      expect(typeof track.album.id).toBe("string");
      expect(typeof track.album.name).toBe("string");
      expect(Array.isArray(track.album.artists)).toBe(true);
      expect(typeof track.album.releaseDate).toBe("string");
      expect(typeof track.album.totalTracks).toBe("number");
      expect(Array.isArray(track.album.images)).toBe(true);
      expect(typeof track.album.externalUrl).toBe("string");

      // Duration
      expect(typeof track.durationMs).toBe("number");

      // Preview URL (nullable)
      expect(
        track.previewUrl === null || typeof track.previewUrl === "string",
      ).toBe(true);
    });

    // AC-003: previewUrl can be null or string
    test("should handle tracks with null previewUrl", async () => {
      // Given: valid authentication config with mocked SDK returning null previewUrl
      const mockSdk = createMockSdk(
        createMockSpotifyTrack({ preview_url: null }),
      );
      const adapter = createMockedAdapter(mockSdk);

      // When: getTrack is called for track without preview
      const track = await adapter.getTrack("track-without-preview");

      // Then: previewUrl is null
      expect(track.previewUrl).toBeNull();
    });

    // AC-003: previewUrl with actual URL
    test("should return Track with previewUrl when available", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdk();
      const adapter = createMockedAdapter(mockSdk);

      // When: getTrack is called for track with preview
      const track = await adapter.getTrack("4iV5W9uYEdYUVa79Axb7Rh");

      // Then: previewUrl is a string (if available) or null
      if (track.previewUrl !== null) {
        expect(typeof track.previewUrl).toBe("string");
        expect(track.previewUrl.startsWith("http")).toBe(true);
      }
    });

    // AC-003: Multiple artists handling
    test("should handle tracks with multiple artists", async () => {
      // Given: valid authentication config with mocked SDK returning multiple artists
      const mockTrack = createMockSpotifyTrack({
        artists: [
          {
            id: "artist1",
            name: "Artist 1",
            external_urls: { spotify: "https://open.spotify.com/artist/1" },
          },
          {
            id: "artist2",
            name: "Artist 2",
            external_urls: { spotify: "https://open.spotify.com/artist/2" },
          },
        ],
      });
      const mockSdk = createMockSdk(mockTrack);
      const adapter = createMockedAdapter(mockSdk);

      // When: getTrack is called for track with multiple artists
      const track = await adapter.getTrack("track-with-multiple-artists");

      // Then: all artists are included
      expect(Array.isArray(track.artists)).toBe(true);
      expect(track.artists.length).toBe(2);
      for (const artist of track.artists) {
        expect(artist.id).toBeDefined();
        expect(artist.name).toBeDefined();
        expect(artist.externalUrl).toBeDefined();
      }
    });

    // AC-003: Album images array validation
    test("should return Track with album.images array", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdk();
      const adapter = createMockedAdapter(mockSdk);

      // When: getTrack is called
      const track = await adapter.getTrack("4iV5W9uYEdYUVa79Axb7Rh");

      // Then: album.images is an array
      expect(Array.isArray(track.album.images)).toBe(true);

      // If images exist, validate structure
      if (track.album.images.length > 0) {
        for (const image of track.album.images) {
          expect(typeof image.url).toBe("string");
          expect(image.width === null || typeof image.width === "number").toBe(
            true,
          );
          expect(
            image.height === null || typeof image.height === "number",
          ).toBe(true);
        }
      }
    });

    // AC-003: External URL format validation
    test("should return Track with valid Spotify external URLs", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdk();
      const adapter = createMockedAdapter(mockSdk);

      // When: getTrack is called
      const track = await adapter.getTrack("4iV5W9uYEdYUVa79Axb7Rh");

      // Then: external URLs should be valid Spotify URLs
      expect(track.externalUrl).toContain("spotify.com");
      expect(track.artists[0].externalUrl).toContain("spotify.com");
      expect(track.album.externalUrl).toContain("spotify.com");
    });
  });

  describe("Error Handling - Not Found", () => {
    // AC-004: Given valid auth, When non-existent track ID, Then throws NotFoundError
    test("should throw NotFoundError when track does not exist", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdk(undefined, true, 404);
      const adapter = createMockedAdapter(mockSdk);

      // When/Then: calling getTrack with non-existent ID throws NotFoundError
      const nonExistentId = "invalid-track-id-12345";
      await expect(adapter.getTrack(nonExistentId)).rejects.toThrow(
        NotFoundError,
      );
    });

    // AC-004: resourceType is "track"
    test("should throw NotFoundError with resourceType='track'", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdk(undefined, true, 404);
      const adapter = createMockedAdapter(mockSdk);

      // When: calling getTrack with non-existent ID
      const nonExistentId = "invalid-track-id-12345";

      // Then: error has resourceType='track'
      try {
        await adapter.getTrack(nonExistentId);
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.resourceType).toBe("track");
        }
      }
    });

    // AC-004: resourceId is the specified ID
    test("should throw NotFoundError with correct resourceId", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdk(undefined, true, 404);
      const adapter = createMockedAdapter(mockSdk);

      // When: calling getTrack with non-existent ID
      const nonExistentId = "test-invalid-id-999";

      // Then: error has resourceId set to the requested ID
      try {
        await adapter.getTrack(nonExistentId);
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.resourceId).toBe(nonExistentId);
        }
      }
    });

    // AC-004: Error message format
    test("should throw NotFoundError with formatted error message", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdk(undefined, true, 404);
      const adapter = createMockedAdapter(mockSdk);

      // When: calling getTrack with non-existent ID
      const nonExistentId = "missing-track-123";

      // Then: error message contains track and ID
      try {
        await adapter.getTrack(nonExistentId);
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.message).toContain("track");
          expect(error.message).toContain(nonExistentId);
        }
      }
    });

    // AC-004: NotFoundError is catchable with instanceof
    test("should be catchable using instanceof NotFoundError", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdk(undefined, true, 404);
      const adapter = createMockedAdapter(mockSdk);

      // When/Then: can catch using instanceof
      try {
        await adapter.getTrack("non-existent-id");
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        const isNotFoundError = error instanceof NotFoundError;
        expect(isNotFoundError).toBe(true);
      }
    });
  });

  describe("Edge Cases", () => {
    // Edge case: Empty string ID
    test("should handle empty string track ID gracefully", async () => {
      // Given: valid authentication config with mocked SDK that throws 404 for empty ID
      const mockSdk = createMockSdk(undefined, true, 404);
      const adapter = createMockedAdapter(mockSdk);

      // When/Then: calling with empty string should throw error
      await expect(adapter.getTrack("")).rejects.toThrow();
    });

    // Edge case: Very long ID string
    test("should handle very long track ID strings", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdk(undefined, true, 404);
      const adapter = createMockedAdapter(mockSdk);

      // When: calling with very long ID
      const longId = "a".repeat(1000);

      // Then: should handle gracefully (likely NotFoundError)
      await expect(adapter.getTrack(longId)).rejects.toThrow();
    });

    // Edge case: Special characters in ID
    test("should handle track IDs with special characters", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdk(undefined, true, 404);
      const adapter = createMockedAdapter(mockSdk);

      // When: calling with special characters
      const specialId = "track-!@#$%^&*()";

      // Then: should handle gracefully
      await expect(adapter.getTrack(specialId)).rejects.toThrow();
    });

    // Edge case: Whitespace in ID
    test("should handle track IDs with whitespace", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdk(undefined, true, 404);
      const adapter = createMockedAdapter(mockSdk);

      // When: calling with whitespace
      const idWithSpaces = "  track-id-with-spaces  ";

      // Then: should handle gracefully
      await expect(adapter.getTrack(idWithSpaces)).rejects.toThrow();
    });
  });

  describe("Multiple Calls", () => {
    // Verify multiple calls work independently
    test("should handle multiple sequential getTrack calls", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdk();
      const adapter = createMockedAdapter(mockSdk);

      // When: calling getTrack multiple times
      const track1 = await adapter.getTrack("4iV5W9uYEdYUVa79Axb7Rh");
      const track2 = await adapter.getTrack("4iV5W9uYEdYUVa79Axb7Rh");

      // Then: both calls succeed
      expect(track1).toBeDefined();
      expect(track2).toBeDefined();
      expect(track1.id).toBe(track2.id);
    });

    // Verify different track IDs work
    test("should retrieve different tracks with different IDs", async () => {
      // Given: valid authentication config with mocked SDK returning dynamic ID
      const mockGet = mock(async (id: string) => {
        return createMockSpotifyTrack({ id });
      });
      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            tracks: { get: mockGet },
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };
      const adapter = createSpotifyAdapter(config);

      // When: calling getTrack with different IDs
      const trackId1 = "4iV5W9uYEdYUVa79Axb7Rh";
      const trackId2 = "different-track-id";

      const track1 = await adapter.getTrack(trackId1);
      const track2 = await adapter.getTrack(trackId2);

      // Then: both calls succeed with correct IDs
      expect(track1).toBeDefined();
      expect(track1.id).toBe(trackId1);
      expect(track2).toBeDefined();
      expect(track2.id).toBe(trackId2);
    });
  });
});

// AC-005, AC-005a, AC-005b: Track Search [FR-003]
describe("searchTracks", () => {
  // Helper to create adapter with mocked SDK for search
  const createMockedAdapterForSearch = (
    mockSearchResponse: unknown,
    shouldThrow = false,
    errorStatus = 500,
  ) => {
    const mockSearch = mock(
      async (
        query: string,
        types: string[],
        options?: { limit?: number; offset?: number },
      ) => {
        if (shouldThrow) {
          const error = new Error("Search failed") as Error & {
            status: number;
          };
          error.status = errorStatus;
          throw error;
        }
        return mockSearchResponse;
      },
    );

    SpotifyApi.withClientCredentials = mock(
      () =>
        ({
          search: mockSearch,
        }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
    );

    const config: SpotifyConfig = {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
    };
    return createSpotifyAdapter(config);
  };

  // Mock Spotify search response
  const createMockSpotifySearchResponse = (
    total: number,
    limit: number,
    offset: number,
    items: unknown[] = [],
  ) => ({
    tracks: {
      items,
      total,
      limit,
      offset,
      href: `https://api.spotify.com/v1/search?query=test&type=track&offset=${offset}&limit=${limit}`,
      next: offset + limit < total ? "next-page-url" : null,
      previous: offset > 0 ? "previous-page-url" : null,
    },
  });

  describe("Successful Search - Basic", () => {
    // AC-005: Given valid auth config, When searchTracks called, Then returns SearchResult<Track>
    test("should return SearchResult<Track> object with items, total, limit, offset", async () => {
      // Given: valid authentication config with mocked SDK
      const mockTrack = createMockSpotifyTrack();
      const mockResponse = createMockSpotifySearchResponse(100, 20, 0, [
        mockTrack,
      ]);
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called with query
      const query = "bohemian rhapsody";
      const result = await adapter.searchTracks(query);

      // Then: SearchResult<Track> object is returned with all required properties
      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(typeof result.total).toBe("number");
      expect(typeof result.limit).toBe("number");
      expect(typeof result.offset).toBe("number");
    });

    // AC-005: items array contains Track objects
    test("should return SearchResult with items as Track array", async () => {
      // Given: valid authentication config with mocked SDK
      const mockTrack1 = createMockSpotifyTrack({
        id: "track1",
        name: "Track 1",
      });
      const mockTrack2 = createMockSpotifyTrack({
        id: "track2",
        name: "Track 2",
      });
      const mockResponse = createMockSpotifySearchResponse(2, 20, 0, [
        mockTrack1,
        mockTrack2,
      ]);
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called
      const result = await adapter.searchTracks("test query");

      // Then: items array contains Track objects
      expect(result.items.length).toBe(2);
      for (const track of result.items) {
        expect(typeof track.id).toBe("string");
        expect(typeof track.name).toBe("string");
        expect(typeof track.externalUrl).toBe("string");
        expect(Array.isArray(track.artists)).toBe(true);
        expect(typeof track.album).toBe("object");
        expect(typeof track.durationMs).toBe("number");
      }
    });

    // AC-005: total is non-negative integer
    test("should return SearchResult with total as non-negative integer", async () => {
      // Given: valid authentication config with mocked SDK
      const mockResponse = createMockSpotifySearchResponse(150, 20, 0, [
        createMockSpotifyTrack(),
      ]);
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called
      const result = await adapter.searchTracks("test");

      // Then: total is non-negative integer
      expect(typeof result.total).toBe("number");
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(result.total)).toBe(true);
      expect(result.total).toBe(150);
    });

    // AC-005: limit and offset are included
    test("should return SearchResult with limit and offset", async () => {
      // Given: valid authentication config with mocked SDK
      const mockResponse = createMockSpotifySearchResponse(100, 20, 0, [
        createMockSpotifyTrack(),
      ]);
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called
      const result = await adapter.searchTracks("test");

      // Then: limit and offset are included
      expect(typeof result.limit).toBe("number");
      expect(typeof result.offset).toBe("number");
    });
  });

  describe("Empty Search Results", () => {
    // AC-005a: Given valid auth, When no results, Then items is empty array and total is 0
    test("should return empty items array when no results found", async () => {
      // Given: valid authentication config with mocked SDK returning empty results
      const mockResponse = createMockSpotifySearchResponse(0, 20, 0, []);
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called with query that has no results
      const result = await adapter.searchTracks("xyznonexistentquery123");

      // Then: items is empty array
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBe(0);
    });

    // AC-005a: total is 0 when no results
    test("should return total as 0 when no results found", async () => {
      // Given: valid authentication config with mocked SDK returning empty results
      const mockResponse = createMockSpotifySearchResponse(0, 20, 0, []);
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called with query that has no results
      const result = await adapter.searchTracks("nonexistent");

      // Then: total is 0
      expect(result.total).toBe(0);
    });

    // AC-005a: Complete empty result structure
    test("should return valid SearchResult structure even with no results", async () => {
      // Given: valid authentication config with mocked SDK returning empty results
      const mockResponse = createMockSpotifySearchResponse(0, 20, 0, []);
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called
      const result = await adapter.searchTracks("empty");

      // Then: all SearchResult properties are present
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });
  });

  describe("Pagination Support", () => {
    // AC-005b: Given valid auth, When searchTracks with { limit: 5, offset: 10 }, Then limit=5, offset=10
    test("should respect limit and offset options in SearchResult", async () => {
      // Given: valid authentication config with mocked SDK
      const mockTracks = Array.from({ length: 5 }, (_, i) =>
        createMockSpotifyTrack({ id: `track${i}`, name: `Track ${i}` }),
      );
      const mockResponse = createMockSpotifySearchResponse(
        100,
        5,
        10,
        mockTracks,
      );
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called with { limit: 5, offset: 10 }
      const result = await adapter.searchTracks("test", {
        limit: 5,
        offset: 10,
      });

      // Then: limit is 5 and offset is 10
      expect(result.limit).toBe(5);
      expect(result.offset).toBe(10);
    });

    // AC-005b: items length is at most limit
    test("should return items array with length at most limit", async () => {
      // Given: valid authentication config with mocked SDK
      const mockTracks = Array.from({ length: 5 }, (_, i) =>
        createMockSpotifyTrack({ id: `track${i}`, name: `Track ${i}` }),
      );
      const mockResponse = createMockSpotifySearchResponse(
        100,
        5,
        10,
        mockTracks,
      );
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called with limit: 5
      const result = await adapter.searchTracks("test", {
        limit: 5,
        offset: 10,
      });

      // Then: items array has at most 5 items
      expect(result.items.length).toBeLessThanOrEqual(5);
      expect(result.items.length).toBe(5);
    });

    // Various limit values
    test("should handle different limit values", async () => {
      // Given: valid authentication config
      const testCases = [
        { limit: 1, offset: 0, expectedItems: 1 },
        { limit: 10, offset: 0, expectedItems: 10 },
        { limit: 25, offset: 0, expectedItems: 25 },
        { limit: 50, offset: 0, expectedItems: 50 },
      ];

      for (const testCase of testCases) {
        const mockTracks = Array.from(
          { length: testCase.expectedItems },
          (_, i) => createMockSpotifyTrack({ id: `track${i}` }),
        );
        const mockResponse = createMockSpotifySearchResponse(
          100,
          testCase.limit,
          testCase.offset,
          mockTracks,
        );
        const adapter = createMockedAdapterForSearch(mockResponse);

        // When: searchTracks is called with specific limit
        const result = await adapter.searchTracks("test", {
          limit: testCase.limit,
          offset: testCase.offset,
        });

        // Then: result matches expected values
        expect(result.limit).toBe(testCase.limit);
        expect(result.offset).toBe(testCase.offset);
        expect(result.items.length).toBe(testCase.expectedItems);
      }
    });

    // Various offset values
    test("should handle different offset values", async () => {
      // Given: valid authentication config
      const testCases = [
        { limit: 20, offset: 0 },
        { limit: 20, offset: 20 },
        { limit: 20, offset: 40 },
        { limit: 20, offset: 100 },
      ];

      for (const testCase of testCases) {
        const mockTracks = Array.from({ length: testCase.limit }, (_, i) =>
          createMockSpotifyTrack({ id: `track${i + testCase.offset}` }),
        );
        const mockResponse = createMockSpotifySearchResponse(
          200,
          testCase.limit,
          testCase.offset,
          mockTracks,
        );
        const adapter = createMockedAdapterForSearch(mockResponse);

        // When: searchTracks is called with specific offset
        const result = await adapter.searchTracks("test", {
          limit: testCase.limit,
          offset: testCase.offset,
        });

        // Then: result matches expected offset
        expect(result.offset).toBe(testCase.offset);
      }
    });
  });

  describe("Default Values", () => {
    // Default limit should be 20 when not provided
    test("should use default limit of 20 when options not provided", async () => {
      // Given: valid authentication config with mocked SDK
      const mockTracks = Array.from({ length: 20 }, (_, i) =>
        createMockSpotifyTrack({ id: `track${i}` }),
      );
      const mockResponse = createMockSpotifySearchResponse(
        100,
        20,
        0,
        mockTracks,
      );
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called without options
      const result = await adapter.searchTracks("test");

      // Then: limit is 20 (default)
      expect(result.limit).toBe(20);
    });

    // Default offset should be 0 when not provided
    test("should use default offset of 0 when options not provided", async () => {
      // Given: valid authentication config with mocked SDK
      const mockResponse = createMockSpotifySearchResponse(100, 20, 0, [
        createMockSpotifyTrack(),
      ]);
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called without options
      const result = await adapter.searchTracks("test");

      // Then: offset is 0 (default)
      expect(result.offset).toBe(0);
    });

    // Partial options - only limit provided
    test("should use default offset when only limit provided", async () => {
      // Given: valid authentication config with mocked SDK
      const mockTracks = Array.from({ length: 10 }, (_, i) =>
        createMockSpotifyTrack({ id: `track${i}` }),
      );
      const mockResponse = createMockSpotifySearchResponse(
        100,
        10,
        0,
        mockTracks,
      );
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called with only limit
      const result = await adapter.searchTracks("test", { limit: 10 });

      // Then: limit is 10 and offset is 0 (default)
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    // Partial options - only offset provided
    test("should use default limit when only offset provided", async () => {
      // Given: valid authentication config with mocked SDK
      const mockTracks = Array.from({ length: 20 }, (_, i) =>
        createMockSpotifyTrack({ id: `track${i + 30}` }),
      );
      const mockResponse = createMockSpotifySearchResponse(
        100,
        20,
        30,
        mockTracks,
      );
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called with only offset
      const result = await adapter.searchTracks("test", { offset: 30 });

      // Then: limit is 20 (default) and offset is 30
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(30);
    });
  });

  describe("Limit Constraints", () => {
    // limit > 50 should be capped to 50
    test("should cap limit to 50 when limit exceeds maximum", async () => {
      // Given: valid authentication config with mocked SDK
      const mockTracks = Array.from({ length: 50 }, (_, i) =>
        createMockSpotifyTrack({ id: `track${i}` }),
      );
      const mockResponse = createMockSpotifySearchResponse(
        200,
        50,
        0,
        mockTracks,
      );
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called with limit > 50
      const result = await adapter.searchTracks("test", { limit: 100 });

      // Then: limit is capped to 50
      expect(result.limit).toBe(50);
      expect(result.items.length).toBeLessThanOrEqual(50);
    });

    // Boundary: limit = 50 (maximum allowed)
    test("should accept limit of 50 as valid maximum", async () => {
      // Given: valid authentication config with mocked SDK
      const mockTracks = Array.from({ length: 50 }, (_, i) =>
        createMockSpotifyTrack({ id: `track${i}` }),
      );
      const mockResponse = createMockSpotifySearchResponse(
        100,
        50,
        0,
        mockTracks,
      );
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called with limit = 50
      const result = await adapter.searchTracks("test", { limit: 50 });

      // Then: limit is 50
      expect(result.limit).toBe(50);
    });

    // Boundary: limit = 51 should be capped
    test("should cap limit of 51 to 50", async () => {
      // Given: valid authentication config with mocked SDK
      const mockTracks = Array.from({ length: 50 }, (_, i) =>
        createMockSpotifyTrack({ id: `track${i}` }),
      );
      const mockResponse = createMockSpotifySearchResponse(
        100,
        50,
        0,
        mockTracks,
      );
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called with limit = 51
      const result = await adapter.searchTracks("test", { limit: 51 });

      // Then: limit is capped to 50
      expect(result.limit).toBe(50);
    });

    // Very large limit value
    test("should cap extremely large limit values to 50", async () => {
      // Given: valid authentication config with mocked SDK
      const mockTracks = Array.from({ length: 50 }, (_, i) =>
        createMockSpotifyTrack({ id: `track${i}` }),
      );
      const mockResponse = createMockSpotifySearchResponse(
        1000,
        50,
        0,
        mockTracks,
      );
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called with very large limit
      const result = await adapter.searchTracks("test", { limit: 1000 });

      // Then: limit is capped to 50
      expect(result.limit).toBe(50);
    });
  });

  describe("Query Handling", () => {
    // Different query strings
    test("should handle various query strings", async () => {
      // Given: valid authentication config
      const queries = [
        "single",
        "multiple words query",
        'artist:Queen album:"A Night at the Opera"',
        "year:2020 genre:rock",
      ];

      for (const query of queries) {
        const mockResponse = createMockSpotifySearchResponse(10, 20, 0, [
          createMockSpotifyTrack(),
        ]);
        const adapter = createMockedAdapterForSearch(mockResponse);

        // When: searchTracks is called with various queries
        const result = await adapter.searchTracks(query);

        // Then: all queries are handled successfully
        expect(result).toBeDefined();
        expect(result.items).toBeDefined();
      }
    });

    // Empty query string
    test("should handle empty query string", async () => {
      // Given: valid authentication config with mocked SDK
      const mockResponse = createMockSpotifySearchResponse(0, 20, 0, []);
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called with empty query
      const result = await adapter.searchTracks("");

      // Then: should return valid SearchResult (may be empty)
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });

    // Query with special characters
    test("should handle query with special characters", async () => {
      // Given: valid authentication config with mocked SDK
      const mockResponse = createMockSpotifySearchResponse(5, 20, 0, [
        createMockSpotifyTrack(),
      ]);
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called with special characters
      const result = await adapter.searchTracks("AC/DC's rock & roll!");

      // Then: query is handled successfully
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
    });
  });

  describe("Track Type Validation", () => {
    // Ensure each track in results conforms to Track type
    test("should return tracks conforming to Track interface", async () => {
      // Given: valid authentication config with mocked SDK
      const mockTracks = Array.from({ length: 3 }, (_, i) =>
        createMockSpotifyTrack({ id: `track${i}`, name: `Track ${i}` }),
      );
      const mockResponse = createMockSpotifySearchResponse(
        3,
        20,
        0,
        mockTracks,
      );
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called
      const result = await adapter.searchTracks("test");

      // Then: each track conforms to Track interface
      for (const track of result.items) {
        // Required string properties
        expect(typeof track.id).toBe("string");
        expect(typeof track.name).toBe("string");
        expect(typeof track.externalUrl).toBe("string");

        // Artists array
        expect(Array.isArray(track.artists)).toBe(true);
        expect(track.artists.length).toBeGreaterThan(0);
        for (const artist of track.artists) {
          expect(typeof artist.id).toBe("string");
          expect(typeof artist.name).toBe("string");
          expect(typeof artist.externalUrl).toBe("string");
        }

        // Album object
        expect(typeof track.album).toBe("object");
        expect(track.album).not.toBeNull();
        expect(typeof track.album.id).toBe("string");
        expect(typeof track.album.name).toBe("string");

        // Duration
        expect(typeof track.durationMs).toBe("number");
        expect(track.durationMs).toBeGreaterThan(0);

        // Preview URL (nullable)
        expect(
          track.previewUrl === null || typeof track.previewUrl === "string",
        ).toBe(true);
      }
    });

    // Tracks with various property values
    test("should handle tracks with null previewUrl in search results", async () => {
      // Given: valid authentication config with tracks with null previewUrl
      const mockTracks = [
        createMockSpotifyTrack({ preview_url: null }),
        createMockSpotifyTrack({ preview_url: "https://preview.url" }),
      ];
      const mockResponse = createMockSpotifySearchResponse(
        2,
        20,
        0,
        mockTracks,
      );
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called
      const result = await adapter.searchTracks("test");

      // Then: both tracks are handled correctly
      expect(result.items[0].previewUrl).toBeNull();
      expect(result.items[1].previewUrl).toBe("https://preview.url");
    });
  });

  describe("Edge Cases", () => {
    // Offset beyond total results
    test("should handle offset beyond total results", async () => {
      // Given: valid authentication config with offset > total
      const mockResponse = createMockSpotifySearchResponse(50, 20, 100, []);
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called with offset beyond total
      const result = await adapter.searchTracks("test", { offset: 100 });

      // Then: returns empty items with correct pagination info
      expect(result.items).toEqual([]);
      expect(result.offset).toBe(100);
      expect(result.total).toBe(50);
    });

    // Last page with partial results
    test("should handle last page with fewer items than limit", async () => {
      // Given: valid authentication config with last page having only 3 items
      const mockTracks = Array.from({ length: 3 }, (_, i) =>
        createMockSpotifyTrack({ id: `track${i}` }),
      );
      const mockResponse = createMockSpotifySearchResponse(
        23,
        20,
        20,
        mockTracks,
      );
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called for last page
      const result = await adapter.searchTracks("test", {
        limit: 20,
        offset: 20,
      });

      // Then: returns only available items
      expect(result.items.length).toBe(3);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(20);
      expect(result.total).toBe(23);
    });

    // Zero limit (edge case)
    test("should handle zero limit", async () => {
      // Given: valid authentication config
      const mockResponse = createMockSpotifySearchResponse(100, 0, 0, []);
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When: searchTracks is called with limit = 0
      const result = await adapter.searchTracks("test", { limit: 0 });

      // Then: returns empty items
      expect(result.items).toEqual([]);
      expect(result.limit).toBe(0);
    });

    // Negative values (should be handled gracefully)
    test("should handle negative limit gracefully", async () => {
      // Given: valid authentication config
      const mockResponse = createMockSpotifySearchResponse(100, 20, 0, [
        createMockSpotifyTrack(),
      ]);
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When/Then: searchTracks is called with negative limit
      // Implementation should handle this (either reject or use default)
      await expect(
        adapter.searchTracks("test", { limit: -5 }),
      ).resolves.toBeDefined();
    });

    test("should handle negative offset gracefully", async () => {
      // Given: valid authentication config
      const mockResponse = createMockSpotifySearchResponse(100, 20, 0, [
        createMockSpotifyTrack(),
      ]);
      const adapter = createMockedAdapterForSearch(mockResponse);

      // When/Then: searchTracks is called with negative offset
      // Implementation should handle this (either reject or use default)
      await expect(
        adapter.searchTracks("test", { offset: -10 }),
      ).resolves.toBeDefined();
    });
  });

  describe("Multiple Calls", () => {
    // Multiple sequential calls
    test("should handle multiple sequential searchTracks calls", async () => {
      // Given: valid authentication config with mocked SDK
      const mockResponse1 = createMockSpotifySearchResponse(50, 20, 0, [
        createMockSpotifyTrack({ id: "track1" }),
      ]);
      const mockResponse2 = createMockSpotifySearchResponse(30, 10, 0, [
        createMockSpotifyTrack({ id: "track2" }),
      ]);

      const adapter1 = createMockedAdapterForSearch(mockResponse1);
      const adapter2 = createMockedAdapterForSearch(mockResponse2);

      // When: calling searchTracks multiple times
      const result1 = await adapter1.searchTracks("query1");
      const result2 = await adapter2.searchTracks("query2", { limit: 10 });

      // Then: both calls succeed independently
      expect(result1).toBeDefined();
      expect(result1.total).toBe(50);
      expect(result2).toBeDefined();
      expect(result2.total).toBe(30);
      expect(result2.limit).toBe(10);
    });

    // Same query, different pagination
    test("should handle same query with different pagination", async () => {
      // Given: valid authentication config
      const page1Response = createMockSpotifySearchResponse(
        100,
        20,
        0,
        Array.from({ length: 20 }, (_, i) =>
          createMockSpotifyTrack({ id: `track${i}` }),
        ),
      );
      const page2Response = createMockSpotifySearchResponse(
        100,
        20,
        20,
        Array.from({ length: 20 }, (_, i) =>
          createMockSpotifyTrack({ id: `track${i + 20}` }),
        ),
      );

      const adapter1 = createMockedAdapterForSearch(page1Response);
      const adapter2 = createMockedAdapterForSearch(page2Response);

      // When: calling searchTracks with same query but different pagination
      const page1 = await adapter1.searchTracks("test", {
        limit: 20,
        offset: 0,
      });
      const page2 = await adapter2.searchTracks("test", {
        limit: 20,
        offset: 20,
      });

      // Then: both pages return different results
      expect(page1.offset).toBe(0);
      expect(page2.offset).toBe(20);
      expect(page1.total).toBe(100);
      expect(page2.total).toBe(100);
    });
  });
});

// AC-006: Album Retrieval [FR-004]
describe("getAlbum", () => {
  // Mock Spotify SDK album response data
  const createMockSpotifyAlbum = (overrides: Record<string, unknown> = {}) => ({
    id: "2widuo17g5CEC66IbzveRu",
    name: "Hotel California",
    release_date: "1976-12-08",
    total_tracks: 9,
    external_urls: {
      spotify: "https://open.spotify.com/album/2widuo17g5CEC66IbzveRu",
    },
    artists: [
      {
        id: "0ECwFtbIWEVNwjlrfc6xoL",
        name: "Eagles",
        external_urls: {
          spotify: "https://open.spotify.com/artist/0ECwFtbIWEVNwjlrfc6xoL",
        },
      },
    ],
    images: [
      { url: "https://i.scdn.co/image/abc123", width: 640, height: 640 },
      { url: "https://i.scdn.co/image/abc456", width: 300, height: 300 },
      { url: "https://i.scdn.co/image/abc789", width: 64, height: 64 },
    ],
    ...overrides,
  });

  // Create mock SDK with configurable behavior for albums
  const createMockSdkForAlbum = (
    albumData: unknown = createMockSpotifyAlbum(),
    shouldThrow = false,
    errorStatus = 404,
  ) => {
    const mockGet = mock(async (id: string) => {
      if (shouldThrow) {
        const error = new Error("Not found") as Error & { status: number };
        error.status = errorStatus;
        throw error;
      }
      return albumData;
    });

    return {
      albums: { get: mockGet },
    };
  };

  // Helper to create adapter with mocked SDK for albums
  const createMockedAdapterForAlbum = (
    mockSdk: ReturnType<typeof createMockSdkForAlbum>,
  ) => {
    SpotifyApi.withClientCredentials = mock(
      () =>
        mockSdk as unknown as ReturnType<
          typeof SpotifyApi.withClientCredentials
        >,
    );
    const config: SpotifyConfig = {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
    };
    return createSpotifyAdapter(config);
  };

  describe("Successful Album Retrieval", () => {
    // AC-006: Given valid auth config, When existing album ID, Then returns Album object
    test("should return Album object with all required properties when album exists", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForAlbum();
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: getAlbum is called with existing album ID
      const albumId = "2widuo17g5CEC66IbzveRu"; // Hotel California
      const album = await adapter.getAlbum(albumId);

      // Then: Album object is returned with required properties
      expect(album).toBeDefined();
      expect(album.id).toBe(albumId);
      expect(typeof album.name).toBe("string");
      expect(album.name.length).toBeGreaterThan(0);
      expect(typeof album.externalUrl).toBe("string");
      expect(album.externalUrl.length).toBeGreaterThan(0);
    });

    // AC-006: artists array contains at least one Artist object
    test("should return Album with at least one artist", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForAlbum();
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: getAlbum is called
      const album = await adapter.getAlbum("2widuo17g5CEC66IbzveRu");

      // Then: artists array contains at least one Artist object
      expect(Array.isArray(album.artists)).toBe(true);
      expect(album.artists.length).toBeGreaterThan(0);
      expect(album.artists[0]).toBeDefined();
      expect(typeof album.artists[0].id).toBe("string");
      expect(typeof album.artists[0].name).toBe("string");
      expect(typeof album.artists[0].externalUrl).toBe("string");
    });

    // AC-006: totalTracks is positive integer
    test("should return Album with positive totalTracks", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForAlbum();
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: getAlbum is called
      const album = await adapter.getAlbum("2widuo17g5CEC66IbzveRu");

      // Then: totalTracks is positive integer
      expect(typeof album.totalTracks).toBe("number");
      expect(album.totalTracks).toBeGreaterThan(0);
      expect(Number.isInteger(album.totalTracks)).toBe(true);
    });

    // AC-006: images array is included
    test("should return Album with images array", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForAlbum();
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: getAlbum is called
      const album = await adapter.getAlbum("2widuo17g5CEC66IbzveRu");

      // Then: images array is included
      expect(Array.isArray(album.images)).toBe(true);

      // If images exist, validate structure
      if (album.images.length > 0) {
        for (const image of album.images) {
          expect(typeof image.url).toBe("string");
          expect(image.width === null || typeof image.width === "number").toBe(
            true,
          );
          expect(
            image.height === null || typeof image.height === "number",
          ).toBe(true);
        }
      }
    });

    // AC-006: Complete Album type structure validation
    test("should return Album conforming to Album type", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForAlbum();
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: getAlbum is called
      const album = await adapter.getAlbum("2widuo17g5CEC66IbzveRu");

      // Then: Album conforms to Album interface
      // Required string properties
      expect(typeof album.id).toBe("string");
      expect(typeof album.name).toBe("string");
      expect(typeof album.externalUrl).toBe("string");

      // Artists array with Artist objects
      expect(Array.isArray(album.artists)).toBe(true);
      expect(album.artists.length).toBeGreaterThan(0);
      for (const artist of album.artists) {
        expect(typeof artist.id).toBe("string");
        expect(typeof artist.name).toBe("string");
        expect(typeof artist.externalUrl).toBe("string");
      }

      // Release date
      expect(typeof album.releaseDate).toBe("string");

      // Total tracks
      expect(typeof album.totalTracks).toBe("number");
      expect(album.totalTracks).toBeGreaterThan(0);

      // Images array
      expect(Array.isArray(album.images)).toBe(true);
    });

    // AC-006: Multiple artists handling
    test("should handle albums with multiple artists", async () => {
      // Given: valid authentication config with mocked SDK returning multiple artists
      const mockAlbum = createMockSpotifyAlbum({
        artists: [
          {
            id: "artist1",
            name: "Artist 1",
            external_urls: { spotify: "https://open.spotify.com/artist/1" },
          },
          {
            id: "artist2",
            name: "Artist 2",
            external_urls: { spotify: "https://open.spotify.com/artist/2" },
          },
          {
            id: "artist3",
            name: "Artist 3",
            external_urls: { spotify: "https://open.spotify.com/artist/3" },
          },
        ],
      });
      const mockSdk = createMockSdkForAlbum(mockAlbum);
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: getAlbum is called for album with multiple artists
      const album = await adapter.getAlbum("album-with-multiple-artists");

      // Then: all artists are included
      expect(Array.isArray(album.artists)).toBe(true);
      expect(album.artists.length).toBe(3);
      for (const artist of album.artists) {
        expect(artist.id).toBeDefined();
        expect(artist.name).toBeDefined();
        expect(artist.externalUrl).toBeDefined();
      }
    });

    // AC-006: Multiple images with different sizes
    test("should return Album with multiple images of different sizes", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForAlbum();
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: getAlbum is called
      const album = await adapter.getAlbum("2widuo17g5CEC66IbzveRu");

      // Then: images array contains multiple images with different sizes
      expect(album.images.length).toBeGreaterThan(0);
      const imageSizes = album.images.map((img) => img.width);
      expect(imageSizes).toContain(640);
      expect(imageSizes).toContain(300);
      expect(imageSizes).toContain(64);
    });

    // AC-006: Album with no images (edge case)
    test("should handle albums with empty images array", async () => {
      // Given: valid authentication config with mocked SDK returning no images
      const mockAlbum = createMockSpotifyAlbum({ images: [] });
      const mockSdk = createMockSdkForAlbum(mockAlbum);
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: getAlbum is called for album without images
      const album = await adapter.getAlbum("album-without-images");

      // Then: images is an empty array
      expect(Array.isArray(album.images)).toBe(true);
      expect(album.images.length).toBe(0);
    });

    // AC-006: Release date format
    test("should return Album with releaseDate in string format", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForAlbum();
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: getAlbum is called
      const album = await adapter.getAlbum("2widuo17g5CEC66IbzveRu");

      // Then: releaseDate is a string
      expect(typeof album.releaseDate).toBe("string");
      expect(album.releaseDate.length).toBeGreaterThan(0);
    });

    // AC-006: External URL format validation
    test("should return Album with valid Spotify external URL", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForAlbum();
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: getAlbum is called
      const album = await adapter.getAlbum("2widuo17g5CEC66IbzveRu");

      // Then: external URL should be valid Spotify URL
      expect(album.externalUrl).toContain("spotify.com");
      expect(album.externalUrl).toContain("album");
      expect(album.artists[0].externalUrl).toContain("spotify.com");
    });
  });

  describe("Error Handling - Not Found", () => {
    // AC-006 Error: Given valid auth, When non-existent album ID, Then throws NotFoundError
    test("should throw NotFoundError when album does not exist", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForAlbum(undefined, true, 404);
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When/Then: calling getAlbum with non-existent ID throws NotFoundError
      const nonExistentId = "invalid-album-id-12345";
      await expect(adapter.getAlbum(nonExistentId)).rejects.toThrow(
        NotFoundError,
      );
    });

    // AC-006 Error: resourceType is "album"
    test("should throw NotFoundError with resourceType='album'", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForAlbum(undefined, true, 404);
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: calling getAlbum with non-existent ID
      const nonExistentId = "invalid-album-id-12345";

      // Then: error has resourceType='album'
      try {
        await adapter.getAlbum(nonExistentId);
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.resourceType).toBe("album");
        }
      }
    });

    // AC-006 Error: resourceId is the specified ID
    test("should throw NotFoundError with correct resourceId", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForAlbum(undefined, true, 404);
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: calling getAlbum with non-existent ID
      const nonExistentId = "test-invalid-album-999";

      // Then: error has resourceId set to the requested ID
      try {
        await adapter.getAlbum(nonExistentId);
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.resourceId).toBe(nonExistentId);
        }
      }
    });

    // AC-006 Error: Error message format
    test("should throw NotFoundError with formatted error message", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForAlbum(undefined, true, 404);
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: calling getAlbum with non-existent ID
      const nonExistentId = "missing-album-123";

      // Then: error message contains album and ID
      try {
        await adapter.getAlbum(nonExistentId);
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.message).toContain("album");
          expect(error.message).toContain(nonExistentId);
        }
      }
    });

    // AC-006 Error: NotFoundError is catchable with instanceof
    test("should be catchable using instanceof NotFoundError", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForAlbum(undefined, true, 404);
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When/Then: can catch using instanceof
      try {
        await adapter.getAlbum("non-existent-id");
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        const isNotFoundError = error instanceof NotFoundError;
        expect(isNotFoundError).toBe(true);
      }
    });
  });

  describe("Edge Cases", () => {
    // Edge case: Empty string ID
    test("should handle empty string album ID gracefully", async () => {
      // Given: valid authentication config with mocked SDK that throws 404 for empty ID
      const mockSdk = createMockSdkForAlbum(undefined, true, 404);
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When/Then: calling with empty string should throw error
      await expect(adapter.getAlbum("")).rejects.toThrow();
    });

    // Edge case: Very long ID string
    test("should handle very long album ID strings", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForAlbum(undefined, true, 404);
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: calling with very long ID
      const longId = "a".repeat(1000);

      // Then: should handle gracefully (likely NotFoundError)
      await expect(adapter.getAlbum(longId)).rejects.toThrow();
    });

    // Edge case: Special characters in ID
    test("should handle album IDs with special characters", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForAlbum(undefined, true, 404);
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: calling with special characters
      const specialId = "album-!@#$%^&*()";

      // Then: should handle gracefully
      await expect(adapter.getAlbum(specialId)).rejects.toThrow();
    });

    // Edge case: Whitespace in ID
    test("should handle album IDs with whitespace", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForAlbum(undefined, true, 404);
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: calling with whitespace
      const idWithSpaces = "  album-id-with-spaces  ";

      // Then: should handle gracefully
      await expect(adapter.getAlbum(idWithSpaces)).rejects.toThrow();
    });

    // Edge case: Album with single track
    test("should handle albums with totalTracks = 1", async () => {
      // Given: valid authentication config with mocked SDK
      const mockAlbum = createMockSpotifyAlbum({ total_tracks: 1 });
      const mockSdk = createMockSdkForAlbum(mockAlbum);
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: getAlbum is called for single-track album
      const album = await adapter.getAlbum("single-track-album");

      // Then: totalTracks is 1
      expect(album.totalTracks).toBe(1);
    });

    // Edge case: Album with many tracks
    test("should handle albums with large totalTracks", async () => {
      // Given: valid authentication config with mocked SDK
      const mockAlbum = createMockSpotifyAlbum({ total_tracks: 100 });
      const mockSdk = createMockSdkForAlbum(mockAlbum);
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: getAlbum is called for album with many tracks
      const album = await adapter.getAlbum("large-album");

      // Then: totalTracks is 100
      expect(album.totalTracks).toBe(100);
    });
  });

  describe("Multiple Calls", () => {
    // Verify multiple calls work independently
    test("should handle multiple sequential getAlbum calls", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForAlbum();
      const adapter = createMockedAdapterForAlbum(mockSdk);

      // When: calling getAlbum multiple times
      const album1 = await adapter.getAlbum("2widuo17g5CEC66IbzveRu");
      const album2 = await adapter.getAlbum("2widuo17g5CEC66IbzveRu");

      // Then: both calls succeed
      expect(album1).toBeDefined();
      expect(album2).toBeDefined();
      expect(album1.id).toBe(album2.id);
    });

    // Verify different album IDs work
    test("should retrieve different albums with different IDs", async () => {
      // Given: valid authentication config with mocked SDK returning dynamic ID
      const mockGet = mock(async (id: string) => {
        return createMockSpotifyAlbum({ id });
      });
      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            albums: { get: mockGet },
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };
      const adapter = createSpotifyAdapter(config);

      // When: calling getAlbum with different IDs
      const albumId1 = "2widuo17g5CEC66IbzveRu";
      const albumId2 = "different-album-id";

      const album1 = await adapter.getAlbum(albumId1);
      const album2 = await adapter.getAlbum(albumId2);

      // Then: both calls succeed with correct IDs
      expect(album1).toBeDefined();
      expect(album1.id).toBe(albumId1);
      expect(album2).toBeDefined();
      expect(album2.id).toBe(albumId2);
    });
  });
});

// AC-007: Artist Retrieval [FR-005]
describe("getArtist", () => {
  // Mock Spotify SDK artist response data
  const createMockSpotifyArtist = (
    overrides: Record<string, unknown> = {},
  ) => ({
    id: "0ECwFtbIWEVNwjlrfc6xoL",
    name: "Eagles",
    genres: ["rock", "soft rock", "country rock"],
    external_urls: {
      spotify: "https://open.spotify.com/artist/0ECwFtbIWEVNwjlrfc6xoL",
    },
    images: [
      { url: "https://i.scdn.co/image/artist123", width: 640, height: 640 },
      { url: "https://i.scdn.co/image/artist456", width: 320, height: 320 },
      { url: "https://i.scdn.co/image/artist789", width: 160, height: 160 },
    ],
    ...overrides,
  });

  // Create mock SDK with configurable behavior for artists
  const createMockSdkForArtist = (
    artistData: unknown = createMockSpotifyArtist(),
    shouldThrow = false,
    errorStatus = 404,
  ) => {
    const mockGet = mock(async (id: string) => {
      if (shouldThrow) {
        const error = new Error("Not found") as Error & { status: number };
        error.status = errorStatus;
        throw error;
      }
      return artistData;
    });

    return {
      artists: { get: mockGet },
    };
  };

  // Helper to create adapter with mocked SDK for artists
  const createMockedAdapterForArtist = (
    mockSdk: ReturnType<typeof createMockSdkForArtist>,
  ) => {
    SpotifyApi.withClientCredentials = mock(
      () =>
        mockSdk as unknown as ReturnType<
          typeof SpotifyApi.withClientCredentials
        >,
    );
    const config: SpotifyConfig = {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
    };
    return createSpotifyAdapter(config);
  };

  describe("Successful Artist Retrieval", () => {
    // AC-007: Given valid auth config, When existing artist ID, Then returns Artist object
    test("should return Artist object with all required properties when artist exists", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForArtist();
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: getArtist is called with existing artist ID
      const artistId = "0ECwFtbIWEVNwjlrfc6xoL"; // Eagles
      const artist = await adapter.getArtist(artistId);

      // Then: Artist object is returned with required properties
      expect(artist).toBeDefined();
      expect(artist.id).toBe(artistId);
      expect(typeof artist.name).toBe("string");
      expect(artist.name.length).toBeGreaterThan(0);
      expect(typeof artist.externalUrl).toBe("string");
      expect(artist.externalUrl.length).toBeGreaterThan(0);
    });

    // AC-007: id, name, externalUrl are non-null strings
    test("should return Artist with id, name, externalUrl as non-null strings", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForArtist();
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: getArtist is called
      const artist = await adapter.getArtist("0ECwFtbIWEVNwjlrfc6xoL");

      // Then: id, name, externalUrl are non-null strings
      expect(typeof artist.id).toBe("string");
      expect(artist.id.length).toBeGreaterThan(0);
      expect(typeof artist.name).toBe("string");
      expect(artist.name.length).toBeGreaterThan(0);
      expect(typeof artist.externalUrl).toBe("string");
      expect(artist.externalUrl.length).toBeGreaterThan(0);
    });

    // AC-007: Complete Artist type structure validation
    test("should return Artist conforming to Artist type", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForArtist();
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: getArtist is called
      const artist = await adapter.getArtist("0ECwFtbIWEVNwjlrfc6xoL");

      // Then: Artist conforms to Artist interface
      // Required string properties
      expect(typeof artist.id).toBe("string");
      expect(typeof artist.name).toBe("string");
      expect(typeof artist.externalUrl).toBe("string");

      // Optional genres array
      if (artist.genres !== undefined) {
        expect(Array.isArray(artist.genres)).toBe(true);
        for (const genre of artist.genres) {
          expect(typeof genre).toBe("string");
        }
      }

      // Optional images array
      if (artist.images !== undefined) {
        expect(Array.isArray(artist.images)).toBe(true);
        for (const image of artist.images) {
          expect(typeof image.url).toBe("string");
          expect(image.width === null || typeof image.width === "number").toBe(
            true,
          );
          expect(
            image.height === null || typeof image.height === "number",
          ).toBe(true);
        }
      }
    });

    // AC-007: Artist with genres
    test("should return Artist with genres array when available", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForArtist();
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: getArtist is called
      const artist = await adapter.getArtist("0ECwFtbIWEVNwjlrfc6xoL");

      // Then: genres array is included
      expect(artist.genres).toBeDefined();
      expect(Array.isArray(artist.genres)).toBe(true);
      if (artist.genres && artist.genres.length > 0) {
        for (const genre of artist.genres) {
          expect(typeof genre).toBe("string");
          expect(genre.length).toBeGreaterThan(0);
        }
      }
    });

    // AC-007: Artist with images
    test("should return Artist with images array when available", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForArtist();
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: getArtist is called
      const artist = await adapter.getArtist("0ECwFtbIWEVNwjlrfc6xoL");

      // Then: images array is included
      expect(artist.images).toBeDefined();
      expect(Array.isArray(artist.images)).toBe(true);

      // If images exist, validate structure
      if (artist.images && artist.images.length > 0) {
        for (const image of artist.images) {
          expect(typeof image.url).toBe("string");
          expect(image.width === null || typeof image.width === "number").toBe(
            true,
          );
          expect(
            image.height === null || typeof image.height === "number",
          ).toBe(true);
        }
      }
    });

    // AC-007: Multiple images with different sizes
    test("should return Artist with multiple images of different sizes", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForArtist();
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: getArtist is called
      const artist = await adapter.getArtist("0ECwFtbIWEVNwjlrfc6xoL");

      // Then: images array contains multiple images with different sizes
      if (artist.images) {
        expect(artist.images.length).toBeGreaterThan(0);
        const imageSizes = artist.images.map((img) => img.width);
        expect(imageSizes).toContain(640);
        expect(imageSizes).toContain(320);
        expect(imageSizes).toContain(160);
      }
    });

    // AC-007: Artist with no genres (edge case)
    test("should handle artists with empty genres array", async () => {
      // Given: valid authentication config with mocked SDK returning no genres
      const mockArtist = createMockSpotifyArtist({ genres: [] });
      const mockSdk = createMockSdkForArtist(mockArtist);
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: getArtist is called for artist without genres
      const artist = await adapter.getArtist("artist-without-genres");

      // Then: genres is an empty array or undefined
      if (artist.genres !== undefined) {
        expect(Array.isArray(artist.genres)).toBe(true);
        expect(artist.genres.length).toBe(0);
      }
    });

    // AC-007: Artist with no images (edge case)
    test("should handle artists with empty images array", async () => {
      // Given: valid authentication config with mocked SDK returning no images
      const mockArtist = createMockSpotifyArtist({ images: [] });
      const mockSdk = createMockSdkForArtist(mockArtist);
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: getArtist is called for artist without images
      const artist = await adapter.getArtist("artist-without-images");

      // Then: images is an empty array or undefined
      if (artist.images !== undefined) {
        expect(Array.isArray(artist.images)).toBe(true);
        expect(artist.images.length).toBe(0);
      }
    });

    // AC-007: External URL format validation
    test("should return Artist with valid Spotify external URL", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForArtist();
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: getArtist is called
      const artist = await adapter.getArtist("0ECwFtbIWEVNwjlrfc6xoL");

      // Then: external URL should be valid Spotify URL
      expect(artist.externalUrl).toContain("spotify.com");
      expect(artist.externalUrl).toContain("artist");
    });

    // AC-007: Multiple genres
    test("should handle artists with multiple genres", async () => {
      // Given: valid authentication config with mocked SDK
      const mockArtist = createMockSpotifyArtist({
        genres: ["rock", "soft rock", "country rock", "classic rock"],
      });
      const mockSdk = createMockSdkForArtist(mockArtist);
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: getArtist is called
      const artist = await adapter.getArtist("multi-genre-artist");

      // Then: all genres are included
      expect(artist.genres).toBeDefined();
      if (artist.genres) {
        expect(artist.genres.length).toBe(4);
        expect(artist.genres).toContain("rock");
        expect(artist.genres).toContain("soft rock");
        expect(artist.genres).toContain("country rock");
        expect(artist.genres).toContain("classic rock");
      }
    });
  });

  describe("Error Handling - Not Found", () => {
    // AC-007 Error: Given valid auth, When non-existent artist ID, Then throws NotFoundError
    test("should throw NotFoundError when artist does not exist", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForArtist(undefined, true, 404);
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When/Then: calling getArtist with non-existent ID throws NotFoundError
      const nonExistentId = "invalid-artist-id-12345";
      await expect(adapter.getArtist(nonExistentId)).rejects.toThrow(
        NotFoundError,
      );
    });

    // AC-007 Error: resourceType is "artist"
    test("should throw NotFoundError with resourceType='artist'", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForArtist(undefined, true, 404);
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: calling getArtist with non-existent ID
      const nonExistentId = "invalid-artist-id-12345";

      // Then: error has resourceType='artist'
      try {
        await adapter.getArtist(nonExistentId);
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.resourceType).toBe("artist");
        }
      }
    });

    // AC-007 Error: resourceId is the specified ID
    test("should throw NotFoundError with correct resourceId", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForArtist(undefined, true, 404);
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: calling getArtist with non-existent ID
      const nonExistentId = "test-invalid-artist-999";

      // Then: error has resourceId set to the requested ID
      try {
        await adapter.getArtist(nonExistentId);
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.resourceId).toBe(nonExistentId);
        }
      }
    });

    // AC-007 Error: Error message format
    test("should throw NotFoundError with formatted error message", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForArtist(undefined, true, 404);
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: calling getArtist with non-existent ID
      const nonExistentId = "missing-artist-123";

      // Then: error message contains artist and ID
      try {
        await adapter.getArtist(nonExistentId);
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.message).toContain("artist");
          expect(error.message).toContain(nonExistentId);
        }
      }
    });

    // AC-007 Error: NotFoundError is catchable with instanceof
    test("should be catchable using instanceof NotFoundError", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForArtist(undefined, true, 404);
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When/Then: can catch using instanceof
      try {
        await adapter.getArtist("non-existent-id");
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        const isNotFoundError = error instanceof NotFoundError;
        expect(isNotFoundError).toBe(true);
      }
    });
  });

  describe("Edge Cases", () => {
    // Edge case: Empty string ID
    test("should handle empty string artist ID gracefully", async () => {
      // Given: valid authentication config with mocked SDK that throws 404 for empty ID
      const mockSdk = createMockSdkForArtist(undefined, true, 404);
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When/Then: calling with empty string should throw error
      await expect(adapter.getArtist("")).rejects.toThrow();
    });

    // Edge case: Very long ID string
    test("should handle very long artist ID strings", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForArtist(undefined, true, 404);
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: calling with very long ID
      const longId = "a".repeat(1000);

      // Then: should handle gracefully (likely NotFoundError)
      await expect(adapter.getArtist(longId)).rejects.toThrow();
    });

    // Edge case: Special characters in ID
    test("should handle artist IDs with special characters", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForArtist(undefined, true, 404);
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: calling with special characters
      const specialId = "artist-!@#$%^&*()";

      // Then: should handle gracefully
      await expect(adapter.getArtist(specialId)).rejects.toThrow();
    });

    // Edge case: Whitespace in ID
    test("should handle artist IDs with whitespace", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForArtist(undefined, true, 404);
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: calling with whitespace
      const idWithSpaces = "  artist-id-with-spaces  ";

      // Then: should handle gracefully
      await expect(adapter.getArtist(idWithSpaces)).rejects.toThrow();
    });

    // Edge case: Artist with single genre
    test("should handle artists with single genre", async () => {
      // Given: valid authentication config with mocked SDK
      const mockArtist = createMockSpotifyArtist({ genres: ["rock"] });
      const mockSdk = createMockSdkForArtist(mockArtist);
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: getArtist is called for artist with single genre
      const artist = await adapter.getArtist("single-genre-artist");

      // Then: genres array contains one genre
      expect(artist.genres).toBeDefined();
      if (artist.genres) {
        expect(artist.genres.length).toBe(1);
        expect(artist.genres[0]).toBe("rock");
      }
    });

    // Edge case: Artist with undefined genres
    test("should handle artists with undefined genres", async () => {
      // Given: valid authentication config with mocked SDK
      const mockArtist = createMockSpotifyArtist({ genres: undefined });
      const mockSdk = createMockSdkForArtist(mockArtist);
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: getArtist is called for artist without genres
      const artist = await adapter.getArtist("artist-no-genres");

      // Then: genres is undefined
      expect(artist.genres).toBeUndefined();
    });

    // Edge case: Artist with undefined images
    test("should handle artists with undefined images", async () => {
      // Given: valid authentication config with mocked SDK
      const mockArtist = createMockSpotifyArtist({ images: undefined });
      const mockSdk = createMockSdkForArtist(mockArtist);
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: getArtist is called for artist without images
      const artist = await adapter.getArtist("artist-no-images");

      // Then: images is undefined
      expect(artist.images).toBeUndefined();
    });
  });

  describe("Multiple Calls", () => {
    // Verify multiple calls work independently
    test("should handle multiple sequential getArtist calls", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForArtist();
      const adapter = createMockedAdapterForArtist(mockSdk);

      // When: calling getArtist multiple times
      const artist1 = await adapter.getArtist("0ECwFtbIWEVNwjlrfc6xoL");
      const artist2 = await adapter.getArtist("0ECwFtbIWEVNwjlrfc6xoL");

      // Then: both calls succeed
      expect(artist1).toBeDefined();
      expect(artist2).toBeDefined();
      expect(artist1.id).toBe(artist2.id);
    });

    // Verify different artist IDs work
    test("should retrieve different artists with different IDs", async () => {
      // Given: valid authentication config with mocked SDK returning dynamic ID
      const mockGet = mock(async (id: string) => {
        return createMockSpotifyArtist({ id });
      });
      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            artists: { get: mockGet },
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };
      const adapter = createSpotifyAdapter(config);

      // When: calling getArtist with different IDs
      const artistId1 = "0ECwFtbIWEVNwjlrfc6xoL";
      const artistId2 = "different-artist-id";

      const artist1 = await adapter.getArtist(artistId1);
      const artist2 = await adapter.getArtist(artistId2);

      // Then: both calls succeed with correct IDs
      expect(artist1).toBeDefined();
      expect(artist1.id).toBe(artistId1);
      expect(artist2).toBeDefined();
      expect(artist2.id).toBe(artistId2);
    });
  });
});

// AC-008: Playlist retrieval [FR-006]
describe("getPlaylist", () => {
  // Mock Spotify SDK playlist response data
  const createMockSpotifyPlaylist = (
    overrides: Record<string, unknown> = {},
  ) => ({
    id: "37i9dQZF1DWXRqgbRLwIKR",
    name: "Top Hits 2024",
    description: "The biggest songs right now",
    owner: {
      id: "spotify",
      display_name: "Spotify",
    },
    tracks: {
      items: [
        {
          track: {
            id: "4iV5W9uYEdYUVa79Axb7Rh",
            name: "Hotel California",
            duration_ms: 391376,
            preview_url: "https://p.scdn.co/mp3-preview/abc123",
            external_urls: {
              spotify: "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh",
            },
            artists: [
              {
                id: "0ECwFtbIWEVNwjlrfc6xoL",
                name: "Eagles",
                external_urls: {
                  spotify:
                    "https://open.spotify.com/artist/0ECwFtbIWEVNwjlrfc6xoL",
                },
              },
            ],
            album: {
              id: "2widuo17g5CEC66IbzveRu",
              name: "Hotel California",
              release_date: "1976-12-08",
              total_tracks: 9,
              images: [
                {
                  url: "https://i.scdn.co/image/abc123",
                  width: 640,
                  height: 640,
                },
                {
                  url: "https://i.scdn.co/image/abc456",
                  width: 300,
                  height: 300,
                },
              ],
              external_urls: {
                spotify:
                  "https://open.spotify.com/album/2widuo17g5CEC66IbzveRu",
              },
              artists: [
                {
                  id: "0ECwFtbIWEVNwjlrfc6xoL",
                  name: "Eagles",
                  external_urls: {
                    spotify:
                      "https://open.spotify.com/artist/0ECwFtbIWEVNwjlrfc6xoL",
                  },
                },
              ],
            },
          },
        },
      ],
    },
    images: [
      {
        url: "https://i.scdn.co/image/playlist123",
        width: 640,
        height: 640,
      },
      {
        url: "https://i.scdn.co/image/playlist456",
        width: 300,
        height: 300,
      },
    ],
    external_urls: {
      spotify: "https://open.spotify.com/playlist/37i9dQZF1DWXRqgbRLwIKR",
    },
    ...overrides,
  });

  // Create mock SDK with configurable behavior for playlists
  const createMockSdkForPlaylist = (
    playlistData: unknown = createMockSpotifyPlaylist(),
    shouldThrow = false,
    errorStatus = 404,
  ) => {
    const mockGet = mock(async (id: string) => {
      if (shouldThrow) {
        const error = new Error("Not found") as Error & { status: number };
        error.status = errorStatus;
        throw error;
      }
      return playlistData;
    });

    return {
      playlists: { getPlaylist: mockGet },
    };
  };

  // Helper to create adapter with mocked SDK for playlists
  const createMockedAdapterForPlaylist = (
    mockSdk: ReturnType<typeof createMockSdkForPlaylist>,
  ) => {
    SpotifyApi.withClientCredentials = mock(
      () =>
        mockSdk as unknown as ReturnType<
          typeof SpotifyApi.withClientCredentials
        >,
    );
    const config: SpotifyConfig = {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
    };
    return createSpotifyAdapter(config);
  };

  describe("Successful Playlist Retrieval", () => {
    // AC-008: Given valid auth config, When existing playlist ID, Then returns Playlist object
    test("should return Playlist object with all required properties when playlist exists", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForPlaylist();
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: getPlaylist is called with existing playlist ID
      const playlistId = "37i9dQZF1DWXRqgbRLwIKR"; // Top Hits 2024
      const playlist = await adapter.getPlaylist(playlistId);

      // Then: Playlist object is returned with required properties
      expect(playlist).toBeDefined();
      expect(playlist.id).toBe(playlistId);
      expect(typeof playlist.name).toBe("string");
      expect(playlist.name.length).toBeGreaterThan(0);
      expect(typeof playlist.externalUrl).toBe("string");
      expect(playlist.externalUrl.length).toBeGreaterThan(0);
    });

    // AC-008: id, name, externalUrl are non-null strings
    test("should return Playlist with id, name, externalUrl as non-null strings", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForPlaylist();
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: getPlaylist is called
      const playlistId = "37i9dQZF1DWXRqgbRLwIKR";
      const playlist = await adapter.getPlaylist(playlistId);

      // Then: id, name, externalUrl are non-null strings
      expect(typeof playlist.id).toBe("string");
      expect(playlist.id).not.toBeNull();
      expect(playlist.id.length).toBeGreaterThan(0);

      expect(typeof playlist.name).toBe("string");
      expect(playlist.name).not.toBeNull();
      expect(playlist.name.length).toBeGreaterThan(0);

      expect(typeof playlist.externalUrl).toBe("string");
      expect(playlist.externalUrl).not.toBeNull();
      expect(playlist.externalUrl.length).toBeGreaterThan(0);
    });

    // AC-008: owner object has id, displayName
    test("should return Playlist with owner object containing id and displayName", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForPlaylist();
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: getPlaylist is called
      const playlistId = "37i9dQZF1DWXRqgbRLwIKR";
      const playlist = await adapter.getPlaylist(playlistId);

      // Then: owner object has id and displayName
      expect(playlist.owner).toBeDefined();
      expect(typeof playlist.owner.id).toBe("string");
      expect(playlist.owner.id.length).toBeGreaterThan(0);
      expect(typeof playlist.owner.displayName).toBe("string");
      expect(playlist.owner.displayName.length).toBeGreaterThan(0);
    });

    // AC-008: tracks array is included
    test("should return Playlist with tracks array", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForPlaylist();
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: getPlaylist is called
      const playlistId = "37i9dQZF1DWXRqgbRLwIKR";
      const playlist = await adapter.getPlaylist(playlistId);

      // Then: tracks array is included
      expect(playlist.tracks).toBeDefined();
      expect(Array.isArray(playlist.tracks)).toBe(true);
    });

    test("should return Playlist with valid Track objects in tracks array", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForPlaylist();
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: getPlaylist is called
      const playlistId = "37i9dQZF1DWXRqgbRLwIKR";
      const playlist = await adapter.getPlaylist(playlistId);

      // Then: tracks array contains valid Track objects
      expect(playlist.tracks.length).toBeGreaterThan(0);
      const track = playlist.tracks[0];
      expect(track).toBeDefined();
      expect(typeof track.id).toBe("string");
      expect(typeof track.name).toBe("string");
      expect(Array.isArray(track.artists)).toBe(true);
      expect(track.album).toBeDefined();
    });

    test("should return Playlist with images array", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForPlaylist();
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: getPlaylist is called
      const playlistId = "37i9dQZF1DWXRqgbRLwIKR";
      const playlist = await adapter.getPlaylist(playlistId);

      // Then: images array is included
      expect(playlist.images).toBeDefined();
      expect(Array.isArray(playlist.images)).toBe(true);
    });

    test("should handle playlist with null description", async () => {
      // Given: valid authentication config with mocked SDK returning null description
      const mockPlaylist = createMockSpotifyPlaylist({ description: null });
      const mockSdk = createMockSdkForPlaylist(mockPlaylist);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: getPlaylist is called
      const playlist = await adapter.getPlaylist("test-playlist");

      // Then: description is null
      expect(playlist.description).toBeNull();
    });

    test("should handle playlist with empty tracks array", async () => {
      // Given: valid authentication config with mocked SDK returning empty tracks
      const mockPlaylist = createMockSpotifyPlaylist({
        tracks: { items: [] },
      });
      const mockSdk = createMockSdkForPlaylist(mockPlaylist);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: getPlaylist is called
      const playlist = await adapter.getPlaylist("empty-playlist");

      // Then: tracks array is empty
      expect(playlist.tracks).toBeDefined();
      expect(Array.isArray(playlist.tracks)).toBe(true);
      expect(playlist.tracks.length).toBe(0);
    });
  });

  describe("Error Handling", () => {
    // AC-008 Error: NotFoundError when playlist does not exist
    test("should throw NotFoundError when playlist does not exist", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForPlaylist(undefined, true, 404);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When/Then: calling getPlaylist with non-existent ID throws NotFoundError
      const nonExistentId = "invalid-playlist-id-12345";
      await expect(adapter.getPlaylist(nonExistentId)).rejects.toThrow(
        NotFoundError,
      );
    });

    // AC-008 Error: resourceType is "playlist"
    test("should throw NotFoundError with resourceType='playlist'", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForPlaylist(undefined, true, 404);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: calling getPlaylist with non-existent ID
      const nonExistentId = "invalid-playlist-id-12345";

      // Then: error has resourceType='playlist'
      try {
        await adapter.getPlaylist(nonExistentId);
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.resourceType).toBe("playlist");
        }
      }
    });

    // AC-008 Error: resourceId is the specified ID
    test("should throw NotFoundError with correct resourceId", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForPlaylist(undefined, true, 404);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: calling getPlaylist with non-existent ID
      const nonExistentId = "test-invalid-playlist-999";

      // Then: error has resourceId set to the requested ID
      try {
        await adapter.getPlaylist(nonExistentId);
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.resourceId).toBe(nonExistentId);
        }
      }
    });

    // AC-008 Error: Error message format
    test("should throw NotFoundError with formatted error message", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForPlaylist(undefined, true, 404);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: calling getPlaylist with non-existent ID
      const nonExistentId = "missing-playlist-123";

      // Then: error message contains playlist and ID
      try {
        await adapter.getPlaylist(nonExistentId);
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.message).toContain("playlist");
          expect(error.message).toContain(nonExistentId);
        }
      }
    });

    // AC-008 Error: NotFoundError is catchable with instanceof
    test("should be catchable using instanceof NotFoundError", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForPlaylist(undefined, true, 404);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When/Then: can catch using instanceof
      try {
        await adapter.getPlaylist("non-existent-id");
        throw new Error("Expected NotFoundError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });
  });

  describe("Edge Cases", () => {
    // Edge case: Empty string ID
    test("should handle empty string playlist ID", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForPlaylist(undefined, true, 404);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: calling with empty string
      const emptyId = "";

      // Then: should handle gracefully (likely NotFoundError or error)
      await expect(adapter.getPlaylist(emptyId)).rejects.toThrow();
    });

    // Edge case: Very long ID string
    test("should handle very long playlist ID strings", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForPlaylist(undefined, true, 404);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: calling with very long ID
      const longId = "a".repeat(1000);

      // Then: should handle gracefully (likely NotFoundError)
      await expect(adapter.getPlaylist(longId)).rejects.toThrow();
    });

    // Edge case: Special characters in ID
    test("should handle playlist IDs with special characters", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForPlaylist(undefined, true, 404);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: calling with special characters
      const specialId = "playlist-!@#$%^&*()";

      // Then: should handle gracefully
      await expect(adapter.getPlaylist(specialId)).rejects.toThrow();
    });

    // Edge case: Whitespace in ID
    test("should handle playlist IDs with whitespace", async () => {
      // Given: valid authentication config with mocked SDK that throws 404
      const mockSdk = createMockSdkForPlaylist(undefined, true, 404);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: calling with whitespace
      const idWithSpaces = "  playlist-id-with-spaces  ";

      // Then: should handle gracefully
      await expect(adapter.getPlaylist(idWithSpaces)).rejects.toThrow();
    });

    // Edge case: Playlist with many tracks
    test("should handle playlists with multiple tracks", async () => {
      // Given: valid authentication config with mocked SDK
      const mockTrackItem = {
        track: {
          id: "track-id",
          name: "Track Name",
          duration_ms: 200000,
          preview_url: null,
          external_urls: { spotify: "https://open.spotify.com/track/track-id" },
          artists: [
            {
              id: "artist-id",
              name: "Artist Name",
              external_urls: {
                spotify: "https://open.spotify.com/artist/artist-id",
              },
            },
          ],
          album: {
            id: "album-id",
            name: "Album Name",
            release_date: "2024-01-01",
            total_tracks: 10,
            images: [],
            external_urls: {
              spotify: "https://open.spotify.com/album/album-id",
            },
            artists: [
              {
                id: "artist-id",
                name: "Artist Name",
                external_urls: {
                  spotify: "https://open.spotify.com/artist/artist-id",
                },
              },
            ],
          },
        },
      };
      const mockPlaylist = createMockSpotifyPlaylist({
        tracks: {
          items: [mockTrackItem, mockTrackItem, mockTrackItem],
        },
      });
      const mockSdk = createMockSdkForPlaylist(mockPlaylist);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: getPlaylist is called for playlist with multiple tracks
      const playlist = await adapter.getPlaylist("multi-track-playlist");

      // Then: tracks array contains all tracks
      expect(playlist.tracks).toBeDefined();
      expect(playlist.tracks.length).toBe(3);
    });

    // Edge case: Playlist with empty images array
    test("should handle playlists with empty images array", async () => {
      // Given: valid authentication config with mocked SDK
      const mockPlaylist = createMockSpotifyPlaylist({ images: [] });
      const mockSdk = createMockSdkForPlaylist(mockPlaylist);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: getPlaylist is called for playlist without images
      const playlist = await adapter.getPlaylist("playlist-no-images");

      // Then: images array is empty
      expect(playlist.images).toBeDefined();
      expect(Array.isArray(playlist.images)).toBe(true);
      expect(playlist.images.length).toBe(0);
    });
  });

  describe("Multiple Calls", () => {
    // Verify multiple calls work independently
    test("should handle multiple sequential getPlaylist calls", async () => {
      // Given: valid authentication config with mocked SDK
      const mockSdk = createMockSdkForPlaylist();
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: calling getPlaylist multiple times
      const playlist1 = await adapter.getPlaylist("37i9dQZF1DWXRqgbRLwIKR");
      const playlist2 = await adapter.getPlaylist("37i9dQZF1DWXRqgbRLwIKR");

      // Then: both calls succeed
      expect(playlist1).toBeDefined();
      expect(playlist2).toBeDefined();
      expect(playlist1.id).toBe(playlist2.id);
    });

    // Verify different playlist IDs work
    test("should retrieve different playlists with different IDs", async () => {
      // Given: valid authentication config with mocked SDK returning dynamic ID
      const mockGet = mock(async (id: string) => {
        return createMockSpotifyPlaylist({ id });
      });
      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: { getPlaylist: mockGet },
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };
      const adapter = createSpotifyAdapter(config);

      // When: calling getPlaylist with different IDs
      const playlistId1 = "37i9dQZF1DWXRqgbRLwIKR";
      const playlistId2 = "different-playlist-id";

      const playlist1 = await adapter.getPlaylist(playlistId1);
      const playlist2 = await adapter.getPlaylist(playlistId2);

      // Then: both calls succeed with correct IDs
      expect(playlist1).toBeDefined();
      expect(playlist1.id).toBe(playlistId1);
      expect(playlist2).toBeDefined();
      expect(playlist2.id).toBe(playlistId2);
    });
  });

  describe("Null Track Filtering", () => {
    // Critical: Verify null tracks (deleted/unavailable) are filtered out
    test("should filter out null tracks from playlist items", async () => {
      // Given: Playlist with some null tracks (deleted tracks)
      const validTrack = {
        id: "valid-track-id",
        name: "Valid Track",
        duration_ms: 200000,
        preview_url: null,
        external_urls: { spotify: "https://open.spotify.com/track/valid" },
        artists: [
          {
            id: "artist-id",
            name: "Artist",
            external_urls: { spotify: "https://open.spotify.com/artist/id" },
          },
        ],
        album: {
          id: "album-id",
          name: "Album",
          release_date: "2024-01-01",
          total_tracks: 10,
          images: [],
          external_urls: { spotify: "https://open.spotify.com/album/id" },
          artists: [
            {
              id: "artist-id",
              name: "Artist",
              external_urls: { spotify: "https://open.spotify.com/artist/id" },
            },
          ],
        },
      };
      const mockPlaylist = createMockSpotifyPlaylist({
        tracks: {
          items: [
            { track: validTrack },
            { track: null }, // Deleted track
            { track: { ...validTrack, id: "track-2", name: "Track 2" } },
          ],
        },
      });
      const mockSdk = createMockSdkForPlaylist(mockPlaylist);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: getPlaylist is called
      const playlist = await adapter.getPlaylist("test-id");

      // Then: only non-null tracks are returned (2 out of 3)
      expect(playlist.tracks.length).toBe(2);
      expect(playlist.tracks[0].id).toBe("valid-track-id");
      expect(playlist.tracks[1].id).toBe("track-2");
    });

    test("should handle playlist with all null tracks", async () => {
      // Given: Playlist where all tracks are null (all deleted)
      const mockPlaylist = createMockSpotifyPlaylist({
        tracks: {
          items: [{ track: null }, { track: null }],
        },
      });
      const mockSdk = createMockSdkForPlaylist(mockPlaylist);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When: getPlaylist is called
      const playlist = await adapter.getPlaylist("all-deleted-playlist");

      // Then: tracks array is empty
      expect(playlist.tracks).toEqual([]);
    });
  });

  describe("Error Propagation", () => {
    // Critical: Non-404 errors should be transformed to SpotifyApiError
    test("should transform non-404 errors to SpotifyApiError", async () => {
      // Given: SDK throws 500 error
      const mockSdk = createMockSdkForPlaylist(undefined, true, 500);
      const adapter = createMockedAdapterForPlaylist(mockSdk);

      // When/Then: error is transformed to SpotifyApiError with statusCode
      try {
        await adapter.getPlaylist("test-id");
        throw new Error("Expected error to be thrown");
      } catch (error) {
        expect(error).not.toBeInstanceOf(NotFoundError);
        expect(error).toBeInstanceOf(SpotifyApiError);
        expect((error as SpotifyApiError).statusCode).toBe(500);
      }
    });

    test("should transform errors without status property to NetworkError", async () => {
      // Given: SDK throws error without status (network error)
      const mockGet = mock(async () => {
        throw new Error("Network timeout");
      });
      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: { getPlaylist: mockGet },
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };
      const adapter = createSpotifyAdapter(config);

      // When/Then: error is transformed to NetworkError
      await expect(adapter.getPlaylist("test-id")).rejects.toThrow(
        NetworkError,
      );
    });
  });
});

// NFR-002: Error Handling
describe("Error Handling [NFR-002]", () => {
  // Helper to create mocked adapter with custom SDK behavior
  // Automatically adds logOut mock to support token refresh logic
  const createMockedAdapterWithError = (
    mockImplementation: () => Partial<
      ReturnType<typeof SpotifyApi.withClientCredentials>
    >,
  ) => {
    SpotifyApi.withClientCredentials = mock(
      () =>
        ({
          ...mockImplementation(),
          logOut: mock(() => {}),
        }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
    );
    const config: SpotifyConfig = {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
    };
    return createSpotifyAdapter(config);
  };

  // AC-002: Invalid credentials [FR-001, Error]
  describe("AuthenticationError - Invalid Credentials", () => {
    test("should throw AuthenticationError when SDK returns 401 on getTrack", async () => {
      // Given: SDK configured with invalid credentials that returns 401
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Invalid client credentials") as Error & {
          status: number;
        };
        error.status = 401;
        return {
          tracks: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: calling getTrack throws AuthenticationError
      await expect(adapter.getTrack("track-id")).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should throw AuthenticationError with correct message on 401", async () => {
      // Given: SDK returns 401 error
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Invalid client credentials") as Error & {
          status: number;
        };
        error.status = 401;
        return {
          tracks: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When: calling getTrack with invalid credentials
      try {
        await adapter.getTrack("track-id");
        throw new Error("Expected AuthenticationError to be thrown");
      } catch (error) {
        // Then: error message contains "Invalid client credentials"
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as Error).message).toContain(
          "Invalid client credentials",
        );
      }
    });

    test("should throw AuthenticationError on searchTracks with 401", async () => {
      // Given: SDK returns 401 on search
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Invalid client credentials") as Error & {
          status: number;
        };
        error.status = 401;
        return {
          search: mock(async () => {
            throw error;
          }),
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: searchTracks throws AuthenticationError
      await expect(adapter.searchTracks("query")).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should throw AuthenticationError on getAlbum with 401", async () => {
      // Given: SDK returns 401 on album fetch
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Invalid client credentials") as Error & {
          status: number;
        };
        error.status = 401;
        return {
          albums: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: getAlbum throws AuthenticationError
      await expect(adapter.getAlbum("album-id")).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should throw AuthenticationError on getArtist with 401", async () => {
      // Given: SDK returns 401 on artist fetch
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Invalid client credentials") as Error & {
          status: number;
        };
        error.status = 401;
        return {
          artists: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: getArtist throws AuthenticationError
      await expect(adapter.getArtist("artist-id")).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should throw AuthenticationError on getPlaylist with 401", async () => {
      // Given: SDK returns 401 on playlist fetch
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Invalid client credentials") as Error & {
          status: number;
        };
        error.status = 401;
        return {
          playlists: {
            getPlaylist: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: getPlaylist throws AuthenticationError
      await expect(adapter.getPlaylist("playlist-id")).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should be catchable with instanceof AuthenticationError", async () => {
      // Given: SDK returns 401
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Invalid client credentials") as Error & {
          status: number;
        };
        error.status = 401;
        return {
          tracks: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: can catch using instanceof
      try {
        await adapter.getTrack("track-id");
        throw new Error("Expected AuthenticationError to be thrown");
      } catch (error) {
        const isAuthError = error instanceof AuthenticationError;
        expect(isAuthError).toBe(true);
      }
    });
  });

  // AC-009: Rate limit error [NFR-002, Error]
  describe("RateLimitError - Rate Limiting", () => {
    test("should throw RateLimitError when SDK returns 429 on getTrack", async () => {
      // Given: API rate limit has been exceeded (429 response)
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Rate limit exceeded") as Error & {
          status: number;
          headers?: { "retry-after": string };
        };
        error.status = 429;
        error.headers = { "retry-after": "60" };
        return {
          tracks: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: calling getTrack throws RateLimitError
      await expect(adapter.getTrack("track-id")).rejects.toThrow(
        RateLimitError,
      );
    });

    test("should throw RateLimitError with positive retryAfter value", async () => {
      // Given: API returns 429 with Retry-After header
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Rate limit exceeded") as Error & {
          status: number;
          headers?: { "retry-after": string };
        };
        error.status = 429;
        error.headers = { "retry-after": "120" };
        return {
          tracks: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When: calling API method during rate limit
      try {
        await adapter.getTrack("track-id");
        throw new Error("Expected RateLimitError to be thrown");
      } catch (error) {
        // Then: retryAfter is a positive number from Retry-After header
        expect(error).toBeInstanceOf(RateLimitError);
        if (error instanceof RateLimitError) {
          expect(error.retryAfter).toBe(120);
          expect(error.retryAfter).toBeGreaterThan(0);
        }
      }
    });

    test("should throw RateLimitError on searchTracks with 429", async () => {
      // Given: API rate limit exceeded on search
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Rate limit exceeded") as Error & {
          status: number;
          headers?: { "retry-after": string };
        };
        error.status = 429;
        error.headers = { "retry-after": "30" };
        return {
          search: mock(async () => {
            throw error;
          }),
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: searchTracks throws RateLimitError
      await expect(adapter.searchTracks("query")).rejects.toThrow(
        RateLimitError,
      );
    });

    test("should throw RateLimitError on getAlbum with 429", async () => {
      // Given: API rate limit exceeded on album fetch
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Rate limit exceeded") as Error & {
          status: number;
          headers?: { "retry-after": string };
        };
        error.status = 429;
        error.headers = { "retry-after": "45" };
        return {
          albums: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: getAlbum throws RateLimitError with retryAfter
      try {
        await adapter.getAlbum("album-id");
        throw new Error("Expected RateLimitError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        if (error instanceof RateLimitError) {
          expect(error.retryAfter).toBe(45);
        }
      }
    });

    test("should throw RateLimitError on getArtist with 429", async () => {
      // Given: API rate limit exceeded on artist fetch
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Rate limit exceeded") as Error & {
          status: number;
          headers?: { "retry-after": string };
        };
        error.status = 429;
        error.headers = { "retry-after": "90" };
        return {
          artists: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: getArtist throws RateLimitError
      await expect(adapter.getArtist("artist-id")).rejects.toThrow(
        RateLimitError,
      );
    });

    test("should throw RateLimitError on getPlaylist with 429", async () => {
      // Given: API rate limit exceeded on playlist fetch
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Rate limit exceeded") as Error & {
          status: number;
          headers?: { "retry-after": string };
        };
        error.status = 429;
        error.headers = { "retry-after": "60" };
        return {
          playlists: {
            getPlaylist: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: getPlaylist throws RateLimitError
      await expect(adapter.getPlaylist("playlist-id")).rejects.toThrow(
        RateLimitError,
      );
    });

    test("should handle missing Retry-After header with default value", async () => {
      // Given: API returns 429 without Retry-After header
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Rate limit exceeded") as Error & {
          status: number;
        };
        error.status = 429;
        return {
          tracks: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When: calling API during rate limit without Retry-After header
      try {
        await adapter.getTrack("track-id");
        throw new Error("Expected RateLimitError to be thrown");
      } catch (error) {
        // Then: error should still be RateLimitError with reasonable default
        expect(error).toBeInstanceOf(RateLimitError);
        if (error instanceof RateLimitError) {
          expect(error.retryAfter).toBeGreaterThan(0);
        }
      }
    });

    test("should be catchable with instanceof RateLimitError", async () => {
      // Given: API returns 429
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Rate limit exceeded") as Error & {
          status: number;
          headers?: { "retry-after": string };
        };
        error.status = 429;
        error.headers = { "retry-after": "60" };
        return {
          tracks: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: can catch using instanceof
      try {
        await adapter.getTrack("track-id");
        throw new Error("Expected RateLimitError to be thrown");
      } catch (error) {
        const isRateLimitError = error instanceof RateLimitError;
        expect(isRateLimitError).toBe(true);
      }
    });
  });

  // AC-010: Network error [NFR-002, Error]
  describe("NetworkError - Network Failures", () => {
    test("should throw NetworkError when network is unavailable on getTrack", async () => {
      // Given: Network connection is unavailable
      const adapter = createMockedAdapterWithError(() => {
        const networkError = new Error("fetch failed");
        networkError.name = "FetchError";
        return {
          tracks: {
            get: mock(async () => {
              throw networkError;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: calling getTrack throws NetworkError
      await expect(adapter.getTrack("track-id")).rejects.toThrow(NetworkError);
    });

    test("should throw NetworkError on connection timeout", async () => {
      // Given: Network request times out
      const adapter = createMockedAdapterWithError(() => {
        const timeoutError = new Error("Request timeout");
        timeoutError.name = "TimeoutError";
        return {
          tracks: {
            get: mock(async () => {
              throw timeoutError;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: calling getTrack throws NetworkError
      await expect(adapter.getTrack("track-id")).rejects.toThrow(NetworkError);
    });

    test("should throw NetworkError with cause property", async () => {
      // Given: Network error occurs
      const originalError = new Error("Connection refused");
      const adapter = createMockedAdapterWithError(() => {
        return {
          tracks: {
            get: mock(async () => {
              throw originalError;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When: network error occurs
      try {
        await adapter.getTrack("track-id");
        throw new Error("Expected NetworkError to be thrown");
      } catch (error) {
        // Then: NetworkError contains original error as cause
        expect(error).toBeInstanceOf(NetworkError);
        if (error instanceof NetworkError) {
          expect(error.cause).toBeDefined();
        }
      }
    });

    test("should throw NetworkError on searchTracks with network failure", async () => {
      // Given: Network failure on search
      const adapter = createMockedAdapterWithError(() => {
        return {
          search: mock(async () => {
            throw new Error("Network unavailable");
          }),
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: searchTracks throws NetworkError
      await expect(adapter.searchTracks("query")).rejects.toThrow(NetworkError);
    });

    test("should throw NetworkError on getAlbum with network failure", async () => {
      // Given: Network failure on album fetch
      const adapter = createMockedAdapterWithError(() => {
        return {
          albums: {
            get: mock(async () => {
              throw new Error("DNS resolution failed");
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: getAlbum throws NetworkError
      await expect(adapter.getAlbum("album-id")).rejects.toThrow(NetworkError);
    });

    test("should throw NetworkError on getArtist with network failure", async () => {
      // Given: Network failure on artist fetch
      const adapter = createMockedAdapterWithError(() => {
        return {
          artists: {
            get: mock(async () => {
              throw new Error("Socket timeout");
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: getArtist throws NetworkError
      await expect(adapter.getArtist("artist-id")).rejects.toThrow(
        NetworkError,
      );
    });

    test("should throw NetworkError on getPlaylist with network failure", async () => {
      // Given: Network failure on playlist fetch
      const adapter = createMockedAdapterWithError(() => {
        return {
          playlists: {
            getPlaylist: mock(async () => {
              throw new Error("Network interface down");
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: getPlaylist throws NetworkError
      await expect(adapter.getPlaylist("playlist-id")).rejects.toThrow(
        NetworkError,
      );
    });

    test("should be catchable with instanceof NetworkError", async () => {
      // Given: Network error occurs
      const adapter = createMockedAdapterWithError(() => {
        return {
          tracks: {
            get: mock(async () => {
              throw new Error("Network error");
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: can catch using instanceof
      try {
        await adapter.getTrack("track-id");
        throw new Error("Expected NetworkError to be thrown");
      } catch (error) {
        const isNetworkError = error instanceof NetworkError;
        expect(isNetworkError).toBe(true);
      }
    });
  });

  // Additional error handling: SpotifyApiError for other API errors
  describe("SpotifyApiError - Other API Errors", () => {
    test("should throw SpotifyApiError on 500 Internal Server Error", async () => {
      // Given: Spotify API returns 500 error
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Internal Server Error") as Error & {
          status: number;
        };
        error.status = 500;
        return {
          tracks: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: calling getTrack throws SpotifyApiError
      await expect(adapter.getTrack("track-id")).rejects.toThrow(
        SpotifyApiError,
      );
    });

    test("should throw SpotifyApiError with correct statusCode", async () => {
      // Given: API returns 503 Service Unavailable
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Service Unavailable") as Error & {
          status: number;
        };
        error.status = 503;
        return {
          tracks: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When: calling API during service outage
      try {
        await adapter.getTrack("track-id");
        throw new Error("Expected SpotifyApiError to be thrown");
      } catch (error) {
        // Then: error has correct status code
        expect(error).toBeInstanceOf(SpotifyApiError);
        if (error instanceof SpotifyApiError) {
          expect(error.statusCode).toBe(503);
        }
      }
    });

    test("should throw SpotifyApiError on 502 Bad Gateway", async () => {
      // Given: API returns 502 error
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Bad Gateway") as Error & { status: number };
        error.status = 502;
        return {
          search: mock(async () => {
            throw error;
          }),
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: searchTracks throws SpotifyApiError
      await expect(adapter.searchTracks("query")).rejects.toThrow(
        SpotifyApiError,
      );
    });

    test("should be catchable with instanceof SpotifyApiError", async () => {
      // Given: API returns 500
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Internal Server Error") as Error & {
          status: number;
        };
        error.status = 500;
        return {
          tracks: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: can catch using instanceof
      try {
        await adapter.getTrack("track-id");
        throw new Error("Expected SpotifyApiError to be thrown");
      } catch (error) {
        const isSpotifyApiError = error instanceof SpotifyApiError;
        expect(isSpotifyApiError).toBe(true);
      }
    });
  });

  // Error differentiation tests
  describe("Error Type Differentiation", () => {
    test("should differentiate between 401, 404, 429, 500, and network errors", async () => {
      // Table-driven test for different error types
      const errorScenarios = [
        {
          name: "401 returns AuthenticationError",
          status: 401,
          expectedType: AuthenticationError,
        },
        {
          name: "404 returns NotFoundError",
          status: 404,
          expectedType: NotFoundError,
        },
        {
          name: "429 returns RateLimitError",
          status: 429,
          expectedType: RateLimitError,
        },
        {
          name: "500 returns SpotifyApiError",
          status: 500,
          expectedType: SpotifyApiError,
        },
        {
          name: "503 returns SpotifyApiError",
          status: 503,
          expectedType: SpotifyApiError,
        },
      ];

      for (const scenario of errorScenarios) {
        // Given: API returns specific status code
        const adapter = createMockedAdapterWithError(() => {
          const error = new Error("API Error") as Error & {
            status: number;
            headers?: { "retry-after": string };
          };
          error.status = scenario.status;
          if (scenario.status === 429) {
            error.headers = { "retry-after": "60" };
          }
          return {
            tracks: {
              get: mock(async () => {
                throw error;
              }),
            },
          } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
        });

        // When/Then: correct error type is thrown
        try {
          await adapter.getTrack("track-id");
          throw new Error(
            `Expected ${scenario.expectedType.name} to be thrown for ${scenario.name}`,
          );
        } catch (error) {
          expect(error).toBeInstanceOf(scenario.expectedType);
        }
      }
    });

    test("should handle error type precedence correctly", async () => {
      // Verify that specific error types take precedence over generic ones
      // 404 should be NotFoundError, not SpotifyApiError
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("Not found") as Error & { status: number };
        error.status = 404;
        return {
          tracks: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      try {
        await adapter.getTrack("track-id");
        throw new Error("Expected error to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error).not.toBeInstanceOf(SpotifyApiError);
      }
    });
  });

  // Edge cases for error handling
  describe("Error Handling Edge Cases", () => {
    test("should handle error without status property as NetworkError", async () => {
      // Given: Error without status property (network error)
      const adapter = createMockedAdapterWithError(() => {
        return {
          tracks: {
            get: mock(async () => {
              throw new Error("Connection reset");
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: throws NetworkError
      await expect(adapter.getTrack("track-id")).rejects.toThrow(NetworkError);
    });

    test("should handle non-Error objects thrown by SDK", async () => {
      // Given: SDK throws non-Error object
      const adapter = createMockedAdapterWithError(() => {
        return {
          tracks: {
            get: mock(async () => {
              throw "String error"; // eslint-disable-line @typescript-eslint/only-throw-error
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When/Then: error is still thrown (may be wrapped)
      await expect(adapter.getTrack("track-id")).rejects.toThrow();
    });

    test("should preserve error stack traces", async () => {
      // Given: API error occurs
      const adapter = createMockedAdapterWithError(() => {
        const error = new Error("API Error") as Error & { status: number };
        error.status = 500;
        return {
          tracks: {
            get: mock(async () => {
              throw error;
            }),
          },
        } as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>;
      });

      // When: error is caught
      try {
        await adapter.getTrack("track-id");
        throw new Error("Expected error to be thrown");
      } catch (error) {
        // Then: stack trace should be preserved
        expect(error).toBeInstanceOf(SpotifyApiError);
        expect((error as Error).stack).toBeDefined();
        expect((error as Error).stack?.length).toBeGreaterThan(0);
      }
    });
  });
});

// NFR-003: Token Auto Refresh [AC-011]
describe("Token Auto Refresh [NFR-003]", () => {
  // Helper to create mock that fails with 401 on first call, succeeds on second
  const createMockWithTokenRefresh = (
    successData: unknown,
    mockSdkFactory: (
      getMock: ReturnType<typeof mock>,
      logOutMock: ReturnType<typeof mock>,
    ) => ReturnType<typeof SpotifyApi.withClientCredentials>,
  ) => {
    let tokenCleared = false;
    const logOutMock = mock(() => {
      // Mark token as cleared - subsequent calls should succeed
      tokenCleared = true;
    });
    const getMock = mock(async () => {
      if (!tokenCleared) {
        // First call: token expired, return 401
        const error = new Error("Token expired") as Error & { status: number };
        error.status = 401;
        throw error;
      }
      // After logOut: new token obtained, return success
      return successData;
    });

    SpotifyApi.withClientCredentials = mock(() =>
      mockSdkFactory(getMock, logOutMock),
    );

    const config: SpotifyConfig = {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
    };
    return { adapter: createSpotifyAdapter(config), getMock, logOutMock };
  };

  // Helper to create mock that always fails with 401 (invalid credentials)
  const createMockWithPersistent401 = (
    mockSdkFactory: (
      getMock: ReturnType<typeof mock>,
      logOutMock: ReturnType<typeof mock>,
    ) => ReturnType<typeof SpotifyApi.withClientCredentials>,
  ) => {
    const logOutMock = mock(() => {});
    const getMock = mock(async () => {
      const error = new Error("Invalid credentials") as Error & {
        status: number;
      };
      error.status = 401;
      throw error;
    });

    SpotifyApi.withClientCredentials = mock(() =>
      mockSdkFactory(getMock, logOutMock),
    );

    const config: SpotifyConfig = {
      clientId: "invalid-client-id",
      clientSecret: "invalid-client-secret",
    };
    return { adapter: createSpotifyAdapter(config), getMock, logOutMock };
  };

  // AC-011: Token auto-refresh on getTrack
  describe("getTrack with token refresh", () => {
    test("should retry and succeed when token expires on first call", async () => {
      // Given: Token expires on first API call
      const mockTrack = createMockSpotifyTrack();
      const { adapter, getMock, logOutMock } = createMockWithTokenRefresh(
        mockTrack,
        (getMock, logOutMock) =>
          ({
            tracks: { get: getMock },
            logOut: logOutMock,
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      // When: getTrack is called
      const result = await adapter.getTrack("4iV5W9uYEdYUVa79Axb7Rh");

      // Then: Request succeeds after token refresh
      expect(result).toBeDefined();
      expect(result.id).toBe("4iV5W9uYEdYUVa79Axb7Rh");
      expect(result.name).toBe("Hotel California");
      // Verify logOut was called to clear token
      expect(logOutMock).toHaveBeenCalledTimes(1);
      // Verify the API was called twice (first failed, second succeeded)
      expect(getMock).toHaveBeenCalledTimes(2);
    });

    test("should not throw error to caller when token refresh succeeds", async () => {
      // Given: Token expires on first call
      const mockTrack = createMockSpotifyTrack();
      const { adapter } = createMockWithTokenRefresh(
        mockTrack,
        (getMock, logOutMock) =>
          ({
            tracks: { get: getMock },
            logOut: logOutMock,
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      // When/Then: getTrack does not throw
      await expect(
        adapter.getTrack("4iV5W9uYEdYUVa79Axb7Rh"),
      ).resolves.toBeDefined();
    });

    test("should throw AuthenticationError when credentials are truly invalid", async () => {
      // Given: Credentials are invalid (401 persists after retry)
      const { adapter, getMock } = createMockWithPersistent401(
        (getMock, logOutMock) =>
          ({
            tracks: { get: getMock },
            logOut: logOutMock,
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      // When/Then: getTrack throws AuthenticationError
      await expect(adapter.getTrack("track-id")).rejects.toThrow(
        AuthenticationError,
      );
      // Verify retry was attempted (2 calls)
      expect(getMock).toHaveBeenCalledTimes(2);
    });
  });

  // AC-011: Token auto-refresh on searchTracks
  describe("searchTracks with token refresh", () => {
    test("should retry and succeed when token expires on first call", async () => {
      // Given: Token expires on first search call
      const mockSearchResult = {
        tracks: {
          items: [createMockSpotifyTrack()],
          total: 100,
          limit: 20,
          offset: 0,
        },
      };
      let tokenCleared = false;
      const logOutMock = mock(() => {
        tokenCleared = true;
      });
      const searchMock = mock(async () => {
        if (!tokenCleared) {
          const error = new Error("Token expired") as Error & {
            status: number;
          };
          error.status = 401;
          throw error;
        }
        return mockSearchResult;
      });

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            search: searchMock,
            logOut: logOutMock,
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      });

      // When: searchTracks is called
      const result = await adapter.searchTracks("hotel california");

      // Then: Request succeeds after token refresh
      expect(result).toBeDefined();
      expect(result.items.length).toBe(1);
      expect(logOutMock).toHaveBeenCalledTimes(1);
      expect(searchMock).toHaveBeenCalledTimes(2);
    });

    test("should throw AuthenticationError when credentials are truly invalid on search", async () => {
      // Given: Invalid credentials (401 persists)
      const logOutMock = mock(() => {});
      const searchMock = mock(async () => {
        const error = new Error("Invalid credentials") as Error & {
          status: number;
        };
        error.status = 401;
        throw error;
      });

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            search: searchMock,
            logOut: logOutMock,
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "invalid-id",
        clientSecret: "invalid-secret",
      });

      // When/Then: searchTracks throws AuthenticationError
      await expect(adapter.searchTracks("query")).rejects.toThrow(
        AuthenticationError,
      );
    });
  });

  // AC-011: Token auto-refresh on getAlbum
  describe("getAlbum with token refresh", () => {
    test("should retry and succeed when token expires on first call", async () => {
      // Given: Token expires on first call
      const mockAlbum = {
        id: "2widuo17g5CEC66IbzveRu",
        name: "Hotel California",
        release_date: "1976-12-08",
        total_tracks: 9,
        images: [
          { url: "https://example.com/image.jpg", width: 640, height: 640 },
        ],
        external_urls: {
          spotify: "https://open.spotify.com/album/2widuo17g5CEC66IbzveRu",
        },
        artists: [
          {
            id: "0ECwFtbIWEVNwjlrfc6xoL",
            name: "Eagles",
            external_urls: {
              spotify: "https://open.spotify.com/artist/0ECwFtbIWEVNwjlrfc6xoL",
            },
          },
        ],
      };
      const { adapter, getMock, logOutMock } = createMockWithTokenRefresh(
        mockAlbum,
        (getMock, logOutMock) =>
          ({
            albums: { get: getMock },
            logOut: logOutMock,
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      // When: getAlbum is called
      const result = await adapter.getAlbum("2widuo17g5CEC66IbzveRu");

      // Then: Request succeeds after token refresh
      expect(result).toBeDefined();
      expect(result.id).toBe("2widuo17g5CEC66IbzveRu");
      expect(logOutMock).toHaveBeenCalledTimes(1);
      expect(getMock).toHaveBeenCalledTimes(2);
    });
  });

  // AC-011: Token auto-refresh on getArtist
  describe("getArtist with token refresh", () => {
    test("should retry and succeed when token expires on first call", async () => {
      // Given: Token expires on first call
      const mockArtist = {
        id: "0ECwFtbIWEVNwjlrfc6xoL",
        name: "Eagles",
        genres: ["rock", "classic rock"],
        images: [
          { url: "https://example.com/artist.jpg", width: 640, height: 640 },
        ],
        external_urls: {
          spotify: "https://open.spotify.com/artist/0ECwFtbIWEVNwjlrfc6xoL",
        },
      };
      const { adapter, getMock, logOutMock } = createMockWithTokenRefresh(
        mockArtist,
        (getMock, logOutMock) =>
          ({
            artists: { get: getMock },
            logOut: logOutMock,
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      // When: getArtist is called
      const result = await adapter.getArtist("0ECwFtbIWEVNwjlrfc6xoL");

      // Then: Request succeeds after token refresh
      expect(result).toBeDefined();
      expect(result.id).toBe("0ECwFtbIWEVNwjlrfc6xoL");
      expect(logOutMock).toHaveBeenCalledTimes(1);
      expect(getMock).toHaveBeenCalledTimes(2);
    });
  });

  // AC-011: Token auto-refresh on getPlaylist
  describe("getPlaylist with token refresh", () => {
    test("should retry and succeed when token expires on first call", async () => {
      // Given: Token expires on first call
      const mockPlaylist = {
        id: "37i9dQZF1DXcBWIGoYBM5M",
        name: "Today's Top Hits",
        description: "Top hits playlist",
        owner: { id: "spotify", display_name: "Spotify" },
        tracks: { items: [] },
        images: [
          { url: "https://example.com/playlist.jpg", width: 640, height: 640 },
        ],
        external_urls: {
          spotify: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
        },
      };
      let tokenCleared = false;
      const logOutMock = mock(() => {
        tokenCleared = true;
      });
      const getPlaylistMock = mock(async () => {
        if (!tokenCleared) {
          const error = new Error("Token expired") as Error & {
            status: number;
          };
          error.status = 401;
          throw error;
        }
        return mockPlaylist;
      });

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: { getPlaylist: getPlaylistMock },
            logOut: logOutMock,
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      });

      // When: getPlaylist is called
      const result = await adapter.getPlaylist("37i9dQZF1DXcBWIGoYBM5M");

      // Then: Request succeeds after token refresh
      expect(result).toBeDefined();
      expect(result.id).toBe("37i9dQZF1DXcBWIGoYBM5M");
      expect(logOutMock).toHaveBeenCalledTimes(1);
      expect(getPlaylistMock).toHaveBeenCalledTimes(2);
    });
  });

  // Edge cases
  describe("Token refresh edge cases", () => {
    test("should only retry once on 401", async () => {
      // Given: 401 persists after retry (truly invalid credentials)
      let callCount = 0;
      const logOutMock = mock(() => {});
      const getMock = mock(async () => {
        callCount++;
        const error = new Error("Invalid credentials") as Error & {
          status: number;
        };
        error.status = 401;
        throw error;
      });

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            tracks: { get: getMock },
            logOut: logOutMock,
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When/Then: getTrack throws AuthenticationError after exactly 2 attempts
      await expect(adapter.getTrack("track-id")).rejects.toThrow(
        AuthenticationError,
      );
      expect(callCount).toBe(2); // Initial + 1 retry
    });

    test("should not retry on non-401 errors", async () => {
      // Given: API returns 404 (not a token issue)
      let callCount = 0;
      const logOutMock = mock(() => {});
      const getMock = mock(async () => {
        callCount++;
        const error = new Error("Not found") as Error & { status: number };
        error.status = 404;
        throw error;
      });

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            tracks: { get: getMock },
            logOut: logOutMock,
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When/Then: getTrack throws NotFoundError without retry
      await expect(adapter.getTrack("invalid-id")).rejects.toThrow(
        NotFoundError,
      );
      expect(callCount).toBe(1); // No retry
      expect(logOutMock).not.toHaveBeenCalled();
    });

    test("should not call logOut on first successful request", async () => {
      // Given: Token is valid, request succeeds on first try
      const mockTrack = createMockSpotifyTrack();
      const logOutMock = mock(() => {});
      const getMock = mock(async () => mockTrack);

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            tracks: { get: getMock },
            logOut: logOutMock,
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getTrack succeeds on first try
      const result = await adapter.getTrack("track-id");

      // Then: logOut should not be called
      expect(result).toBeDefined();
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(logOutMock).not.toHaveBeenCalled();
    });
  });

  // CH-001: getTracks - Batch Track Retrieval
  describe("getTracks", () => {
    // AC-001: Get Multiple Tracks with valid IDs
    describe("AC-001: Get Multiple Tracks", () => {
      test("should return array of Track objects for valid IDs", async () => {
        // Given: Valid adapter with authentication
        const mockTrack1 = createMockSpotifyTrack({
          id: "track1",
          name: "Track 1",
        });
        const mockTrack2 = createMockSpotifyTrack({
          id: "track2",
          name: "Track 2",
        });
        const mockTrack3 = createMockSpotifyTrack({
          id: "track3",
          name: "Track 3",
        });

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              tracks: {
                get: mock(async (ids: string[]) => [
                  mockTrack1,
                  mockTrack2,
                  mockTrack3,
                ]),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getTracks is called with valid IDs
        const result = await adapter.getTracks(["track1", "track2", "track3"]);

        // Then: Returns array of Track objects
        expect(result).toBeArray();
        expect(result).toHaveLength(3);
      });

      test("should return tracks with required fields", async () => {
        // Given: Valid adapter with authentication
        const mockTrack = createMockSpotifyTrack();

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              tracks: {
                get: mock(async () => [mockTrack]),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getTracks is called
        const result = await adapter.getTracks(["track-id"]);

        // Then: Each Track has required fields
        expect(result[0].id).toBeDefined();
        expect(result[0].name).toBeDefined();
        expect(result[0].artists).toBeArray();
        expect(result[0].album).toBeDefined();
        expect(result[0].durationMs).toBeDefined();
      });

      test("should pass IDs to SDK tracks.get method", async () => {
        // Given: Valid adapter with authentication
        const mockTrack = createMockSpotifyTrack();
        const getMock = mock(async () => [mockTrack]);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              tracks: { get: getMock },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getTracks is called
        await adapter.getTracks(["id1", "id2", "id3"]);

        // Then: SDK get method is called with the IDs
        expect(getMock).toHaveBeenCalledWith(["id1", "id2", "id3"]);
      });
    });

    // AC-002: Get Multiple Tracks - Exceeds Limit
    describe("AC-002: Exceeds Limit", () => {
      test("should throw ValidationError when more than 50 IDs are provided", async () => {
        // Given: Valid adapter with authentication
        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              tracks: { get: mock(async () => []) },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getTracks is called with more than 50 IDs
        const ids = Array.from({ length: 51 }, (_, i) => `track${i}`);

        // Then: Throws ValidationError
        await expect(adapter.getTracks(ids)).rejects.toThrow(ValidationError);
      });

      test("should include count in error message when exceeding limit", async () => {
        // Given: Valid adapter with authentication
        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              tracks: { get: mock(async () => []) },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getTracks is called with 51 IDs
        const ids = Array.from({ length: 51 }, (_, i) => `track${i}`);

        // Then: Error message includes the count
        await expect(adapter.getTracks(ids)).rejects.toThrow(
          "getTracks accepts maximum 50 IDs, received 51",
        );
      });

      test("should accept exactly 50 IDs without error", async () => {
        // Given: Valid adapter with authentication
        const mockTracks = Array.from({ length: 50 }, (_, i) =>
          createMockSpotifyTrack({ id: `track${i}` }),
        );

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              tracks: { get: mock(async () => mockTracks) },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getTracks is called with exactly 50 IDs
        const ids = Array.from({ length: 50 }, (_, i) => `track${i}`);
        const result = await adapter.getTracks(ids);

        // Then: Returns successfully
        expect(result).toHaveLength(50);
      });
    });

    // AC-003: Get Multiple Tracks - Some Not Found
    describe("AC-003: Some Not Found", () => {
      test("should filter out null values for invalid IDs", async () => {
        // Given: Valid adapter, SDK returns null for invalid IDs
        const mockTrack1 = createMockSpotifyTrack({ id: "valid1" });
        const mockTrack2 = createMockSpotifyTrack({ id: "valid2" });

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              tracks: {
                get: mock(async () => [mockTrack1, null, mockTrack2, null]),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getTracks is called with mix of valid and invalid IDs
        const result = await adapter.getTracks([
          "valid1",
          "invalid1",
          "valid2",
          "invalid2",
        ]);

        // Then: Returns array containing only valid tracks
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe("valid1");
        expect(result[1].id).toBe("valid2");
      });

      test("should return empty array when all IDs are invalid", async () => {
        // Given: Valid adapter, SDK returns all nulls
        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              tracks: {
                get: mock(async () => [null, null, null]),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getTracks is called with all invalid IDs
        const result = await adapter.getTracks([
          "invalid1",
          "invalid2",
          "invalid3",
        ]);

        // Then: Returns empty array (no error thrown)
        expect(result).toBeArray();
        expect(result).toHaveLength(0);
      });
    });

    // AC-059: Empty Array Handling
    describe("AC-059: Empty Array Handling", () => {
      test("should return empty array without making API call when given empty array", async () => {
        // Given: Valid adapter with authentication
        const getMock = mock(async () => []);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              tracks: { get: getMock },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getTracks is called with empty array
        const result = await adapter.getTracks([]);

        // Then: Returns empty array without API call
        expect(result).toBeArray();
        expect(result).toHaveLength(0);
        expect(getMock).not.toHaveBeenCalled();
      });
    });
  });

  // CH-002: getAlbums - Batch Album Retrieval
  describe("getAlbums", () => {
    // Helper to create mock Spotify album
    const createMockAlbum = (overrides: Record<string, unknown> = {}) => ({
      id: "album-id",
      name: "Test Album",
      release_date: "2024-01-01",
      total_tracks: 10,
      external_urls: {
        spotify: "https://open.spotify.com/album/album-id",
      },
      artists: [
        {
          id: "artist-id",
          name: "Test Artist",
          external_urls: {
            spotify: "https://open.spotify.com/artist/artist-id",
          },
        },
      ],
      images: [
        { url: "https://i.scdn.co/image/abc123", width: 640, height: 640 },
      ],
      ...overrides,
    });

    // AC-004: Get Multiple Albums with valid IDs
    describe("AC-004: Get Multiple Albums", () => {
      test("should return array of Album objects for valid IDs", async () => {
        // Given: Valid adapter with authentication
        const mockAlbum1 = createMockAlbum({ id: "album1", name: "Album 1" });
        const mockAlbum2 = createMockAlbum({ id: "album2", name: "Album 2" });

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              albums: {
                get: mock(async () => [mockAlbum1, mockAlbum2]),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getAlbums is called with valid IDs
        const result = await adapter.getAlbums(["album1", "album2"]);

        // Then: Returns array of Album objects
        expect(result).toBeArray();
        expect(result).toHaveLength(2);
      });

      test("should return albums with required fields", async () => {
        // Given: Valid adapter with authentication
        const mockAlbum = createMockAlbum();

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              albums: {
                get: mock(async () => [mockAlbum]),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getAlbums is called
        const result = await adapter.getAlbums(["album-id"]);

        // Then: Each Album has required fields
        expect(result[0].id).toBeDefined();
        expect(result[0].name).toBeDefined();
        expect(result[0].artists).toBeArray();
        expect(result[0].releaseDate).toBeDefined();
        expect(result[0].totalTracks).toBeDefined();
        expect(result[0].images).toBeArray();
      });

      test("should pass IDs to SDK albums.get method", async () => {
        // Given: Valid adapter with authentication
        const mockAlbum = createMockAlbum();
        const getMock = mock(async () => [mockAlbum]);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              albums: { get: getMock },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getAlbums is called
        await adapter.getAlbums(["id1", "id2", "id3"]);

        // Then: SDK get method is called with the IDs
        expect(getMock).toHaveBeenCalledWith(["id1", "id2", "id3"]);
      });

      test("should filter out null values for invalid IDs", async () => {
        // Given: Valid adapter, SDK returns null for invalid IDs
        const mockAlbum1 = createMockAlbum({ id: "valid1" });
        const mockAlbum2 = createMockAlbum({ id: "valid2" });

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              albums: {
                get: mock(async () => [mockAlbum1, null, mockAlbum2, null]),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getAlbums is called with mix of valid and invalid IDs
        const result = await adapter.getAlbums([
          "valid1",
          "invalid1",
          "valid2",
          "invalid2",
        ]);

        // Then: Returns array containing only valid albums
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe("valid1");
        expect(result[1].id).toBe("valid2");
      });
    });

    // AC-005: Get Multiple Albums - Exceeds Limit
    describe("AC-005: Exceeds Limit", () => {
      test("should throw ValidationError when more than 20 IDs are provided", async () => {
        // Given: Valid adapter with authentication
        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              albums: { get: mock(async () => []) },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getAlbums is called with more than 20 IDs
        const ids = Array.from({ length: 21 }, (_, i) => `album${i}`);

        // Then: Throws ValidationError
        await expect(adapter.getAlbums(ids)).rejects.toThrow(ValidationError);
      });

      test("should include count in error message when exceeding limit", async () => {
        // Given: Valid adapter with authentication
        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              albums: { get: mock(async () => []) },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getAlbums is called with 21 IDs
        const ids = Array.from({ length: 21 }, (_, i) => `album${i}`);

        // Then: Error message includes the count
        await expect(adapter.getAlbums(ids)).rejects.toThrow(
          "getAlbums accepts maximum 20 IDs, received 21",
        );
      });

      test("should accept exactly 20 IDs without error", async () => {
        // Given: Valid adapter with authentication
        const mockAlbums = Array.from({ length: 20 }, (_, i) =>
          createMockAlbum({ id: `album${i}` }),
        );

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              albums: { get: mock(async () => mockAlbums) },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getAlbums is called with exactly 20 IDs
        const ids = Array.from({ length: 20 }, (_, i) => `album${i}`);
        const result = await adapter.getAlbums(ids);

        // Then: Returns successfully
        expect(result).toHaveLength(20);
      });
    });

    // AC-059: Empty Array Handling
    describe("AC-059: Empty Array Handling", () => {
      test("should return empty array without making API call when given empty array", async () => {
        // Given: Valid adapter with authentication
        const getMock = mock(async () => []);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              albums: { get: getMock },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getAlbums is called with empty array
        const result = await adapter.getAlbums([]);

        // Then: Returns empty array without API call
        expect(result).toBeArray();
        expect(result).toHaveLength(0);
        expect(getMock).not.toHaveBeenCalled();
      });
    });
  });

  // CH-003: getArtists - Batch Artist Retrieval
  describe("getArtists", () => {
    // Helper to create mock Spotify artist
    const createMockArtist = (overrides: Record<string, unknown> = {}) => ({
      id: "artist-id",
      name: "Test Artist",
      genres: ["rock", "pop"],
      external_urls: {
        spotify: "https://open.spotify.com/artist/artist-id",
      },
      images: [
        { url: "https://i.scdn.co/image/abc123", width: 640, height: 640 },
      ],
      ...overrides,
    });

    // AC-006: Get Multiple Artists with valid IDs
    describe("AC-006: Get Multiple Artists", () => {
      test("should return array of Artist objects for valid IDs", async () => {
        // Given: Valid adapter with authentication
        const mockArtist1 = createMockArtist({
          id: "artist1",
          name: "Artist 1",
        });
        const mockArtist2 = createMockArtist({
          id: "artist2",
          name: "Artist 2",
        });

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: {
                get: mock(async () => [mockArtist1, mockArtist2]),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtists is called with valid IDs
        const result = await adapter.getArtists(["artist1", "artist2"]);

        // Then: Returns array of Artist objects
        expect(result).toBeArray();
        expect(result).toHaveLength(2);
      });

      test("should return artists with required fields", async () => {
        // Given: Valid adapter with authentication
        const mockArtist = createMockArtist();

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: {
                get: mock(async () => [mockArtist]),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtists is called
        const result = await adapter.getArtists(["artist-id"]);

        // Then: Each Artist has required fields
        expect(result[0].id).toBeDefined();
        expect(result[0].name).toBeDefined();
        expect(result[0].externalUrl).toBeDefined();
      });

      test("should pass IDs to SDK artists.get method", async () => {
        // Given: Valid adapter with authentication
        const mockArtist = createMockArtist();
        const getMock = mock(async () => [mockArtist]);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: { get: getMock },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtists is called
        await adapter.getArtists(["id1", "id2", "id3"]);

        // Then: SDK get method is called with the IDs
        expect(getMock).toHaveBeenCalledWith(["id1", "id2", "id3"]);
      });

      test("should filter out null values for invalid IDs", async () => {
        // Given: Valid adapter, SDK returns null for invalid IDs
        const mockArtist1 = createMockArtist({ id: "valid1" });
        const mockArtist2 = createMockArtist({ id: "valid2" });

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: {
                get: mock(async () => [mockArtist1, null, mockArtist2, null]),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtists is called with mix of valid and invalid IDs
        const result = await adapter.getArtists([
          "valid1",
          "invalid1",
          "valid2",
          "invalid2",
        ]);

        // Then: Returns array containing only valid artists
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe("valid1");
        expect(result[1].id).toBe("valid2");
      });
    });

    // AC-007: Get Multiple Artists - Exceeds Limit
    describe("AC-007: Exceeds Limit", () => {
      test("should throw ValidationError when more than 50 IDs are provided", async () => {
        // Given: Valid adapter with authentication
        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: { get: mock(async () => []) },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtists is called with more than 50 IDs
        const ids = Array.from({ length: 51 }, (_, i) => `artist${i}`);

        // Then: Throws ValidationError
        await expect(adapter.getArtists(ids)).rejects.toThrow(ValidationError);
      });

      test("should include count in error message when exceeding limit", async () => {
        // Given: Valid adapter with authentication
        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: { get: mock(async () => []) },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtists is called with 51 IDs
        const ids = Array.from({ length: 51 }, (_, i) => `artist${i}`);

        // Then: Error message includes the count
        await expect(adapter.getArtists(ids)).rejects.toThrow(
          "getArtists accepts maximum 50 IDs, received 51",
        );
      });

      test("should accept exactly 50 IDs without error", async () => {
        // Given: Valid adapter with authentication
        const mockArtists = Array.from({ length: 50 }, (_, i) =>
          createMockArtist({ id: `artist${i}` }),
        );

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: { get: mock(async () => mockArtists) },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtists is called with exactly 50 IDs
        const ids = Array.from({ length: 50 }, (_, i) => `artist${i}`);
        const result = await adapter.getArtists(ids);

        // Then: Returns successfully
        expect(result).toHaveLength(50);
      });
    });

    // AC-059: Empty Array Handling
    describe("AC-059: Empty Array Handling", () => {
      test("should return empty array without making API call when given empty array", async () => {
        // Given: Valid adapter with authentication
        const getMock = mock(async () => []);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: { get: getMock },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtists is called with empty array
        const result = await adapter.getArtists([]);

        // Then: Returns empty array without API call
        expect(result).toBeArray();
        expect(result).toHaveLength(0);
        expect(getMock).not.toHaveBeenCalled();
      });
    });
  });

  // CH-004: searchAlbums - Extended Search
  describe("searchAlbums", () => {
    // Helper to create mock Spotify album for search
    const createMockAlbum = (overrides: Record<string, unknown> = {}) => ({
      id: "album-id",
      name: "Test Album",
      release_date: "2024-01-01",
      total_tracks: 10,
      external_urls: {
        spotify: "https://open.spotify.com/album/album-id",
      },
      artists: [
        {
          id: "artist-id",
          name: "Test Artist",
          external_urls: {
            spotify: "https://open.spotify.com/artist/artist-id",
          },
        },
      ],
      images: [
        { url: "https://i.scdn.co/image/abc123", width: 640, height: 640 },
      ],
      ...overrides,
    });

    // Helper to create mock search response
    const createMockSearchResponse = (
      total: number,
      limit: number,
      offset: number,
      items: unknown[] = [],
    ) => ({
      albums: {
        items,
        total,
        limit,
        offset,
        href: `https://api.spotify.com/v1/search?query=test&type=album&offset=${offset}&limit=${limit}`,
        next: offset + limit < total ? "next-page-url" : null,
        previous: offset > 0 ? "previous-page-url" : null,
      },
    });

    // AC-008: Search Albums
    describe("AC-008: Search Albums", () => {
      test("should return SearchResult<Album> object with items, total, limit, offset", async () => {
        // Given: Valid adapter with authentication
        const mockAlbum = createMockAlbum();
        const mockResponse = createMockSearchResponse(100, 20, 0, [mockAlbum]);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: mock(async () => mockResponse),
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchAlbums is called with query
        const result = await adapter.searchAlbums("abbey road");

        // Then: SearchResult<Album> object is returned with all required properties
        expect(result).toBeDefined();
        expect(Array.isArray(result.items)).toBe(true);
        expect(typeof result.total).toBe("number");
        expect(typeof result.limit).toBe("number");
        expect(typeof result.offset).toBe("number");
      });

      test("should return items as Album array", async () => {
        // Given: Valid adapter with authentication
        const mockAlbum1 = createMockAlbum({ id: "album1", name: "Album 1" });
        const mockAlbum2 = createMockAlbum({ id: "album2", name: "Album 2" });
        const mockResponse = createMockSearchResponse(2, 20, 0, [
          mockAlbum1,
          mockAlbum2,
        ]);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: mock(async () => mockResponse),
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchAlbums is called
        const result = await adapter.searchAlbums("test query");

        // Then: items array contains Album objects with required fields
        expect(result.items.length).toBe(2);
        expect(result.items[0].id).toBe("album1");
        expect(result.items[0].name).toBe("Album 1");
        expect(result.items[0].artists).toBeArray();
        expect(result.items[0].releaseDate).toBeDefined();
        expect(result.items[0].totalTracks).toBeDefined();
        expect(result.items[0].images).toBeArray();
      });

      test("should pass query and album type to SDK search method", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = createMockSearchResponse(0, 20, 0, []);
        const searchMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: searchMock,
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchAlbums is called
        await adapter.searchAlbums("abbey road");

        // Then: SDK search is called with album type
        expect(searchMock).toHaveBeenCalledWith(
          "abbey road",
          ["album"],
          undefined,
          20,
          0,
        );
      });

      test("should respect limit option", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = createMockSearchResponse(100, 10, 0, []);
        const searchMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: searchMock,
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchAlbums is called with limit option
        await adapter.searchAlbums("test", { limit: 10 });

        // Then: SDK search is called with specified limit
        expect(searchMock).toHaveBeenCalledWith(
          "test",
          ["album"],
          undefined,
          10,
          0,
        );
      });

      test("should respect offset option", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = createMockSearchResponse(100, 20, 40, []);
        const searchMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: searchMock,
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchAlbums is called with offset option
        await adapter.searchAlbums("test", { offset: 40 });

        // Then: SDK search is called with specified offset
        expect(searchMock).toHaveBeenCalledWith(
          "test",
          ["album"],
          undefined,
          20,
          40,
        );
      });

      test("should cap limit at 50", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = createMockSearchResponse(100, 50, 0, []);
        const searchMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: searchMock,
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchAlbums is called with limit > 50
        await adapter.searchAlbums("test", { limit: 100 });

        // Then: SDK search is called with limit capped at 50
        expect(searchMock).toHaveBeenCalledWith(
          "test",
          ["album"],
          undefined,
          50,
          0,
        );
      });
    });
  });

  // CH-005: searchArtists - Extended Search
  describe("searchArtists", () => {
    // Helper to create mock Spotify artist for search
    const createMockArtist = (overrides: Record<string, unknown> = {}) => ({
      id: "artist-id",
      name: "Test Artist",
      genres: ["rock", "pop"],
      external_urls: {
        spotify: "https://open.spotify.com/artist/artist-id",
      },
      images: [
        { url: "https://i.scdn.co/image/abc123", width: 640, height: 640 },
      ],
      ...overrides,
    });

    // Helper to create mock search response
    const createMockSearchResponse = (
      total: number,
      limit: number,
      offset: number,
      items: unknown[] = [],
    ) => ({
      artists: {
        items,
        total,
        limit,
        offset,
        href: `https://api.spotify.com/v1/search?query=test&type=artist&offset=${offset}&limit=${limit}`,
        next: offset + limit < total ? "next-page-url" : null,
        previous: offset > 0 ? "previous-page-url" : null,
      },
    });

    // AC-009: Search Artists
    describe("AC-009: Search Artists", () => {
      test("should return SearchResult<Artist> object with items, total, limit, offset", async () => {
        // Given: Valid adapter with authentication
        const mockArtist = createMockArtist();
        const mockResponse = createMockSearchResponse(100, 20, 0, [mockArtist]);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: mock(async () => mockResponse),
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchArtists is called with query
        const result = await adapter.searchArtists("queen");

        // Then: SearchResult<Artist> object is returned with all required properties
        expect(result).toBeDefined();
        expect(Array.isArray(result.items)).toBe(true);
        expect(typeof result.total).toBe("number");
        expect(typeof result.limit).toBe("number");
        expect(typeof result.offset).toBe("number");
      });

      test("should return items as Artist array", async () => {
        // Given: Valid adapter with authentication
        const mockArtist1 = createMockArtist({
          id: "artist1",
          name: "Artist 1",
        });
        const mockArtist2 = createMockArtist({
          id: "artist2",
          name: "Artist 2",
        });
        const mockResponse = createMockSearchResponse(2, 20, 0, [
          mockArtist1,
          mockArtist2,
        ]);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: mock(async () => mockResponse),
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchArtists is called
        const result = await adapter.searchArtists("test query");

        // Then: items array contains Artist objects with required fields
        expect(result.items.length).toBe(2);
        expect(result.items[0].id).toBe("artist1");
        expect(result.items[0].name).toBe("Artist 1");
        expect(result.items[0].externalUrl).toBeDefined();
      });

      test("should pass query and artist type to SDK search method", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = createMockSearchResponse(0, 20, 0, []);
        const searchMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: searchMock,
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchArtists is called
        await adapter.searchArtists("queen");

        // Then: SDK search is called with artist type
        expect(searchMock).toHaveBeenCalledWith(
          "queen",
          ["artist"],
          undefined,
          20,
          0,
        );
      });

      test("should respect limit option", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = createMockSearchResponse(100, 10, 0, []);
        const searchMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: searchMock,
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchArtists is called with limit option
        await adapter.searchArtists("test", { limit: 10 });

        // Then: SDK search is called with specified limit
        expect(searchMock).toHaveBeenCalledWith(
          "test",
          ["artist"],
          undefined,
          10,
          0,
        );
      });

      test("should respect offset option", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = createMockSearchResponse(100, 20, 40, []);
        const searchMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: searchMock,
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchArtists is called with offset option
        await adapter.searchArtists("test", { offset: 40 });

        // Then: SDK search is called with specified offset
        expect(searchMock).toHaveBeenCalledWith(
          "test",
          ["artist"],
          undefined,
          20,
          40,
        );
      });

      test("should cap limit at 50", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = createMockSearchResponse(100, 50, 0, []);
        const searchMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: searchMock,
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchArtists is called with limit > 50
        await adapter.searchArtists("test", { limit: 100 });

        // Then: SDK search is called with limit capped at 50
        expect(searchMock).toHaveBeenCalledWith(
          "test",
          ["artist"],
          undefined,
          50,
          0,
        );
      });
    });
  });

  describe("searchPlaylists", () => {
    // Helper to create mock Spotify simplified playlist for search
    const createMockPlaylist = (overrides: Record<string, unknown> = {}) => ({
      id: "playlist-id",
      name: "Test Playlist",
      description: "A test playlist",
      owner: {
        id: "owner-id",
        display_name: "Test Owner",
      },
      tracks: {
        total: 50,
      },
      images: [
        { url: "https://i.scdn.co/image/abc123", width: 300, height: 300 },
      ],
      external_urls: {
        spotify: "https://open.spotify.com/playlist/playlist-id",
      },
      ...overrides,
    });

    // Helper to create mock search response
    const createMockSearchResponse = (
      total: number,
      limit: number,
      offset: number,
      items: unknown[] = [],
    ) => ({
      playlists: {
        items,
        total,
        limit,
        offset,
        href: `https://api.spotify.com/v1/search?query=test&type=playlist&offset=${offset}&limit=${limit}`,
        next: offset + limit < total ? "next-page-url" : null,
        previous: offset > 0 ? "previous-page-url" : null,
      },
    });

    // AC-010: Search Playlists
    describe("AC-010: Search Playlists", () => {
      test("should return SearchResult<SimplifiedPlaylist> object with items, total, limit, offset", async () => {
        // Given: Valid adapter with authentication
        const mockPlaylist = createMockPlaylist();
        const mockResponse = createMockSearchResponse(100, 20, 0, [
          mockPlaylist,
        ]);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: mock(async () => mockResponse),
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchPlaylists is called with query
        const result = await adapter.searchPlaylists("workout");

        // Then: SearchResult<SimplifiedPlaylist> object is returned with all required properties
        expect(result).toBeDefined();
        expect(Array.isArray(result.items)).toBe(true);
        expect(typeof result.total).toBe("number");
        expect(typeof result.limit).toBe("number");
        expect(typeof result.offset).toBe("number");
      });

      test("should return items as SimplifiedPlaylist array with totalTracks", async () => {
        // Given: Valid adapter with authentication
        const mockPlaylist1 = createMockPlaylist({
          id: "playlist1",
          name: "Workout Mix",
          tracks: { total: 25 },
        });
        const mockPlaylist2 = createMockPlaylist({
          id: "playlist2",
          name: "Running Playlist",
          tracks: { total: 100 },
        });
        const mockResponse = createMockSearchResponse(2, 20, 0, [
          mockPlaylist1,
          mockPlaylist2,
        ]);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: mock(async () => mockResponse),
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchPlaylists is called
        const result = await adapter.searchPlaylists("workout");

        // Then: items array contains SimplifiedPlaylist objects with totalTracks
        expect(result.items.length).toBe(2);
        expect(result.items[0].id).toBe("playlist1");
        expect(result.items[0].name).toBe("Workout Mix");
        expect(result.items[0].totalTracks).toBe(25);
        expect(result.items[1].id).toBe("playlist2");
        expect(result.items[1].totalTracks).toBe(100);
        expect(result.items[0].externalUrl).toBeDefined();
      });

      test("should pass query and playlist type to SDK search method", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = createMockSearchResponse(0, 20, 0, []);
        const searchMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: searchMock,
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchPlaylists is called
        await adapter.searchPlaylists("workout");

        // Then: SDK search is called with playlist type
        expect(searchMock).toHaveBeenCalledWith(
          "workout",
          ["playlist"],
          undefined,
          20,
          0,
        );
      });

      test("should respect limit option", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = createMockSearchResponse(100, 10, 0, []);
        const searchMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: searchMock,
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchPlaylists is called with limit option
        await adapter.searchPlaylists("test", { limit: 10 });

        // Then: SDK search is called with specified limit
        expect(searchMock).toHaveBeenCalledWith(
          "test",
          ["playlist"],
          undefined,
          10,
          0,
        );
      });

      test("should respect offset option", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = createMockSearchResponse(100, 20, 40, []);
        const searchMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: searchMock,
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchPlaylists is called with offset option
        await adapter.searchPlaylists("test", { offset: 40 });

        // Then: SDK search is called with specified offset
        expect(searchMock).toHaveBeenCalledWith(
          "test",
          ["playlist"],
          undefined,
          20,
          40,
        );
      });

      test("should cap limit at 50", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = createMockSearchResponse(100, 50, 0, []);
        const searchMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              search: searchMock,
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: searchPlaylists is called with limit > 50
        await adapter.searchPlaylists("test", { limit: 100 });

        // Then: SDK search is called with limit capped at 50
        expect(searchMock).toHaveBeenCalledWith(
          "test",
          ["playlist"],
          undefined,
          50,
          0,
        );
      });
    });
  });

  describe("getArtistAlbums", () => {
    // Helper to create mock Spotify simplified album
    const createMockAlbum = (overrides: Record<string, unknown> = {}) => ({
      id: "album-id",
      name: "Test Album",
      artists: [
        {
          id: "artist-id",
          name: "Test Artist",
          external_urls: {
            spotify: "https://open.spotify.com/artist/artist-id",
          },
        },
      ],
      release_date: "2024-01-15",
      total_tracks: 12,
      images: [
        { url: "https://i.scdn.co/image/abc123", width: 640, height: 640 },
      ],
      external_urls: {
        spotify: "https://open.spotify.com/album/album-id",
      },
      ...overrides,
    });

    // Helper to create mock paginated response
    const createMockPaginatedResponse = (
      total: number,
      limit: number,
      offset: number,
      items: unknown[] = [],
    ) => ({
      items,
      total,
      limit,
      offset,
      href: `https://api.spotify.com/v1/artists/artist-id/albums?offset=${offset}&limit=${limit}`,
      next: offset + limit < total ? "next-page-url" : null,
      previous: offset > 0 ? "previous-page-url" : null,
    });

    // AC-011: Get Artist Albums
    describe("AC-011: Get Artist Albums", () => {
      test("should return PaginatedResult<Album> with items, total, limit, offset, hasNext", async () => {
        // Given: Valid adapter with authentication
        const mockAlbum = createMockAlbum();
        const mockResponse = createMockPaginatedResponse(100, 20, 0, [
          mockAlbum,
        ]);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: {
                albums: mock(async () => mockResponse),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtistAlbums is called with valid artist ID
        const result = await adapter.getArtistAlbums("artist-id");

        // Then: PaginatedResult<Album> is returned with all required properties
        expect(result).toBeDefined();
        expect(Array.isArray(result.items)).toBe(true);
        expect(typeof result.total).toBe("number");
        expect(typeof result.limit).toBe("number");
        expect(typeof result.offset).toBe("number");
        expect(typeof result.hasNext).toBe("boolean");
      });

      test("should return items as Album array", async () => {
        // Given: Valid adapter with authentication
        const mockAlbum1 = createMockAlbum({
          id: "album1",
          name: "Album 1",
        });
        const mockAlbum2 = createMockAlbum({
          id: "album2",
          name: "Album 2",
        });
        const mockResponse = createMockPaginatedResponse(2, 20, 0, [
          mockAlbum1,
          mockAlbum2,
        ]);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: {
                albums: mock(async () => mockResponse),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtistAlbums is called
        const result = await adapter.getArtistAlbums("artist-id");

        // Then: items array contains Album objects
        expect(result.items.length).toBe(2);
        expect(result.items[0].id).toBe("album1");
        expect(result.items[0].name).toBe("Album 1");
        expect(result.items[1].id).toBe("album2");
        expect(result.items[0].externalUrl).toBeDefined();
      });

      test("should set hasNext to true when more items are available", async () => {
        // Given: Total is greater than offset + items.length
        const mockAlbum = createMockAlbum();
        const mockResponse = createMockPaginatedResponse(100, 20, 0, [
          mockAlbum,
        ]);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: {
                albums: mock(async () => mockResponse),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtistAlbums is called
        const result = await adapter.getArtistAlbums("artist-id");

        // Then: hasNext is true because 0 + 1 < 100
        expect(result.hasNext).toBe(true);
      });

      test("should set hasNext to false when no more items are available", async () => {
        // Given: Total equals offset + items.length
        const mockAlbum = createMockAlbum();
        const mockResponse = createMockPaginatedResponse(1, 20, 0, [mockAlbum]);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: {
                albums: mock(async () => mockResponse),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtistAlbums is called
        const result = await adapter.getArtistAlbums("artist-id");

        // Then: hasNext is false because 0 + 1 >= 1
        expect(result.hasNext).toBe(false);
      });
    });

    // AC-012: Get Artist Albums - Pagination
    describe("AC-012: Get Artist Albums - Pagination", () => {
      test("should pass limit and offset to SDK", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = createMockPaginatedResponse(100, 10, 20, []);
        const albumsMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: {
                albums: albumsMock,
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtistAlbums is called with limit and offset
        await adapter.getArtistAlbums("artist-id", { limit: 10, offset: 20 });

        // Then: SDK is called with specified limit and offset
        expect(albumsMock).toHaveBeenCalledWith(
          "artist-id",
          undefined,
          undefined,
          10,
          20,
        );
      });

      test("should use default limit of 20 when not specified", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = createMockPaginatedResponse(100, 20, 0, []);
        const albumsMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: {
                albums: albumsMock,
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtistAlbums is called without options
        await adapter.getArtistAlbums("artist-id");

        // Then: SDK is called with default limit of 20
        expect(albumsMock).toHaveBeenCalledWith(
          "artist-id",
          undefined,
          undefined,
          20,
          0,
        );
      });

      test("should cap limit at 50", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = createMockPaginatedResponse(100, 50, 0, []);
        const albumsMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: {
                albums: albumsMock,
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtistAlbums is called with limit > 50
        await adapter.getArtistAlbums("artist-id", { limit: 100 });

        // Then: SDK is called with limit capped at 50
        expect(albumsMock).toHaveBeenCalledWith(
          "artist-id",
          undefined,
          undefined,
          50,
          0,
        );
      });
    });
  });

  describe("getArtistTopTracks", () => {
    // Helper to create mock Spotify track for top tracks
    const createMockTrack = (overrides: Record<string, unknown> = {}) => ({
      id: "track-id",
      name: "Test Track",
      artists: [
        {
          id: "artist-id",
          name: "Test Artist",
          external_urls: {
            spotify: "https://open.spotify.com/artist/artist-id",
          },
        },
      ],
      album: {
        id: "album-id",
        name: "Test Album",
        artists: [
          {
            id: "artist-id",
            name: "Test Artist",
            external_urls: {
              spotify: "https://open.spotify.com/artist/artist-id",
            },
          },
        ],
        release_date: "2024-01-15",
        total_tracks: 12,
        images: [
          { url: "https://i.scdn.co/image/abc123", width: 640, height: 640 },
        ],
        external_urls: {
          spotify: "https://open.spotify.com/album/album-id",
        },
      },
      duration_ms: 210000,
      preview_url: "https://p.scdn.co/mp3-preview/abc123",
      external_urls: {
        spotify: "https://open.spotify.com/track/track-id",
      },
      ...overrides,
    });

    // AC-013: Get Artist Top Tracks
    describe("AC-013: Get Artist Top Tracks", () => {
      test("should return array of Track objects", async () => {
        // Given: Valid adapter with authentication
        const mockTrack1 = createMockTrack({
          id: "track1",
          name: "Top Track 1",
        });
        const mockTrack2 = createMockTrack({
          id: "track2",
          name: "Top Track 2",
        });
        const mockResponse = { tracks: [mockTrack1, mockTrack2] };

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: {
                topTracks: mock(async () => mockResponse),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtistTopTracks is called
        const result = await adapter.getArtistTopTracks("artist-id", "US");

        // Then: Array of Track objects is returned
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(result[0].id).toBe("track1");
        expect(result[0].name).toBe("Top Track 1");
        expect(result[1].id).toBe("track2");
      });

      test("should pass artistId and market to SDK", async () => {
        // Given: Valid adapter with authentication
        const mockResponse = { tracks: [] };
        const topTracksMock = mock(async () => mockResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: {
                topTracks: topTracksMock,
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtistTopTracks is called with market
        await adapter.getArtistTopTracks("artist-id", "JP");

        // Then: SDK is called with artistId and market
        expect(topTracksMock).toHaveBeenCalledWith("artist-id", "JP");
      });

      test("should return up to 10 tracks", async () => {
        // Given: Valid adapter with authentication and 10 tracks
        const mockTracks = Array.from({ length: 10 }, (_, i) =>
          createMockTrack({ id: `track${i}`, name: `Track ${i}` }),
        );
        const mockResponse = { tracks: mockTracks };

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: {
                topTracks: mock(async () => mockResponse),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtistTopTracks is called
        const result = await adapter.getArtistTopTracks("artist-id", "US");

        // Then: Up to 10 tracks are returned
        expect(result.length).toBe(10);
      });

      test("should transform tracks to musix.js Track type", async () => {
        // Given: Valid adapter with authentication
        const mockTrack = createMockTrack({
          id: "track-123",
          name: "Popular Song",
          duration_ms: 180000,
          preview_url: "https://preview.url",
        });
        const mockResponse = { tracks: [mockTrack] };

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              artists: {
                topTracks: mock(async () => mockResponse),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getArtistTopTracks is called
        const result = await adapter.getArtistTopTracks("artist-id", "US");

        // Then: Track has all required musix.js properties
        expect(result[0].id).toBe("track-123");
        expect(result[0].name).toBe("Popular Song");
        expect(result[0].durationMs).toBe(180000);
        expect(result[0].previewUrl).toBe("https://preview.url");
        expect(result[0].externalUrl).toBeDefined();
        expect(result[0].artists).toBeDefined();
        expect(result[0].album).toBeDefined();
      });
    });
  });

  describe("getAlbumTracks", () => {
    // Helper to create mock Spotify simplified track for album tracks
    const createMockSimplifiedTrack = (
      overrides: Record<string, unknown> = {},
    ) => ({
      id: "track-id",
      name: "Test Track",
      artists: [
        {
          id: "artist-id",
          name: "Test Artist",
          external_urls: {
            spotify: "https://open.spotify.com/artist/artist-id",
          },
        },
      ],
      duration_ms: 210000,
      preview_url: "https://p.scdn.co/mp3-preview/abc123",
      external_urls: {
        spotify: "https://open.spotify.com/track/track-id",
      },
      track_number: 1,
      disc_number: 1,
      ...overrides,
    });

    // Helper to create mock Spotify album
    const createMockAlbum = () => ({
      id: "album-id",
      name: "Test Album",
      artists: [
        {
          id: "artist-id",
          name: "Test Artist",
          external_urls: {
            spotify: "https://open.spotify.com/artist/artist-id",
          },
        },
      ],
      release_date: "2024-01-15",
      total_tracks: 12,
      images: [
        { url: "https://i.scdn.co/image/abc123", width: 640, height: 640 },
      ],
      external_urls: {
        spotify: "https://open.spotify.com/album/album-id",
      },
    });

    // Helper to create mock paginated response
    const createMockPaginatedResponse = (
      total: number,
      limit: number,
      offset: number,
      items: unknown[] = [],
    ) => ({
      items,
      total,
      limit,
      offset,
      href: `https://api.spotify.com/v1/albums/album-id/tracks?offset=${offset}&limit=${limit}`,
      next: offset + limit < total ? "next-page-url" : null,
      previous: offset > 0 ? "previous-page-url" : null,
    });

    // AC-014: Get Album Tracks
    describe("AC-014: Get Album Tracks", () => {
      test("should return PaginatedResult<Track> with items, total, limit, offset, hasNext", async () => {
        // Given: Valid adapter with authentication
        const mockTrack = createMockSimplifiedTrack();
        const mockTracksResponse = createMockPaginatedResponse(20, 20, 0, [
          mockTrack,
        ]);
        const mockAlbum = createMockAlbum();

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              albums: {
                get: mock(async () => mockAlbum),
                tracks: mock(async () => mockTracksResponse),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getAlbumTracks is called with valid album ID
        const result = await adapter.getAlbumTracks("album-id");

        // Then: PaginatedResult<Track> is returned with all required properties
        expect(result).toBeDefined();
        expect(Array.isArray(result.items)).toBe(true);
        expect(typeof result.total).toBe("number");
        expect(typeof result.limit).toBe("number");
        expect(typeof result.offset).toBe("number");
        expect(typeof result.hasNext).toBe("boolean");
      });

      test("should return items as Track array", async () => {
        // Given: Valid adapter with authentication
        const mockTrack1 = createMockSimplifiedTrack({
          id: "track1",
          name: "Track 1",
        });
        const mockTrack2 = createMockSimplifiedTrack({
          id: "track2",
          name: "Track 2",
        });
        const mockTracksResponse = createMockPaginatedResponse(2, 20, 0, [
          mockTrack1,
          mockTrack2,
        ]);
        const mockAlbum = createMockAlbum();

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              albums: {
                get: mock(async () => mockAlbum),
                tracks: mock(async () => mockTracksResponse),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getAlbumTracks is called
        const result = await adapter.getAlbumTracks("album-id");

        // Then: items array contains Track objects
        expect(result.items.length).toBe(2);
        expect(result.items[0].id).toBe("track1");
        expect(result.items[0].name).toBe("Track 1");
        expect(result.items[1].id).toBe("track2");
        expect(result.items[0].externalUrl).toBeDefined();
      });

      test("should set hasNext to true when more items are available", async () => {
        // Given: Total is greater than offset + items.length
        const mockTrack = createMockSimplifiedTrack();
        const mockTracksResponse = createMockPaginatedResponse(50, 20, 0, [
          mockTrack,
        ]);
        const mockAlbum = createMockAlbum();

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              albums: {
                get: mock(async () => mockAlbum),
                tracks: mock(async () => mockTracksResponse),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getAlbumTracks is called
        const result = await adapter.getAlbumTracks("album-id");

        // Then: hasNext is true because 0 + 1 < 50
        expect(result.hasNext).toBe(true);
      });

      test("should set hasNext to false when no more items are available", async () => {
        // Given: Total equals offset + items.length
        const mockTrack = createMockSimplifiedTrack();
        const mockTracksResponse = createMockPaginatedResponse(1, 20, 0, [
          mockTrack,
        ]);
        const mockAlbum = createMockAlbum();

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              albums: {
                get: mock(async () => mockAlbum),
                tracks: mock(async () => mockTracksResponse),
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getAlbumTracks is called
        const result = await adapter.getAlbumTracks("album-id");

        // Then: hasNext is false because 0 + 1 >= 1
        expect(result.hasNext).toBe(false);
      });
    });

    // Pagination tests
    describe("Pagination", () => {
      test("should pass limit and offset to SDK", async () => {
        // Given: Valid adapter with authentication
        const mockTracksResponse = createMockPaginatedResponse(100, 10, 20, []);
        const mockAlbum = createMockAlbum();
        const tracksMock = mock(async () => mockTracksResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              albums: {
                get: mock(async () => mockAlbum),
                tracks: tracksMock,
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getAlbumTracks is called with limit and offset
        await adapter.getAlbumTracks("album-id", { limit: 10, offset: 20 });

        // Then: SDK is called with album ID, limit, and offset
        expect(tracksMock).toHaveBeenCalledWith("album-id", undefined, 10, 20);
      });

      test("should use default limit of 20 when not specified", async () => {
        // Given: Valid adapter with authentication
        const mockTracksResponse = createMockPaginatedResponse(100, 20, 0, []);
        const mockAlbum = createMockAlbum();
        const tracksMock = mock(async () => mockTracksResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              albums: {
                get: mock(async () => mockAlbum),
                tracks: tracksMock,
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getAlbumTracks is called without options
        await adapter.getAlbumTracks("album-id");

        // Then: SDK is called with default limit of 20
        expect(tracksMock).toHaveBeenCalledWith("album-id", undefined, 20, 0);
      });

      test("should cap limit at 50", async () => {
        // Given: Valid adapter with authentication
        const mockTracksResponse = createMockPaginatedResponse(100, 50, 0, []);
        const mockAlbum = createMockAlbum();
        const tracksMock = mock(async () => mockTracksResponse);

        SpotifyApi.withClientCredentials = mock(
          () =>
            ({
              albums: {
                get: mock(async () => mockAlbum),
                tracks: tracksMock,
              },
              logOut: mock(() => {}),
            }) as unknown as ReturnType<
              typeof SpotifyApi.withClientCredentials
            >,
        );

        const adapter = createSpotifyAdapter({
          clientId: "test-id",
          clientSecret: "test-secret",
        });

        // When: getAlbumTracks is called with limit > 50
        await adapter.getAlbumTracks("album-id", { limit: 100 });

        // Then: SDK is called with limit capped at 50
        expect(tracksMock).toHaveBeenCalledWith("album-id", undefined, 50, 0);
      });
    });
  });
});

describe("createSpotifyUserAdapter", () => {
  describe("AC-015: Create User Adapter", () => {
    test("should return SpotifyUserAdapter instance with all required methods", async () => {
      // Given: Valid client ID and redirect URI
      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            email: "test@example.com",
            images: [],
            product: "premium",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");

      // When: createSpotifyUserAdapter is called
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-read-private", "user-read-email"],
      });

      // Then: SpotifyUserAdapter instance is returned
      expect(adapter).toBeDefined();
      expect(typeof adapter.getCurrentUser).toBe("function");
      // Also has base SpotifyAdapter methods
      expect(typeof adapter.getTrack).toBe("function");
      expect(typeof adapter.searchTracks).toBe("function");
    });

    test("should pass correct config to SDK withUserAuthorization", async () => {
      // Given: Valid config
      const withUserAuthMock = mock(
        () =>
          ({
            currentUser: { profile: mock(async () => ({})) },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withUserAuthorization>,
      );

      SpotifyApi.withUserAuthorization = withUserAuthMock;

      const { createSpotifyUserAdapter } = await import("./index");

      // When: createSpotifyUserAdapter is called with config
      createSpotifyUserAdapter({
        clientId: "my-client-id",
        redirectUri: "https://myapp.com/callback",
        scopes: ["user-read-private", "user-read-email", "user-library-read"],
      });

      // Then: SDK is called with correct parameters
      expect(withUserAuthMock).toHaveBeenCalledWith(
        "my-client-id",
        "https://myapp.com/callback",
        ["user-read-private", "user-read-email", "user-library-read"],
        expect.any(Object),
      );
    });
  });

  describe("AC-016: Get Current User", () => {
    test("should return CurrentUser with id, displayName, product", async () => {
      // Given: User is authenticated
      const mockProfile = {
        id: "user-123",
        display_name: "Test User",
        email: "test@example.com",
        images: [
          { url: "https://i.scdn.co/image/abc123", width: 300, height: 300 },
        ],
        product: "premium",
        external_urls: { spotify: "https://open.spotify.com/user/user-123" },
      };

      const mockSdk = {
        currentUser: {
          profile: mock(async () => mockProfile),
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-read-private"],
      });

      // When: getCurrentUser is called
      const user = await adapter.getCurrentUser();

      // Then: Returns CurrentUser with all fields
      expect(user.id).toBe("user-123");
      expect(user.displayName).toBe("Test User");
      expect(user.email).toBe("test@example.com");
      expect(user.product).toBe("premium");
      expect(user.externalUrl).toBe("https://open.spotify.com/user/user-123");
      expect(user.images).toHaveLength(1);
      expect(user.images?.[0].url).toBe("https://i.scdn.co/image/abc123");
    });

    test("should handle user without email (scope not granted)", async () => {
      // Given: User authenticated without email scope
      const mockProfile = {
        id: "user-456",
        display_name: "Another User",
        // email is undefined when scope not granted
        images: [],
        product: "free",
        external_urls: { spotify: "https://open.spotify.com/user/user-456" },
      };

      const mockSdk = {
        currentUser: {
          profile: mock(async () => mockProfile),
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-read-private"],
      });

      // When: getCurrentUser is called
      const user = await adapter.getCurrentUser();

      // Then: Returns CurrentUser without email
      expect(user.id).toBe("user-456");
      expect(user.displayName).toBe("Another User");
      expect(user.email).toBeUndefined();
      expect(user.product).toBe("free");
    });

    test("should handle null display_name gracefully", async () => {
      // Given: User with null display_name (rare but possible)
      const mockProfile = {
        id: "user-789",
        display_name: null,
        images: [],
        product: "premium",
        external_urls: { spotify: "https://open.spotify.com/user/user-789" },
      };

      const mockSdk = {
        currentUser: {
          profile: mock(async () => mockProfile),
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-read-private"],
      });

      // When: getCurrentUser is called
      const user = await adapter.getCurrentUser();

      // Then: Returns CurrentUser with empty displayName
      expect(user.id).toBe("user-789");
      expect(user.displayName).toBe("");
    });
  });

  describe("AC-017: Play Track [CH-012]", () => {
    test("should start playback on active device with trackIds", async () => {
      // Given: User is authenticated with Premium
      const startPlaybackMock = mock(async () => {});

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          startResumePlayback: startPlaybackMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: play is called with trackIds
      await adapter.play({ trackIds: ["track-id-1", "track-id-2"] });

      // Then: SDK startResumePlayback is called with track URIs
      expect(startPlaybackMock).toHaveBeenCalledWith(
        "", // deviceId (empty string when not specified, SDK requires string type)
        undefined, // context_uri
        ["spotify:track:track-id-1", "spotify:track:track-id-2"], // uris
        undefined, // offset
        undefined, // position_ms
      );
    });

    test("should start playback with contextUri (album/playlist)", async () => {
      // Given: User is authenticated with Premium
      const startPlaybackMock = mock(async () => {});

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          startResumePlayback: startPlaybackMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: play is called with contextUri
      await adapter.play({ contextUri: "spotify:album:album-id-123" });

      // Then: SDK startResumePlayback is called with context URI
      expect(startPlaybackMock).toHaveBeenCalledWith(
        "", // deviceId (empty string when not specified, SDK requires string type)
        "spotify:album:album-id-123", // context_uri
        undefined, // uris
        undefined, // offset
        undefined, // position_ms
      );
    });

    test("should start playback with deviceId", async () => {
      // Given: User is authenticated with Premium
      const startPlaybackMock = mock(async () => {});

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          startResumePlayback: startPlaybackMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: play is called with deviceId
      await adapter.play({ deviceId: "device-123", trackIds: ["track-id"] });

      // Then: SDK startResumePlayback is called with deviceId
      expect(startPlaybackMock).toHaveBeenCalledWith(
        "device-123", // deviceId
        undefined, // context_uri
        ["spotify:track:track-id"], // uris
        undefined, // offset
        undefined, // position_ms
      );
    });

    test("should start playback with offsetIndex and positionMs", async () => {
      // Given: User is authenticated with Premium
      const startPlaybackMock = mock(async () => {});

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          startResumePlayback: startPlaybackMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: play is called with offsetIndex and positionMs
      await adapter.play({
        contextUri: "spotify:album:album-id",
        offsetIndex: 5,
        positionMs: 30000,
      });

      // Then: SDK startResumePlayback is called with offset and position
      expect(startPlaybackMock).toHaveBeenCalledWith(
        "", // deviceId (empty string when not specified, SDK requires string type)
        "spotify:album:album-id", // context_uri
        undefined, // uris
        { position: 5 }, // offset
        30000, // position_ms
      );
    });

    test("should resume playback when called without options", async () => {
      // Given: User is authenticated with Premium
      const startPlaybackMock = mock(async () => {});

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          startResumePlayback: startPlaybackMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: play is called without options (resume)
      await adapter.play();

      // Then: SDK startResumePlayback is called without params (resume)
      expect(startPlaybackMock).toHaveBeenCalledWith(
        "", // deviceId (empty string, SDK requires string type)
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });
  });

  describe("AC-018: Play - No Premium [CH-012]", () => {
    test("should throw PremiumRequiredError when user has no Premium", async () => {
      // Given: User is authenticated without Premium (403 Forbidden)
      const error = new Error("Forbidden") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 403;
      error.headers = {};

      const startPlaybackMock = mock(async () => {
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          startResumePlayback: startPlaybackMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: play is called
      // Then: PremiumRequiredError is thrown
      await expect(adapter.play()).rejects.toThrow(PremiumRequiredError);
    });

    test("PremiumRequiredError should have correct message", async () => {
      // Given: User is authenticated without Premium (403 Forbidden)
      const error = new Error("Forbidden") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 403;
      error.headers = {};

      const startPlaybackMock = mock(async () => {
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          startResumePlayback: startPlaybackMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: play is called
      // Then: Error message mentions Premium
      try {
        await adapter.play();
        throw new Error("Expected PremiumRequiredError");
      } catch (err) {
        expect(err).toBeInstanceOf(PremiumRequiredError);
        expect((err as Error).message).toContain("Premium");
      }
    });
  });

  describe("AC-019: Play - No Active Device [CH-012]", () => {
    test("should throw NoActiveDeviceError when no device is active", async () => {
      // Given: User has Premium but no active device (404 with specific message)
      const error = new Error("No active device found") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 404;
      error.headers = {};

      const startPlaybackMock = mock(async () => {
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          startResumePlayback: startPlaybackMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: play is called without deviceId
      // Then: NoActiveDeviceError is thrown
      await expect(adapter.play()).rejects.toThrow(NoActiveDeviceError);
    });

    test("NoActiveDeviceError should have correct message", async () => {
      // Given: User has Premium but no active device
      const error = new Error("No active device found") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 404;
      error.headers = {};

      const startPlaybackMock = mock(async () => {
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          startResumePlayback: startPlaybackMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: play is called
      // Then: Error message mentions device
      try {
        await adapter.play();
        throw new Error("Expected NoActiveDeviceError");
      } catch (err) {
        expect(err).toBeInstanceOf(NoActiveDeviceError);
        expect((err as Error).message).toContain("device");
      }
    });
  });

  describe("PlayOptions Validation [CH-012]", () => {
    test("should throw ValidationError when both trackIds and contextUri are provided", async () => {
      // Given: User is authenticated with Premium
      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          startResumePlayback: mock(async () => {}),
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: play is called with both trackIds and contextUri
      // Then: ValidationError is thrown
      await expect(
        adapter.play({
          trackIds: ["track-id-1"],
          contextUri: "spotify:album:album-id",
        }),
      ).rejects.toThrow(ValidationError);
    });

    test("ValidationError message should explain the conflict", async () => {
      // Given: User is authenticated with Premium
      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          startResumePlayback: mock(async () => {}),
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: play is called with both trackIds and contextUri
      // Then: Error message explains the conflict
      try {
        await adapter.play({
          trackIds: ["track-id-1"],
          contextUri: "spotify:album:album-id",
        });
        throw new Error("Expected ValidationError");
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationError);
        expect((err as Error).message).toContain("trackIds");
        expect((err as Error).message).toContain("contextUri");
      }
    });
  });

  describe("AC-020: Pause [CH-013]", () => {
    test("should pause playback on active device", async () => {
      // Given: User is authenticated with Premium, playback is active
      const pausePlaybackMock = mock(async () => {});

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          pausePlayback: pausePlaybackMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: pause is called
      await adapter.pause();

      // Then: SDK pausePlayback is called
      expect(pausePlaybackMock).toHaveBeenCalledWith("");
    });

    test("should throw PremiumRequiredError when user has no Premium", async () => {
      // Given: User is authenticated without Premium (403 Forbidden)
      const error = new Error("Forbidden") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 403;
      error.headers = {};

      const pausePlaybackMock = mock(async () => {
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          pausePlayback: pausePlaybackMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: pause is called
      // Then: PremiumRequiredError is thrown
      await expect(adapter.pause()).rejects.toThrow(PremiumRequiredError);
    });

    test("should throw NoActiveDeviceError when no device is active", async () => {
      // Given: User has Premium but no active device (404)
      const error = new Error("No active device found") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 404;
      error.headers = {};

      const pausePlaybackMock = mock(async () => {
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          pausePlayback: pausePlaybackMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: pause is called
      // Then: NoActiveDeviceError is thrown
      await expect(adapter.pause()).rejects.toThrow(NoActiveDeviceError);
    });
  });

  describe("AC-021: Skip to Next [CH-014]", () => {
    test("should skip to next track on active device", async () => {
      // Given: User is authenticated with Premium, playback is active
      const skipToNextMock = mock(async () => {});

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          skipToNext: skipToNextMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: skipToNext is called
      await adapter.skipToNext();

      // Then: SDK skipToNext is called
      expect(skipToNextMock).toHaveBeenCalledWith("");
    });

    test("should throw PremiumRequiredError when user has no Premium", async () => {
      // Given: User is authenticated without Premium (403 Forbidden)
      const error = new Error("Forbidden") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 403;
      error.headers = {};

      const skipToNextMock = mock(async () => {
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          skipToNext: skipToNextMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: skipToNext is called
      // Then: PremiumRequiredError is thrown
      await expect(adapter.skipToNext()).rejects.toThrow(PremiumRequiredError);
    });

    test("should throw NoActiveDeviceError when no device is active", async () => {
      // Given: User has Premium but no active device (404)
      const error = new Error("No active device found") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 404;
      error.headers = {};

      const skipToNextMock = mock(async () => {
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          skipToNext: skipToNextMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: skipToNext is called
      // Then: NoActiveDeviceError is thrown
      await expect(adapter.skipToNext()).rejects.toThrow(NoActiveDeviceError);
    });
  });

  describe("AC-022: Skip to Previous [CH-015]", () => {
    test("should skip to previous track on active device", async () => {
      // Given: User is authenticated with Premium, playback is active
      const skipToPreviousMock = mock(async () => {});

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          skipToPrevious: skipToPreviousMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: skipToPrevious is called
      await adapter.skipToPrevious();

      // Then: SDK skipToPrevious is called
      expect(skipToPreviousMock).toHaveBeenCalledWith("");
    });

    test("should throw PremiumRequiredError when user has no Premium", async () => {
      // Given: User is authenticated without Premium (403 Forbidden)
      const error = new Error("Forbidden") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 403;
      error.headers = {};

      const skipToPreviousMock = mock(async () => {
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          skipToPrevious: skipToPreviousMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: skipToPrevious is called
      // Then: PremiumRequiredError is thrown
      await expect(adapter.skipToPrevious()).rejects.toThrow(
        PremiumRequiredError,
      );
    });

    test("should throw NoActiveDeviceError when no device is active", async () => {
      // Given: User has Premium but no active device (404)
      const error = new Error("No active device found") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 404;
      error.headers = {};

      const skipToPreviousMock = mock(async () => {
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          skipToPrevious: skipToPreviousMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: skipToPrevious is called
      // Then: NoActiveDeviceError is thrown
      await expect(adapter.skipToPrevious()).rejects.toThrow(
        NoActiveDeviceError,
      );
    });
  });

  describe("AC-023: Seek [CH-016]", () => {
    test("should seek to specified position on active device", async () => {
      // Given: User is authenticated with Premium, playback is active
      const seekToPositionMock = mock(async () => {});

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          seekToPosition: seekToPositionMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: seek(60000) is called (1 minute)
      await adapter.seek(60000);

      // Then: SDK seekToPosition is called with positionMs and empty deviceId
      expect(seekToPositionMock).toHaveBeenCalledWith(60000, "");
    });

    test("should throw PremiumRequiredError when user has no Premium", async () => {
      // Given: User is authenticated without Premium (403 Forbidden)
      const error = new Error("Forbidden") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 403;
      error.headers = {};

      const seekToPositionMock = mock(async () => {
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          seekToPosition: seekToPositionMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: seek is called
      // Then: PremiumRequiredError is thrown
      await expect(adapter.seek(60000)).rejects.toThrow(PremiumRequiredError);
    });

    test("should throw NoActiveDeviceError when no device is active", async () => {
      // Given: User has Premium but no active device (404)
      const error = new Error("No active device found") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 404;
      error.headers = {};

      const seekToPositionMock = mock(async () => {
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          seekToPosition: seekToPositionMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-modify-playback-state"],
      });

      // When: seek is called
      // Then: NoActiveDeviceError is thrown
      await expect(adapter.seek(60000)).rejects.toThrow(NoActiveDeviceError);
    });
  });

  describe("AC-024: Get Playback State [CH-017]", () => {
    test("should return PlaybackState with all fields when playback is active", async () => {
      // Given: User is authenticated with active playback
      const mockPlaybackState = {
        is_playing: true,
        progress_ms: 45000,
        item: {
          id: "4iV5W9uYEdYUVa79Axb7Rh",
          name: "Hotel California",
          duration_ms: 391376,
          preview_url: "https://p.scdn.co/mp3-preview/abc123",
          external_urls: {
            spotify: "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh",
          },
          artists: [
            {
              id: "0ECwFtbIWEVNwjlrfc6xoL",
              name: "Eagles",
              external_urls: {
                spotify:
                  "https://open.spotify.com/artist/0ECwFtbIWEVNwjlrfc6xoL",
              },
            },
          ],
          album: {
            id: "2widuo17g5CEC66IbzveRu",
            name: "Hotel California",
            release_date: "1976-12-08",
            total_tracks: 9,
            images: [
              {
                url: "https://i.scdn.co/image/abc123",
                width: 640,
                height: 640,
              },
            ],
            external_urls: {
              spotify: "https://open.spotify.com/album/2widuo17g5CEC66IbzveRu",
            },
            artists: [
              {
                id: "0ECwFtbIWEVNwjlrfc6xoL",
                name: "Eagles",
                external_urls: {
                  spotify:
                    "https://open.spotify.com/artist/0ECwFtbIWEVNwjlrfc6xoL",
                },
              },
            ],
          },
        },
        device: {
          id: "device-123",
          name: "My Laptop",
          type: "Computer",
          is_active: true,
          volume_percent: 75,
        },
        shuffle_state: false,
        repeat_state: "off",
      };

      const getPlaybackStateMock = mock(async () => mockPlaybackState);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          getPlaybackState: getPlaybackStateMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-read-playback-state"],
      });

      // When: getPlaybackState() is called
      const result = await adapter.getPlaybackState();

      // Then: Returns PlaybackState with all fields populated
      expect(result).not.toBeNull();
      expect(result?.isPlaying).toBe(true);
      expect(result?.track).not.toBeNull();
      expect(result?.track?.id).toBe("4iV5W9uYEdYUVa79Axb7Rh");
      expect(result?.track?.name).toBe("Hotel California");
      expect(result?.progressMs).toBe(45000);
      expect(result?.durationMs).toBe(391376);
      expect(result?.device.id).toBe("device-123");
      expect(result?.device.name).toBe("My Laptop");
      expect(result?.device.type).toBe("Computer");
      expect(result?.device.isActive).toBe(true);
      expect(result?.device.volumePercent).toBe(75);
      expect(result?.shuffleState).toBe(false);
      expect(result?.repeatState).toBe("off");
      expect(getPlaybackStateMock).toHaveBeenCalled();
    });

    test("should return null when no active playback", async () => {
      // Given: User is authenticated but no playback is active
      const getPlaybackStateMock = mock(async () => null);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          getPlaybackState: getPlaybackStateMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-read-playback-state"],
      });

      // When: getPlaybackState() is called
      const result = await adapter.getPlaybackState();

      // Then: Returns null
      expect(result).toBeNull();
      expect(getPlaybackStateMock).toHaveBeenCalled();
    });

    test("should handle different repeat states correctly", async () => {
      // Given: User is authenticated with repeat state "track"
      const mockPlaybackState = {
        is_playing: true,
        progress_ms: 45000,
        item: {
          id: "4iV5W9uYEdYUVa79Axb7Rh",
          name: "Hotel California",
          duration_ms: 391376,
          preview_url: "https://p.scdn.co/mp3-preview/abc123",
          external_urls: {
            spotify: "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh",
          },
          artists: [
            {
              id: "0ECwFtbIWEVNwjlrfc6xoL",
              name: "Eagles",
              external_urls: {
                spotify:
                  "https://open.spotify.com/artist/0ECwFtbIWEVNwjlrfc6xoL",
              },
            },
          ],
          album: {
            id: "2widuo17g5CEC66IbzveRu",
            name: "Hotel California",
            release_date: "1976-12-08",
            total_tracks: 9,
            images: [
              {
                url: "https://i.scdn.co/image/abc123",
                width: 640,
                height: 640,
              },
            ],
            external_urls: {
              spotify: "https://open.spotify.com/album/2widuo17g5CEC66IbzveRu",
            },
            artists: [
              {
                id: "0ECwFtbIWEVNwjlrfc6xoL",
                name: "Eagles",
                external_urls: {
                  spotify:
                    "https://open.spotify.com/artist/0ECwFtbIWEVNwjlrfc6xoL",
                },
              },
            ],
          },
        },
        device: {
          id: "device-123",
          name: "My Laptop",
          type: "Computer",
          is_active: true,
          volume_percent: 75,
        },
        shuffle_state: true,
        repeat_state: "track",
      };

      const getPlaybackStateMock = mock(async () => mockPlaybackState);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          getPlaybackState: getPlaybackStateMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-read-playback-state"],
      });

      // When: getPlaybackState() is called
      const result = await adapter.getPlaybackState();

      // Then: Returns PlaybackState with correct repeat and shuffle states
      expect(result).not.toBeNull();
      expect(result?.shuffleState).toBe(true);
      expect(result?.repeatState).toBe("track");
    });
  });

  describe("AC-025: Get Available Devices [CH-018]", () => {
    test("should return array of Device objects with correct properties", async () => {
      // Given: User is authenticated and has multiple devices
      const mockDevices = {
        devices: [
          {
            id: "device-123",
            name: "My Laptop",
            type: "Computer",
            is_active: true,
            volume_percent: 75,
          },
          {
            id: "device-456",
            name: "iPhone",
            type: "Smartphone",
            is_active: false,
            volume_percent: 50,
          },
          {
            id: "device-789",
            name: "Living Room Speaker",
            type: "Speaker",
            is_active: false,
            volume_percent: 100,
          },
        ],
      };

      const getAvailableDevicesMock = mock(async () => mockDevices);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          getAvailableDevices: getAvailableDevicesMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-read-playback-state"],
      });

      // When: getAvailableDevices() is called
      const result = await adapter.getAvailableDevices();

      // Then: Returns array of Device objects with correct properties
      expect(result).toBeArray();
      expect(result).toHaveLength(3);

      // Verify first device (active)
      expect(result[0].id).toBe("device-123");
      expect(result[0].name).toBe("My Laptop");
      expect(result[0].type).toBe("Computer");
      expect(result[0].isActive).toBe(true);
      expect(result[0].volumePercent).toBe(75);

      // Verify second device (inactive)
      expect(result[1].id).toBe("device-456");
      expect(result[1].name).toBe("iPhone");
      expect(result[1].type).toBe("Smartphone");
      expect(result[1].isActive).toBe(false);
      expect(result[1].volumePercent).toBe(50);

      // Verify third device (speaker)
      expect(result[2].id).toBe("device-789");
      expect(result[2].name).toBe("Living Room Speaker");
      expect(result[2].type).toBe("Speaker");
      expect(result[2].isActive).toBe(false);
      expect(result[2].volumePercent).toBe(100);

      expect(getAvailableDevicesMock).toHaveBeenCalled();
    });

    test("should return empty array when no devices are available", async () => {
      // Given: User is authenticated but has no devices
      const mockDevices = {
        devices: [],
      };

      const getAvailableDevicesMock = mock(async () => mockDevices);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          getAvailableDevices: getAvailableDevicesMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-read-playback-state"],
      });

      // When: getAvailableDevices() is called
      const result = await adapter.getAvailableDevices();

      // Then: Returns empty array
      expect(result).toBeArray();
      expect(result).toHaveLength(0);
      expect(getAvailableDevicesMock).toHaveBeenCalled();
    });

    test("should correctly map device properties from Spotify API response", async () => {
      // Given: User is authenticated with a device that has specific property values
      const mockDevices = {
        devices: [
          {
            id: "unique-device-id-abc123",
            name: "Custom Device Name",
            type: "CastAudio", // Different device type
            is_active: true,
            volume_percent: 33,
          },
        ],
      };

      const getAvailableDevicesMock = mock(async () => mockDevices);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
        },
        player: {
          getAvailableDevices: getAvailableDevicesMock,
        },
        logOut: mock(() => {}),
      };

      SpotifyApi.withUserAuthorization = mock(
        () =>
          mockSdk as unknown as ReturnType<
            typeof SpotifyApi.withUserAuthorization
          >,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["user-read-playback-state"],
      });

      // When: getAvailableDevices() is called
      const result = await adapter.getAvailableDevices();

      // Then: Device properties are correctly mapped
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("unique-device-id-abc123");
      expect(result[0].name).toBe("Custom Device Name");
      expect(result[0].type).toBe("CastAudio");
      expect(result[0].isActive).toBe(true);
      expect(result[0].volumePercent).toBe(33);
      expect(getAvailableDevicesMock).toHaveBeenCalled();
    });
  });
});
