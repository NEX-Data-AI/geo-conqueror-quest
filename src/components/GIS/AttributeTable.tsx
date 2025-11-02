import { useState } from 'react';
import { X, Save, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GISLayer } from '@/types/gis';
import { toast } from '@/hooks/use-toast';

interface AttributeTableProps {
  layer: GISLayer | null;
  onClose: () => void;
  onUpdate: (layer: GISLayer) => void;
}

const AttributeTable = ({ layer, onClose, onUpdate }: AttributeTableProps) => {
  const [editingCell, setEditingCell] = useState<{ featureIndex: number; property: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!layer) return null;

  const features = layer.data.features;
  const allProperties = new Set<string>();
  features.forEach(f => {
    Object.keys(f.properties || {}).forEach(key => allProperties.add(key));
  });
  const propertyKeys = Array.from(allProperties);

  const startEdit = (featureIndex: number, property: string, currentValue: any) => {
    setEditingCell({ featureIndex, property });
    setEditValue(String(currentValue || ''));
  };

  const saveEdit = () => {
    if (!editingCell) return;

    const updatedFeatures = [...features];
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

  const deleteFeature = (index: number) => {
    const updatedFeatures = features.filter((_, i) => i !== index);
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

  return (
    <div className="h-80 border-t bg-card flex flex-col">
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <h3 className="font-bold">{layer.name} - Attributes</h3>
          <span className="text-sm text-muted-foreground">
            {features.length} feature{features.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

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
            {features.map((feature, featureIndex) => (
              <tr key={featureIndex} className="border-b hover:bg-muted/50">
                <td className="p-2 text-muted-foreground">{featureIndex + 1}</td>
                {propertyKeys.map(property => {
                  const value = feature.properties?.[property];
                  const isEditing = editingCell?.featureIndex === featureIndex && 
                                  editingCell?.property === property;

                  return (
                    <td
                      key={property}
                      className="p-2 cursor-pointer hover:bg-muted/30"
                      onClick={() => !isEditing && startEdit(featureIndex, property, value)}
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
                    onClick={() => deleteFeature(featureIndex)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
};

export default AttributeTable;
