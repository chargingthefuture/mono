import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React-Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

type ProfileLocation = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  country: string | null;
  description: string;
  skills: string[];
  profileUrl: string;
};

type GeocodedLocation = {
  profile: ProfileLocation;
  lat: number;
  lng: number;
};

// Component to adjust map view when markers change
function MapBounds({ locations }: { locations: GeocodedLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) return;

    const bounds = L.latLngBounds(
      locations.map((loc) => [loc.lat, loc.lng])
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
  }, [locations, map]);

  return null;
}

// Geocode a location using Nominatim (OpenStreetMap's free geocoding service)
async function geocodeLocation(
  city: string | null,
  state: string | null,
  country: string | null
): Promise<{ lat: number; lng: number } | null> {
  const parts = [city, state, country].filter(Boolean);
  if (parts.length === 0) return null;

  const query = parts.join(", ");
  
  try {
    // Use Nominatim - free, open source, allows commercial use
    // Rate limit: 1 request per second (we'll batch requests)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          "User-Agent": "ChargingTheFuture Directory Map", // Required by Nominatim
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }

  return null;
}

type DirectoryMapProps = {
  profiles: ProfileLocation[];
};

export function DirectoryMap({ profiles }: DirectoryMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [geocodedLocations, setGeocodedLocations] = useState<
    GeocodedLocation[]
  >([]);
  const [isGeocoding, setIsGeocoding] = useState(true);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter profiles that have location data
  const profilesWithLocation = useMemo(
    () =>
      profiles.filter(
        (p) => p.city || p.state || p.country
      ),
    [profiles]
  );

  useEffect(() => {
    let isMounted = true;

    async function geocodeAll() {
      setIsGeocoding(true);
      const results: GeocodedLocation[] = [];

      // Geocode with rate limiting (1 request per second for Nominatim)
      for (let i = 0; i < profilesWithLocation.length; i++) {
        if (!isMounted) break;

        const profile = profilesWithLocation[i];
        const coords = await geocodeLocation(
          profile.city,
          profile.state,
          profile.country
        );

        if (coords && isMounted) {
          results.push({
            profile,
            ...coords,
          });
        }

        // Rate limit: wait 1.1 seconds between requests
        if (i < profilesWithLocation.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1100));
        }
      }

      if (isMounted) {
        setGeocodedLocations(results);
        setIsGeocoding(false);
      }
    }

    if (profilesWithLocation.length > 0) {
      geocodeAll();
    } else {
      setIsGeocoding(false);
    }

    return () => {
      isMounted = false;
    };
  }, [profilesWithLocation]);

  if (!isMounted) {
    return (
      <div className="w-full h-[500px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  if (profilesWithLocation.length === 0) {
    return (
      <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No location data available</p>
      </div>
    );
  }

  // Default center (world center) - will be adjusted by MapBounds
  const defaultCenter: [number, number] = [20, 0];
  const defaultZoom = 2;

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border">
      {isGeocoding ? (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">Loading map locations...</p>
            <p className="text-sm text-muted-foreground">
              Geocoding {profilesWithLocation.length} location
              {profilesWithLocation.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      ) : geocodedLocations.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">
            Could not geocode any locations
          </p>
        </div>
      ) : (
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          {/* OpenStreetMap tiles - free, open source, commercial use allowed */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBounds locations={geocodedLocations} />
          {geocodedLocations.map((location) => (
            <Marker
              key={location.profile.id}
              position={[location.lat, location.lng]}
            >
              <Popup>
                <div className="p-2 space-y-2 min-w-[200px]">
                  <h3 className="font-semibold text-sm">
                    {location.profile.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {location.profile.description}
                  </p>
                  {location.profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {location.profile.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {[
                      location.profile.city,
                      location.profile.state,
                      location.profile.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <a
                    href={location.profile.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-block mt-1"
                  >
                    View Profile →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}

