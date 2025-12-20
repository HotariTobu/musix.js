import { afterEach, describe, expect, mock, test } from "bun:test";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { NotFoundError } from "../../core/errors";
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
        { clientId: "client", clientSecret: "a1b2c3d4e5f6g7h8i9j0" },
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
