# Spotify Web API TypeScript SDK

> Official TypeScript SDK for the Spotify Web API providing type-safe access to Spotify's music catalog, user data, and playback controls. Supports Node.js 18+ and modern browsers with both ESM and CommonJS builds.

This SDK enables JavaScript and TypeScript developers to interact with Spotify's Web API with full type safety, automatic token refresh, and built-in error handling. It supports multiple authentication flows and is highly extensible for custom implementations.

## Installation

- [Getting Started](getting-started.md): Installation, setup, and basic usage

## Authentication

- [Client Credentials Flow](auth/client-credentials.md): Server-side authentication for non-user-specific requests
- [Authorization Code with PKCE](auth/authorization-code-pkce.md): Browser-based user authentication
- [Token Management](auth/token-management.md): Token refresh behavior and expiration handling

## API Methods

- [Current User API](api/current-user.md): User profile, top items, library, playlists, and followed artists
- [Player API](api/player.md): Playback control, devices, queue, and recently played
- [Browse API](api/browse.md): New releases, featured playlists, and categories
- [Recommendations API](api/recommendations.md): Track recommendations based on seeds and audio features
- [Tracks API](api/tracks.md): Get track information and audio features
- [Albums API](api/albums.md): Retrieve album details and tracks
- [Artists API](api/artists.md): Access artist information and related artists
- [Playlists API](api/playlists.md): Manage and retrieve playlist data
- [Search API](api/search.md): Search across tracks, albums, artists, and playlists

## Core Concepts

- [Error Handling](core/error-handling.md): HTTP errors, rate limiting, and exception handling
- [TypeScript Usage](core/typescript.md): Type definitions, interfaces, and type safety
- [Customization](core/customization.md): Custom fetch, caching, and request/response hooks

## Optional

- [Testing](reference/testing.md): Integration testing with Spotify Developer credentials
- [API Reference](https://developer.spotify.com/documentation/web-api): Official Spotify Web API documentation
- [GitHub Repository](https://github.com/spotify/spotify-web-api-ts-sdk): Source code and issue tracking
