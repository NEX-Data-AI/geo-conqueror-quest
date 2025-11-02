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
  const isInitialMount = useRef(true);
  const drawingPoints = useRef<[number, number][]>([]);
  const drawingMarkers = useRef<maplibregl.Marker[]>([]);
  const activePopup = useRef<maplibregl.Popup | null>(null);
  const selectionPolygonPoints = useRef<[number, number][]>([]);
  const highlightedFeatures = useRef<Map<string, number[]>>(new Map());

  // Basemap styles
  const basemapStyles = {
    street: {
      version: 8 as const,
      sources: {
        'osm': {
          type: 'raster' as const,
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [{
        id: 'osm',
        type: 'raster' as const,
        source: 'osm',
        minzoom: 0,
        maxzoom: 22
      }]
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
      layers: [{
        id: 'satellite',
        type: 'raster' as const,
        source: 'satellite',
        minzoom: 0,
        maxzoom: 22
      }]
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
      layers: [{
        id: 'terrain',
        type: 'raster' as const,
        source: 'terrain',
        minzoom: 0,
        maxzoom: 22
      }]
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

  // Handle basemap changes (skip initial mount)
  useEffect(() => {
    if (!map.current) return;
    
    // Skip the first run since map is initialized with 'street' basemap
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

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

        // Add _featureIndex to each feature for highlighting
        const dataWithIndices = {
          ...layer.data,
          features: layer.data.features.map((f, idx) => ({
            ...f,
            properties: { ...f.properties, _featureIndex: idx }
          }))
        };

        map.current!.addSource(layer.id, {
          type: 'geojson',
          data: dataWithIndices
        });

        if (layer.type === 'polygon') {
          map.current!.addLayer({
            id: `${layer.id}-fill`,
            type: 'fill',
            source: layer.id,
            paint: {
              'fill-color': [
                'case',
                ['in', ['get', '_featureIndex'], ['literal', highlightedFeatures.current.get(layer.id) || []]],
                '#fbbf24',
                layer.style?.fillColor || '#3b82f6'
              ],
              'fill-opacity': [
                'case',
                ['in', ['get', '_featureIndex'], ['literal', highlightedFeatures.current.get(layer.id) || []]],
                0.5,
                (layer.style?.fillOpacity || 0.3) * layer.opacity
              ]
            }
          });
          map.current!.addLayer({
            id: `${layer.id}-line`,
            type: 'line',
            source: layer.id,
            paint: {
              'line-color': [
                'case',
                ['in', ['get', '_featureIndex'], ['literal', highlightedFeatures.current.get(layer.id) || []]],
                '#f59e0b',
                layer.style?.color || '#3b82f6'
              ],
              'line-width': [
                'case',
                ['in', ['get', '_featureIndex'], ['literal', highlightedFeatures.current.get(layer.id) || []]],
                3,
                layer.style?.weight || 2
              ],
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
              if (drawMode.type === 'select' && drawMode.selectMode === 'click') {
                map.current!.getCanvas().style.cursor = 'pointer';
              }
            });
            map.current!.on('mouseleave', `${layer.id}-fill`, () => {
              if (drawMode.type === 'select' && drawMode.selectMode === 'click') {
                map.current!.getCanvas().style.cursor = 'default';
              }
            });
          }
        } else if (layer.type === 'line') {
          map.current!.addLayer({
            id: `${layer.id}-line`,
            type: 'line',
            source: layer.id,
            paint: {
              'line-color': [
                'case',
                ['in', ['get', '_featureIndex'], ['literal', highlightedFeatures.current.get(layer.id) || []]],
                '#f59e0b',
                layer.style?.color || '#3b82f6'
              ],
              'line-width': [
                'case',
                ['in', ['get', '_featureIndex'], ['literal', highlightedFeatures.current.get(layer.id) || []]],
                4,
                layer.style?.weight || 2
              ],
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
              if (drawMode.type === 'select' && drawMode.selectMode === 'click') {
                map.current!.getCanvas().style.cursor = 'pointer';
              }
            });
            map.current!.on('mouseleave', `${layer.id}-line`, () => {
              if (drawMode.type === 'select' && drawMode.selectMode === 'click') {
                map.current!.getCanvas().style.cursor = 'default';
              }
            });
          }
        } else if (layer.type === 'point') {
          map.current!.addLayer({
            id: `${layer.id}-circle`,
            type: 'circle',
            source: layer.id,
            paint: {
              'circle-radius': [
                'case',
                ['in', ['get', '_featureIndex'], ['literal', highlightedFeatures.current.get(layer.id) || []]],
                10,
                layer.style?.weight || 6
              ],
              'circle-color': [
                'case',
                ['in', ['get', '_featureIndex'], ['literal', highlightedFeatures.current.get(layer.id) || []]],
                '#fbbf24',
                layer.style?.fillColor || '#3b82f6'
              ],
              'circle-opacity': layer.opacity,
              'circle-stroke-width': 2,
              'circle-stroke-color': [
                'case',
                ['in', ['get', '_featureIndex'], ['literal', highlightedFeatures.current.get(layer.id) || []]],
                '#f59e0b',
                layer.style?.color || '#fff'
              ]
            }
          });
          
          if (layer.selectable !== false) {
            map.current!.on('click', `${layer.id}-circle`, (e) => {
              if (drawMode.type === 'select' && drawMode.selectMode === 'click' && e.features && e.features.length > 0) {
                handleFeatureClick(layer.id, e.features[0]);
              }
            });
            map.current!.on('mouseenter', `${layer.id}-circle`, () => {
              if (drawMode.type === 'select' && drawMode.selectMode === 'click') {
                map.current!.getCanvas().style.cursor = 'pointer';
              }
            });
            map.current!.on('mouseleave', `${layer.id}-circle`, () => {
              if (drawMode.type === 'select' && drawMode.selectMode === 'click') {
                map.current!.getCanvas().style.cursor = 'default';
              }
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
    
    if (featureIndex !== -1) {
      // Update highlights
      highlightedFeatures.current.clear();
      highlightedFeatures.current.set(layerId, [featureIndex]);
      
      // Refresh the layer to show highlight
      if (map.current?.getSource(layerId)) {
        const source = map.current.getSource(layerId) as maplibregl.GeoJSONSource;
        const updatedData = {
          ...layer.data,
          features: layer.data.features.map((f, idx) => ({
            ...f,
            properties: { ...f.properties, _featureIndex: idx }
          }))
        };
        source.setData(updatedData);
      }
      
      // Show popup
      if (activePopup.current) {
        activePopup.current.remove();
      }
      
      let coordinates: [number, number];
      if (feature.geometry.type === 'Point') {
        coordinates = feature.geometry.coordinates as [number, number];
      } else if (feature.geometry.type === 'Polygon') {
        const coords = feature.geometry.coordinates[0];
        coordinates = calculateCentroid(coords) as [number, number];
      } else if (feature.geometry.type === 'LineString') {
        const coords = feature.geometry.coordinates;
        coordinates = coords[Math.floor(coords.length / 2)] as [number, number];
      } else {
        return;
      }
      
      const properties = feature.properties || {};
      const propEntries = Object.entries(properties).filter(([key]) => !key.startsWith('_'));
      const popupContent = propEntries.length > 0
        ? `<div style="padding: 4px;">
             <strong>${layer.name}</strong><br/>
             ${propEntries.map(([key, value]) => 
               `<div style="margin-top: 4px;"><strong>${key}:</strong> ${value}</div>`
             ).join('')}
           </div>`
        : `<div style="padding: 4px;"><strong>${layer.name}</strong><br/>Feature ${featureIndex + 1}</div>`;
      
      activePopup.current = new maplibregl.Popup({ closeButton: true, closeOnClick: false })
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map.current!);
      
      // Also trigger selection for attribute table
      if (onFeatureSelect) {
        const selections = new Map<string, number[]>();
        selections.set(layerId, [featureIndex]);
        onFeatureSelect(selections);
      }
    }
  };

  // Helper function to check if a feature is inside a polygon
  const isFeatureInPolygon = (feature: any, polygon: number[][]): boolean => {
    const geometry = feature.geometry;
    
    if (geometry.type === 'Point') {
      const point = geometry.coordinates;
      return pointInPolygon(point, polygon);
    } else if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
      // Check if polygon centroid is inside selection
      const coords = geometry.type === 'Polygon' 
        ? geometry.coordinates[0] 
        : geometry.coordinates[0][0];
      const centroid = calculateCentroid(coords);
      return pointInPolygon(centroid, polygon);
    } else if (geometry.type === 'LineString' || geometry.type === 'MultiLineString') {
      // Check if any point of line is inside selection
      const coords = geometry.type === 'LineString' 
        ? geometry.coordinates 
        : geometry.coordinates[0];
      return coords.some((point: number[]) => pointInPolygon(point, polygon));
    }
    
    return false;
  };

  // Point-in-polygon algorithm (ray casting)
  const pointInPolygon = (point: number[], polygon: number[][]): boolean => {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }

    return inside;
  };

  // Calculate centroid of a polygon
  const calculateCentroid = (coords: number[][]): number[] => {
    let sumX = 0, sumY = 0;
    coords.forEach(([x, y]) => {
      sumX += x;
      sumY += y;
    });
    return [sumX / coords.length, sumY / coords.length];
  };

  // Handle polygon selection mode
  useEffect(() => {
    if (!map.current || drawMode.type !== 'select' || drawMode.selectMode !== 'polygon') return;

    let selectionPolygon: number[][] = [];
    let markers: maplibregl.Marker[] = [];

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const coords = [e.lngLat.lng, e.lngLat.lat];
      selectionPolygon.push(coords);

      // Add marker at click point
      const marker = new maplibregl.Marker({ color: '#ef4444' })
        .setLngLat(e.lngLat)
        .addTo(map.current!);
      markers.push(marker);

      // Draw selection polygon lines
      if (selectionPolygon.length > 1) {
        const sourceId = 'selection-polygon';
        const layerId = 'selection-polygon-line';

        if (map.current!.getSource(sourceId)) {
          (map.current!.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: selectionPolygon
            },
            properties: {}
          });
        } else {
          map.current!.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: selectionPolygon
              },
              properties: {}
            }
          });

          map.current!.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': '#ef4444',
              'line-width': 2,
              'line-dasharray': [2, 2]
            }
          });
        }
      }
    };

    const handleDblClick = (e: maplibregl.MapMouseEvent) => {
      e.preventDefault();

      if (selectionPolygon.length < 3) return;

      // Close the polygon
      selectionPolygon.push(selectionPolygon[0]);

      // Find features within polygon
      const selectedByLayer = new Map<string, number[]>();

      layers.forEach(layer => {
        layer.data.features.forEach((feature, index) => {
          if (isFeatureInPolygon(feature, selectionPolygon)) {
            const existing = selectedByLayer.get(layer.id) || [];
            selectedByLayer.set(layer.id, [...existing, index]);
          }
        });
      });

      // Update highlights
      highlightedFeatures.current = selectedByLayer;
      
      // Refresh all layers to show highlights
      layers.forEach(layer => {
        if (map.current?.getSource(layer.id)) {
          const source = map.current.getSource(layer.id) as maplibregl.GeoJSONSource;
          const updatedData = {
            ...layer.data,
            features: layer.data.features.map((f, idx) => ({
              ...f,
              properties: { ...f.properties, _featureIndex: idx }
            }))
          };
          source.setData(updatedData);
        }
      });

      // Clean up selection polygon
      if (map.current!.getSource('selection-polygon')) {
        map.current!.removeLayer('selection-polygon-line');
        map.current!.removeSource('selection-polygon');
      }
      markers.forEach(m => m.remove());

      // Close any active popup
      if (activePopup.current) {
        activePopup.current.remove();
        activePopup.current = null;
      }

      onFeatureSelect?.(selectedByLayer);

      // Reset for next selection
      selectionPolygon = [];
      markers = [];
    };

    map.current.on('click', handleClick);
    map.current.on('dblclick', handleDblClick);

    return () => {
      map.current?.off('click', handleClick);
      map.current?.off('dblclick', handleDblClick);
      
      // Clean up
      if (map.current?.getSource('selection-polygon')) {
        map.current.removeLayer('selection-polygon-line');
        map.current.removeSource('selection-polygon');
      }
      markers.forEach(m => m.remove());
    };
  }, [drawMode, layers, onFeatureSelect]);

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
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full"
        style={{ 
          cursor: drawMode.type === 'select' && drawMode.selectMode === 'polygon' 
            ? 'crosshair' 
            : drawMode.type === 'select' 
            ? 'pointer'
            : 'default' 
        }}
      />
      
      {/* Basemap Switcher */}
      <div className="absolute top-4 left-4 z-[998]">
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
