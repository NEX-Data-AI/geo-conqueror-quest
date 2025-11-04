import Panel from "@/components/UI/Panel";

// All available basemaps for the Pro GIS view
export type BasemapId =
  | "streets"
  | "light"
  | "dark"
  | "outdoor"
  | "dataviz"
  | "topo"
  | "satellite"
  | "hybrid";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || "EThfgSg4VIEOVBZKY4Cw";

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

// Helper so the page can translate id -> style URL
export const getBasemapStyleUrl = (id: BasemapId): string => {
  const bm = BASEMAPS.find((b) => b.id === id) ?? BASEMAPS[0];
  return bm.styleUrl;
};

type BasemapSwitcherProps = {
  value: BasemapId;
  onChange: (id: BasemapId) => void;
};

const BasemapSwitcher: React.FC<BasemapSwitcherProps> = ({ value, onChange }) => {
  return (
    <Panel title="Basemap">
      <div className="space-y-2">
        <p className="text-xs text-slate-300">
          Choose a basemap for GIS analysis.
        </p>

        <select
          className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={(e) => onChange(e.target.value as BasemapId)}
        >
          {BASEMAPS.map((bm) => (
            <option key={bm.id} value={bm.id}>
              {bm.label}
            </option>
          ))}
        </select>

        <p className="text-[10px] text-slate-500 mt-1">
          Tip: pick your basemap before measuring or running overlays.
        </p>
      </div>
    </Panel>
  );
};

export default BasemapSwitcher;
