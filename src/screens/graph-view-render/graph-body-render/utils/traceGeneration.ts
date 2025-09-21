/**
 * Trace generation utilities for plotly graphs
 * Handles creation of different types of traces based on plot configuration
 */

import { calculateErrorValues } from './errorCalculations';
import { computeLinearRegression, createRegressionTraces } from './regressionAnalysis';

export interface TraceConfig {
  xv: number[];
  yv: number[];
  label: string;
  color: string;
  symbol: string;
  subType: string;
  symbolValue?: string;
  errorCalculationUpper?: string;
  errorCalculationLower?: string;
  errorBarVariable?: string;
  errorBarData?: number[];
  rows: any[];
}

export interface SeriesConfig {
  colors: string[];
  symbols: string[];
}

/**
 * Get series color and symbol
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
 * Create scatter series trace with error bars
 */
export const createScatterTrace = (config: TraceConfig): any => {
  const {
    xv, yv, label, color, symbol, subType, symbolValue,
    errorCalculationUpper, errorCalculationLower, errorBarVariable, errorBarData, rows
  } = config;
  
  const isErrorBar = subType.toLowerCase().includes('error bar');
  const isVerticalErrorBar = subType.toLowerCase().includes('vertical') && isErrorBar;
  const isHorizontalErrorBar = subType.toLowerCase().includes('horizontal') && isErrorBar;
  const isAsymmetricErrorBar = subType.toLowerCase().includes('asymmetric') && isErrorBar;
  const isBidirectionalErrorBar = subType.toLowerCase().includes('bidirectional') && isErrorBar;
  const isPointPlot = subType.toLowerCase().includes('point plot');
  const isDotPlot = subType.toLowerCase().includes('dot plot');
  
  let traceConfig: any = {
    x: xv,
    y: yv,
    name: label,
    marker: { color, symbol }
  };

  // Configure trace based on sub-type and error bar configuration
  if (isErrorBar) {
    traceConfig.type = 'scatter';
    traceConfig.mode = 'markers';
    traceConfig.marker = { color, symbol: 'circle' };
    
    // Get error bar data if needed
    let errorBarDataForCalculation: number[] | undefined;
    if (errorBarVariable) {
      console.log('📊 Error Bar Variable:', errorBarVariable);
      // For asymmetric error bars, use direct error bar variable data
      if (isAsymmetricErrorBar) {
        errorBarDataForCalculation = rows.map((row: any) => {
          const value = row[errorBarVariable];
          return typeof value === 'number' ? value : parseFloat(value) || 0;
        });
        console.log('📊 Asymmetric Error Bar Data:', errorBarDataForCalculation?.slice(0, 5), '...');
      }
      // For regular error bars with Symbol Value configuration
      else if (symbolValue && (symbolValue === 'Worksheet Columns' || symbolValue === 'Asymmetric Error Bar')) {
        errorBarDataForCalculation = rows.map((row: any) => {
          const value = row[errorBarVariable];
          return typeof value === 'number' ? value : parseFloat(value) || 0;
        });
        console.log('📊 Regular Error Bar Data:', errorBarDataForCalculation?.slice(0, 5), '...');
      }
    }
    
    // Calculate error values based on Symbol Value and Error Calculation options
    const errorValues = calculateErrorValues({
      xv, yv, symbolValue: symbolValue || '', 
      errorCalculationUpper, errorCalculationLower, 
      errorBarData: errorBarDataForCalculation
    });
    
    console.log('🔍 Error Values Calculated:', {
      symbolValue,
      errorBarDataLength: errorBarDataForCalculation?.length,
      errorValues: {
        yUpper: errorValues.yUpper?.slice(0, 3),
        yLower: errorValues.yLower?.slice(0, 3),
        xUpper: errorValues.xUpper?.slice(0, 3),
        xLower: errorValues.xLower?.slice(0, 3)
      }
    });
    
    // Enhanced error bar styling with dynamic customization
    const errorBarStyle = {
      thickness: 2,
      width: 3,
      opacity: 0.8,
      capSize: 4
    };

    if (isVerticalErrorBar || (!isHorizontalErrorBar && !isBidirectionalErrorBar)) {
      // Vertical Error Bars with enhanced styling
      if (isAsymmetricErrorBar) {
        traceConfig.error_y = {
          type: 'data',
          symmetric: false,
          array: errorValues.yUpper,
          arrayminus: errorValues.yLower,
          color: color,
          thickness: errorBarStyle.thickness,
          width: errorBarStyle.width,
          opacity: errorBarStyle.opacity,
          cap: {
            size: errorBarStyle.capSize,
            color: color
          },
          visible: true
        };
      } else {
        traceConfig.error_y = {
          type: 'data',
          symmetric: true,
          array: errorValues.ySymmetric,
          color: color,
          thickness: errorBarStyle.thickness,
          width: errorBarStyle.width,
          opacity: errorBarStyle.opacity,
          cap: {
            size: errorBarStyle.capSize,
            color: color
          },
          visible: true
        };
      }
    } else if (isHorizontalErrorBar) {
      // Horizontal Error Bars with enhanced styling
      if (isAsymmetricErrorBar) {
        traceConfig.error_x = {
          type: 'data',
          symmetric: false,
          array: errorValues.xUpper,
          arrayminus: errorValues.xLower,
          color: color,
          thickness: errorBarStyle.thickness,
          width: errorBarStyle.width,
          opacity: errorBarStyle.opacity,
          cap: {
            size: errorBarStyle.capSize,
            color: color
          },
          visible: true
        };
      } else {
        traceConfig.error_x = {
          type: 'data',
          symmetric: true,
          array: errorValues.xSymmetric,
          color: color,
          thickness: errorBarStyle.thickness,
          width: errorBarStyle.width,
          opacity: errorBarStyle.opacity,
          cap: {
            size: errorBarStyle.capSize,
            color: color
          },
          visible: true
        };
      }
    } else if (isBidirectionalErrorBar) {
      // Bidirectional Error Bars with enhanced styling
      if (isAsymmetricErrorBar) {
        traceConfig.error_y = {
          type: 'data',
          symmetric: false,
          array: errorValues.yUpper,
          arrayminus: errorValues.yLower,
          color: color,
          thickness: errorBarStyle.thickness,
          width: errorBarStyle.width,
          opacity: errorBarStyle.opacity,
          cap: {
            size: errorBarStyle.capSize,
            color: color
          },
          visible: true
        };
        traceConfig.error_x = {
          type: 'data',
          symmetric: false,
          array: errorValues.xUpper,
          arrayminus: errorValues.xLower,
          color: color,
          thickness: errorBarStyle.thickness,
          width: errorBarStyle.width,
          opacity: errorBarStyle.opacity,
          cap: {
            size: errorBarStyle.capSize,
            color: color
          },
          visible: true
        };
      } else {
        traceConfig.error_y = {
          type: 'data',
          symmetric: true,
          array: errorValues.ySymmetric,
          color: color,
          thickness: errorBarStyle.thickness,
          width: errorBarStyle.width,
          opacity: errorBarStyle.opacity,
          cap: {
            size: errorBarStyle.capSize,
            color: color
          },
          visible: true
        };
        traceConfig.error_x = {
          type: 'data',
          symmetric: true,
          array: errorValues.xSymmetric,
          color: color,
          thickness: errorBarStyle.thickness,
          width: errorBarStyle.width,
          opacity: errorBarStyle.opacity,
          cap: {
            size: errorBarStyle.capSize,
            color: color
          },
          visible: true
        };
      }
    }
  } else if (isPointPlot) {
    // SigmaPlot-style point plots with professional markers
    traceConfig.type = 'scatter';
    traceConfig.mode = 'markers';
    traceConfig.marker = { 
      color: color,
      symbol: 'circle',
      size: 12, // Larger, more prominent markers
      line: { 
        width: 2, 
        color: 'rgba(0,0,0,0.8)', // Dark border for contrast
        opacity: 0.9
      },
      opacity: 0.85, // Slight transparency for professional look
      // SigmaPlot-style gradient effect
      gradient: {
        type: 'radial',
        color: [color, 'rgba(255,255,255,0.3)'],
        size: [0.3, 1]
      }
    };
    // Add hover effects for better interactivity
    traceConfig.hoverinfo = 'x+y+text';
    traceConfig.hoverlabel = {
      bgcolor: 'rgba(255,255,255,0.95)',
      bordercolor: 'rgba(0,0,0,0.3)',
      font: { size: 12, color: 'rgba(0,0,0,0.8)' }
    };
  } else if (isDotPlot) {
    // SigmaPlot-style dot plots with compact, stacked appearance
    traceConfig.type = 'scatter';
    traceConfig.mode = 'markers';
    
    // Calculate marker size based on data density (SigmaPlot feature)
    const dataDensity = xv.length;
    const baseSize = Math.max(3, Math.min(8, 12 - Math.log10(dataDensity)));
    
    traceConfig.marker = { 
      color: color,
      symbol: 'circle',
      size: baseSize,
      opacity: 0.8, // Higher opacity for better visibility
      line: {
        width: 1,
        color: 'rgba(255,255,255,0.6)', // Light border for definition
        opacity: 0.7
      },
      // SigmaPlot-style subtle gradient
      gradient: {
        type: 'radial',
        color: [color, 'rgba(255,255,255,0.2)'],
        size: [0.4, 1]
      }
    };
    
    // Enhanced hover for dot plots
    traceConfig.hoverinfo = 'x+y+text';
    traceConfig.hoverlabel = {
      bgcolor: 'rgba(255,255,255,0.9)',
      bordercolor: 'rgba(0,0,0,0.2)',
      font: { size: 11, color: 'rgba(0,0,0,0.8)' }
    };
    
    // Add jitter for overlapping points (SigmaPlot feature)
    if (dataDensity > 50) {
      const jitterAmount = 0.02; // 2% jitter
      traceConfig.x = xv.map(x => x + (Math.random() - 0.5) * jitterAmount);
      traceConfig.y = yv.map(y => y + (Math.random() - 0.5) * jitterAmount);
    }
  } else {
    // Standard scatter plots
    traceConfig.type = 'scatter';
    traceConfig.mode = 'markers';
    traceConfig.marker = { color, symbol };
  }

  return traceConfig;
};

/**
 * Create dotted lines from dots to axes for dot plots
 */
export const createDotPlotDottedLines = (
  xv: number[],
  yv: number[],
  color: string,
  subType: string
): any[] => {
  const isDotPlot = subType.toLowerCase().includes('dot plot');
  if (!isDotPlot) return [];
  
  const traces: any[] = [];
  
  // Determine which axis to draw lines to based on dot plot type
  const isVerticalDotPlot = subType.toLowerCase().includes('vertical');
  const isHorizontalDotPlot = subType.toLowerCase().includes('horizontal');
  
  if (isVerticalDotPlot || (!isHorizontalDotPlot && !isVerticalDotPlot)) {
    // Vertical dot plot - draw lines to X axis (y=0)
    xv.forEach((x, i) => {
      traces.push({
        x: [x, x],
        y: [0, yv[i]],
        type: 'scatter',
        mode: 'lines',
        line: {
          color: color,
          width: 1,
          dash: 'dot',
          opacity: 0.3
        },
        showlegend: false,
        hoverinfo: 'skip'
      });
    });
  } else if (isHorizontalDotPlot) {
    // Horizontal dot plot - draw lines to Y axis (x=0)
    yv.forEach((y, i) => {
      traces.push({
        x: [0, xv[i]],
        y: [y, y],
        type: 'scatter',
        mode: 'lines',
        line: {
          color: color,
          width: 1,
          dash: 'dot',
          opacity: 0.3
        },
        showlegend: false,
        hoverinfo: 'skip'
      });
    });
  }
  
  return traces;
};

/**
 * Create regression traces if needed
 */
export const createRegressionTracesIfNeeded = (
  xv: number[], 
  yv: number[], 
  label: string, 
  color: string, 
  subType: string
): any[] => {
  const isRegression = subType.toLowerCase().includes('regression');
  if (!isRegression) return [];
  
  const regressionResult = computeLinearRegression(xv, yv);
  if (!regressionResult) return [];
  
  return createRegressionTraces(xv, yv, label, color, subType, regressionResult);
};
