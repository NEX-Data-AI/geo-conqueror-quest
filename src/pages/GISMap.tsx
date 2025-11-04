import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, Geometry } from "geojson";
import { GISLayer } from "@/types/gis";

export type DrawingMode = {
  type: "select" | "draw-point" | "draw-line" | "draw-polygon";
  purpose: "feature" | "selection";
  selectMode?: "rectangle" | "polygon";
};

type GISMapProps = {
  layers: GISLayer[];
  selectedLayer: string | null;
  activeLayer: string | null;
  drawMode: DrawingMode;
  onLayersChange: (layers: GISLayer[]) => void;
  onFeatureSelect: (selection: Map<string, number[]>) => void;
  onClearSelectionRef: React.MutableRefObject<() => void>;
  /** Optional basemap style URL (from BasemapSwitcher) */
  basemapStyle?: string;
};

// Fallback style if none is provided
const GIS_BASEMAP_STYLE =
  "https://api.maptiler.com/maps/streets/style.json?key=EThfgSg4VIEOVBZKY4Cw";

const GISMap = ({
  layers,
  selectedLayer,
  activeLayer,
  drawMode,
  onLayersChange,
  onFeatureSelect,
  onClearSelectionRef,
  basemapStyle,
}: GISMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const mapInstance = new maplibregl.Map({
      container: containerRef.current,
      style: basemapStyle ?? GIS_BASEMAP_STYLE,
      center: [-81.7, 27.9], // Florida-ish; tweak as needed
      zoom: 7.5,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    mapInstance.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "top-right",
    );

    mapRef.current = mapInstance;

    return () => {
      mapInstance.remove();
      mapRef.current = null;
    };
    // we intentionally do NOT depend on basemapStyle here:
    // the map should only be created once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch basemap style when prop changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !basemapStyle) return;

    map.setStyle(basemapStyle);
  }, [basemapStyle]);

  // Sync layers -> MapLibre sources/layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    layers.forEach((layer) => {
      const sourceId = `gis-source-${layer.id}`;
      const layerId = `gis-layer-${layer.id}`;

      const fc = (layer as any).data as
        | FeatureCollection<Geometry>
        | undefined;
      if (!fc) {
        // No data yet, skip rendering
        return;
      }

      // Source
      const existingSource = map.getSource(sourceId) as any;
      if (existingSource) {
        existingSource.setData(fc as any);
      } else {
        map.addSource(sourceId, {
          type: "geojson",
          data: fc as any,
        });
      }

      // Style decisions based on layer.type (if present)
      const geomType = (layer as any).type as
        | "point"
        | "line"
        | "polygon"
        | undefined;

      const baseVisible =
        (layer as any).visible === undefined ? true : (layer as any).visible;
      const opacity =
        (layer as any).opacity === undefined ? 1 : (layer as any).opacity;

      const existingLayer = map.getLayer(layerId);
      if (!existingLayer) {
        if (geomType === "point") {
          map.addLayer({
            id: layerId,
            type: "circle",
            source: sourceId,
            paint: {
              "circle-radius": 4,
              "circle-color": "#38bdf8",
              "circle-opacity": opacity,
              "circle-stroke-width": 1,
              "circle-stroke-color": "#020617",
            },
          });
        } else if (geomType === "line") {
          map.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            paint: {
              "line-width": 2,
              "line-color": "#22c55e",
              "line-opacity": opacity,
            },
          });
        } else {
          // Default to polygon
          map.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            paint: {
              "fill-color": "#4f46e5",
              "fill-opacity": 0.25 * opacity,
              "fill-outline-color": "#818cf8",
            },
          });
        }
      }

      // Visibility
      map.setLayoutProperty(
        layerId,
        "visibility",
        baseVisible ? "visible" : "none",
      );
    });
  }, [layers, basemapStyle]); // re-sync after style changes too

  // Setup selection logic (click to select features)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (
      e: maplibregl.MapMouseEvent & maplibregl.EventData,
    ) => {
      if (drawMode.type !== "select") {
        // Drawing behavior could go here; keeping select-only for now
        return;
      }

      const selection = new Map<string, number[]>();

      layers.forEach((layer) => {
        const layerId = `gis-layer-${layer.id}`;
        const fc = (layer as any).data as
          | FeatureCollection<Geometry>
          | undefined;
        if (!fc) return;

        const features = map.queryRenderedFeatures(e.point, {
          layers: [layerId],
        });
        if (!features || features.length === 0) return;

        const layerFeatureIndexes: number[] = [];
        features.forEach((f) => {
          const idx = (f.properties?.__index as number | undefined) ?? -1;
          if (idx >= 0) {
            layerFeatureIndexes.push(idx);
          }
        });

        if (layerFeatureIndexes.length > 0) {
          selection.set(layer.id, layerFeatureIndexes);
        }
      });

      if (selection.size > 0) {
        onFeatureSelect(selection);
      }
    };

    map.on("click", handleClick);

    // Provide clear selection hook
    onClearSelectionRef.current = () => {
      onFeatureSelect(new Map());
    };

    return () => {
      map.off("click", handleClick);
    };
  }, [layers, drawMode, onFeatureSelect, onClearSelectionRef]);

  // (Optional) TODO: Hook up drawing behavior for draw-point/draw-line/draw-polygon
  // For now, these modes don't modify the map; they can be implemented once
  // the app is compiling and you've confirmed the basic GIS layout works.

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="absolute inset-0 rounded-none overflow-hidden"
      />
    </div>
  );
};

export default GISMap;
