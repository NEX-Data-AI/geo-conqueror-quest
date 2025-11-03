import { useEffect } from "react";
import { useMap } from "@/components/Map/MapContext";

/**
 * QuestMarkers
 * ------------
 * Placeholder component for adding quest markers / points of interest
 * to the map in GeoQuest mode.
 */
const QuestMarkers = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    console.debug("[GeoQuest] QuestMarkers attached to map");

    // Add your markers here in the future using map.addSource / addLayer
    // or custom HTML markers with new maplibregl.Marker().

    return () => {
      // Cleanup layers/markers if you add them.
    };
  }, [map]);

  return null;
};

export default QuestMarkers;
