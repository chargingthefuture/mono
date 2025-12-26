import { useState, useMemo, useCallback, useEffect } from "react";
import Map, { Marker, Popup, ViewState } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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

type MapLibreMapInternalProps = {
  locations: LocationWithCoords[];
};

export default function MapLibreMapInternal({ locations }: MapLibreMapInternalProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationWithCoords | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState | null>(null);
  const { handleError } = useErrorHandler({ showToast: false }); // Don't show toast, we handle UI ourselves

  // Check WebGL on mount
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setMapError("WebGL is not supported on this device. Please use a different browser or device.");
      }
    } catch (e) {
      setMapError("Failed to initialize WebGL. Please refresh or try again later.");
    }
  }, []);

  // Calculate bounds to fit all markers
  const bounds = useMemo(() => {
    if (locations.length === 0) return null;
    
    const lats = locations.map((loc) => loc.lat);
    const lngs = locations.map((loc) => loc.lng);
    
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    };
  }, [locations]);

  // Calculate center and zoom from bounds
  const { initialViewState } = useMemo(() => {
    if (bounds) {
      const centerLat = (bounds.north + bounds.south) / 2;
      const centerLng = (bounds.east + bounds.west) / 2;
      
      // Calculate zoom level based on bounds
      const latDiff = bounds.north - bounds.south;
      const lngDiff = bounds.east - bounds.west;
      const maxDiff = Math.max(latDiff, lngDiff);
      
      let zoom = 2;
      if (maxDiff < 0.1) zoom = 10;
      else if (maxDiff < 0.5) zoom = 8;
      else if (maxDiff < 1) zoom = 6;
      else if (maxDiff < 5) zoom = 4;
      else zoom = 2;

      return {
        initialViewState: {
          longitude: centerLng,
          latitude: centerLat,
          zoom: zoom,
        },
      };
    }
    
    return {
      initialViewState: {
        longitude: 0,
        latitude: 20,
        zoom: 2,
      },
    };
  }, [bounds]);

  // Filter markers to only show those in the current viewport
  // This significantly improves performance when there are many markers
  // For initial load or when viewState is not available, show all markers
  // Once the map is loaded and user interacts, filter to visible markers only
  const visibleLocations = useMemo(() => {
    // If we have many markers (>100), use viewport filtering once map is loaded
    // Otherwise, show all markers for better UX
    if (locations.length <= 100 || !viewState) {
      return locations;
    }

    // Simple viewport bounds calculation based on zoom level
    // At zoom level z, one tile covers 360 / 2^z degrees longitude
    // We approximate latitude range similarly
    const zoom = viewState.zoom || 2;
    const latRange = 180 / Math.pow(2, Math.max(0, zoom - 1));
    const lngRange = 360 / Math.pow(2, zoom);
    const buffer = 0.2; // 20% buffer to show markers near edges
    
    const viewportNorth = (viewState.latitude || 0) + (latRange / 2) * (1 + buffer);
    const viewportSouth = (viewState.latitude || 0) - (latRange / 2) * (1 + buffer);
    const viewportEast = (viewState.longitude || 0) + (lngRange / 2) * (1 + buffer);
    const viewportWest = (viewState.longitude || 0) - (lngRange / 2) * (1 + buffer);

    return locations.filter((loc) => {
      // Simple bounds check with longitude wrapping support
      const inLat = loc.lat >= viewportSouth && loc.lat <= viewportNorth;
      if (!inLat) return false;
      
      // Handle longitude wrapping (e.g., crossing -180/180)
      if (viewportWest > viewportEast) {
        return loc.lng >= viewportWest || loc.lng <= viewportEast;
      }
      return loc.lng >= viewportWest && loc.lng <= viewportEast;
    });
  }, [locations, viewState]);

  // Handle map movement to update viewport
  const handleMove = useCallback((evt: { viewState: ViewState }) => {
    setViewState(evt.viewState);
  }, []);

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Map Error</AlertTitle>
          <AlertDescription>
            {mapError}. Please refresh the page or try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Map
      {...initialViewState}
      style={{ width: "100%", height: "100%" }}
      mapStyle={{
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            // Use CartoDB Positron tiles as a more reliable alternative to OSM
            // These tiles are free, don't require API keys, and have better CORS support
            tiles: [
              "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors © CARTO",
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm-tiles",
          },
        ],
      }}
      scrollZoom={true}
      onError={(e: any) => {
        const errorMessage = e?.error?.message || e?.message || "Failed to load map";
        // Check if it's a WebGL error
        const isWebGLError = 
          errorMessage.toLowerCase().includes("webgl") ||
          errorMessage.toLowerCase().includes("failed to initialize") ||
          errorMessage.toLowerCase().includes("context lost");
        
        const displayMessage = isWebGLError
          ? "Failed to initialize WebGL. Please refresh or try again later."
          : errorMessage;
        
        setMapError(displayMessage);
        handleError(new Error(displayMessage), "Map Error");
      }}
      onMove={handleMove}
    >
      {visibleLocations.map((location) => (
        <Marker
          key={location.profile.id}
          longitude={location.lng}
          latitude={location.lat}
          anchor="bottom"
          onClick={(e: any) => {
            e.originalEvent.stopPropagation();
            setSelectedLocation(location);
          }}
        >
          <div className="cursor-pointer">
            <svg
              width="25"
              height="35"
              viewBox="0 0 25 35"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 0C5.596 0 0 5.596 0 12.5C0 21.875 12.5 35 12.5 35C12.5 35 25 21.875 25 12.5C25 5.596 19.404 0 12.5 0Z"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
              <circle cx="12.5" cy="12.5" r="5" fill="white" />
            </svg>
          </div>
        </Marker>
      ))}

      {selectedLocation && (
        <Popup
          longitude={selectedLocation.lng}
          latitude={selectedLocation.lat}
          anchor="bottom"
          onClose={() => setSelectedLocation(null)}
          closeButton={true}
          closeOnClick={false}
        >
          <div className="p-2 space-y-2 min-w-[200px]">
            <h3 className="font-semibold text-sm">
              {selectedLocation.profile.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {selectedLocation.profile.description}
            </p>
            {selectedLocation.profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedLocation.profile.skills.slice(0, 3).map((skill) => (
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
                selectedLocation.profile.city,
                selectedLocation.profile.state,
                selectedLocation.profile.country,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
            <a
              href={selectedLocation.profile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-block mt-1"
            >
              View Profile →
            </a>
          </div>
        </Popup>
      )}
    </Map>
  );
}

