import { useRef, useState } from "react";
import GISMap, { DrawingMode } from "@/components/GIS/GISMap";
import Legend from "@/components/GIS/Legend";
import Toolbar from "@/components/GIS/Toolbar";
import AttributeTable from "@/components/GIS/AttributeTable";
import { GISLayer } from "@/types/gis";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const GIS = () => {
  const [layers, setLayers] = useState<GISLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<DrawingMode>({
    type: "select",
    purpose: "feature",
    selectMode: "rectangle",
  });
  const [showAttributeTable, setShowAttributeTable] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<
    Map<string, number[]>
  >(new Map());

  // Used to let Toolbar clear any highlight/selection inside the map
  const clearSelectionRef = useRef<() => void>(() => {});

  const handleImportData = (newLayers: GISLayer[]) => {
    setLayers((prev) => {
      const merged = [...prev, ...newLayers];
      if (!selectedLayer && merged.length > 0) {
        setSelectedLayer(merged[0].id);
        setActiveLayer(merged[0].id);
      }
      return merged;
    });
  };

  const handleLayerSelect = (id: string) => {
    setSelectedLayer(id);
  };

  const handleActiveLayerChange = (id: string | null) => {
    setActiveLayer(id);
  };

  const handleFeatureSelect = (selections: Map<string, number[]>) => {
    setSelectedFeatures(selections);
    setShowAttributeTable(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="flex h-screen">
        {/* LEFT: Legend / layer list */}
        <aside className="w-72 border-r border-slate-800 bg-slate-950/90">
          <Legend
            layers={layers}
            selectedLayer={selectedLayer}
            activeLayer={activeLayer}
            onLayerSelect={handleLayerSelect}
            onActiveLayerChange={handleActiveLayerChange}
            onLayersChange={setLayers}
          />
        </aside>

        {/* RIGHT: toolbar + map + attribute table */}
        <section className="flex-1 flex flex-col">
          {/* Toolbar at the top */}
          <div className="border-b border-slate-800 bg-slate-950/95 px-4 py-2">
            <Toolbar
              drawMode={drawMode}
              layers={layers}
              onDrawModeChange={setDrawMode}
              onToggleAttributeTable={() =>
                setShowAttributeTable((prev) => !prev)
              }
              onImportData={handleImportData}
              onClearSelection={() => {
                setSelectedFeatures(new Map());
                setShowAttributeTable(false);
                clearSelectionRef.current();
              }}
            />
          </div>

          {/* Map + attribute table in resizable vertical panels */}
          <ResizablePanelGroup
            direction="vertical"
            className="flex-1 bg-slate-950"
          >
            {/* MAP AREA */}
            <ResizablePanel defaultSize={70} minSize={40}>
              <GISMap
                layers={layers}
                selectedLayer={selectedLayer}
                activeLayer={activeLayer}
                drawMode={drawMode}
                onLayersChange={setLayers}
                onFeatureSelect={handleFeatureSelect}
                onClearSelectionRef={clearSelectionRef}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* ATTRIBUTE TABLE AREA */}
            <ResizablePanel defaultSize={30} minSize={15}>
              {showAttributeTable && (
                <AttributeTable
                  layers={layers}
                  selectedFeatures={selectedFeatures}
                  onClose={() => {
                    setShowAttributeTable(false);
                    setSelectedFeatures(new Map());
                  }}
                  onUpdate={(updatedLayer) => {
                    setLayers((prev) =>
                      prev.map((l) =>
                        l.id === updatedLayer.id ? updatedLayer : l,
                      ),
                    );
                  }}
                />
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        </section>
      </div>
    </main>
  );
};

export default GIS;
