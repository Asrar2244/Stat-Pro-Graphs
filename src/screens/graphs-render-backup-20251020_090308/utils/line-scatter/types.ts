/**
 * Line-scatter plot specific types and interfaces
 */

export interface LineScatterDataConfig {
  graphConfig: any;
  rows: any[];
  xNames: string[];
  yNames: string[];
  categoryNames?: string[];
  errorBarNames?: string[];
}

export interface LineScatterTraceConfig {
  xv: number[];
  yv: number[];
  label: string;
  color: string;
  symbol: string;
  lineStyle: 'solid' | 'dash' | 'dot' | 'dashdot';
  subType: string;
  dataFormat: string;
  symbolValue?: string;
  errorCalculationUpper?: string;
  errorCalculationLower?: string;
  errorBarVariable?: string;
  errorBarData?: number[];
  errorBarVariableX?: string;
  errorBarVariableY?: string;
  errorBarDataX?: number[];
  errorBarDataY?: number[];
  errorBarColor?: string;
  rows: any[];
  isLinePlot: boolean;
  isScatterPlot: boolean;
  showMarkers: boolean;
  showLines: boolean;
  markerSize?: number;
  lineWidth?: number;
}

export interface LineScatterPlotProperties {
  showMarkers: boolean;
  showLines: boolean;
  markerSize: number;
  lineWidth: number;
  lineStyle: 'solid' | 'dash' | 'dot' | 'dashdot';
  markerSymbol: string;
  markerColor: string;
  lineColor: string;
  opacity: number;
}

export interface LineScatterSubTypeConfig {
  isLinePlot: boolean;
  isScatterPlot: boolean;
  showMarkers: boolean;
  showLines: boolean;
  lineStyle: 'solid' | 'dash' | 'dot' | 'dashdot';
  defaultMarkerSize: number;
  defaultLineWidth: number;
}

/**
 * Line-scatter plot sub-type configurations
 */
export const LINE_SCATTER_SUB_TYPE_CONFIGS: Record<string, LineScatterSubTypeConfig> = {
  // A) Simple Straight Line & Scatter Plots
  'Simple Straight Line & Scatter Plots': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  },

  // B) Multiple Straight Lines & Scatter Plots
  'Multiple Straight Lines & Scatter Plots': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  },

  // C) Simple Spline Curve Line & Scatter Plots
  'Simple Spline Curve Line & Scatter Plots': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  },

  // D) Multiple Spline Curves Lines & scatter Plots
  'Multiple Spline Curves Lines & scatter Plots': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  },

  // E) Simple Line & Scatter - Error Bars
  'Simple Line & Scatter - Error Bars': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  },

  // F) Multiple Line & Scatter - Error Bars
  'Multiple Line & Scatter - Error Bars': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  },

  // G) Simple Vertical Step Plot
  'Simple Vertical Step Plot': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  },

  // G) Simple Vertical Midpoint Step Plot
  'Simple Vertical Midpoint Step Plot': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  },

  // H) Multiple Vertical Step Plot
  'Multiple Vertical Step Plot': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  },

  // H) Multiple Vertical Midpoint Step Plot
  'Multiple Vertical Midpoint Step Plot': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  },

  // I) Simple Horizontal Step Plot
  'Simple Horizontal Step Plot': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  },

  // I) Simple Horizontal Midpoint Step Plot
  'Simple Horizontal Midpoint Step Plot': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  },

  // J) Multiple Horizontal Step Plot
  'Multiple Horizontal Step Plot': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  },

  // J) Multiple Horizontal Midpoint Step Plot
  'Multiple Horizontal Midpoint Step Plot': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  },

  // K) Horizontal Error Bars
  'Horizontal Error Bars': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  },

  // L) Bi-Directional Error Bars
  'Bi-Directional Error Bars': {
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    lineStyle: 'solid',
    defaultMarkerSize: 8,
    defaultLineWidth: 2
  }
};
