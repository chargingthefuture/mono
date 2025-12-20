import { useState, useMemo } from "react";
import Map, { Marker, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

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
        console.error("Map error:", e);
      }}
      onMove={(evt: any) => {
        // Handle map movement if needed
      }}
    >
      {locations.map((location) => (
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

