/**
 * Scatter plot trace generation utilities
 */

import { calculateErrorValues } from '../common';
import { computeLinearRegression, createRegressionTraces } from '../regressionAnalysis';
import { ScatterTraceConfig, ScatterErrorBarConfig } from './types';

/**
 * Create scatter series trace with error bars
 */
export const createScatterTrace = (config: ScatterTraceConfig): any => {
  const {
    xv, yv, label, color, symbol, subType, symbolValue,
    errorCalculationUpper, errorCalculationLower, errorBarVariable, errorBarData, 
    errorBarVariableX, errorBarVariableY, errorBarDataX, errorBarDataY, errorBarColor, rows
  } = config;
  
  // Determine error bar and plot type configurations
  const errorConfig = determineErrorBarConfig(subType, symbolValue);
  
  let traceConfig: any = {
    x: xv,
    y: yv,
    name: label,
    marker: { color, symbol }
  };

  // Configure trace based on sub-type and error bar configuration
  if (errorConfig.isErrorBar) {
    traceConfig = createErrorBarTrace(traceConfig, config, errorConfig);
  } else if (errorConfig.isPointPlot) {
    traceConfig = createPointPlotTrace(traceConfig, config, errorConfig);
  } else if (errorConfig.isDotPlot) {
    traceConfig = createDotPlotTrace(traceConfig, config, errorConfig);
  } else {
    // Standard scatter plots
    traceConfig.type = 'scatter';
    traceConfig.mode = 'markers';
    traceConfig.marker = { color, symbol };
  }

  return traceConfig;
};

/**
 * Determine error bar and plot type configurations
 */
const determineErrorBarConfig = (subType: string, symbolValue?: string): ScatterErrorBarConfig & { isErrorBar: boolean } => {
  const lowerSubType = subType.toLowerCase();
  
  const isErrorBar = lowerSubType.includes('error bar');
  const isVerticalErrorBar = lowerSubType.includes('vertical') && isErrorBar;
  const isHorizontalErrorBar = lowerSubType.includes('horizontal') && isErrorBar;
  const isAsymmetricErrorBar = (lowerSubType.includes('asymmetric') || symbolValue === 'Asymmetric Error Bar') && isErrorBar;
  const isBidirectionalErrorBar = lowerSubType.includes('bidirectional') && isErrorBar;
  const isPointPlot = lowerSubType.includes('point plot');
  const isDotPlot = lowerSubType.includes('dot plot');

  return {
    isErrorBar,
    isVerticalErrorBar,
    isHorizontalErrorBar,
    isAsymmetricErrorBar,
    isBidirectionalErrorBar,
    isPointPlot,
    isDotPlot
  };
};

/**
 * Create error bar trace
 */
const createErrorBarTrace = (baseTrace: any, config: ScatterTraceConfig, errorConfig: ScatterErrorBarConfig & { isErrorBar: boolean }): any => {
  const { xv, yv, label, color, symbolValue, subType, errorCalculationUpper, errorCalculationLower, 
          errorBarVariable, errorBarData, errorBarVariableX, errorBarVariableY, errorBarDataX, errorBarDataY, 
          errorBarColor, rows } = config;
  
  const traceConfig = { ...baseTrace };
  traceConfig.type = 'scatter';
  traceConfig.mode = 'markers';
  traceConfig.marker = { color, symbol: 'circle' };
  
  // Get error bar data if needed
  let errorBarDataForCalculation: number[] | undefined;
  let errorBarDataXForCalculation: number[] | undefined;
  let errorBarDataYForCalculation: number[] | undefined;
  
  if (errorConfig.isBidirectionalErrorBar) {
    // For bidirectional error bars, use separate X and Y error bar variables
    if (errorBarVariableX) {
      errorBarDataXForCalculation = rows.map((row: any) => {
        const value = row[errorBarVariableX];
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      });
    }
    if (errorBarVariableY) {
      errorBarDataYForCalculation = rows.map((row: any) => {
        const value = row[errorBarVariableY];
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      });
    }
  } else if (errorBarVariable) {
    // For regular error bars, use single error bar variable
    if (errorConfig.isAsymmetricErrorBar) {
      errorBarDataForCalculation = rows.map((row: any) => {
        const value = row[errorBarVariable];
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      });
    }
    // For regular error bars with Symbol Value configuration
    else if (symbolValue && (symbolValue === 'Worksheet Columns' || symbolValue === 'Asymmetric Error Bar')) {
      errorBarDataForCalculation = rows.map((row: any) => {
        const value = row[errorBarVariable];
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      });
    }
  }
  
  // Calculate error values based on Symbol Value and Error Calculation options
  const errorValues = calculateErrorValues({
    xv, yv, symbolValue: symbolValue || '', 
    subType: subType || '',
    errorCalculationUpper, errorCalculationLower, 
    errorBarData: errorBarDataForCalculation,
    // For bidirectional error bars, pass separate X and Y error bar data
    errorBarDataX: errorBarDataXForCalculation,
    errorBarDataY: errorBarDataYForCalculation
  });
  
  // Enhanced error bar styling with SigmaPlot-style customization
  const errorBarStyle = {
    thickness: errorConfig.isAsymmetricErrorBar ? 1.5 : 2,  // Thinner for asymmetric (SigmaPlot style)
    width: errorConfig.isAsymmetricErrorBar ? 2 : 3,       // Narrower for asymmetric
    opacity: errorConfig.isAsymmetricErrorBar ? 0.9 : 0.8, // Higher opacity for asymmetric
    capSize: errorConfig.isAsymmetricErrorBar ? 3 : 4      // Smaller caps for asymmetric
  };

  // Apply error bar configuration based on type
  if (errorConfig.isVerticalErrorBar || (!errorConfig.isHorizontalErrorBar && !errorConfig.isBidirectionalErrorBar)) {
    // Vertical Error Bars with enhanced styling
    if (errorConfig.isAsymmetricErrorBar) {
      traceConfig.error_y = {
        type: 'data',
        symmetric: false,
        array: errorValues.yUpper,
        arrayminus: errorValues.yLower,
        color: errorBarColor || color,
        thickness: errorBarStyle.thickness,
        width: errorBarStyle.width,
        opacity: errorBarStyle.opacity,
        cap: {
          visible: true,
          size: errorBarStyle.capSize,
          thickness: errorBarStyle.thickness,
          color: errorBarColor || color
        },
        visible: true,
        // SigmaPlot-style asymmetric error bar enhancements
        line: {
          color: errorBarColor || color,
          width: errorBarStyle.thickness,
          dash: 'solid'
        }
      };
    } else {
      traceConfig.error_y = {
        type: 'data',
        symmetric: true,
        array: errorValues.ySymmetric,
        color: errorBarColor || color,
        thickness: errorBarStyle.thickness,
        width: errorBarStyle.width,
        opacity: errorBarStyle.opacity,
        cap: {
          visible: true,
          size: errorBarStyle.capSize,
          thickness: errorBarStyle.thickness,
          color: errorBarColor || color
        },
        visible: true
      };
    }
  } else if (errorConfig.isHorizontalErrorBar) {
    // Horizontal Error Bars with enhanced styling
    if (errorConfig.isAsymmetricErrorBar) {
      traceConfig.error_x = {
        type: 'data',
        symmetric: false,
        array: errorValues.xUpper,
        arrayminus: errorValues.xLower,
        color: errorBarColor || color,
        thickness: errorBarStyle.thickness,
        width: errorBarStyle.width,
        opacity: errorBarStyle.opacity,
        cap: {
          visible: true,
          size: errorBarStyle.capSize,
          thickness: errorBarStyle.thickness,
          color: errorBarColor || color
        },
        visible: true
      };
    } else {
      traceConfig.error_x = {
        type: 'data',
        symmetric: true,
        array: errorValues.xSymmetric,
        color: errorBarColor || color,
        thickness: errorBarStyle.thickness,
        width: errorBarStyle.width,
        opacity: errorBarStyle.opacity,
        cap: {
          visible: true,
          size: errorBarStyle.capSize,
          thickness: errorBarStyle.thickness,
          color: errorBarColor || color
        },
        visible: true
      };
    }
  } else if (errorConfig.isBidirectionalErrorBar) {
    // Bidirectional Error Bars with enhanced styling
    if (errorConfig.isAsymmetricErrorBar) {
      traceConfig.error_y = {
        type: 'data',
        symmetric: false,
        array: errorValues.yUpper,
        arrayminus: errorValues.yLower,
        color: errorBarColor || color,
        thickness: errorBarStyle.thickness,
        width: errorBarStyle.width,
        opacity: errorBarStyle.opacity,
        cap: {
          visible: true,
          size: errorBarStyle.capSize,
          thickness: errorBarStyle.thickness,
          color: errorBarColor || color
        },
        visible: true,
        // SigmaPlot-style asymmetric error bar enhancements
        line: {
          color: errorBarColor || color,
          width: errorBarStyle.thickness,
          dash: 'solid'
        }
      };
      traceConfig.error_x = {
        type: 'data',
        symmetric: false,
        array: errorValues.xUpper,
        arrayminus: errorValues.xLower,
        color: errorBarColor || color,
        thickness: errorBarStyle.thickness,
        width: errorBarStyle.width,
        opacity: errorBarStyle.opacity,
        cap: {
          visible: true,
          size: errorBarStyle.capSize,
          thickness: errorBarStyle.thickness,
          color: errorBarColor || color
        },
        visible: true,
        // SigmaPlot-style asymmetric error bar enhancements
        line: {
          color: errorBarColor || color,
          width: errorBarStyle.thickness,
          dash: 'solid'
        }
      };
    } else {
      traceConfig.error_y = {
        type: 'data',
        symmetric: true,
        array: errorValues.ySymmetric,
        color: errorBarColor || color,
        thickness: errorBarStyle.thickness,
        width: errorBarStyle.width,
        opacity: errorBarStyle.opacity,
        cap: {
          visible: true,
          size: errorBarStyle.capSize,
          thickness: errorBarStyle.thickness,
          color: errorBarColor || color
        },
        visible: true
      };
      traceConfig.error_x = {
        type: 'data',
        symmetric: true,
        array: errorValues.xSymmetric,
        color: errorBarColor || color,
        thickness: errorBarStyle.thickness,
        width: errorBarStyle.width,
        opacity: errorBarStyle.opacity,
        cap: {
          visible: true,
          size: errorBarStyle.capSize,
          thickness: errorBarStyle.thickness,
          color: errorBarColor || color
        },
        visible: true
      };
    }
  }

  return traceConfig;
};

/**
 * Create point plot trace
 */
const createPointPlotTrace = (baseTrace: any, config: ScatterTraceConfig, errorConfig: ScatterErrorBarConfig): any => {
  const { xv, yv, label, color, errorBarColor } = config;
  
  const traceConfig = { ...baseTrace };
  traceConfig.type = 'scatter';
  traceConfig.mode = 'markers';
  
  const finalColor = color; // Point plots don't have error bars, use series color directly
  traceConfig.marker = { 
    color: finalColor,
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
      color: [finalColor, 'rgba(255,255,255,0.3)'],
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

  return traceConfig;
};

/**
 * Create dot plot trace
 */
const createDotPlotTrace = (baseTrace: any, config: ScatterTraceConfig, errorConfig: ScatterErrorBarConfig): any => {
  const { xv, yv, label, color, errorBarColor } = config;
  
  const traceConfig = { ...baseTrace };
  traceConfig.type = 'scatter';
  traceConfig.mode = 'markers';
  
  // Calculate marker size based on data density (SigmaPlot feature)
  const dataDensity = xv.length;
  const baseSize = Math.max(3, Math.min(8, 12 - Math.log10(dataDensity)));
  
  const finalColor = color; // Dot plots don't have error bars, use series color directly
  traceConfig.marker = { 
    color: finalColor,
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
      color: [finalColor, 'rgba(255,255,255,0.2)'],
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

  return traceConfig;
};

/**
 * Create dotted lines from dots to axes for dot plots
 */
export const createDotPlotDottedLines = (
  xv: number[],
  yv: number[],
  color: string,
  subType: string,
  errorBarColor?: string
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
          color: color, // Use series color directly for dot plot dotted lines
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
          color: color, // Use series color directly for dot plot dotted lines
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
  subType: string,
  showConfidenceInterval: boolean = true,
  confidenceIntervalOpacity: number = 0.2
): any[] => {
  const isRegression = subType.toLowerCase().includes('regression');
  if (!isRegression) {
    return [];
  }
  
  const regressionResult = computeLinearRegression(xv, yv);
  if (!regressionResult) {
    return [];
  }
  
  const traces = createRegressionTraces(xv, yv, label, color, subType, regressionResult, showConfidenceInterval, confidenceIntervalOpacity);
  return traces;
};

/**
 * Create multiple traces for different scatter plot types
 */
export const createScatterTraces = (configs: ScatterTraceConfig[]): any[] => {
  return configs.map(config => createScatterTrace(config));
};

/**
 * Get series color and symbol configuration
 */
export const getScatterSeriesConfig = (): { colors: string[], symbols: string[] } => {
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