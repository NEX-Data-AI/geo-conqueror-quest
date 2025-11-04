// src/NexDataMapApp.tsx
import React, { useState } from "react";
import MapView from "./MapView";
import BasemapSelector from "./components/BasemapSelector";
import SidebarLayers from "./components/SidebarLayers";
import MapToolbar from "./components/MapToolbar";
import { BASEMAPS, BasemapId } from "./config/basemaps";
import type { EditMode } from "./types/ui";

const NexDataMapApp: React.FC = () => {
  const [basemapId, setBasemapId] = useState<BasemapId>("dataviz");
  const [activeTool, setActiveTool] = useState<"select" | "edit" | "none">(
    "none"
  );
  const [editMode, setEditMode] = useState<EditMode>("none");

  const currentBasemap = BASEMAPS.find((b) => b.id === basemapId)!;

  return (
    <div className="min-h-screen w-full grid grid-cols-12 gap-4 p-4 bg-slate-50">
      {/* LEFT PANE */}
      <div className="col-span-12 lg:col-span-3 space-y-4">
        {/* Legend placeholder – keep your existing legend here */}
        <section className="w-full rounded-2xl bg-white border px-3 py-2 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">
            Legend
          </h2>
          <p className="text-xs text-slate-500">
            TODO: plug in your real legend content.
          </p>
        </section>

        {/* Basemap selector */}
        <BasemapSelector
          currentId={basemapId}
          onChange={setBasemapId}
        />

        {/* Layers (fixed width = pane width) */}
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

          {/* Map */}
          <MapView
            styleUrl={currentBasemap.styleUrl}
            // Later: pass activeTool and editMode into MapView
            // activeTool={activeTool}
            // editMode={editMode}
          />
        </div>
      </div>
    </div>
  );
};

export default NexDataMapApp;
