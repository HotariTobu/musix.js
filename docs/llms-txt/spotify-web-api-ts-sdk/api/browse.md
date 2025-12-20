# Browse API

The Browse API provides access to Spotify's curated content including new releases, featured playlists, and browse categories.

## Get New Releases

Retrieve a list of new album releases featured in Spotify (shown on the Browse tab).

### Method

```typescript
sdk.browse.getNewReleases(country?: string, limit?: MaxInt<50>, offset?: number): Promise<NewReleases>
```

### Parameters

- `country` (optional): ISO 3166-1 alpha-2 country code (e.g., "US", "GB", "JP")
- `limit` (optional): Maximum number of albums to return (1-50, default 20)
- `offset` (optional): Index of the first album to return (default 0)

### Response

Returns a `NewReleases` object containing:

- `albums`: Paginated list of `SimplifiedAlbum` objects
  - `href`: API endpoint URL
  - `items`: Array of album objects
  - `limit`: Maximum items in response
  - `offset`: Current offset
  - `total`: Total number of available albums
  - `next`: URL to next page (null if last page)
  - `previous`: URL to previous page (null if first page)

### Example

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withClientCredentials(
  "client-id",
  "client-secret"
);

// Get latest 20 new releases in the US
const newReleases = await sdk.browse.getNewReleases("US", 20, 0);

console.log(`Found ${newReleases.albums.total} new releases`);

newReleases.albums.items.forEach(album => {
  console.log({
    name: album.name,
    artist: album.artists[0].name,
    releaseDate: album.release_date,
    type: album.album_type
  });
});

// Paginate through next page
if (newReleases.albums.next) {
  const nextPage = await sdk.browse.getNewReleases("US", 20, 20);
  console.log(`Next page has ${nextPage.albums.items.length} albums`);
}
```

### TypeScript Types

```typescript
interface NewReleases {
  albums: Page<SimplifiedAlbum>;
}

interface SimplifiedAlbum {
  id: string;
  name: string;
  album_type: "album" | "single" | "compilation";
  album_group?: string;
  artists: SimplifiedArtist[];
  available_markets: string[];
  external_urls: ExternalUrls;
  href: string;
  images: Image[];
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  total_tracks: number;
  uri: string;
}

interface Page<T> {
  href: string;
  items: T[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}
```

## Get Categories

Retrieve a list of categories used to tag items in Spotify (found in the Browse tab).

### Method

```typescript
sdk.browse.getCategories(country?: CountryCodeA2, locale?: string, limit?: MaxInt<50>, offset?: number): Promise<Categories>
```

### Parameters

- `country` (optional): ISO 3166-1 alpha-2 country code (e.g., "US", "GB", "JP")
- `locale` (optional): Language code in format `{language}_{country}` (e.g., "sv_SE", "es_MX", "en_US")
- `limit` (optional): Maximum number of categories to return (1-50, default 20)
- `offset` (optional): Index of the first category to return (default 0)

### Response

Returns a `Categories` object containing:

- `categories`: Paginated list of `Category` objects
  - `href`: API endpoint URL
  - `id`: Category identifier
  - `name`: Category display name
  - `icons`: Array of category images

### Example

```typescript
// Get categories for the US market in English
const categories = await sdk.browse.getCategories("US", "en_US", 20, 0);

console.log(`Total categories: ${categories.categories.total}`);

categories.categories.items.forEach(category => {
  console.log({
    id: category.id,
    name: category.name,
    icon: category.icons[0]?.url
  });
});

// Get categories with Spanish locale
const spanishCategories = await sdk.browse.getCategories("MX", "es_MX");
```

### TypeScript Types

```typescript
interface Categories {
  categories: Page<Category>;
}

interface Category {
  href: string;
  icons: Icon[];
  id: string;
  name: string;
}

interface Icon {
  url: string;
  height: number | null;
  width: number | null;
}
```

## Get Category

Retrieve a single category by its identifier.

### Method

```typescript
sdk.browse.getCategory(categoryId: string, country?: CountryCodeA2, locale?: string): Promise<Category>
```

### Parameters

- `categoryId` (required): The Spotify category ID (e.g., "dinner", "party", "workout")
- `country` (optional): ISO 3166-1 alpha-2 country code
- `locale` (optional): Language code in format `{language}_{country}`

### Example

```typescript
// Get a specific category
const category = await sdk.browse.getCategory("party", "US", "en_US");

console.log({
  name: category.name,
  id: category.id,
  icon: category.icons[0]?.url
});

// Get category in different locale
const categorySv = await sdk.browse.getCategory("party", "SE", "sv_SE");
console.log(`Swedish name: ${categorySv.name}`);
```

## Get Featured Playlists

Retrieve a list of Spotify featured playlists (shown on the Browse tab).

### Method

```typescript
sdk.browse.getFeaturedPlaylists(country?: CountryCodeA2, locale?: string, timestamp?: string, limit?: MaxInt<50>, offset?: number): Promise<FeaturedPlaylists>
```

### Parameters

- `country` (optional): ISO 3166-1 alpha-2 country code
- `locale` (optional): Language code in format `{language}_{country}`
- `timestamp` (optional): ISO 8601 timestamp (e.g., "2014-10-23T09:00:00") to get playlists as of that time
- `limit` (optional): Maximum number of playlists to return (1-50, default 20)
- `offset` (optional): Index of the first playlist to return (default 0)

### Response

Returns a `FeaturedPlaylists` object containing:

- `message`: Localized message describing the featured playlists
- `playlists`: Paginated list of `SimplifiedPlaylist` objects

### Example

```typescript
// Get featured playlists for US market
const featured = await sdk.browse.getFeaturedPlaylists("US", "en_US", undefined, 10);

console.log(`Message: ${featured.message}`);
console.log(`Found ${featured.playlists.total} featured playlists`);

featured.playlists.items.forEach(playlist => {
  console.log({
    name: playlist.name,
    description: playlist.description,
    owner: playlist.owner.display_name,
    tracks: playlist.tracks.total
  });
});

// Get playlists at specific time
const timestamp = "2024-12-20T12:00:00";
const historicalFeatured = await sdk.browse.getFeaturedPlaylists("US", "en_US", timestamp);
```

### TypeScript Types

```typescript
interface FeaturedPlaylists {
  message: string;
  playlists: Page<SimplifiedPlaylist>;
}

interface SimplifiedPlaylist {
  collaborative: boolean;
  description: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: {
    display_name: string;
    external_urls: ExternalUrls;
    href: string;
    id: string;
    type: "user";
    uri: string;
  };
  public: boolean;
  snapshot_id: string;
  tracks: {
    href: string;
    total: number;
  };
  type: "playlist";
  uri: string;
}
```

## Get Playlists for Category

Retrieve playlists belonging to a specific category.

### Method

```typescript
sdk.browse.getPlaylistsForCategory(category_id: string, country?: CountryCodeA2, limit?: MaxInt<50>, offset?: number): Promise<FeaturedPlaylists>
```

### Parameters

- `category_id` (required): The Spotify category ID
- `country` (optional): ISO 3166-1 alpha-2 country code
- `limit` (optional): Maximum number of playlists to return (1-50, default 20)
- `offset` (optional): Index of the first playlist to return (default 0)

### Example

```typescript
// Get playlists for the "workout" category
const workoutPlaylists = await sdk.browse.getPlaylistsForCategory("workout", "US", 20);

console.log(`Found ${workoutPlaylists.playlists.total} workout playlists`);

workoutPlaylists.playlists.items.forEach(playlist => {
  console.log(`${playlist.name} - ${playlist.tracks.total} tracks`);
});
```

## Pagination Patterns

### Iterate Through All New Releases

```typescript
async function getAllNewReleases(country: string): Promise<SimplifiedAlbum[]> {
  const allAlbums: SimplifiedAlbum[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const response = await sdk.browse.getNewReleases(country, limit, offset);
    allAlbums.push(...response.albums.items);

    if (!response.albums.next) break;
    offset += limit;
  }

  return allAlbums;
}

const allReleases = await getAllNewReleases("US");
console.log(`Retrieved ${allReleases.length} total new releases`);
```

### Paginate Through Categories

```typescript
async function* paginateCategories(
  country?: string,
  locale?: string
): AsyncGenerator<Category[]> {
  let offset = 0;
  const limit = 50;

  while (true) {
    const response = await sdk.browse.getCategories(country, locale, limit, offset);
    yield response.categories.items;

    if (!response.categories.next) break;
    offset += limit;
  }
}

// Use the generator
for await (const batch of paginateCategories("US", "en_US")) {
  batch.forEach(category => {
    console.log(category.name);
  });
}
```

## Working with Locales

### Fetch Categories in Multiple Languages

```typescript
const locales = ["en_US", "es_MX", "ja_JP", "de_DE"];

const categoriesByLocale = await Promise.all(
  locales.map(async locale => {
    const response = await sdk.browse.getCategories(undefined, locale, 10);
    return {
      locale,
      categories: response.categories.items.map(c => ({
        id: c.id,
        name: c.name
      }))
    };
  })
);

categoriesByLocale.forEach(({ locale, categories }) => {
  console.log(`\n${locale}:`);
  categories.forEach(c => console.log(`  ${c.id}: ${c.name}`));
});
```

## Error Handling

```typescript
try {
  const newReleases = await sdk.browse.getNewReleases("US", 20);
} catch (error) {
  if (error.status === 401) {
    console.log("Authentication required");
  } else if (error.status === 400) {
    console.log("Invalid request parameters");
  } else if (error.status === 429) {
    console.log("Rate limit exceeded");
    // Check error.headers['retry-after'] for backoff time
  } else if (error.status === 404) {
    console.log("Category not found");
  } else {
    console.log("API error:", error.message);
  }
}
```

## Best Practices

1. **Country codes:** Specify country to get region-specific content and availability
2. **Pagination:** Use maximum limit (50) to minimize API calls
3. **Locale formatting:** Use proper ISO format `{language}_{country}` (e.g., "en_US", not "en-US")
4. **Caching:** Browse content changes infrequently, suitable for short-term caching
5. **Error handling:** Always handle 429 rate limit errors with exponential backoff
6. **Batch processing:** Use pagination generators for processing large result sets
7. **Market availability:** Check `available_markets` array before displaying albums

## Common Patterns

### Filter Albums by Type

```typescript
const newReleases = await sdk.browse.getNewReleases("US", 50);

const albums = newReleases.albums.items.filter(
  album => album.album_type === "album"
);

const singles = newReleases.albums.items.filter(
  album => album.album_type === "single"
);

console.log(`Albums: ${albums.length}, Singles: ${singles.length}`);
```

### Get Latest Releases from Last Week

```typescript
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

const newReleases = await sdk.browse.getNewReleases("US", 50);

const recentReleases = newReleases.albums.items.filter(album => {
  const releaseDate = new Date(album.release_date);
  return releaseDate >= oneWeekAgo;
});

console.log(`${recentReleases.length} albums released in the last week`);
```

### Build Category Navigation

```typescript
interface CategoryNavigation {
  id: string;
  name: string;
  icon: string;
  playlists: SimplifiedPlaylist[];
}

async function buildCategoryNav(country: string): Promise<CategoryNavigation[]> {
  const categories = await sdk.browse.getCategories(country, undefined, 20);

  return Promise.all(
    categories.categories.items.map(async category => {
      const playlists = await sdk.browse.getPlaylistsForCategory(
        category.id,
        country,
        5
      );

      return {
        id: category.id,
        name: category.name,
        icon: category.icons[0]?.url || "",
        playlists: playlists.playlists.items
      };
    })
  );
}

const navigation = await buildCategoryNav("US");
```

## Related Methods

- [Playlists API](playlists.md): Get full playlist details
- [Albums API](albums.md): Get album details and tracks
- [Search API](search.md): Search for albums, playlists, and categories
