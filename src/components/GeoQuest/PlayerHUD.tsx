import { useGeoQuestGame } from "@/hooks/useGeoQuestGame";

/**
 * PlayerHUD
 * ---------
 * Simple overlay showing XP, level, and resources for the player.
 * This sits on top of the map in GeoQuest mode.
 */
const PlayerHUD = () => {
  const { level, xp, xpToNextLevel, territoriesOwned, questsCompleted, mode } =
    useGeoQuestGame();

  return (
    <div className="pointer-events-auto absolute top-4 left-4 space-y-2">
      <div className="rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-slate-400">Mode</p>
            <p className="text-sm font-semibold text-slate-50">{mode}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-slate-400">Level</p>
            <p className="text-lg font-bold text-emerald-400">{level}</p>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>XP</span>
            <span>
              {xp} / {xpToNextLevel}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${Math.min(100, (xp / xpToNextLevel) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
          <span>Territories: {territoriesOwned}</span>
          <span>Quests: {questsCompleted}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerHUD;
