import { Upload, Download, Pencil, MousePointer, Circle, Minus, Square, Table, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { GISLayer } from '@/types/gis';
import { useRef } from 'react';
// @ts-ignore
import shp from 'shpjs';

interface ToolbarProps {
  drawMode: 'point' | 'line' | 'polygon' | null;
  onDrawModeChange: (mode: 'point' | 'line' | 'polygon' | null) => void;
  onToggleAttributeTable: () => void;
  onImportData: (layers: GISLayer[]) => void;
}

const Toolbar = ({ drawMode, onDrawModeChange, onToggleAttributeTable, onImportData }: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="h-14 border-b bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button
          variant={drawMode === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onDrawModeChange(null)}
        >
          <MousePointer className="h-4 w-4 mr-2" />
          Select
        </Button>

        <div className="h-8 w-px bg-border mx-1" />

        <Button
          variant={drawMode === 'point' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onDrawModeChange(drawMode === 'point' ? null : 'point')}
        >
          <Circle className="h-4 w-4 mr-2" />
          Point
        </Button>

        <Button
          variant={drawMode === 'line' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onDrawModeChange(drawMode === 'line' ? null : 'line')}
        >
          <Minus className="h-4 w-4 mr-2" />
          Line
        </Button>

        <Button
          variant={drawMode === 'polygon' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onDrawModeChange(drawMode === 'polygon' ? null : 'polygon')}
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
    </div>
  );
};

export default Toolbar;
