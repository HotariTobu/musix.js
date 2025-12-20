# Enhancement: Spotify Adapter Common Features

> Add common music service features to the Spotify Adapter

## Overview

Enhance the Spotify Adapter with additional API methods that are common across music streaming services, including batch retrieval, extended search, related data fetching, user authentication, playback control, and user library access.

## Background & Purpose

The current Spotify Adapter provides basic single-item retrieval and track search using Client Credentials Flow. However, musix.js aims to provide:

- Batch operations to reduce API calls and improve performance
- Search across all content types (not just tracks)
- Related data (artist's albums, artist's top tracks, album tracks)
- **User authentication for personalized features**
- **Playback control (play, pause, skip, seek)**
- **User library access (saved tracks, playlists)**

These features are common across music services (Spotify, Apple Music, YouTube Music) and should be part of the unified musix.js interface.

## Current Behavior

The adapter currently supports:

- `getTrack(id)`: Get single track
- `searchTracks(query, options)`: Search tracks only
- `getAlbum(id)`: Get single album
- `getArtist(id)`: Get single artist
- `getPlaylist(id)`: Get single playlist
- Authentication: Client Credentials Flow only (public data)

## Proposed Changes

### Batch Retrieval

- [ ] CH-001: Add `getTracks(ids)` method to retrieve multiple tracks in one request
- [ ] CH-002: Add `getAlbums(ids)` method to retrieve multiple albums in one request
- [ ] CH-003: Add `getArtists(ids)` method to retrieve multiple artists in one request

### Extended Search

- [ ] CH-004: Add `searchAlbums(query, options)` method
- [ ] CH-005: Add `searchArtists(query, options)` method
- [ ] CH-006: Add `searchPlaylists(query, options)` method

### Related Data

- [ ] CH-007: Add `getArtistAlbums(artistId, options)` method
- [ ] CH-008: Add `getArtistTopTracks(artistId, market)` method
- [ ] CH-009: Add `getAlbumTracks(albumId, options)` method

### User Authentication

- [ ] CH-010: Add `createSpotifyAdapterWithUserAuth(config)` factory for user-authenticated adapter
- [ ] CH-011: Add `getCurrentUser()` method to get authenticated user's profile

### Playback Control

- [ ] CH-012: Add `play(options?)` method to start/resume playback
- [ ] CH-013: Add `pause()` method to pause playback
- [ ] CH-014: Add `skipToNext()` method to skip to next track
- [ ] CH-015: Add `skipToPrevious()` method to skip to previous track
- [ ] CH-016: Add `seek(positionMs)` method to seek to position
- [ ] CH-017: Add `getPlaybackState()` method to get current playback state
- [ ] CH-018: Add `getAvailableDevices()` method to list available playback devices
- [ ] CH-019: Add `transferPlayback(deviceId)` method to transfer playback to another device

### User Library

- [ ] CH-020: Add `getSavedTracks(options?)` method to get user's saved tracks
- [ ] CH-021: Add `saveTrack(id)` / `removeSavedTrack(id)` methods
- [ ] CH-022: Add `getUserPlaylists(options?)` method to get user's playlists

## API Changes

### New Type Definitions

Add the following types to `src/core/types.ts`:

```typescript
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
  product?: "free" | "premium";  // Subscription level
  externalUrl: string;
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

/** Playback device */
export interface Device {
  id: string;
  name: string;
  type: string;  // e.g., "Computer", "Smartphone", "Speaker"
  isActive: boolean;
  volumePercent: number;
}

/** Options for starting playback */
export interface PlayOptions {
  trackIds?: string[];       // Play specific tracks
  contextUri?: string;       // Play album/playlist by URI
  offsetIndex?: number;      // Start at track index
  positionMs?: number;       // Start at position
  deviceId?: string;         // Target device
}

/** User authentication config (PKCE flow) */
export interface SpotifyUserAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}
```

### Updated SpotifyAdapter Interface

```typescript
/** Base adapter for public data (Client Credentials Flow) */
interface SpotifyAdapter {
  // Existing methods (unchanged)
  getTrack(id: string): Promise<Track>;
  searchTracks(query: string, options?: SearchOptions): Promise<SearchResult<Track>>;
  getAlbum(id: string): Promise<Album>;
  getArtist(id: string): Promise<Artist>;
  getPlaylist(id: string): Promise<Playlist>;

  // NEW: Batch retrieval
  getTracks(ids: string[]): Promise<Track[]>;
  getAlbums(ids: string[]): Promise<Album[]>;
  getArtists(ids: string[]): Promise<Artist[]>;

  // NEW: Extended search
  searchAlbums(query: string, options?: SearchOptions): Promise<SearchResult<Album>>;
  searchArtists(query: string, options?: SearchOptions): Promise<SearchResult<Artist>>;
  searchPlaylists(query: string, options?: SearchOptions): Promise<SearchResult<SimplifiedPlaylist>>;

  // NEW: Related data
  getArtistAlbums(artistId: string, options?: SearchOptions): Promise<PaginatedResult<Album>>;
  getArtistTopTracks(artistId: string, market: string): Promise<Track[]>;
  getAlbumTracks(albumId: string, options?: SearchOptions): Promise<PaginatedResult<Track>>;
}

/** Extended adapter with user authentication (PKCE Flow) */
interface SpotifyUserAdapter extends SpotifyAdapter {
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

  // User library
  getSavedTracks(options?: SearchOptions): Promise<PaginatedResult<Track>>;
  saveTrack(id: string): Promise<void>;
  removeSavedTrack(id: string): Promise<void>;
  getUserPlaylists(options?: SearchOptions): Promise<PaginatedResult<SimplifiedPlaylist>>;
}
```

### Factory Functions

```typescript
/** Create adapter with Client Credentials (public data only) */
function createSpotifyAdapter(config: SpotifyConfig): SpotifyAdapter;

/** Create adapter with User Authorization (PKCE flow, user-specific data + playback) */
function createSpotifyUserAdapter(config: SpotifyUserAuthConfig): SpotifyUserAdapter;
```

### Batch API Constraints

| Method | Maximum IDs | Error on Exceed |
|--------|-------------|-----------------|
| `getTracks` | 50 | Throws `ValidationError` |
| `getAlbums` | 20 | Throws `ValidationError` |
| `getArtists` | 50 | Throws `ValidationError` |

### New Error Types

Add to `src/core/errors.ts`:

```typescript
/** Validation error for invalid input parameters */
export class ValidationError extends Error {
  override name = "ValidationError" as const;
  constructor(message: string) {
    super(message);
  }
}

/** Premium required error for playback features */
export class PremiumRequiredError extends Error {
  override name = "PremiumRequiredError" as const;
  constructor() {
    super("Spotify Premium subscription is required for playback control");
  }
}

/** No active device error */
export class NoActiveDeviceError extends Error {
  override name = "NoActiveDeviceError" as const;
  constructor() {
    super("No active playback device found. Open Spotify on a device first.");
  }
}
```

### Required OAuth Scopes

For `createSpotifyUserAdapter`, the following scopes are recommended:

```typescript
const RECOMMENDED_SCOPES = [
  // User profile
  "user-read-private",
  "user-read-email",
  // Playback
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  // Library
  "user-library-read",
  "user-library-modify",
  // Playlists
  "playlist-read-private",
  "playlist-read-collaborative",
];
```

## Acceptance Criteria

### Batch Retrieval

#### AC-001: Get Multiple Tracks [CH-001]

- **Given**: Valid adapter with authentication
- **When**: `getTracks(["id1", "id2", "id3"])` is called with valid IDs
- **Then**:
  - Returns array of Track objects
  - Array length matches number of valid IDs
  - Each Track has required fields (id, name, artists, album, durationMs)

#### AC-002: Get Multiple Tracks - Exceeds Limit [CH-001]

- **Given**: Valid adapter with authentication
- **When**: `getTracks` is called with more than 50 IDs
- **Then**:
  - Throws `ValidationError` with message: "getTracks accepts maximum 50 IDs, received {count}"

#### AC-003: Get Multiple Tracks - Some Not Found [CH-001]

- **Given**: Valid adapter with authentication
- **When**: `getTracks` is called with mix of valid and invalid IDs
- **Then**:
  - Returns array containing only valid tracks
  - Invalid IDs are filtered out (no error thrown)

#### AC-004: Get Multiple Albums [CH-002]

- **Given**: Valid adapter with authentication
- **When**: `getAlbums(["id1", "id2"])` is called with valid IDs
- **Then**:
  - Returns array of Album objects
  - Each Album has required fields (id, name, artists, releaseDate, totalTracks, images)

#### AC-005: Get Multiple Albums - Exceeds Limit [CH-002]

- **Given**: Valid adapter with authentication
- **When**: `getAlbums` is called with more than 20 IDs
- **Then**:
  - Throws `ValidationError` with message: "getAlbums accepts maximum 20 IDs, received {count}"

#### AC-006: Get Multiple Artists [CH-003]

- **Given**: Valid adapter with authentication
- **When**: `getArtists(["id1", "id2"])` is called with valid IDs
- **Then**:
  - Returns array of Artist objects
  - Each Artist has required fields (id, name, externalUrl)

#### AC-007: Get Multiple Artists - Exceeds Limit [CH-003]

- **Given**: Valid adapter with authentication
- **When**: `getArtists` is called with more than 50 IDs
- **Then**:
  - Throws `ValidationError` with message: "getArtists accepts maximum 50 IDs, received {count}"

### Extended Search

#### AC-008: Search Albums [CH-004]

- **Given**: Valid adapter with authentication
- **When**: `searchAlbums("abbey road")` is called
- **Then**:
  - Returns `SearchResult<Album>`
  - `items` contains Album objects
  - `total`, `limit`, `offset` are present

#### AC-009: Search Artists [CH-005]

- **Given**: Valid adapter with authentication
- **When**: `searchArtists("beatles")` is called
- **Then**:
  - Returns `SearchResult<Artist>`
  - `items` contains Artist objects
  - `total`, `limit`, `offset` are present

#### AC-010: Search Playlists [CH-006]

- **Given**: Valid adapter with authentication
- **When**: `searchPlaylists("workout")` is called
- **Then**:
  - Returns `SearchResult<SimplifiedPlaylist>`
  - `items` contains SimplifiedPlaylist objects with `totalTracks` count
  - `total`, `limit`, `offset` are present

### Related Data

#### AC-011: Get Artist Albums [CH-007]

- **Given**: Valid adapter with authentication
- **When**: `getArtistAlbums(artistId)` is called with valid artist ID
- **Then**:
  - Returns `PaginatedResult<Album>`
  - `items` contains Album objects
  - `hasNext` is `true` if `offset + items.length < total`, otherwise `false`

#### AC-012: Get Artist Albums - Pagination [CH-007]

- **Given**: Valid adapter with authentication
- **When**: `getArtistAlbums(artistId, { limit: 10, offset: 20 })` is called
- **Then**:
  - Returns results starting from offset 20
  - Maximum 10 items returned

#### AC-013: Get Artist Top Tracks [CH-008]

- **Given**: Valid adapter with authentication
- **When**: `getArtistTopTracks(artistId, "US")` is called
- **Then**:
  - Returns array of Track objects (up to 10)
  - Tracks are ordered by popularity (descending)

#### AC-014: Get Album Tracks [CH-009]

- **Given**: Valid adapter with authentication
- **When**: `getAlbumTracks(albumId)` is called with valid album ID
- **Then**:
  - Returns `PaginatedResult<Track>`
  - `items` contains Track objects
  - `hasNext` indicates if more tracks are available

### User Authentication

#### AC-015: Create User Adapter [CH-010]

- **Given**: Valid client ID and redirect URI
- **When**: `createSpotifyUserAdapter(config)` is called in browser
- **Then**:
  - Returns `SpotifyUserAdapter` instance
  - If user is not authenticated, first API call triggers OAuth redirect to Spotify
  - After user grants permission, Spotify redirects back to `redirectUri`
  - SDK automatically exchanges code for tokens and stores them

#### AC-015a: OAuth Callback Handling [CH-010]

- **Given**: User has been redirected back from Spotify with authorization code
- **When**: Page loads with code in URL query params
- **Then**:
  - SDK detects callback and exchanges code for access token
  - Token is stored in localStorage
  - Subsequent API calls use the stored token

#### AC-015b: Token Refresh [CH-010]

- **Given**: User is authenticated but access token has expired
- **When**: Any API method is called
- **Then**:
  - SDK automatically refreshes token using refresh token
  - API call completes successfully
  - New token is stored

#### AC-016: Get Current User [CH-011]

- **Given**: User is authenticated
- **When**: `getCurrentUser()` is called
- **Then**:
  - Returns `CurrentUser` with id, displayName, product (subscription level)

### Playback Control

#### AC-017: Play Track [CH-012]

- **Given**: User is authenticated with Premium
- **When**: `play({ trackIds: ["trackId"] })` is called
- **Then**:
  - Playback starts on active device
  - No error thrown

#### AC-018: Play - No Premium [CH-012]

- **Given**: User is authenticated without Premium
- **When**: `play()` is called
- **Then**:
  - Throws `PremiumRequiredError`

#### AC-019: Play - No Active Device [CH-012]

- **Given**: User has Premium but no active device
- **When**: `play()` is called without deviceId
- **Then**:
  - Throws `NoActiveDeviceError`

#### AC-020: Pause [CH-013]

- **Given**: User is authenticated with Premium, playback is active
- **When**: `pause()` is called
- **Then**:
  - Playback pauses

#### AC-021: Skip to Next [CH-014]

- **Given**: User is authenticated with Premium, playback is active
- **When**: `skipToNext()` is called
- **Then**:
  - Playback skips to next track

#### AC-022: Skip to Previous [CH-015]

- **Given**: User is authenticated with Premium, playback is active
- **When**: `skipToPrevious()` is called
- **Then**:
  - Playback skips to previous track

#### AC-023: Seek [CH-016]

- **Given**: User is authenticated with Premium, playback is active
- **When**: `seek(60000)` is called (1 minute)
- **Then**:
  - Playback position moves to 1:00

#### AC-024: Get Playback State [CH-017]

- **Given**: User is authenticated
- **When**: `getPlaybackState()` is called
- **Then**:
  - Returns `PlaybackState` with isPlaying, track, progressMs, device
  - Returns `null` if no active playback

#### AC-025: Get Available Devices [CH-018]

- **Given**: User is authenticated
- **When**: `getAvailableDevices()` is called
- **Then**:
  - Returns array of `Device` objects

#### AC-026: Transfer Playback [CH-019]

- **Given**: User is authenticated with Premium
- **When**: `transferPlayback(deviceId)` is called
- **Then**:
  - Playback transfers to specified device

### User Library

#### AC-027: Get Saved Tracks [CH-020]

- **Given**: User is authenticated
- **When**: `getSavedTracks()` is called
- **Then**:
  - Returns `PaginatedResult<Track>` with user's saved tracks

#### AC-028: Save Track [CH-021]

- **Given**: User is authenticated
- **When**: `saveTrack(trackId)` is called
- **Then**:
  - Track is added to user's library

#### AC-029: Remove Saved Track [CH-021]

- **Given**: User is authenticated, track is saved
- **When**: `removeSavedTrack(trackId)` is called
- **Then**:
  - Track is removed from user's library

#### AC-030: Get User Playlists [CH-022]

- **Given**: User is authenticated
- **When**: `getUserPlaylists()` is called
- **Then**:
  - Returns `PaginatedResult<SimplifiedPlaylist>` with user's playlists

### Error Handling

#### AC-031: Empty Array Handling [CH-001, CH-002, CH-003]

- **Given**: Valid adapter with authentication
- **When**: Batch method is called with empty array `[]`
- **Then**:
  - Returns empty array `[]` without making API call

#### AC-032: Rate Limit [All]

- **Given**: Rate limit is exceeded
- **When**: Any method is called
- **Then**:
  - Throws `RateLimitError` with `retryAfter` value

## Implementation Notes

### Files to Modify

- `src/core/types.ts`: Add new types, update interfaces
- `src/core/errors.ts`: Add `ValidationError`, `PremiumRequiredError`, `NoActiveDeviceError`
- `src/adapters/spotify/index.ts`: Implement new methods, add user adapter factory

### Spotify SDK Methods

| New Method | Spotify SDK Method |
|------------|-------------------|
| `getTracks` | `sdk.tracks.get(ids)` |
| `getAlbums` | `sdk.albums.get(ids)` |
| `getArtists` | `sdk.artists.get(ids)` |
| `searchAlbums` | `sdk.search(query, ["album"])` |
| `searchArtists` | `sdk.search(query, ["artist"])` |
| `searchPlaylists` | `sdk.search(query, ["playlist"])` |
| `getArtistAlbums` | `sdk.artists.albums(artistId)` |
| `getArtistTopTracks` | `sdk.artists.topTracks(artistId, market)` |
| `getAlbumTracks` | `sdk.albums.tracks(albumId)` |
| `getCurrentUser` | `sdk.currentUser.profile()` |
| `play` | `sdk.player.startResumePlayback(deviceId, context, uris, offset, positionMs)` |
| `pause` | `sdk.player.pausePlayback(deviceId)` |
| `skipToNext` | `sdk.player.skipToNext(deviceId)` |
| `skipToPrevious` | `sdk.player.skipToPrevious(deviceId)` |
| `seek` | `sdk.player.seekToPosition(positionMs, deviceId)` |
| `getPlaybackState` | `sdk.player.getPlaybackState()` |
| `getAvailableDevices` | `sdk.player.getAvailableDevices()` |
| `transferPlayback` | `sdk.player.transferPlayback(deviceIds, play)` |
| `getSavedTracks` | `sdk.currentUser.tracks.savedTracks(limit, offset)` |
| `saveTrack` | `sdk.currentUser.tracks.saveTracks(ids)` |
| `removeSavedTrack` | `sdk.currentUser.tracks.removeSavedTracks(ids)` |
| `getUserPlaylists` | `sdk.currentUser.playlists.playlists(limit, offset)` |

### Authentication Flow

1. `createSpotifyUserAdapter` uses `SpotifyApi.withUserAuthorization()` (PKCE flow)
2. First API call triggers OAuth redirect if not authenticated
3. SDK handles callback automatically (detects code in URL, exchanges for token)
4. Tokens stored in localStorage (browser) or memory (Node.js)
5. SDK auto-refreshes expired tokens using refresh token

### Premium Detection Strategy

Do NOT pre-check `currentUser.product` before playback calls. Instead:

1. Call playback API directly
2. Catch 403 Forbidden response from Spotify
3. Transform to `PremiumRequiredError`

This avoids an extra API call for users who have Premium (the common case).

### Batch Error Handling

Batch methods (`getTracks`, `getAlbums`, `getArtists`) differ from single-item methods:

- **Single-item** (`getTrack`, `getAlbum`, etc.): Throws `NotFoundError` for invalid ID
- **Batch**: Filters out null/invalid items, returns only valid results

This matches Spotify API behavior where batch endpoints return `null` for invalid IDs in the response array. Rationale:
- Throwing on partial failure would break the entire batch for one bad ID
- Callers can compare input/output array lengths to detect missing items if needed

### PlayOptions Validation

`PlayOptions.trackIds` and `PlayOptions.contextUri` are mutually exclusive. If both are provided, throw `ValidationError`. Only one playback target can be specified:
- `trackIds`: Play specific tracks
- `contextUri`: Play an album, playlist, or artist context

### SDK Version Requirement

Requires `@spotify/web-api-ts-sdk` version 1.2.0 or higher for PKCE support.

## Change History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-20 | 1.0 | Initial version | - |
| 2025-12-20 | 1.1 | Clarify type definitions, error handling, and batch behavior | - |
| 2025-12-20 | 1.2 | Add user authentication, playback control, and user library features | - |
| 2025-12-20 | 1.3 | Add OAuth flow ACs, Premium detection strategy, batch error handling clarification, PlayOptions validation | - |
