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
