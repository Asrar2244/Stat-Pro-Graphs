/**
 * Shared series configuration utilities
 */

import { SeriesConfig } from './types';

/**
 * Get series color and symbol configuration
 */
export const getSeriesConfig = (): SeriesConfig => {
  // SigmaPlot-style professional color palette
  const SERIES_COLORS = [
    '#1f77b4', // Professional blue
    '#ff7f0e', // Professional orange  
    '#2ca02c', // Professional green
    '#d62728', // Professional red
    '#9467bd', // Professional purple
    '#8c564b', // Professional brown
    '#e377c2', // Professional pink
    '#7f7f7f', // Professional gray
    '#bcbd22', // Professional olive
    '#17becf', // Professional cyan
    '#ff9896', // Light red
    '#98df8a', // Light green
    '#ffbb78', // Light orange
    '#c5b0d5', // Light purple
    '#c49c94', // Light brown
    '#f7b6d3', // Light pink
    '#c7c7c7', // Light gray
    '#dbdb8d', // Light olive
    '#9edae5', // Light cyan
    '#aec7e8'  // Light blue
  ];
  
  // SigmaPlot-style marker symbols
  const SERIES_SYMBOLS = [
    'circle',      // Standard circle
    'square',      // Square
    'diamond',     // Diamond
    'triangle-up', // Triangle up
    'triangle-down', // Triangle down
    'triangle-left', // Triangle left
    'triangle-right', // Triangle right
    'pentagon',    // Pentagon
    'hexagon',     // Hexagon
    'star',        // Star
    'cross',       // Cross
    'x'            // X mark
  ];
  
  return {
    colors: SERIES_COLORS,
    symbols: SERIES_SYMBOLS
  };
};

/**
 * Get color for series index
 */
export const getSeriesColor = (index: number): string => {
  const config = getSeriesConfig();
  return config.colors[index % config.colors.length];
};

/**
 * Get symbol for series index
 */
export const getSeriesSymbol = (index: number): string => {
  const config = getSeriesConfig();
  return config.symbols[index % config.symbols.length];
};
