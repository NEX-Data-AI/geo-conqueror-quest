// src/components/SidebarLayers.tsx
import React from "react";
import { Eye, EyeOff, Info } from "lucide-react";

interface LayerItemProps {
  name: string;
  visible: boolean;
  onToggleVisible: () => void;
  onInfo?: () => void;
}

const LayerItem: React.FC<LayerItemProps> = ({
  name,
  visible,
  onToggleVisible,
  onInfo,
}) => (
  <div className="w-full rounded-2xl border bg-white px-3 py-2 flex items-center justify-between gap-2 shadow-sm">
    <div className="flex flex-col">
      <span className="text-sm font-medium">{name}</span>
      {/* <span className="text-[11px] text-slate-500">Vector layer</span> */}
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggleVisible}
        className="rounded-full p-1 hover:bg-slate-100 transition"
      >
        {visible ? (
          <Eye className="w-4 h-4 text-slate-700" />
        ) : (
          <EyeOff className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {onInfo && (
        <button
          type="button"
          onClick={onInfo}
          className="rounded-full p-1 hover:bg-slate-100 transition"
        >
          <Info className="w-4 h-4 text-slate-500" />
        </button>
      )}
    </div>
  </div>
);

const SidebarLayers: React.FC = () => {
  // TODO: replace with real state
  const layers = [
    { id: "territories", name: "Territories", visible: true },
    { id: "caches", name: "Caches", visible: true },
    { id: "roads", name: "Roads", visible: false },
  ];

  return (
    <section className="w-full">
      <h2 className="mb-2 text-sm font-semibold text-slate-700">
        Layers
      </h2>

      <div className="space-y-2">
        {layers.map((layer) => (
          <LayerItem
            key={layer.id}
            name={layer.name}
            visible={layer.visible}
            onToggleVisible={() => {
              // TODO: wire to map visibility
              console.log("Toggle", layer.id);
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default SidebarLayers;

