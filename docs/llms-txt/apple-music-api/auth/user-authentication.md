# User Authentication

User authentication enables access to user-specific Apple Music data such as library contents, personal playlists, and listening history. This requires both a developer token and a user token.

## Overview

User authentication uses **MusicKit JS** (in browsers) or the user's Apple Music subscription. It provides:

- Access to user's library (saved albums, playlists, songs)
- User's listening history and recommendations
- Ability to add/remove items from user's library
- Access to user's personal playlists
- Playback capabilities (in supported environments)

## Two-Token System

Apple Music API uses two tokens for user-specific requests:

1. **Developer Token** (Bearer): Authenticates your application
2. **Music User Token**: Authenticates the specific user

Both tokens must be included in requests for user data:

```typescript
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${developerToken}`,
    'Music-User-Token': userToken
  }
});
```

## MusicKit JS (Browser)

### Setup

Include MusicKit JS in your HTML:

```html
<script src="https://js-cdn.music.apple.com/musickit/v3/musickit.js"></script>
```

### Initialize MusicKit

```typescript
declare global {
  interface Window {
    MusicKit: any;
  }
}

async function initializeMusicKit(developerToken: string) {
  await window.MusicKit.configure({
    developerToken: developerToken,
    app: {
      name: 'Your App Name',
      build: '1.0.0'
    }
  });

  return window.MusicKit.getInstance();
}
```

### User Authorization

```typescript
async function authorizeUser() {
  const music = window.MusicKit.getInstance();

  try {
    const userToken = await music.authorize();
    console.log('User authenticated:', userToken);
    return userToken;
  } catch (error) {
    console.error('Authorization failed:', error);
    throw error;
  }
}

// Check if already authorized
function isAuthorized(): boolean {
  const music = window.MusicKit.getInstance();
  return music.isAuthorized;
}

// Get current user token
function getUserToken(): string | undefined {
  const music = window.MusicKit.getInstance();
  return music.musicUserToken;
}
```

### Complete Example

```typescript
class AppleMusicClient {
  private developerToken: string;
  private musicKit: any;
  private userToken: string | null = null;

  constructor(developerToken: string) {
    this.developerToken = developerToken;
  }

  async initialize() {
    await window.MusicKit.configure({
      developerToken: this.developerToken,
      app: {
        name: 'My Music App',
        build: '1.0.0'
      }
    });

    this.musicKit = window.MusicKit.getInstance();
  }

  async authorize() {
    if (this.musicKit.isAuthorized) {
      this.userToken = this.musicKit.musicUserToken;
      return this.userToken;
    }

    try {
      this.userToken = await this.musicKit.authorize();
      return this.userToken;
    } catch (error) {
      console.error('Authorization failed:', error);
      throw error;
    }
  }

  async unauthorize() {
    await this.musicKit.unauthorize();
    this.userToken = null;
  }

  async fetchUserLibrary() {
    if (!this.userToken) {
      throw new Error('User not authorized');
    }

    const response = await fetch('https://api.music.apple.com/v1/me/library/albums', {
      headers: {
        'Authorization': `Bearer ${this.developerToken}`,
        'Music-User-Token': this.userToken
      }
    });

    return await response.json();
  }
}

// Usage
const client = new AppleMusicClient('your-developer-token');
await client.initialize();
await client.authorize();
const library = await client.fetchUserLibrary();
```

## User Endpoints

With a user token, you can access user-specific endpoints under `/v1/me/`:

### Library Resources

```typescript
// Get user's library albums
GET /v1/me/library/albums

// Get user's library artists
GET /v1/me/library/artists

// Get user's library playlists
GET /v1/me/library/playlists

// Get user's library songs
GET /v1/me/library/songs
```

### Recent Activity

```typescript
// Get recently played resources
GET /v1/me/recent/played

// Get recently played stations
GET /v1/me/recent/radio-stations

// Get recently added resources
GET /v1/me/library/recently-added
```

### Recommendations

```typescript
// Get personalized recommendations
GET /v1/me/recommendations

// Get personal heavy rotation
GET /v1/me/history/heavy-rotation
```

## Adding to User Library

```typescript
async function addToLibrary(
  developerToken: string,
  userToken: string,
  resourceType: 'albums' | 'playlists' | 'songs',
  ids: string[]
) {
  const response = await fetch(
    `https://api.music.apple.com/v1/me/library?ids[${resourceType}]=${ids.join(',')}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${developerToken}`,
        'Music-User-Token': userToken
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to add to library: ${response.status}`);
  }

  return response.status === 202; // Accepted
}

// Usage
await addToLibrary(
  developerToken,
  userToken,
  'albums',
  ['1234567890']
);
```

## Token Persistence

User tokens should be persisted across sessions:

```typescript
class UserTokenManager {
  private static STORAGE_KEY = 'apple_music_user_token';

  static saveToken(token: string) {
    localStorage.setItem(this.STORAGE_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  static clearToken() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// After authorization
const userToken = await musicKit.authorize();
UserTokenManager.saveToken(userToken);

// On app load
const savedToken = UserTokenManager.getToken();
if (savedToken) {
  // Validate token is still valid
  const isValid = await validateUserToken(savedToken);
  if (!isValid) {
    UserTokenManager.clearToken();
  }
}
```

## Token Validation

```typescript
async function validateUserToken(
  developerToken: string,
  userToken: string
): Promise<boolean> {
  try {
    const response = await fetch('https://api.music.apple.com/v1/me/storefront', {
      headers: {
        'Authorization': `Bearer ${developerToken}`,
        'Music-User-Token': userToken
      }
    });

    return response.ok;
  } catch {
    return false;
  }
}
```

## Handling Token Expiration

User tokens can expire. Handle this gracefully:

```typescript
async function fetchWithTokenRefresh<T>(
  url: string,
  developerToken: string,
  getUserToken: () => string | null,
  refreshToken: () => Promise<string>
): Promise<T> {
  let userToken = getUserToken();

  if (!userToken) {
    userToken = await refreshToken();
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${developerToken}`,
      'Music-User-Token': userToken
    }
  });

  if (response.status === 401) {
    // Token expired, refresh and retry
    userToken = await refreshToken();

    const retryResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${developerToken}`,
        'Music-User-Token': userToken
      }
    });

    return await retryResponse.json();
  }

  return await response.json();
}
```

## Privacy and Permissions

When requesting user authorization:

1. **Explain why**: Tell users why you need access to their library
2. **Request minimal scope**: Only request the permissions you need
3. **Respect denial**: Handle authorization rejection gracefully
4. **Provide sign-out**: Allow users to revoke access

```typescript
async function requestAuthWithContext() {
  const shouldAuthorize = confirm(
    'This app needs access to your Apple Music library to display your saved albums and playlists. Continue?'
  );

  if (!shouldAuthorize) {
    console.log('User declined authorization');
    return null;
  }

  try {
    const token = await musicKit.authorize();
    return token;
  } catch (error) {
    console.error('Authorization failed:', error);
    return null;
  }
}
```

## Common Patterns

### Check Subscription Status

```typescript
async function hasActiveSubscription(
  developerToken: string,
  userToken: string
): Promise<boolean> {
  try {
    const response = await fetch('https://api.music.apple.com/v1/me/storefront', {
      headers: {
        'Authorization': `Bearer ${developerToken}`,
        'Music-User-Token': userToken
      }
    });

    return response.ok;
  } catch {
    return false;
  }
}
```

### Get User's Storefront

```typescript
async function getUserStorefront(
  developerToken: string,
  userToken: string
): Promise<string> {
  const response = await fetch('https://api.music.apple.com/v1/me/storefront', {
    headers: {
      'Authorization': `Bearer ${developerToken}`,
      'Music-User-Token': userToken
    }
  });

  const data = await response.json();
  return data.data[0].id; // e.g., 'us', 'jp', 'gb'
}
```

## Error Handling

```typescript
async function handleUserRequest<T>(
  fetchFn: () => Promise<Response>
): Promise<T> {
  try {
    const response = await fetchFn();

    if (response.status === 401) {
      throw new Error('User token expired or invalid');
    }

    if (response.status === 403) {
      throw new Error('User does not have Apple Music subscription');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.title || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('User request failed:', error);
    throw error;
  }
}
```

## Related Documentation

- [Developer Tokens](developer-tokens.md): Creating and managing developer tokens
- [Token Management](token-management.md): Token lifecycle management
- [Error Handling](../core/error-handling.md): API error handling
