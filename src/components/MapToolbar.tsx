// src/components/MapToolbar.tsx
import React, { useState } from "react";
import { MousePointerClick, Pencil, ChevronDown } from "lucide-react";
import type { EditMode } from "../types/ui";

interface MapToolbarProps {
  activeTool: "select" | "edit" | "none";
  editMode: EditMode;
  onToolChange: (tool: "select" | "edit" | "none") => void;
  onEditModeChange: (mode: EditMode) => void;
}

const MapToolbar: React.FC<MapToolbarProps> = ({
  activeTool,
  editMode,
  onToolChange,
  onEditModeChange,
}) => {
  const [editMenuOpen, setEditMenuOpen] = useState(false);

  const isSelectActive = activeTool === "select";
  const isEditActive = activeTool === "edit";

  const labelForEditMode = (() => {
    switch (editMode) {
      case "annotation":
        return "Annotation";
      case "existing-layer":
        return "Edit Layer";
      case "new-layer":
        return "New Layer";
      default:
        return "Choose Edit Mode";
    }
  })();

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 shadow border border-slate-200">
      {/* SELECT */}
      <button
        type="button"
        onClick={() => onToolChange(isSelectActive ? "none" : "select")}
        className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium transition ${
          isSelectActive
            ? "bg-blue-600 text-white shadow"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        <MousePointerClick className="w-4 h-4" />
        <span>Select</span>
      </button>

      {/* EDIT + DROPDOWN */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            onToolChange("edit");
            setEditMenuOpen((o) => !o);
          }}
          className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium transition ${
            isEditActive
              ? "bg-amber-500 text-white shadow"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Pencil className="w-4 h-4" />
          <span>Edit</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {editMenuOpen && (
          <div className="absolute left-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg z-20 text-sm">
            <button
              type="button"
              className={`block w-full px-3 py-2 text-left hover:bg-slate-100 ${
                editMode === "annotation" ? "bg-slate-50 font-semibold" : ""
              }`}
              onClick={() => {
                onEditModeChange("annotation");
                onToolChange("edit");
                setEditMenuOpen(false);
              }}
            >
              Annotation (pins, labels)
            </button>
            <button
              type="button"
              className={`block w-full px-3 py-2 text-left hover:bg-slate-100 ${
                editMode === "existing-layer"
                  ? "bg-slate-50 font-semibold"
                  : ""
              }`}
              onClick={() => {
                onEditModeChange("existing-layer");
                onToolChange("edit");
                setEditMenuOpen(false);
              }}
            >
              Edit existing layer
            </button>
            <button
              type="button"
              className={`block w-full px-3 py-2 text-left hover:bg-slate-100 ${
                editMode === "new-layer" ? "bg-slate-50 font-semibold" : ""
              }`}
              onClick={() => {
                onEditModeChange("new-layer");
                onToolChange("edit");
                setEditMenuOpen(false);
              }}
            >
              Create new layer
            </button>
          </div>
        )}
      </div>

      {isEditActive && editMode !== "none" && (
        <span className="ml-2 text-xs text-slate-500">
          Mode: {labelForEditMode}
        </span>
      )}
    </div>
  );
};

export default MapToolbar;

