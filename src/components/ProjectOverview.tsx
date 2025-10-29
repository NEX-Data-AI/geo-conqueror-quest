import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Target, Zap, Shield, Coins } from "lucide-react";

const ProjectOverview = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-card">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-secondary to-emerald-dark bg-clip-text text-transparent">
              Project Overview
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Enhanced with strategic recommendations for retention, PvP balance, and technical excellence
          </p>
        </div>

        <Tabs defaultValue="vision" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="vision" className="py-3">Vision</TabsTrigger>
            <TabsTrigger value="systems" className="py-3">Core Systems</TabsTrigger>
            <TabsTrigger value="minigames" className="py-3">Mini-Games</TabsTrigger>
            <TabsTrigger value="tech" className="py-3">Tech Stack</TabsTrigger>
            <TabsTrigger value="roadmap" className="py-3">Roadmap</TabsTrigger>
          </TabsList>

          <TabsContent value="vision" className="space-y-6">
            <Card className="p-8 border-2 border-border">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                Vision & Core Pillars
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  <strong className="text-foreground">Vision:</strong> A location-based GIS adventure where players claim real-world territory, 
                  cache treasures, and battle to defend their map.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <PillarCard icon={<Target />} title="Territorial Mastery" description="Draw and own custom geofences with polygon tools (Play) or advanced GIS features (Pro)" />
                  <PillarCard icon={<Coins />} title="Treasure & Crafting" description="Hunt caches with rarity tiers, craft defenses from blueprints" />
                  <PillarCard icon={<Zap />} title="Skill-Based Mini-Games" description="30-90s challenges - Route Rush, Shape Trace, Signal Scan, Lockbreaker" />
                  <PillarCard icon={<Shield />} title="Balanced PvP & Alliances" description="Async raids with mini-game defense, alliance roles (Explorer/Engineer/Commander)" />
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-secondary/10 border-2 border-secondary/30">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                Key Enhancements (Incorporated Recommendations)
              </h3>
              <ul className="grid md:grid-cols-2 gap-3">
                <Enhancement text="Hybrid territory drawing: preset shapes for beginners, full polygon tools in Pro mode" />
                <Enhancement text="Smart raid windows: attacks queue during defender's active hours to reduce sleep-raid frustration" />
                <Enhancement text="NPC bandit camps in low-density areas solve cold-start problem" />
                <Enhancement text="Asymmetric alliance roles create strategic team composition" />
                <Enhancement text="Environmental storytelling: real POI data drives lore (churches → temples, parks → resource zones)" />
                <Enhancement text="Seasonal map transformations: ice walls in winter, desert water caches in summer" />
                <Enhancement text="Pro GIS unfair advantage: GPX export, advanced layers, heatmaps justify premium pricing" />
                <Enhancement text="Tile38 + PostGIS hybrid: Redis-based geofencing for real-time, PostgreSQL for persistence" />
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="systems" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SystemCard
                title="Territory & Geofences"
                items={[
                  "Player-drawn polygons or tile-based hexes",
                  "Capacity grows with Territory Level",
                  "Walls, Scanners, Traps with durability paths",
                  "Fog of War reveals via exploration or alliance intel",
                  "Hybrid UI: simple shapes for Play, advanced tools for Pro"
                ]}
              />
              <SystemCard
                title="Caches & Resources"
                items={[
                  "Types: Gold, Shards, Energy, Craft Mats, Blueprints, Keys",
                  "Rarities: Common → Legendary with biome-specific drop tables",
                  "Placement rules: distance limits, POI weighting, cooldowns",
                  "Dynamic spawn rates in rural areas for balance"
                ]}
              />
              <SystemCard
                title="Skills & Progression"
                items={[
                  "Trees: Exploration, Defense, Engineering, Recon",
                  "Account Level (global) + Territory Level (per base)",
                  "Alliance Reputation unlocks reinforcement items",
                  "Prestige paths at level 30 with cosmetic rewards"
                ]}
              />
              <SystemCard
                title="PvP & Defense (Enhanced)"
                items={[
                  "Raids: spend Keys/Energy, matchmade by level & proximity",
                  "Defense resolution: wall HP + mini-game skill checks",
                  "Smart raid windows during defender's active hours",
                  "Shield timer after battles (4-8 hours)",
                  "Alliance wars with opt-in seasonal factions"
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="minigames" className="space-y-6">
            <Card className="p-8 border-2 border-primary/30">
              <h3 className="text-2xl font-bold mb-6">Mini-Game Deep Dive (30-90 seconds each)</h3>
              <div className="space-y-6">
                <MiniGameDetail
                  name="Route Rush"
                  description="Connect nodes to find the shortest path under time pressure"
                  mechanics={[
                    "Graph traversal puzzle with 5-12 nodes depending on difficulty",
                    "Dijkstra's algorithm validation on backend",
                    "Difficulty scaling: more nodes, weighted edges (elevation costs), decoy paths",
                    "Scoring: base 100 points + (time_remaining × 10) - (moves_over_optimal × 15)",
                    "Used for: cache unlocking, scouting raids, alliance missions"
                  ]}
                  balancing="Easy: 5 nodes, 30s | Medium: 8 nodes, 45s | Hard: 12 nodes, 60s with obstacles"
                />
                <MiniGameDetail
                  name="Shape Trace"
                  description="Accurately trace polygon boundaries within tolerance threshold"
                  mechanics={[
                    "Draw path matching target shape (territory borders, geofence outlines)",
                    "Hausdorff distance algorithm measures accuracy",
                    "Difficulty scaling: complex polygons, smaller tolerance margin, moving target",
                    "Scoring: 100 × (1 - normalized_distance) with time bonus",
                    "Used for: territory expansion, wall construction, defensive perimeter setup"
                  ]}
                  balancing="Easy: 4-sided shape, 15% tolerance | Hard: 10+ sides, 5% tolerance, 45s limit"
                />
                <MiniGameDetail
                  name="Signal Scan"
                  description="Locate hidden hotspot using gradient-based 'warmer/colder' feedback"
                  mechanics={[
                    "Tap on grid to scan, receive distance hints (hotter = closer)",
                    "Euclidean distance calculation for feedback gradient",
                    "Difficulty scaling: larger grid, multiple decoy signals, interference zones",
                    "Scoring: 100 - (attempts × 8) + time_bonus",
                    "Used for: treasure hunting, enemy base detection, resource prospecting"
                  ]}
                  balancing="Easy: 5×5 grid, 10 attempts | Hard: 10×10 grid, 6 attempts, decoys"
                />
                <MiniGameDetail
                  name="Lockbreaker"
                  description="Rotate concentric rings to align glyphs/symbols"
                  mechanics={[
                    "3-5 rings with symbols that must align vertically",
                    "Touch controls with haptic feedback on partial matches",
                    "Difficulty scaling: more rings, rotation limits, timed pressure",
                    "Scoring: 100 - (moves × 5) with completion speed multiplier",
                    "Used for: raid initiation, legendary chest opening, vault hacking"
                  ]}
                  balancing="Easy: 3 rings, unlimited moves, 60s | Hard: 5 rings, 20 moves, 45s"
                />
              </div>
            </Card>

            <Card className="p-6 bg-accent/10 border-2 border-accent/30">
              <h4 className="font-bold mb-3">Difficulty Scaling System</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Player Level 1-10:</strong> Easy variants only, extended time limits, clear visual hints</li>
                <li>• <strong>Player Level 11-25:</strong> Medium variants unlock, combo challenges (2 mini-games in sequence)</li>
                <li>• <strong>Player Level 26+:</strong> Hard variants, competitive leaderboards, prestige modifiers</li>
                <li>• <strong>Cache Rarity Gating:</strong> Common = Easy, Rare = Medium, Epic = Hard, Legendary = Expert (combo)</li>
                <li>• <strong>Adaptive Difficulty:</strong> Win rate tracking adjusts spawn probability (target 60-70% success rate)</li>
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="tech" className="space-y-6">
            <Card className="p-8 border-2 border-border">
              <h3 className="text-2xl font-bold mb-6">Tech Stack (Optimized)</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-3 text-primary">Frontend</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><strong>Framework:</strong> React Native (Expo) - better MapLibre support</li>
                    <li><strong>Mapping:</strong> MapLibre GL + custom vector tiles (Tippecanoe)</li>
                    <li><strong>State:</strong> Zustand for game state, React Query for server sync</li>
                    <li><strong>UI:</strong> NativeWind (Tailwind for RN)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-3 text-secondary">Backend</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><strong>API:</strong> Node/NestJS (TypeScript consistency)</li>
                    <li><strong>Database:</strong> PostgreSQL + PostGIS (persistent territory/caches)</li>
                    <li><strong>Real-time:</strong> Tile38 (Redis-based) for live player positions</li>
                    <li><strong>Cache:</strong> Redis for sessions, matchmaking queues</li>
                    <li><strong>Storage:</strong> S3-compatible for assets (tiles, blueprints)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-3 text-accent">GIS Layer</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><strong>Vector Tiles:</strong> Tippecanoe → TileServer GL → CDN</li>
                    <li><strong>Geofencing:</strong> OS APIs + Tile38 for entry/exit events</li>
                    <li><strong>Validation:</strong> Server-side turf.js for territory polygons</li>
                    <li><strong>POI Data:</strong> OSM Overpass API for real-world landmarks</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-3 text-primary">Infrastructure</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><strong>Deploy:</strong> Docker + k8s (post-alpha), region sharding</li>
                    <li><strong>CDN:</strong> CloudFront/Cloudflare for tile delivery</li>
                    <li><strong>CI/CD:</strong> GitHub Actions for automated testing</li>
                    <li><strong>Anti-Cheat:</strong> Device attestation, speed heuristics</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-destructive/10 border-2 border-destructive/30">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Anti-Cheat Strategy
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Server-validated movement: max speed 30 km/h walking, 80 km/h driving mode</li>
                <li>• GPS spoof detection: iOS DeviceCheck, Android SafetyNet attestation</li>
                <li>• Action caps: max 3 caches/hour, 5 raids/day prevents bot farming</li>
                <li>• ML pattern detection (post-launch): identify teleport behavior, impossible movement</li>
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-6">
            <div className="space-y-4">
              <MilestoneCard
                phase="M1 - Prototype"
                weeks="Weeks 2-5"
                status="In Planning"
                deliverables={[
                  "Map view with MapLibre + basic basemap",
                  "Geofence drawing: preset shapes (circle/square) + simple polygon tool",
                  "Single cache placement with cooldown logic",
                  "Route Rush mini-game (5 nodes, easy difficulty)",
                  "Local save (AsyncStorage), no backend yet"
                ]}
              />
              <MilestoneCard
                phase="M2 - Alpha"
                weeks="Weeks 6-10"
                status="Pending M1"
                deliverables={[
                  "Backend: NestJS API + PostgreSQL + Tile38",
                  "Auth: Firebase/Supabase email/password",
                  "Persistent territories & caches in PostGIS",
                  "Skill tree v1 (Exploration + Defense tracks)",
                  "Async raids (attacker initiates, backend resolves)",
                  "Analytics: Mixpanel/PostHog event tracking"
                ]}
              />
              <MilestoneCard
                phase="M3 - Closed Beta"
                weeks="Weeks 11-16"
                status="Pending M2"
                deliverables={[
                  "All 4 mini-games with difficulty scaling",
                  "Alliance system with asymmetric roles (Explorer/Engineer/Commander)",
                  "Cosmetics store + Battle Pass v1",
                  "Rewarded ads integration (AdMob)",
                  "Anti-cheat v1: speed limits + device attestation",
                  "Weekend events (treasure rush, faction wars)"
                ]}
              />
              <MilestoneCard
                phase="M4 - Soft Launch"
                weeks="Weeks 17-22"
                status="Pending M3"
                deliverables={[
                  "Launch in 2 test regions (urban + rural)",
                  "LiveOps cadence: weekly quests, biweekly events",
                  "Tuning: drop rates, mini-game difficulty, economy balance",
                  "Pro GIS features: GPX export, layer customization",
                  "Leaderboards (regional + alliance)",
                  "Target: D1 ≥35%, D7 ≥12%, ARPDAU $0.08+"
                ]}
              />
              <MilestoneCard
                phase="M5 - Global"
                weeks="Week 23+"
                status="Post-Launch"
                deliverables={[
                  "Scale to 10+ regions with localization",
                  "Seasonal content plan (3-month cycles)",
                  "Advanced Pro features: custom heatmaps, field data collection",
                  "ML-based anti-cheat (pattern detection)",
                  "Community creator tools for custom quests"
                ]}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

const PillarCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex gap-3 p-4 rounded-lg bg-background border border-border">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-sm mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);

const Enhancement = ({ text }: { text: string }) => (
  <li className="flex items-start gap-2 text-sm">
    <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
    <span className="text-muted-foreground">{text}</span>
  </li>
);

const SystemCard = ({ title, items }: { title: string; items: string[] }) => (
  <Card className="p-6 border-2 border-border">
    <h4 className="font-bold mb-4 text-lg">{title}</h4>
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="text-primary">•</span>
          {item}
        </li>
      ))}
    </ul>
  </Card>
);

const MiniGameDetail = ({ name, description, mechanics, balancing }: { name: string; description: string; mechanics: string[]; balancing: string }) => (
  <div className="p-6 rounded-lg bg-background border-l-4 border-primary">
    <h4 className="font-bold text-lg mb-2">{name}</h4>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    <div className="space-y-2 mb-3">
      {mechanics.map((m, idx) => (
        <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
          <span className="text-secondary font-bold">▸</span>
          {m}
        </div>
      ))}
    </div>
    <div className="mt-3 pt-3 border-t border-border">
      <span className="text-xs font-semibold text-accent">Balancing: </span>
      <span className="text-xs text-muted-foreground">{balancing}</span>
    </div>
  </div>
);

const MilestoneCard = ({ phase, weeks, status, deliverables }: { phase: string; weeks: string; status: string; deliverables: string[] }) => (
  <Card className="p-6 border-2 border-border hover:border-primary/50 transition-colors">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h4 className="font-bold text-lg">{phase}</h4>
        <p className="text-sm text-muted-foreground">{weeks}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        status === "In Planning" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
      }`}>
        {status}
      </span>
    </div>
    <ul className="space-y-2">
      {deliverables.map((d, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          {d}
        </li>
      ))}
    </ul>
  </Card>
);

export default ProjectOverview;
