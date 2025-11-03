// src/pages/Map.tsx

import MapView from "@/components/Map/MapView";
import PlayerSetup from "@/components/PlayerSetup";
import ResourceDisplay from "@/components/ResourceDisplay";
import { usePlayerData } from "@/hooks/usePlayerData";

const Map = () => {
  const { player, setPlayer } = usePlayerData();

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

  // Once a player exists, show the game map + resources
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="relative w-full h-screen">
        {/* Resource panel moved to bottom-left */}
        <div className="absolute bottom-6 left-6 z-10">
          <ResourceDisplay resources={player.resources} />
        </div>

        {/* Fullscreen map */}
        <div className="w-full h-full">
          <MapView />
        </div>
      </div>
    </main>
  );
};

export default Map;
