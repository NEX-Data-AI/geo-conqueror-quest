import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerData } from '@/hooks/usePlayerData';
import { Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PlayerSetupProps {
  onComplete: (player: PlayerData) => void;
}

const AVATAR_PRESETS = ['👤', '🎮', '⚔️', '🛡️', '🗺️', '🏰', '⚡', '🔥', '💎', '👑', '🦅', '🐉', '🦊', '🐺', '🦁', '🐯'];

const PlayerSetup = ({ onComplete }: PlayerSetupProps) => {
  const [codename, setCodename] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codename.trim()) return;

    const newPlayer: PlayerData = {
      codename: codename.trim(),
      avatar: customAvatar || selectedAvatar,
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
            Create your player profile to begin your conquest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Selection */}
            <div className="space-y-3">
              <Label>Choose Your Avatar</Label>
              <div className="flex items-center justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-5xl border-4 border-primary/20 overflow-hidden">
                  {customAvatar ? (
                    <img src={customAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedAvatar}</span>
                  )}
                </div>
              </div>
              
              {/* Preset Icons */}
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_PRESETS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(emoji);
                      setCustomAvatar(null);
                    }}
                    className={`aspect-square rounded-lg border-2 text-2xl hover:bg-primary/10 transition-colors ${
                      selectedAvatar === emoji && !customAvatar
                        ? 'border-primary bg-primary/20'
                        : 'border-border'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Upload Custom Image */}
              <div className="pt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Custom Image
                </Button>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  Max 2MB • JPG, PNG, or GIF
                </p>
              </div>
            </div>

            {/* Codename Input */}
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
