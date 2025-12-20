import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import type {
  Album,
  Artist,
  Playlist,
  SearchOptions,
  SearchResult,
  SpotifyAdapter,
  SpotifyConfig,
  Track,
} from "../../core/types";

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
  );

  // Return adapter object implementing SpotifyAdapter interface
  return {
    /**
     * Retrieves a track by its Spotify ID.
     * @param id - The Spotify track ID
     * @returns Promise resolving to Track object
     */
    async getTrack(id: string): Promise<Track> {
      throw new Error("Not implemented");
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
      throw new Error("Not implemented");
    },

    /**
     * Retrieves an album by its Spotify ID.
     * @param id - The Spotify album ID
     * @returns Promise resolving to Album object
     */
    async getAlbum(id: string): Promise<Album> {
      throw new Error("Not implemented");
    },

    /**
     * Retrieves an artist by their Spotify ID.
     * @param id - The Spotify artist ID
     * @returns Promise resolving to Artist object
     */
    async getArtist(id: string): Promise<Artist> {
      throw new Error("Not implemented");
    },

    /**
     * Retrieves a playlist by its Spotify ID.
     * @param id - The Spotify playlist ID
     * @returns Promise resolving to Playlist object
     */
    async getPlaylist(id: string): Promise<Playlist> {
      throw new Error("Not implemented");
    },
  };
}
