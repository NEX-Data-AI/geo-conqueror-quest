import { useEffect, useState } from "react";

type GameMode = "casual" | "ranked" | "training";

type GeoQuestGameState = {
  mode: GameMode;
  level: number;
  xp: number;
  xpToNextLevel: number;
  territoriesOwned: number;
  questsCompleted: number;
};

const STORAGE_KEY = "geoquest_game_state_v1";

const defaultState: GeoQuestGameState = {
  mode: "casual",
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  territoriesOwned: 0,
  questsCompleted: 0,
};

const loadState = (): GeoQuestGameState => {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as GeoQuestGameState;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
};

const saveState = (state: GeoQuestGameState) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
};

/**
 * useGeoQuestGame
 * ----------------
 * Central place for GeoQuest-level progression:
 * XP, level, mode, territories, quests completed.
 */
export const useGeoQuestGame = () => {
  const [state, setState] = useState<GeoQuestGameState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addXP = (amount: number) => {
    setState((prev) => {
      let xp = prev.xp + amount;
      let level = prev.level;
      let xpToNextLevel = prev.xpToNextLevel;

      while (xp >= xpToNextLevel) {
        xp -= xpToNextLevel;
        level += 1;
        xpToNextLevel = Math.round(xpToNextLevel * 1.25);
      }

      return { ...prev, xp, level, xpToNextLevel };
    });
  };

  const incrementTerritories = () => {
    setState((prev) => ({
      ...prev,
      territoriesOwned: prev.territoriesOwned + 1,
    }));
  };

  const incrementQuestsCompleted = () => {
    setState((prev) => ({
      ...prev,
      questsCompleted: prev.questsCompleted + 1,
    }));
  };

  const setMode = (mode: GameMode) => {
    setState((prev) => ({ ...prev, mode }));
  };

  return {
    ...state,
    addXP,
    incrementTerritories,
    incrementQuestsCompleted,
    setMode,
  };
};
