import type { DataFormat } from './meshPlotSlice';

/**
 * Available data formats for 3D mesh plots (no subplots, only 3 formats)
 */
export const DATA_FORMATS: DataFormat[] = [
  'XYZ Triplets',   // XYZ Triplet format
  'Many Z',         // Many Z Variables format  
  'XY Many Z',      // XY + Many Z Variables format
];

/**
 * Get valid data formats for 3D mesh plots (all formats are valid since no subplots)
 */
export const getValidDataFormats = (): DataFormat[] => {
  return DATA_FORMATS;
};

/**
 * Check if a data format is valid for 3D mesh plots (all formats are valid)
 */
export const isValidDataFormat = (dataFormat: DataFormat): boolean => {
  return DATA_FORMATS.includes(dataFormat);
};

/**
 * 3D mesh plot specific configuration options
 */
export const MESH_PLOT_OPTIONS = {
  // Surface types
  surfaceTypes: ['surface', 'wireframe', 'mesh'] as const,
  
  // Color scales
  colorScales: ['viridis', 'plasma', 'inferno', 'magma', 'cividis', 'turbo', 'hot', 'cool', 'rainbow', 'jet'] as const,
  
  // Opacity range
  opacityRange: [0, 1] as const,
  
  // Grid opacity range
  gridOpacityRange: [0, 1] as const,
} as const;