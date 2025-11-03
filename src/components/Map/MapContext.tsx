import { createContext, useContext } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

type MapContextValue = {
  map: MapLibreMap | null;
};

const MapContext = createContext<MapContextValue>({ map: null });

type MapProviderProps = {
  map: MapLibreMap | null;
  children: React.ReactNode;
};

export const MapProvider = ({ map, children }: MapProviderProps) => {
  return <MapContext.Provider value={{ map }}>{children}</MapContext.Provider>;
};

/**
 * useMap
 * ------
 * Convenience hook for child components (GeoQuest + GIS tools)
 * to access the shared MapLibre instance.
 */
export const useMap = () => {
  const ctx = useContext(MapContext);
  return ctx.map;
};
