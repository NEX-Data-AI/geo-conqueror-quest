import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { GISLayer } from '@/types/gis';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export type DrawingMode = {
  type: 'point' | 'line' | 'polygon' | 'select' | null;
  purpose: 'annotation' | 'feature';
  targetLayerId?: string;
  selectMode?: 'click' | 'polygon';
};

interface GISMapProps {
  layers: GISLayer[];
  selectedLayer: string | null;
  activeLayer: string | null;
  drawMode: DrawingMode;
  onLayersChange: (layers: GISLayer[]) => void;
  onFeatureSelect?: (selections: Map<string, number[]>) => void;
}

const GISMap = ({ layers, selectedLayer, activeLayer, drawMode, onLayersChange, onFeatureSelect }: GISMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [basemap, setBasemap] = useState<'street' | 'satellite' | 'terrain'>('street');
  const drawingPoints = useRef<[number, number][]>([]);
  const drawingMarkers = useRef<maplibregl.Marker[]>([]);
  const activePopup = useRef<maplibregl.Popup | null>(null);
  const selectionPolygonPoints = useRef<[number, number][]>([]);

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
      style: basemapStyles['street'],
      center: [-98.5795, 39.8283],
      zoom: 4
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Handle basemap changes
  useEffect(() => {
    if (!map.current) return;

    map.current.setStyle(basemapStyles[basemap]);
  }, [basemap]);

  // Render layers whenever they change or basemap changes
  useEffect(() => {
    if (!map.current) return;

    const renderLayers = () => {
      if (!map.current?.isStyleLoaded()) {
        setTimeout(renderLayers, 50);
        return;
      }

      // Remove existing layers
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
          
          if (layer.selectable !== false) {
            map.current!.on('click', `${layer.id}-fill`, (e) => {
              if (drawMode.type === 'select' && drawMode.selectMode === 'click' && e.features && e.features.length > 0) {
                handleFeatureClick(layer.id, e.features[0]);
              }
            });
            map.current!.on('mouseenter', `${layer.id}-fill`, () => {
              if (drawMode.type === 'select') {
                map.current!.getCanvas().style.cursor = 'pointer';
              }
            });
            map.current!.on('mouseleave', `${layer.id}-fill`, () => {
              map.current!.getCanvas().style.cursor = '';
            });
          }
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
          
          if (layer.selectable !== false) {
            map.current!.on('click', `${layer.id}-line`, (e) => {
              if (drawMode.type === 'select' && drawMode.selectMode === 'click' && e.features && e.features.length > 0) {
                handleFeatureClick(layer.id, e.features[0]);
              }
            });
            map.current!.on('mouseenter', `${layer.id}-line`, () => {
              if (drawMode.type === 'select') {
                map.current!.getCanvas().style.cursor = 'pointer';
              }
            });
            map.current!.on('mouseleave', `${layer.id}-line`, () => {
              map.current!.getCanvas().style.cursor = '';
            });
          }
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
          
          if (layer.selectable !== false) {
            map.current!.on('click', `${layer.id}-circle`, (e) => {
              if (drawMode.type === 'select' && drawMode.selectMode === 'click' && e.features && e.features.length > 0) {
                handleFeatureClick(layer.id, e.features[0]);
              }
            });
            map.current!.on('mouseenter', `${layer.id}-circle`, () => {
              if (drawMode.type === 'select') {
                map.current!.getCanvas().style.cursor = 'pointer';
              }
            });
            map.current!.on('mouseleave', `${layer.id}-circle`, () => {
              map.current!.getCanvas().style.cursor = '';
            });
          }
        }

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
    };

    renderLayers();
  }, [layers, selectedLayer, basemap, drawMode]);

  const handleFeatureClick = (layerId: string, feature: any) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const featureIndex = layer.data.features.findIndex(f => 
      JSON.stringify(f.geometry) === JSON.stringify(feature.geometry)
    );
    
    if (featureIndex !== -1 && onFeatureSelect) {
      const selections = new Map<string, number[]>();
      selections.set(layerId, [featureIndex]);
      onFeatureSelect(selections);
    }
  };

  // Handle drawing mode
  useEffect(() => {
    if (!map.current) return;

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      if (!drawMode.type || drawMode.type === 'select') return;

      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      drawingPoints.current.push(coords);

      const markerColor = drawMode.purpose === 'annotation' ? '#10b981' : '#f59e0b';
      const marker = new maplibregl.Marker({ color: markerColor })
        .setLngLat(coords)
        .addTo(map.current!);
      drawingMarkers.current.push(marker);

      if (drawMode.type === 'point') {
        completeDrawing();
      }
    };

    const handleDblClick = () => {
      if (drawMode.type && drawMode.type !== 'select' && drawingPoints.current.length >= 2) {
        completeDrawing();
      }
    };

    if (drawMode.type && drawMode.type !== 'select') {
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
    if (points.length === 0 || !drawMode.type || drawMode.type === 'select') return;

    let geometry: any;
    let type: 'point' | 'line' | 'polygon' = 'point';

    if (drawMode.type === 'point') {
      geometry = { type: 'Point', coordinates: points[0] };
      type = 'point';
    } else if (drawMode.type === 'line' && points.length >= 2) {
      geometry = { type: 'LineString', coordinates: points };
      type = 'line';
    } else if (drawMode.type === 'polygon' && points.length >= 3) {
      geometry = { type: 'Polygon', coordinates: [[...points, points[0]]] };
      type = 'polygon';
    }

    if (geometry) {
      const newFeature = {
        type: 'Feature' as const,
        geometry,
        properties: drawMode.purpose === 'annotation' 
          ? { _annotation: true, created: new Date().toISOString() }
          : {}
      };

      if (drawMode.purpose === 'feature' && drawMode.targetLayerId) {
        const targetLayer = layers.find(l => l.id === drawMode.targetLayerId);
        if (targetLayer) {
          const updatedLayer = {
            ...targetLayer,
            data: {
              ...targetLayer.data,
              features: [...targetLayer.data.features, newFeature]
            }
          };
          onLayersChange(layers.map(l => l.id === drawMode.targetLayerId ? updatedLayer : l));
        }
      } else {
        const isAnnotation = drawMode.purpose === 'annotation';
        const newLayer: GISLayer = {
          id: `layer-${Date.now()}`,
          name: isAnnotation ? `Annotation ${drawMode.type}` : `New ${drawMode.type}`,
          type,
          visible: true,
          opacity: 1,
          selectable: true,
          data: {
            type: 'FeatureCollection',
            features: [newFeature]
          },
          style: {
            color: isAnnotation ? '#10b981' : '#f59e0b',
            fillColor: isAnnotation ? '#10b981' : '#f59e0b',
            fillOpacity: isAnnotation ? 0.2 : 0.3,
            weight: 2
          }
        };

        onLayersChange([...layers, newLayer]);
      }
    }

    drawingPoints.current = [];
    drawingMarkers.current.forEach(m => m.remove());
    drawingMarkers.current = [];
  };

  return (
    <div className="relative flex-1">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Basemap Switcher */}
      <div className="absolute top-4 left-4 z-[999]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="default" 
              size="icon"
              className="h-9 w-9 rounded-md shadow-lg bg-background border-2 border-primary/20 hover:bg-muted hover:border-primary"
            >
              <Layers className="h-5 w-5 text-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40 bg-background border-2 z-[1000]">
            <DropdownMenuItem 
              onClick={() => setBasemap('street')}
              className={basemap === 'street' ? 'bg-primary/10 font-medium' : ''}
            >
              Street
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setBasemap('satellite')}
              className={basemap === 'satellite' ? 'bg-primary/10 font-medium' : ''}
            >
              Satellite
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setBasemap('terrain')}
              className={basemap === 'terrain' ? 'bg-primary/10 font-medium' : ''}
            >
              Terrain
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default GISMap;
