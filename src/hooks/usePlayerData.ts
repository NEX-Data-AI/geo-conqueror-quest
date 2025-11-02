import { useState, useEffect } from 'react';

export interface PlayerData {
  codename: string;
  level: number;
  xp: number;
  reputation: number;
  homeBase: [number, number] | null;
  createdAt: string;
}

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

export interface GameData {
  territories: Territory[];
  caches: Cache[];
}

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
    gameData,
    setGameData,
    addTerritory,
    addCache,
    clearAllData
  };
};
