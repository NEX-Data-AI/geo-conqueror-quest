import { useState, useEffect } from 'react';
import { PlayerData, Territory, Cache, Resources, InventoryItem, GameData } from '@/types/game';

export type { PlayerData, Territory, Cache, Resources, InventoryItem, GameData };

const PLAYER_KEY = 'geoquest-player';
const GAME_KEY = 'geoquest-game';

export const usePlayerData = () => {
  const [player, setPlayerState] = useState<PlayerData | null>(null);
  const [gameData, setGameDataState] = useState<GameData>({
    territories: [],
    caches: []
  });

  // Load player data on mount
  useEffect(() => {
    const stored = localStorage.getItem(PLAYER_KEY);
    if (stored) {
      setPlayerState(JSON.parse(stored));
    }

    const storedGame = localStorage.getItem(GAME_KEY);
    if (storedGame) {
      setGameDataState(JSON.parse(storedGame));
    }
  }, []);

  const setPlayer = (data: PlayerData) => {
    setPlayerState(data);
    localStorage.setItem(PLAYER_KEY, JSON.stringify(data));
  };

  const updatePlayer = (updates: Partial<PlayerData>) => {
    if (!player) return;
    const updated = { ...player, ...updates };
    setPlayer(updated);
  };

  const addResources = (resources: Partial<Resources>) => {
    if (!player) return;
    const updated = {
      ...player,
      resources: {
        credits: player.resources.credits + (resources.credits || 0),
        materials: player.resources.materials + (resources.materials || 0),
        energy: player.resources.energy + (resources.energy || 0)
      }
    };
    setPlayer(updated);
  };

  const spendResources = (resources: Partial<Resources>) => {
    if (!player) return;
    const updated = {
      ...player,
      resources: {
        credits: player.resources.credits - (resources.credits || 0),
        materials: player.resources.materials - (resources.materials || 0),
        energy: player.resources.energy - (resources.energy || 0)
      }
    };
    setPlayer(updated);
  };

  const setGameData = (data: GameData) => {
    setGameDataState(data);
    localStorage.setItem(GAME_KEY, JSON.stringify(data));
  };

  const addTerritory = (territory: Territory) => {
    const updated = {
      ...gameData,
      territories: [...gameData.territories, territory]
    };
    setGameData(updated);
  };

  const addCache = (cache: Cache) => {
    const updated = {
      ...gameData,
      caches: [...gameData.caches, cache]
    };
    setGameData(updated);
  };

  const updateTerritory = (territoryId: string, updates: Partial<Territory>) => {
    const updated = {
      ...gameData,
      territories: gameData.territories.map(t =>
        t.id === territoryId ? { ...t, ...updates } : t
      )
    };
    setGameData(updated);
  };

  const updateCache = (cacheId: string, updates: Partial<Cache>) => {
    const updated = {
      ...gameData,
      caches: gameData.caches.map(c =>
        c.id === cacheId ? { ...c, ...updates } : c
      )
    };
    setGameData(updated);
  };

  const clearAllData = () => {
    localStorage.removeItem(PLAYER_KEY);
    localStorage.removeItem(GAME_KEY);
    setPlayerState(null);
    setGameDataState({ territories: [], caches: [] });
  };

  return {
    player,
    setPlayer,
    updatePlayer,
    addResources,
    spendResources,
    gameData,
    setGameData,
    addTerritory,
    addCache,
    updateTerritory,
    updateCache,
    clearAllData
  };
};
