/**
 * Server-side geocoding utility using Nominatim (OpenStreetMap's free geocoding service)
 * This is free, open source, and allows commercial use.
 * 
 * Rate limit: 1 request per second
 * Usage policy: https://operations.osmfoundation.org/policies/nominatim/
 */

import { Sentry } from "./sentry";

export type Coordinates = {
  latitude: number;
  longitude: number;
} | null;

/**
 * Geocoding error types for better error handling
 */
export enum GeocodingErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  API_ERROR = "API_ERROR",
  RATE_LIMIT = "RATE_LIMIT",
  INVALID_RESPONSE = "INVALID_RESPONSE",
  NO_RESULTS = "NO_RESULTS",
  INVALID_INPUT = "INVALID_INPUT",
}

/**
 * Geocoding error with type information
 */
export class GeocodingError extends Error {
  constructor(
    public type: GeocodingErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "GeocodingError";
  }
}

/**
 * Cache entry for geocoded locations
 */
interface CacheEntry {
  coordinates: Coordinates;
  timestamp: number;
}

/**
 * In-memory cache for geocoding results
 * Cache TTL: 24 hours (geocoding results don't change frequently)
 */
const GEOCODING_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Rate limiting: Track last request time to ensure minimum spacing
 * Nominatim rate limit: 1 request per second
 */
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 1100; // 1.1 seconds to be safe

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Check if an HTTP status code indicates a retryable error
 */
function isRetryableError(status: number): boolean {
  // Retry on 429 (rate limit), 5xx (server errors), and network timeouts
  return status === 429 || (status >= 500 && status < 600);
}

/**
 * Check if an error is a network error (retryable)
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("fetch failed") ||
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("econnrefused") ||
      message.includes("etimedout") ||
      message.includes("enotfound")
    );
  }
  return false;
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(attempt: number): number {
  const delay = Math.min(
    RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
    RETRY_CONFIG.maxDelayMs
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Log geocoding error to Sentry with context
 */
function logGeocodingError(
  error: GeocodingError,
  query: string,
  attempt: number,
  isRetry: boolean
): void {
  Sentry.captureException(error, {
    level: error.type === GeocodingErrorType.RATE_LIMIT ? "warning" : "error",
    tags: {
      geocoding_error_type: error.type,
      geocoding_query: query,
      geocoding_attempt: attempt,
      geocoding_is_retry: isRetry,
    },
    contexts: {
      geocoding: {
        query,
        error_type: error.type,
        attempt,
        is_retry: isRetry,
        original_error: error.originalError
          ? String(error.originalError)
          : undefined,
      },
    },
  });
}

/**
 * Get cache key from location parts
 */
function getCacheKey(city: string | null, state: string | null, country: string | null): string {
  return [city, state, country].filter(Boolean).join(", ").toLowerCase();
}

/**
 * Get cached coordinates if available and not expired
 */
function getCachedCoordinates(key: string): Coordinates | null {
  const entry = GEOCODING_CACHE.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > CACHE_TTL_MS) {
    GEOCODING_CACHE.delete(key);
    return null;
  }

  return entry.coordinates;
}

/**
 * Store coordinates in cache
 */
function cacheCoordinates(key: string, coordinates: Coordinates): void {
  if (coordinates) {
    GEOCODING_CACHE.set(key, {
      coordinates,
      timestamp: Date.now(),
    });
  }
}

/**
 * Perform a single geocoding request
 */
async function performGeocodingRequest(query: string): Promise<Coordinates> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
    {
      headers: {
        "User-Agent": "ChargingTheFuture Directory Map", // Required by Nominatim
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      throw new GeocodingError(
        GeocodingErrorType.RATE_LIMIT,
        `Rate limit exceeded: ${response.status} ${response.statusText}`,
        { status: response.status, statusText: response.statusText }
      );
    }
    if (isRetryableError(response.status)) {
      throw new GeocodingError(
        GeocodingErrorType.API_ERROR,
        `API error: ${response.status} ${response.statusText}`,
        { status: response.status, statusText: response.statusText }
      );
    }
    throw new GeocodingError(
      GeocodingErrorType.API_ERROR,
      `Geocoding failed: ${response.status} ${response.statusText}`,
      { status: response.status, statusText: response.statusText }
    );
  }

  const data = await response.json();
  
  if (!Array.isArray(data)) {
    throw new GeocodingError(
      GeocodingErrorType.INVALID_RESPONSE,
      "Invalid response format from geocoding API",
      { data }
    );
  }

  if (data.length === 0) {
    throw new GeocodingError(
      GeocodingErrorType.NO_RESULTS,
      `No results found for query: ${query}`,
      { query }
    );
  }

  const lat = parseFloat(data[0].lat);
  const lon = parseFloat(data[0].lon);

  if (isNaN(lat) || isNaN(lon)) {
    throw new GeocodingError(
      GeocodingErrorType.INVALID_RESPONSE,
      "Invalid coordinates in response",
      { lat: data[0].lat, lon: data[0].lon }
    );
  }

  return {
    latitude: lat,
    longitude: lon,
  };
}

/**
 * Geocode a location using Nominatim with retry logic, caching, and error handling
 * @param city - City name (optional)
 * @param state - State/Province name (optional)
 * @param country - Country name (optional)
 * @returns Coordinates or null if geocoding fails after all retries
 */
export async function geocodeLocation(
  city: string | null,
  state: string | null,
  country: string | null
): Promise<Coordinates> {
  const parts = [city, state, country].filter(Boolean);
  if (parts.length === 0) {
    return null;
  }

  const query = parts.join(", ");
  const cacheKey = getCacheKey(city, state, country);

  // Check cache first
  const cached = getCachedCoordinates(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Rate limiting: Ensure minimum time between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    const waitTime = MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();

  let lastError: GeocodingError | null = null;

  // Retry loop
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    const isRetry = attempt > 0;

    try {
      const coordinates = await performGeocodingRequest(query);
      
      // Cache successful result
      cacheCoordinates(cacheKey, coordinates);
      
      // Log successful retry if applicable
      if (isRetry) {
        Sentry.captureMessage(`Geocoding succeeded after ${attempt} retries`, {
          level: "info",
          tags: {
            geocoding_query: query,
            geocoding_retry_count: attempt,
          },
        });
      }

      return coordinates;
    } catch (error) {
      // Handle AbortError (timeout) as network error
      if (error instanceof Error && error.name === "AbortError") {
        lastError = new GeocodingError(
          GeocodingErrorType.NETWORK_ERROR,
          "Geocoding request timed out",
          error
        );
      } else if (error instanceof GeocodingError) {
        lastError = error;
      } else if (isNetworkError(error)) {
        lastError = new GeocodingError(
          GeocodingErrorType.NETWORK_ERROR,
          `Network error during geocoding: ${error instanceof Error ? error.message : String(error)}`,
          error
        );
      } else {
        lastError = new GeocodingError(
          GeocodingErrorType.API_ERROR,
          `Unexpected error during geocoding: ${error instanceof Error ? error.message : String(error)}`,
          error
        );
      }

      // Log error
      logGeocodingError(lastError, query, attempt + 1, isRetry);

      // Don't retry on non-retryable errors
      if (
        lastError.type === GeocodingErrorType.NO_RESULTS ||
        lastError.type === GeocodingErrorType.INVALID_RESPONSE ||
        lastError.type === GeocodingErrorType.INVALID_INPUT
      ) {
        break;
      }

      // If this was the last attempt, break
      if (attempt >= RETRY_CONFIG.maxRetries) {
        break;
      }

      // Calculate delay before retry
      const delay = calculateBackoffDelay(attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries exhausted
  if (lastError) {
    console.error(`Geocoding failed after ${RETRY_CONFIG.maxRetries + 1} attempts:`, {
      query,
      errorType: lastError.type,
      error: lastError.message,
    });
  }

  return null;
}

/**
 * Geocode multiple locations with rate limiting
 * @param locations - Array of location objects to geocode
 * @returns Array of geocoded coordinates (null for failed geocoding)
 */
export async function geocodeLocations(
  locations: Array<{ city: string | null; state: string | null; country: string | null }>
): Promise<Coordinates[]> {
  const results: Coordinates[] = [];

  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    const coords = await geocodeLocation(location.city, location.state, location.country);
    results.push(coords);

    // Rate limit: wait 1.1 seconds between requests to respect Nominatim's rate limit
    // This is in addition to any retry delays that may have occurred
    if (i < locations.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }

  return results;
}

