import { Layers, Eye, EyeOff, Trash2, ChevronUp, ChevronDown, Palette, Edit2, Check, X as XIcon, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { GISLayer } from '@/types/gis';
import { useState } from 'react';

interface LegendProps {
  layers: GISLayer[];
  selectedLayer: string | null;
  activeLayer: string | null;
  onLayerSelect: (id: string) => void;
  onActiveLayerChange: (id: string | null) => void;
  onLayersChange: (layers: GISLayer[]) => void;
}

const Legend = ({ layers, selectedLayer, activeLayer, onLayerSelect, onActiveLayerChange, onLayersChange }: LegendProps) => {
  const [styleOpen, setStyleOpen] = useState<Record<string, boolean>>({});
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');

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

  const updateStyle = (id: string, styleUpdates: Partial<GISLayer['style']>) => {
    onLayersChange(layers.map(l => 
      l.id === id ? { ...l, style: { ...l.style, ...styleUpdates } } : l
    ));
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
                className={`p-3 rounded-lg border transition-colors ${
                  activeLayer === layer.id
                    ? 'bg-primary/20 border-primary ring-2 ring-primary/30'
                    : selectedLayer === layer.id
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
                      <>
                        <span className="font-medium text-sm truncate flex-1">{layer.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditName(layer.id, layer.name);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
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

                {/* Active Layer & Selectable Controls */}
                <div className="flex items-center gap-3 mt-2 mb-2">
                  <Button
                    variant={activeLayer === layer.id ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onActiveLayerChange(activeLayer === layer.id ? null : layer.id);
                    }}
                  >
                    {activeLayer === layer.id ? 'Active Layer' : 'Set Active'}
                  </Button>
                  
                  <div 
                    className="flex items-center gap-2 cursor-pointer"
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

                {/* Style Controls */}
                {selectedLayer === layer.id && (
                  <Collapsible
                    open={styleOpen[layer.id]}
                    onOpenChange={(open) => setStyleOpen({ ...styleOpen, [layer.id]: open })}
                    className="mt-3"
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Palette className="h-4 w-4 mr-2" />
                        Style
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-3 p-3 bg-muted/30 rounded border">
                      {/* Fill Color */}
                      <div className="space-y-1">
                        <Label htmlFor={`fill-${layer.id}`} className="text-xs">Fill Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id={`fill-${layer.id}`}
                            type="color"
                            value={layer.style?.fillColor || '#3b82f6'}
                            onChange={(e) => updateStyle(layer.id, { fillColor: e.target.value })}
                            className="h-8 w-16 p-1 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Input
                            type="text"
                            value={layer.style?.fillColor || '#3b82f6'}
                            onChange={(e) => updateStyle(layer.id, { fillColor: e.target.value })}
                            className="h-8 text-xs flex-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Stroke Color */}
                      <div className="space-y-1">
                        <Label htmlFor={`stroke-${layer.id}`} className="text-xs">
                          {layer.type === 'point' ? 'Stroke Color' : 'Border Color'}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`stroke-${layer.id}`}
                            type="color"
                            value={layer.style?.color || '#3b82f6'}
                            onChange={(e) => updateStyle(layer.id, { color: e.target.value })}
                            className="h-8 w-16 p-1 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Input
                            type="text"
                            value={layer.style?.color || '#3b82f6'}
                            onChange={(e) => updateStyle(layer.id, { color: e.target.value })}
                            className="h-8 text-xs flex-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Weight/Size */}
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {layer.type === 'point' ? 'Point Size' : 
                           layer.type === 'line' ? 'Line Width' : 'Border Width'}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[layer.style?.weight || (layer.type === 'point' ? 6 : 2)]}
                            min={1}
                            max={layer.type === 'point' ? 20 : 10}
                            step={1}
                            className="flex-1"
                            onValueChange={(value) => updateStyle(layer.id, { weight: value[0] })}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-xs w-8 text-right">
                            {layer.style?.weight || (layer.type === 'point' ? 6 : 2)}
                          </span>
                        </div>
                      </div>

                      {/* Fill Opacity (for polygons) */}
                      {layer.type === 'polygon' && (
                        <div className="space-y-1">
                          <Label className="text-xs">Fill Opacity</Label>
                          <div className="flex items-center gap-2">
                            <Slider
                              value={[(layer.style?.fillOpacity || 0.3) * 100]}
                              min={0}
                              max={100}
                              step={5}
                              className="flex-1"
                              onValueChange={(value) => updateStyle(layer.id, { fillOpacity: value[0] / 100 })}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-xs w-10 text-right">
                              {Math.round((layer.style?.fillOpacity || 0.3) * 100)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Legend;
