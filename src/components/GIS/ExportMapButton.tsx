import { useMap } from "@/components/Map/MapContext";

/**
 * ExportMapButton
 * ---------------
 * Simple export: grabs the current map canvas and downloads it as a PNG.
 * You can later wire this into a PDF report generator if needed.
 */
const ExportMapButton = () => {
  const map = useMap();

  const handleExport = () => {
    if (!map) return;

    const canvas = map.getCanvas();
    const dataUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "nex_map_export.png";
    link.click();
  };

  return (
    <div className="pointer-events-auto absolute bottom-4 right-4">
      <button
        type="button"
        onClick={handleExport}
        className="rounded-lg bg-slate-900/90 border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-50 shadow-lg hover:bg-slate-800"
      >
        Export Map
      </button>
    </div>
  );
};

export default ExportMapButton;
