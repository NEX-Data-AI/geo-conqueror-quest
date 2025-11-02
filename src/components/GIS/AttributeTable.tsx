import { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GISLayer } from '@/types/gis';
import { toast } from '@/hooks/use-toast';

interface AttributeTableProps {
  layers: GISLayer[];
  selectedFeatures: Map<string, number[]>;
  onClose: () => void;
  onUpdate: (layer: GISLayer) => void;
}

const AttributeTable = ({ layers, selectedFeatures, onClose, onUpdate }: AttributeTableProps) => {
  const [editingCell, setEditingCell] = useState<{ layerId: string; featureIndex: number; property: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [filterMode, setFilterMode] = useState<Map<string, 'all' | 'selected'>>(new Map());

  const layersWithSelection = layers.filter(l => selectedFeatures.has(l.id) && selectedFeatures.get(l.id)!.length > 0);
  const displayLayers = layersWithSelection.length > 0 ? layersWithSelection : layers;

  const getFilterMode = (layerId: string) => filterMode.get(layerId) || 'selected';
  const setLayerFilterMode = (layerId: string, mode: 'all' | 'selected') => {
    const newMap = new Map(filterMode);
    newMap.set(layerId, mode);
    setFilterMode(newMap);
  };

  const startEdit = (layerId: string, featureIndex: number, property: string, currentValue: any) => {
    setEditingCell({ layerId, featureIndex, property });
    setEditValue(String(currentValue || ''));
  };

  const saveEdit = () => {
    if (!editingCell) return;

    const layer = layers.find(l => l.id === editingCell.layerId);
    if (!layer) return;

    const updatedFeatures = [...layer.data.features];
    updatedFeatures[editingCell.featureIndex] = {
      ...updatedFeatures[editingCell.featureIndex],
      properties: {
        ...updatedFeatures[editingCell.featureIndex].properties,
        [editingCell.property]: editValue
      }
    };

    onUpdate({
      ...layer,
      data: {
        ...layer.data,
        features: updatedFeatures
      }
    });

    setEditingCell(null);
    toast({
      title: "Attribute Updated",
      description: "Feature attribute saved successfully"
    });
  };

  const deleteFeature = (layerId: string, index: number) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    const updatedFeatures = layer.data.features.filter((_, i) => i !== index);
    onUpdate({
      ...layer,
      data: {
        ...layer.data,
        features: updatedFeatures
      }
    });
    toast({
      title: "Feature Deleted",
      description: "Feature removed from layer"
    });
  };

  const renderLayerTable = (layer: GISLayer) => {
    const selectedIndices = selectedFeatures.get(layer.id) || [];
    const currentFilterMode = getFilterMode(layer.id);
    const features = currentFilterMode === 'selected' && selectedIndices.length > 0
      ? layer.data.features.filter((_, i) => selectedIndices.includes(i))
      : layer.data.features;

    const allProperties = new Set<string>();
    features.forEach(f => {
      Object.keys(f.properties || {}).forEach(key => allProperties.add(key));
    });
    const propertyKeys = Array.from(allProperties);

    return (
      <ScrollArea className="flex-1">
        <table className="w-full text-sm">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="p-2 text-left font-medium w-12">#</th>
              {propertyKeys.map(key => (
                <th key={key} className="p-2 text-left font-medium min-w-32">
                  {key}
                </th>
              ))}
              <th className="p-2 text-left font-medium w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, idx) => {
              const currentFilterMode = getFilterMode(layer.id);
              const originalIndex = currentFilterMode === 'selected' 
                ? layer.data.features.indexOf(feature)
                : idx;

              return (
                <tr key={originalIndex} className="border-b hover:bg-muted/50">
                  <td className="p-2 text-muted-foreground">{originalIndex + 1}</td>
                  {propertyKeys.map(property => {
                    const value = feature.properties?.[property];
                    const isEditing = editingCell?.layerId === layer.id &&
                                    editingCell?.featureIndex === originalIndex && 
                                    editingCell?.property === property;

                    return (
                      <td
                        key={property}
                        className="p-2 cursor-pointer hover:bg-muted/30"
                        onClick={() => !isEditing && startEdit(layer.id, originalIndex, property, value)}
                      >
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              className="h-7 text-sm"
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={saveEdit}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span>{value !== null && value !== undefined ? String(value) : '-'}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => deleteFeature(layer.id, originalIndex)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollArea>
    );
  };

  return (
    <div className="h-full border-t bg-card flex flex-col">
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <h3 className="font-bold">Attributes</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {displayLayers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          No features available
        </div>
      ) : displayLayers.length === 1 ? (
        <div className="flex-1 flex flex-col">
          <div className="p-2 border-b flex items-center justify-between bg-muted/30">
            <span className="text-sm font-medium">{displayLayers[0].name}</span>
            <Tabs 
              value={getFilterMode(displayLayers[0].id)} 
              onValueChange={(v) => setLayerFilterMode(displayLayers[0].id, v as 'all' | 'selected')}
            >
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs">All Features</TabsTrigger>
                <TabsTrigger value="selected" className="text-xs">Selected Only</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {renderLayerTable(displayLayers[0])}
        </div>
      ) : (
        <Tabs defaultValue={displayLayers[0].id} className="flex-1 flex flex-col">
          <TabsList className="mx-3 mt-2">
            {displayLayers.map(layer => {
              const selectedIndices = selectedFeatures.get(layer.id) || [];
              const currentFilterMode = getFilterMode(layer.id);
              const count = currentFilterMode === 'selected' && selectedIndices.length > 0
                ? selectedIndices.length 
                : layer.data.features.length;
              return (
                <TabsTrigger key={layer.id} value={layer.id} className="text-xs">
                  {layer.name}
                  <span className="ml-2 text-muted-foreground">({count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {displayLayers.map(layer => (
            <TabsContent key={layer.id} value={layer.id} className="flex-1 flex flex-col mt-0">
              <div className="p-2 border-b flex justify-end bg-muted/30">
                <Tabs 
                  value={getFilterMode(layer.id)} 
                  onValueChange={(v) => setLayerFilterMode(layer.id, v as 'all' | 'selected')}
                >
                  <TabsList className="h-8">
                    <TabsTrigger value="all" className="text-xs">All Features</TabsTrigger>
                    <TabsTrigger value="selected" className="text-xs">Selected Only</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              {renderLayerTable(layer)}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default AttributeTable;
