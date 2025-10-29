import { Button } from "@/components/ui/button";
import { Compass, Map, Sword, Trophy } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-adventure-blue/20">
      {/* Animated compass background */}
      <div className="absolute inset-0 opacity-10">
        <Compass className="absolute top-20 left-10 w-32 h-32 animate-spin-slow text-primary" style={{ animationDuration: '30s' }} />
        <Map className="absolute bottom-20 right-20 w-40 h-40 text-secondary opacity-50" />
        <Sword className="absolute top-1/3 right-1/4 w-24 h-24 text-accent" />
      </div>

      <div className="container px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Title */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-treasure-gold-dark shadow-glow mb-4 animate-pulse-subtle">
              <Trophy className="w-12 h-12 text-primary-foreground" />
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-primary via-treasure-gold to-primary bg-clip-text text-transparent">
                GeoQuest
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-semibold">
              Claim Territory. Cache Treasures. Conquer the Map.
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
            <FeatureCard
              icon={<Map className="w-8 h-8" />}
              title="Draw Your Domain"
              description="Claim real-world territory with custom geofences"
            />
            <FeatureCard
              icon={<Trophy className="w-8 h-8" />}
              title="Hunt Treasures"
              description="Discover caches and craft legendary items"
            />
            <FeatureCard
              icon={<Sword className="w-8 h-8" />}
              title="Battle & Defend"
              description="Raid enemies and protect your empire"
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" variant="hero" className="text-lg px-8 py-6">
              Try Mini-Game Demo
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
              View Project Overview
            </Button>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 pt-8 text-sm text-muted-foreground">
            <div>
              <div className="text-2xl font-bold text-primary">Location-Based</div>
              <div>Real GIS Adventure</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">PvP + PvE</div>
              <div>Strategic Combat</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">Skill-Based</div>
              <div>Mini-Game Mastery</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="group p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default Hero;
