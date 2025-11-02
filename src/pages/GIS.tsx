import { useState } from 'react';
import GISMap, { DrawingMode } from '@/components/GIS/GISMap';
import Legend from '@/components/GIS/Legend';
import Toolbar from '@/components/GIS/Toolbar';
import AttributeTable from '@/components/GIS/AttributeTable';
import { GISLayer } from '@/types/gis';

const GIS = () => {
  const [layers, setLayers] = useState<GISLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<DrawingMode>({ type: null, purpose: 'feature' });
  const [showAttributeTable, setShowAttributeTable] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Legend - Left Sidebar */}
      <Legend
        layers={layers}
        selectedLayer={selectedLayer}
        onLayerSelect={setSelectedLayer}
        onLayersChange={setLayers}
      />

      {/* Main Map Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <Toolbar
          drawMode={drawMode}
          layers={layers}
          onDrawModeChange={setDrawMode}
          onToggleAttributeTable={() => setShowAttributeTable(!showAttributeTable)}
          onImportData={(newLayers) => setLayers([...layers, ...newLayers])}
        />

        {/* Map */}
        <GISMap
          layers={layers}
          selectedLayer={selectedLayer}
          drawMode={drawMode}
          onLayersChange={setLayers}
          onFeatureSelect={(layerId, featureIndex) => {
            setSelectedLayer(layerId);
            setShowAttributeTable(true);
          }}
        />

        {/* Attribute Table - Bottom Panel */}
        {showAttributeTable && selectedLayer && (
          <AttributeTable
            layer={layers.find(l => l.id === selectedLayer) || null}
            onClose={() => setShowAttributeTable(false)}
            onUpdate={(updatedLayer) => {
              setLayers(layers.map(l => l.id === updatedLayer.id ? updatedLayer : l));
            }}
          />
        )}
      </div>
    </div>
  );
};

export default GIS;
