# Player API

The Player API provides control over Spotify playback on the user's devices. All playback control methods require Spotify Premium.

## Get Playback State

Get information about the user's current playback state, including track, progress, and device.

### Method

```typescript
sdk.player.getPlaybackState(market?: string, additional_types?: string): Promise<PlaybackState>
```

### Parameters

- `market` (optional): ISO 3166-1 alpha-2 country code to filter available content
- `additional_types` (optional): Comma-separated list of item types (`track`, `episode`)

### Response

Returns a `PlaybackState` object containing:

- `device`: Active device information (id, name, type, volume, status)
- `repeat_state`: `"off"`, `"track"`, or `"context"`
- `shuffle_state`: Boolean indicating shuffle status
- `context`: Parent context (playlist, album, artist, show) or null
- `timestamp`: Unix millisecond timestamp of last state change
- `progress_ms`: Current playback position in milliseconds
- `is_playing`: Whether audio is actively playing
- `item`: Currently playing track or episode (can be null)
- `currently_playing_type`: `"track"`, `"episode"`, `"ad"`, or `"unknown"`
- `actions`: Available playback actions for the current context

### Required Scopes

- `user-read-playback-state`

### Example

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withUserAuthorization(
  "client-id",
  "redirect-uri",
  ["user-read-playback-state"]
);

const state = await sdk.player.getPlaybackState();

if (state) {
  console.log({
    track: state.item?.name,
    artist: state.item?.artists[0].name,
    isPlaying: state.is_playing,
    progress: `${Math.floor(state.progress_ms / 1000)}s`,
    device: state.device.name,
    shuffle: state.shuffle_state,
    repeat: state.repeat_state
  });
} else {
  console.log("No active playback");
}
```

### Response Codes

- **200**: Playback state retrieved
- **204**: No active playback
- **401**: Invalid or expired token
- **403**: Bad OAuth request
- **429**: Rate limit exceeded

## Get Available Devices

Get the list of devices available for playback.

### Method

```typescript
sdk.player.getAvailableDevices(): Promise<Devices>
```

### Response

Returns a `Devices` object with a `devices` array. Each device contains:

- `id`: Unique device identifier (should be periodically refreshed)
- `is_active`: Whether this is the currently active device
- `is_private_session`: Whether device is in private session mode
- `is_restricted`: If true, Web API commands will be rejected
- `name`: Human-readable device name
- `type`: Device category (`"computer"`, `"smartphone"`, `"speaker"`, etc.)
- `volume_percent`: Current volume level (0-100, nullable)
- `supports_volume`: Whether volume can be controlled via API

### Required Scopes

- `user-read-playback-state`

### Example

```typescript
const devices = await sdk.player.getAvailableDevices();

devices.devices.forEach(device => {
  console.log({
    name: device.name,
    type: device.type,
    active: device.is_active,
    volume: device.volume_percent
  });
});
```

### Notes

- Some device models are not supported and won't appear in responses
- Device IDs are not permanently guaranteed to persist
- Restricted devices cannot accept Web API control commands

## Start/Resume Playback

Start or resume playback on a user's active device.

### Method

```typescript
sdk.player.startResumePlayback(
  device_id: string,
  context_uri?: string,
  uris?: string[],
  offset?: object,
  positionMs?: number
): Promise<void>
```

### Parameters

- `device_id` (required): The device ID to target
- `context_uri` (optional): Spotify URI of context (album, artist, playlist)
- `uris` (optional): Array of Spotify track URIs to play
- `offset` (optional): Starting position with `position` (index) or `uri` (track URI)
- `positionMs` (optional): Playback position in milliseconds

### Required Scopes

- `user-modify-playback-state`

### Premium Required

Yes - This API only works for Spotify Premium users.

### Example

```typescript
// Play a specific track
await sdk.player.startResumePlayback(
  "device-id",
  undefined,
  ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh"]
);

// Play an album from the 3rd track
await sdk.player.startResumePlayback(
  "device-id",
  "spotify:album:5ht7ItJgpBH7W6vJ5BqpPr",
  undefined,
  { position: 2 }
);

// Resume playback at specific position
await sdk.player.startResumePlayback(
  "device-id",
  undefined,
  undefined,
  undefined,
  30000 // 30 seconds
);
```

### Response Codes

- **204**: Playback started successfully
- **401**: Invalid or expired token
- **403**: Bad OAuth request
- **429**: Rate limit exceeded

### Notes

- Execution order is not guaranteed when used with other Player API endpoints
- If no `device_id` is provided to the underlying API, the currently active device is used

## Pause Playback

Pause playback on the user's account.

### Method

```typescript
sdk.player.pausePlayback(device_id: string): Promise<void>
```

### Parameters

- `device_id` (required): The device ID to target

### Required Scopes

- `user-modify-playback-state`

### Premium Required

Yes - This API only works for Spotify Premium users.

### Example

```typescript
await sdk.player.pausePlayback("device-id");
```

### Response Codes

- **204**: Playback paused successfully
- **401**: Invalid or expired token
- **403**: Bad OAuth request
- **429**: Rate limit exceeded

## Skip to Next Track

Skip to the next track in the user's queue.

### Method

```typescript
sdk.player.skipToNext(device_id: string): Promise<void>
```

### Parameters

- `device_id` (required): The device ID to target

### Required Scopes

- `user-modify-playback-state`

### Premium Required

Yes - This API only works for Spotify Premium users.

### Example

```typescript
await sdk.player.skipToNext("device-id");
```

### Response Codes

- **204**: Command sent successfully
- **401**: Invalid or expired token
- **403**: Bad OAuth request
- **429**: Rate limit exceeded

## Skip to Previous Track

Skip to the previous track in the user's queue.

### Method

```typescript
sdk.player.skipToPrevious(device_id: string): Promise<void>
```

### Parameters

- `device_id` (required): The device ID to target

### Required Scopes

- `user-modify-playback-state`

### Premium Required

Yes - This API only works for Spotify Premium users.

### Example

```typescript
await sdk.player.skipToPrevious("device-id");
```

### Response Codes

- **204**: Command sent successfully
- **401**: Invalid or expired token
- **403**: Bad OAuth request
- **429**: Rate limit exceeded

## Seek to Position

Seek to a specific position in the currently playing track.

### Method

```typescript
sdk.player.seekToPosition(position_ms: number, device_id?: string): Promise<void>
```

### Parameters

- `position_ms` (required): Position in milliseconds (must be positive)
- `device_id` (optional): Target device ID

### Required Scopes

- `user-modify-playback-state`

### Premium Required

Yes - This API only works for Spotify Premium users.

### Example

```typescript
// Seek to 1 minute
await sdk.player.seekToPosition(60000);

// Seek on specific device
await sdk.player.seekToPosition(30000, "device-id");
```

### Response Codes

- **204**: Command sent successfully
- **401**: Invalid or expired token
- **403**: Bad OAuth request
- **429**: Rate limit exceeded

### Notes

- Values exceeding track length will trigger playback of the next song
- If `device_id` is omitted, targets the currently active device

## Transfer Playback

Transfer playback to a different device.

### Method

```typescript
sdk.player.transferPlayback(device_ids: string[], play?: boolean): Promise<void>
```

### Parameters

- `device_ids` (required): Array containing device ID(s) - only single device supported
- `play` (optional): `true` to ensure playback, `false` to maintain state

### Required Scopes

- `user-modify-playback-state`

### Premium Required

Yes - This API only works for Spotify Premium users.

### Example

```typescript
// Transfer and start playing
await sdk.player.transferPlayback(["device-id"], true);

// Transfer and maintain current state
await sdk.player.transferPlayback(["device-id"], false);
```

### Response Codes

- **204**: Playback transferred successfully
- **400**: Multiple device IDs provided (not supported)
- **401**: Invalid or expired token
- **403**: Bad OAuth request
- **429**: Rate limit exceeded

### Notes

- Only a single device ID is currently supported
- Providing multiple IDs returns `400 Bad Request`

## Set Playback Volume

Set the volume for the user's current playback device.

### Method

```typescript
sdk.player.setPlaybackVolume(volume_percent: number, device_id?: string): Promise<void>
```

### Parameters

- `volume_percent` (required): Volume level from 0 to 100 inclusive
- `device_id` (optional): Target device ID

### Required Scopes

- `user-modify-playback-state`

### Premium Required

Yes - This API only works for Spotify Premium users.

### Example

```typescript
// Set volume to 50%
await sdk.player.setPlaybackVolume(50);

// Set volume on specific device
await sdk.player.setPlaybackVolume(75, "device-id");
```

### Response Codes

- **204**: Volume set successfully
- **401**: Invalid or expired token
- **403**: Bad OAuth request
- **429**: Rate limit exceeded

### Notes

- If `device_id` is omitted, targets the currently active device
- Check `device.supports_volume` before calling

## Toggle Shuffle

Toggle shuffle mode for the user's playback.

### Method

```typescript
sdk.player.togglePlaybackShuffle(state: boolean, device_id?: string): Promise<void>
```

### Parameters

- `state` (required): `true` to enable shuffle, `false` to disable
- `device_id` (optional): Target device ID

### Required Scopes

- `user-modify-playback-state`

### Premium Required

Yes - This API only works for Spotify Premium users.

### Example

```typescript
// Enable shuffle
await sdk.player.togglePlaybackShuffle(true);

// Disable shuffle on specific device
await sdk.player.togglePlaybackShuffle(false, "device-id");
```

### Response Codes

- **204**: Command sent successfully
- **401**: Invalid or expired token
- **403**: Bad OAuth request
- **429**: Rate limit exceeded

## Set Repeat Mode

Set the repeat mode for the user's playback.

### Method

```typescript
sdk.player.setRepeatMode(state: "track" | "context" | "off", device_id?: string): Promise<void>
```

### Parameters

- `state` (required): Repeat mode - `"track"`, `"context"`, or `"off"`
- `device_id` (optional): Target device ID

### Required Scopes

- `user-modify-playback-state`

### Premium Required

Yes - This API only works for Spotify Premium users.

### Example

```typescript
// Repeat current track
await sdk.player.setRepeatMode("track");

// Repeat context (album/playlist)
await sdk.player.setRepeatMode("context");

// Turn off repeat
await sdk.player.setRepeatMode("off", "device-id");
```

### Response Codes

- **204**: Command sent successfully
- **401**: Invalid or expired token
- **403**: Bad OAuth request
- **429**: Rate limit exceeded

### Notes

- `"track"`: Repeats the current track
- `"context"`: Repeats the current context (album, playlist, etc.)
- `"off"`: Disables repeat mode

## Get User's Queue

Get the list of items in the user's playback queue.

### Method

```typescript
sdk.player.getUsersQueue(): Promise<Queue>
```

### Response

Returns a `Queue` object containing:

- `currently_playing`: The currently playing track or episode
- `queue`: Array of upcoming tracks/episodes in the queue

### Required Scopes

- `user-read-playback-state`

### Example

```typescript
const queue = await sdk.player.getUsersQueue();

console.log("Currently playing:", queue.currently_playing?.name);
console.log("Up next:");
queue.queue.slice(0, 5).forEach((item, i) => {
  console.log(`${i + 1}. ${item.name}`);
});
```

### Response Codes

- **200**: Queue retrieved successfully
- **401**: Invalid or expired token
- **403**: Bad OAuth request
- **429**: Rate limit exceeded

## Add Item to Queue

Add a track or episode to the user's playback queue.

### Method

```typescript
sdk.player.addItemToPlaybackQueue(uri: string, device_id?: string): Promise<void>
```

### Parameters

- `uri` (required): Spotify URI of track or episode to add
- `device_id` (optional): Target device ID

### Required Scopes

- `user-modify-playback-state`

### Premium Required

Yes - This API only works for Spotify Premium users.

### Example

```typescript
// Add track to queue
await sdk.player.addItemToPlaybackQueue("spotify:track:4iV5W9uYEdYUVa79Axb7Rh");

// Add episode to queue on specific device
await sdk.player.addItemToPlaybackQueue(
  "spotify:episode:512ojhOuo1ktJprKbVcKyQ",
  "device-id"
);
```

### Response Codes

- **204**: Item added successfully
- **401**: Invalid or expired token
- **403**: Bad OAuth request
- **429**: Rate limit exceeded

### Notes

- Execution order is not guaranteed when used with other Player API endpoints
- If `device_id` is omitted, targets the currently active device

## Get Recently Played Tracks

Get tracks from the user's recently played history.

### Method

```typescript
sdk.player.getRecentlyPlayedTracks(
  limit?: MaxInt<50>,
  queryRange?: QueryRange
): Promise<RecentlyPlayedTracksPage>
```

### Parameters

- `limit` (optional): Maximum items to return (1-50, default: 20)
- `queryRange` (optional): Time range with `after` or `before` Unix timestamp in ms

### Response

Returns a cursor-paginated object with:

- `href`: Web API endpoint link
- `limit`: Maximum items in response
- `next`: URL to next page (or null)
- `cursors`: Object with `after` and `before` cursors
- `total`: Total available items
- `items`: Array of `PlayHistoryObject` with track details and `played_at` timestamps

### Required Scopes

- `user-read-recently-played`

### Example

```typescript
// Get last 10 played tracks
const recent = await sdk.player.getRecentlyPlayedTracks(10);

recent.items.forEach(item => {
  const playedAt = new Date(item.played_at);
  console.log(`${item.track.name} - played at ${playedAt.toLocaleString()}`);
});

// Get tracks played after specific time
const afterTimestamp = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
const recentDay = await sdk.player.getRecentlyPlayedTracks(
  50,
  { after: afterTimestamp }
);
```

### TypeScript Types

```typescript
interface PlayHistoryObject {
  track: Track;
  played_at: string; // ISO 8601 timestamp
  context: Context | null;
}

interface QueryRange {
  after?: number;  // Unix timestamp in milliseconds
  before?: number; // Unix timestamp in milliseconds (mutually exclusive with after)
}
```

### Response Codes

- **200**: History retrieved successfully
- **401**: Invalid or expired token
- **403**: Bad OAuth request
- **429**: Rate limit exceeded

### Notes

- Currently doesn't support podcast episodes
- Maximum 50 items per request
- `after` and `before` are mutually exclusive in `queryRange`

## Error Handling

All Player API methods can throw errors that should be handled appropriately.

```typescript
try {
  await sdk.player.startResumePlayback("device-id");
} catch (error) {
  if (error.status === 401) {
    console.log("Authentication failed - token expired");
  } else if (error.status === 403) {
    console.log("User may not have Spotify Premium");
  } else if (error.status === 404) {
    console.log("Device not found");
  } else if (error.status === 429) {
    console.log("Rate limited - retry after delay");
  } else {
    console.log("API error:", error.message);
  }
}
```

## Best Practices

1. **Check Premium status:** Most Player API methods require Spotify Premium subscription
2. **Verify device availability:** Use `getAvailableDevices()` before controlling playback
3. **Handle null states:** `getPlaybackState()` returns null when no playback is active
4. **Respect rate limits:** Implement exponential backoff for 429 responses
5. **Refresh device IDs:** Device IDs should be periodically refreshed, not cached indefinitely
6. **Check device restrictions:** Verify `is_restricted` is false before sending commands
7. **Use appropriate scopes:** Read operations need `user-read-playback-state`, control needs `user-modify-playback-state`
8. **Handle async nature:** Execution order is not guaranteed between Player API calls

## Complete Example

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withUserAuthorization(
  "client-id",
  "redirect-uri",
  [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-recently-played"
  ]
);

async function controlPlayback() {
  try {
    // Get available devices
    const devices = await sdk.player.getAvailableDevices();
    const activeDevice = devices.devices.find(d => d.is_active);

    if (!activeDevice) {
      console.log("No active device");
      return;
    }

    // Get current state
    const state = await sdk.player.getPlaybackState();

    if (state?.is_playing) {
      // Pause if playing
      await sdk.player.pausePlayback(activeDevice.id);
      console.log("Paused");
    } else {
      // Resume if paused
      await sdk.player.startResumePlayback(activeDevice.id);
      console.log("Playing");
    }

    // Add track to queue
    await sdk.player.addItemToPlaybackQueue(
      "spotify:track:4iV5W9uYEdYUVa79Axb7Rh",
      activeDevice.id
    );

    // Get recently played
    const recent = await sdk.player.getRecentlyPlayedTracks(5);
    console.log("Recently played:");
    recent.items.forEach(item => {
      console.log(`- ${item.track.name}`);
    });

  } catch (error) {
    console.error("Playback control error:", error);
  }
}

controlPlayback();
```

## Related APIs

- [Tracks API](tracks.md): Get track information and audio features
- [Playlists API](playlists.md): Manage playlists
- [Albums API](albums.md): Get album information
- [Artists API](artists.md): Get artist information
