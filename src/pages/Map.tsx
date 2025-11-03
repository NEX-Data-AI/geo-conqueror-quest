// src/pages/Map.tsx

import MapShell from "@/components/Map/MapShell";
import PlayerHUD from "@/components/GeoQuest/PlayerHUD";
import TerritoryLayer from "@/components/GeoQuest/TerritoryLayer";
import QuestMarkers from "@/components/GeoQuest/QuestMarkers";
import Toolbar from "@/components/UI/Toolbar";
import { useGeoQuestGame } from "@/hooks/useGeoQuestGame";

import PlayerSetup from "@/components/PlayerSetup";
import ResourceDisplay from "@/components/ResourceDisplay";

/**
 * GeoQuest Play Mode
 * ------------------
 * Main "Play" route for the game side of NEX Data Map.
 * Uses MapShell + GeoQuest overlays (HUD, territories, markers, player UI).
 */
const Map = () => {
  const { setMode, addXP } = useGeoQuestGame();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="w-full h-screen relative">
        <MapShell>
          {/* Top center toolbar: game modes + test XP button */}
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
              {/* Test button so you can see XP move for now */}
              <button
                type="button"
                onClick={() => addXP(25)}
                className="rounded-md px-3 py-1 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
              >
                +25 XP
              </button>
            </Toolbar>
          </div>

          {/* LEFT SIDE: player setup + resources */}
          <div className="pointer-events-auto absolute left-4 top-20 max-w-xs space-y-4">
            <div className="rounded-2xl bg-slate-950/90 border border-slate-700 shadow-lg p-4">
              <PlayerSetup />
            </div>

            <div className="rounded-2xl bg-slate-950/90 border border-slate-700 shadow-lg p-4">
              <ResourceDisplay />
            </div>
          </div>

          {/* Map-attached game logic (hook into Ma*
