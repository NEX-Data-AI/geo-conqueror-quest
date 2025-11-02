// Color palette for GIS layers
const colorPalette = [
  { color: '#3b82f6', fillColor: '#3b82f6' }, // Blue
  { color: '#10b981', fillColor: '#10b981' }, // Green
  { color: '#f59e0b', fillColor: '#f59e0b' }, // Amber
  { color: '#ef4444', fillColor: '#ef4444' }, // Red
  { color: '#8b5cf6', fillColor: '#8b5cf6' }, // Purple
  { color: '#ec4899', fillColor: '#ec4899' }, // Pink
  { color: '#06b6d4', fillColor: '#06b6d4' }, // Cyan
  { color: '#f97316', fillColor: '#f97316' }, // Orange
  { color: '#14b8a6', fillColor: '#14b8a6' }, // Teal
  { color: '#a855f7', fillColor: '#a855f7' }, // Violet
  { color: '#84cc16', fillColor: '#84cc16' }, // Lime
  { color: '#f43f5e', fillColor: '#f43f5e' }, // Rose
];

let colorIndex = 0;

export const getNextLayerColor = () => {
  const colors = colorPalette[colorIndex % colorPalette.length];
  colorIndex++;
  return colors;
};

export const resetColorIndex = () => {
  colorIndex = 0;
};
