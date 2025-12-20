# Feature: Spotify Adapter

## Overview

Spotify Web APIを抽象化し、musix.jsの統一インターフェースでSpotifyの機能にアクセスできるアダプターを提供する。

## Background & Purpose

musix.jsは複数の音楽ストリーミングサービスに統一インターフェースを提供するライブラリである。最初のアダプターとしてSpotifyを実装し、他サービスのアダプター実装の基盤パターンを確立する。

## Requirements

### Functional Requirements

- [ ] FR-001: Spotify認証情報（Client ID, Client Secret）を使用し、Client Credentials FlowでAPIクライアントを初期化できる（公開データのみアクセス可能）
- [ ] FR-002: トラックをID指定で取得できる
- [ ] FR-003: トラックをキーワード検索できる（limit, offsetによるページネーションをサポート）
- [ ] FR-004: アルバムをID指定で取得できる
- [ ] FR-005: アーティストをID指定で取得できる
- [ ] FR-006: プレイリストをID指定で取得できる

### Non-Functional Requirements

- [ ] NFR-001: APIレスポンスをmusix.js共通の型に変換する
- [ ] NFR-002: 認証エラー・レート制限エラー・ネットワークエラーを適切にハンドリングする
- [ ] NFR-003: アクセストークンの有効期限切れ時に自動で再取得する

## API Design

### Functions/Methods

```typescript
/**
 * Spotifyアダプターを作成する
 * @param config - Spotify API認証設定
 * @returns SpotifyAdapter インスタンス
 */
function createSpotifyAdapter(config: SpotifyConfig): SpotifyAdapter;
```

### Type Definitions

```typescript
interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
}

interface SpotifyAdapter {
  /** トラックをID指定で取得 */
  getTrack(id: string): Promise<Track>;

  /** トラックを検索 */
  searchTracks(query: string, options?: SearchOptions): Promise<SearchResult<Track>>;

  /** アルバムをID指定で取得 */
  getAlbum(id: string): Promise<Album>;

  /** アーティストをID指定で取得 */
  getArtist(id: string): Promise<Artist>;

  /** プレイリストをID指定で取得 */
  getPlaylist(id: string): Promise<Playlist>;
}

interface SearchOptions {
  limit?: number;  // default: 20, max: 50 (50を超える場合は50に丸める)
  offset?: number; // default: 0
}

interface SearchResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/** musix.js共通のトラック型 */
interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  durationMs: number;
  previewUrl: string | null;
  externalUrl: string;
}

/** musix.js共通のアルバム型 */
interface Album {
  id: string;
  name: string;
  artists: Artist[];
  releaseDate: string;
  totalTracks: number;
  images: Image[];
  externalUrl: string;
}

/** musix.js共通のアーティスト型 */
interface Artist {
  id: string;
  name: string;
  genres?: string[];
  images?: Image[];
  externalUrl: string;
}

/** musix.js共通のプレイリスト型 */
interface Playlist {
  id: string;
  name: string;
  description: string | null;
  owner: User;
  tracks: Track[];
  images: Image[];
  externalUrl: string;
}

interface User {
  id: string;
  displayName: string;
}

interface Image {
  url: string;
  width: number | null;
  height: number | null;
}
```

### Error Types

```typescript
/** 認証エラー（無効な認証情報） */
class AuthenticationError extends Error {
  name: 'AuthenticationError';
}

/** リソース未検出エラー */
class NotFoundError extends Error {
  name: 'NotFoundError';
  resourceType: 'track' | 'album' | 'artist' | 'playlist';
  resourceId: string;
}

/** レート制限エラー */
class RateLimitError extends Error {
  name: 'RateLimitError';
  retryAfter: number; // 再試行までの秒数
}

/** ネットワークエラー（接続失敗、タイムアウト） */
class NetworkError extends Error {
  name: 'NetworkError';
  cause?: Error;
}

/** Spotify APIエラー（上記以外のAPIエラー） */
class SpotifyApiError extends Error {
  name: 'SpotifyApiError';
  statusCode: number;
}
```

## Usage Examples

```typescript
import { createSpotifyAdapter, NotFoundError, RateLimitError } from 'musix';

const spotify = createSpotifyAdapter({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
});

// トラック取得
const track = await spotify.getTrack('4iV5W9uYEdYUVa79Axb7Rh');
console.log(track.name); // "Hotel California"

// トラック検索
const results = await spotify.searchTracks('bohemian rhapsody', { limit: 10 });
console.log(results.items.length); // 10

// エラーハンドリング
try {
  const track = await spotify.getTrack('invalid-id');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log(`${error.resourceType} not found: ${error.resourceId}`);
  } else if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
  }
}
```

## Error Handling

| Error Type | Condition | Message |
|------------|-----------|---------|
| AuthenticationError | 認証情報が無効 | "Invalid client credentials" |
| NotFoundError | リソースが見つからない | "{resourceType} not found: {id}" |
| RateLimitError | レート制限に達した | "Rate limit exceeded. Retry after {seconds} seconds" |
| NetworkError | ネットワーク接続失敗またはタイムアウト | "Network error: {cause}" |
| SpotifyApiError | その他のAPIエラー | "Spotify API error: {statusCode} {message}" |

## Acceptance Criteria

### AC-001: アダプター初期化 [FR-001]

- **Given**: 有効なClient IDとClient Secretが用意されている
- **When**: `createSpotifyAdapter`を呼び出す
- **Then**:
  - SpotifyAdapterインスタンスが返される
  - インスタンスは`getTrack`, `searchTracks`, `getAlbum`, `getArtist`, `getPlaylist`メソッドを持つ

### AC-002: 無効な認証情報 [FR-001, Error]

- **Given**: 無効なClient IDまたはClient Secretが設定されている
- **When**: APIメソッドを呼び出す
- **Then**:
  - AuthenticationErrorがスローされる
  - エラーメッセージに"Invalid client credentials"が含まれる

### AC-003: トラック取得 [FR-002]

- **Given**: 有効な認証設定でアダプターが初期化されている
- **When**: 存在するトラックIDで`getTrack`を呼び出す
- **Then**:
  - Track型のオブジェクトが返される
  - `id`, `name`, `externalUrl`が非null文字列である
  - `artists`配列に少なくとも1つのArtistオブジェクトが含まれる
  - `album`オブジェクトが`id`, `name`を持つ
  - `durationMs`が正の整数である

### AC-004: 存在しないトラック [FR-002, Error]

- **Given**: 有効な認証設定でアダプターが初期化されている
- **When**: 存在しないトラックIDで`getTrack`を呼び出す
- **Then**:
  - NotFoundErrorがスローされる
  - `resourceType`が"track"である
  - `resourceId`が指定したIDである

### AC-005: トラック検索 [FR-003]

- **Given**: 有効な認証設定でアダプターが初期化されている
- **When**: 検索クエリで`searchTracks`を呼び出す
- **Then**:
  - SearchResult<Track>型のオブジェクトが返される
  - `items`配列の各要素がTrack型である
  - `total`が0以上の整数である
  - `limit`, `offset`が含まれる

### AC-005a: 検索結果が空 [FR-003]

- **Given**: 有効な認証設定でアダプターが初期化されている
- **When**: 結果が存在しない検索クエリで`searchTracks`を呼び出す
- **Then**:
  - `items`が空配列である
  - `total`が0である

### AC-005b: 検索ページネーション [FR-003]

- **Given**: 有効な認証設定でアダプターが初期化されている
- **When**: `searchTracks`を`{ limit: 5, offset: 10 }`で呼び出す
- **Then**:
  - `limit`が5である
  - `offset`が10である
  - `items`の長さが5以下である

### AC-006: アルバム取得 [FR-004]

- **Given**: 有効な認証設定でアダプターが初期化されている
- **When**: 存在するアルバムIDで`getAlbum`を呼び出す
- **Then**:
  - Album型のオブジェクトが返される
  - `id`, `name`, `externalUrl`が非null文字列である
  - `artists`配列に少なくとも1つのArtistオブジェクトが含まれる
  - `totalTracks`が正の整数である
  - `images`配列が含まれる

### AC-007: アーティスト取得 [FR-005]

- **Given**: 有効な認証設定でアダプターが初期化されている
- **When**: 存在するアーティストIDで`getArtist`を呼び出す
- **Then**:
  - Artist型のオブジェクトが返される
  - `id`, `name`, `externalUrl`が非null文字列である

### AC-008: プレイリスト取得 [FR-006]

- **Given**: 有効な認証設定でアダプターが初期化されている
- **When**: 存在するプレイリストIDで`getPlaylist`を呼び出す
- **Then**:
  - Playlist型のオブジェクトが返される
  - `id`, `name`, `externalUrl`が非null文字列である
  - `owner`オブジェクトが`id`, `displayName`を持つ
  - `tracks`配列が含まれる

### AC-009: レート制限エラー [NFR-002, Error]

- **Given**: APIレート制限に達している
- **When**: 任意のAPIメソッドを呼び出す
- **Then**:
  - RateLimitErrorがスローされる
  - `retryAfter`が正の整数である

### AC-010: ネットワークエラー [NFR-002, Error]

- **Given**: ネットワーク接続が利用できない
- **When**: 任意のAPIメソッドを呼び出す
- **Then**:
  - NetworkErrorがスローされる

### AC-011: トークン自動更新 [NFR-003]

- **Given**: アクセストークンが有効期限切れである
- **When**: APIメソッドを呼び出す
- **Then**:
  - 新しいアクセストークンが自動で取得される
  - APIリクエストが成功する
  - 呼び出し側にエラーはスローされない

## Implementation Notes

- Spotify Web APIのClient Credentials Flowを使用（公開データのみアクセス可能、ユーザー認証は対象外）
- 公式SDK（@spotify/web-api-ts-sdk）の使用を検討（/designフェーズで決定）
- アクセストークンは内部でキャッシュし、有効期限切れ時に自動更新
- Playlist.tracksは簡易情報ではなく、完全なTrackオブジェクトを返す（必要に応じて追加APIコールを行う）

## Change History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-20 | 1.0 | Initial version | - |
| 2025-12-20 | 1.1 | Add error type definitions, clarify auth flow, expand acceptance criteria | - |
