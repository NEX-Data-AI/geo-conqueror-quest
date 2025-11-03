import MapView from "@/components/Map/MapView";
import PlayerSetup from "@/components/PlayerSetup";
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

  // Once we have a player, show the game map
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="w-full h-screen">
        <MapView />
      </div>
    </main>
  );
};

export default Map;

      { enableHighAccuracy: true },
    );
  }, []);
