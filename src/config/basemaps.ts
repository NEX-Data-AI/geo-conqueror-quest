// src/config/basemaps.ts
export type BasemapId =
  | "streets"
  | "outdoor"
  | "satellite"
  | "satellite-hybrid"
  | "dark"
  | "light"
  | "dataviz"
  | "terrain";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || "YOUR_MAPTILER_KEY";

export const BASEMAPS: { id: BasemapId; label: string; styleUrl: string }[] = [
  {
    id: "streets",
    label: "Streets",
    styleUrl: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
  },
  {
    id: "outdoor",
    label: "Outdoor",
    styleUrl: `https://api.maptiler.com/maps/outdoor/style.json?key=${MAPTILER_KEY}`,
  },
  {
    id: "satellite",
    label: "Satellite",
    styleUrl: `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`,
  },
  {
    id: "satellite-hybrid",
    label: "Satellite Hybrid",
    styleUrl: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`,
  },
  {
    id: "dark",
    label: "Dark Matter",
    styleUrl: `https://api.maptiler.com/maps/darkmatter/style.json?key=${MAPTILER_KEY}`,
  },
  {
    id: "light",
    label: "Light",
    styleUrl: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
  },
  {
    id: "dataviz",
    label: "Dataviz",
    styleUrl: `https://api.maptiler.com/maps/dataviz/style.json?key=${MAPTILER_KEY}`,
  },
  {
    id: "terrain",
    label: "Terrain",
    styleUrl: `https://api.maptiler.com/maps/topo-v2/style.json?key=${MAPTILER_KEY}`,
  },
];
