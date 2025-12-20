# Token Management

Effective token management ensures your Apple Music API integration remains secure, performant, and reliable. This guide covers best practices for managing both developer tokens and user tokens.

## Developer Token Lifecycle

### Token Expiration

Developer tokens can be valid for up to **180 days** (15,552,000 seconds):

```typescript
interface DeveloperToken {
  token: string;
  issuedAt: number;      // Unix timestamp
  expiresAt: number;     // Unix timestamp
}

function createTokenMetadata(token: string): DeveloperToken {
  const jwt = require('jsonwebtoken');
  const decoded = jwt.decode(token) as { iat: number; exp: number };

  return {
    token,
    issuedAt: decoded.iat,
    expiresAt: decoded.exp
  };
}
```

### Token Renewal Strategy

Renew tokens before they expire to avoid service interruptions:

```typescript
class DeveloperTokenManager {
  private token: DeveloperToken | null = null;
  private readonly RENEWAL_THRESHOLD = 86400; // 1 day in seconds

  constructor(
    private teamId: string,
    private keyId: string,
    private privateKeyPath: string
  ) {}

  needsRenewal(): boolean {
    if (!this.token) return true;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = this.token.expiresAt - now;

    return timeUntilExpiry < this.RENEWAL_THRESHOLD;
  }

  async getToken(): Promise<string> {
    if (this.needsRenewal()) {
      await this.renewToken();
    }

    return this.token!.token;
  }

  private async renewToken(): Promise<void> {
    const token = generateDeveloperToken({
      teamId: this.teamId,
      keyId: this.keyId,
      privateKeyPath: this.privateKeyPath,
      expirationDays: 180
    });

    this.token = createTokenMetadata(token);

    console.log(`Token renewed, expires at ${new Date(this.token.expiresAt * 1000)}`);
  }
}
```

### Persistent Storage

Store tokens securely to avoid regenerating on every restart:

```typescript
import fs from 'fs/promises';
import path from 'path';

class PersistentTokenManager extends DeveloperTokenManager {
  private tokenFilePath: string;

  constructor(
    teamId: string,
    keyId: string,
    privateKeyPath: string,
    storagePath: string = './.tokens'
  ) {
    super(teamId, keyId, privateKeyPath);
    this.tokenFilePath = path.join(storagePath, 'developer-token.json');
  }

  async initialize(): Promise<void> {
    await this.loadToken();
    if (this.needsRenewal()) {
      await this.renewToken();
      await this.saveToken();
    }
  }

  private async loadToken(): Promise<void> {
    try {
      const data = await fs.readFile(this.tokenFilePath, 'utf8');
      this.token = JSON.parse(data);
    } catch (error) {
      // Token file doesn't exist or is invalid
      this.token = null;
    }
  }

  private async saveToken(): Promise<void> {
    if (!this.token) return;

    const dir = path.dirname(this.tokenFilePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      this.tokenFilePath,
      JSON.stringify(this.token, null, 2)
    );
  }

  protected async renewToken(): Promise<void> {
    await super.renewToken();
    await this.saveToken();
  }
}

// Usage
const manager = new PersistentTokenManager(
  process.env.APPLE_TEAM_ID!,
  process.env.APPLE_KEY_ID!,
  process.env.APPLE_PRIVATE_KEY_PATH!
);

await manager.initialize();
const token = await manager.getToken();
```

## User Token Lifecycle

### Token Validation

User tokens don't have a fixed expiration time but should be validated periodically:

```typescript
class UserTokenManager {
  private static readonly STORAGE_KEY = 'apple_music_user_token';
  private static readonly VALIDATION_KEY = 'token_validated_at';
  private static readonly VALIDATION_INTERVAL = 3600000; // 1 hour in ms

  static async getValidToken(
    developerToken: string,
    musicKit: any
  ): Promise<string | null> {
    const savedToken = this.getSavedToken();

    if (!savedToken) {
      return null;
    }

    if (this.shouldValidate()) {
      const isValid = await this.validateToken(developerToken, savedToken);

      if (!isValid) {
        this.clearToken();
        return null;
      }

      this.markValidated();
    }

    return savedToken;
  }

  private static shouldValidate(): boolean {
    const lastValidation = localStorage.getItem(this.VALIDATION_KEY);
    if (!lastValidation) return true;

    const timeSinceValidation = Date.now() - parseInt(lastValidation, 10);
    return timeSinceValidation > this.VALIDATION_INTERVAL;
  }

  private static async validateToken(
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

  private static markValidated(): void {
    localStorage.setItem(this.VALIDATION_KEY, Date.now().toString());
  }

  static getSavedToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  static saveToken(token: string): void {
    localStorage.setItem(this.STORAGE_KEY, token);
    this.markValidated();
  }

  static clearToken(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.VALIDATION_KEY);
  }
}
```

## Combined Token Management

Manage both token types in a unified client:

```typescript
class AppleMusicClient {
  private developerTokenManager: DeveloperTokenManager;
  private musicKit: any;
  private userToken: string | null = null;

  constructor(developerTokenManager: DeveloperTokenManager) {
    this.developerTokenManager = developerTokenManager;
  }

  async initialize(): Promise<void> {
    const developerToken = await this.developerTokenManager.getToken();

    await window.MusicKit.configure({
      developerToken,
      app: {
        name: 'My App',
        build: '1.0.0'
      }
    });

    this.musicKit = window.MusicKit.getInstance();
  }

  async ensureAuthenticated(): Promise<boolean> {
    // Check if user is already authorized
    if (this.musicKit.isAuthorized) {
      this.userToken = this.musicKit.musicUserToken;
      return true;
    }

    // Try to restore saved token
    const savedToken = UserTokenManager.getSavedToken();
    if (savedToken) {
      const developerToken = await this.developerTokenManager.getToken();
      const isValid = await UserTokenManager.validateToken(
        developerToken,
        savedToken
      );

      if (isValid) {
        this.userToken = savedToken;
        return true;
      }
    }

    // Request new authorization
    try {
      this.userToken = await this.musicKit.authorize();
      UserTokenManager.saveToken(this.userToken);
      return true;
    } catch {
      return false;
    }
  }

  async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const developerToken = await this.developerTokenManager.getToken();

    const headers: HeadersInit = {
      'Authorization': `Bearer ${developerToken}`,
      ...options.headers
    };

    if (this.userToken) {
      headers['Music-User-Token'] = this.userToken;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401 && this.userToken) {
      // Token might be expired, clear and re-authenticate
      UserTokenManager.clearToken();
      this.userToken = null;

      const authenticated = await this.ensureAuthenticated();
      if (!authenticated) {
        throw new Error('Failed to re-authenticate');
      }

      // Retry request
      return this.request<T>(url, options);
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  }
}
```

## Security Best Practices

### Environment-Based Configuration

```typescript
interface TokenConfig {
  development: {
    tokenPath: string;
    autoRenew: boolean;
    expirationDays: number;
  };
  production: {
    tokenPath: string;
    autoRenew: boolean;
    expirationDays: number;
  };
}

const config: TokenConfig = {
  development: {
    tokenPath: './.dev-tokens',
    autoRenew: true,
    expirationDays: 7 // Shorter for development
  },
  production: {
    tokenPath: process.env.TOKEN_STORAGE_PATH || '/var/tokens',
    autoRenew: true,
    expirationDays: 180
  }
};

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const envConfig = config[env];
```

### Secure Storage

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

class SecureTokenStorage {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(encryptionKey: string) {
    // Derive 32-byte key from password
    this.key = Buffer.from(encryptionKey.padEnd(32, '0').slice(0, 32));
  }

  encrypt(token: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted,
      authTag: authTag.toString('hex')
    });
  }

  decrypt(encryptedData: string): string {
    const { iv, encrypted, authTag } = JSON.parse(encryptedData);

    const decipher = createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// Usage
const storage = new SecureTokenStorage(process.env.ENCRYPTION_KEY!);
const encrypted = storage.encrypt(token);
fs.writeFileSync('token.enc', encrypted);

// Later
const encryptedData = fs.readFileSync('token.enc', 'utf8');
const token = storage.decrypt(encryptedData);
```

## Token Rotation

Implement key rotation for enhanced security:

```typescript
class TokenRotationManager {
  private primaryManager: DeveloperTokenManager;
  private secondaryManager: DeveloperTokenManager | null = null;

  async rotateKey(newKeyId: string, newPrivateKeyPath: string): Promise<void> {
    // Create new token manager with new key
    this.secondaryManager = new DeveloperTokenManager(
      this.primaryManager.teamId,
      newKeyId,
      newPrivateKeyPath
    );

    // Generate token with new key
    await this.secondaryManager.renewToken();

    // Swap primary and secondary
    this.primaryManager = this.secondaryManager;
    this.secondaryManager = null;

    console.log('Key rotation completed');
  }

  async getToken(): Promise<string> {
    return this.primaryManager.getToken();
  }
}
```

## Monitoring and Logging

Track token usage and issues:

```typescript
class MonitoredTokenManager extends DeveloperTokenManager {
  private metrics = {
    tokensGenerated: 0,
    tokenRenewals: 0,
    validationFailures: 0
  };

  protected async renewToken(): Promise<void> {
    const startTime = Date.now();

    try {
      await super.renewToken();
      this.metrics.tokensGenerated++;
      this.metrics.tokenRenewals++;

      console.log(`Token renewed in ${Date.now() - startTime}ms`);
    } catch (error) {
      this.metrics.validationFailures++;
      console.error('Token renewal failed:', error);
      throw error;
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }
}
```

## Error Recovery

Handle token-related errors gracefully:

```typescript
async function fetchWithTokenRecovery<T>(
  url: string,
  tokenManager: DeveloperTokenManager,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const token = await tokenManager.getToken();

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Force token renewal
        await tokenManager.renewToken();
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  throw new Error('Max retries exceeded');
}
```

## Best Practices Summary

1. **Cache tokens**: Don't generate new tokens for every request
2. **Renew proactively**: Refresh before expiration to avoid downtime
3. **Secure storage**: Encrypt tokens at rest
4. **Validate periodically**: Check user tokens regularly
5. **Handle expiration**: Implement automatic token refresh
6. **Monitor usage**: Track token generation and failures
7. **Rotate keys**: Change keys periodically for security
8. **Environment-specific**: Use different expiration times per environment

## Related Documentation

- [Developer Tokens](developer-tokens.md): Creating developer tokens
- [User Authentication](user-authentication.md): Managing user tokens
- [Error Handling](../core/error-handling.md): Handling token errors
