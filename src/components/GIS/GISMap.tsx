import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { GISLayer } from '@/types/gis';
import { Button } from '@/components/ui/button';
import { Map as MapIcon } from 'lucide-react';

interface GISMapProps {
  layers: GISLayer[];
  selectedLayer: string | null;
  drawMode: 'point' | 'line' | 'polygon' | null;
  onLayersChange: (layers: GISLayer[]) => void;
}

const GISMap = ({ layers, selectedLayer, drawMode, onLayersChange }: GISMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [basemap, setBasemap] = useState<'street' | 'satellite' | 'terrain'>('street');
  const drawingPoints = useRef<[number, number][]>([]);
  const drawingMarkers = useRef<maplibregl.Marker[]>([]);

  // Basemap styles
  const basemapStyles = {
    street: {
      version: 8 as const,
      sources: {
        'osm': {
          type: 'raster' as const,
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
    },
    satellite: {
      version: 8 as const,
      sources: {
        'satellite': {
          type: 'raster' as const,
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: '© Esri'
        }
      },
      layers: [{ id: 'satellite', type: 'raster' as const, source: 'satellite' }],
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
    },
    terrain: {
      version: 8 as const,
      sources: {
        'terrain': {
          type: 'raster' as const,
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: '© Esri'
        }
      },
      layers: [{ id: 'terrain', type: 'raster' as const, source: 'terrain' }],
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: basemapStyles[basemap],
      center: [-98.5795, 39.8283],
      zoom: 4
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    return () => {
      map.current?.remove();
    };
  }, []);

  // Change basemap
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(basemapStyles[basemap]);
  }, [basemap]);

  // Render layers
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // Remove existing layer sources
    layers.forEach(layer => {
      if (map.current!.getLayer(`${layer.id}-fill`)) {
        map.current!.removeLayer(`${layer.id}-fill`);
      }
      if (map.current!.getLayer(`${layer.id}-line`)) {
        map.current!.removeLayer(`${layer.id}-line`);
      }
      if (map.current!.getLayer(`${layer.id}-circle`)) {
        map.current!.removeLayer(`${layer.id}-circle`);
      }
      if (map.current!.getSource(layer.id)) {
        map.current!.removeSource(layer.id);
      }
    });

    // Add layers
    layers.forEach(layer => {
      if (!layer.visible || !layer.data.features.length) return;

      map.current!.addSource(layer.id, {
        type: 'geojson',
        data: layer.data
      });

      if (layer.type === 'polygon') {
        map.current!.addLayer({
          id: `${layer.id}-fill`,
          type: 'fill',
          source: layer.id,
          paint: {
            'fill-color': layer.style?.fillColor || '#3b82f6',
            'fill-opacity': (layer.style?.fillOpacity || 0.3) * layer.opacity
          }
        });
        map.current!.addLayer({
          id: `${layer.id}-line`,
          type: 'line',
          source: layer.id,
          paint: {
            'line-color': layer.style?.color || '#3b82f6',
            'line-width': layer.style?.weight || 2,
            'line-opacity': layer.opacity
          }
        });
      } else if (layer.type === 'line') {
        map.current!.addLayer({
          id: `${layer.id}-line`,
          type: 'line',
          source: layer.id,
          paint: {
            'line-color': layer.style?.color || '#3b82f6',
            'line-width': layer.style?.weight || 2,
            'line-opacity': layer.opacity
          }
        });
      } else if (layer.type === 'point') {
        map.current!.addLayer({
          id: `${layer.id}-circle`,
          type: 'circle',
          source: layer.id,
          paint: {
            'circle-radius': 6,
            'circle-color': layer.style?.fillColor || '#3b82f6',
            'circle-opacity': layer.opacity,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }
        });
      }

      // Fit bounds to layer if it's selected
      if (layer.id === selectedLayer && layer.data.features.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        layer.data.features.forEach(feature => {
          if (feature.geometry.type === 'Point') {
            bounds.extend(feature.geometry.coordinates as [number, number]);
          } else if (feature.geometry.type === 'LineString') {
            feature.geometry.coordinates.forEach(coord => bounds.extend(coord as [number, number]));
          } else if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates[0].forEach(coord => bounds.extend(coord as [number, number]));
          }
        });
        map.current!.fitBounds(bounds, { padding: 50 });
      }
    });
  }, [layers, selectedLayer]);

  // Handle drawing mode
  useEffect(() => {
    if (!map.current) return;

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      if (!drawMode) return;

      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      drawingPoints.current.push(coords);

      // Add marker
      const marker = new maplibregl.Marker({ color: '#f59e0b' })
        .setLngLat(coords)
        .addTo(map.current!);
      drawingMarkers.current.push(marker);

      // Complete on double click for polygon/line
      if (drawMode === 'point') {
        completeDrawing();
      }
    };

    const handleDblClick = () => {
      if (drawMode && drawingPoints.current.length >= 2) {
        completeDrawing();
      }
    };

    if (drawMode) {
      map.current.on('click', handleMapClick);
      map.current.on('dblclick', handleDblClick);
    }

    return () => {
      map.current?.off('click', handleMapClick);
      map.current?.off('dblclick', handleDblClick);
    };
  }, [drawMode]);

  const completeDrawing = () => {
    const points = [...drawingPoints.current];
    if (points.length === 0) return;

    let geometry: any;
    let type: 'point' | 'line' | 'polygon' = 'point';

    if (drawMode === 'point') {
      geometry = { type: 'Point', coordinates: points[0] };
      type = 'point';
    } else if (drawMode === 'line' && points.length >= 2) {
      geometry = { type: 'LineString', coordinates: points };
      type = 'line';
    } else if (drawMode === 'polygon' && points.length >= 3) {
      geometry = { type: 'Polygon', coordinates: [[...points, points[0]]] };
      type = 'polygon';
    }

    if (geometry) {
      const newLayer: GISLayer = {
        id: `layer-${Date.now()}`,
        name: `New ${drawMode}`,
        type,
        visible: true,
        opacity: 1,
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry,
            properties: {}
          }]
        },
        style: {
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.3,
          weight: 2
        }
      };

      onLayersChange([...layers, newLayer]);
    }

    // Clear drawing
    drawingPoints.current = [];
    drawingMarkers.current.forEach(m => m.remove());
    drawingMarkers.current = [];
  };

  return (
    <div className="relative flex-1">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Basemap Switcher */}
      <div className="absolute top-4 right-4 bg-card border rounded-lg shadow-lg p-2 space-y-1">
        <Button
          variant={basemap === 'street' ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start"
          onClick={() => setBasemap('street')}
        >
          <MapIcon className="h-4 w-4 mr-2" />
          Street
        </Button>
        <Button
          variant={basemap === 'satellite' ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start"
          onClick={() => setBasemap('satellite')}
        >
          <MapIcon className="h-4 w-4 mr-2" />
          Satellite
        </Button>
        <Button
          variant={basemap === 'terrain' ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start"
          onClick={() => setBasemap('terrain')}
        >
          <MapIcon className="h-4 w-4 mr-2" />
          Terrain
        </Button>
      </div>
    </div>
  );
};

export default GISMap;
