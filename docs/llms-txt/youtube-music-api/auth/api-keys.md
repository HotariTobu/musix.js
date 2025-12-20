# API Keys

API keys provide simple authentication for accessing public YouTube data without user-specific authorization. This is the easiest authentication method for read-only operations.

## When to Use API Keys

Use API keys when you need to:

- Access public video information
- Search for videos, channels, or playlists
- Retrieve channel metadata
- Get playlist contents
- Access any data that doesn't require user authentication

Do NOT use API keys for:

- Accessing private user data
- Uploading videos
- Creating or modifying playlists
- Subscribing to channels
- Rating videos or adding comments

For these operations, use [OAuth 2.0 authentication](oauth-server-side.md).

## Creating an API Key

1. Go to the [Google API Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "Credentials"
4. Click "Create Credentials" and select "API key"
5. Your API key is created and displayed

## Securing Your API Key

### Restrict by API

Limit the key to specific APIs:

1. Click on your API key in the Credentials page
2. Under "API restrictions", select "Restrict key"
3. Check "YouTube Data API v3"
4. Save changes

### Restrict by Application

#### HTTP Referrers (Websites)

For browser-based applications:

1. Select "HTTP referrers (web sites)"
2. Add allowed referrers:
   - `https://yourdomain.com/*`
   - `https://*.yourdomain.com/*`

#### IP Addresses (Servers)

For server-side applications:

1. Select "IP addresses"
2. Add your server's IP addresses

#### Android/iOS Apps

Use application restrictions for mobile apps instead of API keys when possible.

## Using API Keys in Requests

### Query Parameter (Recommended)

```typescript
const API_KEY = "your-api-key-here";

async function getVideo(videoId: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,statistics");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", API_KEY);

  const response = await fetch(url.toString());
  const data = await response.json();
  return data.items[0];
}
```

### Request Header (Alternative)

```typescript
async function getVideo(videoId: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,statistics");
  url.searchParams.set("id", videoId);

  const response = await fetch(url.toString(), {
    headers: {
      "X-goog-api-key": API_KEY
    }
  });

  const data = await response.json();
  return data.items[0];
}
```

## Environment Variables

Store API keys securely using environment variables:

```typescript
// .env file
YOUTUBE_API_KEY=your-api-key-here

// Load in your application
const API_KEY = process.env.YOUTUBE_API_KEY;

if (!API_KEY) {
  throw new Error("YOUTUBE_API_KEY environment variable is required");
}
```

## Common Use Cases

### Search Videos

```typescript
async function searchVideos(query: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "25");
  url.searchParams.set("key", API_KEY);

  const response = await fetch(url.toString());
  const data = await response.json();
  return data.items;
}
```

### Get Channel Information

```typescript
async function getChannel(channelId: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "snippet,statistics,brandingSettings");
  url.searchParams.set("id", channelId);
  url.searchParams.set("key", API_KEY);

  const response = await fetch(url.toString());
  const data = await response.json();
  return data.items[0];
}
```

### Get Playlist Items

```typescript
async function getPlaylistItems(playlistId: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("playlistId", playlistId);
  url.searchParams.set("maxResults", "50");
  url.searchParams.set("key", API_KEY);

  const response = await fetch(url.toString());
  const data = await response.json();
  return data.items;
}
```

## Reusable API Client

Create a helper class for API requests:

```typescript
class YouTubeAPIClient {
  private apiKey: string;
  private baseURL = "https://www.googleapis.com/youtube/v3";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, params: Record<string, string>) {
    const url = new URL(`${this.baseURL}/${endpoint}`);
    url.searchParams.set("key", this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`YouTube API Error: ${error.error.message}`);
    }

    return response.json();
  }

  async getVideo(videoId: string) {
    return this.request("videos", {
      part: "snippet,statistics,contentDetails",
      id: videoId
    });
  }

  async searchVideos(query: string, maxResults = 25) {
    return this.request("search", {
      part: "snippet",
      type: "video",
      q: query,
      maxResults: maxResults.toString()
    });
  }

  async getChannel(channelId: string) {
    return this.request("channels", {
      part: "snippet,statistics,brandingSettings",
      id: channelId
    });
  }

  async getPlaylist(playlistId: string) {
    return this.request("playlists", {
      part: "snippet,contentDetails",
      id: playlistId
    });
  }
}

// Usage
const youtube = new YouTubeAPIClient(API_KEY);
const video = await youtube.getVideo("dQw4w9WgXcQ");
```

## Error Handling

Handle API key errors properly:

```typescript
async function safeRequest(requestFn: () => Promise<any>) {
  try {
    return await requestFn();
  } catch (error: any) {
    if (error.status === 400) {
      console.error("Bad request - check API key and parameters");
    } else if (error.status === 403) {
      console.error("API key invalid or quota exceeded");
    } else if (error.status === 404) {
      console.error("Resource not found");
    } else {
      console.error("Request failed:", error.message);
    }
    throw error;
  }
}
```

## Quota Considerations

Each request using an API key consumes quota units:

- Videos.list: 1 unit
- Channels.list: 1 unit
- Playlists.list: 1 unit
- Search.list: 100 units (high cost)

Default daily quota: 10,000 units

Monitor usage in the Google API Console to avoid exceeding limits.

## Best Practices

1. Never expose API keys in client-side code committed to version control
2. Use environment variables for API key storage
3. Implement API restrictions to prevent unauthorized use
4. Rotate API keys periodically for security
5. Cache responses to reduce quota consumption
6. Handle rate limiting with exponential backoff
7. Validate API key before making requests
8. Monitor quota usage in the API Console

## Limitations

- Cannot access private user data
- Cannot perform write operations (upload, create, update, delete)
- Subject to quota limits
- No refresh token mechanism (unlike OAuth 2.0)
- Shared quota across all API key users

## Related Topics

- [OAuth 2.0 Server-Side](oauth-server-side.md): For user-specific operations
- [Error Handling](../core/error-handling.md): Handle API errors and rate limits
- [Quota Management](../core/quota-management.md): Optimize quota usage
