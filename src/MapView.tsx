// src/MapView.tsx
import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type MapViewProps = {
  styleUrl?: string;
  // later we can add:
  // activeTool?: "select" | "edit" | "none";
  // editMode?: EditMode;
};

const DEFAULT_GAME_STYLE =
  "https://api.maptiler.com/maps/dataviz/style.json?key=YOUR_MAPTILER_KEY";

const MapView: React.FC<MapViewProps> = ({ styleUrl }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Initial creation
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl || DEFAULT_GAME_STYLE,
      center: [-81.7, 27.9], // Polk-ish
      zoom: 8,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Style updates (basemap switch)
  useEffect(() => {
    if (!mapRef.current || !styleUrl) return;
    mapRef.current.setStyle(styleUrl);
  }, [styleUrl]);

  return <div ref={mapContainer} className="h-full w-full" />;
};

export default MapView;
