# Localization

Apple Music API supports localized content across multiple languages and regions through storefronts and language tags.

## Storefronts

Storefronts represent country/region-specific Apple Music catalogs. Each storefront has its own catalog, availability, and pricing.

### Common Storefronts

```typescript
const storefronts = {
  // Americas
  us: 'United States',
  ca: 'Canada',
  mx: 'Mexico',
  br: 'Brazil',
  ar: 'Argentina',

  // Europe
  gb: 'United Kingdom',
  fr: 'France',
  de: 'Germany',
  it: 'Italy',
  es: 'Spain',
  nl: 'Netherlands',
  se: 'Sweden',
  no: 'Norway',
  dk: 'Denmark',
  fi: 'Finland',
  pl: 'Poland',
  ru: 'Russia',

  // Asia Pacific
  jp: 'Japan',
  cn: 'China',
  kr: 'South Korea',
  au: 'Australia',
  nz: 'New Zealand',
  in: 'India',
  sg: 'Singapore',
  hk: 'Hong Kong',
  tw: 'Taiwan',
  th: 'Thailand',

  // Middle East
  ae: 'United Arab Emirates',
  sa: 'Saudi Arabia',
  il: 'Israel'
} as const;

type Storefront = keyof typeof storefronts;
```

### Using Storefronts

Specify the storefront in the URL path:

```typescript
async function getAlbum(
  storefront: Storefront,
  albumId: string,
  token: string
) {
  const url = `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return await response.json();
}

// Different storefronts may return different data
const usAlbum = await getAlbum('us', '123', token);
const jpAlbum = await getAlbum('jp', '123', token);
```

### Get User's Storefront

Determine user's storefront from their account:

```typescript
async function getUserStorefront(
  developerToken: string,
  userToken: string
): Promise<string> {
  const response = await fetch(
    'https://api.music.apple.com/v1/me/storefront',
    {
      headers: {
        'Authorization': `Bearer ${developerToken}`,
        'Music-User-Token': userToken
      }
    }
  );

  const data = await response.json();
  return data.data[0].id; // e.g., 'us', 'jp'
}

// Usage
const userStorefront = await getUserStorefront(developerToken, userToken);
console.log(`User's storefront: ${userStorefront}`);
```

## Language Tags

Request localized content using language tags in the `Accept-Language` header or `l` parameter.

### Language Tag Format

Language tags follow [BCP 47](https://tools.ietf.org/html/bcp47) format:

```
language-region
```

Examples:
- `en-US`: English (United States)
- `ja-JP`: Japanese (Japan)
- `fr-FR`: French (France)
- `de-DE`: German (Germany)
- `zh-CN`: Chinese (Simplified, China)
- `zh-TW`: Chinese (Traditional, Taiwan)
- `pt-BR`: Portuguese (Brazil)
- `es-MX`: Spanish (Mexico)

### Using Accept-Language Header

```typescript
async function getLocalizedAlbum(
  storefront: string,
  albumId: string,
  language: string,
  token: string
) {
  const url = `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept-Language': language
    }
  });

  return await response.json();
}

// Get album with Japanese text
const jpAlbum = await getLocalizedAlbum('jp', '123', 'ja-JP', token);

// Get same album with English text (if available)
const enAlbum = await getLocalizedAlbum('jp', '123', 'en-US', token);
```

### Using l Parameter

Alternatively, use the `l` query parameter:

```typescript
async function getLocalizedAlbumWithParam(
  storefront: string,
  albumId: string,
  language: string,
  token: string
) {
  const url = new URL(
    `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}`
  );
  url.searchParams.set('l', language);

  const response = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return await response.json();
}

// Usage
const album = await getLocalizedAlbumWithParam('us', '123', 'es-US', token);
```

## Localized Content

### Editorial Notes

Editorial descriptions are often localized:

```typescript
async function getEditorialNotes(
  storefront: string,
  albumId: string,
  languages: string[],
  token: string
) {
  const notes: Record<string, string> = {};

  for (const lang of languages) {
    const response = await fetch(
      `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}?l=${lang}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const data = await response.json();
    const album = data.data[0];

    if (album.attributes.editorialNotes?.standard) {
      notes[lang] = album.attributes.editorialNotes.standard;
    }
  }

  return notes;
}

// Get editorial notes in multiple languages
const notes = await getEditorialNotes(
  'us',
  '123',
  ['en-US', 'ja-JP', 'fr-FR'],
  token
);

console.log('English:', notes['en-US']);
console.log('Japanese:', notes['ja-JP']);
console.log('French:', notes['fr-FR']);
```

### Genre Names

Genre names are localized based on language:

```typescript
interface LocalizedGenres {
  [language: string]: string[];
}

async function getGenresInLanguages(
  storefront: string,
  albumId: string,
  languages: string[],
  token: string
): Promise<LocalizedGenres> {
  const genres: LocalizedGenres = {};

  for (const lang of languages) {
    const url = `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}?l=${lang}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    genres[lang] = data.data[0].attributes.genreNames;
  }

  return genres;
}

// Get genre names in different languages
const genres = await getGenresInLanguages(
  'jp',
  '123',
  ['ja-JP', 'en-US'],
  token
);

console.log('Japanese genres:', genres['ja-JP']);
console.log('English genres:', genres['en-US']);
```

## Regional Availability

Content availability varies by storefront:

```typescript
async function checkAvailability(
  albumId: string,
  storefronts: string[],
  token: string
): Promise<Record<string, boolean>> {
  const availability: Record<string, boolean> = {};

  for (const storefront of storefronts) {
    try {
      const response = await fetch(
        `https://api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      availability[storefront] = response.status === 200;
    } catch {
      availability[storefront] = false;
    }
  }

  return availability;
}

// Check if album is available in different regions
const availability = await checkAvailability(
  '123',
  ['us', 'jp', 'gb', 'de'],
  token
);

console.log('Available in US:', availability.us);
console.log('Available in JP:', availability.jp);
```

## Multi-Language Search

Search in different languages:

```typescript
async function searchInLanguage(
  storefront: string,
  term: string,
  language: string,
  token: string
) {
  const url = new URL(
    `https://api.music.apple.com/v1/catalog/${storefront}/search`
  );
  url.searchParams.set('term', term);
  url.searchParams.set('types', 'songs,albums,artists');
  url.searchParams.set('l', language);

  const response = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return await response.json();
}

// Search with Japanese interface
const jpResults = await searchInLanguage('jp', 'ビートルズ', 'ja-JP', token);

// Search with English interface in Japanese store
const enResults = await searchInLanguage('jp', 'Beatles', 'en-US', token);
```

## Locale Detection

Detect user's locale from browser:

```typescript
function getUserLocale(): string {
  // Browser locale
  const browserLocale = navigator.language || 'en-US';

  // Parse to get language and region
  const [language, region] = browserLocale.split('-');

  // Ensure proper format
  return region
    ? `${language.toLowerCase()}-${region.toUpperCase()}`
    : `${language.toLowerCase()}-${language.toUpperCase()}`;
}

// Usage
const userLocale = getUserLocale();
console.log('User locale:', userLocale); // e.g., 'ja-JP', 'en-US'

// Use for API requests
const album = await getLocalizedAlbum('us', '123', userLocale, token);
```

## Localization Helper

Reusable localization utilities:

```typescript
class LocalizationHelper {
  private static readonly FALLBACK_LANGUAGE = 'en-US';

  static getStorefrontFromLocale(locale: string): string {
    const region = locale.split('-')[1]?.toLowerCase();
    return region || 'us';
  }

  static async getLocalizedContent<T>(
    fetchFn: (language: string) => Promise<T>,
    preferredLanguages: string[]
  ): Promise<T> {
    // Try preferred languages in order
    for (const lang of preferredLanguages) {
      try {
        return await fetchFn(lang);
      } catch {
        continue;
      }
    }

    // Fallback to English
    return await fetchFn(this.FALLBACK_LANGUAGE);
  }

  static formatLanguageTag(language: string, region: string): string {
    return `${language.toLowerCase()}-${region.toUpperCase()}`;
  }

  static parseLanguageTag(tag: string): {
    language: string;
    region: string;
  } {
    const [language, region] = tag.split('-');
    return {
      language: language.toLowerCase(),
      region: region?.toUpperCase() || language.toUpperCase()
    };
  }
}

// Usage
const storefront = LocalizationHelper.getStorefrontFromLocale('ja-JP'); // 'jp'

const album = await LocalizationHelper.getLocalizedContent(
  (lang) => getLocalizedAlbum('us', '123', lang, token),
  ['ja-JP', 'en-US'] // Try Japanese first, fallback to English
);
```

## Complete Localization Example

Full example with automatic locale detection and fallback:

```typescript
class LocalizedAppleMusicClient {
  constructor(
    private token: string,
    private preferredLanguages: string[] = [navigator.language, 'en-US']
  ) {}

  async getAlbum(
    albumId: string,
    storefront?: string
  ): Promise<Album> {
    const sf = storefront || this.getDefaultStorefront();

    for (const lang of this.preferredLanguages) {
      try {
        const response = await fetch(
          `https://api.music.apple.com/v1/catalog/${sf}/albums/${albumId}?l=${lang}`,
          {
            headers: { 'Authorization': `Bearer ${this.token}` }
          }
        );

        if (response.ok) {
          const data = await response.json();
          return data.data[0];
        }
      } catch {
        continue;
      }
    }

    throw new Error('Failed to fetch album in any supported language');
  }

  async search(
    term: string,
    storefront?: string
  ): Promise<SearchResponse> {
    const sf = storefront || this.getDefaultStorefront();
    const lang = this.preferredLanguages[0];

    const url = new URL(
      `https://api.music.apple.com/v1/catalog/${sf}/search`
    );
    url.searchParams.set('term', term);
    url.searchParams.set('types', 'songs,albums,artists');
    url.searchParams.set('l', lang);

    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });

    return await response.json();
  }

  private getDefaultStorefront(): string {
    const locale = this.preferredLanguages[0];
    const region = locale.split('-')[1]?.toLowerCase();
    return region || 'us';
  }
}

// Usage
const client = new LocalizedAppleMusicClient(
  token,
  ['ja-JP', 'en-US'] // Japanese preferred, English fallback
);

const album = await client.getAlbum('123');
console.log(album.attributes.name); // Localized name

const results = await client.search('ビートルズ');
console.log(results.results.artists?.data[0].attributes.name);
```

## Best Practices

1. **Detect user locale**: Use browser or system locale as default
2. **Provide fallbacks**: Always have English as ultimate fallback
3. **Cache by locale**: Cache responses separately for each language
4. **Respect user preferences**: Allow users to choose their language
5. **Test availability**: Not all content is available in all regions
6. **Use correct storefront**: Match storefront to user's region
7. **Handle missing translations**: Some content may not be translated
8. **Format consistently**: Use BCP 47 format for all language tags

## Related Documentation

- [Search API](../api/search.md): Localized search
- [Request Format](../core/request-format.md): Language parameters
- [Response Format](../core/response-format.md): Localized responses
