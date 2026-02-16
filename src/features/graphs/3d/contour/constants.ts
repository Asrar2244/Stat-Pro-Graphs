import type { DataFormat } from './contourPlotSlice';

/**
 * Available data formats for Contour plots
 */
export const DATA_FORMATS: DataFormat[] = [
    'XYZ Triplets',   // XYZ Triplet format
    'Many Z',         // Many Z Variables format  
    'XY Many Z',      // XY + Many Z Variables format
];

/**
 * Get valid data formats for Contour plots
 */
export const getValidDataFormats = (): DataFormat[] => {
    return DATA_FORMATS;
};

/**
 * Check if a data format is valid for Contour plots
 */
export const isValidDataFormat = (dataFormat: DataFormat): boolean => {
    return DATA_FORMATS.includes(dataFormat);
};

/**
 * Contour plot specific configuration options
 */
export const CONTOUR_PLOT_OPTIONS = {
    // Contour subplots
    contourTypes: ['contour', 'filled'] as const,

    // Color scales
    colorScales: [
        // Scientific
        'viridis', 'plasma', 'inferno', 'magma', 'cividis', 'turbo', 'jet', 'hot', 'cool', 'rainbow',
        // Sequential
        'blues', 'greens', 'reds', 'oranges', 'purples', 'greys',
        // Diverging
        'rdbu', 'rdylbu', 'spectral', 'rdylgn', 'piyg', 'prgn', 'brbg',
        // Other
        'bone', 'copper', 'pink', 'spring', 'summer', 'autumn', 'winter'
    ] as const,

    // Opacity range
    opacityRange: [0, 1] as const,

    // Grid opacity range
    gridOpacityRange: [0, 1] as const,
} as const;
