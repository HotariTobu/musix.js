# Enhancement: Spotify Adapter Common Features

> Add common music service features to the Spotify Adapter

## Overview

Enhance the Spotify Adapter with additional API methods that are common across music streaming services, including batch retrieval, extended search, and related data fetching.

## Background & Purpose

The current Spotify Adapter provides basic single-item retrieval and track search. However, real-world applications often need:

- Batch operations to reduce API calls and improve performance
- Search across all content types (not just tracks)
- Related data (artist's albums, artist's top tracks, album tracks)

These features are common across music services (Spotify, Apple Music, YouTube Music) and should be part of the unified musix.js interface.

## Current Behavior

The adapter currently supports:

- `getTrack(id)`: Get single track
- `searchTracks(query, options)`: Search tracks only
- `getAlbum(id)`: Get single album
- `getArtist(id)`: Get single artist
- `getPlaylist(id)`: Get single playlist

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
  totalTracks: number;  // Track count only, not full Track[]
  images: Image[];
  externalUrl: string;
}

/** Paginated result for list endpoints (extends SearchResult with hasNext) */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
}
```

### Updated SpotifyAdapter Interface

```typescript
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

  // NEW: Extended search (reuses existing SearchOptions)
  searchAlbums(query: string, options?: SearchOptions): Promise<SearchResult<Album>>;
  searchArtists(query: string, options?: SearchOptions): Promise<SearchResult<Artist>>;
  searchPlaylists(query: string, options?: SearchOptions): Promise<SearchResult<SimplifiedPlaylist>>;

  // NEW: Related data (reuses existing SearchOptions for pagination)
  getArtistAlbums(artistId: string, options?: SearchOptions): Promise<PaginatedResult<Album>>;
  getArtistTopTracks(artistId: string, market: string): Promise<Track[]>;
  getAlbumTracks(albumId: string, options?: SearchOptions): Promise<PaginatedResult<Track>>;
}
```

### Batch API Constraints

| Method | Maximum IDs | Error on Exceed |
|--------|-------------|-----------------|
| `getTracks` | 50 | Throws `ValidationError` |
| `getAlbums` | 20 | Throws `ValidationError` |
| `getArtists` | 50 | Throws `ValidationError` |

### New Error Type

Add to `src/core/errors.ts`:

```typescript
/** Validation error for invalid input parameters */
export class ValidationError extends Error {
  name = "ValidationError" as const;

  constructor(message: string) {
    super(message);
  }
}
```

## Acceptance Criteria

### AC-001: Get Multiple Tracks [CH-001]

- **Given**: Valid adapter with authentication
- **When**: `getTracks(["id1", "id2", "id3"])` is called with valid IDs
- **Then**:
  - Returns array of Track objects
  - Array length matches number of valid IDs
  - Each Track has required fields (id, name, artists, album, durationMs)

### AC-002: Get Multiple Tracks - Exceeds Limit [CH-001]

- **Given**: Valid adapter with authentication
- **When**: `getTracks` is called with more than 50 IDs
- **Then**:
  - Throws `ValidationError` with message: "getTracks accepts maximum 50 IDs, received {count}"

### AC-003: Get Multiple Tracks - Some Not Found [CH-001]

- **Given**: Valid adapter with authentication
- **When**: `getTracks` is called with mix of valid and invalid IDs
- **Then**:
  - Returns array containing only valid tracks
  - Invalid IDs are filtered out (no error thrown)
  - Note: This differs from single `getTrack()` which throws NotFoundError

### AC-004: Get Multiple Albums [CH-002]

- **Given**: Valid adapter with authentication
- **When**: `getAlbums(["id1", "id2"])` is called with valid IDs
- **Then**:
  - Returns array of Album objects
  - Each Album has required fields (id, name, artists, releaseDate, totalTracks, images)

### AC-005: Get Multiple Albums - Exceeds Limit [CH-002]

- **Given**: Valid adapter with authentication
- **When**: `getAlbums` is called with more than 20 IDs
- **Then**:
  - Throws `ValidationError` with message: "getAlbums accepts maximum 20 IDs, received {count}"

### AC-006: Get Multiple Artists [CH-003]

- **Given**: Valid adapter with authentication
- **When**: `getArtists(["id1", "id2"])` is called with valid IDs
- **Then**:
  - Returns array of Artist objects
  - Each Artist has required fields (id, name, externalUrl)

### AC-007: Get Multiple Artists - Exceeds Limit [CH-003]

- **Given**: Valid adapter with authentication
- **When**: `getArtists` is called with more than 50 IDs
- **Then**:
  - Throws `ValidationError` with message: "getArtists accepts maximum 50 IDs, received {count}"

### AC-008: Search Albums [CH-004]

- **Given**: Valid adapter with authentication
- **When**: `searchAlbums("abbey road")` is called
- **Then**:
  - Returns `SearchResult<Album>`
  - `items` contains Album objects
  - `total`, `limit`, `offset` are present

### AC-009: Search Artists [CH-005]

- **Given**: Valid adapter with authentication
- **When**: `searchArtists("beatles")` is called
- **Then**:
  - Returns `SearchResult<Artist>`
  - `items` contains Artist objects
  - `total`, `limit`, `offset` are present

### AC-010: Search Playlists [CH-006]

- **Given**: Valid adapter with authentication
- **When**: `searchPlaylists("workout")` is called
- **Then**:
  - Returns `SearchResult<SimplifiedPlaylist>`
  - `items` contains SimplifiedPlaylist objects with `totalTracks` (count) instead of full `tracks` array
  - `total`, `limit`, `offset` are present

### AC-011: Get Artist Albums [CH-007]

- **Given**: Valid adapter with authentication
- **When**: `getArtistAlbums(artistId)` is called with valid artist ID
- **Then**:
  - Returns `PaginatedResult<Album>`
  - `items` contains Album objects
  - `hasNext` is `true` if `offset + items.length < total`, otherwise `false`

### AC-012: Get Artist Albums - Pagination [CH-007]

- **Given**: Valid adapter with authentication
- **When**: `getArtistAlbums(artistId, { limit: 10, offset: 20 })` is called
- **Then**:
  - Returns results starting from offset 20
  - Maximum 10 items returned
  - `limit` and `offset` in response match requested values

### AC-013: Get Artist Top Tracks [CH-008]

- **Given**: Valid adapter with authentication
- **When**: `getArtistTopTracks(artistId, "US")` is called with valid artist ID and ISO 3166-1 alpha-2 market code
- **Then**:
  - Returns array of Track objects (up to 10, as per Spotify API)
  - Tracks are ordered by popularity (descending)

### AC-014: Get Album Tracks [CH-009]

- **Given**: Valid adapter with authentication
- **When**: `getAlbumTracks(albumId)` is called with valid album ID
- **Then**:
  - Returns `PaginatedResult<Track>`
  - `items` contains Track objects
  - `hasNext` is `true` if `offset + items.length < total`, otherwise `false`

### AC-015: Get Album Tracks - Pagination [CH-009]

- **Given**: Valid adapter with authentication
- **When**: `getAlbumTracks(albumId, { limit: 25, offset: 0 })` is called
- **Then**:
  - Returns first 25 tracks (or fewer if album has less)
  - `total` reflects actual total track count of the album

### AC-016: Error Handling - Not Found (Single-item methods) [All]

- **Given**: Valid adapter with authentication
- **When**: Single-item methods (`getArtistAlbums`, `getArtistTopTracks`, `getAlbumTracks`) are called with non-existent ID
- **Then**:
  - Throws `NotFoundError` with appropriate resourceType and resourceId

### AC-017: Error Handling - Rate Limit [All]

- **Given**: Rate limit is exceeded
- **When**: Any new method is called
- **Then**:
  - Throws `RateLimitError` with `retryAfter` value

### AC-018: Empty Array Handling [CH-001, CH-002, CH-003]

- **Given**: Valid adapter with authentication
- **When**: Batch method is called with empty array `[]`
- **Then**:
  - Returns empty array `[]` without making API call

## Implementation Notes

### Files to Modify

- `src/core/types.ts`: Add `SimplifiedPlaylist`, `PaginatedResult` types; update `SpotifyAdapter` interface
- `src/core/errors.ts`: Add `ValidationError` class
- `src/adapters/spotify/index.ts`: Implement new methods

### Spotify SDK Methods to Use

| New Method | Spotify SDK Method |
|------------|-------------------|
| `getTracks` | `sdk.tracks.get(ids)` |
| `getAlbums` | `sdk.albums.get(ids)` |
| `getArtists` | `sdk.artists.get(ids)` |
| `searchAlbums` | `sdk.search(query, ["album"])` |
| `searchArtists` | `sdk.search(query, ["artist"])` |
| `searchPlaylists` | `sdk.search(query, ["playlist"])` |
| `getArtistAlbums` | `sdk.artists.albums(artistId, ...)` |
| `getArtistTopTracks` | `sdk.artists.topTracks(artistId, market)` |
| `getAlbumTracks` | `sdk.albums.tracks(albumId, ...)` |

### Transform Functions

- Reuse existing: `transformTrack`, `transformAlbum`, `transformArtist`
- Create new: `transformSimplifiedPlaylist` for search results

### Batch Error Handling Clarification

- **Single-item methods** (`getTrack`, `getAlbum`, etc.): Throw `NotFoundError` for invalid ID
- **Batch methods** (`getTracks`, `getAlbums`, `getArtists`): Filter out null/invalid items, return only valid results
- This matches Spotify API behavior where batch endpoints return `null` for invalid IDs

## Change History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-20 | 1.0 | Initial version | - |
| 2025-12-20 | 1.1 | Clarify type definitions, error handling, and batch behavior per spec review | - |
