import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as Leaflet from "leaflet";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Fix default marker icons
if (Leaflet.Icon && Leaflet.Icon.Default) {
  delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
  Leaflet.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

type LocationWithCoords = {
  profile: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    country: string | null;
    description: string;
    skills: string[];
    profileUrl: string;
  };
  lat: number;
  lng: number;
};

// Component to adjust map bounds - must be inside MapContainer
function MapBounds({ locations }: { locations: LocationWithCoords[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0 || !map) return;
    
    // Ensure map has fitBounds method
    if (!map || typeof map.fitBounds !== "function") {
      // This is a non-critical warning, no need to log to Sentry
      return;
    }

    try {
      const bounds = Leaflet.latLngBounds(
        locations.map((loc) => [loc.lat, loc.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    } catch (error) {
      // Bounds setting is non-critical, silently fail
      // Error is already handled by React Query error boundaries if needed
    }
  }, [locations, map]);

  return null;
}

export default function LeafletMapInternal({ locations }: { locations: LocationWithCoords[] }) {
  const defaultCenter: [number, number] = [20, 0];
  const defaultZoom = 2;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBounds locations={locations} />
      {locations.map((location) => (
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
  );
}


