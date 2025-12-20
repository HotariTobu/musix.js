# YouTube Data API v3

> Official REST API for accessing YouTube's video catalog, channels, playlists, and search functionality. Supports OAuth 2.0 and API key authentication with RESTful endpoints for reading and managing YouTube content. Default quota: 10,000 units/day.

This API enables developers to integrate YouTube features into applications with support for video retrieval, playlist management, channel information, and content search. It provides comprehensive access to YouTube's public data and user-specific content through authenticated requests.

## Installation

- [Getting Started](getting-started.md): Setup, credentials, and basic usage

## Authentication

- [API Keys](auth/api-keys.md): Simple authentication for read-only public data access
- [OAuth 2.0 Server-Side](auth/oauth-server-side.md): Server-side web app authentication with refresh tokens
- [OAuth 2.0 Client-Side](auth/oauth-client-side.md): Browser-based JavaScript app authentication
- [Token Management](auth/token-management.md): Token refresh, expiration, and revocation

## API Methods

- [Videos API](api/videos.md): Retrieve video information, statistics, and content details
- [Channels API](api/channels.md): Access channel metadata, branding, and statistics
- [Playlists API](api/playlists.md): Retrieve and manage playlist data
- [Search API](api/search.md): Search across videos, channels, and playlists

## Core Concepts

- [Error Handling](core/error-handling.md): HTTP errors, quota limits, and retry strategies
- [Quota Management](core/quota-management.md): Understanding quota costs and optimization
- [TypeScript Usage](core/typescript.md): Type definitions and usage patterns for TypeScript/JavaScript

## Optional

- [API Scopes](reference/scopes.md): OAuth 2.0 scope reference and permissions
- [Official Documentation](https://developers.google.com/youtube/v3): Complete API reference
- [API Explorer](https://developers.google.com/youtube/v3/docs): Interactive API testing tool
