/** Image with optional dimensions */
export interface Image {
  url: string;
  width: number | null;
  height: number | null;
}

/** User information */
export interface User {
  id: string;
  displayName: string;
}

/** musix.js common Artist type */
export interface Artist {
  id: string;
  name: string;
  genres?: string[];
  images?: Image[];
  externalUrl: string;
}

/** musix.js common Album type */
export interface Album {
  id: string;
  name: string;
  artists: Artist[];
  releaseDate: string;
  totalTracks: number;
  images: Image[];
  externalUrl: string;
}

/** musix.js common Track type */
export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  durationMs: number;
  previewUrl: string | null;
  externalUrl: string;
}

/** musix.js common Playlist type */
export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  owner: User;
  tracks: Track[];
  images: Image[];
  externalUrl: string;
}

/** Search options for paginated queries */
export interface SearchOptions {
  limit?: number;
  offset?: number;
}

/** Search result with pagination info */
export interface SearchResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/** Spotify API configuration */
export interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
}

/** Spotify adapter interface */
export interface SpotifyAdapter {
  getTrack(id: string): Promise<Track>;
  searchTracks(
    query: string,
    options?: SearchOptions,
  ): Promise<SearchResult<Track>>;
  getAlbum(id: string): Promise<Album>;
  getArtist(id: string): Promise<Artist>;
  getPlaylist(id: string): Promise<Playlist>;
}
