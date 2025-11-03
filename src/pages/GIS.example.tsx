import MapShell from "@/components/Map/MapShell";
import LayerTogglePanel from "@/components/GIS/LayerTogglePanel";
import MeasureTool from "@/components/GIS/MeasureTool";
import ExportMapButton from "@/components/GIS/ExportMapButton";

/**
 * GIS.example
 * -----------
 * Example composition for the Pro GIS mode using MapShell.
 * You can rename this file to GIS.tsx and adapt to your
 * existing layers and tools when ready.
 */
const GISExample = () => {
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

export default GISExample;
