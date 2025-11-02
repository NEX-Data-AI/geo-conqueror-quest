import { useState } from 'react';
import GISMap, { DrawingMode } from '@/components/GIS/GISMap';
import Legend from '@/components/GIS/Legend';
import Toolbar from '@/components/GIS/Toolbar';
import AttributeTable from '@/components/GIS/AttributeTable';
import { GISLayer } from '@/types/gis';

const GIS = () => {
  const [layers, setLayers] = useState<GISLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<DrawingMode>({ type: null, purpose: 'feature' });
  const [showAttributeTable, setShowAttributeTable] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<Map<string, number[]>>(new Map());

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Legend - Left Sidebar */}
      <Legend
        layers={layers}
        selectedLayer={selectedLayer}
        activeLayer={activeLayer}
        onLayerSelect={setSelectedLayer}
        onActiveLayerChange={setActiveLayer}
        onLayersChange={setLayers}
      />

      {/* Main Map Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <Toolbar
          drawMode={drawMode}
          layers={layers}
          onDrawModeChange={setDrawMode}
          onToggleAttributeTable={() => setShowAttributeTable(!showAttributeTable)}
          onImportData={(newLayers) => setLayers([...layers, ...newLayers])}
        />

        {/* Map */}
        <div className="flex-1 relative">
          <GISMap
            layers={layers}
            selectedLayer={selectedLayer}
            activeLayer={activeLayer}
            drawMode={drawMode}
            onLayersChange={setLayers}
            onFeatureSelect={(selections) => {
              setSelectedFeatures(selections);
              setShowAttributeTable(true);
            }}
          />
        </div>

        {/* Attribute Table - Bottom Panel */}
        {showAttributeTable && (
          <div className="h-80 border-t">
            <AttributeTable
              layers={layers}
              selectedFeatures={selectedFeatures}
              onClose={() => {
                setShowAttributeTable(false);
                setSelectedFeatures(new Map());
              }}
              onUpdate={(updatedLayer) => {
                setLayers(layers.map(l => l.id === updatedLayer.id ? updatedLayer : l));
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GIS;
