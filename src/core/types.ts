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

/** Simplified playlist for search results (without full track list) */
export interface SimplifiedPlaylist {
  id: string;
  name: string;
  description: string | null;
  owner: User;
  totalTracks: number;
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

/** Paginated result for list endpoints */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
}

/** Current user profile */
export interface CurrentUser {
  id: string;
  displayName: string;
  email?: string;
  images?: Image[];
  product?: "free" | "premium";
  externalUrl: string;
}

/** Playback device */
export interface Device {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  volumePercent: number;
}

/** Playback state */
export interface PlaybackState {
  isPlaying: boolean;
  track: Track | null;
  progressMs: number;
  durationMs: number;
  device: Device;
  shuffleState: boolean;
  repeatState: "off" | "track" | "context";
}

/** Options for starting playback */
export interface PlayOptions {
  trackIds?: string[];
  contextUri?: string;
  offsetIndex?: number;
  positionMs?: number;
  deviceId?: string;
}

/** User authentication config (PKCE flow) */
export interface SpotifyUserAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

/** Recommendation seeds */
export interface RecommendationSeeds {
  trackIds?: string[];
  artistIds?: string[];
  genres?: string[];
}

/** Recommendation options */
export interface RecommendationOptions {
  limit?: number;
  targetEnergy?: number;
  targetDanceability?: number;
  targetValence?: number;
  targetTempo?: number;
}

/** Recently played item with timestamp */
export interface RecentlyPlayedItem {
  track: Track;
  playedAt: string;
}

/** Time range for top items */
export type TimeRange = "short_term" | "medium_term" | "long_term";

/** Top items options */
export interface TopItemsOptions {
  limit?: number;
  offset?: number;
  timeRange?: TimeRange;
}

/** Playlist creation options */
export interface CreatePlaylistOptions {
  description?: string;
  public?: boolean;
  collaborative?: boolean;
}

/** Playlist update details */
export interface PlaylistDetails {
  name?: string;
  description?: string;
  public?: boolean;
}

/** Queue state */
export interface QueueState {
  currentlyPlaying: Track | null;
  queue: Track[];
}

/** Repeat mode */
export type RepeatMode = "off" | "track" | "context";

/** Spotify API configuration */
export interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
}

/** Spotify adapter interface */
export interface SpotifyAdapter {
  getTrack(id: string): Promise<Track>;
  getTracks(ids: string[]): Promise<Track[]>;
  searchTracks(
    query: string,
    options?: SearchOptions,
  ): Promise<SearchResult<Track>>;
  searchAlbums(
    query: string,
    options?: SearchOptions,
  ): Promise<SearchResult<Album>>;
  searchArtists(
    query: string,
    options?: SearchOptions,
  ): Promise<SearchResult<Artist>>;
  searchPlaylists(
    query: string,
    options?: SearchOptions,
  ): Promise<SearchResult<SimplifiedPlaylist>>;
  getAlbum(id: string): Promise<Album>;
  getAlbums(ids: string[]): Promise<Album[]>;
  getArtist(id: string): Promise<Artist>;
  getArtists(ids: string[]): Promise<Artist[]>;
  getArtistAlbums(
    artistId: string,
    options?: SearchOptions,
  ): Promise<PaginatedResult<Album>>;
  getArtistTopTracks(artistId: string, market: string): Promise<Track[]>;
  getAlbumTracks(
    albumId: string,
    options?: SearchOptions,
  ): Promise<PaginatedResult<Track>>;
  getPlaylist(id: string): Promise<Playlist>;
}

/** Extended adapter with user authentication (PKCE Flow) */
export interface SpotifyUserAdapter extends SpotifyAdapter {
  // User profile
  getCurrentUser(): Promise<CurrentUser>;

  // Playback control (requires Premium)
  play(options?: PlayOptions): Promise<void>;
  pause(): Promise<void>;
  skipToNext(): Promise<void>;
  skipToPrevious(): Promise<void>;
  seek(positionMs: number): Promise<void>;
  getPlaybackState(): Promise<PlaybackState | null>;
  getAvailableDevices(): Promise<Device[]>;
  transferPlayback(deviceId: string, play?: boolean): Promise<void>;
  setVolume(percent: number): Promise<void>;
  setShuffle(state: boolean): Promise<void>;
  setRepeat(state: RepeatMode): Promise<void>;
  getQueue(): Promise<QueueState>;
  addToQueue(trackId: string): Promise<void>;

  // User library - Tracks
  getSavedTracks(options?: SearchOptions): Promise<PaginatedResult<Track>>;
  saveTrack(id: string): Promise<void>;
  removeSavedTrack(id: string): Promise<void>;

  // User library - Albums
  getSavedAlbums(options?: SearchOptions): Promise<PaginatedResult<Album>>;
  saveAlbum(id: string): Promise<void>;
  removeSavedAlbum(id: string): Promise<void>;

  // User library - Artists
  getFollowedArtists(options?: SearchOptions): Promise<PaginatedResult<Artist>>;
  followArtist(id: string): Promise<void>;
  unfollowArtist(id: string): Promise<void>;

  // User library - Playlists
  getUserPlaylists(
    options?: SearchOptions,
  ): Promise<PaginatedResult<SimplifiedPlaylist>>;

  // Discovery
  getRecommendations(
    seeds: RecommendationSeeds,
    options?: RecommendationOptions,
  ): Promise<Track[]>;
  getRelatedArtists(artistId: string): Promise<Artist[]>;
  getNewReleases(options?: SearchOptions): Promise<PaginatedResult<Album>>;
  getRecentlyPlayed(
    options?: SearchOptions,
  ): Promise<PaginatedResult<RecentlyPlayedItem>>;
  getTopTracks(options?: TopItemsOptions): Promise<PaginatedResult<Track>>;
  getTopArtists(options?: TopItemsOptions): Promise<PaginatedResult<Artist>>;

  // Playlist management
  createPlaylist(
    name: string,
    options?: CreatePlaylistOptions,
  ): Promise<Playlist>;
  updatePlaylistDetails(
    playlistId: string,
    details: PlaylistDetails,
  ): Promise<void>;
  addTracksToPlaylist(playlistId: string, trackIds: string[]): Promise<void>;
  removeTracksFromPlaylist(
    playlistId: string,
    trackIds: string[],
  ): Promise<void>;
  getPlaylistTracks(
    playlistId: string,
    options?: SearchOptions,
  ): Promise<PaginatedResult<Track>>;
}
