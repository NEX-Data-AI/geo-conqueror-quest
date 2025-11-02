import { Layers, Eye, EyeOff, Trash2, ChevronUp, ChevronDown, Edit2, Check, X as XIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { GISLayer } from '@/types/gis';
import { useState } from 'react';
import StyleEditor from './StyleEditor';

interface LegendProps {
  layers: GISLayer[];
  selectedLayer: string | null;
  activeLayer: string | null;
  onLayerSelect: (id: string) => void;
  onActiveLayerChange: (id: string | null) => void;
  onLayersChange: (layers: GISLayer[]) => void;
}

const Legend = ({ layers, selectedLayer, activeLayer, onLayerSelect, onActiveLayerChange, onLayersChange }: LegendProps) => {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [editingStyleLayer, setEditingStyleLayer] = useState<GISLayer | null>(null);

  const toggleVisibility = (id: string) => {
    onLayersChange(layers.map(l => 
      l.id === id ? { ...l, visible: !l.visible } : l
    ));
  };

  const toggleSelectable = (id: string) => {
    onLayersChange(layers.map(l => 
      l.id === id ? { ...l, selectable: l.selectable === false ? true : false } : l
    ));
  };

  const deleteLayer = (id: string) => {
    onLayersChange(layers.filter(l => l.id !== id));
    if (selectedLayer === id) onLayerSelect('');
    if (activeLayer === id) onActiveLayerChange(null);
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

  const handleStyleUpdate = (updatedLayer: GISLayer) => {
    onLayersChange(layers.map(l => l.id === updatedLayer.id ? updatedLayer : l));
    setEditingStyleLayer(updatedLayer);
  };

  const startEditName = (id: string, currentName: string) => {
    setEditingName(id);
    setEditNameValue(currentName);
  };

  const saveLayerName = (id: string) => {
    if (editNameValue.trim()) {
      onLayersChange(layers.map(l => 
        l.id === id ? { ...l, name: editNameValue.trim() } : l
      ));
    }
    setEditingName(null);
  };

  return (
    <div className="w-80 border-r bg-card flex flex-col">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-lg">Legend</h2>
        </div>
      </div>

      <ScrollArea className="flex-1 h-0">
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
                  activeLayer === layer.id
                    ? 'bg-primary/20 border-primary ring-2 ring-primary/30'
                    : selectedLayer === layer.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card hover:bg-muted/50'
                }`}
                onClick={() => {
                  onLayerSelect(layer.id);
                  onActiveLayerChange(layer.id);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 flex-shrink-0"
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
                    
                    {editingName === layer.id ? (
                      <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveLayerName(layer.id);
                            if (e.key === 'Escape') setEditingName(null);
                          }}
                          className="h-7 text-sm"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => saveLayerName(layer.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setEditingName(null)}
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="font-medium text-sm truncate flex-1">{layer.name}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditName(layer.id, layer.name);
                      }}
                      title="Rename layer"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(layer.id, 'up');
                      }}
                      title="Move up"
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
                      title="Move down"
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
                      title="Delete layer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Selectable Control & Edit Button */}
                <div className="flex items-center gap-2 mt-2 mb-2">
                  <div 
                    className="flex items-center gap-2 cursor-pointer flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectable(layer.id);
                    }}
                  >
                    <Checkbox 
                      checked={layer.selectable !== false}
                      onCheckedChange={() => toggleSelectable(layer.id)}
                    />
                    <span className="text-xs text-muted-foreground">Selectable</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingStyleLayer(layer);
                    }}
                  >
                    <Settings className="h-3 w-3" />
                    <span className="text-xs">Edit</span>
                  </Button>
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

      <StyleEditor
        layer={editingStyleLayer}
        open={!!editingStyleLayer}
        onClose={() => setEditingStyleLayer(null)}
        onUpdate={handleStyleUpdate}
      />
    </div>
  );
};

export default Legend;
