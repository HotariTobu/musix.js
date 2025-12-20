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
