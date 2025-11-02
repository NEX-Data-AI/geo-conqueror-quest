import MapView from "@/components/Map/MapView";
import PlayerSetup from "@/components/PlayerSetup";
import { usePlayerData } from "@/hooks/usePlayerData";

const Map = () => {
  const { player, setPlayer } = usePlayerData();

  if (!player) {
    return <PlayerSetup onComplete={setPlayer} />;
  }

  return <MapView />;
};

export default Map;
