import { useEffect, useState, useMemo, lazy, Suspense } from "react";

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
// Use a separate file with static imports to avoid ESM interop issues
const MapLibreMapComponent = lazy(() => import("./maplibre-map-internal"));

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
        <MapLibreMapComponent locations={locationsWithCoords} />
      </Suspense>
    </div>
  );
}
