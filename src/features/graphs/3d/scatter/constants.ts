import type { DataFormat } from './scatterPlotSlice';

/**
 * Available data formats for 3D scatter plots
 */
export const DATA_FORMATS: DataFormat[] = [
    'XYZ Triplets',   // XYZ Triplet format
    'Many Z',         // Many Z Variables format  
    'XY Many Z',      // XY + Many Z Variables format
];

/**
 * Get valid data formats for 3D scatter plots
 */
export const getValidDataFormats = (): DataFormat[] => {
    return DATA_FORMATS;
};

/**
 * Check if a data format is valid for 3D scatter plots
 */
export const isValidDataFormat = (dataFormat: DataFormat): boolean => {
    return DATA_FORMATS.includes(dataFormat);
};

/**
 * 3D scatter plot specific configuration options
 */
export const SCATTER_PLOT_OPTIONS = {
    // Color scales
    colorScales: ['viridis', 'plasma', 'inferno', 'magma', 'cividis', 'turbo', 'hot', 'cool', 'rainbow', 'jet'] as const,

    // Opacity range
    opacityRange: [0, 1] as const,

    // Grid opacity range
    gridOpacityRange: [0, 1] as const,

    // Marker size range
    markerSizeRange: [1, 20] as const,
} as const;
