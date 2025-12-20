import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import type {
  MaxInt,
  Image as SpotifyImage,
  SimplifiedAlbum as SpotifySimplifiedAlbum,
  SimplifiedArtist as SpotifySimplifiedArtist,
  Track as SpotifyTrack,
} from "@spotify/web-api-ts-sdk";
import { NotFoundError } from "../../core/errors";
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
} from "../../core/types";

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
     * @throws {NotFoundError} If the track does not exist
     */
    async getTrack(id: string): Promise<Track> {
      try {
        const spotifyTrack = await sdk.tracks.get(id);
        return transformTrack(spotifyTrack);
      } catch (error) {
        // Check if it's a 404 error (track not found)
        if (error && typeof error === "object" && "status" in error) {
          if (error.status === 404) {
            throw new NotFoundError("track", id);
          }
        }
        // Re-throw any other errors
        throw error;
      }
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
