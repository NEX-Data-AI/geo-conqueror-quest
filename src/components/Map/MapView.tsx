import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Pencil, Shield, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { usePlayerData } from '@/hooks/usePlayerData';
import { Territory, Cache, MapMode } from '@/types/game';
import { canCollectCache, generateCacheReward, calculateTerritoryGeneration, getHoursElapsed, getUpgradeCost, canAffordUpgrade } from '@/utils/gameLogic';
import ResourceDisplay from '@/components/ResourceDisplay';
import TerritoryUpgradeModal from '@/components/TerritoryUpgradeModal';

type MapViewProps = {
  styleUrl?: string;
};

// Default “gamey / digital” style – swap YOUR_MAPTILER_KEY later
const DEFAULT_GAME_STYLE =
  "https://api.maptiler.com/maps/dataviz/style.json?key=YOUR_MAPTILER_KEY";

const MapView: React.FC<MapViewProps> = ({ styleUrl }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>('view');
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const { player, gameData, addTerritory, addCache, updateTerritory, updateCache, addResources, spendResources, updatePlayer } = usePlayerData();
  const { territories, caches } = gameData;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://api.maptiler.com/maps/dataviz/style.json?key=YOUR_MAPTILER_KEY",
      center: [-81.7, 27.9],
      zoom: 7.5,
      pitch: 0,
      bearing: 0,
      attributionControl: false
    });

        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
      },
      center: [-98.5795, 39.8283],
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
          rarity: 'common',
          collected: false
        };
        addCache(newCache);

        // Add cache marker
        const el = document.createElement('div');
        el.className = 'w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-glow cursor-pointer';
        el.innerHTML = '💎';
        el.onclick = () => handleCacheClick(newCache);
        
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
      level: 1,
      lastHarvest: new Date().toISOString(),
      defenseRating: 10
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

  const handleCacheClick = (cache: Cache) => {
    if (cache.collected) {
      toast({
        title: "Already Collected",
        description: "This cache has already been looted",
        variant: "destructive"
      });
      return;
    }

    if (!userLocation) {
      toast({
        title: "Location Unknown",
        description: "Enable location to collect caches",
        variant: "destructive"
      });
      return;
    }

    if (!canCollectCache(userLocation, cache.coordinates)) {
      toast({
        title: "Too Far Away",
        description: "Get within 50m of the cache to collect it",
        variant: "destructive"
      });
      return;
    }

    const rewards = generateCacheReward(cache.rarity);
    addResources(rewards);
    updatePlayer({ xp: (player?.xp || 0) + rewards.xp });
    updateCache(cache.id, { collected: true });

    toast({
      title: "Cache Collected! 🎉",
      description: `+${rewards.credits} credits, +${rewards.materials} materials, +${rewards.xp} XP`
    });
  };

  const handleTerritoryUpgrade = (territoryId: string) => {
    const territory = territories.find(t => t.id === territoryId);
    if (!territory || !player) return;

    const cost = getUpgradeCost(territory.level);
    
    if (!canAffordUpgrade(player.resources, cost)) {
      toast({
        title: "Insufficient Resources",
        description: "You don't have enough resources to upgrade",
        variant: "destructive"
      });
      return;
    }

    spendResources(cost);
    updateTerritory(territoryId, { 
      level: territory.level + 1,
      defenseRating: territory.defenseRating + 5
    });

    toast({
      title: "Territory Upgraded! ⬆️",
      description: `Territory upgraded to level ${territory.level + 1}`
    });
  };

  const handleTerritoryHarvest = (territoryId: string) => {
    const territory = territories.find(t => t.id === territoryId);
    if (!territory) return;

    const hoursElapsed = getHoursElapsed(territory.lastHarvest);
    const resources = calculateTerritoryGeneration(territory, hoursElapsed);

    addResources(resources);
    updateTerritory(territoryId, { lastHarvest: new Date().toISOString() });

    toast({
      title: "Resources Harvested! 🌾",
      description: `+${resources.credits} credits, +${resources.materials} materials`
    });
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Player Info */}
      {player && (
        <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm border-2 border-border rounded-lg p-3 shadow-emboss space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl border-2 border-primary/40 overflow-hidden flex-shrink-0">
              {player.avatar.startsWith('data:') ? (
                <img src={player.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{player.avatar}</span>
              )}
            </div>
            <div className="text-sm space-y-1">
              <div className="font-bold text-primary">{player.codename}</div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>Lvl {player.level}</span>
                <span>XP {player.xp}</span>
              </div>
            </div>
          </div>
          <ResourceDisplay resources={player.resources} className="flex-col gap-2" />
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
            <div className="flex justify-between cursor-pointer hover:bg-primary/5 p-2 rounded" onClick={() => {
              if (territories.length > 0) {
                setSelectedTerritory(territories[0]);
              }
            }}>
              <span className="text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Territories:
              </span>
              <span className="font-bold text-primary">{territories.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Caches:
              </span>
              <span className="font-bold text-secondary">{caches.filter(c => !c.collected).length}/{caches.length}</span>
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

      {/* Territory Upgrade Modal */}
      <TerritoryUpgradeModal
        territory={selectedTerritory}
        playerResources={player?.resources || { credits: 0, materials: 0, energy: 0 }}
        open={!!selectedTerritory}
        onClose={() => setSelectedTerritory(null)}
        onUpgrade={handleTerritoryUpgrade}
        onHarvest={handleTerritoryHarvest}
      />
    </div>
  );
};

export default MapView;
