/**
 * Server-side geocoding utility using Nominatim (OpenStreetMap's free geocoding service)
 * This is free, open source, and allows commercial use.
 * 
 * Rate limit: 1 request per second
 * Usage policy: https://operations.osmfoundation.org/policies/nominatim/
 */

export type Coordinates = {
  latitude: number;
  longitude: number;
} | null;

/**
 * Geocode a location using Nominatim
 * @param city - City name (optional)
 * @param state - State/Province name (optional)
 * @param country - Country name (optional)
 * @returns Coordinates or null if geocoding fails
 */
export async function geocodeLocation(
  city: string | null,
  state: string | null,
  country: string | null
): Promise<Coordinates> {
  const parts = [city, state, country].filter(Boolean);
  if (parts.length === 0) return null;

  const query = parts.join(", ");

  try {
    // Use Nominatim - free, open source, allows commercial use
    // Rate limit: 1 request per second
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          "User-Agent": "ChargingTheFuture Directory Map", // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      console.error(`Geocoding failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
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

    // Rate limit: wait 1.1 seconds between requests
    if (i < locations.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }

  return results;
}

