export interface GISLayer {
  id: string;
  name: string;
  type: 'point' | 'line' | 'polygon' | 'raster';
  visible: boolean;
  opacity: number;
  data: GeoJSON.FeatureCollection;
  selectable?: boolean;
  style?: {
    color?: string;
    fillColor?: string;
    fillOpacity?: number;
    weight?: number;
    shape?: 'circle' | 'square' | 'triangle' | 'star' | 'diamond';
    fillPattern?: 'solid' | 'hatch' | 'dots' | 'grid';
  };
}

export interface LayerStyle {
  color: string;
  fillColor: string;
  fillOpacity: number;
  weight: number;
}

export interface DrawingFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon';
    coordinates: any;
  };
  properties: Record<string, any>;
}
