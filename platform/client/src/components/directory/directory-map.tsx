import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, MapPin } from "lucide-react";

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

// Check if WebGL is available
function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch (e) {
    return false;
  }
}

// Lazy load the map component to avoid SSR issues
// Use a separate file with static imports to avoid ESM interop issues
const MapLibreMapComponent = lazy(() => import("./maplibre-map-internal"));

export function DirectoryMap({ profiles }: DirectoryMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [webGLAvailable, setWebGLAvailable] = useState<boolean | null>(null);

  // Ensure component only renders on client side and check WebGL
  useEffect(() => {
    setIsMounted(true);
    setWebGLAvailable(isWebGLAvailable());
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

  // Show WebGL error if not available
  if (webGLAvailable === false) {
    return (
      <div className="w-full h-[500px] rounded-lg border bg-muted/50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>WebGL Not Available</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Your device or browser doesn't support WebGL, which is required for the interactive map.
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold">Directory locations:</p>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {locationsWithCoords.map((loc) => (
                  <div key={loc.profile.id} className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{loc.profile.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {[loc.profile.city, loc.profile.state, loc.profile.country]
                          .filter(Boolean)
                          .join(", ") || "Location available"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
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
