import { Upload, MousePointer, Circle, Minus, Square, Table, StickyNote, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { GISLayer } from '@/types/gis';
import { useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
// @ts-ignore
import shp from 'shpjs';

export type DrawingMode = {
  type: 'point' | 'line' | 'polygon' | 'select' | null;
  purpose: 'annotation' | 'feature';
  selectMode?: 'click' | 'polygon';
};

interface ToolbarProps {
  drawMode: DrawingMode;
  layers: GISLayer[];
  onDrawModeChange: (mode: DrawingMode) => void;
  onToggleAttributeTable: () => void;
  onImportData: (layers: GISLayer[]) => void;
}

const Toolbar = ({ drawMode, layers, onDrawModeChange, onToggleAttributeTable, onImportData }: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [pendingDrawType, setPendingDrawType] = useState<'point' | 'line' | 'polygon' | null>(null);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      for (const file of Array.from(files)) {
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (extension === 'geojson' || extension === 'json') {
          const text = await file.text();
          const geojson = JSON.parse(text);
          
          const layer: GISLayer = {
            id: `layer-${Date.now()}-${Math.random()}`,
            name: file.name.replace(/\.(geojson|json)$/i, ''),
            type: detectGeometryType(geojson),
            visible: true,
            opacity: 1,
            data: geojson,
            style: {
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.3,
              weight: 2
            }
          };
          
          onImportData([layer]);
          toast({
            title: "Layer Imported",
            description: `${layer.name} loaded successfully`
          });
        } else if (extension === 'zip') {
          // Shapefile (zipped)
          const arrayBuffer = await file.arrayBuffer();
          const geojson = await shp(arrayBuffer);
          
          const layer: GISLayer = {
            id: `layer-${Date.now()}-${Math.random()}`,
            name: file.name.replace('.zip', ''),
            type: detectGeometryType(geojson),
            visible: true,
            opacity: 1,
            data: geojson,
            style: {
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.3,
              weight: 2
            }
          };
          
          onImportData([layer]);
          toast({
            title: "Shapefile Imported",
            description: `${layer.name} loaded successfully`
          });
        } else {
          toast({
            title: "Unsupported Format",
            description: "Please upload GeoJSON (.geojson, .json) or Shapefile (.zip)",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Error parsing file. Check console for details.",
        variant: "destructive"
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const detectGeometryType = (geojson: any): 'point' | 'line' | 'polygon' | 'raster' => {
    if (geojson.features && geojson.features.length > 0) {
      const firstType = geojson.features[0].geometry?.type;
      if (firstType?.includes('Point')) return 'point';
      if (firstType?.includes('Line')) return 'line';
      if (firstType?.includes('Polygon')) return 'polygon';
    }
    return 'point';
  };

  const handleDrawClick = (type: 'point' | 'line' | 'polygon') => {
    setPendingDrawType(type);
    setShowModeSelector(true);
  };

  const handleSelectMode = (mode: 'click' | 'polygon') => {
    onDrawModeChange({ type: 'select', purpose: 'feature', selectMode: mode });
    setShowModeSelector(false);
  };

  const handleModeSelect = (purpose: 'annotation' | 'feature', targetLayerId?: string) => {
    if (!pendingDrawType) return;
    
    onDrawModeChange({ 
      type: pendingDrawType, 
      purpose,
      ...(purpose === 'feature' && targetLayerId && { targetLayerId })
    } as any);
    setShowModeSelector(false);
    setPendingDrawType(null);
  };

  const isDrawActive = (type: 'point' | 'line' | 'polygon') => 
    drawMode.type === type;

  return (
    <div className="h-14 border-b bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={drawMode.type === 'select' || drawMode.type === null ? 'default' : 'outline'}
              size="sm"
              className="z-[999] relative"
            >
              <MousePointer className="h-4 w-4 mr-2" />
              Select
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-card border-2 z-[1000]" align="start">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Selection Mode</h3>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSelectMode('click')}
              >
                <MousePointer className="h-4 w-4 mr-2" />
                Click Selection
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSelectMode('polygon')}
              >
                <Square className="h-4 w-4 mr-2" />
                Polygon Selection
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="h-8 w-px bg-border mx-1" />

        <Button
          variant={isDrawActive('point') ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleDrawClick('point')}
        >
          <Circle className="h-4 w-4 mr-2" />
          Point
        </Button>

        <Button
          variant={isDrawActive('line') ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleDrawClick('line')}
        >
          <Minus className="h-4 w-4 mr-2" />
          Line
        </Button>

        <Button
          variant={isDrawActive('polygon') ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleDrawClick('polygon')}
        >
          <Square className="h-4 w-4 mr-2" />
          Polygon
        </Button>

        <div className="h-8 w-px bg-border mx-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAttributeTable}
        >
          <Table className="h-4 w-4 mr-2" />
          Attributes
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept=".geojson,.json,.zip"
          multiple
          className="hidden"
          onChange={handleFileImport}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </div>

      {/* Mode Selector Popover */}
      <Popover open={showModeSelector} onOpenChange={setShowModeSelector}>
        <PopoverTrigger asChild>
          <div className="hidden" />
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-card border-2 z-50" align="center">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Choose Drawing Purpose</h3>
            
            {/* Annotation Option */}
            <div>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-3"
                onClick={() => handleModeSelect('annotation')}
              >
                <div className="flex items-start gap-3">
                  <StickyNote className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">Annotation</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Visual overlay for notes and drawings (no geodata)
                    </div>
                  </div>
                </div>
              </Button>
            </div>

            {/* Feature/Geodata Option */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Create Geodata Feature</Label>
              
              {/* Add to New Layer */}
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-3"
                onClick={() => handleModeSelect('feature')}
              >
                <div className="flex items-start gap-3">
                  <Plus className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">New Layer</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Create new layer for this feature
                    </div>
                  </div>
                </div>
              </Button>

              {/* Add to Existing Layer */}
              {layers.filter(l => l.type === pendingDrawType).length > 0 && (
                <div className="border rounded-md p-2 bg-muted/30">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Or add to existing layer:
                  </Label>
                  <ScrollArea className="max-h-32">
                    <div className="space-y-1">
                      {layers
                        .filter(l => l.type === pendingDrawType)
                        .map(layer => (
                          <Button
                            key={layer.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start h-auto py-2"
                            onClick={() => handleModeSelect('feature', layer.id)}
                          >
                            <MapPin className="h-4 w-4 mr-2 text-primary" />
                            <span className="text-sm truncate">{layer.name}</span>
                          </Button>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Toolbar;
