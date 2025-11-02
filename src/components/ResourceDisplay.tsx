import { Resources } from '@/types/game';
import { Coins, Wrench, Zap } from 'lucide-react';

interface ResourceDisplayProps {
  resources: Resources;
  className?: string;
}

const ResourceDisplay = ({ resources, className = '' }: ResourceDisplayProps) => {
  return (
    <div className={`flex gap-4 ${className}`}>
      <div className="flex items-center gap-1.5 bg-amber-500/20 px-3 py-1.5 rounded-full border border-amber-500/30">
        <Coins className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-semibold text-amber-500">{resources.credits}</span>
      </div>
      <div className="flex items-center gap-1.5 bg-blue-500/20 px-3 py-1.5 rounded-full border border-blue-500/30">
        <Wrench className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-semibold text-blue-500">{resources.materials}</span>
      </div>
      <div className="flex items-center gap-1.5 bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-500/30">
        <Zap className="h-4 w-4 text-purple-500" />
        <span className="text-sm font-semibold text-purple-500">{resources.energy}</span>
      </div>
    </div>
  );
};

export default ResourceDisplay;
