# Apple Music API

> RESTful web service API for accessing Apple Music catalog data including albums, artists, playlists, tracks, and search. Uses JWT-based developer tokens for authentication and returns JSON responses conforming to the JSON:API specification.

This API enables developers to integrate Apple Music catalog data into their applications. It provides programmatic access to the full Apple Music catalog, user library data (with user authorization), and playback controls through MusicKit.

## Getting Started

- [Getting Started](getting-started.md): Authentication setup, basic usage, and requirements

## Authentication

- [Developer Tokens](auth/developer-tokens.md): JWT-based authentication for accessing the API
- [User Authentication](auth/user-authentication.md): MusicKit JS for user-specific data access
- [Token Management](auth/token-management.md): Token expiration, renewal, and security best practices

## API Endpoints

- [Albums API](api/albums.md): Retrieve album details, tracks, and relationships
- [Artists API](api/artists.md): Access artist information, albums, and related artists
- [Playlists API](api/playlists.md): Get playlist information and tracks
- [Tracks API](api/tracks.md): Get track metadata and relationships
- [Search API](api/search.md): Search across the Apple Music catalog

## Core Concepts

- [Error Handling](core/error-handling.md): HTTP status codes, error responses, and rate limiting
- [Request Format](core/request-format.md): Headers, parameters, and JSON:API specification
- [Response Format](core/response-format.md): JSON:API structure, relationships, and metadata
- [TypeScript Usage](core/typescript.md): Type definitions and best practices

## Optional

- [Rate Limits](reference/rate-limits.md): API rate limiting policies and handling
- [Localization](reference/localization.md): Multi-language support and storefronts
- [API Reference](https://developer.apple.com/documentation/applemusicapi): Official Apple Music API documentation
