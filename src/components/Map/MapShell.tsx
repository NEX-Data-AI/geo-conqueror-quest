import { useEffect, useRef, ReactNode } from "react";
import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
import { MapProvider } from "./MapContext";

type MapShellProps = {
  children?: ReactNode;
  /** Called once the map is ready so children can attach layers, controls, etc. */
  onMapReady?: (map: MapLibreMap) => void;
  /** Optional initial view */
  initialCenter?: [number, number];
  initialZoom?: number;
  /** Optional extra CSS classes for the container */
  className?: string;
};

/**
 * MapShell
 * --------
 * Shared MapLibre wrapper for both GeoQuest (play) and GIS (pro) modes.
 * It owns the map instance and provides it via context to children.
 */
const MapShell = ({
  children,
  onMapReady,
  initialCenter = [-81.7, 27.9], // Central Florida-ish default
  initialZoom = 8,
  className = "",
}: MapShellProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json", // Swap to NEX style later
      center: initialCenter,
      zoom: initialZoom,
    });

    mapRef.current = map;

    map.on("load", () => {
      if (onMapReady) {
        onMapReady(map);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [initialCenter, initialZoom, onMapReady]);

  return (
    <MapProvider map={mapRef.current}>
      <div className={`w-full h-full relative ${className}`}>
        <div ref={mapContainerRef} className="absolute inset-0" />
        {/* Overlays / HUD / panels render above the map */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full relative">{children}</div>
        </div>
      </div>
    </MapProvider>
  );
};

export default MapShell;
