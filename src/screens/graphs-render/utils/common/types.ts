/**
 * Shared types and interfaces for all plot types
 */

export interface TraceConfig {
  xv: (number | string)[];
  yv: (number | string)[];
  zv?: number[]; // Z values for 3D mesh plots
  label: string;
  color: string;
  symbol: string;
  subType: string;
  symbolValue?: string;
  errorCalculationUpper?: string;
  errorCalculationLower?: string;
  errorBarVariable?: string;
  errorBarData?: number[];
  // For bidirectional error bars - separate X and Y error bar variables
  errorBarVariableX?: string;
  errorBarVariableY?: string;
  errorBarDataX?: number[];
  errorBarDataY?: number[];
  // Error bar color override
  errorBarColor?: string;
  // Graph configuration for 3D mesh plots
  graphConfig?: any;
  rows: any[];
  // Line plot specific properties
  lineStyle?: string;
  lineWidth?: number;
  markerSize?: number;
  showMarkers?: boolean;
}

export interface SeriesConfig {
  colors: string[];
  symbols: string[];
}

export interface ProcessedSeries {
  xv: (number | string)[];
  yv: (number | string)[];
  zv?: number[];
  label: string;
  color?: string;
  symbol?: string;
  subType?: string;
  dataFormat?: string;
  errorBarData?: number[];
  categoryData?: string[];
  rows?: any[];
  isLinePlot?: boolean;
  isScatterPlot?: boolean;
  showMarkers?: boolean;
  showLines?: boolean;
  markerSize?: number;
  lineWidth?: number;
  // Legacy properties for backward compatibility
  errorBarVariable?: string;
  // Category information for point plots
  categoryName?: string;
  categoryIndex?: number;
  // New properties for line-scatter plots
  x?: number[];
  y?: number[];
  // Bidirectional error bar properties
  errorBarDataX?: number[];
  errorBarDataY?: number[];
}

export interface DataProcessingConfig {
  graphConfig: any;
  rows: any[];
  xNames: string[];
  yNames: string[];
  zNames?: string[];
  categoryNames?: string[];
  errorBarNames?: string[];
}

export interface PlotType {
  type: 'scatter' | 'line' | 'line-scatter' | '3d-mesh' | '3d-scatter' | 'box' | 'pie';
  dataFormat: string;
  subType: string;
}

export interface PerformanceConfig {
  maxPointsPerTrace: number;
  enableSampling: boolean;
  enableDecimation: boolean;
  enableProgressiveRendering: boolean;
  samplingThreshold: number;
  decimationFactor: number;
  performanceWarningThreshold: number;
}

export interface OptimizedData {
  xv: number[];
  yv: number[];
  originalLength: number;
  optimizedLength: number;
  optimizationMethod: string;
  errorBarVariable?: string;
}
