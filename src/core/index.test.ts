import { describe, expect, test } from "bun:test";

// Import types and error classes (will fail until FR-001b is implemented)
import type {
  Album,
  Artist,
  Image,
  PaginatedResult,
  Playlist,
  SearchOptions,
  SearchResult,
  SimplifiedPlaylist,
  SpotifyAdapter,
  SpotifyConfig,
  Track,
  User,
} from "./index";

import {
  AuthenticationError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  SpotifyApiError,
} from "./index";

describe("Core Types", () => {
  // AC-001: Track type structure
  describe("Track", () => {
    test("should have required properties with correct types", () => {
      const track: Track = {
        id: "4iV5W9uYEdYUVa79Axb7Rh",
        name: "Hotel California",
        artists: [
          {
            id: "1234",
            name: "Eagles",
            externalUrl: "https://open.spotify.com/artist/1234",
          },
        ],
        album: {
          id: "5678",
          name: "Hotel California",
          artists: [
            {
              id: "1234",
              name: "Eagles",
              externalUrl: "https://open.spotify.com/artist/1234",
            },
          ],
          releaseDate: "1976-12-08",
          totalTracks: 9,
          images: [],
          externalUrl: "https://open.spotify.com/album/5678",
        },
        durationMs: 391376,
        previewUrl: "https://p.scdn.co/mp3-preview/preview",
        externalUrl: "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh",
      };

      expect(track.id).toBe("4iV5W9uYEdYUVa79Axb7Rh");
      expect(track.name).toBe("Hotel California");
      expect(Array.isArray(track.artists)).toBe(true);
      expect(track.artists.length).toBeGreaterThan(0);
      expect(track.album).toBeDefined();
      expect(track.durationMs).toBeGreaterThan(0);
      expect(track.externalUrl).toBeTruthy();
    });

    test("should allow previewUrl to be null", () => {
      const track: Track = {
        id: "test-id",
        name: "Test Track",
        artists: [
          {
            id: "artist-1",
            name: "Test Artist",
            externalUrl: "https://open.spotify.com/artist/artist-1",
          },
        ],
        album: {
          id: "album-1",
          name: "Test Album",
          artists: [],
          releaseDate: "2025-01-01",
          totalTracks: 10,
          images: [],
          externalUrl: "https://open.spotify.com/album/album-1",
        },
        durationMs: 180000,
        previewUrl: null,
        externalUrl: "https://open.spotify.com/track/test-id",
      };

      expect(track.previewUrl).toBeNull();
    });
  });

  // AC-001: Album type structure
  describe("Album", () => {
    test("should have required properties with correct types", () => {
      const album: Album = {
        id: "5678",
        name: "Hotel California",
        artists: [
          {
            id: "1234",
            name: "Eagles",
            externalUrl: "https://open.spotify.com/artist/1234",
          },
        ],
        releaseDate: "1976-12-08",
        totalTracks: 9,
        images: [
          {
            url: "https://i.scdn.co/image/ab67616d0000b273",
            width: 640,
            height: 640,
          },
        ],
        externalUrl: "https://open.spotify.com/album/5678",
      };

      expect(album.id).toBe("5678");
      expect(album.name).toBe("Hotel California");
      expect(Array.isArray(album.artists)).toBe(true);
      expect(album.releaseDate).toBe("1976-12-08");
      expect(album.totalTracks).toBe(9);
      expect(Array.isArray(album.images)).toBe(true);
      expect(album.externalUrl).toBeTruthy();
    });

    test("should allow empty images array", () => {
      const album: Album = {
        id: "test-album",
        name: "Test Album",
        artists: [],
        releaseDate: "2025-01-01",
        totalTracks: 1,
        images: [],
        externalUrl: "https://open.spotify.com/album/test-album",
      };

      expect(album.images).toEqual([]);
    });
  });

  // AC-001: Artist type structure
  describe("Artist", () => {
    test("should have required properties with correct types", () => {
      const artist: Artist = {
        id: "1234",
        name: "Eagles",
        externalUrl: "https://open.spotify.com/artist/1234",
      };

      expect(artist.id).toBe("1234");
      expect(artist.name).toBe("Eagles");
      expect(artist.externalUrl).toBeTruthy();
    });

    test("should allow optional genres array", () => {
      const artist: Artist = {
        id: "artist-1",
        name: "Test Artist",
        genres: ["rock", "classic rock"],
        externalUrl: "https://open.spotify.com/artist/artist-1",
      };

      expect(artist.genres).toEqual(["rock", "classic rock"]);
    });

    test("should allow optional images array", () => {
      const artist: Artist = {
        id: "artist-1",
        name: "Test Artist",
        images: [
          {
            url: "https://i.scdn.co/image/artist",
            width: 640,
            height: 640,
          },
        ],
        externalUrl: "https://open.spotify.com/artist/artist-1",
      };

      expect(artist.images).toBeDefined();
      expect(artist.images?.length).toBe(1);
    });

    test("should work without optional properties", () => {
      const artist: Artist = {
        id: "artist-1",
        name: "Test Artist",
        externalUrl: "https://open.spotify.com/artist/artist-1",
      };

      expect(artist.genres).toBeUndefined();
      expect(artist.images).toBeUndefined();
    });
  });

  // AC-001: Playlist type structure
  describe("Playlist", () => {
    test("should have required properties with correct types", () => {
      const playlist: Playlist = {
        id: "playlist-1",
        name: "My Playlist",
        description: "A cool playlist",
        owner: {
          id: "user-1",
          displayName: "John Doe",
        },
        tracks: [],
        images: [],
        externalUrl: "https://open.spotify.com/playlist/playlist-1",
      };

      expect(playlist.id).toBe("playlist-1");
      expect(playlist.name).toBe("My Playlist");
      expect(playlist.description).toBe("A cool playlist");
      expect(playlist.owner).toBeDefined();
      expect(playlist.owner.id).toBe("user-1");
      expect(playlist.owner.displayName).toBe("John Doe");
      expect(Array.isArray(playlist.tracks)).toBe(true);
      expect(Array.isArray(playlist.images)).toBe(true);
      expect(playlist.externalUrl).toBeTruthy();
    });

    test("should allow description to be null", () => {
      const playlist: Playlist = {
        id: "playlist-1",
        name: "My Playlist",
        description: null,
        owner: {
          id: "user-1",
          displayName: "John Doe",
        },
        tracks: [],
        images: [],
        externalUrl: "https://open.spotify.com/playlist/playlist-1",
      };

      expect(playlist.description).toBeNull();
    });

    test("should contain Track objects in tracks array", () => {
      const track: Track = {
        id: "track-1",
        name: "Test Track",
        artists: [
          {
            id: "artist-1",
            name: "Test Artist",
            externalUrl: "https://open.spotify.com/artist/artist-1",
          },
        ],
        album: {
          id: "album-1",
          name: "Test Album",
          artists: [],
          releaseDate: "2025-01-01",
          totalTracks: 1,
          images: [],
          externalUrl: "https://open.spotify.com/album/album-1",
        },
        durationMs: 180000,
        previewUrl: null,
        externalUrl: "https://open.spotify.com/track/track-1",
      };

      const playlist: Playlist = {
        id: "playlist-1",
        name: "My Playlist",
        description: null,
        owner: {
          id: "user-1",
          displayName: "John Doe",
        },
        tracks: [track],
        images: [],
        externalUrl: "https://open.spotify.com/playlist/playlist-1",
      };

      expect(playlist.tracks.length).toBe(1);
      expect(playlist.tracks[0].id).toBe("track-1");
    });
  });

  // AC-001: User type structure
  describe("User", () => {
    test("should have required properties with correct types", () => {
      const user: User = {
        id: "user-123",
        displayName: "John Doe",
      };

      expect(user.id).toBe("user-123");
      expect(user.displayName).toBe("John Doe");
    });
  });

  // AC-001: Image type structure
  describe("Image", () => {
    test("should have required properties with correct types", () => {
      const image: Image = {
        url: "https://i.scdn.co/image/ab67616d0000b273",
        width: 640,
        height: 640,
      };

      expect(image.url).toBe("https://i.scdn.co/image/ab67616d0000b273");
      expect(image.width).toBe(640);
      expect(image.height).toBe(640);
    });

    test("should allow width and height to be null", () => {
      const image: Image = {
        url: "https://i.scdn.co/image/ab67616d0000b273",
        width: null,
        height: null,
      };

      expect(image.width).toBeNull();
      expect(image.height).toBeNull();
    });
  });

  // AC-005b: SearchOptions type structure
  describe("SearchOptions", () => {
    test("should allow all properties to be optional", () => {
      const options1: SearchOptions = {};
      const options2: SearchOptions = { limit: 20 };
      const options3: SearchOptions = { offset: 0 };
      const options4: SearchOptions = { limit: 50, offset: 10 };

      expect(options1).toBeDefined();
      expect(options2.limit).toBe(20);
      expect(options3.offset).toBe(0);
      expect(options4.limit).toBe(50);
      expect(options4.offset).toBe(10);
    });

    test("should accept limit up to 50", () => {
      const options: SearchOptions = { limit: 50 };
      expect(options.limit).toBe(50);
    });

    test("should accept offset of 0 or greater", () => {
      const options: SearchOptions = { offset: 100 };
      expect(options.offset).toBe(100);
    });
  });

  // AC-005: SearchResult type structure
  describe("SearchResult", () => {
    test("should have required properties with correct types", () => {
      const result: SearchResult<Track> = {
        items: [],
        total: 0,
        limit: 20,
        offset: 0,
      };

      expect(Array.isArray(result.items)).toBe(true);
      expect(result.total).toBe(0);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });

    test("should contain typed items", () => {
      const track: Track = {
        id: "track-1",
        name: "Test Track",
        artists: [
          {
            id: "artist-1",
            name: "Test Artist",
            externalUrl: "https://open.spotify.com/artist/artist-1",
          },
        ],
        album: {
          id: "album-1",
          name: "Test Album",
          artists: [],
          releaseDate: "2025-01-01",
          totalTracks: 1,
          images: [],
          externalUrl: "https://open.spotify.com/album/album-1",
        },
        durationMs: 180000,
        previewUrl: null,
        externalUrl: "https://open.spotify.com/track/track-1",
      };

      const result: SearchResult<Track> = {
        items: [track],
        total: 1,
        limit: 20,
        offset: 0,
      };

      expect(result.items.length).toBe(1);
      expect(result.items[0].id).toBe("track-1");
    });

    test("should support different result types", () => {
      const albumResult: SearchResult<Album> = {
        items: [],
        total: 0,
        limit: 20,
        offset: 0,
      };

      const artistResult: SearchResult<Artist> = {
        items: [],
        total: 0,
        limit: 20,
        offset: 0,
      };

      expect(albumResult).toBeDefined();
      expect(artistResult).toBeDefined();
    });
  });

  // AC-001: SpotifyConfig type structure
  describe("SpotifyConfig", () => {
    test("should have required properties with correct types", () => {
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      expect(config.clientId).toBe("test-client-id");
      expect(config.clientSecret).toBe("test-client-secret");
    });
  });

  // AC-001: SpotifyAdapter interface structure
  describe("SpotifyAdapter", () => {
    test("should have all required methods", () => {
      // This test verifies the interface shape
      const adapter: SpotifyAdapter = {
        getTrack: async (id: string) => {
          throw new Error("Not implemented");
        },
        getTracks: async (ids: string[]) => {
          throw new Error("Not implemented");
        },
        searchTracks: async (query: string, options?: SearchOptions) => {
          throw new Error("Not implemented");
        },
        searchAlbums: async (query: string, options?: SearchOptions) => {
          throw new Error("Not implemented");
        },
        searchArtists: async (query: string, options?: SearchOptions) => {
          throw new Error("Not implemented");
        },
        searchPlaylists: async (
          query: string,
          options?: SearchOptions,
        ): Promise<SearchResult<SimplifiedPlaylist>> => {
          throw new Error("Not implemented");
        },
        getAlbum: async (id: string) => {
          throw new Error("Not implemented");
        },
        getAlbums: async (ids: string[]) => {
          throw new Error("Not implemented");
        },
        getArtist: async (id: string) => {
          throw new Error("Not implemented");
        },
        getArtists: async (ids: string[]) => {
          throw new Error("Not implemented");
        },
        getArtistAlbums: async (
          artistId: string,
          options?: SearchOptions,
        ): Promise<PaginatedResult<Album>> => {
          throw new Error("Not implemented");
        },
        getArtistTopTracks: async (
          artistId: string,
          market: string,
        ): Promise<Track[]> => {
          throw new Error("Not implemented");
        },
        getPlaylist: async (id: string) => {
          throw new Error("Not implemented");
        },
      };

      expect(adapter.getTrack).toBeDefined();
      expect(adapter.searchTracks).toBeDefined();
      expect(adapter.getAlbum).toBeDefined();
      expect(adapter.getArtist).toBeDefined();
      expect(adapter.getPlaylist).toBeDefined();
    });
  });
});

describe("Error Classes", () => {
  // AC-002: AuthenticationError
  describe("AuthenticationError", () => {
    test("should extend Error", () => {
      const error = new AuthenticationError("Invalid client credentials");
      expect(error).toBeInstanceOf(Error);
    });

    test("should have name property set to 'AuthenticationError'", () => {
      const error = new AuthenticationError("Invalid client credentials");
      expect(error.name).toBe("AuthenticationError");
    });

    test("should preserve error message", () => {
      const message = "Invalid client credentials";
      const error = new AuthenticationError(message);
      expect(error.message).toBe(message);
    });

    test("should be catchable as instanceof AuthenticationError", () => {
      const error = new AuthenticationError("Test error");
      const caught = error instanceof AuthenticationError;
      expect(caught).toBe(true);
    });
  });

  // AC-004: NotFoundError
  describe("NotFoundError", () => {
    test("should extend Error", () => {
      const error = new NotFoundError("track", "invalid-id");
      expect(error).toBeInstanceOf(Error);
    });

    test("should have name property set to 'NotFoundError'", () => {
      const error = new NotFoundError("track", "invalid-id");
      expect(error.name).toBe("NotFoundError");
    });

    test("should have resourceType property", () => {
      const error = new NotFoundError("track", "invalid-id");
      expect(error.resourceType).toBe("track");
    });

    test("should have resourceId property", () => {
      const error = new NotFoundError("track", "test-id-123");
      expect(error.resourceId).toBe("test-id-123");
    });

    test("should accept all valid resource types", () => {
      const resourceTypes: Array<"track" | "album" | "artist" | "playlist"> = [
        "track",
        "album",
        "artist",
        "playlist",
      ];

      for (const type of resourceTypes) {
        const error = new NotFoundError(type, "test-id");
        expect(error.resourceType).toBe(type);
      }
    });

    test("should format error message correctly", () => {
      const error = new NotFoundError("track", "abc123");
      expect(error.message).toContain("track");
      expect(error.message).toContain("abc123");
    });

    test("should be catchable as instanceof NotFoundError", () => {
      const error = new NotFoundError("album", "test-id");
      const caught = error instanceof NotFoundError;
      expect(caught).toBe(true);
    });
  });

  // AC-009: RateLimitError
  describe("RateLimitError", () => {
    test("should extend Error", () => {
      const error = new RateLimitError(30);
      expect(error).toBeInstanceOf(Error);
    });

    test("should have name property set to 'RateLimitError'", () => {
      const error = new RateLimitError(30);
      expect(error.name).toBe("RateLimitError");
    });

    test("should have retryAfter property", () => {
      const error = new RateLimitError(60);
      expect(error.retryAfter).toBe(60);
    });

    test("should accept positive retryAfter values", () => {
      const error = new RateLimitError(120);
      expect(error.retryAfter).toBeGreaterThan(0);
    });

    test("should format error message with retry time", () => {
      const error = new RateLimitError(45);
      expect(error.message).toContain("45");
    });

    test("should be catchable as instanceof RateLimitError", () => {
      const error = new RateLimitError(30);
      const caught = error instanceof RateLimitError;
      expect(caught).toBe(true);
    });
  });

  // AC-010: NetworkError
  describe("NetworkError", () => {
    test("should extend Error", () => {
      const error = new NetworkError("Connection failed");
      expect(error).toBeInstanceOf(Error);
    });

    test("should have name property set to 'NetworkError'", () => {
      const error = new NetworkError("Connection failed");
      expect(error.name).toBe("NetworkError");
    });

    test("should preserve error message", () => {
      const message = "Connection timeout";
      const error = new NetworkError(message);
      expect(error.message).toContain(message);
    });

    test("should accept optional cause parameter", () => {
      const cause = new Error("ECONNREFUSED");
      const error = new NetworkError("Connection failed", cause);
      expect(error.cause).toBe(cause);
    });

    test("should work without cause parameter", () => {
      const error = new NetworkError("Connection failed");
      expect(error.cause).toBeUndefined();
    });

    test("should be catchable as instanceof NetworkError", () => {
      const error = new NetworkError("Test error");
      const caught = error instanceof NetworkError;
      expect(caught).toBe(true);
    });
  });

  // SpotifyApiError (for other API errors)
  describe("SpotifyApiError", () => {
    test("should extend Error", () => {
      const error = new SpotifyApiError(500, "Internal Server Error");
      expect(error).toBeInstanceOf(Error);
    });

    test("should have name property set to 'SpotifyApiError'", () => {
      const error = new SpotifyApiError(500, "Internal Server Error");
      expect(error.name).toBe("SpotifyApiError");
    });

    test("should have statusCode property", () => {
      const error = new SpotifyApiError(500, "Internal Server Error");
      expect(error.statusCode).toBe(500);
    });

    test("should accept various HTTP status codes", () => {
      const statusCodes = [400, 403, 500, 502, 503];

      for (const code of statusCodes) {
        const error = new SpotifyApiError(code, "Error message");
        expect(error.statusCode).toBe(code);
      }
    });

    test("should format error message with status code", () => {
      const error = new SpotifyApiError(500, "Internal Server Error");
      expect(error.message).toContain("500");
      expect(error.message).toContain("Internal Server Error");
    });

    test("should be catchable as instanceof SpotifyApiError", () => {
      const error = new SpotifyApiError(400, "Bad Request");
      const caught = error instanceof SpotifyApiError;
      expect(caught).toBe(true);
    });
  });

  // Error differentiation tests
  describe("Error Type Differentiation", () => {
    test("should distinguish between different error types using instanceof", () => {
      const authError = new AuthenticationError("Auth failed");
      const notFoundError = new NotFoundError("track", "id");
      const rateLimitError = new RateLimitError(30);
      const networkError = new NetworkError("Connection failed");
      const apiError = new SpotifyApiError(500, "Server error");

      expect(authError instanceof AuthenticationError).toBe(true);
      expect(authError instanceof NotFoundError).toBe(false);

      expect(notFoundError instanceof NotFoundError).toBe(true);
      expect(notFoundError instanceof AuthenticationError).toBe(false);

      expect(rateLimitError instanceof RateLimitError).toBe(true);
      expect(rateLimitError instanceof NetworkError).toBe(false);

      expect(networkError instanceof NetworkError).toBe(true);
      expect(networkError instanceof RateLimitError).toBe(false);

      expect(apiError instanceof SpotifyApiError).toBe(true);
      expect(apiError instanceof AuthenticationError).toBe(false);
    });

    test("should distinguish between errors using name property", () => {
      const errors = [
        new AuthenticationError("Test"),
        new NotFoundError("track", "id"),
        new RateLimitError(30),
        new NetworkError("Test"),
        new SpotifyApiError(500, "Test"),
      ];

      const names = errors.map((e) => e.name);
      expect(names).toEqual([
        "AuthenticationError",
        "NotFoundError",
        "RateLimitError",
        "NetworkError",
        "SpotifyApiError",
      ]);
    });
  });
});
