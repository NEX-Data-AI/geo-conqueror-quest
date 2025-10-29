import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Target, Zap } from "lucide-react";

interface Node {
  id: number;
  x: number;
  y: number;
  isStart?: boolean;
  isEnd?: boolean;
  connectedTo: number[]; // Adjacent nodes
}

const MiniGameDemo = () => {
  const [gameState, setGameState] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [selectedPath, setSelectedPath] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);

  // Define nodes with adjacency information
  const nodes: Node[] = [
    { id: 1, x: 20, y: 20, isStart: true, connectedTo: [2, 3] },
    { id: 2, x: 50, y: 30, connectedTo: [1, 3, 4] },
    { id: 3, x: 35, y: 60, connectedTo: [1, 2, 5] },
    { id: 4, x: 65, y: 50, connectedTo: [2, 5] },
    { id: 5, x: 80, y: 80, isEnd: true, connectedTo: [3, 4] },
  ];

  const correctPath = [1, 2, 4, 5]; // Shortest path

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "playing" && timeLeft === 0) {
      setGameState("lost");
    }
  }, [gameState, timeLeft]);

  const startGame = () => {
    console.log("Starting game...");
    setGameState("playing");
    setSelectedPath([1]); // Start at node 1
    setTimeLeft(30);
    setScore(0);
  };

  const selectNode = (nodeId: number) => {
    console.log("Node clicked:", nodeId, "Game state:", gameState, "Current path:", selectedPath);
    
    if (gameState !== "playing") {
      console.log("Game not in playing state");
      return;
    }
    
    if (selectedPath.includes(nodeId)) {
      console.log("Node already selected");
      return;
    }

    // Check if this node is connected to the last node in path
    const lastNodeId = selectedPath[selectedPath.length - 1];
    const lastNode = nodes.find(n => n.id === lastNodeId);
    
    if (!lastNode?.connectedTo.includes(nodeId)) {
      console.log("Node not connected to last node in path");
      return; // Can't select this node - not adjacent
    }

    const newPath = [...selectedPath, nodeId];
    setSelectedPath(newPath);
    console.log("New path:", newPath);

    // Check if reached the end
    if (nodeId === 5) {
      const isCorrect = JSON.stringify(newPath) === JSON.stringify(correctPath);
      console.log("Reached end! Correct path?", isCorrect);
      if (isCorrect) {
        setScore(100 + timeLeft * 10);
        setGameState("won");
      } else {
        setGameState("lost");
      }
    }
  };

  return (
    <section id="minigame" className="py-20 px-4 bg-gradient-to-b from-adventure-blue/20 to-background">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" />
            Interactive Demo
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-primary to-treasure-gold-dark bg-clip-text text-transparent">
              Route Rush Mini-Game
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect nodes in the shortest path before time runs out. Master mini-games to unlock legendary loot!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Game Canvas */}
          <Card className="p-8 bg-card border-2 border-border">
            <div className="relative aspect-square bg-background/50 rounded-lg border border-border overflow-hidden">
              {/* SVG Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {selectedPath.map((nodeId, idx) => {
                  if (idx === 0) return null;
                  const prevNode = nodes.find(n => n.id === selectedPath[idx - 1])!;
                  const currNode = nodes.find(n => n.id === nodeId)!;
                  return (
                    <line
                      key={`${prevNode.id}-${currNode.id}`}
                      x1={`${prevNode.x}%`}
                      y1={`${prevNode.y}%`}
                      x2={`${currNode.x}%`}
                      y2={`${currNode.y}%`}
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      className="animate-draw-line"
                    />
                  );
                })}
              </svg>

              {/* Nodes */}
              {nodes.map((node) => {
                const isSelected = selectedPath.includes(node.id);
                const lastNodeId = selectedPath[selectedPath.length - 1];
                const lastNode = nodes.find(n => n.id === lastNodeId);
                const isClickable = gameState === "playing" && 
                                  !isSelected && 
                                  lastNode?.connectedTo.includes(node.id);
                const isCurrentNode = lastNodeId === node.id;
                
                return (
                  <button
                    key={node.id}
                    onClick={() => selectNode(node.id)}
                    disabled={gameState !== "playing" || isSelected || !isClickable}
                    className={`absolute w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                      node.isStart
                        ? "bg-secondary text-secondary-foreground shadow-glow scale-110 ring-4 ring-secondary/30"
                        : node.isEnd
                        ? "bg-primary text-primary-foreground shadow-glow scale-110 ring-4 ring-primary/30"
                        : isSelected
                        ? "bg-primary/80 text-primary-foreground scale-105"
                        : isCurrentNode
                        ? "bg-primary text-primary-foreground scale-110 ring-4 ring-primary/50"
                        : isClickable
                        ? "bg-card border-2 border-primary hover:scale-110 hover:bg-primary/20 cursor-pointer"
                        : "bg-card border-2 border-border opacity-50 cursor-not-allowed"
                    }`}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    {node.isStart ? <Target className="w-5 h-5" /> : node.isEnd ? <Trophy className="w-5 h-5" /> : node.id}
                  </button>
                );
              })}
            </div>

            {/* Timer & Score */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-2xl font-bold">
                <span className="text-muted-foreground text-sm">Time: </span>
                <span className={timeLeft < 10 ? "text-destructive animate-pulse" : "text-foreground"}>
                  {timeLeft}s
                </span>
              </div>
              <div className="text-2xl font-bold">
                <span className="text-muted-foreground text-sm">Score: </span>
                <span className="text-primary">{score}</span>
              </div>
            </div>
          </Card>

          {/* Instructions & Status */}
          <div className="space-y-6">
            {gameState === "idle" && (
              <Card className="p-6 bg-card border-2 border-border">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  How to Play
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    Start at the green node (marked with target icon)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    Click nodes to create a path to the golden trophy
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    Find the shortest route before time runs out
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.</span>
                    Faster completion = Higher score!
                  </li>
                </ul>
                <Button onClick={startGame} size="lg" variant="hero" className="w-full mt-6">
                  Start Game
                </Button>
              </Card>
            )}

            {gameState === "playing" && (
              <Card className="p-6 bg-card border-2 border-primary/30 animate-pulse-border">
                <h3 className="text-xl font-bold mb-2">Navigate to Victory!</h3>
                <p className="text-muted-foreground">
                  Find the shortest path from start (green) to finish (gold). Every second counts!
                </p>
                <div className="mt-4 flex gap-2">
                  {selectedPath.map(id => (
                    <span key={id} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
                      {id}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {gameState === "won" && (
              <Card className="p-6 bg-gradient-to-br from-primary/20 to-treasure-gold-dark/20 border-2 border-primary">
                <div className="text-center">
                  <Trophy className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
                  <h3 className="text-3xl font-black text-primary mb-2">Victory!</h3>
                  <p className="text-xl font-bold mb-4">Score: {score}</p>
                  <p className="text-muted-foreground mb-6">
                    Perfect route! In GeoQuest, this would unlock legendary loot.
                  </p>
                  <Button onClick={startGame} variant="hero" className="w-full">
                    Play Again
                  </Button>
                </div>
              </Card>
            )}

            {gameState === "lost" && (
              <Card className="p-6 bg-destructive/10 border-2 border-destructive/50">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-destructive mb-2">Game Over</h3>
                  <p className="text-muted-foreground mb-6">
                    {timeLeft === 0 ? "Time's up!" : "Wrong path! Try finding a shorter route."}
                  </p>
                  <Button onClick={startGame} variant="outline" className="w-full">
                    Try Again
                  </Button>
                </div>
              </Card>
            )}

            {/* Mini-Game Context */}
            <Card className="p-6 bg-muted/30 border border-border">
              <h4 className="font-bold mb-2 text-sm uppercase tracking-wide text-muted-foreground">In GeoQuest</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Mini-games like Route Rush unlock caches, defend territory, and earn rare resources. 
                Each game type tests different skills - pathfinding, spatial awareness, timing, and strategy.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiniGameDemo;
