/**
 * Types for useGraphData hook
 */

export interface ProcessedSeries {
  xv: number[];
  yv: number[];
  zv?: number[];
  label: string;
  errorBarVariable?: string;
}

export interface CategoryPlotResult {
  traces: any[];
  layout?: {
    xaxis?: any;
    yaxis?: any;
  };
}

export interface DataQualityReport {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
}
