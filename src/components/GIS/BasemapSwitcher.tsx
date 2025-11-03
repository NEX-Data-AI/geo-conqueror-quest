import { useEffect, useState } from "react";
import { useMap } from "@/components/Map/MapContext";
import Panel from "@/components/UI/Panel";

type BasemapId = "streets" | "dark" | "satellite";

// You can swap these style URLs later for NEX-branded ones
const BASEMAPS: { id: BasemapId; label: string; styleUrl: string }[] = [
  {
    id: "streets",
    label: "Streets",
    styleUrl: "https://demotiles.maplibre.org/style.json",
  },
  {
    id: "dark",
    label: "Dark",
    styleUrl:
      "https://api.maptiler.com/maps/dataviz/style.json?key=YOUR_MAPTILER_KEY",
  },
  {
    id: "satellite",
    label: "Satellite",
    styleUrl:
      "https://api.maptiler.com/maps/hybrid/style.json?key=YOUR_MAPTILER_KEY",
  },
];

const STORAGE_KEY = "nex_gis_basemap_v1";

/**
 * BasemapSwitcher
 * ----------------
 * Simple dropdown to change the underlying map style.
 * For now uses public/demo MapLibre-style URLs; swap in
 * your own NEX styles or providers when ready.
 */
const BasemapSwitcher = () => {
  const map = useMap();
  const [selected, setSelected] = useState<BasemapId>("streets");

  // Load saved choice
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY) as BasemapId | null;
    if (saved && BASEMAPS.some((b) => b.id === saved)) {
      setSelected(saved);
    }
  }, []);

  // Apply style when selection changes
  useEffect(() => {
    if (!map) return;
    const bm = BASEMAPS.find((b) => b.id === selected);
    if (!bm) return;

    // Changing style will reset custom layers,
    // so it's best to pick basemap BEFORE measuring, etc.
    map.setStyle(bm.styleUrl);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, selected);
    }
  }, [map, selected]);

  const handleChange = (id: BasemapId) => {
    setSelected(id);
  };

  return (
    <div className="pointer-events-auto absolute top-4 left-4 w-56">
      <Panel title="Basemap">
        <div className="space-y-2">
          <p className="text-xs text-slate-300">
            Choose a basemap for GIS analysis.
          </p>
          <div className="flex flex-col gap-1">
            {BASEMAPS.map((bm) => (
              <button
                key={bm.id}
                type="button"
                onClick={() => handleChange(bm.id)}
                className={`w-full rounded-md px-3 py-1.5 text-xs font-semibold text-left border transition ${
                  selected === bm.id
                    ? "bg-slate-100 text-slate-900 border-slate-200"
                    : "bg-slate-900 border-slate-600 text-slate-100 hover:bg-slate-800"
                }`}
              >
                {bm.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Tip: choose your basemap before using measure or overlays.
          </p>
        </div>
      </Panel>
    </div>
  );
};

export default BasemapSwitcher;
