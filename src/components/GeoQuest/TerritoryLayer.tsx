import { useEffect } from "react";
import { useMap } from "@/components/Map/MapContext";

/**
 * TerritoryLayer
 * --------------
 * Example hook-in point for drawing or styling player territories.
 * Right now it just logs when the map is ready; replace with real
 * sources/layers as your schema solidifies.
 */
const TerritoryLayer = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Example placeholder: you can add a GeoJSON source + layer here.
    // map.addSource("territories", { type: "geojson", data: yourData });
    // map.addLayer({ id: "territories-fill", ... });

    // For now, just log so you know this mounted.
    console.debug("[GeoQuest] TerritoryLayer attached to map");

    return () => {
      // Cleanup example if you add layers:
      // if (map.getLayer("territories-fill")) map.removeLayer("territories-fill");
      // if (map.getSource("territories")) map.removeSource("territories");
    };
  }, [map]);

  return null;
};

export default TerritoryLayer;
