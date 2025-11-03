import { useState } from "react";
import MapView from "@/components/Map/MapView";
import PlayerSetup from "@/components/PlayerSetup";
import ResourceDisplay from "@/components/ResourceDisplay";
import { usePlayerData } from "@/hooks/usePlayerData";

// Define the available themes for the game map
const GAME_THEMES = {
  dataviz: {
    id: "dataviz",
    label: "Digital",
    styleUrl:
      "https://api.maptiler.com/maps/dataviz/style.json?key=YOUR_MAPTILER_KEY",
  },
  bright: {
    id: "bright",
    label: "Bright",
    styleUrl:
      "https://api.maptiler.com/maps/bright/style.json?key=YOUR_MAPTILER_KEY",
  },
  darkmatter: {
    id: "darkmatter",
    label: "Dark",
    styleUrl:
      "https://api.maptiler.com/maps/darkmatter/style.json?key=YOUR_MAPTILER_KEY",
  },
} as const;

type ThemeId = keyof typeof GAME_THEMES;

const Map = () => {
  const { player, setPlayer } = usePlayerData();
  const [theme, setTheme] = useState<ThemeId>("dataviz");

  // If no player yet, show the setup screen
  if (!player) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <div className="max-w-lg w-full px-4">
          <PlayerSetup onComplete={setPlayer} />
        </div>
      </main>
    );
  }

  const currentStyleUrl = GAME_THEMES[theme].styleUrl;

  // Once a player exists, show the game map + resources + theme switcher
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="relative w-full h-screen">
        {/* THEME SWITCHER - top-right */}
        <div className="absolute top-4 right-4 z-20">
          <div className="rounded-2xl bg-slate-950/90 border border-slate-700 shadow-lg px-3 py-2">
            <p className="text-[11px] font-semibold text-slate-300 mb-1">
              Map Theme
            </p>
            <div className="flex gap-1">
              {Object.values(GAME_THEMES).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as ThemeId)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium border ${
                    theme === t.id
                      ? "bg-emerald-500 text-slate-900 border-emerald-400"
                      : "bg-slate-900 text-slate-100 border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resource panel in the bottom-left */}
        <div className="absolute bottom-6 left-6 z-10">
          <ResourceDisplay resources={player.resources} />
        </div>

        {/* Fullscreen map - key={theme} forces remount when theme changes */}
        <div className="w-full h-full">
          <MapView key={theme} styleUrl={currentStyleUrl} />
        </div>
      </div>
    </main>
  );
};

export default Map;
