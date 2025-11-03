import MapShell from "@/components/Map/MapShell";
import PlayerHUD from "@/components/GeoQuest/PlayerHUD";
import TerritoryLayer from "@/components/GeoQuest/TerritoryLayer";
import QuestMarkers from "@/components/GeoQuest/QuestMarkers";
import Toolbar from "@/components/UI/Toolbar";
import { useGeoQuestGame } from "@/hooks/useGeoQuestGame";

/**
 * Map.example
 * -----------
 * Example composition for the GeoQuest "Play" mode.
 * You can rename this file to Map.tsx and adapt it
 * to your existing logic when you're ready.
 */
const MapExample = () => {
  const { setMode, addXP } = useGeoQuestGame();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="w-full h-screen relative">
        <MapShell>
          {/* Top toolbar */}
          <div className="pointer-events-auto absolute top-4 left-1/2 -translate-x-1/2">
            <Toolbar>
              <button
                type="button"
                onClick={() => setMode("casual")}
                className="rounded-md px-3 py-1 text-xs font-semibold bg-slate-800 text-slate-100 hover:bg-slate-700"
              >
                Casual
              </button>
              <button
                type="button"
                onClick={() => setMode("ranked")}
                className="rounded-md px-3 py-1 text-xs font-semibold bg-slate-800 text-slate-100 hover:bg-slate-700"
              >
                Ranked
              </button>
              <button
                type="button"
                onClick={() => setMode("training")}
                className="rounded-md px-3 py-1 text-xs font-semibold bg-slate-800 text-slate-100 hover:bg-slate-700"
              >
                Training
              </button>
              <button
                type="button"
                onClick={() => addXP(25)}
                className="rounded-md px-3 py-1 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
              >
                +25 XP (test)
              </button>
            </Toolbar>
          </div>

          {/* Map-driven logic components */}
          <TerritoryLayer />
          <QuestMarkers />

          {/* HUD overlay */}
          <PlayerHUD />
        </MapShell>
      </div>
    </main>
  );
};

export default MapExample;
