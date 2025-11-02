import { Layers, Eye, EyeOff, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GISLayer } from '@/types/gis';

interface LayerPanelProps {
  layers: GISLayer[];
  selectedLayer: string | null;
  onLayerSelect: (id: string) => void;
  onLayersChange: (layers: GISLayer[]) => void;
}

const LayerPanel = ({ layers, selectedLayer, onLayerSelect, onLayersChange }: LayerPanelProps) => {
  const toggleVisibility = (id: string) => {
    onLayersChange(layers.map(l => 
      l.id === id ? { ...l, visible: !l.visible } : l
    ));
  };

  const deleteLayer = (id: string) => {
    onLayersChange(layers.filter(l => l.id !== id));
    if (selectedLayer === id) onLayerSelect('');
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(l => l.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === layers.length - 1) return;

    const newLayers = [...layers];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
    onLayersChange(newLayers);
  };

  const updateOpacity = (id: string, opacity: number) => {
    onLayersChange(layers.map(l => 
      l.id === id ? { ...l, opacity } : l
    ));
  };

  return (
    <div className="w-80 border-r bg-card flex flex-col">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-lg">Layers</h2>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {layers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No layers yet. Import data to get started.
            </div>
          ) : (
            layers.map((layer) => (
              <div
                key={layer.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedLayer === layer.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card hover:bg-muted/50'
                }`}
                onClick={() => onLayerSelect(layer.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(layer.id);
                      }}
                    >
                      {layer.visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <span className="font-medium text-sm truncate">{layer.name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(layer.id, 'up');
                      }}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(layer.id, 'down');
                      }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(layer.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Opacity</span>
                  <Slider
                    value={[layer.opacity * 100]}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                    onValueChange={(value) => updateOpacity(layer.id, value[0] / 100)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-xs w-10 text-right">{Math.round(layer.opacity * 100)}%</span>
                </div>

                <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                  <span className="capitalize">{layer.type}</span>
                  <span>•</span>
                  <span>{layer.data.features.length} features</span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default LayerPanel;
