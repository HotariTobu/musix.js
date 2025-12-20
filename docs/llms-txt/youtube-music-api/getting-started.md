# Getting Started

## Prerequisites

- Google Account for accessing Google API Console
- Google Developers Console project with YouTube Data API v3 enabled
- Node.js 18.0.0 or higher (for server-side applications)
- Modern browser with fetch API support (for client-side applications)

## Setup Steps

### 1. Create Google Cloud Project

1. Go to the [Google API Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "Enabled APIs & services"
4. Search for "YouTube Data API v3" and enable it

### 2. Obtain Credentials

#### For API Key (Read-only access)

1. Go to "Credentials" in the API Console
2. Click "Create Credentials" and select "API key"
3. Copy your API key
4. (Optional) Restrict the key to YouTube Data API v3 and specific domains/IPs

#### For OAuth 2.0 (User-specific access)

1. Go to "Credentials" in the API Console
2. Click "Create Credentials" and select "OAuth client ID"
3. Choose application type:
   - "Web application" for server-side apps
   - "Web application" for JavaScript apps
4. Configure authorized redirect URIs
5. Download the client credentials JSON file

### 3. Make Your First Request

#### Using API Key (Server-side with fetch)

```typescript
const API_KEY = "your-api-key-here";

async function getVideo(videoId: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?` +
    `part=snippet,statistics&id=${videoId}&key=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.items[0];
}

// Get video details
const video = await getVideo("dQw4w9WgXcQ");
console.log(video.snippet.title);
console.log(video.statistics.viewCount);
```

#### Using OAuth 2.0 (Browser-side)

```typescript
// Initialize OAuth 2.0 flow
const CLIENT_ID = "your-client-id.apps.googleusercontent.com";
const REDIRECT_URI = "https://localhost:3000/callback";
const SCOPES = "https://www.googleapis.com/auth/youtube.readonly";

function authorize() {
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "token");
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("state", generateRandomState());

  window.location.href = authUrl.toString();
}

// Extract token from redirect
function getAccessToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get("access_token");
}

// Make authenticated request
async function getUserPlaylists(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/playlists?" +
    "part=snippet&mine=true",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  const data = await response.json();
  return data.items;
}
```

### 4. Search for Videos

```typescript
async function searchVideos(query: string, apiKey: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?` +
    `part=snippet&type=video&q=${encodeURIComponent(query)}&` +
    `maxResults=10&key=${apiKey}`
  );

  const data = await response.json();
  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt
  }));
}

// Search for music videos
const results = await searchVideos("jazz music", API_KEY);
console.table(results);
```

## Default Quota

New projects receive 10,000 quota units per day, which is sufficient for most use cases:

- Videos.list: 1 unit
- Channels.list: 1 unit
- Playlists.list: 1 unit
- Search.list: 100 units

Monitor your quota usage in the Google API Console under "Quotas".

## HTTP Request Format

All API requests follow this pattern:

```
GET https://www.googleapis.com/youtube/v3/{resource}?part={parts}&{parameters}&key={API_KEY}
```

Or with OAuth 2.0:

```
GET https://www.googleapis.com/youtube/v3/{resource}?part={parts}&{parameters}
Authorization: Bearer {access_token}
```

## Next Steps

- Learn about [OAuth 2.0 authentication](auth/oauth-server-side.md) for user-specific access
- Explore [API methods](api/videos.md) for different resources
- Understand [error handling](core/error-handling.md) and quota management
- Review [quota costs](core/quota-management.md) for optimization
