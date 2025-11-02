import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Pencil, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { usePlayerData } from '@/hooks/usePlayerData';

type MapMode = 'view' | 'draw' | 'cache';

interface Territory {
  id: string;
  coordinates: [number, number][];
  level: number;
}

interface Cache {
  id: string;
  coordinates: [number, number];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>('view');
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { player, gameData, addTerritory, addCache } = usePlayerData();
  const { territories, caches } = gameData;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [{
          id: 'osm',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 19
        }]
      },
      center: [-98.5795, 39.8283], // Center of US
      zoom: 4,
      pitch: 0,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(coords);
          
          if (map.current) {
            map.current.flyTo({ center: coords, zoom: 14 });
            
            // Add user marker
            new maplibregl.Marker({ color: '#10b981' })
              .setLngLat(coords)
              .setPopup(new maplibregl.Popup().setHTML('<strong>Your Location</strong>'))
              .addTo(map.current);
          }
        },
        (error) => {
          console.warn('Geolocation error:', error);
          toast({
            title: "Location Access",
            description: "Enable location to see your position on the map",
            variant: "destructive"
          });
        }
      );
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Handle map clicks for drawing
  useEffect(() => {
    if (!map.current) return;

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      if (mapMode === 'draw') {
        const newPoints = [...drawingPoints, coords];
        setDrawingPoints(newPoints);

        // Add marker for each point
        new maplibregl.Marker({ color: '#f59e0b' })
          .setLngLat(coords)
          .addTo(map.current!);

        // Draw polygon preview if we have 3+ points
        if (newPoints.length >= 3) {
          const sourceId = 'territory-preview';
          if (map.current!.getSource(sourceId)) {
            (map.current!.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Polygon',
                coordinates: [[...newPoints, newPoints[0]]]
              }
            });
          } else {
            map.current!.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Polygon',
                  coordinates: [[...newPoints, newPoints[0]]]
                }
              }
            });
            map.current!.addLayer({
              id: 'territory-preview-fill',
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': '#f59e0b',
                'fill-opacity': 0.3
              }
            });
            map.current!.addLayer({
              id: 'territory-preview-line',
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': '#f59e0b',
                'line-width': 3
              }
            });
          }
        }
      } else if (mapMode === 'cache') {
        const newCache: Cache = {
          id: `cache-${Date.now()}`,
          coordinates: coords,
          rarity: 'common'
        };
        addCache(newCache);

        // Add cache marker
        const el = document.createElement('div');
        el.className = 'w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-glow cursor-pointer';
        el.innerHTML = '💎';
        
        new maplibregl.Marker({ element: el })
          .setLngLat(coords)
          .setPopup(new maplibregl.Popup().setHTML(`<strong>Cache</strong><br/>Rarity: ${newCache.rarity}`))
          .addTo(map.current!);

        toast({
          title: "Cache Placed!",
          description: "New treasure cache added to the map"
        });
      }
    };

    if (mapMode !== 'view') {
      map.current.on('click', handleMapClick);
    }

    return () => {
      map.current?.off('click', handleMapClick);
    };
  }, [mapMode, drawingPoints, caches]);

  const completeTerritory = () => {
    if (drawingPoints.length < 3) {
      toast({
        title: "Invalid Territory",
        description: "Draw at least 3 points to create a territory",
        variant: "destructive"
      });
      return;
    }

    const newTerritory: Territory = {
      id: `territory-${Date.now()}`,
      coordinates: drawingPoints,
      level: 1
    };

    addTerritory(newTerritory);
    
    toast({
      title: "Territory Claimed!",
      description: `Territory of ${drawingPoints.length} points claimed`,
    });

    // Clear preview
    if (map.current?.getSource('territory-preview')) {
      map.current.removeLayer('territory-preview-fill');
      map.current.removeLayer('territory-preview-line');
      map.current.removeSource('territory-preview');
    }

    setDrawingPoints([]);
    setMapMode('view');
  };

  const cancelDrawing = () => {
    setDrawingPoints([]);
    setMapMode('view');
    
    // Clear preview
    if (map.current?.getSource('territory-preview')) {
      map.current.removeLayer('territory-preview-fill');
      map.current.removeLayer('territory-preview-line');
      map.current.removeSource('territory-preview');
    }
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Player Info */}
      {player && (
        <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm border-2 border-border rounded-lg p-3 shadow-emboss">
          <div className="text-sm space-y-1">
            <div className="font-bold text-primary">{player.codename}</div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>Lvl {player.level}</span>
              <span>XP {player.xp}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm border-2 border-border rounded-lg p-4 shadow-emboss space-y-3">
        <div className="space-y-2">
          <Button
            variant={mapMode === 'draw' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setMapMode(mapMode === 'draw' ? 'view' : 'draw')}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Draw Territory
          </Button>
          
          <Button
            variant={mapMode === 'cache' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setMapMode(mapMode === 'cache' ? 'view' : 'cache')}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Place Cache
          </Button>
        </div>

        {mapMode === 'draw' && drawingPoints.length > 0 && (
          <div className="pt-3 border-t space-y-2">
            <p className="text-sm text-muted-foreground">
              Points: {drawingPoints.length}
            </p>
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={completeTerritory}
              disabled={drawingPoints.length < 3}
            >
              <Shield className="mr-2 h-4 w-4" />
              Complete Territory
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={cancelDrawing}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}

        <div className="pt-3 border-t">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Territories:</span>
              <span className="font-bold text-primary">{territories.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Caches:</span>
              <span className="font-bold text-secondary">{caches.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {mapMode !== 'view' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/95 text-primary-foreground px-4 py-3 rounded-lg shadow-glow max-w-xs">
          <p className="text-sm font-medium">
            {mapMode === 'draw' 
              ? "Click on the map to add points to your territory. Complete when done."
              : "Click anywhere on the map to place a treasure cache."}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapView;
