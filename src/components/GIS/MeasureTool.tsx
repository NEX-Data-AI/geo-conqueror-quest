import { useEffect, useState } from "react";
import { useMap } from "@/components/Map/MapContext";
import Panel from "@/components/UI/Panel";

type Coord = [number, number];

const EARTH_RADIUS_KM = 6371;

// Haversine distance between two lng/lat pairs (in km)
const distanceBetween = (a: Coord, b: Coord) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const [lng1, lat1] = a;
  const [lng2, lat2] = b;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
};

const totalDistanceKm = (coords: Coord[]) => {
  if (coords.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < coords.length; i++) {
    sum += distanceBetween(coords[i - 1], coords[i]);
  }
  return sum;
};

/**
 * MeasureTool
 * -----------
 * Click on the map to add points. We draw a line between them
 * and show the total distance in the panel.
 */
const MeasureTool = () => {
  const map = useMap();
  const [isActive, setIsActive] = useState(false);
  const [coords, setCoords] = useState<Coord[]>([]);
  const [distanceKm, setDistanceKm] = useState(0);

  // Handle map click when active
  useEffect(() => {
    if (!map || !isActive) return;

    const handleClick = (e: any) => {
      const { lng, lat } = e.lngLat;
      setCoords((prev) => [...prev, [lng, lat]]);
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, isActive]);

  // Update distance + line layers when coords change
  useEffect(() => {
    setDistanceKm(totalDistanceKm(coords));

    if (!map) return;

    const lineSourceId = "measure-line";
    const pointSourceId = "measure-points";

    const lineData =
      coords.length < 2
        ? {
            type: "FeatureCollection",
            features: [],
          }
        : {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: coords,
                },
                properties: {},
              },
            ],
          };

    const pointData = {
      type: "FeatureCollection",
      features: coords.map((c) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: c,
        },
        properties: {},
      })),
    };

    // Line source
    const existingLineSource = map.getSource(lineSourceId) as any;
    if (existingLineSource) {
      existingLineSource.setData(lineData as any);
    } else {
      map.addSource(lineSourceId, {
        type: "geojson",
        data: lineData as any,
      });
      map.addLayer({
        id: "measure-line-layer",
        type: "line",
        source: lineSourceId,
        paint: {
          "line-color": "#22c55e",
          "line-width": 3,
        },
      });
    }

    // Point source
    const existingPointSource = map.getSource(pointSourceId) as any;
    if (existingPointSource) {
      existingPointSource.setData(pointData as any);
    } else {
      map.addSource(pointSourceId, {
        type: "geojson",
        data: pointData as any,
      });
      map.addLayer({
        id: "measure-points-layer",
        type: "circle",
        source: pointSourceId,
        paint: {
          "circle-radius": 4,
          "circle-color": "#22c55e",
          "circle-stroke-width": 1,
          "circle-stroke-color": "#0f172a",
        },
      });
    }
  }, [coords, map]);

  const handleToggle = () => {
    setIsActive((prev) => !prev);
    if (!isActive) {
      // Just turned ON – clear any previous measurement
      setCoords([]);
      setDistanceKm(0);
    }
  };

  const handleReset = () => {
    setCoords([]);
    setDistanceKm(0);
  };

  const km = distanceKm;
  const miles = km * 0.621371;

  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 w-72">
      <Panel title="Measure Distance">
        <div className="space-y-3">
          <p className="text-xs text-slate-300">
            {isActive
              ? "Click on the map to add points. Double-click elsewhere to pan."
              : "Click Start, then click on the map to measure a path."}
          </p>

          <div className="flex items-center justify-between text-sm text-slate-100">
            <span>Total distance:</span>
            <span className="font-semibold">
              {km.toFixed(2)} km ({miles.toFixed(2)} mi)
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleToggle}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold border ${
                isActive
                  ? "bg-emerald-500/10 border-emerald-400 text-emerald-300"
                  : "bg-slate-800 border-slate-500 text-slate-100"
              }`}
            >
              {isActive ? "Stop measuring" : "Start measuring"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md px-3 py-1.5 text-xs font-semibold border bg-slate-900 border-slate-600 text-slate-200"
              disabled={coords.length === 0}
            >
              Reset
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default MeasureTool;
