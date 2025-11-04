// src/components/BasemapSelector.tsx
import React from "react";
import { BASEMAPS, BasemapId } from "../config/basemaps";

interface BasemapSelectorProps {
  currentId: BasemapId;
  onChange: (id: BasemapId) => void;
}

const BasemapSelector: React.FC<BasemapSelectorProps> = ({
  currentId,
  onChange,
}) => {
  return (
    <section className="w-full">
      <h2 className="mb-2 text-sm font-semibold text-slate-700">
        Basemap
      </h2>

      <select
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={currentId}
        onChange={(e) => onChange(e.target.value as BasemapId)}
      >
        {BASEMAPS.map((bm) => (
          <option key={bm.id} value={bm.id}>
            {bm.label}
          </option>
        ))}
      </select>
    </section>
  );
};

export default BasemapSelector;
