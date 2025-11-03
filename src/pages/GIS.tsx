import MapShell from "@/components/Map/MapShell";
import LayerTogglePanel from "@/components/GIS/LayerTogglePanel";
import MeasureTool from "@/components/GIS/MeasureTool";
import ExportMapButton from "@/components/GIS/ExportMapButton";

/**
 * Pro GIS Mode
 * ------------
 * Main "Pro" route for NEX Data Map.
 * Uses MapShell + GIS tool overlays (layers, measure, export).
 */
const GIS = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="w-full h-screen relative">
        <MapShell>
          <LayerTogglePanel />
          <MeasureTool />
          <ExportMapButton />
        </MapShell>
      </div>
    </main>
  );
};

export default GIS;
