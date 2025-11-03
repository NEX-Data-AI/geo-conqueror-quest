import { useState } from "react";
import { useMap } from "@/components/Map/MapContext";
import Panel from "@/components/UI/Panel";

/**
 * MeasureTool
 * -----------
 * Placeholder UI for a measurement tool. Hook this up to real
 * map click events and a measurement library when you're ready.
 */
const MeasureTool = () => {
  const map = useMap();
  const [isActive, setIsActive] = useState(false);

  const handleToggle = () => {
    setIsActive((prev) => !prev);
    if (!map) return;

    // TODO: attach / detach click handlers for measuring distance/area.
    console.debug("[GIS] MeasureTool toggled. Active:", !isActive);
  };

  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 w-64">
      <Panel title="Measure">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-200">
            {isActive ? "Click on the map to measure." : "Tool is idle."}
          </p>
          <button
            type="button"
            onClick={handleToggle}
            className={`rounded-md px-3 py-1 text-xs font-semibold border ${
              isActive
                ? "bg-emerald-500/10 border-emerald-400 text-emerald-300"
                : "bg-slate-800 border-slate-500 text-slate-100"
            }`}
          >
            {isActive ? "Stop" : "Start"}
          </button>
        </div>
      </Panel>
    </div>
  );
};

export default MeasureTool;
