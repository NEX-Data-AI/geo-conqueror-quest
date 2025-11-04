// src/pages/GISMap.tsx
import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import BasemapSelector from "../components/BasemapSelector";
import SidebarLayers from "../components/SidebarLayers";
import MapToolbar from "../components/MapToolbar";
import { BASEMAPS, BasemapId } from "../lib/basemaps";
import type { EditMode } from "../types/ui";

const DEFAULT_CENTER: [number, number] = [-81.7, 27.9]; // Central Florida-ish
const DEFAULT_ZOOM = 8;

const GISMap: React.FC = () => {
  const [basemapId, setBasemapId] = useState<BasemapId>("dataviz");
  const [activeTool, setActiveTool] = useState<"select" | "edit" | "none">(
    "none"
  );
  const [editMode, setEditMode] = useState<EditMode>("none");

  const currentBasemap = BASEMAPS.find((b) => b.id === basemapId)!;

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: currentBasemap.styleUrl,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Basemap style change
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(currentBasemap.styleUrl);
  }, [currentBasemap.styleUrl]);

  // TODO: later – react to activeTool/editMode here for real editing logic

  return (
    <div className="min-h-screen w-full grid grid-cols-12 gap-4 p-4 bg-slate-50">
      {/* LEFT SIDEBAR (Legend + Basemap + Layers) */}
      <div className="col-span-12 lg:col-span-3 space-y-*">
        {/* Legend placeholder – swap in your real legend later */}
        <section className="w-full rounded-2xl bg-white border px-3 py-2 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Legend</h2>
          <p className="text-xs text-slate-500">
            Configure GIS symbology and overlays here.
          </p>
        </section>

        <BasemapSelector currentId={basemapId} onChange={setBasemapId} />

        <SidebarLayers />
      </div>

      {/* MAP AREA */}
      <div className="col-span-12 lg:col-span-9">
        <div className="relative h-[calc(100vh-2rem)] w-full rounded-3xl overflow-hidden border bg-slate-200 shadow">
          {/* Toolbar overlay */}
          <div className="absolute top-4 left-1/2 z-20 -translate-x-1/2">
            <MapToolbar
              activeTool={activeTool}
              editMode={editMode}
              onToolChange={setActiveTool}
              onEditModeChange={setEditMode}
            />
          </div>

          {/* Map Container */}
          <div ref={mapContainerRef} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
};

export default GISMap;
