import { Territory, Resources } from '@/types/game';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getUpgradeCost, canAffordUpgrade, calculateTerritoryGeneration, getHoursElapsed } from '@/utils/gameLogic';
import { ArrowUp, Coins, Wrench, TrendingUp } from 'lucide-react';
import ResourceDisplay from './ResourceDisplay';

interface TerritoryUpgradeModalProps {
  territory: Territory | null;
  playerResources: Resources;
  open: boolean;
  onClose: () => void;
  onUpgrade: (territoryId: string) => void;
  onHarvest: (territoryId: string) => void;
}

const TerritoryUpgradeModal = ({
  territory,
  playerResources,
  open,
  onClose,
  onUpgrade,
  onHarvest
}: TerritoryUpgradeModalProps) => {
  if (!territory) return null;

  const upgradeCost = getUpgradeCost(territory.level);
  const canUpgrade = canAffordUpgrade(playerResources, upgradeCost);
  const hoursElapsed = getHoursElapsed(territory.lastHarvest);
  const pendingResources = calculateTerritoryGeneration(territory, hoursElapsed);
  const hasPendingResources = pendingResources.credits > 0 || pendingResources.materials > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Territory Management</span>
            <span className="text-sm text-muted-foreground">Level {territory.level}</span>
          </DialogTitle>
          <DialogDescription>
            Upgrade your territory to increase resource production
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Pending Resources */}
          {hasPendingResources && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Resources Ready</span>
                <span className="text-xs text-muted-foreground">
                  {Math.floor(hoursElapsed)}h ago
                </span>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-500">
                    +{pendingResources.credits}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-500">
                    +{pendingResources.materials}
                  </span>
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => {
                  onHarvest(territory.id);
                  onClose();
                }}
              >
                Collect Resources
              </Button>
            </div>
          )}

          {/* Territory Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Production/Hour</div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-semibold">{territory.level * 10}</span>
              </div>
            </div>
            <div className="bg-card border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Defense Rating</div>
              <div className="font-semibold">{territory.defenseRating}</div>
            </div>
          </div>

          {/* Upgrade Section */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Upgrade to Level {territory.level + 1}</span>
              <ArrowUp className="h-4 w-4 text-primary" />
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="text-xs text-muted-foreground mb-2">Upgrade Cost:</div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold">{upgradeCost.credits}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold">{upgradeCost.materials}</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!canUpgrade}
              onClick={() => {
                onUpgrade(territory.id);
                onClose();
              }}
            >
              {canUpgrade ? 'Upgrade Territory' : 'Insufficient Resources'}
            </Button>
          </div>

          {/* Current Resources */}
          <div className="border-t pt-3">
            <div className="text-xs text-muted-foreground mb-2">Your Resources:</div>
            <ResourceDisplay resources={playerResources} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TerritoryUpgradeModal;
