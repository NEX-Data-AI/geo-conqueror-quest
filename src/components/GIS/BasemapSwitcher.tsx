import { useEffect, useState } from "react";
import { useMap } from "@/components/Map/MapContext";
import Panel from "@/components/UI/Panel";

// Expanded set of basemaps for GIS use
export type BasemapId =
  | "streets"
  | "light"
  | "dark"
  | "outdoor"
  | "dataviz"
  | "topo"
  | "satellite"
  | "hybrid";

// Pull MapTiler key from Vite env
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || "YOUR_MAPTILER_KEY";

const BASEMAPS: { id: BasemapId; label: string; styleUrl: string }[] = [
  {
    id: "streets",
    label: "Streets",
    styleUrl: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
  },
  {
    id: "light",
    label: "Light",
    styleUrl: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
  },
  {
    id: "dark",
    label: "Dark",
    styleUrl: `https://api.maptiler.com/maps/darkmatter/style.json?key=${MAPTILER_KEY}`,
  },
  {
    id: "outdoor",
    label: "Outdoor",
    styleUrl: `https://api.maptiler.com/maps/outdoor/style.json?key=${MAPTILER_KEY}`,
  },
  {
    id: "dataviz",
    label: "Dataviz",
    styleUrl: `https://api.maptiler.com/maps/dataviz/style.json?key=${MAPTILER_KEY}`,
  },
  {
    id: "topo",
    label: "Terrain / Topo",
    styleUrl: `https://api.maptiler.com/maps/topo-v2/style.json?key=${MAPTILER_KEY}`,
  },
  {
    id: "satellite",
    label: "Satellite",
    styleUrl: `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`,
  },
  {
    id: "hybrid",
    label: "Satellite Hybrid",
    styleUrl: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`,
  },
];

const STORAGE_KEY = "nex_gis_basemap_v1";

/**
 * BasemapSwitcher
 * ----------------
 * Dropdown/pill control to change the underlying map style.
 * Uses MapTiler styles and remembers the last choice in localStorage.
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
            Tip: pick your basemap before measuring or running overlays.
          </p>
        </div>
      </Panel>
    </div>
  );
};

export default BasemapSwitcher;
