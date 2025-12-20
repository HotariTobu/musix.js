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

  describe("AC-026: Transfer Playback [CH-019]", () => {
    test("should transfer playback to specified device", async () => {
      // Given: User is authenticated with Premium
      const transferPlaybackMock = mock(async () => {});

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
          transferPlayback: transferPlaybackMock,
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

      // When: transferPlayback(deviceId) is called
      await adapter.transferPlayback("device-123");

      // Then: SDK transferPlayback is called with device IDs array
      expect(transferPlaybackMock).toHaveBeenCalledWith(["device-123"], false);
    });

    test("should transfer playback with play option set to true", async () => {
      // Given: User is authenticated with Premium
      const transferPlaybackMock = mock(async () => {});

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
          transferPlayback: transferPlaybackMock,
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

      // When: transferPlayback(deviceId, true) is called
      await adapter.transferPlayback("device-456", true);

      // Then: SDK transferPlayback is called with play option true
      expect(transferPlaybackMock).toHaveBeenCalledWith(["device-456"], true);
    });

    test("should transfer playback with play option set to false", async () => {
      // Given: User is authenticated with Premium
      const transferPlaybackMock = mock(async () => {});

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
          transferPlayback: transferPlaybackMock,
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

      // When: transferPlayback(deviceId, false) is called
      await adapter.transferPlayback("device-789", false);

      // Then: SDK transferPlayback is called with play option false
      expect(transferPlaybackMock).toHaveBeenCalledWith(["device-789"], false);
    });

    test("should throw PremiumRequiredError when user has no Premium", async () => {
      // Given: User is authenticated without Premium (403 Forbidden)
      const error = new Error("Forbidden") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 403;
      error.headers = {};

      const transferPlaybackMock = mock(async () => {
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
          transferPlayback: transferPlaybackMock,
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

      // When: transferPlayback is called
      // Then: PremiumRequiredError is thrown
      await expect(adapter.transferPlayback("device-123")).rejects.toThrow(
        PremiumRequiredError,
      );
    });

    test("should throw NoActiveDeviceError when device not found", async () => {
      // Given: User is authenticated but device does not exist (404 Not Found)
      const error = new Error("No active device found") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 404;
      error.headers = {};

      const transferPlaybackMock = mock(async () => {
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
          transferPlayback: transferPlaybackMock,
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

      // When: transferPlayback is called
      // Then: NoActiveDeviceError is thrown
      await expect(
        adapter.transferPlayback("non-existent-device"),
      ).rejects.toThrow(NoActiveDeviceError);
    });
  });

  describe("AC-027: Get Saved Tracks [CH-020]", () => {
    test("should return PaginatedResult<Track> with user's saved tracks", async () => {
      // Given: User is authenticated and has saved tracks
      const mockSavedTracks = {
        items: [
          {
            added_at: "2024-01-15T10:00:00Z",
            track: {
              id: "track-001",
              name: "Bohemian Rhapsody",
              duration_ms: 354947,
              preview_url: "https://p.scdn.co/mp3-preview/track001",
              external_urls: {
                spotify: "https://open.spotify.com/track/track-001",
              },
              artists: [
                {
                  id: "artist-001",
                  name: "Queen",
                  external_urls: {
                    spotify: "https://open.spotify.com/artist/artist-001",
                  },
                },
              ],
              album: {
                id: "album-001",
                name: "A Night at the Opera",
                release_date: "1975-11-21",
                total_tracks: 12,
                images: [
                  {
                    url: "https://i.scdn.co/image/album001",
                    width: 640,
                    height: 640,
                  },
                ],
                external_urls: {
                  spotify: "https://open.spotify.com/album/album-001",
                },
                artists: [
                  {
                    id: "artist-001",
                    name: "Queen",
                    external_urls: {
                      spotify: "https://open.spotify.com/artist/artist-001",
                    },
                  },
                ],
              },
            },
          },
          {
            added_at: "2024-01-16T14:30:00Z",
            track: {
              id: "track-002",
              name: "Stairway to Heaven",
              duration_ms: 482830,
              preview_url: "https://p.scdn.co/mp3-preview/track002",
              external_urls: {
                spotify: "https://open.spotify.com/track/track-002",
              },
              artists: [
                {
                  id: "artist-002",
                  name: "Led Zeppelin",
                  external_urls: {
                    spotify: "https://open.spotify.com/artist/artist-002",
                  },
                },
              ],
              album: {
                id: "album-002",
                name: "Led Zeppelin IV",
                release_date: "1971-11-08",
                total_tracks: 8,
                images: [
                  {
                    url: "https://i.scdn.co/image/album002",
                    width: 640,
                    height: 640,
                  },
                ],
                external_urls: {
                  spotify: "https://open.spotify.com/album/album-002",
                },
                artists: [
                  {
                    id: "artist-002",
                    name: "Led Zeppelin",
                    external_urls: {
                      spotify: "https://open.spotify.com/artist/artist-002",
                    },
                  },
                ],
              },
            },
          },
        ],
        total: 150,
        limit: 20,
        offset: 0,
      };

      const savedTracksMock = mock(async () => mockSavedTracks);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          tracks: {
            savedTracks: savedTracksMock,
          },
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
        scopes: ["user-library-read"],
      });

      // When: getSavedTracks() is called
      const result = await adapter.getSavedTracks();

      // Then: Returns PaginatedResult<Track> with user's saved tracks
      expect(result).toBeObject();
      expect(result.items).toBeArray();
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(150);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.hasNext).toBe(true); // offset (0) + items.length (2) < total (150)

      // Verify first track
      expect(result.items[0].id).toBe("track-001");
      expect(result.items[0].name).toBe("Bohemian Rhapsody");
      expect(result.items[0].durationMs).toBe(354947);
      expect(result.items[0].artists[0].name).toBe("Queen");
      expect(result.items[0].album.name).toBe("A Night at the Opera");

      // Verify second track
      expect(result.items[1].id).toBe("track-002");
      expect(result.items[1].name).toBe("Stairway to Heaven");
      expect(result.items[1].durationMs).toBe(482830);
      expect(result.items[1].artists[0].name).toBe("Led Zeppelin");
      expect(result.items[1].album.name).toBe("Led Zeppelin IV");

      // Verify SDK method was called with default parameters
      expect(savedTracksMock).toHaveBeenCalledWith(20, 0);
    });

    test("should return saved tracks with custom limit and offset", async () => {
      // Given: User is authenticated
      const mockSavedTracks = {
        items: [
          {
            added_at: "2024-01-20T10:00:00Z",
            track: {
              id: "track-101",
              name: "Test Track 101",
              duration_ms: 240000,
              preview_url: "https://p.scdn.co/mp3-preview/track101",
              external_urls: {
                spotify: "https://open.spotify.com/track/track-101",
              },
              artists: [
                {
                  id: "artist-101",
                  name: "Test Artist",
                  external_urls: {
                    spotify: "https://open.spotify.com/artist/artist-101",
                  },
                },
              ],
              album: {
                id: "album-101",
                name: "Test Album",
                release_date: "2024-01-01",
                total_tracks: 10,
                images: [
                  {
                    url: "https://i.scdn.co/image/album101",
                    width: 640,
                    height: 640,
                  },
                ],
                external_urls: {
                  spotify: "https://open.spotify.com/album/album-101",
                },
                artists: [
                  {
                    id: "artist-101",
                    name: "Test Artist",
                    external_urls: {
                      spotify: "https://open.spotify.com/artist/artist-101",
                    },
                  },
                ],
              },
            },
          },
        ],
        total: 150,
        limit: 10,
        offset: 50,
      };

      const savedTracksMock = mock(async () => mockSavedTracks);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          tracks: {
            savedTracks: savedTracksMock,
          },
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
        scopes: ["user-library-read"],
      });

      // When: getSavedTracks({ limit: 10, offset: 50 }) is called
      const result = await adapter.getSavedTracks({ limit: 10, offset: 50 });

      // Then: Returns results starting from offset 50 with limit 10
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(150);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(50);
      expect(result.hasNext).toBe(true); // offset (50) + items.length (1) < total (150)

      // Verify SDK method was called with custom parameters
      expect(savedTracksMock).toHaveBeenCalledWith(10, 50);
    });

    test("should correctly calculate hasNext as true when more tracks exist", async () => {
      // Given: User is authenticated with pagination scenario where more tracks exist
      const mockSavedTracks = {
        items: [
          {
            added_at: "2024-01-20T10:00:00Z",
            track: {
              id: "track-101",
              name: "Test Track",
              duration_ms: 240000,
              preview_url: "https://p.scdn.co/mp3-preview/track101",
              external_urls: {
                spotify: "https://open.spotify.com/track/track-101",
              },
              artists: [
                {
                  id: "artist-101",
                  name: "Test Artist",
                  external_urls: {
                    spotify: "https://open.spotify.com/artist/artist-101",
                  },
                },
              ],
              album: {
                id: "album-101",
                name: "Test Album",
                release_date: "2024-01-01",
                total_tracks: 10,
                images: [
                  {
                    url: "https://i.scdn.co/image/album101",
                    width: 640,
                    height: 640,
                  },
                ],
                external_urls: {
                  spotify: "https://open.spotify.com/album/album-101",
                },
                artists: [
                  {
                    id: "artist-101",
                    name: "Test Artist",
                    external_urls: {
                      spotify: "https://open.spotify.com/artist/artist-101",
                    },
                  },
                ],
              },
            },
          },
        ],
        total: 100,
        limit: 20,
        offset: 40,
      };

      const savedTracksMock = mock(async () => mockSavedTracks);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          tracks: {
            savedTracks: savedTracksMock,
          },
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
        scopes: ["user-library-read"],
      });

      // When: getSavedTracks() is called
      const result = await adapter.getSavedTracks({ limit: 20, offset: 40 });

      // Then: hasNext is true because offset (40) + items.length (1) = 41 < total (100)
      expect(result.hasNext).toBe(true);
      expect(result.offset).toBe(40);
      expect(result.total).toBe(100);
      expect(result.items).toHaveLength(1);
    });

    test("should correctly calculate hasNext as false when no more tracks exist", async () => {
      // Given: User is authenticated at the end of pagination
      const mockSavedTracks = {
        items: [
          {
            added_at: "2024-01-20T10:00:00Z",
            track: {
              id: "track-150",
              name: "Last Track",
              duration_ms: 240000,
              preview_url: "https://p.scdn.co/mp3-preview/track150",
              external_urls: {
                spotify: "https://open.spotify.com/track/track-150",
              },
              artists: [
                {
                  id: "artist-101",
                  name: "Test Artist",
                  external_urls: {
                    spotify: "https://open.spotify.com/artist/artist-101",
                  },
                },
              ],
              album: {
                id: "album-101",
                name: "Test Album",
                release_date: "2024-01-01",
                total_tracks: 10,
                images: [
                  {
                    url: "https://i.scdn.co/image/album101",
                    width: 640,
                    height: 640,
                  },
                ],
                external_urls: {
                  spotify: "https://open.spotify.com/album/album-101",
                },
                artists: [
                  {
                    id: "artist-101",
                    name: "Test Artist",
                    external_urls: {
                      spotify: "https://open.spotify.com/artist/artist-101",
                    },
                  },
                ],
              },
            },
          },
        ],
        total: 150,
        limit: 20,
        offset: 149,
      };

      const savedTracksMock = mock(async () => mockSavedTracks);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          tracks: {
            savedTracks: savedTracksMock,
          },
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
        scopes: ["user-library-read"],
      });

      // When: getSavedTracks() is called at the last page
      const result = await adapter.getSavedTracks({ limit: 20, offset: 149 });

      // Then: hasNext is false because offset (149) + items.length (1) = 150 >= total (150)
      expect(result.hasNext).toBe(false);
      expect(result.offset).toBe(149);
      expect(result.total).toBe(150);
      expect(result.items).toHaveLength(1);
    });

    test("should return empty items array when user has no saved tracks", async () => {
      // Given: User is authenticated but has no saved tracks
      const mockSavedTracks = {
        items: [],
        total: 0,
        limit: 20,
        offset: 0,
      };

      const savedTracksMock = mock(async () => mockSavedTracks);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          tracks: {
            savedTracks: savedTracksMock,
          },
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
        scopes: ["user-library-read"],
      });

      // When: getSavedTracks() is called
      const result = await adapter.getSavedTracks();

      // Then: Returns empty PaginatedResult
      expect(result.items).toBeArray();
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.hasNext).toBe(false);
      expect(savedTracksMock).toHaveBeenCalledWith(20, 0);
    });
  });

  describe("AC-028: Save Track [CH-021]", () => {
    test("should add track to user's library", async () => {
      // Given: User is authenticated
      const saveTracksMock = mock(async () => {});

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          tracks: {
            saveTracks: saveTracksMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: saveTrack(trackId) is called
      await adapter.saveTrack("track-123");

      // Then: Track is added to user's library
      expect(saveTracksMock).toHaveBeenCalledWith(["track-123"]);
    });

    test("should handle authentication error", async () => {
      // Given: User is not authenticated (401 Unauthorized)
      const error = new Error("Unauthorized") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 401;
      error.headers = {};

      const saveTracksMock = mock(async () => {
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
          tracks: {
            saveTracks: saveTracksMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: saveTrack is called without authentication
      // Then: AuthenticationError is thrown
      await expect(adapter.saveTrack("track-123")).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should handle rate limit error", async () => {
      // Given: Rate limit is exceeded (429 Too Many Requests)
      const error = new Error("Too Many Requests") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 429;
      error.headers = { "retry-after": "5" };

      const saveTracksMock = mock(async () => {
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
          tracks: {
            saveTracks: saveTracksMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: saveTrack is called and rate limit is exceeded
      // Then: RateLimitError is thrown with retryAfter value
      try {
        await adapter.saveTrack("track-123");
        throw new Error("Expected RateLimitError");
      } catch (err) {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).retryAfter).toBe(5);
      }
    });

    test("should handle invalid track ID gracefully", async () => {
      // Given: Invalid track ID (400 Bad Request)
      const error = new Error("Bad Request") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 400;
      error.headers = {};

      const saveTracksMock = mock(async () => {
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
          tracks: {
            saveTracks: saveTracksMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: saveTrack is called with invalid track ID
      // Then: Error is thrown
      await expect(adapter.saveTrack("invalid-id")).rejects.toThrow();
    });
  });

  describe("AC-029: Remove Saved Track [CH-021]", () => {
    test("should remove track from user's library", async () => {
      // Given: User is authenticated and track is saved
      const removeSavedTracksMock = mock(async () => {});

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          tracks: {
            removeSavedTracks: removeSavedTracksMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: removeSavedTrack(trackId) is called
      await adapter.removeSavedTrack("track-123");

      // Then: Track is removed from user's library
      expect(removeSavedTracksMock).toHaveBeenCalledWith(["track-123"]);
    });

    test("should handle authentication error", async () => {
      // Given: User is not authenticated (401 Unauthorized)
      const error = new Error("Unauthorized") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 401;
      error.headers = {};

      const removeSavedTracksMock = mock(async () => {
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
          tracks: {
            removeSavedTracks: removeSavedTracksMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: removeSavedTrack is called without authentication
      // Then: AuthenticationError is thrown
      await expect(adapter.removeSavedTrack("track-123")).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should handle rate limit error", async () => {
      // Given: Rate limit is exceeded (429 Too Many Requests)
      const error = new Error("Too Many Requests") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 429;
      error.headers = { "retry-after": "10" };

      const removeSavedTracksMock = mock(async () => {
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
          tracks: {
            removeSavedTracks: removeSavedTracksMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: removeSavedTrack is called and rate limit is exceeded
      // Then: RateLimitError is thrown with retryAfter value
      try {
        await adapter.removeSavedTrack("track-123");
        throw new Error("Expected RateLimitError");
      } catch (err) {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).retryAfter).toBe(10);
      }
    });

    test("should handle non-existent track gracefully", async () => {
      // Given: Track does not exist or is not in library
      const removeSavedTracksMock = mock(async () => {
        // Spotify API succeeds even if track is not in library
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
          tracks: {
            removeSavedTracks: removeSavedTracksMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: removeSavedTrack is called for non-existent or unsaved track
      // Then: Operation succeeds (idempotent behavior)
      await adapter.removeSavedTrack("non-existent-track");

      expect(removeSavedTracksMock).toHaveBeenCalledWith([
        "non-existent-track",
      ]);
    });

    test("should handle invalid track ID", async () => {
      // Given: Invalid track ID (400 Bad Request)
      const error = new Error("Bad Request") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 400;
      error.headers = {};

      const removeSavedTracksMock = mock(async () => {
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
          tracks: {
            removeSavedTracks: removeSavedTracksMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: removeSavedTrack is called with invalid track ID
      // Then: Error is thrown
      await expect(adapter.removeSavedTrack("invalid-id")).rejects.toThrow();
    });
  });

  describe("AC-030: Get User Playlists [CH-022]", () => {
    test("should return PaginatedResult<SimplifiedPlaylist> with user's playlists", async () => {
      // Given: User is authenticated and has playlists
      const mockUserPlaylists = {
        items: [
          {
            id: "playlist-001",
            name: "My Favorite Songs",
            description: "A collection of my favorite tracks",
            owner: {
              id: "user-123",
              display_name: "Test User",
              external_urls: {
                spotify: "https://open.spotify.com/user/user-123",
              },
            },
            tracks: {
              total: 42,
            },
            images: [
              {
                url: "https://i.scdn.co/image/playlist001",
                width: 640,
                height: 640,
              },
            ],
            external_urls: {
              spotify: "https://open.spotify.com/playlist/playlist-001",
            },
          },
          {
            id: "playlist-002",
            name: "Workout Mix",
            description: null,
            owner: {
              id: "user-123",
              display_name: "Test User",
              external_urls: {
                spotify: "https://open.spotify.com/user/user-123",
              },
            },
            tracks: {
              total: 25,
            },
            images: [
              {
                url: "https://i.scdn.co/image/playlist002",
                width: 640,
                height: 640,
              },
            ],
            external_urls: {
              spotify: "https://open.spotify.com/playlist/playlist-002",
            },
          },
        ],
        total: 50,
        limit: 20,
        offset: 0,
      };

      const playlistsMock = mock(async () => mockUserPlaylists);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          playlists: {
            playlists: playlistsMock,
          },
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
        scopes: ["playlist-read-private"],
      });

      // When: getUserPlaylists() is called
      const result = await adapter.getUserPlaylists();

      // Then: Returns PaginatedResult<SimplifiedPlaylist> with user's playlists
      expect(result).toBeObject();
      expect(result.items).toBeArray();
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(50);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.hasNext).toBe(true); // offset (0) + items.length (2) < total (50)

      // Verify first playlist
      expect(result.items[0].id).toBe("playlist-001");
      expect(result.items[0].name).toBe("My Favorite Songs");
      expect(result.items[0].description).toBe(
        "A collection of my favorite tracks",
      );
      expect(result.items[0].owner.id).toBe("user-123");
      expect(result.items[0].owner.displayName).toBe("Test User");
      expect(result.items[0].totalTracks).toBe(42);
      expect(result.items[0].images).toHaveLength(1);
      expect(result.items[0].images[0].url).toBe(
        "https://i.scdn.co/image/playlist001",
      );
      expect(result.items[0].externalUrl).toBe(
        "https://open.spotify.com/playlist/playlist-001",
      );

      // Verify second playlist
      expect(result.items[1].id).toBe("playlist-002");
      expect(result.items[1].name).toBe("Workout Mix");
      expect(result.items[1].description).toBeNull();
      expect(result.items[1].totalTracks).toBe(25);

      // Verify SDK method was called with default parameters
      expect(playlistsMock).toHaveBeenCalledWith(20, 0);
    });

    test("should return user playlists with custom limit and offset", async () => {
      // Given: User is authenticated
      const mockUserPlaylists = {
        items: [
          {
            id: "playlist-101",
            name: "Test Playlist 101",
            description: "Description for playlist 101",
            owner: {
              id: "user-123",
              display_name: "Test User",
              external_urls: {
                spotify: "https://open.spotify.com/user/user-123",
              },
            },
            tracks: {
              total: 10,
            },
            images: [
              {
                url: "https://i.scdn.co/image/playlist101",
                width: 640,
                height: 640,
              },
            ],
            external_urls: {
              spotify: "https://open.spotify.com/playlist/playlist-101",
            },
          },
        ],
        total: 50,
        limit: 10,
        offset: 30,
      };

      const playlistsMock = mock(async () => mockUserPlaylists);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          playlists: {
            playlists: playlistsMock,
          },
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
        scopes: ["playlist-read-private"],
      });

      // When: getUserPlaylists({ limit: 10, offset: 30 }) is called
      const result = await adapter.getUserPlaylists({ limit: 10, offset: 30 });

      // Then: Returns results starting from offset 30 with limit 10
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(50);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(30);
      expect(result.hasNext).toBe(true); // offset (30) + items.length (1) < total (50)

      // Verify SDK method was called with custom parameters
      expect(playlistsMock).toHaveBeenCalledWith(10, 30);
    });

    test("should correctly calculate hasNext as true when more playlists exist", async () => {
      // Given: User is authenticated with pagination scenario where more playlists exist
      const mockUserPlaylists = {
        items: [
          {
            id: "playlist-101",
            name: "Test Playlist",
            description: null,
            owner: {
              id: "user-123",
              display_name: "Test User",
              external_urls: {
                spotify: "https://open.spotify.com/user/user-123",
              },
            },
            tracks: {
              total: 15,
            },
            images: [
              {
                url: "https://i.scdn.co/image/playlist101",
                width: 640,
                height: 640,
              },
            ],
            external_urls: {
              spotify: "https://open.spotify.com/playlist/playlist-101",
            },
          },
        ],
        total: 100,
        limit: 20,
        offset: 40,
      };

      const playlistsMock = mock(async () => mockUserPlaylists);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          playlists: {
            playlists: playlistsMock,
          },
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
        scopes: ["playlist-read-private"],
      });

      // When: getUserPlaylists() is called
      const result = await adapter.getUserPlaylists({ limit: 20, offset: 40 });

      // Then: hasNext is true because offset (40) + items.length (1) = 41 < total (100)
      expect(result.hasNext).toBe(true);
      expect(result.offset).toBe(40);
      expect(result.total).toBe(100);
      expect(result.items).toHaveLength(1);
    });

    test("should correctly calculate hasNext as false when no more playlists exist", async () => {
      // Given: User is authenticated at the end of pagination
      const mockUserPlaylists = {
        items: [
          {
            id: "playlist-050",
            name: "Last Playlist",
            description: "The final playlist",
            owner: {
              id: "user-123",
              display_name: "Test User",
              external_urls: {
                spotify: "https://open.spotify.com/user/user-123",
              },
            },
            tracks: {
              total: 5,
            },
            images: [
              {
                url: "https://i.scdn.co/image/playlist050",
                width: 640,
                height: 640,
              },
            ],
            external_urls: {
              spotify: "https://open.spotify.com/playlist/playlist-050",
            },
          },
        ],
        total: 50,
        limit: 20,
        offset: 49,
      };

      const playlistsMock = mock(async () => mockUserPlaylists);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          playlists: {
            playlists: playlistsMock,
          },
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
        scopes: ["playlist-read-private"],
      });

      // When: getUserPlaylists() is called at the last page
      const result = await adapter.getUserPlaylists({ limit: 20, offset: 49 });

      // Then: hasNext is false because offset (49) + items.length (1) = 50 >= total (50)
      expect(result.hasNext).toBe(false);
      expect(result.offset).toBe(49);
      expect(result.total).toBe(50);
      expect(result.items).toHaveLength(1);
    });

    test("should return empty items array when user has no playlists", async () => {
      // Given: User is authenticated but has no playlists
      const mockUserPlaylists = {
        items: [],
        total: 0,
        limit: 20,
        offset: 0,
      };

      const playlistsMock = mock(async () => mockUserPlaylists);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          playlists: {
            playlists: playlistsMock,
          },
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
        scopes: ["playlist-read-private"],
      });

      // When: getUserPlaylists() is called
      const result = await adapter.getUserPlaylists();

      // Then: Returns empty PaginatedResult
      expect(result.items).toBeArray();
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.hasNext).toBe(false);
      expect(playlistsMock).toHaveBeenCalledWith(20, 0);
    });

    test("should handle authentication error", async () => {
      // Given: User is not authenticated (401 Unauthorized)
      const error = new Error("Unauthorized") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 401;
      error.headers = {};

      const playlistsMock = mock(async () => {
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
          playlists: {
            playlists: playlistsMock,
          },
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
        scopes: ["playlist-read-private"],
      });

      // When: getUserPlaylists is called without authentication
      // Then: AuthenticationError is thrown
      await expect(adapter.getUserPlaylists()).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should handle rate limit error", async () => {
      // Given: Rate limit is exceeded (429 Too Many Requests)
      const error = new Error("Too Many Requests") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 429;
      error.headers = { "retry-after": "10" };

      const playlistsMock = mock(async () => {
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
          playlists: {
            playlists: playlistsMock,
          },
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
        scopes: ["playlist-read-private"],
      });

      // When: getUserPlaylists is called and rate limit is exceeded
      // Then: RateLimitError is thrown with retryAfter value
      try {
        await adapter.getUserPlaylists();
        throw new Error("Expected RateLimitError");
      } catch (err) {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).retryAfter).toBe(10);
      }
    });
  });

  describe("AC-033: Get Saved Albums [CH-023]", () => {
    test("should return PaginatedResult<Album> with user's saved albums", async () => {
      // Given: User is authenticated and has saved albums
      const mockSavedAlbums = {
        items: [
          {
            added_at: "2024-01-15T10:00:00Z",
            album: {
              id: "album-001",
              name: "Abbey Road",
              release_date: "1969-09-26",
              total_tracks: 17,
              images: [
                {
                  url: "https://i.scdn.co/image/album001",
                  width: 640,
                  height: 640,
                },
              ],
              external_urls: {
                spotify: "https://open.spotify.com/album/album-001",
              },
              artists: [
                {
                  id: "artist-001",
                  name: "The Beatles",
                  external_urls: {
                    spotify: "https://open.spotify.com/artist/artist-001",
                  },
                },
              ],
            },
          },
          {
            added_at: "2024-01-16T14:30:00Z",
            album: {
              id: "album-002",
              name: "Dark Side of the Moon",
              release_date: "1973-03-01",
              total_tracks: 10,
              images: [
                {
                  url: "https://i.scdn.co/image/album002",
                  width: 640,
                  height: 640,
                },
              ],
              external_urls: {
                spotify: "https://open.spotify.com/album/album-002",
              },
              artists: [
                {
                  id: "artist-002",
                  name: "Pink Floyd",
                  external_urls: {
                    spotify: "https://open.spotify.com/artist/artist-002",
                  },
                },
              ],
            },
          },
        ],
        total: 100,
        limit: 20,
        offset: 0,
      };

      const savedAlbumsMock = mock(async () => mockSavedAlbums);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          albums: {
            savedAlbums: savedAlbumsMock,
          },
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
        scopes: ["user-library-read"],
      });

      // When: getSavedAlbums() is called
      const result = await adapter.getSavedAlbums();

      // Then: Returns PaginatedResult<Album> with user's saved albums
      expect(result).toBeObject();
      expect(result.items).toBeArray();
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(100);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.hasNext).toBe(true); // offset (0) + items.length (2) < total (100)

      // Verify first album
      expect(result.items[0].id).toBe("album-001");
      expect(result.items[0].name).toBe("Abbey Road");
      expect(result.items[0].releaseDate).toBe("1969-09-26");
      expect(result.items[0].totalTracks).toBe(17);
      expect(result.items[0].artists[0].name).toBe("The Beatles");

      // Verify second album
      expect(result.items[1].id).toBe("album-002");
      expect(result.items[1].name).toBe("Dark Side of the Moon");
      expect(result.items[1].releaseDate).toBe("1973-03-01");
      expect(result.items[1].totalTracks).toBe(10);
      expect(result.items[1].artists[0].name).toBe("Pink Floyd");

      // Verify SDK method was called with default parameters
      expect(savedAlbumsMock).toHaveBeenCalledWith(20, 0);
    });

    test("should return saved albums with custom limit and offset", async () => {
      // Given: User is authenticated
      const mockSavedAlbums = {
        items: [
          {
            added_at: "2024-01-20T10:00:00Z",
            album: {
              id: "album-101",
              name: "Test Album 101",
              release_date: "2024-01-01",
              total_tracks: 12,
              images: [
                {
                  url: "https://i.scdn.co/image/album101",
                  width: 640,
                  height: 640,
                },
              ],
              external_urls: {
                spotify: "https://open.spotify.com/album/album-101",
              },
              artists: [
                {
                  id: "artist-101",
                  name: "Test Artist",
                  external_urls: {
                    spotify: "https://open.spotify.com/artist/artist-101",
                  },
                },
              ],
            },
          },
        ],
        total: 100,
        limit: 10,
        offset: 50,
      };

      const savedAlbumsMock = mock(async () => mockSavedAlbums);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          albums: {
            savedAlbums: savedAlbumsMock,
          },
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
        scopes: ["user-library-read"],
      });

      // When: getSavedAlbums({ limit: 10, offset: 50 }) is called
      const result = await adapter.getSavedAlbums({ limit: 10, offset: 50 });

      // Then: Returns results starting from offset 50 with limit 10
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(100);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(50);
      expect(result.hasNext).toBe(true); // offset (50) + items.length (1) < total (100)

      // Verify SDK method was called with custom parameters
      expect(savedAlbumsMock).toHaveBeenCalledWith(10, 50);
    });

    test("should correctly calculate hasNext as true when more albums exist", async () => {
      // Given: User is authenticated with pagination scenario where more albums exist
      const mockSavedAlbums = {
        items: [
          {
            added_at: "2024-01-20T10:00:00Z",
            album: {
              id: "album-101",
              name: "Test Album",
              release_date: "2024-01-01",
              total_tracks: 10,
              images: [
                {
                  url: "https://i.scdn.co/image/album101",
                  width: 640,
                  height: 640,
                },
              ],
              external_urls: {
                spotify: "https://open.spotify.com/album/album-101",
              },
              artists: [
                {
                  id: "artist-101",
                  name: "Test Artist",
                  external_urls: {
                    spotify: "https://open.spotify.com/artist/artist-101",
                  },
                },
              ],
            },
          },
        ],
        total: 80,
        limit: 20,
        offset: 40,
      };

      const savedAlbumsMock = mock(async () => mockSavedAlbums);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          albums: {
            savedAlbums: savedAlbumsMock,
          },
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
        scopes: ["user-library-read"],
      });

      // When: getSavedAlbums() is called
      const result = await adapter.getSavedAlbums({ limit: 20, offset: 40 });

      // Then: hasNext is true because offset (40) + items.length (1) = 41 < total (80)
      expect(result.hasNext).toBe(true);
      expect(result.offset).toBe(40);
      expect(result.total).toBe(80);
      expect(result.items).toHaveLength(1);
    });

    test("should correctly calculate hasNext as false when no more albums exist", async () => {
      // Given: User is authenticated at the end of pagination
      const mockSavedAlbums = {
        items: [
          {
            added_at: "2024-01-20T10:00:00Z",
            album: {
              id: "album-100",
              name: "Last Album",
              release_date: "2024-01-01",
              total_tracks: 10,
              images: [
                {
                  url: "https://i.scdn.co/image/album100",
                  width: 640,
                  height: 640,
                },
              ],
              external_urls: {
                spotify: "https://open.spotify.com/album/album-100",
              },
              artists: [
                {
                  id: "artist-101",
                  name: "Test Artist",
                  external_urls: {
                    spotify: "https://open.spotify.com/artist/artist-101",
                  },
                },
              ],
            },
          },
        ],
        total: 100,
        limit: 20,
        offset: 99,
      };

      const savedAlbumsMock = mock(async () => mockSavedAlbums);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          albums: {
            savedAlbums: savedAlbumsMock,
          },
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
        scopes: ["user-library-read"],
      });

      // When: getSavedAlbums() is called at the last page
      const result = await adapter.getSavedAlbums({ limit: 20, offset: 99 });

      // Then: hasNext is false because offset (99) + items.length (1) = 100 >= total (100)
      expect(result.hasNext).toBe(false);
      expect(result.offset).toBe(99);
      expect(result.total).toBe(100);
      expect(result.items).toHaveLength(1);
    });

    test("should return empty items array when user has no saved albums", async () => {
      // Given: User is authenticated but has no saved albums
      const mockSavedAlbums = {
        items: [],
        total: 0,
        limit: 20,
        offset: 0,
      };

      const savedAlbumsMock = mock(async () => mockSavedAlbums);

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          albums: {
            savedAlbums: savedAlbumsMock,
          },
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
        scopes: ["user-library-read"],
      });

      // When: getSavedAlbums() is called
      const result = await adapter.getSavedAlbums();

      // Then: Returns empty PaginatedResult
      expect(result.items).toBeArray();
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.hasNext).toBe(false);
      expect(savedAlbumsMock).toHaveBeenCalledWith(20, 0);
    });
  });

  describe("AC-034: Save Album [CH-024]", () => {
    test("should add album to user's library", async () => {
      // Given: User is authenticated
      const saveAlbumsMock = mock(async () => {});

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          albums: {
            saveAlbums: saveAlbumsMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: saveAlbum(albumId) is called
      await adapter.saveAlbum("album-123");

      // Then: Album is added to user's library
      expect(saveAlbumsMock).toHaveBeenCalledWith(["album-123"]);
    });

    test("should handle authentication error", async () => {
      // Given: User is not authenticated (401 Unauthorized)
      const error = new Error("Unauthorized") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 401;
      error.headers = {};

      const saveAlbumsMock = mock(async () => {
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
          albums: {
            saveAlbums: saveAlbumsMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: saveAlbum is called without authentication
      // Then: AuthenticationError is thrown
      await expect(adapter.saveAlbum("album-123")).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should handle rate limit error", async () => {
      // Given: Rate limit is exceeded (429 Too Many Requests)
      const error = new Error("Too Many Requests") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 429;
      error.headers = { "retry-after": "5" };

      const saveAlbumsMock = mock(async () => {
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
          albums: {
            saveAlbums: saveAlbumsMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: saveAlbum is called and rate limit is exceeded
      // Then: RateLimitError is thrown with retryAfter value
      try {
        await adapter.saveAlbum("album-123");
        throw new Error("Expected RateLimitError");
      } catch (err) {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).retryAfter).toBe(5);
      }
    });

    test("should handle invalid album ID gracefully", async () => {
      // Given: Invalid album ID (400 Bad Request)
      const error = new Error("Bad Request") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 400;
      error.headers = {};

      const saveAlbumsMock = mock(async () => {
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
          albums: {
            saveAlbums: saveAlbumsMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: saveAlbum is called with invalid album ID
      // Then: Error is thrown
      await expect(adapter.saveAlbum("invalid-id")).rejects.toThrow();
    });
  });

  describe("AC-035: Remove Saved Album [CH-024]", () => {
    test("should remove album from user's library", async () => {
      // Given: User is authenticated and album is saved
      const removeSavedAlbumsMock = mock(async () => {});

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          albums: {
            removeSavedAlbums: removeSavedAlbumsMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: removeSavedAlbum(albumId) is called
      await adapter.removeSavedAlbum("album-123");

      // Then: Album is removed from user's library
      expect(removeSavedAlbumsMock).toHaveBeenCalledWith(["album-123"]);
    });

    test("should handle authentication error", async () => {
      // Given: User is not authenticated (401 Unauthorized)
      const error = new Error("Unauthorized") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 401;
      error.headers = {};

      const removeSavedAlbumsMock = mock(async () => {
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
          albums: {
            removeSavedAlbums: removeSavedAlbumsMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: removeSavedAlbum is called without authentication
      // Then: AuthenticationError is thrown
      await expect(adapter.removeSavedAlbum("album-123")).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should handle rate limit error", async () => {
      // Given: Rate limit is exceeded (429 Too Many Requests)
      const error = new Error("Too Many Requests") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 429;
      error.headers = { "retry-after": "10" };

      const removeSavedAlbumsMock = mock(async () => {
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
          albums: {
            removeSavedAlbums: removeSavedAlbumsMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: removeSavedAlbum is called and rate limit is exceeded
      // Then: RateLimitError is thrown with retryAfter value
      try {
        await adapter.removeSavedAlbum("album-123");
        throw new Error("Expected RateLimitError");
      } catch (err) {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).retryAfter).toBe(10);
      }
    });

    test("should handle non-existent album ID gracefully", async () => {
      // Given: Album ID doesn't exist (404 Not Found)
      const error = new Error("Not Found") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 404;
      error.headers = {};

      const removeSavedAlbumsMock = mock(async () => {
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
          albums: {
            removeSavedAlbums: removeSavedAlbumsMock,
          },
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
        scopes: ["user-library-modify"],
      });

      // When: removeSavedAlbum is called with non-existent album ID
      // Then: Error is thrown
      await expect(
        adapter.removeSavedAlbum("nonexistent-id"),
      ).rejects.toThrow();
    });
  });

  describe("AC-036: Get Followed Artists [CH-025]", () => {
    test("should return followed artists", async () => {
      // Given: User is authenticated
      const mockArtists = [
        {
          id: "artist-1",
          name: "Artist One",
          genres: ["rock", "alternative"],
          images: [
            { url: "https://example.com/img1.jpg", width: 640, height: 640 },
          ],
          external_urls: {
            spotify: "https://open.spotify.com/artist/artist-1",
          },
        },
        {
          id: "artist-2",
          name: "Artist Two",
          genres: ["pop"],
          images: [
            { url: "https://example.com/img2.jpg", width: 300, height: 300 },
          ],
          external_urls: {
            spotify: "https://open.spotify.com/artist/artist-2",
          },
        },
      ];

      const followedArtistsMock = mock(async () => ({
        artists: {
          items: mockArtists,
          total: 25,
          limit: 20,
          offset: 0,
          next: "https://api.spotify.com/v1/me/following?type=artist&after=artist-2&limit=20",
          previous: null,
          href: "https://api.spotify.com/v1/me/following?type=artist",
        },
      }));

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          followedArtists: followedArtistsMock,
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
        scopes: ["user-follow-read"],
      });

      // When: getFollowedArtists() is called
      const result = await adapter.getFollowedArtists();

      // Then: Returns PaginatedResult<Artist> with followed artists
      expect(result).toBeObject();
      expect(result.items).toBeArray();
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(25);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.hasNext).toBe(true);

      // Verify artist structure
      expect(result.items[0].id).toBe("artist-1");
      expect(result.items[0].name).toBe("Artist One");
      expect(result.items[0].genres).toEqual(["rock", "alternative"]);
      expect(result.items[0].externalUrl).toBe(
        "https://open.spotify.com/artist/artist-1",
      );

      expect(result.items[1].id).toBe("artist-2");
      expect(result.items[1].name).toBe("Artist Two");
    });

    test("should handle pagination with limit option", async () => {
      // Given: User is authenticated
      const mockArtists = [
        {
          id: "artist-5",
          name: "Artist Five",
          genres: [],
          images: [],
          external_urls: {
            spotify: "https://open.spotify.com/artist/artist-5",
          },
        },
      ];

      const followedArtistsMock = mock(async () => ({
        artists: {
          items: mockArtists,
          total: 50,
          limit: 10,
          offset: 0,
          next: "https://api.spotify.com/v1/me/following?type=artist&after=artist-5&limit=10",
          previous: null,
          href: "https://api.spotify.com/v1/me/following?type=artist",
        },
      }));

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          followedArtists: followedArtistsMock,
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
        scopes: ["user-follow-read"],
      });

      // When: getFollowedArtists({ limit: 10 }) is called
      const result = await adapter.getFollowedArtists({ limit: 10 });

      // Then: Returns results with limit 10
      expect(result.limit).toBe(10);
      expect(result.total).toBe(50);
      expect(result.hasNext).toBe(true);
      expect(followedArtistsMock).toHaveBeenCalled();
    });

    test("should return hasNext=true when more artists are available", async () => {
      // Given: User is authenticated and has more artists to load
      const mockArtists = [
        {
          id: "artist-1",
          name: "Artist One",
          genres: [],
          images: [],
          external_urls: {
            spotify: "https://open.spotify.com/artist/artist-1",
          },
        },
      ];

      const followedArtistsMock = mock(async () => ({
        artists: {
          items: mockArtists,
          total: 100,
          limit: 20,
          offset: 40,
          next: "https://api.spotify.com/v1/me/following?type=artist&after=artist-1&limit=20",
          previous: null,
          href: "https://api.spotify.com/v1/me/following?type=artist",
        },
      }));

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          followedArtists: followedArtistsMock,
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
        scopes: ["user-follow-read"],
      });

      // When: getFollowedArtists() is called
      const result = await adapter.getFollowedArtists({
        limit: 20,
        offset: 40,
      });

      // Then: hasNext is true because offset (40) + items.length (1) = 41 < total (100)
      expect(result.hasNext).toBe(true);
      expect(result.offset).toBe(40);
      expect(result.total).toBe(100);
    });

    test("should return hasNext=false when at the end", async () => {
      // Given: User is authenticated and at the last page
      const mockArtists = [
        {
          id: "artist-last",
          name: "Last Artist",
          genres: [],
          images: [],
          external_urls: {
            spotify: "https://open.spotify.com/artist/artist-last",
          },
        },
      ];

      const followedArtistsMock = mock(async () => ({
        artists: {
          items: mockArtists,
          total: 50,
          limit: 20,
          offset: 49,
          next: null,
          previous:
            "https://api.spotify.com/v1/me/following?type=artist&before=artist-last&limit=20",
          href: "https://api.spotify.com/v1/me/following?type=artist",
        },
      }));

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          followedArtists: followedArtistsMock,
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
        scopes: ["user-follow-read"],
      });

      // When: getFollowedArtists() is called at the last page
      const result = await adapter.getFollowedArtists({
        limit: 20,
        offset: 49,
      });

      // Then: hasNext is false because offset (49) + items.length (1) = 50 >= total (50)
      expect(result.hasNext).toBe(false);
      expect(result.offset).toBe(49);
      expect(result.total).toBe(50);
    });

    test("should return empty result when no followed artists", async () => {
      // Given: User is authenticated but follows no artists
      const followedArtistsMock = mock(async () => ({
        artists: {
          items: [],
          total: 0,
          limit: 20,
          offset: 0,
          next: null,
          previous: null,
          href: "https://api.spotify.com/v1/me/following?type=artist",
        },
      }));

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          followedArtists: followedArtistsMock,
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
        scopes: ["user-follow-read"],
      });

      // When: getFollowedArtists() is called
      const result = await adapter.getFollowedArtists();

      // Then: Returns empty PaginatedResult
      expect(result.items).toBeArray();
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasNext).toBe(false);
    });

    test("should handle authentication error", async () => {
      // Given: User is not authenticated (401 Unauthorized)
      const error = new Error("Unauthorized") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 401;
      error.headers = {};

      const followedArtistsMock = mock(async () => {
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
          followedArtists: followedArtistsMock,
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
        scopes: ["user-follow-read"],
      });

      // When: getFollowedArtists is called without authentication
      // Then: AuthenticationError is thrown
      await expect(adapter.getFollowedArtists()).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should handle rate limit error", async () => {
      // Given: Rate limit is exceeded (429 Too Many Requests)
      const error = new Error("Too Many Requests") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 429;
      error.headers = { "retry-after": "15" };

      const followedArtistsMock = mock(async () => {
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
          followedArtists: followedArtistsMock,
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
        scopes: ["user-follow-read"],
      });

      // When: getFollowedArtists is called and rate limit is exceeded
      // Then: RateLimitError is thrown with retryAfter value
      try {
        await adapter.getFollowedArtists();
        throw new Error("Expected RateLimitError");
      } catch (err) {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).retryAfter).toBe(15);
      }
    });
  });

  describe("AC-037: Follow Artist [CH-026]", () => {
    test("should add artist to user's followed artists", async () => {
      // Given: User is authenticated
      const followArtistsMock = mock(async () => {});

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          followArtistsOrUsers: followArtistsMock,
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
        scopes: ["user-follow-modify"],
      });

      // When: followArtist(artistId) is called
      await adapter.followArtist("artist-123");

      // Then: Artist is added to user's followed artists
      expect(followArtistsMock).toHaveBeenCalledWith(["artist-123"], "artist");
    });

    test("should handle authentication error", async () => {
      // Given: User is not authenticated (401 Unauthorized)
      const error = new Error("Unauthorized") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 401;
      error.headers = {};

      const followArtistsMock = mock(async () => {
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
          followArtistsOrUsers: followArtistsMock,
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
        scopes: ["user-follow-modify"],
      });

      // When: followArtist is called without authentication
      // Then: AuthenticationError is thrown
      await expect(adapter.followArtist("artist-123")).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should handle rate limit error", async () => {
      // Given: Rate limit is exceeded (429 Too Many Requests)
      const error = new Error("Too Many Requests") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 429;
      error.headers = { "retry-after": "10" };

      const followArtistsMock = mock(async () => {
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
          followArtistsOrUsers: followArtistsMock,
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
        scopes: ["user-follow-modify"],
      });

      // When: followArtist is called and rate limit is exceeded
      // Then: RateLimitError is thrown with retryAfter value
      try {
        await adapter.followArtist("artist-123");
        throw new Error("Expected RateLimitError");
      } catch (err) {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).retryAfter).toBe(10);
      }
    });
  });

  describe("AC-038: Unfollow Artist [CH-026]", () => {
    test("should remove artist from user's followed artists", async () => {
      // Given: User is authenticated and artist is followed
      const unfollowArtistsMock = mock(async () => {});

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          unfollowArtistsOrUsers: unfollowArtistsMock,
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
        scopes: ["user-follow-modify"],
      });

      // When: unfollowArtist(artistId) is called
      await adapter.unfollowArtist("artist-123");

      // Then: Artist is removed from user's followed artists
      expect(unfollowArtistsMock).toHaveBeenCalledWith(
        ["artist-123"],
        "artist",
      );
    });

    test("should handle authentication error", async () => {
      // Given: User is not authenticated (401 Unauthorized)
      const error = new Error("Unauthorized") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 401;
      error.headers = {};

      const unfollowArtistsMock = mock(async () => {
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
          unfollowArtistsOrUsers: unfollowArtistsMock,
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
        scopes: ["user-follow-modify"],
      });

      // When: unfollowArtist is called without authentication
      // Then: AuthenticationError is thrown
      await expect(adapter.unfollowArtist("artist-123")).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should handle rate limit error", async () => {
      // Given: Rate limit is exceeded (429 Too Many Requests)
      const error = new Error("Too Many Requests") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 429;
      error.headers = { "retry-after": "20" };

      const unfollowArtistsMock = mock(async () => {
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
          unfollowArtistsOrUsers: unfollowArtistsMock,
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
        scopes: ["user-follow-modify"],
      });

      // When: unfollowArtist is called and rate limit is exceeded
      // Then: RateLimitError is thrown with retryAfter value
      try {
        await adapter.unfollowArtist("artist-123");
        throw new Error("Expected RateLimitError");
      } catch (err) {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).retryAfter).toBe(20);
      }
    });
  });
});

// CH-027: Get Recommendations
describe("getRecommendations", () => {
  describe("AC-039: Get Recommendations [CH-027]", () => {
    test("should return array of Track objects when called with valid trackIds seed", async () => {
      // Given: Valid adapter with authentication
      const mockTrack1 = createMockSpotifyTrack({
        id: "rec-track-1",
        name: "Recommended Track 1",
      });
      const mockTrack2 = createMockSpotifyTrack({
        id: "rec-track-2",
        name: "Recommended Track 2",
      });

      const recommendationsMock = mock(async () => ({
        tracks: [mockTrack1, mockTrack2],
      }));

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
        recommendations: {
          get: recommendationsMock,
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

      // When: getRecommendations({ trackIds: ["id1"] }) is called
      const result = await adapter.getRecommendations({
        trackIds: ["seed-track-1"],
      });

      // Then: Returns array of Track objects
      expect(result).toBeArray();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeObject();
      expect(result[0].id).toBe("rec-track-1");
      expect(result[0].name).toBe("Recommended Track 1");
      expect(result[1].id).toBe("rec-track-2");
      expect(result[1].name).toBe("Recommended Track 2");
    });

    test("should return array of Track objects when called with artistIds seed", async () => {
      // Given: Valid adapter with authentication
      const mockTrack = createMockSpotifyTrack({
        id: "rec-track-artist",
        name: "Similar Artist Track",
      });

      const recommendationsMock = mock(async () => ({
        tracks: [mockTrack],
      }));

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
        recommendations: {
          get: recommendationsMock,
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

      // When: getRecommendations({ artistIds: ["artist1"] }) is called
      const result = await adapter.getRecommendations({
        artistIds: ["artist1"],
      });

      // Then: Returns array of Track objects
      expect(result).toBeArray();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("rec-track-artist");
    });

    test("should return array of Track objects when called with genres seed", async () => {
      // Given: Valid adapter with authentication
      const mockTrack = createMockSpotifyTrack({
        id: "rec-track-genre",
        name: "Genre Based Track",
      });

      const recommendationsMock = mock(async () => ({
        tracks: [mockTrack],
      }));

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
        recommendations: {
          get: recommendationsMock,
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

      // When: getRecommendations({ genres: ["rock"] }) is called
      const result = await adapter.getRecommendations({
        genres: ["rock"],
      });

      // Then: Returns array of Track objects
      expect(result).toBeArray();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("rec-track-genre");
    });

    test("should return array of Track objects when called with mixed seeds", async () => {
      // Given: Valid adapter with authentication
      const mockTracks = [
        createMockSpotifyTrack({ id: "rec-1", name: "Rec 1" }),
        createMockSpotifyTrack({ id: "rec-2", name: "Rec 2" }),
        createMockSpotifyTrack({ id: "rec-3", name: "Rec 3" }),
      ];

      const recommendationsMock = mock(async () => ({
        tracks: mockTracks,
      }));

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
        recommendations: {
          get: recommendationsMock,
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

      // When: getRecommendations with mixed seeds is called
      const result = await adapter.getRecommendations({
        trackIds: ["track1", "track2"],
        artistIds: ["artist1"],
        genres: ["rock", "pop"],
      });

      // Then: Returns array of Track objects
      expect(result).toBeArray();
      expect(result).toHaveLength(3);
    });

    test("should respect limit option (default 20)", async () => {
      // Given: Valid adapter with authentication
      const mockTracks = Array.from({ length: 20 }, (_, i) =>
        createMockSpotifyTrack({ id: `track-${i}`, name: `Track ${i}` }),
      );

      const recommendationsMock = mock(async (params: unknown) => {
        const options = params as { limit?: number };
        return {
          tracks: mockTracks.slice(0, options.limit ?? 20),
        };
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
        recommendations: {
          get: recommendationsMock,
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

      // When: getRecommendations is called without limit option
      const result = await adapter.getRecommendations({
        trackIds: ["track1"],
      });

      // Then: Returns maximum 20 tracks (default limit)
      expect(result).toBeArray();
      expect(result.length).toBeLessThanOrEqual(20);
    });

    test("should respect custom limit option (max 100)", async () => {
      // Given: Valid adapter with authentication
      const mockTracks = Array.from({ length: 50 }, (_, i) =>
        createMockSpotifyTrack({ id: `track-${i}`, name: `Track ${i}` }),
      );

      const recommendationsMock = mock(async () => ({
        tracks: mockTracks,
      }));

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
        recommendations: {
          get: recommendationsMock,
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

      // When: getRecommendations is called with custom limit
      const result = await adapter.getRecommendations(
        { trackIds: ["track1"] },
        { limit: 50 },
      );

      // Then: Returns up to 50 tracks
      expect(result).toBeArray();
      expect(result).toHaveLength(50);
    });

    test("should handle recommendation options (targetEnergy, targetDanceability, etc.)", async () => {
      // Given: Valid adapter with authentication
      const mockTrack = createMockSpotifyTrack({
        id: "energetic-track",
        name: "High Energy Track",
      });

      const recommendationsMock = mock(async () => ({
        tracks: [mockTrack],
      }));

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
        recommendations: {
          get: recommendationsMock,
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

      // When: getRecommendations is called with recommendation options
      const result = await adapter.getRecommendations(
        { trackIds: ["track1"] },
        {
          targetEnergy: 0.8,
          targetDanceability: 0.7,
          targetValence: 0.6,
          targetTempo: 120,
        },
      );

      // Then: Returns tracks matching the criteria
      expect(result).toBeArray();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("energetic-track");
    });

    test("should return empty array when no recommendations available", async () => {
      // Given: Valid adapter with authentication
      const recommendationsMock = mock(async () => ({
        tracks: [],
      }));

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
        recommendations: {
          get: recommendationsMock,
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

      // When: getRecommendations is called but no recommendations exist
      const result = await adapter.getRecommendations({
        trackIds: ["obscure-track"],
      });

      // Then: Returns empty array
      expect(result).toBeArray();
      expect(result).toHaveLength(0);
    });
  });

  describe("AC-040: Get Recommendations - Invalid Seeds [CH-027]", () => {
    test("should throw ValidationError when more than 5 total seeds (trackIds only)", async () => {
      // Given: Valid adapter with authentication
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
        recommendations: {
          get: mock(async () => ({ tracks: [] })),
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

      // When: getRecommendations is called with more than 5 trackIds
      // Then: Throws ValidationError with message about seed limit
      await expect(
        adapter.getRecommendations({
          trackIds: ["t1", "t2", "t3", "t4", "t5", "t6"],
        }),
      ).rejects.toThrow(ValidationError);

      try {
        await adapter.getRecommendations({
          trackIds: ["t1", "t2", "t3", "t4", "t5", "t6"],
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as Error).message).toContain("seed");
        expect((error as Error).message).toContain("5");
      }
    });

    test("should throw ValidationError when more than 5 total seeds (artistIds only)", async () => {
      // Given: Valid adapter with authentication
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
        recommendations: {
          get: mock(async () => ({ tracks: [] })),
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

      // When: getRecommendations is called with more than 5 artistIds
      // Then: Throws ValidationError
      await expect(
        adapter.getRecommendations({
          artistIds: ["a1", "a2", "a3", "a4", "a5", "a6"],
        }),
      ).rejects.toThrow(ValidationError);
    });

    test("should throw ValidationError when more than 5 total seeds (genres only)", async () => {
      // Given: Valid adapter with authentication
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
        recommendations: {
          get: mock(async () => ({ tracks: [] })),
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

      // When: getRecommendations is called with more than 5 genres
      // Then: Throws ValidationError
      await expect(
        adapter.getRecommendations({
          genres: ["rock", "pop", "jazz", "blues", "country", "metal"],
        }),
      ).rejects.toThrow(ValidationError);
    });

    test("should throw ValidationError when more than 5 total seeds (mixed)", async () => {
      // Given: Valid adapter with authentication
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
        recommendations: {
          get: mock(async () => ({ tracks: [] })),
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

      // When: getRecommendations is called with more than 5 total seeds across all types
      // Then: Throws ValidationError
      await expect(
        adapter.getRecommendations({
          trackIds: ["t1", "t2"],
          artistIds: ["a1", "a2"],
          genres: ["rock", "pop"],
        }),
      ).rejects.toThrow(ValidationError);
    });

    test("should accept exactly 5 seeds without throwing", async () => {
      // Given: Valid adapter with authentication
      const mockTrack = createMockSpotifyTrack();
      const recommendationsMock = mock(async () => ({
        tracks: [mockTrack],
      }));

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
        recommendations: {
          get: recommendationsMock,
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

      // When: getRecommendations is called with exactly 5 seeds
      // Then: Should not throw and return results
      const result = await adapter.getRecommendations({
        trackIds: ["t1", "t2"],
        artistIds: ["a1"],
        genres: ["rock", "pop"],
      });

      expect(result).toBeArray();
      expect(recommendationsMock).toHaveBeenCalled();
    });

    test("should accept less than 5 seeds without throwing", async () => {
      // Given: Valid adapter with authentication
      const mockTrack = createMockSpotifyTrack();
      const recommendationsMock = mock(async () => ({
        tracks: [mockTrack],
      }));

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
        recommendations: {
          get: recommendationsMock,
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

      // When: getRecommendations is called with less than 5 seeds
      // Then: Should not throw and return results
      const result = await adapter.getRecommendations({
        trackIds: ["t1"],
        genres: ["rock"],
      });

      expect(result).toBeArray();
      expect(recommendationsMock).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    test("should handle authentication error", async () => {
      // Given: User is not authenticated (401 Unauthorized)
      const error = new Error("Unauthorized") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 401;
      error.headers = {};

      const recommendationsMock = mock(async () => {
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
        recommendations: {
          get: recommendationsMock,
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

      // When: getRecommendations is called without authentication
      // Then: AuthenticationError is thrown
      await expect(
        adapter.getRecommendations({ trackIds: ["track1"] }),
      ).rejects.toThrow(AuthenticationError);
    });

    test("should handle rate limit error", async () => {
      // Given: Rate limit is exceeded (429 Too Many Requests)
      const error = new Error("Too Many Requests") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 429;
      error.headers = { "retry-after": "30" };

      const recommendationsMock = mock(async () => {
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
        recommendations: {
          get: recommendationsMock,
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

      // When: getRecommendations is called and rate limit is exceeded
      // Then: RateLimitError is thrown with retryAfter value
      try {
        await adapter.getRecommendations({ trackIds: ["track1"] });
        throw new Error("Expected RateLimitError");
      } catch (err) {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).retryAfter).toBe(30);
      }
    });

    test("should handle network error", async () => {
      // Given: Network failure occurs
      const networkError = new Error("Network failure");

      const recommendationsMock = mock(async () => {
        throw networkError;
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
        recommendations: {
          get: recommendationsMock,
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

      // When: getRecommendations is called and network error occurs
      // Then: NetworkError is thrown
      await expect(
        adapter.getRecommendations({ trackIds: ["track1"] }),
      ).rejects.toThrow(NetworkError);
    });
  });
});

// CH-028: Get Related Artists
describe("getRelatedArtists", () => {
  describe("AC-041: Get Related Artists [CH-028]", () => {
    test("should return array of Artist objects when called with valid artistId", async () => {
      // Given: Valid adapter with authentication
      const mockRelatedArtist1 = {
        id: "related-artist-1",
        name: "Related Artist 1",
        genres: ["rock", "alternative"],
        external_urls: {
          spotify: "https://open.spotify.com/artist/related-artist-1",
        },
        images: [
          { url: "https://i.scdn.co/image/related1", width: 640, height: 640 },
        ],
        followers: { total: 500000 },
        popularity: 75,
      };
      const mockRelatedArtist2 = {
        id: "related-artist-2",
        name: "Related Artist 2",
        genres: ["indie", "rock"],
        external_urls: {
          spotify: "https://open.spotify.com/artist/related-artist-2",
        },
        images: [
          { url: "https://i.scdn.co/image/related2", width: 640, height: 640 },
        ],
        followers: { total: 300000 },
        popularity: 68,
      };

      const relatedArtistsMock = mock(async () => ({
        artists: [mockRelatedArtist1, mockRelatedArtist2],
      }));

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
        artists: {
          relatedArtists: relatedArtistsMock,
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

      // When: getRelatedArtists(artistId) is called
      const result = await adapter.getRelatedArtists("seed-artist-id");

      // Then: Returns array of Artist objects (up to 20)
      expect(result).toBeArray();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeObject();
      expect(result[0].id).toBe("related-artist-1");
      expect(result[0].name).toBe("Related Artist 1");
      expect(result[0].externalUrl).toBe(
        "https://open.spotify.com/artist/related-artist-1",
      );
      expect(result[1].id).toBe("related-artist-2");
      expect(result[1].name).toBe("Related Artist 2");

      // Verify SDK was called with correct artistId
      expect(relatedArtistsMock).toHaveBeenCalledTimes(1);
      expect(relatedArtistsMock).toHaveBeenCalledWith("seed-artist-id");
    });

    test("should return up to 20 Artist objects", async () => {
      // Given: Valid adapter with authentication and 20 related artists
      const mockRelatedArtists = Array.from({ length: 20 }, (_, i) => ({
        id: `related-artist-${i + 1}`,
        name: `Related Artist ${i + 1}`,
        genres: ["rock"],
        external_urls: {
          spotify: `https://open.spotify.com/artist/related-artist-${i + 1}`,
        },
        images: [],
        followers: { total: 100000 },
        popularity: 50,
      }));

      const relatedArtistsMock = mock(async () => ({
        artists: mockRelatedArtists,
      }));

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
        artists: {
          relatedArtists: relatedArtistsMock,
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

      // When: getRelatedArtists is called
      const result = await adapter.getRelatedArtists("seed-artist-id");

      // Then: Returns up to 20 Artist objects
      expect(result).toBeArray();
      expect(result).toHaveLength(20);
    });

    test("should return empty array when no related artists found", async () => {
      // Given: Valid adapter with authentication, artist has no related artists
      const relatedArtistsMock = mock(async () => ({
        artists: [],
      }));

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
        artists: {
          relatedArtists: relatedArtistsMock,
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

      // When: getRelatedArtists is called for artist with no related artists
      const result = await adapter.getRelatedArtists("obscure-artist-id");

      // Then: Returns empty array
      expect(result).toBeArray();
      expect(result).toHaveLength(0);
    });

    test("should throw NotFoundError when artist does not exist", async () => {
      // Given: Valid adapter with authentication, invalid artist ID
      const relatedArtistsMock = mock(async () => {
        const error = new Error("Not found") as Error & { status: number };
        error.status = 404;
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
        artists: {
          relatedArtists: relatedArtistsMock,
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

      // When: getRelatedArtists is called with invalid artist ID
      // Then: NotFoundError is thrown
      await expect(
        adapter.getRelatedArtists("non-existent-artist-id"),
      ).rejects.toThrow(NotFoundError);
    });

    test("should throw AuthenticationError when not authenticated", async () => {
      // Given: Adapter with invalid/expired authentication
      const relatedArtistsMock = mock(async () => {
        const error = new Error("Unauthorized") as Error & { status: number };
        error.status = 401;
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
        artists: {
          relatedArtists: relatedArtistsMock,
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

      // When: getRelatedArtists is called without valid authentication
      // Then: AuthenticationError is thrown
      await expect(adapter.getRelatedArtists("some-artist-id")).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should throw RateLimitError when rate limit is exceeded", async () => {
      // Given: Rate limit exceeded
      const relatedArtistsMock = mock(async () => {
        const error = new Error("Rate limit exceeded") as Error & {
          status: number;
          headers?: Record<string, string>;
        };
        error.status = 429;
        error.headers = { "retry-after": "30" };
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
        artists: {
          relatedArtists: relatedArtistsMock,
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

      // When: getRelatedArtists is called and rate limit is exceeded
      // Then: RateLimitError is thrown with retryAfter value
      try {
        await adapter.getRelatedArtists("some-artist-id");
        throw new Error("Expected RateLimitError");
      } catch (err) {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).retryAfter).toBe(30);
      }
    });

    test("should throw NetworkError when network error occurs", async () => {
      // Given: Network error occurs
      const relatedArtistsMock = mock(async () => {
        throw new Error("Network error");
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
        artists: {
          relatedArtists: relatedArtistsMock,
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

      // When: getRelatedArtists is called and network error occurs
      // Then: NetworkError is thrown
      await expect(adapter.getRelatedArtists("some-artist-id")).rejects.toThrow(
        NetworkError,
      );
    });
  });
});

// CH-029: Get New Releases
describe("getNewReleases", () => {
  describe("AC-042: Get New Releases [CH-029]", () => {
    test("should return PaginatedResult<Album> with new album releases when called without options", async () => {
      // Given: Valid adapter with authentication
      const mockAlbum1 = {
        id: "new-album-1",
        name: "New Release 1",
        release_date: "2025-12-20",
        total_tracks: 12,
        external_urls: {
          spotify: "https://open.spotify.com/album/new-album-1",
        },
        artists: [
          {
            id: "artist-1",
            name: "Artist One",
            external_urls: {
              spotify: "https://open.spotify.com/artist/artist-1",
            },
          },
        ],
        images: [
          { url: "https://i.scdn.co/image/new1", width: 640, height: 640 },
        ],
      };

      const mockAlbum2 = {
        id: "new-album-2",
        name: "New Release 2",
        release_date: "2025-12-19",
        total_tracks: 10,
        external_urls: {
          spotify: "https://open.spotify.com/album/new-album-2",
        },
        artists: [
          {
            id: "artist-2",
            name: "Artist Two",
            external_urls: {
              spotify: "https://open.spotify.com/artist/artist-2",
            },
          },
        ],
        images: [
          { url: "https://i.scdn.co/image/new2", width: 640, height: 640 },
        ],
      };

      const getNewReleasesMock = mock(async () => ({
        albums: {
          items: [mockAlbum1, mockAlbum2],
          total: 50,
          limit: 20,
          offset: 0,
          next: "https://api.spotify.com/v1/browse/new-releases?offset=20",
          previous: null,
          href: "https://api.spotify.com/v1/browse/new-releases",
        },
      }));

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
        browse: {
          getNewReleases: getNewReleasesMock,
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

      // When: getNewReleases() is called
      const result = await adapter.getNewReleases();

      // Then: Returns PaginatedResult<Album> with new album releases
      expect(result).toBeObject();
      expect(result.items).toBeArray();
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(50);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.hasNext).toBe(true); // 0 + 2 < 50

      // Verify album structure
      expect(result.items[0].id).toBe("new-album-1");
      expect(result.items[0].name).toBe("New Release 1");
      expect(result.items[0].releaseDate).toBe("2025-12-20");
      expect(result.items[0].totalTracks).toBe(12);
      expect(result.items[0].externalUrl).toBe(
        "https://open.spotify.com/album/new-album-1",
      );

      expect(result.items[1].id).toBe("new-album-2");
      expect(result.items[1].name).toBe("New Release 2");

      // Verify SDK was called
      expect(getNewReleasesMock).toHaveBeenCalledTimes(1);
    });

    test("should return empty items array when no new releases available", async () => {
      // Given: Valid adapter with authentication, no new releases
      const getNewReleasesMock = mock(async () => ({
        albums: {
          items: [],
          total: 0,
          limit: 20,
          offset: 0,
          next: null,
          previous: null,
          href: "https://api.spotify.com/v1/browse/new-releases",
        },
      }));

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
        browse: {
          getNewReleases: getNewReleasesMock,
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

      // When: getNewReleases() is called
      const result = await adapter.getNewReleases();

      // Then: Returns empty PaginatedResult
      expect(result.items).toBeArray();
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasNext).toBe(false);
    });

    test("should correctly pass limit option to SDK", async () => {
      // Given: Valid adapter with authentication
      const mockAlbums = Array.from({ length: 10 }, (_, i) => ({
        id: `album-${i}`,
        name: `Album ${i}`,
        release_date: "2025-12-20",
        total_tracks: 10,
        external_urls: {
          spotify: `https://open.spotify.com/album/album-${i}`,
        },
        artists: [
          {
            id: "artist-1",
            name: "Artist",
            external_urls: {
              spotify: "https://open.spotify.com/artist/artist-1",
            },
          },
        ],
        images: [],
      }));

      const getNewReleasesMock = mock(
        async (country?: string, limit?: number, offset?: number) => ({
          albums: {
            items: mockAlbums,
            total: 100,
            limit: limit || 20,
            offset: offset || 0,
            next: "https://api.spotify.com/v1/browse/new-releases?offset=10",
            previous: null,
            href: "https://api.spotify.com/v1/browse/new-releases",
          },
        }),
      );

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
        browse: {
          getNewReleases: getNewReleasesMock,
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

      // When: getNewReleases({ limit: 10 }) is called
      const result = await adapter.getNewReleases({ limit: 10 });

      // Then: Returns results with limit 10
      expect(result.limit).toBe(10);
      expect(result.items).toHaveLength(10);
      expect(result.total).toBe(100);
      expect(getNewReleasesMock).toHaveBeenCalled();
    });

    test("should correctly pass offset option to SDK", async () => {
      // Given: Valid adapter with authentication
      const mockAlbums = Array.from({ length: 5 }, (_, i) => ({
        id: `album-${i + 20}`,
        name: `Album ${i + 20}`,
        release_date: "2025-12-20",
        total_tracks: 10,
        external_urls: {
          spotify: `https://open.spotify.com/album/album-${i + 20}`,
        },
        artists: [
          {
            id: "artist-1",
            name: "Artist",
            external_urls: {
              spotify: "https://open.spotify.com/artist/artist-1",
            },
          },
        ],
        images: [],
      }));

      const getNewReleasesMock = mock(
        async (country?: string, limit?: number, offset?: number) => ({
          albums: {
            items: mockAlbums,
            total: 100,
            limit: limit || 20,
            offset: offset || 0,
            next: "https://api.spotify.com/v1/browse/new-releases?offset=40",
            previous: "https://api.spotify.com/v1/browse/new-releases?offset=0",
            href: "https://api.spotify.com/v1/browse/new-releases",
          },
        }),
      );

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
        browse: {
          getNewReleases: getNewReleasesMock,
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

      // When: getNewReleases({ offset: 20 }) is called
      const result = await adapter.getNewReleases({ offset: 20 });

      // Then: Returns results starting from offset 20
      expect(result.offset).toBe(20);
      expect(result.items).toHaveLength(5);
      expect(getNewReleasesMock).toHaveBeenCalled();
    });

    test("should return hasNext=true when more releases are available", async () => {
      // Given: Valid adapter with authentication, more releases available
      const mockAlbums = Array.from({ length: 20 }, (_, i) => ({
        id: `album-${i}`,
        name: `Album ${i}`,
        release_date: "2025-12-20",
        total_tracks: 10,
        external_urls: {
          spotify: `https://open.spotify.com/album/album-${i}`,
        },
        artists: [
          {
            id: "artist-1",
            name: "Artist",
            external_urls: {
              spotify: "https://open.spotify.com/artist/artist-1",
            },
          },
        ],
        images: [],
      }));

      const getNewReleasesMock = mock(async () => ({
        albums: {
          items: mockAlbums,
          total: 100,
          limit: 20,
          offset: 40,
          next: "https://api.spotify.com/v1/browse/new-releases?offset=60",
          previous: "https://api.spotify.com/v1/browse/new-releases?offset=20",
          href: "https://api.spotify.com/v1/browse/new-releases",
        },
      }));

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
        browse: {
          getNewReleases: getNewReleasesMock,
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

      // When: getNewReleases() is called
      const result = await adapter.getNewReleases({
        limit: 20,
        offset: 40,
      });

      // Then: hasNext is true because offset (40) + items.length (20) = 60 < total (100)
      expect(result.hasNext).toBe(true);
      expect(result.offset).toBe(40);
      expect(result.total).toBe(100);
    });

    test("should return hasNext=false when at the end", async () => {
      // Given: Valid adapter with authentication, at the last page
      const mockAlbums = Array.from({ length: 10 }, (_, i) => ({
        id: `album-${i + 90}`,
        name: `Album ${i + 90}`,
        release_date: "2025-12-20",
        total_tracks: 10,
        external_urls: {
          spotify: `https://open.spotify.com/album/album-${i + 90}`,
        },
        artists: [
          {
            id: "artist-1",
            name: "Artist",
            external_urls: {
              spotify: "https://open.spotify.com/artist/artist-1",
            },
          },
        ],
        images: [],
      }));

      const getNewReleasesMock = mock(async () => ({
        albums: {
          items: mockAlbums,
          total: 100,
          limit: 20,
          offset: 90,
          next: null,
          previous: "https://api.spotify.com/v1/browse/new-releases?offset=70",
          href: "https://api.spotify.com/v1/browse/new-releases",
        },
      }));

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
        browse: {
          getNewReleases: getNewReleasesMock,
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

      // When: getNewReleases() is called at the last page
      const result = await adapter.getNewReleases({
        limit: 20,
        offset: 90,
      });

      // Then: hasNext is false because offset (90) + items.length (10) = 100 >= total (100)
      expect(result.hasNext).toBe(false);
      expect(result.offset).toBe(90);
      expect(result.total).toBe(100);
    });

    test("should throw AuthenticationError when not authenticated", async () => {
      // Given: Adapter with invalid/expired authentication
      const getNewReleasesMock = mock(async () => {
        const error = new Error("Unauthorized") as Error & { status: number };
        error.status = 401;
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
        browse: {
          getNewReleases: getNewReleasesMock,
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

      // When: getNewReleases is called without valid authentication
      // Then: AuthenticationError is thrown
      await expect(adapter.getNewReleases()).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should throw RateLimitError when rate limit is exceeded", async () => {
      // Given: Rate limit exceeded
      const getNewReleasesMock = mock(async () => {
        const error = new Error("Rate limit exceeded") as Error & {
          status: number;
          headers?: Record<string, string>;
        };
        error.status = 429;
        error.headers = { "retry-after": "30" };
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
        browse: {
          getNewReleases: getNewReleasesMock,
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

      // When: getNewReleases is called and rate limit is exceeded
      // Then: RateLimitError is thrown with retryAfter value
      try {
        await adapter.getNewReleases();
        throw new Error("Expected RateLimitError");
      } catch (err) {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).retryAfter).toBe(30);
      }
    });

    test("should throw NetworkError when network error occurs", async () => {
      // Given: Network error occurs
      const getNewReleasesMock = mock(async () => {
        throw new Error("Network error");
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
        browse: {
          getNewReleases: getNewReleasesMock,
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

      // When: getNewReleases is called and network error occurs
      // Then: NetworkError is thrown
      await expect(adapter.getNewReleases()).rejects.toThrow(NetworkError);
    });
  });
});

// CH-030: Get Recently Played
describe("getRecentlyPlayed", () => {
  describe("AC-043: Get Recently Played [CH-030]", () => {
    test("should return PaginatedResult<RecentlyPlayedItem> with play history when called without options", async () => {
      // Given: Valid adapter with user authentication
      const mockPlayedAt1 = "2025-12-21T10:30:00.000Z";
      const mockPlayedAt2 = "2025-12-21T10:25:00.000Z";

      const mockTrack1 = {
        id: "track-1",
        name: "Recently Played Track 1",
        duration_ms: 210000,
        preview_url: "https://p.scdn.co/mp3-preview/track1",
        external_urls: {
          spotify: "https://open.spotify.com/track/track-1",
        },
        artists: [
          {
            id: "artist-1",
            name: "Artist One",
            external_urls: {
              spotify: "https://open.spotify.com/artist/artist-1",
            },
          },
        ],
        album: {
          id: "album-1",
          name: "Album One",
          release_date: "2025-01-01",
          total_tracks: 12,
          images: [
            { url: "https://i.scdn.co/image/album1", width: 640, height: 640 },
          ],
          external_urls: {
            spotify: "https://open.spotify.com/album/album-1",
          },
          artists: [
            {
              id: "artist-1",
              name: "Artist One",
              external_urls: {
                spotify: "https://open.spotify.com/artist/artist-1",
              },
            },
          ],
        },
      };

      const mockTrack2 = {
        id: "track-2",
        name: "Recently Played Track 2",
        duration_ms: 180000,
        preview_url: "https://p.scdn.co/mp3-preview/track2",
        external_urls: {
          spotify: "https://open.spotify.com/track/track-2",
        },
        artists: [
          {
            id: "artist-2",
            name: "Artist Two",
            external_urls: {
              spotify: "https://open.spotify.com/artist/artist-2",
            },
          },
        ],
        album: {
          id: "album-2",
          name: "Album Two",
          release_date: "2025-02-01",
          total_tracks: 10,
          images: [
            { url: "https://i.scdn.co/image/album2", width: 640, height: 640 },
          ],
          external_urls: {
            spotify: "https://open.spotify.com/album/album-2",
          },
          artists: [
            {
              id: "artist-2",
              name: "Artist Two",
              external_urls: {
                spotify: "https://open.spotify.com/artist/artist-2",
              },
            },
          ],
        },
      };

      const getRecentlyPlayedMock = mock(async () => ({
        items: [
          { track: mockTrack1, played_at: mockPlayedAt1, context: null },
          { track: mockTrack2, played_at: mockPlayedAt2, context: null },
        ],
        total: 50,
        limit: 20,
        next: "https://api.spotify.com/v1/me/player/recently-played?limit=20&before=12345",
        cursors: {
          after: "12345",
          before: "67890",
        },
        href: "https://api.spotify.com/v1/me/player/recently-played",
      }));

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
          getRecentlyPlayedTracks: getRecentlyPlayedMock,
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
        scopes: ["user-read-recently-played"],
      });

      // When: getRecentlyPlayed() is called
      const result = await adapter.getRecentlyPlayed();

      // Then: Returns PaginatedResult<RecentlyPlayedItem> with play history
      expect(result).toBeObject();
      expect(result.items).toBeArray();
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(50);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.hasNext).toBe(true); // 0 + 2 < 50

      // Verify RecentlyPlayedItem structure - each item includes track and playedAt
      expect(result.items[0].track).toBeDefined();
      expect(result.items[0].track.id).toBe("track-1");
      expect(result.items[0].track.name).toBe("Recently Played Track 1");
      expect(result.items[0].playedAt).toBe(mockPlayedAt1);

      expect(result.items[1].track).toBeDefined();
      expect(result.items[1].track.id).toBe("track-2");
      expect(result.items[1].track.name).toBe("Recently Played Track 2");
      expect(result.items[1].playedAt).toBe(mockPlayedAt2);

      // Verify SDK was called
      expect(getRecentlyPlayedMock).toHaveBeenCalledTimes(1);
    });

    test("should return empty items array when no recently played tracks", async () => {
      // Given: Valid adapter with authentication, no recently played tracks
      const getRecentlyPlayedMock = mock(async () => ({
        items: [],
        total: 0,
        limit: 20,
        next: null,
        cursors: null,
        href: "https://api.spotify.com/v1/me/player/recently-played",
      }));

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
          getRecentlyPlayedTracks: getRecentlyPlayedMock,
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
        scopes: ["user-read-recently-played"],
      });

      // When: getRecentlyPlayed() is called
      const result = await adapter.getRecentlyPlayed();

      // Then: Returns empty PaginatedResult
      expect(result.items).toBeArray();
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasNext).toBe(false);
    });

    test("should correctly pass limit option to SDK", async () => {
      // Given: Valid adapter with authentication
      const mockItems = Array.from({ length: 10 }, (_, i) => ({
        track: {
          id: `track-${i}`,
          name: `Track ${i}`,
          duration_ms: 200000,
          preview_url: null,
          external_urls: {
            spotify: `https://open.spotify.com/track/track-${i}`,
          },
          artists: [
            {
              id: "artist-1",
              name: "Artist",
              external_urls: {
                spotify: "https://open.spotify.com/artist/artist-1",
              },
            },
          ],
          album: {
            id: "album-1",
            name: "Album",
            release_date: "2025-01-01",
            total_tracks: 10,
            images: [],
            external_urls: {
              spotify: "https://open.spotify.com/album/album-1",
            },
            artists: [
              {
                id: "artist-1",
                name: "Artist",
                external_urls: {
                  spotify: "https://open.spotify.com/artist/artist-1",
                },
              },
            ],
          },
        },
        played_at: `2025-12-21T10:${30 - i}:00.000Z`,
        context: null,
      }));

      const getRecentlyPlayedMock = mock(async (limit?: number) => ({
        items: mockItems.slice(0, limit ?? 20),
        total: 100,
        limit: limit ?? 20,
        next: "https://api.spotify.com/v1/me/player/recently-played?limit=10&before=12345",
        cursors: {
          after: "12345",
          before: "67890",
        },
        href: "https://api.spotify.com/v1/me/player/recently-played",
      }));

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
          getRecentlyPlayedTracks: getRecentlyPlayedMock,
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
        scopes: ["user-read-recently-played"],
      });

      // When: getRecentlyPlayed({ limit: 10 }) is called
      const result = await adapter.getRecentlyPlayed({ limit: 10 });

      // Then: Returns 10 items
      expect(result.items).toHaveLength(10);
      expect(result.limit).toBe(10);
      expect(getRecentlyPlayedMock).toHaveBeenCalled();
    });

    test("should handle hasNext correctly when at last page", async () => {
      // Given: Valid adapter with authentication, at last page
      const mockItems = [
        {
          track: {
            id: "track-1",
            name: "Track 1",
            duration_ms: 200000,
            preview_url: null,
            external_urls: {
              spotify: "https://open.spotify.com/track/track-1",
            },
            artists: [
              {
                id: "artist-1",
                name: "Artist",
                external_urls: {
                  spotify: "https://open.spotify.com/artist/artist-1",
                },
              },
            ],
            album: {
              id: "album-1",
              name: "Album",
              release_date: "2025-01-01",
              total_tracks: 10,
              images: [],
              external_urls: {
                spotify: "https://open.spotify.com/album/album-1",
              },
              artists: [
                {
                  id: "artist-1",
                  name: "Artist",
                  external_urls: {
                    spotify: "https://open.spotify.com/artist/artist-1",
                  },
                },
              ],
            },
          },
          played_at: "2025-12-21T10:30:00.000Z",
          context: null,
        },
      ];

      const getRecentlyPlayedMock = mock(async () => ({
        items: mockItems,
        total: 1,
        limit: 20,
        next: null,
        cursors: null,
        href: "https://api.spotify.com/v1/me/player/recently-played",
      }));

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
          getRecentlyPlayedTracks: getRecentlyPlayedMock,
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
        scopes: ["user-read-recently-played"],
      });

      // When: getRecentlyPlayed() is called at the last page
      const result = await adapter.getRecentlyPlayed();

      // Then: hasNext should be false
      expect(result.hasNext).toBe(false);
    });

    test("should throw AuthenticationError when authentication fails", async () => {
      // Given: Invalid authentication
      const getRecentlyPlayedMock = mock(async () => {
        const error = new Error("Unauthorized") as Error & { status: number };
        error.status = 401;
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
          getRecentlyPlayedTracks: getRecentlyPlayedMock,
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
        scopes: ["user-read-recently-played"],
      });

      // When: getRecentlyPlayed is called without valid authentication
      // Then: AuthenticationError is thrown
      await expect(adapter.getRecentlyPlayed()).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should throw RateLimitError when rate limit is exceeded", async () => {
      // Given: Rate limit exceeded response
      const getRecentlyPlayedMock = mock(async () => {
        const error = new Error("Rate limit exceeded") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 429;
        error.headers = { "retry-after": "30" };
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
          getRecentlyPlayedTracks: getRecentlyPlayedMock,
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
        scopes: ["user-read-recently-played"],
      });

      // When: getRecentlyPlayed is called and rate limit is exceeded
      // Then: RateLimitError is thrown with correct retryAfter value
      try {
        await adapter.getRecentlyPlayed();
        expect.unreachable("Should have thrown RateLimitError");
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).retryAfter).toBe(30);
      }
    });

    test("should throw NetworkError when network error occurs", async () => {
      // Given: Network error
      const getRecentlyPlayedMock = mock(async () => {
        throw new Error("Network error: connection refused");
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
          getRecentlyPlayedTracks: getRecentlyPlayedMock,
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
        scopes: ["user-read-recently-played"],
      });

      // When: getRecentlyPlayed is called and network error occurs
      // Then: NetworkError is thrown
      await expect(adapter.getRecentlyPlayed()).rejects.toThrow(NetworkError);
    });
  });
});

describe("getTopTracks", () => {
  describe("AC-044: Get Top Tracks [CH-031]", () => {
    test("should return PaginatedResult<Track> with user's top tracks when called without options", async () => {
      // Given: Valid adapter with user authentication
      const mockTrack1 = {
        id: "top-track-1",
        name: "Top Track One",
        duration_ms: 240000,
        preview_url: "https://p.scdn.co/mp3-preview/top1",
        external_urls: {
          spotify: "https://open.spotify.com/track/top-track-1",
        },
        artists: [
          {
            id: "artist-1",
            name: "Artist One",
            external_urls: {
              spotify: "https://open.spotify.com/artist/artist-1",
            },
          },
        ],
        album: {
          id: "album-1",
          name: "Album One",
          release_date: "2025-01-15",
          total_tracks: 12,
          images: [
            { url: "https://i.scdn.co/image/album1", width: 640, height: 640 },
          ],
          external_urls: {
            spotify: "https://open.spotify.com/album/album-1",
          },
          artists: [
            {
              id: "artist-1",
              name: "Artist One",
              external_urls: {
                spotify: "https://open.spotify.com/artist/artist-1",
              },
            },
          ],
        },
      };

      const mockTrack2 = {
        id: "top-track-2",
        name: "Top Track Two",
        duration_ms: 195000,
        preview_url: null,
        external_urls: {
          spotify: "https://open.spotify.com/track/top-track-2",
        },
        artists: [
          {
            id: "artist-2",
            name: "Artist Two",
            external_urls: {
              spotify: "https://open.spotify.com/artist/artist-2",
            },
          },
        ],
        album: {
          id: "album-2",
          name: "Album Two",
          release_date: "2024-06-01",
          total_tracks: 8,
          images: [
            { url: "https://i.scdn.co/image/album2", width: 640, height: 640 },
          ],
          external_urls: {
            spotify: "https://open.spotify.com/album/album-2",
          },
          artists: [
            {
              id: "artist-2",
              name: "Artist Two",
              external_urls: {
                spotify: "https://open.spotify.com/artist/artist-2",
              },
            },
          ],
        },
      };

      const topItemsMock = mock(
        async (
          type: string,
          timeRange?: string,
          limit?: number,
          offset?: number,
        ) => ({
          items: [mockTrack1, mockTrack2],
          total: 50,
          limit: limit ?? 20,
          offset: offset ?? 0,
          href: "https://api.spotify.com/v1/me/top/tracks",
          next: "https://api.spotify.com/v1/me/top/tracks?offset=20",
          previous: null,
        }),
      );

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          topItems: topItemsMock,
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
        scopes: ["user-top-read"],
      });

      // When: getTopTracks() is called
      const result = await adapter.getTopTracks();

      // Then: Returns PaginatedResult<Track> with user's top tracks
      expect(result).toBeObject();
      expect(result.items).toBeArray();
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(50);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.hasNext).toBe(true); // 0 + 2 < 50

      // Verify Track structure
      expect(result.items[0].id).toBe("top-track-1");
      expect(result.items[0].name).toBe("Top Track One");
      expect(result.items[0].durationMs).toBe(240000);
      expect(result.items[0].artists).toHaveLength(1);
      expect(result.items[0].artists[0].name).toBe("Artist One");
      expect(result.items[0].album.name).toBe("Album One");

      expect(result.items[1].id).toBe("top-track-2");
      expect(result.items[1].name).toBe("Top Track Two");
      expect(result.items[1].previewUrl).toBeNull();

      // Verify SDK was called with correct parameters (tracks type, default timeRange)
      expect(topItemsMock).toHaveBeenCalledTimes(1);
      expect(topItemsMock).toHaveBeenCalledWith("tracks", "medium_term", 20, 0);
    });

    test("should return empty items array when user has no top tracks", async () => {
      // Given: Valid adapter with authentication, no top tracks
      const topItemsMock = mock(async () => ({
        items: [],
        total: 0,
        limit: 20,
        offset: 0,
        href: "https://api.spotify.com/v1/me/top/tracks",
        next: null,
        previous: null,
      }));

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          topItems: topItemsMock,
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
        scopes: ["user-top-read"],
      });

      // When: getTopTracks() is called
      const result = await adapter.getTopTracks();

      // Then: Returns empty PaginatedResult
      expect(result.items).toBeArray();
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasNext).toBe(false);
    });

    test("should correctly pass limit and offset options to SDK", async () => {
      // Given: Valid adapter with authentication
      const mockTracks = Array.from({ length: 10 }, (_, i) => ({
        id: `track-${i}`,
        name: `Track ${i}`,
        duration_ms: 200000,
        preview_url: null,
        external_urls: {
          spotify: `https://open.spotify.com/track/track-${i}`,
        },
        artists: [
          {
            id: "artist-1",
            name: "Artist",
            external_urls: {
              spotify: "https://open.spotify.com/artist/artist-1",
            },
          },
        ],
        album: {
          id: "album-1",
          name: "Album",
          release_date: "2025-01-01",
          total_tracks: 10,
          images: [],
          external_urls: {
            spotify: "https://open.spotify.com/album/album-1",
          },
          artists: [
            {
              id: "artist-1",
              name: "Artist",
              external_urls: {
                spotify: "https://open.spotify.com/artist/artist-1",
              },
            },
          ],
        },
      }));

      const topItemsMock = mock(
        async (
          type: string,
          timeRange?: string,
          limit?: number,
          offset?: number,
        ) => ({
          items: mockTracks.slice(0, limit ?? 20),
          total: 100,
          limit: limit ?? 20,
          offset: offset ?? 0,
          href: "https://api.spotify.com/v1/me/top/tracks",
          next: "https://api.spotify.com/v1/me/top/tracks?offset=30",
          previous: null,
        }),
      );

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          topItems: topItemsMock,
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
        scopes: ["user-top-read"],
      });

      // When: getTopTracks({ limit: 10, offset: 20 }) is called
      const result = await adapter.getTopTracks({ limit: 10, offset: 20 });

      // Then: Returns correct items and SDK was called with correct parameters
      expect(result.items).toHaveLength(10);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(20);
      expect(topItemsMock).toHaveBeenCalledWith(
        "tracks",
        "medium_term",
        10,
        20,
      );
    });

    test("should set hasNext to false when at last page", async () => {
      // Given: Valid adapter at the last page of results
      const mockTracks = [
        {
          id: "track-last",
          name: "Last Track",
          duration_ms: 200000,
          preview_url: null,
          external_urls: {
            spotify: "https://open.spotify.com/track/track-last",
          },
          artists: [
            {
              id: "artist-1",
              name: "Artist",
              external_urls: {
                spotify: "https://open.spotify.com/artist/artist-1",
              },
            },
          ],
          album: {
            id: "album-1",
            name: "Album",
            release_date: "2025-01-01",
            total_tracks: 10,
            images: [],
            external_urls: {
              spotify: "https://open.spotify.com/album/album-1",
            },
            artists: [
              {
                id: "artist-1",
                name: "Artist",
                external_urls: {
                  spotify: "https://open.spotify.com/artist/artist-1",
                },
              },
            ],
          },
        },
      ];

      const topItemsMock = mock(async () => ({
        items: mockTracks,
        total: 21, // offset 20 + 1 item = 21 total, so no more after this
        limit: 20,
        offset: 20,
        href: "https://api.spotify.com/v1/me/top/tracks",
        next: null,
        previous: "https://api.spotify.com/v1/me/top/tracks?offset=0",
      }));

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          topItems: topItemsMock,
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
        scopes: ["user-top-read"],
      });

      // When: getTopTracks({ offset: 20 }) is called at the last page
      const result = await adapter.getTopTracks({ offset: 20 });

      // Then: hasNext should be false
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(21);
      expect(result.offset).toBe(20);
      expect(result.hasNext).toBe(false); // 20 + 1 >= 21
    });
  });

  describe("AC-045: Get Top Tracks - Time Range [CH-031]", () => {
    test("should pass short_term time range to SDK when specified", async () => {
      // Given: Valid adapter with authentication
      const mockTrack = {
        id: "recent-track",
        name: "Recent Track",
        duration_ms: 200000,
        preview_url: null,
        external_urls: {
          spotify: "https://open.spotify.com/track/recent-track",
        },
        artists: [
          {
            id: "artist-1",
            name: "Artist",
            external_urls: {
              spotify: "https://open.spotify.com/artist/artist-1",
            },
          },
        ],
        album: {
          id: "album-1",
          name: "Album",
          release_date: "2025-12-01",
          total_tracks: 10,
          images: [],
          external_urls: {
            spotify: "https://open.spotify.com/album/album-1",
          },
          artists: [
            {
              id: "artist-1",
              name: "Artist",
              external_urls: {
                spotify: "https://open.spotify.com/artist/artist-1",
              },
            },
          ],
        },
      };

      const topItemsMock = mock(
        async (
          type: string,
          timeRange?: string,
          limit?: number,
          offset?: number,
        ) => ({
          items: [mockTrack],
          total: 1,
          limit: limit ?? 20,
          offset: offset ?? 0,
          href: "https://api.spotify.com/v1/me/top/tracks",
          next: null,
          previous: null,
        }),
      );

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          topItems: topItemsMock,
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
        scopes: ["user-top-read"],
      });

      // When: getTopTracks({ timeRange: "short_term" }) is called
      const result = await adapter.getTopTracks({ timeRange: "short_term" });

      // Then: SDK was called with short_term time range (approximately last 4 weeks)
      expect(result.items).toHaveLength(1);
      expect(topItemsMock).toHaveBeenCalledWith("tracks", "short_term", 20, 0);
    });

    test("should pass long_term time range to SDK when specified", async () => {
      // Given: Valid adapter with authentication
      const topItemsMock = mock(
        async (
          type: string,
          timeRange?: string,
          limit?: number,
          offset?: number,
        ) => ({
          items: [],
          total: 0,
          limit: limit ?? 20,
          offset: offset ?? 0,
          href: "https://api.spotify.com/v1/me/top/tracks",
          next: null,
          previous: null,
        }),
      );

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          topItems: topItemsMock,
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
        scopes: ["user-top-read"],
      });

      // When: getTopTracks({ timeRange: "long_term" }) is called
      await adapter.getTopTracks({ timeRange: "long_term" });

      // Then: SDK was called with long_term time range
      expect(topItemsMock).toHaveBeenCalledWith("tracks", "long_term", 20, 0);
    });

    test("should use medium_term as default time range when not specified", async () => {
      // Given: Valid adapter with authentication
      const topItemsMock = mock(
        async (
          type: string,
          timeRange?: string,
          limit?: number,
          offset?: number,
        ) => ({
          items: [],
          total: 0,
          limit: limit ?? 20,
          offset: offset ?? 0,
          href: "https://api.spotify.com/v1/me/top/tracks",
          next: null,
          previous: null,
        }),
      );

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-123",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-123",
            },
          })),
          topItems: topItemsMock,
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
        scopes: ["user-top-read"],
      });

      // When: getTopTracks() is called without timeRange option
      await adapter.getTopTracks();

      // Then: SDK was called with medium_term as default time range
      expect(topItemsMock).toHaveBeenCalledWith("tracks", "medium_term", 20, 0);
    });
  });

  describe("Error Handling [CH-031]", () => {
    test("should throw AuthenticationError when user is not authenticated (401)", async () => {
      // Given: Valid adapter configuration
      const topItemsMock = mock(async () => {
        const error = new Error("Unauthorized") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 401;
        error.headers = {};
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
          topItems: topItemsMock,
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
        scopes: ["user-top-read"],
      });

      // When: getTopTracks is called without valid authentication
      // Then: AuthenticationError is thrown
      await expect(adapter.getTopTracks()).rejects.toThrow(AuthenticationError);
    });

    test("should throw RateLimitError when rate limit is exceeded (429)", async () => {
      // Given: Valid adapter configuration
      const topItemsMock = mock(async () => {
        const error = new Error("Too Many Requests") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 429;
        error.headers = { "retry-after": "30" };
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
          topItems: topItemsMock,
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
        scopes: ["user-top-read"],
      });

      // When: getTopTracks is called and rate limit is exceeded
      // Then: RateLimitError is thrown with retryAfter value
      try {
        await adapter.getTopTracks();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).retryAfter).toBe(30);
      }
    });

    test("should throw NetworkError when network error occurs", async () => {
      // Given: Valid adapter configuration
      const topItemsMock = mock(async () => {
        throw new Error("Network connection failed");
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
          topItems: topItemsMock,
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
        scopes: ["user-top-read"],
      });

      // When: getTopTracks is called and network error occurs
      // Then: NetworkError is thrown
      await expect(adapter.getTopTracks()).rejects.toThrow(NetworkError);
    });
  });

  // AC-046: Get Top Artists [CH-032]
  describe("getTopArtists", () => {
    describe("AC-046: Get Top Artists [CH-032]", () => {
      test("should return PaginatedResult<Artist> with user's top artists when called without options", async () => {
        // Given: Valid adapter with user authentication
        const mockArtist1 = {
          id: "top-artist-1",
          name: "Top Artist One",
          external_urls: {
            spotify: "https://open.spotify.com/artist/top-artist-1",
          },
          genres: ["rock", "alternative"],
          images: [
            { url: "https://i.scdn.co/image/artist1", width: 640, height: 640 },
          ],
          popularity: 85,
        };

        const mockArtist2 = {
          id: "top-artist-2",
          name: "Top Artist Two",
          external_urls: {
            spotify: "https://open.spotify.com/artist/top-artist-2",
          },
          genres: ["pop", "indie"],
          images: [
            { url: "https://i.scdn.co/image/artist2", width: 640, height: 640 },
          ],
          popularity: 78,
        };

        const topItemsMock = mock(
          async (
            type: string,
            timeRange?: string,
            limit?: number,
            offset?: number,
          ) => ({
            items: [mockArtist1, mockArtist2],
            total: 50,
            limit: limit ?? 20,
            offset: offset ?? 0,
            href: "https://api.spotify.com/v1/me/top/artists",
            next: "https://api.spotify.com/v1/me/top/artists?offset=20",
            previous: null,
          }),
        );

        const mockSdk = {
          currentUser: {
            profile: mock(async () => ({
              id: "user-123",
              display_name: "Test User",
              external_urls: {
                spotify: "https://open.spotify.com/user/user-123",
              },
            })),
            topItems: topItemsMock,
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
          scopes: ["user-top-read"],
        });

        // When: getTopArtists() is called
        const result = await adapter.getTopArtists();

        // Then: Returns PaginatedResult<Artist> with user's top artists
        expect(result).toBeObject();
        expect(result.items).toBeArray();
        expect(result.items).toHaveLength(2);
        expect(result.total).toBe(50);
        expect(result.limit).toBe(20);
        expect(result.offset).toBe(0);
        expect(result.hasNext).toBe(true); // 0 + 2 < 50

        // Verify Artist structure
        expect(result.items[0].id).toBe("top-artist-1");
        expect(result.items[0].name).toBe("Top Artist One");
        expect(result.items[0].externalUrl).toBe(
          "https://open.spotify.com/artist/top-artist-1",
        );

        expect(result.items[1].id).toBe("top-artist-2");
        expect(result.items[1].name).toBe("Top Artist Two");

        // Verify SDK was called with correct parameters (artists type, default timeRange)
        expect(topItemsMock).toHaveBeenCalledTimes(1);
        expect(topItemsMock).toHaveBeenCalledWith(
          "artists",
          "medium_term",
          20,
          0,
        );
      });

      test("should return empty items array when user has no top artists", async () => {
        // Given: Valid adapter with authentication, no top artists
        const topItemsMock = mock(async () => ({
          items: [],
          total: 0,
          limit: 20,
          offset: 0,
          href: "https://api.spotify.com/v1/me/top/artists",
          next: null,
          previous: null,
        }));

        const mockSdk = {
          currentUser: {
            profile: mock(async () => ({
              id: "user-123",
              display_name: "Test User",
              external_urls: {
                spotify: "https://open.spotify.com/user/user-123",
              },
            })),
            topItems: topItemsMock,
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
          scopes: ["user-top-read"],
        });

        // When: getTopArtists() is called
        const result = await adapter.getTopArtists();

        // Then: Returns empty PaginatedResult
        expect(result.items).toBeArray();
        expect(result.items).toHaveLength(0);
        expect(result.total).toBe(0);
        expect(result.hasNext).toBe(false);
      });

      test("should correctly pass limit and offset options to SDK", async () => {
        // Given: Valid adapter with authentication
        const mockArtists = Array.from({ length: 10 }, (_, i) => ({
          id: `artist-${i}`,
          name: `Artist ${i}`,
          external_urls: {
            spotify: `https://open.spotify.com/artist/artist-${i}`,
          },
          genres: ["rock"],
          images: [],
          popularity: 70,
        }));

        const topItemsMock = mock(
          async (
            type: string,
            timeRange?: string,
            limit?: number,
            offset?: number,
          ) => ({
            items: mockArtists.slice(0, limit ?? 20),
            total: 100,
            limit: limit ?? 20,
            offset: offset ?? 0,
            href: "https://api.spotify.com/v1/me/top/artists",
            next: "https://api.spotify.com/v1/me/top/artists?offset=30",
            previous: null,
          }),
        );

        const mockSdk = {
          currentUser: {
            profile: mock(async () => ({
              id: "user-123",
              display_name: "Test User",
              external_urls: {
                spotify: "https://open.spotify.com/user/user-123",
              },
            })),
            topItems: topItemsMock,
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
          scopes: ["user-top-read"],
        });

        // When: getTopArtists({ limit: 10, offset: 20 }) is called
        const result = await adapter.getTopArtists({ limit: 10, offset: 20 });

        // Then: Returns correct items and SDK was called with correct parameters
        expect(result.items).toHaveLength(10);
        expect(result.limit).toBe(10);
        expect(result.offset).toBe(20);
        expect(topItemsMock).toHaveBeenCalledWith(
          "artists",
          "medium_term",
          10,
          20,
        );
      });

      test("should set hasNext to false when at last page", async () => {
        // Given: Valid adapter at the last page of results
        const mockArtists = [
          {
            id: "artist-last",
            name: "Last Artist",
            external_urls: {
              spotify: "https://open.spotify.com/artist/artist-last",
            },
            genres: ["jazz"],
            images: [],
            popularity: 65,
          },
        ];

        const topItemsMock = mock(
          async (
            type: string,
            timeRange?: string,
            limit?: number,
            offset?: number,
          ) => ({
            items: mockArtists,
            total: 21, // offset=20, 1 item returned, total=21 -> hasNext=false
            limit: limit ?? 20,
            offset: offset ?? 0,
            href: "https://api.spotify.com/v1/me/top/artists",
            next: null,
            previous: "https://api.spotify.com/v1/me/top/artists?offset=0",
          }),
        );

        const mockSdk = {
          currentUser: {
            profile: mock(async () => ({
              id: "user-123",
              display_name: "Test User",
              external_urls: {
                spotify: "https://open.spotify.com/user/user-123",
              },
            })),
            topItems: topItemsMock,
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
          scopes: ["user-top-read"],
        });

        // When: getTopArtists({ offset: 20 }) is called (last page)
        const result = await adapter.getTopArtists({ offset: 20 });

        // Then: hasNext is false (20 + 1 = 21, not less than 21)
        expect(result.hasNext).toBe(false);
        expect(result.items).toHaveLength(1);
      });
    });

    describe("Time Range Tests [CH-032]", () => {
      test("should pass short_term time range to SDK when specified", async () => {
        // Given: Valid adapter with authentication
        const mockArtist = {
          id: "recent-artist",
          name: "Recent Artist",
          external_urls: {
            spotify: "https://open.spotify.com/artist/recent-artist",
          },
          genres: ["electronic"],
          images: [],
          popularity: 80,
        };

        const topItemsMock = mock(
          async (
            type: string,
            timeRange?: string,
            limit?: number,
            offset?: number,
          ) => ({
            items: [mockArtist],
            total: 1,
            limit: limit ?? 20,
            offset: offset ?? 0,
            href: "https://api.spotify.com/v1/me/top/artists",
            next: null,
            previous: null,
          }),
        );

        const mockSdk = {
          currentUser: {
            profile: mock(async () => ({
              id: "user-123",
              display_name: "Test User",
              external_urls: {
                spotify: "https://open.spotify.com/user/user-123",
              },
            })),
            topItems: topItemsMock,
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
          scopes: ["user-top-read"],
        });

        // When: getTopArtists({ timeRange: "short_term" }) is called
        const result = await adapter.getTopArtists({ timeRange: "short_term" });

        // Then: SDK was called with short_term time range (approximately last 4 weeks)
        expect(result.items).toHaveLength(1);
        expect(topItemsMock).toHaveBeenCalledWith(
          "artists",
          "short_term",
          20,
          0,
        );
      });

      test("should pass long_term time range to SDK when specified", async () => {
        // Given: Valid adapter with authentication
        const topItemsMock = mock(
          async (
            type: string,
            timeRange?: string,
            limit?: number,
            offset?: number,
          ) => ({
            items: [],
            total: 0,
            limit: limit ?? 20,
            offset: offset ?? 0,
            href: "https://api.spotify.com/v1/me/top/artists",
            next: null,
            previous: null,
          }),
        );

        const mockSdk = {
          currentUser: {
            profile: mock(async () => ({
              id: "user-123",
              display_name: "Test User",
              external_urls: {
                spotify: "https://open.spotify.com/user/user-123",
              },
            })),
            topItems: topItemsMock,
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
          scopes: ["user-top-read"],
        });

        // When: getTopArtists({ timeRange: "long_term" }) is called
        await adapter.getTopArtists({ timeRange: "long_term" });

        // Then: SDK was called with long_term time range
        expect(topItemsMock).toHaveBeenCalledWith(
          "artists",
          "long_term",
          20,
          0,
        );
      });

      test("should use medium_term as default time range when not specified", async () => {
        // Given: Valid adapter with authentication
        const topItemsMock = mock(
          async (
            type: string,
            timeRange?: string,
            limit?: number,
            offset?: number,
          ) => ({
            items: [],
            total: 0,
            limit: limit ?? 20,
            offset: offset ?? 0,
            href: "https://api.spotify.com/v1/me/top/artists",
            next: null,
            previous: null,
          }),
        );

        const mockSdk = {
          currentUser: {
            profile: mock(async () => ({
              id: "user-123",
              display_name: "Test User",
              external_urls: {
                spotify: "https://open.spotify.com/user/user-123",
              },
            })),
            topItems: topItemsMock,
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
          scopes: ["user-top-read"],
        });

        // When: getTopArtists() is called without timeRange option
        await adapter.getTopArtists();

        // Then: SDK was called with medium_term as default time range
        expect(topItemsMock).toHaveBeenCalledWith(
          "artists",
          "medium_term",
          20,
          0,
        );
      });
    });

    describe("Error Handling [CH-032]", () => {
      test("should throw AuthenticationError when user is not authenticated (401)", async () => {
        // Given: Valid adapter configuration
        const topItemsMock = mock(async () => {
          const error = new Error("Unauthorized") as Error & {
            status: number;
            headers: Record<string, string>;
          };
          error.status = 401;
          error.headers = {};
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
            topItems: topItemsMock,
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
          scopes: ["user-top-read"],
        });

        // When: getTopArtists is called without valid authentication
        // Then: AuthenticationError is thrown
        await expect(adapter.getTopArtists()).rejects.toThrow(
          AuthenticationError,
        );
      });

      test("should throw RateLimitError when rate limit is exceeded (429)", async () => {
        // Given: Valid adapter configuration
        const topItemsMock = mock(async () => {
          const error = new Error("Too Many Requests") as Error & {
            status: number;
            headers: Record<string, string>;
          };
          error.status = 429;
          error.headers = { "retry-after": "30" };
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
            topItems: topItemsMock,
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
          scopes: ["user-top-read"],
        });

        // When: getTopArtists is called and rate limit is exceeded
        // Then: RateLimitError is thrown with retryAfter value
        try {
          await adapter.getTopArtists();
          expect(true).toBe(false); // Should not reach here
        } catch (error) {
          expect(error).toBeInstanceOf(RateLimitError);
          expect((error as RateLimitError).retryAfter).toBe(30);
        }
      });

      test("should throw NetworkError when network error occurs", async () => {
        // Given: Valid adapter configuration
        const topItemsMock = mock(async () => {
          throw new Error("Network connection failed");
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
            topItems: topItemsMock,
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
          scopes: ["user-top-read"],
        });

        // When: getTopArtists is called and network error occurs
        // Then: NetworkError is thrown
        await expect(adapter.getTopArtists()).rejects.toThrow(NetworkError);
      });
    });
  });
});

// CH-033: Create Playlist
describe("createPlaylist", () => {
  describe("AC-047: Create Playlist [CH-033]", () => {
    test("should return newly created Playlist object when called with name only", async () => {
      // Given: User is authenticated
      const mockCreatedPlaylist = {
        id: "playlist-123",
        name: "My Playlist",
        description: null,
        owner: {
          id: "user-123",
          display_name: "Test User",
          external_urls: {
            spotify: "https://open.spotify.com/user/user-123",
          },
        },
        tracks: {
          items: [],
          total: 0,
          limit: 100,
          offset: 0,
          href: "https://api.spotify.com/v1/playlists/playlist-123/tracks",
        },
        images: [],
        external_urls: {
          spotify: "https://open.spotify.com/playlist/playlist-123",
        },
        public: true,
        collaborative: false,
        snapshot_id: "snapshot-123",
      };

      const createPlaylistMock = mock(
        async (userId: string, details: unknown) => mockCreatedPlaylist,
      );

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
        playlists: {
          createPlaylist: createPlaylistMock,
          getPlaylist: mock(async (id: string) => mockCreatedPlaylist),
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
        scopes: ["playlist-modify-public", "playlist-modify-private"],
      });

      // When: createPlaylist("My Playlist") is called
      const result = await adapter.createPlaylist("My Playlist");

      // Then: Returns newly created Playlist object
      expect(result).toBeObject();
      expect(result.id).toBe("playlist-123");
      expect(result.name).toBe("My Playlist");
      expect(result.description).toBeNull();
      expect(result.owner).toBeDefined();
      expect(result.owner.id).toBe("user-123");
      expect(result.owner.displayName).toBe("Test User");
      expect(result.tracks).toBeArray();
      expect(result.tracks).toHaveLength(0);
      expect(result.images).toBeArray();
      expect(result.externalUrl).toBe(
        "https://open.spotify.com/playlist/playlist-123",
      );

      // Verify SDK was called with current user ID
      expect(createPlaylistMock).toHaveBeenCalledTimes(1);
    });

    test("should create playlist in user's library", async () => {
      // Given: User is authenticated
      const mockUserId = "user-456";
      const mockPlaylistName = "Road Trip Mix";

      const mockCreatedPlaylist = {
        id: "playlist-456",
        name: mockPlaylistName,
        description: null,
        owner: {
          id: mockUserId,
          display_name: "Road Tripper",
          external_urls: {
            spotify: "https://open.spotify.com/user/user-456",
          },
        },
        tracks: {
          items: [],
          total: 0,
          limit: 100,
          offset: 0,
          href: "https://api.spotify.com/v1/playlists/playlist-456/tracks",
        },
        images: [],
        external_urls: {
          spotify: "https://open.spotify.com/playlist/playlist-456",
        },
        public: true,
        collaborative: false,
        snapshot_id: "snapshot-456",
      };

      const createPlaylistMock = mock(
        async (userId: string, details: unknown) => {
          // Verify the playlist is created for the authenticated user
          expect(userId).toBe(mockUserId);
          return mockCreatedPlaylist;
        },
      );

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: mockUserId,
            display_name: "Road Tripper",
            external_urls: {
              spotify: `https://open.spotify.com/user/${mockUserId}`,
            },
          })),
        },
        playlists: {
          createPlaylist: createPlaylistMock,
          getPlaylist: mock(async (id: string) => mockCreatedPlaylist),
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
        scopes: ["playlist-modify-public"],
      });

      // When: createPlaylist is called
      const result = await adapter.createPlaylist(mockPlaylistName);

      // Then: Playlist is created in user's library (verified in mock)
      expect(result.owner.id).toBe(mockUserId);
      expect(createPlaylistMock).toHaveBeenCalled();
    });
  });

  describe("AC-048: Create Playlist with Options [CH-033]", () => {
    test("should create playlist with description option", async () => {
      // Given: User is authenticated
      const mockCreatedPlaylist = {
        id: "playlist-789",
        name: "My Playlist",
        description: "My awesome playlist description",
        owner: {
          id: "user-789",
          display_name: "Playlist Creator",
          external_urls: {
            spotify: "https://open.spotify.com/user/user-789",
          },
        },
        tracks: {
          items: [],
          total: 0,
          limit: 100,
          offset: 0,
          href: "https://api.spotify.com/v1/playlists/playlist-789/tracks",
        },
        images: [],
        external_urls: {
          spotify: "https://open.spotify.com/playlist/playlist-789",
        },
        public: true,
        collaborative: false,
        snapshot_id: "snapshot-789",
      };

      const createPlaylistMock = mock(
        async (
          userId: string,
          details: {
            name: string;
            description?: string;
            public?: boolean;
            collaborative?: boolean;
          },
        ) => {
          // Verify description is passed
          expect(details.description).toBe("My awesome playlist description");
          return mockCreatedPlaylist;
        },
      );

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-789",
            display_name: "Playlist Creator",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-789",
            },
          })),
        },
        playlists: {
          createPlaylist: createPlaylistMock,
          getPlaylist: mock(async (id: string) => mockCreatedPlaylist),
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
        scopes: ["playlist-modify-public"],
      });

      // When: createPlaylist is called with description option
      const result = await adapter.createPlaylist("My Playlist", {
        description: "My awesome playlist description",
      });

      // Then: Playlist is created with specified description
      expect(result.description).toBe("My awesome playlist description");
      expect(createPlaylistMock).toHaveBeenCalled();
    });

    test("should create private playlist when public: false option is provided", async () => {
      // Given: User is authenticated
      const mockCreatedPlaylist = {
        id: "playlist-private",
        name: "My Private Playlist",
        description: "Secret tunes",
        owner: {
          id: "user-private",
          display_name: "Private User",
          external_urls: {
            spotify: "https://open.spotify.com/user/user-private",
          },
        },
        tracks: {
          items: [],
          total: 0,
          limit: 100,
          offset: 0,
          href: "https://api.spotify.com/v1/playlists/playlist-private/tracks",
        },
        images: [],
        external_urls: {
          spotify: "https://open.spotify.com/playlist/playlist-private",
        },
        public: false,
        collaborative: false,
        snapshot_id: "snapshot-private",
      };

      const createPlaylistMock = mock(
        async (
          userId: string,
          details: {
            name: string;
            description?: string;
            public?: boolean;
            collaborative?: boolean;
          },
        ) => {
          // Verify public: false is passed
          expect(details.public).toBe(false);
          return mockCreatedPlaylist;
        },
      );

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-private",
            display_name: "Private User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-private",
            },
          })),
        },
        playlists: {
          createPlaylist: createPlaylistMock,
          getPlaylist: mock(async (id: string) => mockCreatedPlaylist),
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
        scopes: ["playlist-modify-private"],
      });

      // When: createPlaylist is called with public: false
      const result = await adapter.createPlaylist("My Private Playlist", {
        description: "Secret tunes",
        public: false,
      });

      // Then: Playlist is created as private
      expect(createPlaylistMock).toHaveBeenCalled();
    });

    test("should create playlist with all options specified", async () => {
      // Given: User is authenticated
      const mockCreatedPlaylist = {
        id: "playlist-full",
        name: "Full Options Playlist",
        description: "Testing all options",
        owner: {
          id: "user-full",
          display_name: "Full Options User",
          external_urls: {
            spotify: "https://open.spotify.com/user/user-full",
          },
        },
        tracks: {
          items: [],
          total: 0,
          limit: 100,
          offset: 0,
          href: "https://api.spotify.com/v1/playlists/playlist-full/tracks",
        },
        images: [],
        external_urls: {
          spotify: "https://open.spotify.com/playlist/playlist-full",
        },
        public: false,
        collaborative: true,
        snapshot_id: "snapshot-full",
      };

      const createPlaylistMock = mock(
        async (
          userId: string,
          details: {
            name: string;
            description?: string;
            public?: boolean;
            collaborative?: boolean;
          },
        ) => {
          // Verify all options are passed
          expect(details.name).toBe("Full Options Playlist");
          expect(details.description).toBe("Testing all options");
          expect(details.public).toBe(false);
          expect(details.collaborative).toBe(true);
          return mockCreatedPlaylist;
        },
      );

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-full",
            display_name: "Full Options User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-full",
            },
          })),
        },
        playlists: {
          createPlaylist: createPlaylistMock,
          getPlaylist: mock(async (id: string) => mockCreatedPlaylist),
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
        scopes: ["playlist-modify-private"],
      });

      // When: createPlaylist is called with all options
      const result = await adapter.createPlaylist("Full Options Playlist", {
        description: "Testing all options",
        public: false,
        collaborative: true,
      });

      // Then: Playlist is created with all specified options
      expect(result.id).toBe("playlist-full");
      expect(result.name).toBe("Full Options Playlist");
      expect(result.description).toBe("Testing all options");
      expect(createPlaylistMock).toHaveBeenCalled();
    });
  });

  describe("Return Type Validation [CH-033]", () => {
    test("should return Playlist object with all required fields", async () => {
      // Given: User is authenticated
      const mockTrack = {
        id: "track-1",
        name: "Track Name",
        duration_ms: 180000,
        preview_url: "https://p.scdn.co/mp3-preview/track1",
        external_urls: {
          spotify: "https://open.spotify.com/track/track-1",
        },
        artists: [
          {
            id: "artist-1",
            name: "Artist Name",
            external_urls: {
              spotify: "https://open.spotify.com/artist/artist-1",
            },
          },
        ],
        album: {
          id: "album-1",
          name: "Album Name",
          release_date: "2024-01-01",
          total_tracks: 12,
          images: [
            {
              url: "https://i.scdn.co/image/album1",
              width: 640,
              height: 640,
            },
          ],
          external_urls: {
            spotify: "https://open.spotify.com/album/album-1",
          },
          artists: [
            {
              id: "artist-1",
              name: "Artist Name",
              external_urls: {
                spotify: "https://open.spotify.com/artist/artist-1",
              },
            },
          ],
        },
      };

      const mockCreatedPlaylist = {
        id: "playlist-complete",
        name: "Complete Playlist",
        description: "A complete playlist with tracks",
        owner: {
          id: "user-complete",
          display_name: "Complete User",
          external_urls: {
            spotify: "https://open.spotify.com/user/user-complete",
          },
        },
        tracks: {
          items: [{ track: mockTrack, added_at: "2024-01-01T00:00:00Z" }],
          total: 1,
          limit: 100,
          offset: 0,
          href: "https://api.spotify.com/v1/playlists/playlist-complete/tracks",
        },
        images: [
          { url: "https://i.scdn.co/image/playlist1", width: 640, height: 640 },
        ],
        external_urls: {
          spotify: "https://open.spotify.com/playlist/playlist-complete",
        },
        public: true,
        collaborative: false,
        snapshot_id: "snapshot-complete",
      };

      const createPlaylistMock = mock(
        async (userId: string, details: unknown) => mockCreatedPlaylist,
      );

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-complete",
            display_name: "Complete User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-complete",
            },
          })),
        },
        playlists: {
          createPlaylist: createPlaylistMock,
          getPlaylist: mock(async (id: string) => mockCreatedPlaylist),
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
        scopes: ["playlist-modify-public"],
      });

      // When: createPlaylist is called
      const result = await adapter.createPlaylist("Complete Playlist", {
        description: "A complete playlist with tracks",
      });

      // Then: Result matches Playlist interface
      expect(result).toBeDefined();
      expect(result.id).toBe("playlist-complete");
      expect(result.name).toBe("Complete Playlist");
      expect(result.description).toBe("A complete playlist with tracks");
      expect(result.owner).toBeDefined();
      expect(result.owner.id).toBe("user-complete");
      expect(result.owner.displayName).toBe("Complete User");
      expect(result.tracks).toBeArray();
      expect(result.tracks).toHaveLength(1);
      expect(result.tracks[0]).toBeDefined();
      expect(result.tracks[0].id).toBe("track-1");
      expect(result.tracks[0].name).toBe("Track Name");
      expect(result.images).toBeArray();
      expect(result.images).toHaveLength(1);
      expect(result.images[0].url).toBe("https://i.scdn.co/image/playlist1");
      expect(result.externalUrl).toBe(
        "https://open.spotify.com/playlist/playlist-complete",
      );
    });
  });

  describe("Error Handling [CH-033]", () => {
    test("should throw AuthenticationError when user is not authenticated (401)", async () => {
      // Given: Invalid authentication
      const createPlaylistMock = mock(async () => {
        const error = new Error("Unauthorized") as Error & { status: number };
        error.status = 401;
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
        playlists: {
          createPlaylist: createPlaylistMock,
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
        scopes: ["playlist-modify-public"],
      });

      // When: createPlaylist is called without valid authentication
      // Then: AuthenticationError is thrown
      await expect(adapter.createPlaylist("Test Playlist")).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should throw RateLimitError when rate limit is exceeded (429)", async () => {
      // Given: Rate limit exceeded response
      const createPlaylistMock = mock(async () => {
        const error = new Error("Too Many Requests") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 429;
        error.headers = { "retry-after": "60" };
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
        playlists: {
          createPlaylist: createPlaylistMock,
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
        scopes: ["playlist-modify-public"],
      });

      // When: createPlaylist is called and rate limit is exceeded
      // Then: RateLimitError is thrown with correct retryAfter value
      try {
        await adapter.createPlaylist("Test Playlist");
        expect.unreachable("Should have thrown RateLimitError");
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).retryAfter).toBe(60);
      }
    });

    test("should throw NetworkError when network error occurs", async () => {
      // Given: Network error
      const createPlaylistMock = mock(async () => {
        throw new Error("Network error: connection refused");
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
        playlists: {
          createPlaylist: createPlaylistMock,
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
        scopes: ["playlist-modify-public"],
      });

      // When: createPlaylist is called and network error occurs
      // Then: NetworkError is thrown
      await expect(adapter.createPlaylist("Test Playlist")).rejects.toThrow(
        NetworkError,
      );
    });
  });
});

// CH-034: Update Playlist Details
describe("updatePlaylistDetails", () => {
  describe("AC-049: Update Playlist Details [CH-034]", () => {
    test("should update playlist name when called with name only", async () => {
      // Given: User is authenticated and owns the playlist
      const playlistId = "playlist-123";
      const changePlaylistDetailsMock = mock(
        async (playlistId: string, details: unknown) => {
          // Verify the correct parameters are passed
          expect(playlistId).toBe("playlist-123");
          expect(details).toEqual({ name: "New Name" });
          return {}; // SDK returns empty object for successful update
        },
      );

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
        playlists: {
          changePlaylistDetails: changePlaylistDetailsMock,
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
        scopes: ["playlist-modify-public", "playlist-modify-private"],
      });

      // When: updatePlaylistDetails(playlistId, { name: "New Name" }) is called
      await adapter.updatePlaylistDetails(playlistId, { name: "New Name" });

      // Then: Playlist details are updated
      expect(changePlaylistDetailsMock).toHaveBeenCalledTimes(1);
    });

    test("should resolve without error when update is successful", async () => {
      // Given: User is authenticated and owns the playlist
      const playlistId = "playlist-456";
      const changePlaylistDetailsMock = mock(async () => ({}));

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-456",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-456",
            },
          })),
        },
        playlists: {
          changePlaylistDetails: changePlaylistDetailsMock,
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
        scopes: ["playlist-modify-public"],
      });

      // When: updatePlaylistDetails is called
      const result = await adapter.updatePlaylistDetails(playlistId, {
        name: "Updated Name",
      });

      // Then: Promise resolves without error and returns void
      expect(result).toBeUndefined();
      expect(changePlaylistDetailsMock).toHaveBeenCalled();
    });
  });

  describe("Update Multiple Fields [CH-034]", () => {
    test("should update multiple fields when all details are provided", async () => {
      // Given: User is authenticated and owns the playlist
      const playlistId = "playlist-789";
      const details = {
        name: "New Playlist Name",
        description: "Updated description",
        public: false,
      };

      const changePlaylistDetailsMock = mock(
        async (playlistId: string, details: unknown) => {
          // Verify all fields are passed
          expect(details).toEqual({
            name: "New Playlist Name",
            description: "Updated description",
            public: false,
          });
          return {};
        },
      );

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-789",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-789",
            },
          })),
        },
        playlists: {
          changePlaylistDetails: changePlaylistDetailsMock,
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
        scopes: ["playlist-modify-private"],
      });

      // When: updatePlaylistDetails is called with multiple fields
      await adapter.updatePlaylistDetails(playlistId, details);

      // Then: All fields are updated
      expect(changePlaylistDetailsMock).toHaveBeenCalledTimes(1);
    });

    test("should update only description when only description is provided", async () => {
      // Given: User is authenticated and owns the playlist
      const playlistId = "playlist-desc";
      const changePlaylistDetailsMock = mock(
        async (playlistId: string, details: unknown) => {
          // Verify only description is passed
          expect(details).toEqual({
            description: "Just updating the description",
          });
          return {};
        },
      );

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-desc",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-desc",
            },
          })),
        },
        playlists: {
          changePlaylistDetails: changePlaylistDetailsMock,
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
        scopes: ["playlist-modify-public"],
      });

      // When: updatePlaylistDetails is called with only description
      await adapter.updatePlaylistDetails(playlistId, {
        description: "Just updating the description",
      });

      // Then: Only description is updated
      expect(changePlaylistDetailsMock).toHaveBeenCalledTimes(1);
    });

    test("should update only public flag when only public is provided", async () => {
      // Given: User is authenticated and owns the playlist
      const playlistId = "playlist-public";
      const changePlaylistDetailsMock = mock(
        async (playlistId: string, details: unknown) => {
          // Verify only public flag is passed
          expect(details).toEqual({ public: true });
          return {};
        },
      );

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-public",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-public",
            },
          })),
        },
        playlists: {
          changePlaylistDetails: changePlaylistDetailsMock,
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
        scopes: ["playlist-modify-public"],
      });

      // When: updatePlaylistDetails is called with only public flag
      await adapter.updatePlaylistDetails(playlistId, { public: true });

      // Then: Only public flag is updated
      expect(changePlaylistDetailsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling [CH-034]", () => {
    test("should throw AuthenticationError when user is not authenticated (401)", async () => {
      // Given: Invalid authentication
      const changePlaylistDetailsMock = mock(async () => {
        const error = new Error("Unauthorized") as Error & { status: number };
        error.status = 401;
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
        playlists: {
          changePlaylistDetails: changePlaylistDetailsMock,
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
        scopes: ["playlist-modify-public"],
      });

      // When: updatePlaylistDetails is called without valid authentication
      // Then: AuthenticationError is thrown
      await expect(
        adapter.updatePlaylistDetails("playlist-123", { name: "New Name" }),
      ).rejects.toThrow(AuthenticationError);
    });

    test("should throw RateLimitError when rate limit is exceeded (429)", async () => {
      // Given: Rate limit exceeded response
      const changePlaylistDetailsMock = mock(async () => {
        const error = new Error("Too Many Requests") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 429;
        error.headers = { "retry-after": "60" };
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
        playlists: {
          changePlaylistDetails: changePlaylistDetailsMock,
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
        scopes: ["playlist-modify-public"],
      });

      // When: updatePlaylistDetails is called and rate limit is exceeded
      // Then: RateLimitError is thrown with correct retryAfter value
      try {
        await adapter.updatePlaylistDetails("playlist-123", {
          name: "New Name",
        });
        expect.unreachable("Should have thrown RateLimitError");
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).retryAfter).toBe(60);
      }
    });

    test("should throw NetworkError when network error occurs", async () => {
      // Given: Network error
      const changePlaylistDetailsMock = mock(async () => {
        throw new Error("Network error: connection refused");
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
        playlists: {
          changePlaylistDetails: changePlaylistDetailsMock,
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
        scopes: ["playlist-modify-public"],
      });

      // When: updatePlaylistDetails is called and network error occurs
      // Then: NetworkError is thrown
      await expect(
        adapter.updatePlaylistDetails("playlist-123", { name: "New Name" }),
      ).rejects.toThrow(NetworkError);
    });
  });
});

describe("addTracksToPlaylist", () => {
  describe("AC-050: Add Tracks to Playlist [CH-035]", () => {
    test("should add tracks to playlist when called with valid track IDs", async () => {
      // Given: User is authenticated and can edit the playlist
      const playlistId = "playlist-123";
      const trackIds = ["track-1", "track-2"];
      const addItemsToPlaylistMock = mock(
        async (playlistId: string, uris: string[]) => {
          // Verify the correct parameters are passed
          expect(playlistId).toBe("playlist-123");
          // Track IDs should be converted to Spotify URIs
          expect(uris).toEqual([
            "spotify:track:track-1",
            "spotify:track:track-2",
          ]);
          return { snapshot_id: "snapshot-123" };
        },
      );

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
        playlists: {
          addItemsToPlaylist: addItemsToPlaylistMock,
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
        scopes: ["playlist-modify-public", "playlist-modify-private"],
      });

      // When: addTracksToPlaylist(playlistId, ["trackId1", "trackId2"]) is called
      await adapter.addTracksToPlaylist(playlistId, trackIds);

      // Then: Tracks are added to the playlist
      expect(addItemsToPlaylistMock).toHaveBeenCalledTimes(1);
    });

    test("should resolve without error when tracks are added successfully", async () => {
      // Given: User is authenticated and can edit the playlist
      const playlistId = "playlist-456";
      const trackIds = ["track-a"];
      const addItemsToPlaylistMock = mock(async () => ({
        snapshot_id: "snapshot-456",
      }));

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-456",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-456",
            },
          })),
        },
        playlists: {
          addItemsToPlaylist: addItemsToPlaylistMock,
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
        scopes: ["playlist-modify-public"],
      });

      // When: addTracksToPlaylist is called
      const result = await adapter.addTracksToPlaylist(playlistId, trackIds);

      // Then: Promise resolves without error and returns void
      expect(result).toBeUndefined();
      expect(addItemsToPlaylistMock).toHaveBeenCalled();
    });

    test("should handle adding a single track", async () => {
      // Given: User is authenticated and can edit the playlist
      const playlistId = "playlist-single";
      const trackIds = ["single-track"];
      const addItemsToPlaylistMock = mock(
        async (_playlistId: string, uris: string[]) => {
          expect(uris).toEqual(["spotify:track:single-track"]);
          return { snapshot_id: "snapshot-single" };
        },
      );

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-single",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-single",
            },
          })),
        },
        playlists: {
          addItemsToPlaylist: addItemsToPlaylistMock,
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
        scopes: ["playlist-modify-public"],
      });

      // When: addTracksToPlaylist is called with single track
      await adapter.addTracksToPlaylist(playlistId, trackIds);

      // Then: Single track is added to the playlist
      expect(addItemsToPlaylistMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling [CH-035]", () => {
    test("should throw AuthenticationError when user is not authenticated (401)", async () => {
      // Given: Invalid authentication
      const addItemsToPlaylistMock = mock(async () => {
        const error = new Error("Unauthorized") as Error & { status: number };
        error.status = 401;
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
        playlists: {
          addItemsToPlaylist: addItemsToPlaylistMock,
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
        scopes: ["playlist-modify-public"],
      });

      // When: addTracksToPlaylist is called with invalid auth
      // Then: AuthenticationError is thrown
      await expect(
        adapter.addTracksToPlaylist("playlist-123", ["track-1"]),
      ).rejects.toThrow(AuthenticationError);
    });

    test("should throw RateLimitError when rate limit is exceeded (429)", async () => {
      // Given: Rate limit exceeded
      const addItemsToPlaylistMock = mock(async () => {
        const error = new Error("Rate limited") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 429;
        error.headers = { "retry-after": "30" };
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
        playlists: {
          addItemsToPlaylist: addItemsToPlaylistMock,
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
        scopes: ["playlist-modify-public"],
      });

      // When: addTracksToPlaylist is called and rate limit is exceeded
      // Then: RateLimitError is thrown with correct retryAfter
      try {
        await adapter.addTracksToPlaylist("playlist-123", ["track-1"]);
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).retryAfter).toBe(30);
      }
    });

    test("should throw RateLimitError with default retryAfter when header is missing", async () => {
      // Given: Rate limit exceeded without retry-after header
      const addItemsToPlaylistMock = mock(async () => {
        const error = new Error("Rate limited") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 429;
        error.headers = {};
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
        playlists: {
          addItemsToPlaylist: addItemsToPlaylistMock,
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
        scopes: ["playlist-modify-public"],
      });

      // When: addTracksToPlaylist is called and rate limit is exceeded
      // Then: RateLimitError is thrown with default retryAfter of 60
      try {
        await adapter.addTracksToPlaylist("playlist-123", ["track-1"]);
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).retryAfter).toBe(60);
      }
    });

    test("should throw NetworkError when network error occurs", async () => {
      // Given: Network error
      const addItemsToPlaylistMock = mock(async () => {
        throw new Error("Network error: connection refused");
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
        playlists: {
          addItemsToPlaylist: addItemsToPlaylistMock,
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
        scopes: ["playlist-modify-public"],
      });

      // When: addTracksToPlaylist is called and network error occurs
      // Then: NetworkError is thrown
      await expect(
        adapter.addTracksToPlaylist("playlist-123", ["track-1"]),
      ).rejects.toThrow(NetworkError);
    });
  });
});

describe("removeTracksFromPlaylist", () => {
  describe("AC-051: Remove Tracks from Playlist [CH-036]", () => {
    test("should remove tracks from playlist when called with valid track IDs", async () => {
      // Given: User is authenticated and can edit the playlist
      const playlistId = "playlist-123";
      const trackIds = ["track-1", "track-2"];
      const removeItemsFromPlaylistMock = mock(
        async (
          playlistId: string,
          body: { tracks: Array<{ uri: string }> },
        ) => {
          // Verify the correct parameters are passed
          expect(playlistId).toBe("playlist-123");
          // Track IDs should be converted to Spotify URIs
          expect(body.tracks).toEqual([
            { uri: "spotify:track:track-1" },
            { uri: "spotify:track:track-2" },
          ]);
          return { snapshot_id: "snapshot-123" };
        },
      );

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
        playlists: {
          removeItemsFromPlaylist: removeItemsFromPlaylistMock,
        },
        logOut: mock(() => {}),
      } as unknown as ReturnType<typeof SpotifyApi.withUserAuthorization>;

      SpotifyApi.withUserAuthorization = mock(
        () => mockSdk as ReturnType<typeof SpotifyApi.withUserAuthorization>,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["playlist-modify-public", "playlist-modify-private"],
      });

      // When: removeTracksFromPlaylist(playlistId, ["trackId1", "trackId2"]) is called
      await adapter.removeTracksFromPlaylist(playlistId, trackIds);

      // Then: Tracks are removed from the playlist
      expect(removeItemsFromPlaylistMock).toHaveBeenCalledTimes(1);
    });

    test("should resolve without error when tracks are removed successfully", async () => {
      // Given: User is authenticated and can edit the playlist
      const playlistId = "playlist-456";
      const trackIds = ["track-a"];
      const removeItemsFromPlaylistMock = mock(async () => ({
        snapshot_id: "snapshot-abc",
      }));

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-456",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-456",
            },
          })),
        },
        playlists: {
          removeItemsFromPlaylist: removeItemsFromPlaylistMock,
        },
        logOut: mock(() => {}),
      } as unknown as ReturnType<typeof SpotifyApi.withUserAuthorization>;

      SpotifyApi.withUserAuthorization = mock(
        () => mockSdk as ReturnType<typeof SpotifyApi.withUserAuthorization>,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["playlist-modify-public"],
      });

      // When: removeTracksFromPlaylist is called
      const result = await adapter.removeTracksFromPlaylist(
        playlistId,
        trackIds,
      );

      // Then: Promise resolves without error and returns void
      expect(result).toBeUndefined();
      expect(removeItemsFromPlaylistMock).toHaveBeenCalled();
    });

    test("should handle removing a single track", async () => {
      // Given: User is authenticated and can edit the playlist
      const playlistId = "playlist-single";
      const trackIds = ["single-track"];
      const removeItemsFromPlaylistMock = mock(
        async (
          playlistId: string,
          body: { tracks: Array<{ uri: string }> },
        ) => {
          expect(body.tracks).toEqual([{ uri: "spotify:track:single-track" }]);
          return { snapshot_id: "snapshot-xyz" };
        },
      );

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-single",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-single",
            },
          })),
        },
        playlists: {
          removeItemsFromPlaylist: removeItemsFromPlaylistMock,
        },
        logOut: mock(() => {}),
      } as unknown as ReturnType<typeof SpotifyApi.withUserAuthorization>;

      SpotifyApi.withUserAuthorization = mock(
        () => mockSdk as ReturnType<typeof SpotifyApi.withUserAuthorization>,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["playlist-modify-public"],
      });

      // When: removeTracksFromPlaylist is called with single track
      await adapter.removeTracksFromPlaylist(playlistId, trackIds);

      // Then: Single track is removed from the playlist
      expect(removeItemsFromPlaylistMock).toHaveBeenCalledTimes(1);
    });

    test("should return early without API call when given empty array", async () => {
      // Given: User is authenticated and can edit the playlist
      const playlistId = "playlist-empty";
      const trackIds: string[] = [];
      const removeItemsFromPlaylistMock = mock(async () => ({
        snapshot_id: "snapshot-empty",
      }));

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-empty",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-empty",
            },
          })),
        },
        playlists: {
          removeItemsFromPlaylist: removeItemsFromPlaylistMock,
        },
        logOut: mock(() => {}),
      } as unknown as ReturnType<typeof SpotifyApi.withUserAuthorization>;

      SpotifyApi.withUserAuthorization = mock(
        () => mockSdk as ReturnType<typeof SpotifyApi.withUserAuthorization>,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["playlist-modify-public"],
      });

      // When: removeTracksFromPlaylist is called with empty array
      await adapter.removeTracksFromPlaylist(playlistId, trackIds);

      // Then: Returns without making API call
      expect(removeItemsFromPlaylistMock).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling [CH-036]", () => {
    test("should throw AuthenticationError when user is not authenticated (401)", async () => {
      // Given: Invalid authentication
      const removeItemsFromPlaylistMock = mock(async () => {
        const error = new Error("Unauthorized") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 401;
        error.headers = {};
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-401",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-401",
            },
          })),
        },
        playlists: {
          removeItemsFromPlaylist: removeItemsFromPlaylistMock,
        },
        logOut: mock(() => {}),
      } as unknown as ReturnType<typeof SpotifyApi.withUserAuthorization>;

      SpotifyApi.withUserAuthorization = mock(
        () => mockSdk as ReturnType<typeof SpotifyApi.withUserAuthorization>,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["playlist-modify-public"],
      });

      // When: removeTracksFromPlaylist is called with invalid auth
      // Then: AuthenticationError is thrown
      await expect(
        adapter.removeTracksFromPlaylist("playlist-123", ["track-1"]),
      ).rejects.toThrow(AuthenticationError);
    });

    test("should throw RateLimitError when rate limit is exceeded (429)", async () => {
      // Given: Rate limit exceeded
      const removeItemsFromPlaylistMock = mock(async () => {
        const error = new Error("Rate limited") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 429;
        error.headers = {
          "retry-after": "30",
        };
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-429",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-429",
            },
          })),
        },
        playlists: {
          removeItemsFromPlaylist: removeItemsFromPlaylistMock,
        },
        logOut: mock(() => {}),
      } as unknown as ReturnType<typeof SpotifyApi.withUserAuthorization>;

      SpotifyApi.withUserAuthorization = mock(
        () => mockSdk as ReturnType<typeof SpotifyApi.withUserAuthorization>,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["playlist-modify-public"],
      });

      // When: removeTracksFromPlaylist is called and rate limit is exceeded
      // Then: RateLimitError is thrown with correct retryAfter
      try {
        await adapter.removeTracksFromPlaylist("playlist-123", ["track-1"]);
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).retryAfter).toBe(30);
      }
    });

    test("should throw RateLimitError with default retryAfter when header is missing", async () => {
      // Given: Rate limit exceeded without retry-after header
      const removeItemsFromPlaylistMock = mock(async () => {
        const error = new Error("Rate limited") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 429;
        error.headers = {};
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-429-no-header",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-429-no-header",
            },
          })),
        },
        playlists: {
          removeItemsFromPlaylist: removeItemsFromPlaylistMock,
        },
        logOut: mock(() => {}),
      } as unknown as ReturnType<typeof SpotifyApi.withUserAuthorization>;

      SpotifyApi.withUserAuthorization = mock(
        () => mockSdk as ReturnType<typeof SpotifyApi.withUserAuthorization>,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["playlist-modify-public"],
      });

      // When: removeTracksFromPlaylist is called and rate limit is exceeded
      // Then: RateLimitError is thrown with default retryAfter of 60
      try {
        await adapter.removeTracksFromPlaylist("playlist-123", ["track-1"]);
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).retryAfter).toBe(60);
      }
    });

    test("should throw NotFoundError when playlist does not exist (404)", async () => {
      // Given: Playlist does not exist
      const removeItemsFromPlaylistMock = mock(async () => {
        const error = new Error("Not found") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 404;
        error.headers = {};
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-404",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-404",
            },
          })),
        },
        playlists: {
          removeItemsFromPlaylist: removeItemsFromPlaylistMock,
        },
        logOut: mock(() => {}),
      } as unknown as ReturnType<typeof SpotifyApi.withUserAuthorization>;

      SpotifyApi.withUserAuthorization = mock(
        () => mockSdk as ReturnType<typeof SpotifyApi.withUserAuthorization>,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["playlist-modify-public"],
      });

      // When: removeTracksFromPlaylist is called with non-existent playlist
      // Then: NotFoundError is thrown
      await expect(
        adapter.removeTracksFromPlaylist("non-existent-playlist", ["track-1"]),
      ).rejects.toThrow(NotFoundError);
    });

    test("should throw NotFoundError with resourceType='playlist'", async () => {
      // Given: Playlist does not exist
      const removeItemsFromPlaylistMock = mock(async () => {
        const error = new Error("Not found") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 404;
        error.headers = {};
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-404-type",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-404-type",
            },
          })),
        },
        playlists: {
          removeItemsFromPlaylist: removeItemsFromPlaylistMock,
        },
        logOut: mock(() => {}),
      } as unknown as ReturnType<typeof SpotifyApi.withUserAuthorization>;

      SpotifyApi.withUserAuthorization = mock(
        () => mockSdk as ReturnType<typeof SpotifyApi.withUserAuthorization>,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["playlist-modify-public"],
      });

      // When: removeTracksFromPlaylist is called with non-existent playlist
      try {
        await adapter.removeTracksFromPlaylist("non-existent-playlist", [
          "track-1",
        ]);
        expect.unreachable("Should have thrown");
      } catch (error) {
        // Then: NotFoundError is thrown with resourceType='playlist'
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.resourceType).toBe("playlist");
        }
      }
    });

    test("should throw NetworkError when network error occurs", async () => {
      // Given: Network error
      const removeItemsFromPlaylistMock = mock(async () => {
        const error = new Error("Network error") as Error & { code: string };
        error.code = "ECONNRESET";
        throw error;
      });

      const mockSdk = {
        currentUser: {
          profile: mock(async () => ({
            id: "user-network",
            display_name: "Test User",
            external_urls: {
              spotify: "https://open.spotify.com/user/user-network",
            },
          })),
        },
        playlists: {
          removeItemsFromPlaylist: removeItemsFromPlaylistMock,
        },
        logOut: mock(() => {}),
      } as unknown as ReturnType<typeof SpotifyApi.withUserAuthorization>;

      SpotifyApi.withUserAuthorization = mock(
        () => mockSdk as ReturnType<typeof SpotifyApi.withUserAuthorization>,
      );

      const { createSpotifyUserAdapter } = await import("./index");
      const adapter = createSpotifyUserAdapter({
        clientId: "test-client-id",
        redirectUri: "http://localhost:3000/callback",
        scopes: ["playlist-modify-public"],
      });

      // When: removeTracksFromPlaylist is called and network error occurs
      // Then: NetworkError is thrown
      await expect(
        adapter.removeTracksFromPlaylist("playlist-123", ["track-1"]),
      ).rejects.toThrow(NetworkError);
    });
  });
});

describe("getPlaylistTracks", () => {
  // Helper to create mock Spotify playlist track item
  const createMockPlaylistTrackItem = (
    overrides: Record<string, unknown> = {},
  ) => ({
    track: {
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
    },
    added_at: "2024-01-01T00:00:00Z",
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
    href: `https://api.spotify.com/v1/playlists/playlist-id/tracks?offset=${offset}&limit=${limit}`,
    next: offset + limit < total ? "next-page-url" : null,
    previous: offset > 0 ? "previous-page-url" : null,
  });

  // AC-052: Get Playlist Tracks [CH-037]
  describe("AC-052: Get Playlist Tracks [CH-037]", () => {
    test("should return PaginatedResult<Track> with playlist tracks", async () => {
      // Given: Valid adapter with authentication
      const mockTrackItem1 = createMockPlaylistTrackItem();
      const mockTrackItem2 = createMockPlaylistTrackItem();
      const mockResponse = createMockPaginatedResponse(100, 20, 0, [
        mockTrackItem1,
        mockTrackItem2,
      ]);

      const getPlaylistItemsMock = mock(async () => mockResponse);

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: getPlaylistItemsMock,
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks(playlistId) is called
      const result = await adapter.getPlaylistTracks("playlist-123");

      // Then: Returns PaginatedResult<Track> with playlist tracks
      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBe(2);
      expect(typeof result.total).toBe("number");
      expect(typeof result.limit).toBe("number");
      expect(typeof result.offset).toBe("number");
      expect(typeof result.hasNext).toBe("boolean");
    });

    test("should call SDK getPlaylistItems with correct parameters", async () => {
      // Given: Valid adapter with authentication
      const mockResponse = createMockPaginatedResponse(10, 20, 0, []);
      const getPlaylistItemsMock = mock(async () => mockResponse);

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: getPlaylistItemsMock,
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks is called
      await adapter.getPlaylistTracks("playlist-456");

      // Then: SDK is called with correct parameters
      expect(getPlaylistItemsMock).toHaveBeenCalledWith(
        "playlist-456",
        undefined,
        undefined,
        20,
        0,
      );
    });

    test("should transform playlist track items to Track objects", async () => {
      // Given: Valid adapter with authentication
      const mockTrackItem = createMockPlaylistTrackItem();
      const mockResponse = createMockPaginatedResponse(1, 20, 0, [
        mockTrackItem,
      ]);

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: mock(async () => mockResponse),
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks is called
      const result = await adapter.getPlaylistTracks("playlist-789");

      // Then: Items are transformed to Track objects
      expect(result.items[0].id).toBe("track-id");
      expect(result.items[0].name).toBe("Test Track");
      expect(result.items[0].durationMs).toBe(210000);
      expect(result.items[0].previewUrl).toBe(
        "https://p.scdn.co/mp3-preview/abc123",
      );
      expect(result.items[0].externalUrl).toBe(
        "https://open.spotify.com/track/track-id",
      );
      expect(result.items[0].artists).toBeDefined();
      expect(result.items[0].album).toBeDefined();
    });

    test("should handle empty playlist", async () => {
      // Given: Valid adapter with authentication and empty playlist
      const mockResponse = createMockPaginatedResponse(0, 20, 0, []);

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: mock(async () => mockResponse),
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks is called on empty playlist
      const result = await adapter.getPlaylistTracks("empty-playlist");

      // Then: Returns empty items array
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.hasNext).toBe(false);
    });
  });

  // AC-052a: Get Playlist Tracks - Pagination [CH-037]
  describe("AC-052a: Get Playlist Tracks - Pagination [CH-037]", () => {
    test("should return tracks starting from offset 100 with limit 50", async () => {
      // Given: Valid adapter with authentication
      const mockTracks = Array.from({ length: 50 }, (_, i) =>
        createMockPlaylistTrackItem({
          track: {
            id: `track-${i + 100}`,
            name: `Track ${i + 100}`,
          },
        }),
      );
      const mockResponse = createMockPaginatedResponse(
        200,
        50,
        100,
        mockTracks,
      );

      const getPlaylistItemsMock = mock(async () => mockResponse);

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: getPlaylistItemsMock,
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks(playlistId, { limit: 50, offset: 100 }) is called
      const result = await adapter.getPlaylistTracks("playlist-123", {
        limit: 50,
        offset: 100,
      });

      // Then: Returns tracks starting from offset 100
      expect(result.offset).toBe(100);
      // Maximum 50 tracks returned
      expect(result.items.length).toBe(50);
      expect(result.limit).toBe(50);
      // hasNext indicates if more tracks are available
      expect(result.hasNext).toBe(true);
      // SDK called with correct parameters
      expect(getPlaylistItemsMock).toHaveBeenCalledWith(
        "playlist-123",
        undefined,
        undefined,
        50,
        100,
      );
    });

    test("should set hasNext to true when more tracks are available", async () => {
      // Given: Total is greater than offset + items.length
      const mockTrackItem = createMockPlaylistTrackItem();
      const mockResponse = createMockPaginatedResponse(100, 20, 0, [
        mockTrackItem,
      ]);

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: mock(async () => mockResponse),
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks is called
      const result = await adapter.getPlaylistTracks("playlist-123");

      // Then: hasNext is true because 0 + 1 < 100
      expect(result.hasNext).toBe(true);
    });

    test("should set hasNext to false when at end of list", async () => {
      // Given: Total equals offset + items.length
      const mockTrackItem = createMockPlaylistTrackItem();
      const mockResponse = createMockPaginatedResponse(1, 20, 0, [
        mockTrackItem,
      ]);

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: mock(async () => mockResponse),
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks is called
      const result = await adapter.getPlaylistTracks("playlist-123");

      // Then: hasNext is false because 0 + 1 >= 1
      expect(result.hasNext).toBe(false);
    });

    test("should use default limit of 20 when not specified", async () => {
      // Given: Valid adapter with authentication
      const mockResponse = createMockPaginatedResponse(100, 20, 0, []);
      const getPlaylistItemsMock = mock(async () => mockResponse);

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: getPlaylistItemsMock,
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks is called without options
      await adapter.getPlaylistTracks("playlist-123");

      // Then: SDK is called with default limit of 20
      expect(getPlaylistItemsMock).toHaveBeenCalledWith(
        "playlist-123",
        undefined,
        undefined,
        20,
        0,
      );
    });

    test("should cap limit at 50", async () => {
      // Given: Valid adapter with authentication
      const mockResponse = createMockPaginatedResponse(100, 50, 0, []);
      const getPlaylistItemsMock = mock(async () => mockResponse);

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: getPlaylistItemsMock,
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks is called with limit > 50
      await adapter.getPlaylistTracks("playlist-123", { limit: 100 });

      // Then: SDK is called with limit capped at 50
      expect(getPlaylistItemsMock).toHaveBeenCalledWith(
        "playlist-123",
        undefined,
        undefined,
        50,
        0,
      );
    });
  });

  // Error Handling
  describe("Error Handling [CH-037]", () => {
    test("should throw AuthenticationError when unauthorized (401)", async () => {
      // Given: Invalid authentication
      const getPlaylistItemsMock = mock(async () => {
        const error = new Error("Unauthorized") as Error & { status: number };
        error.status = 401;
        throw error;
      });

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: getPlaylistItemsMock,
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks is called with invalid auth
      // Then: AuthenticationError is thrown
      await expect(adapter.getPlaylistTracks("playlist-123")).rejects.toThrow(
        AuthenticationError,
      );
    });

    test("should throw NotFoundError when playlist not found (404)", async () => {
      // Given: Playlist does not exist
      const getPlaylistItemsMock = mock(async () => {
        const error = new Error("Not found") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 404;
        error.headers = {};
        throw error;
      });

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: getPlaylistItemsMock,
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks is called with non-existent playlist
      // Then: NotFoundError is thrown
      await expect(
        adapter.getPlaylistTracks("non-existent-playlist"),
      ).rejects.toThrow(NotFoundError);
    });

    test("should throw NotFoundError with resourceType='playlist'", async () => {
      // Given: Playlist does not exist
      const getPlaylistItemsMock = mock(async () => {
        const error = new Error("Not found") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 404;
        error.headers = {};
        throw error;
      });

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: getPlaylistItemsMock,
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks is called with non-existent playlist
      try {
        await adapter.getPlaylistTracks("non-existent-playlist");
        expect.unreachable("Should have thrown");
      } catch (error) {
        // Then: NotFoundError is thrown with resourceType='playlist'
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.resourceType).toBe("playlist");
        }
      }
    });

    test("should throw RateLimitError when rate limit exceeded (429)", async () => {
      // Given: Rate limit exceeded
      const getPlaylistItemsMock = mock(async () => {
        const error = new Error("Rate limit exceeded") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 429;
        error.headers = { "retry-after": "60" };
        throw error;
      });

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: getPlaylistItemsMock,
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks is called and rate limit is exceeded
      // Then: RateLimitError is thrown
      await expect(adapter.getPlaylistTracks("playlist-123")).rejects.toThrow(
        RateLimitError,
      );
    });

    test("should throw RateLimitError with retryAfter value", async () => {
      // Given: Rate limit exceeded with retry-after header
      const getPlaylistItemsMock = mock(async () => {
        const error = new Error("Rate limit exceeded") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 429;
        error.headers = { "retry-after": "120" };
        throw error;
      });

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: getPlaylistItemsMock,
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks is called and rate limit is exceeded
      try {
        await adapter.getPlaylistTracks("playlist-123");
        expect.unreachable("Should have thrown");
      } catch (error) {
        // Then: RateLimitError is thrown with retryAfter value
        expect(error).toBeInstanceOf(RateLimitError);
        if (error instanceof RateLimitError) {
          expect(error.retryAfter).toBe(120);
        }
      }
    });

    test("should throw NetworkError when network error occurs", async () => {
      // Given: Network error
      const getPlaylistItemsMock = mock(async () => {
        const error = new Error("Network error") as Error & { code: string };
        error.code = "ECONNRESET";
        throw error;
      });

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: getPlaylistItemsMock,
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks is called and network error occurs
      // Then: NetworkError is thrown
      await expect(adapter.getPlaylistTracks("playlist-123")).rejects.toThrow(
        NetworkError,
      );
    });

    test("should throw SpotifyApiError for other API errors (500)", async () => {
      // Given: Server error
      const getPlaylistItemsMock = mock(async () => {
        const error = new Error("Internal Server Error") as Error & {
          status: number;
          headers: Record<string, string>;
        };
        error.status = 500;
        error.headers = {};
        throw error;
      });

      SpotifyApi.withClientCredentials = mock(
        () =>
          ({
            playlists: {
              getPlaylistItems: getPlaylistItemsMock,
            },
            logOut: mock(() => {}),
          }) as unknown as ReturnType<typeof SpotifyApi.withClientCredentials>,
      );

      const adapter = createSpotifyAdapter({
        clientId: "test-id",
        clientSecret: "test-secret",
      });

      // When: getPlaylistTracks is called and server error occurs
      // Then: SpotifyApiError is thrown
      await expect(adapter.getPlaylistTracks("playlist-123")).rejects.toThrow(
        SpotifyApiError,
      );
    });
  });

  describe("AC-053/AC-054: Set Volume [CH-038]", () => {
    test("should set volume to specified percentage", async () => {
      // Given: User is authenticated with Premium, playback is active
      const setPlaybackVolumeMock = mock(async () => {});

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
          setPlaybackVolume: setPlaybackVolumeMock,
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

      // When: setVolume(50) is called
      await adapter.setVolume(50);

      // Then: SDK setPlaybackVolume is called with percent and empty deviceId
      expect(setPlaybackVolumeMock).toHaveBeenCalledWith(50, "");
    });

    test("should allow boundary value 0 (mute)", async () => {
      // Given: User is authenticated with Premium
      const setPlaybackVolumeMock = mock(async () => {});

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
          setPlaybackVolume: setPlaybackVolumeMock,
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

      // When: setVolume(0) is called (mute)
      await adapter.setVolume(0);

      // Then: SDK setPlaybackVolume is called with 0
      expect(setPlaybackVolumeMock).toHaveBeenCalledWith(0, "");
    });

    test("should allow boundary value 100 (max volume)", async () => {
      // Given: User is authenticated with Premium
      const setPlaybackVolumeMock = mock(async () => {});

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
          setPlaybackVolume: setPlaybackVolumeMock,
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

      // When: setVolume(100) is called (max volume)
      await adapter.setVolume(100);

      // Then: SDK setPlaybackVolume is called with 100
      expect(setPlaybackVolumeMock).toHaveBeenCalledWith(100, "");
    });

    test("should throw ValidationError when volume exceeds 100", async () => {
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
          setPlaybackVolume: mock(async () => {}),
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

      // When: setVolume(150) is called (out of 0-100 range)
      // Then: ValidationError is thrown
      await expect(adapter.setVolume(150)).rejects.toThrow(ValidationError);
    });

    test("should throw ValidationError when volume is negative", async () => {
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
          setPlaybackVolume: mock(async () => {}),
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

      // When: setVolume(-10) is called (negative value)
      // Then: ValidationError is thrown
      await expect(adapter.setVolume(-10)).rejects.toThrow(ValidationError);
    });

    test("should throw PremiumRequiredError when user has no Premium", async () => {
      // Given: User is authenticated without Premium (403 Forbidden)
      const error = new Error("Forbidden") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 403;
      error.headers = {};

      const setPlaybackVolumeMock = mock(async () => {
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
          setPlaybackVolume: setPlaybackVolumeMock,
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

      // When: setVolume is called
      // Then: PremiumRequiredError is thrown
      await expect(adapter.setVolume(50)).rejects.toThrow(PremiumRequiredError);
    });

    test("should throw NoActiveDeviceError when no device is active", async () => {
      // Given: User has Premium but no active device (404)
      const error = new Error("No active device found") as Error & {
        status: number;
        headers: Record<string, string>;
      };
      error.status = 404;
      error.headers = {};

      const setPlaybackVolumeMock = mock(async () => {
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
          setPlaybackVolume: setPlaybackVolumeMock,
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

      // When: setVolume is called
      // Then: NoActiveDeviceError is thrown
      await expect(adapter.setVolume(50)).rejects.toThrow(NoActiveDeviceError);
    });

    test("should throw RateLimitError when rate limited", async () => {
      // Given: API rate limit has been exceeded (429 response)
      const error = new Error("Rate limit exceeded") as Error & {
        status: number;
        headers?: { "retry-after": string };
      };
      error.status = 429;
      error.headers = { "retry-after": "60" };

      const setPlaybackVolumeMock = mock(async () => {
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
          setPlaybackVolume: setPlaybackVolumeMock,
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

      // When: setVolume is called during rate limit
      // Then: RateLimitError is thrown
      await expect(adapter.setVolume(50)).rejects.toThrow(RateLimitError);
    });
  });
});
