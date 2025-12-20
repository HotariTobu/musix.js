# Developer Tokens

Developer tokens are JSON Web Tokens (JWT) that authenticate requests to the Apple Music API. They are required for all API requests and are signed with your MusicKit private key.

## Overview

Developer tokens:
- Are required for ALL Apple Music API requests
- Are valid for up to 6 months (180 days)
- Do not provide access to user-specific data (need Music-User-Token for that)
- Are signed using ES256 (ECDSA with P-256 curve and SHA-256)
- Should be generated server-side and cached

## Prerequisites

Before generating tokens, you need:

1. **Apple Developer Account** (free or paid)
2. **MusicKit Identifier** - Created in Apple Developer Portal
3. **MusicKit Private Key** (.p8 file) - Downloaded from Apple Developer Portal
4. **Team ID** - 10-character identifier from your Apple Developer account
5. **Key ID** - 10-character identifier for your MusicKit key

## Creating a MusicKit Identifier and Key

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Keys** in the sidebar
4. Click the **+** button to create a new key
5. Name your key and check **MusicKit**
6. Click **Continue** and then **Register**
7. Download the `.p8` file - **you can only download this once**
8. Note the **Key ID** (10 characters)
9. Note your **Team ID** from Membership page

## Token Structure

A developer token is a JWT with the following structure:

### Header

```json
{
  "alg": "ES256",
  "kid": "ABC123DEFG"
}
```

- `alg`: Must be `ES256` (ECDSA with P-256 and SHA-256)
- `kid`: Your 10-character Key ID

### Payload

```json
{
  "iss": "DEF123GHIJ",
  "iat": 1234567890,
  "exp": 1250121890
}
```

- `iss`: Your 10-character Team ID (issuer)
- `iat`: Issued at time (Unix timestamp)
- `exp`: Expiration time (Unix timestamp, max 180 days from `iat`)

## Generating Tokens

### Node.js with jsonwebtoken

```typescript
import jwt from 'jsonwebtoken';
import fs from 'fs';

interface TokenConfig {
  teamId: string;      // 10-character Team ID
  keyId: string;       // 10-character Key ID
  privateKeyPath: string;
  expirationDays?: number; // Max 180 days
}

function generateDeveloperToken(config: TokenConfig): string {
  const privateKey = fs.readFileSync(config.privateKeyPath, 'utf8');

  const now = Math.floor(Date.now() / 1000);
  const expirationDays = Math.min(config.expirationDays || 180, 180);
  const expirationTime = now + (86400 * expirationDays);

  const payload = {
    iss: config.teamId,
    iat: now,
    exp: expirationTime
  };

  const header = {
    alg: 'ES256' as const,
    kid: config.keyId
  };

  return jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    header: header
  });
}

// Usage
const token = generateDeveloperToken({
  teamId: 'DEF123GHIJ',
  keyId: 'ABC123DEFG',
  privateKeyPath: './AuthKey_ABC123DEFG.p8',
  expirationDays: 180
});

console.log('Developer Token:', token);
```

### TypeScript with jose

```typescript
import { SignJWT } from 'jose';
import { createPrivateKey } from 'crypto';
import fs from 'fs';

async function generateDeveloperToken(
  teamId: string,
  keyId: string,
  privateKeyPath: string
): Promise<string> {
  const privateKeyContent = fs.readFileSync(privateKeyPath, 'utf8');
  const privateKey = createPrivateKey(privateKeyContent);

  const now = Math.floor(Date.now() / 1000);
  const exp = now + (86400 * 180); // 180 days

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(privateKey);

  return token;
}

// Usage
const token = await generateDeveloperToken(
  'DEF123GHIJ',
  'ABC123DEFG',
  './AuthKey_ABC123DEFG.p8'
);
```

## Using the Token

Include the developer token in the `Authorization` header of every request:

```typescript
const response = await fetch('https://api.music.apple.com/v1/catalog/us/albums/123', {
  headers: {
    'Authorization': `Bearer ${developerToken}`
  }
});
```

## Token Caching

Since tokens are valid for up to 180 days, you should cache and reuse them:

```typescript
class MusicKitTokenManager {
  private token: string | null = null;
  private expirationTime: number = 0;

  constructor(
    private teamId: string,
    private keyId: string,
    private privateKeyPath: string
  ) {}

  getToken(): string {
    const now = Math.floor(Date.now() / 1000);

    // Regenerate if token expires in less than 1 day
    if (!this.token || now > this.expirationTime - 86400) {
      this.token = generateDeveloperToken({
        teamId: this.teamId,
        keyId: this.keyId,
        privateKeyPath: this.privateKeyPath,
        expirationDays: 180
      });
      this.expirationTime = now + (86400 * 180);
    }

    return this.token;
  }
}

// Usage
const tokenManager = new MusicKitTokenManager(
  process.env.APPLE_TEAM_ID!,
  process.env.APPLE_KEY_ID!,
  './AuthKey.p8'
);

const token = tokenManager.getToken();
```

## Security Best Practices

1. **Never expose your private key**: Keep the `.p8` file secure and never commit it to version control
2. **Generate tokens server-side**: Never generate tokens in client-side code
3. **Use environment variables**: Store Team ID and Key ID in environment variables
4. **Rotate keys periodically**: Apple allows multiple active keys
5. **Set appropriate expiration**: Use shorter expiration times for sensitive applications
6. **Validate token format**: Ensure tokens are properly formatted before use

## Environment Variables

```bash
# .env file
APPLE_TEAM_ID=DEF123GHIJ
APPLE_KEY_ID=ABC123DEFG
APPLE_PRIVATE_KEY_PATH=/path/to/AuthKey_ABC123DEFG.p8
```

```typescript
import dotenv from 'dotenv';
dotenv.config();

const token = generateDeveloperToken({
  teamId: process.env.APPLE_TEAM_ID!,
  keyId: process.env.APPLE_KEY_ID!,
  privateKeyPath: process.env.APPLE_PRIVATE_KEY_PATH!
});
```

## Validation

To verify your token is properly formatted:

```typescript
import jwt from 'jsonwebtoken';

function validateDeveloperToken(token: string): boolean {
  try {
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded || typeof decoded === 'string') {
      return false;
    }

    // Check header
    if (decoded.header.alg !== 'ES256' || !decoded.header.kid) {
      return false;
    }

    // Check payload
    const payload = decoded.payload as jwt.JwtPayload;
    if (!payload.iss || !payload.iat || !payload.exp) {
      return false;
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.error('Token expired');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}
```

## Common Errors

### Invalid Signature

```
Status: 401 Unauthorized
Error: Token signature is invalid
```

**Solution**: Ensure you're using the correct private key and ES256 algorithm.

### Token Expired

```
Status: 401 Unauthorized
Error: Token expired
```

**Solution**: Generate a new token. Tokens can be valid for maximum 180 days.

### Invalid Key ID

```
Status: 401 Unauthorized
Error: Invalid key identifier
```

**Solution**: Verify the Key ID in the token header matches your MusicKit key.

## Related Documentation

- [User Authentication](user-authentication.md): Adding user-specific data access
- [Token Management](token-management.md): Managing token lifecycle
- [Error Handling](../core/error-handling.md): Handling authentication errors
