import { useMap } from "@/components/Map/MapContext";
import { useState } from "react";
import Panel from "@/components/UI/Panel";

/**
 * LayerTogglePanel
 * ----------------
 * Simple example for toggling named layers on/off in the map.
 * You can adapt this to your actual layer IDs.
 */
const DEFAULT_LAYERS = [
  { id: "roads", label: "Roads" },
  { id: "boundaries", label: "Boundaries" },
  { id: "points-of-interest", label: "Points of Interest" },
];

const LayerTogglePanel = () => {
  const map = useMap();
  const [visibleLayers, setVisibleLayers] = useState<string[]>(
    DEFAULT_LAYERS.map((l) => l.id)
  );

  const toggleLayer = (layerId: string) => {
    if (!map) return;

    const isVisible = visibleLayers.includes(layerId);
    const newVisibility = isVisible ? "none" : "visible";

    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", newVisibility);
    }

    setVisibleLayers((prev) =>
      isVisible ? prev.filter((id) => id !== layerId) : [...prev, layerId]
    );
  };

  return (
    <div className="pointer-events-auto absolute top-4 right-4 w-64">
      <Panel title="Layers">
        <div className="space-y-2">
          {DEFAULT_LAYERS.map((layer) => {
            const checked = visibleLayers.includes(layer.id);
            return (
              <label
                key={layer.id}
                className="flex items-center justify-between text-sm text-slate-200"
              >
                <span>{layer.label}</span>
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={checked}
                  onChange={() => toggleLayer(layer.id)}
                />
              </label>
            );
          })}
        </div>
      </Panel>
    </div>
  );
};

export default LayerTogglePanel;
