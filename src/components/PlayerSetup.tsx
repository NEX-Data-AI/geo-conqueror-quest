import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerData } from '@/hooks/usePlayerData';

interface PlayerSetupProps {
  onComplete: (player: PlayerData) => void;
}

const PlayerSetup = ({ onComplete }: PlayerSetupProps) => {
  const [codename, setCodename] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codename.trim()) return;

    const newPlayer: PlayerData = {
      codename: codename.trim(),
      level: 1,
      xp: 0,
      reputation: 0,
      homeBase: null,
      createdAt: new Date().toISOString()
    };

    onComplete(newPlayer);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Welcome to GeoQuest</CardTitle>
          <CardDescription className="text-center">
            Choose your codename to begin your conquest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codename">Codename</Label>
              <Input
                id="codename"
                placeholder="Enter your player name"
                value={codename}
                onChange={(e) => setCodename(e.target.value)}
                maxLength={20}
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be your identity in the game
              </p>
            </div>
            <Button type="submit" className="w-full" size="lg">
              Start Your Quest
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerSetup;
