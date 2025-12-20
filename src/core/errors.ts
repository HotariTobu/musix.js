/** Authentication error (invalid credentials) */
export class AuthenticationError extends Error {
  override name = "AuthenticationError" as const;
}

/** Resource not found error */
export class NotFoundError extends Error {
  override name = "NotFoundError" as const;
  resourceType: "track" | "album" | "artist" | "playlist";
  resourceId: string;

  constructor(
    resourceType: "track" | "album" | "artist" | "playlist",
    resourceId: string,
  ) {
    super(`${resourceType} not found: ${resourceId}`);
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/** Rate limit error */
export class RateLimitError extends Error {
  override name = "RateLimitError" as const;
  retryAfter: number;

  constructor(retryAfter: number) {
    super(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
    this.retryAfter = retryAfter;
  }
}

/** Network error (connection failure, timeout) */
export class NetworkError extends Error {
  override name = "NetworkError" as const;
  override cause?: Error;

  constructor(message: string, cause?: Error) {
    super(`Network error: ${message}`);
    this.cause = cause;
  }
}

/** Spotify API error (other API errors) */
export class SpotifyApiError extends Error {
  override name = "SpotifyApiError" as const;
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(`Spotify API error: ${statusCode} ${message}`);
    this.statusCode = statusCode;
  }
}

/** Validation error for invalid input parameters */
export class ValidationError extends Error {
  override name = "ValidationError" as const;
}

/** Premium required error for playback features */
export class PremiumRequiredError extends Error {
  override name = "PremiumRequiredError" as const;

  constructor() {
    super("Spotify Premium subscription is required for playback control");
  }
}

/** No active device error */
export class NoActiveDeviceError extends Error {
  override name = "NoActiveDeviceError" as const;

  constructor() {
    super("No active playback device found. Open Spotify on a device first.");
  }
}
