export interface PlayerData {
  codename: string;
  avatar: string;
  level: number;
  xp: number;
  reputation: number;
  homeBase: [number, number] | null;
  createdAt: string;
  resources: Resources;
  inventory: InventoryItem[];
}

export interface Resources {
  credits: number;
  materials: number;
  energy: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'defense' | 'boost' | 'material';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  quantity: number;
}

export interface Territory {
  id: string;
  coordinates: [number, number][];
  level: number;
  lastHarvest: string;
  defenseRating: number;
}

export interface Cache {
  id: string;
  coordinates: [number, number];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  collected: boolean;
  rewards?: CacheReward;
}

export interface CacheReward {
  credits: number;
  materials: number;
  xp: number;
  items: InventoryItem[];
}

export interface GameData {
  territories: Territory[];
  caches: Cache[];
}

export type MapMode = 'view' | 'draw' | 'cache';
