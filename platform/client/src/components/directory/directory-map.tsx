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
  latitude: number | null;
  longitude: number | null;
  description: string;
  skills: string[];
  profileUrl: string;
};

type LocationWithCoords = {
  profile: ProfileLocation;
  lat: number;
  lng: number;
};

// Component to adjust map view when markers change
function MapBounds({ locations }: { locations: LocationWithCoords[] }) {
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

type DirectoryMapProps = {
  profiles: ProfileLocation[];
};

export function DirectoryMap({ profiles }: DirectoryMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter profiles that have coordinates (already geocoded and stored in DB)
  const locationsWithCoords = useMemo(() => {
    return profiles
      .filter((p) => p.latitude !== null && p.longitude !== null)
      .map((profile) => ({
        profile,
        lat: profile.latitude!,
        lng: profile.longitude!,
      }));
  }, [profiles]);

  if (!isMounted) {
    return (
      <div className="w-full h-[500px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  if (locationsWithCoords.length === 0) {
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
        <MapBounds locations={locationsWithCoords} />
        {locationsWithCoords.map((location) => (
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
    </div>
  );
}

