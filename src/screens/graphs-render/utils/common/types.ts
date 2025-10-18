/**
 * Shared types and interfaces for all plot types
 */

export interface TraceConfig {
  xv: number[];
  yv: number[];
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
  xv: number[];
  yv: number[];
  zv?: number[];
  label: string;
  errorBarVariable?: string;
  // Category information for point plots
  categoryName?: string;
  categoryIndex?: number;
}

export interface DataProcessingConfig {
  graphConfig: any;
  rows: any[];
  xNames: string[];
  yNames: string[];
  zNames?: string[];
  categoryNames?: string[];
}

export interface PlotType {
  type: 'scatter' | 'line' | '3d-mesh';
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
