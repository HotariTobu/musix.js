# OAuth 2.0 Scopes

Reference guide for YouTube Data API OAuth 2.0 scopes and permissions.

## Available Scopes

### youtube.readonly

**Full scope:** `https://www.googleapis.com/auth/youtube.readonly`

**Access:** Read-only access to YouTube data

**Use cases:**
- View user's playlists
- View liked videos
- View subscriptions
- View channel information
- View video details

**Example:**
```typescript
const scopes = ["https://www.googleapis.com/auth/youtube.readonly"];

// Can read but cannot modify
const playlists = await getUserPlaylists(accessToken);
const liked = await getLikedVideos(accessToken);
```

**Limitations:**
- Cannot create or modify content
- Cannot upload videos
- Cannot manage playlists
- Cannot post comments

### youtube

**Full scope:** `https://www.googleapis.com/auth/youtube`

**Access:** Full read/write access to YouTube account (except video uploads)

**Use cases:**
- Manage playlists (create, update, delete)
- Subscribe to channels
- Rate videos
- Post and manage comments
- Manage channel settings

**Example:**
```typescript
const scopes = ["https://www.googleapis.com/auth/youtube"];

// Can create and modify playlists
await createPlaylist("My Music", accessToken);
await addVideoToPlaylist(playlistId, videoId, accessToken);
await rateVideo(videoId, "like", accessToken);
```

**Does NOT include:**
- Video uploads (requires youtube.upload)
- Analytics data (requires yt-analytics.readonly)

### youtube.upload

**Full scope:** `https://www.googleapis.com/auth/youtube.upload`

**Access:** Upload and manage videos

**Use cases:**
- Upload videos
- Update video metadata
- Delete videos
- Set video thumbnails

**Example:**
```typescript
const scopes = ["https://www.googleapis.com/auth/youtube.upload"];

// Upload video
await uploadVideo(videoFile, metadata, accessToken);
await updateVideoMetadata(videoId, newMetadata, accessToken);
```

### youtube.force-ssl

**Full scope:** `https://www.googleapis.com/auth/youtube.force-ssl`

**Access:** Full read/write access (SSL required)

**Use cases:**
- All operations from `youtube` scope
- Upload videos
- Complete account management

**Example:**
```typescript
const scopes = ["https://www.googleapis.com/auth/youtube.force-ssl"];

// Can do everything except analytics
await uploadVideo(videoFile, metadata, accessToken);
await createPlaylist("My Playlist", accessToken);
await rateVideo(videoId, "like", accessToken);
```

**Note:** This is the most commonly used scope for applications needing full access.

### youtubepartner

**Full scope:** `https://www.googleapis.com/auth/youtubepartner`

**Access:** Partner-level access for content owners

**Use cases:**
- Manage content ownership
- Claim videos
- Access partner-only features

**Requirements:**
- YouTube Partner account
- Content owner status

### yt-analytics.readonly

**Full scope:** `https://www.googleapis.com/auth/yt-analytics.readonly`

**Access:** Read-only access to YouTube Analytics

**Use cases:**
- View analytics reports
- Access performance metrics
- View revenue data (if applicable)

**Note:** This is for YouTube Analytics API, not YouTube Data API

### yt-analytics-monetary.readonly

**Full scope:** `https://www.googleapis.com/auth/yt-analytics-monetary.readonly`

**Access:** Read-only access to monetary analytics

**Use cases:**
- View revenue reports
- Access monetization data

## Scope Selection Guide

### Read-Only Application

```typescript
const scopes = [
  "https://www.googleapis.com/auth/youtube.readonly"
];

// Can only read data
const playlists = await getMyPlaylists(accessToken);
const subscriptions = await getMySubscriptions(accessToken);
```

### Music Player Application

```typescript
const scopes = [
  "https://www.googleapis.com/auth/youtube.readonly"
];

// Read user's playlists and liked videos
const playlists = await getMyPlaylists(accessToken);
const likedVideos = await getLikedVideos(accessToken);
```

### Playlist Management Application

```typescript
const scopes = [
  "https://www.googleapis.com/auth/youtube.force-ssl"
];

// Create and manage playlists
await createPlaylist("My Music Collection", accessToken);
await addVideoToPlaylist(playlistId, videoId, accessToken);
await removeVideoFromPlaylist(playlistId, itemId, accessToken);
```

### Video Upload Application

```typescript
const scopes = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.force-ssl"
];

// Upload and manage videos
await uploadVideo(videoFile, metadata, accessToken);
await updateVideoPrivacy(videoId, "public", accessToken);
```

### Analytics Dashboard

```typescript
const scopes = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly"
];

// Read channel data and analytics
const channel = await getMyChannel(accessToken);
const analytics = await getChannelAnalytics(channelId, accessToken);
```

## Scope Combinations

### Common Combinations

```typescript
// Read-only with analytics
const scopes = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly"
];

// Full access with upload
const scopes = [
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtube.upload"
];

// Partner with analytics
const scopes = [
  "https://www.googleapis.com/auth/youtubepartner",
  "https://www.googleapis.com/auth/yt-analytics.readonly"
];
```

## Incremental Authorization

Request additional scopes as needed:

```typescript
// Initial authorization - read-only
const initialScopes = [
  "https://www.googleapis.com/auth/youtube.readonly"
];

// User wants to create playlist - request additional scope
const additionalScopes = [
  "https://www.googleapis.com/auth/youtube.force-ssl"
];

function requestAdditionalScopes(newScopes: string[]) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", newScopes.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true"); // Keep existing scopes
  url.searchParams.set("state", generateState());

  window.location.href = url.toString();
}
```

## Scope Validation

Check if token has required scopes:

```typescript
interface TokenInfo {
  scope: string;
  expires_in: number;
  access_type: string;
}

async function getTokenInfo(accessToken: string): Promise<TokenInfo> {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
  );
  return response.json();
}

async function hasScope(accessToken: string, requiredScope: string): Promise<boolean> {
  const tokenInfo = await getTokenInfo(accessToken);
  const scopes = tokenInfo.scope.split(" ");
  return scopes.includes(requiredScope);
}

// Usage
const canUpload = await hasScope(
  accessToken,
  "https://www.googleapis.com/auth/youtube.upload"
);

if (!canUpload) {
  console.log("Need upload permission");
  requestAdditionalScopes(["https://www.googleapis.com/auth/youtube.upload"]);
}
```

## Scope Requirements by Operation

### Videos

| Operation | Required Scope |
|-----------|---------------|
| Get video | None (API key) or youtube.readonly |
| Get liked videos | youtube.readonly |
| Upload video | youtube.upload |
| Update video | youtube.upload or youtube.force-ssl |
| Delete video | youtube.upload or youtube.force-ssl |
| Rate video | youtube.force-ssl |

### Playlists

| Operation | Required Scope |
|-----------|---------------|
| Get public playlist | None (API key) |
| Get user's playlists | youtube.readonly |
| Create playlist | youtube.force-ssl |
| Update playlist | youtube.force-ssl |
| Delete playlist | youtube.force-ssl |
| Add to playlist | youtube.force-ssl |

### Channels

| Operation | Required Scope |
|-----------|---------------|
| Get public channel | None (API key) |
| Get user's channels | youtube.readonly |
| Update channel | youtube.force-ssl |

### Subscriptions

| Operation | Required Scope |
|-----------|---------------|
| Get subscriptions | youtube.readonly |
| Subscribe to channel | youtube.force-ssl |
| Unsubscribe | youtube.force-ssl |

### Comments

| Operation | Required Scope |
|-----------|---------------|
| Get comments | None (API key) or youtube.readonly |
| Post comment | youtube.force-ssl |
| Update comment | youtube.force-ssl |
| Delete comment | youtube.force-ssl |

## Best Practices

1. **Request minimal scopes**: Only request permissions you need
2. **Use incremental authorization**: Request additional scopes when needed
3. **Explain permissions**: Tell users why you need each scope
4. **Handle denials gracefully**: Provide fallback functionality
5. **Validate scopes**: Check token has required permissions before operations
6. **Use readonly when possible**: Prefer readonly for data access
7. **Combine related scopes**: Request all needed scopes together initially
8. **Document requirements**: Clearly state scope requirements in documentation

## Scope Migration

Updating scopes for existing users:

```typescript
class ScopeManager {
  async getCurrentScopes(accessToken: string): Promise<string[]> {
    const tokenInfo = await getTokenInfo(accessToken);
    return tokenInfo.scope.split(" ");
  }

  async needsAdditionalScopes(
    accessToken: string,
    requiredScopes: string[]
  ): Promise<boolean> {
    const currentScopes = await this.getCurrentScopes(accessToken);
    return requiredScopes.some(scope => !currentScopes.includes(scope));
  }

  async requestMissingScopes(
    accessToken: string,
    requiredScopes: string[]
  ): Promise<void> {
    const needsAuth = await this.needsAdditionalScopes(accessToken, requiredScopes);

    if (needsAuth) {
      const currentScopes = await this.getCurrentScopes(accessToken);
      const missingScopes = requiredScopes.filter(
        scope => !currentScopes.includes(scope)
      );

      console.log("Requesting additional scopes:", missingScopes);
      requestAdditionalScopes(missingScopes);
    }
  }
}

// Usage
const scopeManager = new ScopeManager();

// Before creating playlist
await scopeManager.requestMissingScopes(
  accessToken,
  ["https://www.googleapis.com/auth/youtube.force-ssl"]
);
```

## Common Errors

### insufficientPermissions

Token lacks required scope:

```typescript
try {
  await createPlaylist("My Playlist", accessToken);
} catch (error: any) {
  if (error.reason === "insufficientPermissions") {
    console.log("Need youtube.force-ssl scope");
    requestAdditionalScopes([
      "https://www.googleapis.com/auth/youtube.force-ssl"
    ]);
  }
}
```

### User Denial

User denies permission request:

```typescript
// Handle OAuth callback
const error = params.get("error");
if (error === "access_denied") {
  console.log("User denied permission request");
  // Provide limited functionality or explain why permission is needed
}
```

## Related Topics

- [OAuth 2.0 Server-Side](../auth/oauth-server-side.md): Implement OAuth flow
- [OAuth 2.0 Client-Side](../auth/oauth-client-side.md): Browser-based OAuth
- [Token Management](../auth/token-management.md): Manage access tokens
- [Error Handling](../core/error-handling.md): Handle permission errors
