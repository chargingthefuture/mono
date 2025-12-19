import { useEffect, useState, useMemo, lazy, Suspense } from "react";
// Import CSS at top level to avoid issues with Promise.all and CSS modules
import "leaflet/dist/leaflet.css";

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

type DirectoryMapProps = {
  profiles: ProfileLocation[];
};

// Lazy load the map component to avoid SSR issues
const LeafletMapComponent = lazy(async () => {
  // Import modules separately to avoid ESM interop issues
  const leafletModule = await import("leaflet");
  const reactLeafletModule = await import("react-leaflet");
  
  // Handle both default and named exports for leaflet
  const Leaflet = leafletModule.default || leafletModule;
  
  // Fix default marker icons - ensure we're accessing the correct structure
  if (Leaflet.Icon && Leaflet.Icon.Default) {
    delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
    Leaflet.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }

  // Extract react-leaflet components - handle both named exports and default exports
  // In react-leaflet v5, these are named exports from the module namespace
  const MapContainer = reactLeafletModule.MapContainer || (reactLeafletModule as any).default?.MapContainer;
  const TileLayer = reactLeafletModule.TileLayer || (reactLeafletModule as any).default?.TileLayer;
  const Marker = reactLeafletModule.Marker || (reactLeafletModule as any).default?.Marker;
  const Popup = reactLeafletModule.Popup || (reactLeafletModule as any).default?.Popup;
  const useMap = reactLeafletModule.useMap || (reactLeafletModule as any).default?.useMap;

  // Validate that all required components are available
  if (!MapContainer || !TileLayer || !Marker || !Popup || !useMap) {
    throw new Error("Failed to load react-leaflet components");
  }

  // Return a component that uses the loaded modules
  return {
    default: ({ locations }: { locations: LocationWithCoords[] }) => {

      // Component to adjust map bounds - must be inside MapContainer
      function MapBounds({ locations }: { locations: LocationWithCoords[] }) {
        const map = useMap();

        useEffect(() => {
          if (locations.length === 0 || !map) return;

          const bounds = Leaflet.latLngBounds(
            locations.map((loc) => [loc.lat, loc.lng])
          );
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
        }, [locations, map, Leaflet]);

        return null;
      }

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
    },
  };
});

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

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        }
      >
        <LeafletMapComponent locations={locationsWithCoords} />
      </Suspense>
    </div>
  );
}
