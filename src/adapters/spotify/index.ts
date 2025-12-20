import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import type {
  IValidateResponses,
  Market,
  MaxInt,
  Album as SpotifyAlbum,
  Artist as SpotifyArtist,
  Image as SpotifyImage,
  Playlist as SpotifyPlaylist,
  PlaylistedTrack as SpotifyPlaylistedTrack,
  SimplifiedAlbum as SpotifySimplifiedAlbum,
  SimplifiedArtist as SpotifySimplifiedArtist,
  SimplifiedPlaylist as SpotifySimplifiedPlaylist,
  SimplifiedTrack as SpotifySimplifiedTrack,
  Track as SpotifyTrack,
  UserProfile as SpotifyUserProfile,
} from "@spotify/web-api-ts-sdk";
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
import type {
  Album,
  Artist,
  CurrentUser,
  Device,
  Image,
  PaginatedResult,
  PlayOptions,
  PlaybackState,
  Playlist,
  SearchOptions,
  SearchResult,
  SimplifiedPlaylist,
  SpotifyAdapter,
  SpotifyConfig,
  SpotifyUserAdapter,
  SpotifyUserAuthConfig,
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
 * Transforms a Spotify SDK SimplifiedTrack to musix.js Track using album info.
 * @param track - Spotify SDK SimplifiedTrack (from album tracks endpoint)
 * @param album - musix.js Album object to attach to the track
 * @returns musix.js Track
 */
function transformSimplifiedTrackWithAlbum(
  track: SpotifySimplifiedTrack,
  album: Album,
): Track {
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map(transformSimplifiedArtist),
    album,
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
 * Transforms a Spotify SDK SimplifiedPlaylist to musix.js SimplifiedPlaylist.
 * @param playlist - Spotify SDK SimplifiedPlaylist
 * @returns musix.js SimplifiedPlaylist
 */
function transformSimplifiedPlaylist(
  playlist: SpotifySimplifiedPlaylist,
): SimplifiedPlaylist {
  const owner: User = {
    id: playlist.owner.id,
    displayName: playlist.owner.display_name,
  };

  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description || null,
    owner,
    totalTracks: playlist.tracks?.total ?? 0,
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
     * Searches for albums matching the query.
     * @param query - The search query string
     * @param options - Optional search options (limit, offset)
     * @returns Promise resolving to SearchResult containing albums
     */
    async searchAlbums(
      query: string,
      options?: SearchOptions,
    ): Promise<SearchResult<Album>> {
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
            ["album"],
            undefined,
            limit,
            offset,
          );

          // Transform Spotify simplified albums to musix.js Album type
          const albums = searchResults.albums.items.map(
            transformSimplifiedAlbum,
          );

          return {
            items: albums,
            total: searchResults.albums.total,
            limit,
            offset,
          };
        },
        "album",
        query,
      );
    },

    /**
     * Searches for artists matching the query.
     * @param query - The search query string
     * @param options - Optional search options (limit, offset)
     * @returns Promise resolving to SearchResult containing artists
     */
    async searchArtists(
      query: string,
      options?: SearchOptions,
    ): Promise<SearchResult<Artist>> {
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
            ["artist"],
            undefined,
            limit,
            offset,
          );

          // Transform Spotify artists to musix.js Artist type
          const artists = searchResults.artists.items.map(transformArtist);

          return {
            items: artists,
            total: searchResults.artists.total,
            limit,
            offset,
          };
        },
        "artist",
        query,
      );
    },

    /**
     * Searches for playlists matching the query.
     * @param query - The search query string
     * @param options - Optional search options (limit, offset)
     * @returns Promise resolving to SearchResult containing simplified playlists
     */
    async searchPlaylists(
      query: string,
      options?: SearchOptions,
    ): Promise<SearchResult<SimplifiedPlaylist>> {
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
            ["playlist"],
            undefined,
            limit,
            offset,
          );

          // Transform Spotify playlists to musix.js SimplifiedPlaylist type
          // Note: SDK types return PlaylistBase but API actually returns SimplifiedPlaylist with tracks
          const playlists = (
            searchResults.playlists.items as SpotifySimplifiedPlaylist[]
          ).map(transformSimplifiedPlaylist);

          return {
            items: playlists,
            total: searchResults.playlists.total,
            limit,
            offset,
          };
        },
        "playlist",
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
     * Retrieves multiple albums by their Spotify IDs.
     * @param ids - Array of Spotify album IDs (maximum 20)
     * @returns Promise resolving to array of Album objects
     * @throws {ValidationError} If more than 20 IDs are provided
     */
    async getAlbums(ids: string[]): Promise<Album[]> {
      // AC-059: Empty array handling - return early without API call
      if (ids.length === 0) {
        return [];
      }

      // AC-005: Validate maximum limit (Spotify allows max 20 albums)
      if (ids.length > 20) {
        throw new ValidationError(
          `getAlbums accepts maximum 20 IDs, received ${ids.length}`,
        );
      }

      return executeWithTokenRefresh(
        sdk,
        async () => {
          const spotifyAlbums = await sdk.albums.get(ids);
          // Filter out null values for invalid IDs
          return spotifyAlbums
            .filter((album): album is SpotifyAlbum => album != null)
            .map(transformAlbum);
        },
        "album",
        ids.join(","),
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
     * Retrieves multiple artists by their Spotify IDs.
     * @param ids - Array of Spotify artist IDs (maximum 50)
     * @returns Promise resolving to array of Artist objects
     * @throws {ValidationError} If more than 50 IDs are provided
     */
    async getArtists(ids: string[]): Promise<Artist[]> {
      // AC-059: Empty array handling - return early without API call
      if (ids.length === 0) {
        return [];
      }

      // AC-007: Validate maximum limit (Spotify allows max 50 artists)
      if (ids.length > 50) {
        throw new ValidationError(
          `getArtists accepts maximum 50 IDs, received ${ids.length}`,
        );
      }

      return executeWithTokenRefresh(
        sdk,
        async () => {
          const spotifyArtists = await sdk.artists.get(ids);
          // Filter out null values for invalid IDs
          return spotifyArtists
            .filter((artist): artist is SpotifyArtist => artist != null)
            .map(transformArtist);
        },
        "artist",
        ids.join(","),
      );
    },

    /**
     * Retrieves albums by an artist.
     * @param artistId - The Spotify artist ID
     * @param options - Optional pagination options (limit, offset)
     * @returns Promise resolving to PaginatedResult containing albums
     */
    async getArtistAlbums(
      artistId: string,
      options?: SearchOptions,
    ): Promise<PaginatedResult<Album>> {
      // Apply default values and constraints
      // Limit is capped at 50 (Spotify API max), cast to SDK's expected literal union type
      const limit = Math.min(options?.limit ?? 20, 50) as MaxInt<50>;
      const offset = options?.offset ?? 0;

      return executeWithTokenRefresh(
        sdk,
        async () => {
          // Call Spotify SDK to get artist's albums
          // Signature: albums(id, includeGroups?, market?, limit?, offset?)
          const response = await sdk.artists.albums(
            artistId,
            undefined, // includeGroups
            undefined, // market
            limit,
            offset,
          );

          // Transform Spotify simplified albums to musix.js Album type
          const albums = response.items.map(transformSimplifiedAlbum);

          // Calculate hasNext based on whether there are more items
          const hasNext = offset + response.items.length < response.total;

          return {
            items: albums,
            total: response.total,
            limit,
            offset,
            hasNext,
          };
        },
        "artist",
        artistId,
      );
    },

    /**
     * Retrieves an artist's top tracks.
     * @param artistId - The Spotify artist ID
     * @param market - ISO 3166-1 alpha-2 country code (e.g., "US", "JP")
     * @returns Promise resolving to array of Track objects (up to 10)
     */
    async getArtistTopTracks(
      artistId: string,
      market: string,
    ): Promise<Track[]> {
      return executeWithTokenRefresh(
        sdk,
        async () => {
          // Call Spotify SDK to get artist's top tracks
          // Cast market string to Market type (SDK requires specific country code union)
          const response = await sdk.artists.topTracks(
            artistId,
            market as Market,
          );

          // Transform Spotify tracks to musix.js Track type
          return response.tracks.map(transformTrack);
        },
        "artist",
        artistId,
      );
    },

    /**
     * Retrieves tracks from an album.
     * @param albumId - The Spotify album ID
     * @param options - Optional pagination options (limit, offset)
     * @returns Promise resolving to PaginatedResult containing tracks
     */
    async getAlbumTracks(
      albumId: string,
      options?: SearchOptions,
    ): Promise<PaginatedResult<Track>> {
      // Apply default values and constraints
      // Limit is capped at 50 (Spotify API max), cast to SDK's expected literal union type
      const limit = Math.min(options?.limit ?? 20, 50) as MaxInt<50>;
      const offset = options?.offset ?? 0;

      return executeWithTokenRefresh(
        sdk,
        async () => {
          // Fetch album info and tracks in parallel
          const [albumResponse, tracksResponse] = await Promise.all([
            sdk.albums.get(albumId),
            sdk.albums.tracks(albumId, undefined, limit, offset),
          ]);

          // Transform album to musix.js format
          const album = transformAlbum(albumResponse);

          // Transform simplified tracks to full tracks with album info
          const tracks = tracksResponse.items.map((track) =>
            transformSimplifiedTrackWithAlbum(track, album),
          );

          // Calculate hasNext based on whether there are more items
          const hasNext =
            offset + tracksResponse.items.length < tracksResponse.total;

          return {
            items: tracks,
            total: tracksResponse.total,
            limit,
            offset,
            hasNext,
          };
        },
        "album",
        albumId,
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

/**
 * Transforms a Spotify SDK UserProfile to musix.js CurrentUser.
 * @param profile - Spotify SDK UserProfile
 * @returns musix.js CurrentUser
 */
function transformUserProfile(profile: SpotifyUserProfile): CurrentUser {
  return {
    id: profile.id,
    displayName: profile.display_name ?? "",
    email: profile.email,
    images: profile.images?.map(transformImage),
    product: profile.product as "free" | "premium" | undefined,
    externalUrl: profile.external_urls.spotify,
  };
}

/**
 * Creates a Spotify adapter with user authentication (PKCE flow).
 * This adapter extends the base adapter with user-specific features like
 * playback control, library management, and personalized recommendations.
 *
 * @param config - User authentication configuration
 * @returns SpotifyUserAdapter instance
 *
 * @example
 * ```typescript
 * const adapter = createSpotifyUserAdapter({
 *   clientId: 'your-client-id',
 *   redirectUri: 'http://localhost:3000/callback',
 *   scopes: ['user-read-private', 'user-read-email', 'user-library-read']
 * });
 *
 * // First API call will trigger OAuth redirect if not authenticated
 * const user = await adapter.getCurrentUser();
 * ```
 */
export function createSpotifyUserAdapter(
  config: SpotifyUserAuthConfig,
): SpotifyUserAdapter {
  // Create SDK instance with PKCE flow
  // The SDK handles OAuth redirect, callback, token storage, and refresh automatically
  const sdk = SpotifyApi.withUserAuthorization(
    config.clientId,
    config.redirectUri,
    config.scopes,
    {
      // Custom response validator for error handling
      responseValidator: new SpotifyResponseValidator(),
    },
  );

  // Get the base adapter methods by creating a temporary base adapter config
  // We'll use the SDK instance directly for user-specific methods
  const baseAdapter = createBaseAdapterMethods(sdk);

  return {
    // Include all base adapter methods
    ...baseAdapter,

    /**
     * Gets the current authenticated user's profile.
     * @returns Promise resolving to CurrentUser object
     */
    async getCurrentUser(): Promise<CurrentUser> {
      const profile = await sdk.currentUser.profile();
      return transformUserProfile(profile);
    },

    /**
     * Starts or resumes playback on the user's active device.
     * @param options - Playback options (trackIds, contextUri, deviceId, offsetIndex, positionMs)
     * @throws {ValidationError} If both trackIds and contextUri are provided
     * @throws {PremiumRequiredError} If user doesn't have Premium subscription
     * @throws {NoActiveDeviceError} If no active playback device is found
     */
    async play(options?: PlayOptions): Promise<void> {
      // Validate mutually exclusive options
      if (options?.trackIds && options?.contextUri) {
        throw new ValidationError(
          "Cannot specify both trackIds and contextUri. Choose one playback target.",
        );
      }

      // Convert trackIds to Spotify URIs
      const uris = options?.trackIds?.map((id) => `spotify:track:${id}`);

      // Build offset object if offsetIndex is provided
      const offset =
        options?.offsetIndex !== undefined
          ? { position: options.offsetIndex }
          : undefined;

      try {
        await sdk.player.startResumePlayback(
          options?.deviceId ?? "",
          options?.contextUri,
          uris,
          offset,
          options?.positionMs,
        );
      } catch (error) {
        // Handle playback-specific errors
        if (isHttpError(error)) {
          if (error.status === 403) {
            throw new PremiumRequiredError();
          }
          if (error.status === 404) {
            throw new NoActiveDeviceError();
          }
        }
        throw error;
      }
    },
    /**
     * Pauses playback on the user's active device.
     * @throws {PremiumRequiredError} If user doesn't have Premium subscription
     * @throws {NoActiveDeviceError} If no active playback device is found
     */
    async pause(): Promise<void> {
      try {
        await sdk.player.pausePlayback("");
      } catch (error) {
        if (isHttpError(error)) {
          if (error.status === 403) {
            throw new PremiumRequiredError();
          }
          if (error.status === 404) {
            throw new NoActiveDeviceError();
          }
        }
        throw error;
      }
    },
    async skipToNext(): Promise<void> {
      try {
        await sdk.player.skipToNext("");
      } catch (error) {
        if (isHttpError(error)) {
          if (error.status === 403) {
            throw new PremiumRequiredError();
          }
          if (error.status === 404) {
            throw new NoActiveDeviceError();
          }
        }
        throw error;
      }
    },
    async skipToPrevious(): Promise<void> {
      try {
        await sdk.player.skipToPrevious("");
      } catch (error) {
        if (isHttpError(error)) {
          if (error.status === 403) {
            throw new PremiumRequiredError();
          }
          if (error.status === 404) {
            throw new NoActiveDeviceError();
          }
        }
        throw error;
      }
    },
    async seek(positionMs: number): Promise<void> {
      try {
        await sdk.player.seekToPosition(positionMs, "");
      } catch (error) {
        if (isHttpError(error)) {
          if (error.status === 403) {
            throw new PremiumRequiredError();
          }
          if (error.status === 404) {
            throw new NoActiveDeviceError();
          }
        }
        throw error;
      }
    },
    async getPlaybackState(): Promise<PlaybackState | null> {
      const state = await sdk.player.getPlaybackState();

      if (!state) {
        return null;
      }

      const device: Device = {
        id: state.device.id ?? "",
        name: state.device.name,
        type: state.device.type,
        isActive: state.device.is_active,
        volumePercent: state.device.volume_percent ?? 0,
      };

      // Transform track if item exists and is a track (has album property)
      // Note: item can be either Track or Episode; we only support tracks
      const track =
        state.item && "album" in state.item
          ? transformTrack(state.item as SpotifyTrack)
          : null;

      return {
        isPlaying: state.is_playing,
        track,
        progressMs: state.progress_ms ?? 0,
        durationMs: state.item?.duration_ms ?? 0,
        device,
        shuffleState: state.shuffle_state,
        repeatState: state.repeat_state as "off" | "track" | "context",
      };
    },
    async getAvailableDevices(): Promise<Device[]> {
      const response = await sdk.player.getAvailableDevices();
      return response.devices.map((device) => ({
        id: device.id ?? "",
        name: device.name ?? "Unknown Device",
        type: device.type ?? "Unknown",
        isActive: device.is_active,
        volumePercent: device.volume_percent ?? 0,
      }));
    },
    async transferPlayback(deviceId: string, play?: boolean): Promise<void> {
      try {
        await sdk.player.transferPlayback([deviceId], play ?? false);
      } catch (error) {
        if (isHttpError(error)) {
          if (error.status === 403) {
            throw new PremiumRequiredError();
          }
          if (error.status === 404) {
            throw new NoActiveDeviceError();
          }
        }
        throw error;
      }
    },
    async setVolume() {
      throw new Error("Not implemented");
    },
    async setShuffle() {
      throw new Error("Not implemented");
    },
    async setRepeat() {
      throw new Error("Not implemented");
    },
    async getQueue() {
      throw new Error("Not implemented");
    },
    async addToQueue() {
      throw new Error("Not implemented");
    },
    async getSavedTracks(
      options?: SearchOptions,
    ): Promise<PaginatedResult<Track>> {
      // Apply default values and constraints
      // Limit is capped at 50 (Spotify API max), cast to SDK's expected literal union type
      const limit = Math.min(options?.limit ?? 20, 50) as MaxInt<50>;
      const offset = options?.offset ?? 0;

      // Call Spotify SDK to get saved tracks
      const response = await sdk.currentUser.tracks.savedTracks(limit, offset);

      // Transform saved track items to musix.js Track type
      const tracks = response.items.map((item) => transformTrack(item.track));

      // Calculate hasNext based on whether there are more items
      const hasNext = offset + response.items.length < response.total;

      return {
        items: tracks,
        total: response.total,
        limit,
        offset,
        hasNext,
      };
    },
    /**
     * Adds a track to the user's library.
     * @param id - The Spotify track ID
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {RateLimitError} If rate limit is exceeded
     */
    async saveTrack(id: string): Promise<void> {
      try {
        await sdk.currentUser.tracks.saveTracks([id]);
      } catch (error) {
        if (isHttpError(error)) {
          if (error.status === 401) {
            throw new AuthenticationError("Invalid client credentials");
          }
          if (error.status === 429) {
            const retryAfter = error.headers?.["retry-after"]
              ? Number.parseInt(error.headers["retry-after"], 10)
              : 60;
            throw new RateLimitError(retryAfter);
          }
        }
        throw error;
      }
    },
    /**
     * Removes a track from the user's library.
     * @param id - The Spotify track ID
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {RateLimitError} If rate limit is exceeded
     */
    async removeSavedTrack(id: string): Promise<void> {
      try {
        await sdk.currentUser.tracks.removeSavedTracks([id]);
      } catch (error) {
        if (isHttpError(error)) {
          if (error.status === 401) {
            throw new AuthenticationError("Invalid client credentials");
          }
          if (error.status === 429) {
            const retryAfter = error.headers?.["retry-after"]
              ? Number.parseInt(error.headers["retry-after"], 10)
              : 60;
            throw new RateLimitError(retryAfter);
          }
        }
        throw error;
      }
    },
    /**
     * Gets albums saved in the user's library.
     * @param options - Optional pagination options (limit, offset)
     * @returns PaginatedResult containing user's saved albums
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {RateLimitError} If rate limit is exceeded
     */
    async getSavedAlbums(
      options?: SearchOptions,
    ): Promise<PaginatedResult<Album>> {
      // Apply default values and constraints
      // Limit is capped at 50 (Spotify API max), cast to SDK's expected literal union type
      const limit = Math.min(options?.limit ?? 20, 50) as MaxInt<50>;
      const offset = options?.offset ?? 0;

      try {
        // Call Spotify SDK to get saved albums
        const response = await sdk.currentUser.albums.savedAlbums(
          limit,
          offset,
        );

        // Transform saved album items to musix.js Album type
        const albums = response.items.map((item) => transformAlbum(item.album));

        // Calculate hasNext based on whether there are more items
        const hasNext = offset + response.items.length < response.total;

        return {
          items: albums,
          total: response.total,
          limit,
          offset,
          hasNext,
        };
      } catch (error) {
        if (isHttpError(error)) {
          if (error.status === 401) {
            throw new AuthenticationError("Invalid or expired access token");
          }
          if (error.status === 429) {
            const retryAfter = error.headers?.["retry-after"]
              ? Number.parseInt(error.headers["retry-after"], 10)
              : 60;
            throw new RateLimitError(retryAfter);
          }
        }
        throw error;
      }
    },
    /**
     * Adds an album to the user's library.
     * @param id - The Spotify album ID
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {RateLimitError} If rate limit is exceeded
     */
    async saveAlbum(id: string): Promise<void> {
      try {
        await sdk.currentUser.albums.saveAlbums([id]);
      } catch (error) {
        if (isHttpError(error)) {
          if (error.status === 401) {
            throw new AuthenticationError("Invalid client credentials");
          }
          if (error.status === 429) {
            const retryAfter = error.headers?.["retry-after"]
              ? Number.parseInt(error.headers["retry-after"], 10)
              : 60;
            throw new RateLimitError(retryAfter);
          }
        }
        throw error;
      }
    },
    /**
     * Removes an album from the user's library.
     * @param id - The Spotify album ID
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {RateLimitError} If rate limit is exceeded
     */
    async removeSavedAlbum(id: string): Promise<void> {
      try {
        await sdk.currentUser.albums.removeSavedAlbums([id]);
      } catch (error) {
        if (isHttpError(error)) {
          if (error.status === 401) {
            throw new AuthenticationError("Invalid client credentials");
          }
          if (error.status === 429) {
            const retryAfter = error.headers?.["retry-after"]
              ? Number.parseInt(error.headers["retry-after"], 10)
              : 60;
            throw new RateLimitError(retryAfter);
          }
        }
        throw error;
      }
    },
    /**
     * Gets the artists followed by the current user.
     * Note: Spotify's followedArtists API uses cursor-based pagination (after parameter)
     * but we expose it as offset-based pagination for consistency with other methods.
     * The offset is used to calculate the starting position in the result set.
     * @param options - Optional pagination options (limit, offset)
     * @returns PaginatedResult containing followed artists
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {RateLimitError} If rate limit is exceeded
     */
    async getFollowedArtists(
      options?: SearchOptions,
    ): Promise<PaginatedResult<Artist>> {
      // Apply default values and constraints
      // Limit is capped at 50 (Spotify API max), cast to SDK's expected literal union type
      const limit = Math.min(options?.limit ?? 20, 50) as MaxInt<50>;
      const offset = options?.offset ?? 0;

      try {
        // Call Spotify SDK to get followed artists
        // Note: Spotify uses cursor-based pagination but the SDK abstracts this
        const response = await sdk.currentUser.followedArtists(
          undefined,
          limit,
        );

        // Transform Spotify artists to musix.js Artist type
        const artists = response.artists.items.map(transformArtist);

        // Calculate hasNext based on whether there are more items
        const hasNext =
          offset + response.artists.items.length < response.artists.total;

        return {
          items: artists,
          total: response.artists.total,
          limit: response.artists.limit,
          offset,
          hasNext,
        };
      } catch (error) {
        if (isHttpError(error)) {
          if (error.status === 401) {
            throw new AuthenticationError("Invalid or expired access token");
          }
          if (error.status === 429) {
            const retryAfter = error.headers?.["retry-after"]
              ? Number.parseInt(error.headers["retry-after"], 10)
              : 60;
            throw new RateLimitError(retryAfter);
          }
        }
        throw error;
      }
    },
    /**
     * Adds an artist to the user's followed artists.
     * @param id - The Spotify artist ID
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {RateLimitError} If rate limit is exceeded
     */
    async followArtist(id: string): Promise<void> {
      try {
        await sdk.currentUser.followArtistsOrUsers([id], "artist");
      } catch (error) {
        if (isHttpError(error)) {
          if (error.status === 401) {
            throw new AuthenticationError("Invalid or expired access token");
          }
          if (error.status === 429) {
            const retryAfter = error.headers?.["retry-after"]
              ? Number.parseInt(error.headers["retry-after"], 10)
              : 60;
            throw new RateLimitError(retryAfter);
          }
        }
        throw error;
      }
    },
    /**
     * Removes an artist from the user's followed artists.
     * @param id - The Spotify artist ID
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {RateLimitError} If rate limit is exceeded
     */
    async unfollowArtist(id: string): Promise<void> {
      try {
        await sdk.currentUser.unfollowArtistsOrUsers([id], "artist");
      } catch (error) {
        if (isHttpError(error)) {
          if (error.status === 401) {
            throw new AuthenticationError("Invalid or expired access token");
          }
          if (error.status === 429) {
            const retryAfter = error.headers?.["retry-after"]
              ? Number.parseInt(error.headers["retry-after"], 10)
              : 60;
            throw new RateLimitError(retryAfter);
          }
        }
        throw error;
      }
    },
    /**
     * Gets the current user's playlists.
     * @param options - Optional pagination options (limit, offset)
     * @returns PaginatedResult containing user's playlists
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {RateLimitError} If rate limit is exceeded
     */
    async getUserPlaylists(
      options?: SearchOptions,
    ): Promise<PaginatedResult<SimplifiedPlaylist>> {
      const limit = Math.min(options?.limit ?? 20, 50) as MaxInt<50>;
      const offset = options?.offset ?? 0;

      try {
        const response = await sdk.currentUser.playlists.playlists(
          limit,
          offset,
        );

        const playlists = response.items.map((playlist) =>
          transformSimplifiedPlaylist(playlist as SpotifySimplifiedPlaylist),
        );

        const hasNext = offset + response.items.length < response.total;

        return {
          items: playlists,
          total: response.total,
          limit,
          offset,
          hasNext,
        };
      } catch (error) {
        if (isHttpError(error)) {
          if (error.status === 401) {
            throw new AuthenticationError("Invalid client credentials");
          }
          if (error.status === 429) {
            const retryAfter = error.headers?.["retry-after"]
              ? Number.parseInt(error.headers["retry-after"], 10)
              : 60;
            throw new RateLimitError(retryAfter);
          }
        }
        throw error;
      }
    },
    async getRecommendations() {
      throw new Error("Not implemented");
    },
    async getRelatedArtists() {
      throw new Error("Not implemented");
    },
    async getNewReleases() {
      throw new Error("Not implemented");
    },
    async getRecentlyPlayed() {
      throw new Error("Not implemented");
    },
    async getTopTracks() {
      throw new Error("Not implemented");
    },
    async getTopArtists() {
      throw new Error("Not implemented");
    },
    async createPlaylist() {
      throw new Error("Not implemented");
    },
    async updatePlaylistDetails() {
      throw new Error("Not implemented");
    },
    async addTracksToPlaylist() {
      throw new Error("Not implemented");
    },
    async removeTracksFromPlaylist() {
      throw new Error("Not implemented");
    },
    async getPlaylistTracks() {
      throw new Error("Not implemented");
    },
  };
}

/**
 * Creates base adapter methods that can be shared between
 * createSpotifyAdapter and createSpotifyUserAdapter.
 */
function createBaseAdapterMethods(
  sdk: ReturnType<typeof SpotifyApi.withUserAuthorization>,
): SpotifyAdapter {
  return {
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

    async getTracks(ids: string[]): Promise<Track[]> {
      if (ids.length === 0) {
        return [];
      }
      if (ids.length > 50) {
        throw new ValidationError("Cannot request more than 50 tracks at once");
      }
      return executeWithTokenRefresh(
        sdk,
        async () => {
          const response = await sdk.tracks.get(ids);
          return response
            .filter((track): track is SpotifyTrack => track != null)
            .map(transformTrack);
        },
        "track",
        ids[0],
      );
    },

    async searchTracks(
      query: string,
      options?: SearchOptions,
    ): Promise<SearchResult<Track>> {
      const limit = (options?.limit ?? 20) as MaxInt<50>;
      const offset = options?.offset ?? 0;

      return executeWithTokenRefresh(
        sdk,
        async () => {
          const response = await sdk.search(
            query,
            ["track"],
            undefined,
            limit,
            offset,
          );
          const tracks = response.tracks;

          return {
            items: tracks.items.map(transformTrack),
            total: tracks.total,
            limit: tracks.limit,
            offset: tracks.offset,
          };
        },
        "track",
        query,
      );
    },

    async searchAlbums(
      query: string,
      options?: SearchOptions,
    ): Promise<SearchResult<Album>> {
      const limit = (options?.limit ?? 20) as MaxInt<50>;
      const offset = options?.offset ?? 0;

      return executeWithTokenRefresh(
        sdk,
        async () => {
          const response = await sdk.search(
            query,
            ["album"],
            undefined,
            limit,
            offset,
          );
          const albums = response.albums;

          return {
            items: albums.items.map(transformSimplifiedAlbum),
            total: albums.total,
            limit: albums.limit,
            offset: albums.offset,
          };
        },
        "album",
        query,
      );
    },

    async searchArtists(
      query: string,
      options?: SearchOptions,
    ): Promise<SearchResult<Artist>> {
      const limit = (options?.limit ?? 20) as MaxInt<50>;
      const offset = options?.offset ?? 0;

      return executeWithTokenRefresh(
        sdk,
        async () => {
          const response = await sdk.search(
            query,
            ["artist"],
            undefined,
            limit,
            offset,
          );
          const artists = response.artists;

          return {
            items: artists.items.map(transformArtist),
            total: artists.total,
            limit: artists.limit,
            offset: artists.offset,
          };
        },
        "artist",
        query,
      );
    },

    async searchPlaylists(
      query: string,
      options?: SearchOptions,
    ): Promise<SearchResult<SimplifiedPlaylist>> {
      const limit = (options?.limit ?? 20) as MaxInt<50>;
      const offset = options?.offset ?? 0;

      return executeWithTokenRefresh(
        sdk,
        async () => {
          const response = await sdk.search(
            query,
            ["playlist"],
            undefined,
            limit,
            offset,
          );

          // Note: SDK types return PlaylistBase but API actually returns SimplifiedPlaylist with tracks
          const playlists = (
            response.playlists.items as SpotifySimplifiedPlaylist[]
          ).map(transformSimplifiedPlaylist);

          return {
            items: playlists,
            total: response.playlists.total,
            limit: response.playlists.limit,
            offset: response.playlists.offset,
          };
        },
        "playlist",
        query,
      );
    },

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

    async getAlbums(ids: string[]): Promise<Album[]> {
      if (ids.length === 0) {
        return [];
      }
      if (ids.length > 20) {
        throw new ValidationError("Cannot request more than 20 albums at once");
      }
      return executeWithTokenRefresh(
        sdk,
        async () => {
          const response = await sdk.albums.get(ids);
          return response.map(transformAlbum);
        },
        "album",
        ids[0],
      );
    },

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

    async getArtists(ids: string[]): Promise<Artist[]> {
      if (ids.length === 0) {
        return [];
      }
      if (ids.length > 50) {
        throw new ValidationError(
          "Cannot request more than 50 artists at once",
        );
      }
      return executeWithTokenRefresh(
        sdk,
        async () => {
          const response = await sdk.artists.get(ids);
          return response.map(transformArtist);
        },
        "artist",
        ids[0],
      );
    },

    async getArtistAlbums(
      artistId: string,
      options?: SearchOptions,
    ): Promise<PaginatedResult<Album>> {
      const limit = Math.min(options?.limit ?? 20, 50) as MaxInt<50>;
      const offset = options?.offset ?? 0;

      return executeWithTokenRefresh(
        sdk,
        async () => {
          const response = await sdk.artists.albums(
            artistId,
            undefined,
            undefined,
            limit,
            offset,
          );

          const albums = response.items.map(transformSimplifiedAlbum);
          const hasNext = offset + response.items.length < response.total;

          return {
            items: albums,
            total: response.total,
            limit,
            offset,
            hasNext,
          };
        },
        "artist",
        artistId,
      );
    },

    async getArtistTopTracks(
      artistId: string,
      market: string,
    ): Promise<Track[]> {
      return executeWithTokenRefresh(
        sdk,
        async () => {
          const response = await sdk.artists.topTracks(
            artistId,
            market as Market,
          );
          return response.tracks.map(transformTrack);
        },
        "artist",
        artistId,
      );
    },

    async getAlbumTracks(
      albumId: string,
      options?: SearchOptions,
    ): Promise<PaginatedResult<Track>> {
      const limit = Math.min(options?.limit ?? 20, 50) as MaxInt<50>;
      const offset = options?.offset ?? 0;

      return executeWithTokenRefresh(
        sdk,
        async () => {
          const [albumResponse, tracksResponse] = await Promise.all([
            sdk.albums.get(albumId),
            sdk.albums.tracks(albumId, undefined, limit, offset),
          ]);

          const album = transformAlbum(albumResponse);
          const tracks = tracksResponse.items.map((track) =>
            transformSimplifiedTrackWithAlbum(track, album),
          );

          const hasNext =
            offset + tracksResponse.items.length < tracksResponse.total;

          return {
            items: tracks,
            total: tracksResponse.total,
            limit,
            offset,
            hasNext,
          };
        },
        "album",
        albumId,
      );
    },

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
