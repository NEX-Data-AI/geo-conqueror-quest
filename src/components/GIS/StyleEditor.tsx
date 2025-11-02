import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { GISLayer } from '@/types/gis';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StyleEditorProps {
  layer: GISLayer | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (layer: GISLayer) => void;
}

const StyleEditor = ({ layer, open, onClose, onUpdate }: StyleEditorProps) => {
  if (!layer) return null;

  const updateStyle = (styleUpdates: Partial<GISLayer['style']>) => {
    onUpdate({
      ...layer,
      style: { ...layer.style, ...styleUpdates }
    });
  };

  const pointShapes = [
    { value: 'circle', label: 'Circle' },
    { value: 'square', label: 'Square' },
    { value: 'triangle', label: 'Triangle' },
    { value: 'star', label: 'Star' },
    { value: 'diamond', label: 'Diamond' }
  ];

  const fillPatterns = [
    { value: 'solid', label: 'Solid' },
    { value: 'hatch', label: 'Hatched' },
    { value: 'dots', label: 'Dots' },
    { value: 'grid', label: 'Grid' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Edit Layer Style: {layer.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Point Features */}
          {layer.type === 'point' && (
            <>
              <div className="space-y-2">
                <Label>Shape</Label>
                <Select 
                  value={layer.style?.shape || 'circle'} 
                  onValueChange={(value) => updateStyle({ shape: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-2 z-[1000]">
                    {pointShapes.map(shape => (
                      <SelectItem key={shape.value} value={shape.value}>
                        {shape.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Size</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[layer.style?.weight || 6]}
                    min={4}
                    max={30}
                    step={1}
                    onValueChange={(value) => updateStyle({ weight: value[0] })}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">{layer.style?.weight || 6}px</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fill Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={layer.style?.fillColor || '#3b82f6'}
                    onChange={(e) => updateStyle({ fillColor: e.target.value })}
                    className="h-10 w-20 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={layer.style?.fillColor || '#3b82f6'}
                    onChange={(e) => updateStyle({ fillColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stroke Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={layer.style?.color || '#3b82f6'}
                    onChange={(e) => updateStyle({ color: e.target.value })}
                    className="h-10 w-20 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={layer.style?.color || '#3b82f6'}
                    onChange={(e) => updateStyle({ color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </>
          )}

          {/* Line Features */}
          {layer.type === 'line' && (
            <>
              <div className="space-y-2">
                <Label>Line Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={layer.style?.color || '#3b82f6'}
                    onChange={(e) => updateStyle({ color: e.target.value })}
                    className="h-10 w-20 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={layer.style?.color || '#3b82f6'}
                    onChange={(e) => updateStyle({ color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Line Width</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[layer.style?.weight || 2]}
                    min={1}
                    max={15}
                    step={1}
                    onValueChange={(value) => updateStyle({ weight: value[0] })}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">{layer.style?.weight || 2}px</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Opacity</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[layer.opacity * 100]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => onUpdate({ ...layer, opacity: value[0] / 100 })}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">{Math.round(layer.opacity * 100)}%</span>
                </div>
              </div>
            </>
          )}

          {/* Polygon Features */}
          {layer.type === 'polygon' && (
            <>
              <div className="space-y-2">
                <Label>Fill Pattern</Label>
                <Select 
                  value={layer.style?.fillPattern || 'solid'} 
                  onValueChange={(value) => updateStyle({ fillPattern: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-2 z-[1000]">
                    {fillPatterns.map(pattern => (
                      <SelectItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fill Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={layer.style?.fillColor || '#3b82f6'}
                    onChange={(e) => updateStyle({ fillColor: e.target.value })}
                    className="h-10 w-20 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={layer.style?.fillColor || '#3b82f6'}
                    onChange={(e) => updateStyle({ fillColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fill Opacity</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[(layer.style?.fillOpacity || 0.3) * 100]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => updateStyle({ fillOpacity: value[0] / 100 })}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">{Math.round((layer.style?.fillOpacity || 0.3) * 100)}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={layer.style?.color || '#3b82f6'}
                    onChange={(e) => updateStyle({ color: e.target.value })}
                    className="h-10 w-20 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={layer.style?.color || '#3b82f6'}
                    onChange={(e) => updateStyle({ color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Border Width</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[layer.style?.weight || 2]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => updateStyle({ weight: value[0] })}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">{layer.style?.weight || 2}px</span>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StyleEditor;
