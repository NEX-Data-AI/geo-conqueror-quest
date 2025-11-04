// src/pages/GIS.tsx
import { useState, useRef, useMemo } from "react";
import GISMap from "@/components/GIS/GISMap";
import BasemapSwitcher, {
  BasemapId,
  getBasemapStyleUrl,
} from "@/components/GIS/BasemapSwitcher";
import GISToolbar, { EditMode } from "@/components/GIS/GISToolbar";
import SidebarLayers from "@/components/SidebarLayers";

const GISPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<"select" | "edit" | "none">(
    "select",
  );
  const [editMode, setEditMode] = useState<EditMode>("none");

  // Basemap selection
  const [basemapId, setBasemapId] = useState<BasemapId>("streets");
  const basemapStyle = useMemo(
    () => getBasemapStyleUrl(basemapId),
    [basemapId],
  );

  // placeholders for GISMap props (will be wired to real data later)
  const [layers, setLayers] = useState<any[]>([]);
  const clearSelectionRef = useRef<() => void>(() => {});
  const handleFeatureSelect = () => {
    // TODO: hook into attribute panel / selection summary later
  };

  // Map toolbar state -> GISMap DrawingMode
  const drawMode = useMemo(() => {
    if (activeTool === "select") {
      return {
        type: "select" as const,
        purpose: "selection" as const,
        selectMode: "rectangle" as const,
      };
    }

    if (activeTool === "edit") {
      switch (editMode) {
        case "annotation":
          return {
            type: "draw-point" as const,
            purpose: "feature" as const,
          };
        case "existing-layer":
          return {
            type: "select" as const,
            purpose: "selection" as const,
            selectMode: "rectangle" as const,
          };
        case "new-layer":
          return {
            type: "draw-polygon" as const,
            purpose: "feature" as const,
          };
        default:
          return {
            type: "select" as const,
            purpose: "selection" as const,
            selectMode: "rectangle" as const,
          };
      }
    }

    // activeTool === "none"
    return {
      type: "select" as const,
      purpose: "selection" as const,
      selectMode: "rectangle" as const,
    };
  }, [activeTool, editMode]);

  return (
    <div className="min-h-screen w-full grid grid-cols-12 gap-4 p-4 bg-slate-50">
      {/* LEFT SIDEBAR */}
      <div className="col-span-12 lg:col-span-3 space-y-4">
        <section className="w-full rounded-2xl bg-white border px-3 py-2 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Legend</h2>
          <p className="text-xs text-slate-500">
            Configure GIS symbology here.
          </p>
        </section>
        <SidebarLayers />
      </div>

      {/* MAP AREA */}
      <div className="col-span-12 lg:col-span-9 relative">
        {/* Toolbar */}
        <div className="absolute top-4 left-1/2 z-20 -translate-x-1/2">
          <GISToolbar
            activeTool={activeTool}
            editMode={editMode}
            onToolChange={setActiveTool}
            onEditModeChange={setEditMode}
          />
        </div>

        {/* Basemap Switcher (top-left of map) */}
        <div className="absolute top-4 left-4 z-20">
          <BasemapSwitcher value={basemapId} onChange={setBasemapId} />
        </div>

        {/* GIS Map */}
        <div className="h-[calc(100vh-2rem)] rounded-3xl overflow-hidden border bg-slate-200 shadow">
          <GISMap
            layers={layers}
            selectedLayer={null}
            activeLayer={null}
            drawMode={drawMode}
            onLayersChange={setLayers}
            onFeatureSelect={handleFeatureSelect}
            onClearSelectionRef={clearSelectionRef}
            basemapStyle={basemapStyle}
          />
        </div>
      </div>
    </div>
  );
};

export default GISPage;
