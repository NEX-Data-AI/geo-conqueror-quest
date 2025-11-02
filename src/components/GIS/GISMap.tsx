import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { GISLayer } from '@/types/gis';
import { Button } from '@/components/ui/button';
import { Map as MapIcon, Layers } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface GISMapProps {
  layers: GISLayer[];
  selectedLayer: string | null;
  drawMode: 'point' | 'line' | 'polygon' | null;
  onLayersChange: (layers: GISLayer[]) => void;
  onFeatureSelect?: (layerId: string, featureIndex: number) => void;
}

const GISMap = ({ layers, selectedLayer, drawMode, onLayersChange, onFeatureSelect }: GISMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [basemap, setBasemap] = useState<'street' | 'satellite' | 'terrain'>('street');
  const drawingPoints = useRef<[number, number][]>([]);
  const drawingMarkers = useRef<maplibregl.Marker[]>([]);
  const activePopup = useRef<maplibregl.Popup | null>(null);

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
        
        // Add click handler for polygons
        map.current!.on('click', `${layer.id}-fill`, (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            showFeaturePopup(feature, e.lngLat, layer.id);
          }
        });
        map.current!.getCanvas().style.cursor = 'pointer';
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
        
        // Add click handler for lines
        map.current!.on('click', `${layer.id}-line`, (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            showFeaturePopup(feature, e.lngLat, layer.id);
          }
        });
        map.current!.getCanvas().style.cursor = 'pointer';
      } else if (layer.type === 'point') {
        map.current!.addLayer({
          id: `${layer.id}-circle`,
          type: 'circle',
          source: layer.id,
          paint: {
            'circle-radius': layer.style?.weight || 6,
            'circle-color': layer.style?.fillColor || '#3b82f6',
            'circle-opacity': layer.opacity,
            'circle-stroke-width': 2,
            'circle-stroke-color': layer.style?.color || '#fff'
          }
        });
        
        // Add click handler for points
        map.current!.on('click', `${layer.id}-circle`, (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            showFeaturePopup(feature, e.lngLat, layer.id);
          }
        });
        map.current!.getCanvas().style.cursor = 'pointer';
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

  const showFeaturePopup = (feature: any, lngLat: maplibregl.LngLat, layerId: string) => {
    // Close existing popup
    if (activePopup.current) {
      activePopup.current.remove();
    }

    // Build popup content with proper styling
    const properties = feature.properties || {};
    let html = `
      <div style="background: white; padding: 12px; min-width: 200px; max-width: 350px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
        <h3 style="font-weight: 700; margin-bottom: 8px; font-size: 14px; color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 4px;">Feature Attributes</h3>
    `;
    
    if (Object.keys(properties).length === 0) {
      html += '<p style="font-size: 12px; color: #6b7280; margin: 8px 0;">No attributes</p>';
    } else {
      html += '<table style="width: 100%; font-size: 12px; border-collapse: collapse;">';
      Object.entries(properties).forEach(([key, value]) => {
        html += `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 6px 8px 6px 0; font-weight: 600; color: #374151; vertical-align: top;">${key}</td>
            <td style="padding: 6px 0; color: #1f2937;">${value}</td>
          </tr>
        `;
      });
      html += '</table>';
    }
    html += '</div>';

    const popup = new maplibregl.Popup({ 
      closeButton: true, 
      closeOnClick: false,
      maxWidth: '350px'
    })
      .setLngLat(lngLat)
      .setHTML(html)
      .addTo(map.current!);

    activePopup.current = popup;
  };

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
      
      {/* Basemap Switcher - Compact Icon */}
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="default" 
              size="icon"
              className="h-10 w-10 rounded-lg shadow-lg bg-card border-2 hover:bg-muted"
            >
              <Layers className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-card border-2 z-50">
            <DropdownMenuItem 
              onClick={() => setBasemap('street')}
              className={basemap === 'street' ? 'bg-primary/10 font-medium' : ''}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Street
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setBasemap('satellite')}
              className={basemap === 'satellite' ? 'bg-primary/10 font-medium' : ''}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Satellite
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setBasemap('terrain')}
              className={basemap === 'terrain' ? 'bg-primary/10 font-medium' : ''}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Terrain
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default GISMap;
