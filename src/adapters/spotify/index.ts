import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import type {
  IValidateResponses,
  MaxInt,
  Album as SpotifyAlbum,
  Artist as SpotifyArtist,
  Image as SpotifyImage,
  Playlist as SpotifyPlaylist,
  PlaylistedTrack as SpotifyPlaylistedTrack,
  SimplifiedAlbum as SpotifySimplifiedAlbum,
  SimplifiedArtist as SpotifySimplifiedArtist,
  Track as SpotifyTrack,
} from "@spotify/web-api-ts-sdk";
import {
  AuthenticationError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  SpotifyApiError,
  ValidationError,
} from "../../core/errors";
import type {
  Album,
  Artist,
  Image,
  Playlist,
  SearchOptions,
  SearchResult,
  SpotifyAdapter,
  SpotifyConfig,
  Track,
  User,
} from "../../core/types";

/**
 * Custom error class that includes HTTP status and headers from the Response.
 * This allows the transformError function to correctly classify errors.
 */
class SpotifyHttpError extends Error {
  status: number;
  headers: Record<string, string>;

  constructor(
    message: string,
    status: number,
    headers: Record<string, string>,
  ) {
    super(message);
    this.name = "SpotifyHttpError";
    this.status = status;
    this.headers = headers;
  }
}

/**
 * Custom response validator that attaches HTTP status and headers to errors.
 * The default SDK validator throws plain Error objects without status information,
 * which prevents proper error classification.
 */
class SpotifyResponseValidator implements IValidateResponses {
  async validateResponse(response: Response): Promise<void> {
    if (response.ok) {
      return;
    }

    // Extract headers as a plain object
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    // Get response body for error message
    let body = "";
    try {
      body = await response.text();
    } catch {
      // Ignore body parsing errors
    }

    const message = body || response.statusText || `HTTP ${response.status}`;
    throw new SpotifyHttpError(message, response.status, headers);
  }
}

/**
 * Transforms a Spotify SDK Image to musix.js Image.
 * @param image - Spotify SDK Image
 * @returns musix.js Image
 */
function transformImage(image: SpotifyImage): Image {
  return {
    url: image.url,
    width: image.width ?? null,
    height: image.height ?? null,
  };
}

/**
 * Transforms a Spotify SDK SimplifiedArtist to musix.js Artist.
 * @param artist - Spotify SDK SimplifiedArtist
 * @returns musix.js Artist
 */
function transformSimplifiedArtist(artist: SpotifySimplifiedArtist): Artist {
  return {
    id: artist.id,
    name: artist.name,
    externalUrl: artist.external_urls.spotify,
  };
}

/**
 * Transforms a Spotify SDK SimplifiedAlbum to musix.js Album.
 * @param album - Spotify SDK SimplifiedAlbum
 * @returns musix.js Album
 */
function transformSimplifiedAlbum(album: SpotifySimplifiedAlbum): Album {
  return {
    id: album.id,
    name: album.name,
    artists: album.artists.map(transformSimplifiedArtist),
    releaseDate: album.release_date,
    totalTracks: album.total_tracks,
    images: album.images.map(transformImage),
    externalUrl: album.external_urls.spotify,
  };
}

/**
 * Transforms a Spotify SDK full Album to musix.js Album.
 * @param album - Spotify SDK Album
 * @returns musix.js Album
 */
function transformAlbum(album: SpotifyAlbum): Album {
  return {
    id: album.id,
    name: album.name,
    artists: album.artists.map(transformSimplifiedArtist),
    releaseDate: album.release_date,
    totalTracks: album.total_tracks,
    images: album.images.map(transformImage),
    externalUrl: album.external_urls.spotify,
  };
}

/**
 * Transforms a Spotify SDK full Artist to musix.js Artist.
 * @param artist - Spotify SDK Artist
 * @returns musix.js Artist
 */
function transformArtist(artist: SpotifyArtist): Artist {
  return {
    id: artist.id,
    name: artist.name,
    genres:
      artist.genres && artist.genres.length > 0 ? artist.genres : undefined,
    images:
      artist.images && artist.images.length > 0
        ? artist.images.map(transformImage)
        : undefined,
    externalUrl: artist.external_urls.spotify,
  };
}

/**
 * Transforms a Spotify SDK Track to musix.js Track.
 * @param track - Spotify SDK Track
 * @returns musix.js Track
 */
function transformTrack(track: SpotifyTrack): Track {
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map(transformSimplifiedArtist),
    album: transformSimplifiedAlbum(track.album),
    durationMs: track.duration_ms,
    previewUrl: track.preview_url,
    externalUrl: track.external_urls.spotify,
  };
}

/**
 * Transforms a Spotify SDK Playlist to musix.js Playlist.
 * @param playlist - Spotify SDK Playlist
 * @returns musix.js Playlist
 */
function transformPlaylist(playlist: SpotifyPlaylist<SpotifyTrack>): Playlist {
  const owner: User = {
    id: playlist.owner.id,
    displayName: playlist.owner.display_name,
  };

  const tracks: Track[] = playlist.tracks.items
    .filter((item: SpotifyPlaylistedTrack<SpotifyTrack>) => item.track !== null)
    .map((item: SpotifyPlaylistedTrack<SpotifyTrack>) =>
      transformTrack(item.track),
    );

  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description || null,
    owner,
    tracks,
    images: playlist.images.map(transformImage),
    externalUrl: playlist.external_urls.spotify,
  };
}

/**
 * Type guard to check if an error has HTTP status information.
 * Works with SpotifyHttpError from our custom validator or any error with status property.
 */
function isHttpError(
  error: unknown,
): error is Error & { status: number; headers?: Record<string, string> } {
  return (
    error !== null &&
    typeof error === "object" &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  );
}

/**
 * Transforms a Spotify SDK error to the appropriate musix.js error type.
 * @param error - The error thrown by the Spotify SDK
 * @param resourceType - The type of resource being accessed (for NotFoundError)
 * @param resourceId - The ID of the resource being accessed (for NotFoundError)
 * @returns The appropriate musix.js error
 */
function transformError(
  error: unknown,
  resourceType: "track" | "album" | "artist" | "playlist",
  resourceId: string,
): Error {
  // Handle errors with HTTP status codes (from SpotifyHttpError or mocked errors)
  if (isHttpError(error)) {
    switch (error.status) {
      case 401:
        return new AuthenticationError("Invalid client credentials");
      case 404:
        return new NotFoundError(resourceType, resourceId);
      case 429: {
        const retryAfter = error.headers?.["retry-after"]
          ? Number.parseInt(error.headers["retry-after"], 10)
          : 60; // Default to 60 seconds if header is missing
        return new RateLimitError(retryAfter);
      }
      default:
        return new SpotifyApiError(
          error.status,
          error.message || "Unknown error",
        );
    }
  }

  // Handle network errors (errors without status property)
  if (error instanceof Error) {
    return new NetworkError(error.message, error);
  }

  // Handle non-Error objects
  return new NetworkError(String(error));
}

/**
 * Executes an API call with automatic token refresh on 401 errors.
 * If the first call fails with 401, clears the token cache and retries once.
 * If the retry also fails with 401, the error is propagated.
 *
 * @param sdk - The SpotifyApi SDK instance
 * @param apiCall - The API call to execute
 * @param resourceType - The type of resource being accessed (for error messages)
 * @param resourceId - The ID of the resource being accessed (for error messages)
 * @returns The result of the API call
 */
async function executeWithTokenRefresh<T>(
  sdk: ReturnType<typeof SpotifyApi.withClientCredentials>,
  apiCall: () => Promise<T>,
  resourceType: "track" | "album" | "artist" | "playlist",
  resourceId: string,
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    // Check if this is a 401 error (potential token expiration)
    if (isHttpError(error) && error.status === 401) {
      // Clear the cached token and retry once
      sdk.logOut();
      try {
        return await apiCall();
      } catch (retryError) {
        // If retry also fails, throw the appropriate error
        throw transformError(retryError, resourceType, resourceId);
      }
    }
    // For non-401 errors, throw immediately without retry
    throw transformError(error, resourceType, resourceId);
  }
}

/**
 * Creates a Spotify adapter instance using the official Spotify Web API SDK.
 * Uses Client Credentials Flow for authentication.
 *
 * @param config - Spotify API configuration with clientId and clientSecret
 * @returns SpotifyAdapter instance with methods to interact with Spotify API
 *
 * @example
 * ```typescript
 * const adapter = createSpotifyAdapter({
 *   clientId: "your-client-id",
 *   clientSecret: "your-client-secret"
 * });
 *
 * const track = await adapter.getTrack("track-id");
 * ```
 */
export function createSpotifyAdapter(config: SpotifyConfig): SpotifyAdapter {
  // Create SDK instance with Client Credentials Flow
  // Authentication happens lazily on first API call
  const sdk = SpotifyApi.withClientCredentials(
    config.clientId,
    config.clientSecret,
    [],
    { responseValidator: new SpotifyResponseValidator() },
  );

  // Return adapter object implementing SpotifyAdapter interface
  return {
    /**
     * Retrieves a track by its Spotify ID.
     * @param id - The Spotify track ID
     * @returns Promise resolving to Track object
     * @throws {NotFoundError} If the track does not exist
     */
    async getTrack(id: string): Promise<Track> {
      return executeWithTokenRefresh(
        sdk,
        async () => {
          const spotifyTrack = await sdk.tracks.get(id);
          return transformTrack(spotifyTrack);
        },
        "track",
        id,
      );
    },

    /**
     * Retrieves multiple tracks by their Spotify IDs.
     * @param ids - Array of Spotify track IDs (maximum 50)
     * @returns Promise resolving to array of Track objects
     * @throws {ValidationError} If more than 50 IDs are provided
     */
    async getTracks(ids: string[]): Promise<Track[]> {
      // AC-059: Empty array handling - return early without API call
      if (ids.length === 0) {
        return [];
      }

      // AC-002: Validate maximum limit
      if (ids.length > 50) {
        throw new ValidationError(
          `getTracks accepts maximum 50 IDs, received ${ids.length}`,
        );
      }

      return executeWithTokenRefresh(
        sdk,
        async () => {
          const spotifyTracks = await sdk.tracks.get(ids);
          // AC-003: Filter out null values for invalid IDs
          return spotifyTracks
            .filter((track): track is SpotifyTrack => track != null)
            .map(transformTrack);
        },
        "track",
        ids.join(","),
      );
    },

    /**
     * Searches for tracks matching the query.
     * @param query - The search query string
     * @param options - Optional search options (limit, offset)
     * @returns Promise resolving to SearchResult containing tracks
     */
    async searchTracks(
      query: string,
      options?: SearchOptions,
    ): Promise<SearchResult<Track>> {
      // Apply default values and constraints
      // Limit is capped at 50 (Spotify API max), cast to SDK's expected literal union type
      const limit = Math.min(options?.limit ?? 20, 50) as MaxInt<50>;
      const offset = options?.offset ?? 0;

      return executeWithTokenRefresh(
        sdk,
        async () => {
          // Call Spotify SDK search API
          const searchResults = await sdk.search(
            query,
            ["track"],
            undefined,
            limit,
            offset,
          );

          // Transform Spotify tracks to musix.js Track type
          const tracks = searchResults.tracks.items.map(transformTrack);

          return {
            items: tracks,
            total: searchResults.tracks.total,
            limit,
            offset,
          };
        },
        "track",
        query,
      );
    },

    /**
     * Retrieves an album by its Spotify ID.
     * @param id - The Spotify album ID
     * @returns Promise resolving to Album object
     * @throws {NotFoundError} If the album does not exist
     */
    async getAlbum(id: string): Promise<Album> {
      return executeWithTokenRefresh(
        sdk,
        async () => {
          const spotifyAlbum = await sdk.albums.get(id);
          return transformAlbum(spotifyAlbum);
        },
        "album",
        id,
      );
    },

    /**
     * Retrieves an artist by their Spotify ID.
     * @param id - The Spotify artist ID
     * @returns Promise resolving to Artist object
     * @throws {NotFoundError} If the artist does not exist
     */
    async getArtist(id: string): Promise<Artist> {
      return executeWithTokenRefresh(
        sdk,
        async () => {
          const spotifyArtist = await sdk.artists.get(id);
          return transformArtist(spotifyArtist);
        },
        "artist",
        id,
      );
    },

    /**
     * Retrieves a playlist by its Spotify ID.
     * @param id - The Spotify playlist ID
     * @returns Promise resolving to Playlist object
     * @throws {NotFoundError} If the playlist does not exist
     */
    async getPlaylist(id: string): Promise<Playlist> {
      return executeWithTokenRefresh(
        sdk,
        async () => {
          const spotifyPlaylist = await sdk.playlists.getPlaylist(id);
          return transformPlaylist(spotifyPlaylist);
        },
        "playlist",
        id,
      );
    },
  };
}
