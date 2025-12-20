// Core types
export type {
  Image,
  User,
  Artist,
  Album,
  Track,
  Playlist,
  SimplifiedPlaylist,
  SearchOptions,
  SearchResult,
  SpotifyConfig,
  SpotifyAdapter,
} from "./types";

// Error classes
export {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  NetworkError,
  SpotifyApiError,
} from "./errors";
