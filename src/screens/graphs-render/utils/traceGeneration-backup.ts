/**
 * Comprehensive trace generation utilities for plotly graphs
 * Handles creation of different types of traces based on plot configuration
 * Incorporates all scatter and line plot functionality
 */

import { TraceConfig } from './common/types';
import { determinePlotType } from './common/plotTypeDetection';
import { calculateErrorValues } from './errorCalculations';
import { computeLinearRegression, createRegressionTraces } from './regressionAnalysis';
import { getLineShape } from './line/linePlotProperties';

// Import plot-specific trace generators for 3D mesh
import { create3DMeshTrace } from './3d-mesh/meshTraceGeneration';

// Re-export common utilities for backward compatibility
export * from './common';

/**
 * Get series color and symbol configuration
 */
export const getSeriesConfig = () => {
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
 * Create scatter series trace with comprehensive error bar support
 */
export const createScatterTrace = (config: TraceConfig): any => {
  const {
    xv, yv, label, color, symbol, subType, symbolValue,
    errorCalculationUpper, errorCalculationLower, errorBarVariable, errorBarData, 
    errorBarVariableX, errorBarVariableY, errorBarDataX, errorBarDataY, errorBarColor, rows
  } = config;
  
  const isErrorBar = subType.toLowerCase().includes('error bar');
  const isVerticalErrorBar = subType.toLowerCase().includes('vertical') && isErrorBar;
  const isHorizontalErrorBar = subType.toLowerCase().includes('horizontal') && isErrorBar;
  const isAsymmetricErrorBar = (subType.toLowerCase().includes('asymmetric') || symbolValue === 'Asymmetric Error Bar') && isErrorBar;
  
  // Error bar detection logic
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
    let errorBarDataXForCalculation: number[] | undefined;
    let errorBarDataYForCalculation: number[] | undefined;
    
    if (isBidirectionalErrorBar) {
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
      if (isAsymmetricErrorBar) {
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
      thickness: isAsymmetricErrorBar ? 1.5 : 2,  // Thinner for asymmetric (SigmaPlot style)
      width: isAsymmetricErrorBar ? 2 : 3,       // Narrower for asymmetric
      opacity: isAsymmetricErrorBar ? 0.9 : 0.8, // Higher opacity for asymmetric
      capSize: isAsymmetricErrorBar ? 3 : 4      // Smaller caps for asymmetric
    };

    if (isVerticalErrorBar || (!isHorizontalErrorBar && !isBidirectionalErrorBar)) {
      // Vertical Error Bars with enhanced styling
      if (isAsymmetricErrorBar) {
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
            size: errorBarStyle.capSize,
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
            size: errorBarStyle.capSize,
            color: errorBarColor || color
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
          color: errorBarColor || color,
          thickness: errorBarStyle.thickness,
          width: errorBarStyle.width,
          opacity: errorBarStyle.opacity,
          cap: {
            size: errorBarStyle.capSize,
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
            size: errorBarStyle.capSize,
            color: errorBarColor || color
          },
          visible: true
        };
      }
    } else if (isBidirectionalErrorBar) {
      // Bidirectional Error Bars with enhanced styling
      if (isAsymmetricErrorBar) {
        console.log('🔍 Applying Asymmetric Bidirectional Error Bars:', {
          yUpper: errorValues.yUpper?.slice(0, 3),
          yLower: errorValues.yLower?.slice(0, 3),
          xUpper: errorValues.xUpper?.slice(0, 3),
          xLower: errorValues.xLower?.slice(0, 3),
          symmetric: false
        });
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
            size: errorBarStyle.capSize,
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
            size: errorBarStyle.capSize,
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
            size: errorBarStyle.capSize,
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
            size: errorBarStyle.capSize,
            color: errorBarColor || color
          },
          visible: true
        };
      }
    }
  } else if (isPointPlot) {
    // SigmaPlot-style point plots with professional markers
    traceConfig.type = 'scatter';
    traceConfig.mode = 'markers';
    
    const finalColor = color; // Point plots don't have error bars, use series color directly
    console.log(`🎨 Point Plot Color Assignment:`, {
      label,
      originalColor: color,
      errorBarColor,
      finalColor,
      isPointPlot
    });
    
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
  } else if (isDotPlot) {
    // SigmaPlot-style dot plots with compact, stacked appearance
    traceConfig.type = 'scatter';
    traceConfig.mode = 'markers';
    
    // Calculate marker size based on data density (SigmaPlot feature)
    const dataDensity = xv.length;
    const baseSize = Math.max(3, Math.min(8, 12 - Math.log10(dataDensity)));
    
    const finalColor = color; // Dot plots don't have error bars, use series color directly
    console.log(`🎨 Dot Plot Color Assignment:`, {
      label,
      originalColor: color,
      errorBarColor,
      finalColor,
      isDotPlot
    });
    
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
 * Create line series trace with various line plot configurations
 */
export const createLinePlotTrace = (config: TraceConfig): any => {
  const {
    xv, yv, label, color, symbol, subType, symbolValue,
    errorCalculationUpper, errorCalculationLower, errorBarVariable, errorBarData, 
    errorBarVariableX, errorBarVariableY, errorBarDataX, errorBarDataY, errorBarColor, rows
  } = config;
  
  // Parse line plot specific configuration from subType
  const lineStyle = parseLinePlotSubType(subType);
  
  // Create line trace configuration
  const lineConfig = {
    xv,
    yv,
    label,
    color,
    symbol,
      subType,
    symbolValue,
    errorCalculationUpper,
    errorCalculationLower,
    errorBarVariable,
    errorBarData,
    errorBarVariableX,
    errorBarVariableY,
    errorBarDataX,
    errorBarDataY,
    errorBarColor,
    rows,
    lineStyle: lineStyle.lineStyle || 'solid',
    lineWidth: lineStyle.lineWidth || 2,
    markerSize: lineStyle.markerSize || 8,
    showMarkers: lineStyle.showMarkers === true // Only show markers if explicitly set to true
  };
  
  console.log(`📊 Creating Line Plot Trace:`, {
    label,
      subType,
    lineStyle: lineConfig.lineStyle,
    lineWidth: lineConfig.lineWidth,
    markerSize: lineConfig.markerSize,
    showMarkers: lineConfig.showMarkers,
    parsedStyle: lineStyle
  });
  
  return createLineTrace(lineConfig);
};

/**
 * Parse line plot subType to extract style information
 */
const parseLinePlotSubType = (subType: string) => {
  const lowerSubType = subType.toLowerCase();
  
  // Determine line style
  let lineStyle = 'solid';
  if (lowerSubType.includes('dashed') || lowerSubType.includes('dash')) {
    lineStyle = 'dash';
  } else if (lowerSubType.includes('dotted') || lowerSubType.includes('dot')) {
    lineStyle = 'dot';
  } else if (lowerSubType.includes('dashdot') || lowerSubType.includes('dash-dot')) {
    lineStyle = 'dashdot';
  }
  
  // Determine line width based on subType
  let lineWidth = 2;
  if (lowerSubType.includes('thick') || lowerSubType.includes('bold')) {
    lineWidth = 3;
  } else if (lowerSubType.includes('thin') || lowerSubType.includes('light')) {
    lineWidth = 1;
  }
  
  // Determine marker size
  let markerSize = 8;
  if (lowerSubType.includes('large') || lowerSubType.includes('big')) {
    markerSize = 12;
  } else if (lowerSubType.includes('small') || lowerSubType.includes('tiny')) {
    markerSize = 6;
  }
  
  // Determine if markers should be shown
  const showMarkers = lowerSubType.includes('marker') || 
                     lowerSubType.includes('point') || 
                     lowerSubType.includes('symbol');
  
  return {
    lineStyle,
    lineWidth,
    markerSize,
    showMarkers
  };
};

/**
 * Create line trace with comprehensive configuration
 */
const createLineTrace = (config: any): any => {
  const {
    xv, yv, label, color, symbol, subType,
    errorCalculationUpper, errorCalculationLower, errorBarVariable, errorBarData, 
    errorBarVariableX, errorBarVariableY, errorBarDataX, errorBarDataY, errorBarColor, rows,
    lineStyle, lineWidth, markerSize, showMarkers
  } = config;
  
  const isErrorBar = subType.toLowerCase().includes('error bar');
  const isVerticalErrorBar = subType.toLowerCase().includes('vertical') && isErrorBar;
  const isHorizontalErrorBar = subType.toLowerCase().includes('horizontal') && isErrorBar;
  const isAsymmetricErrorBar = subType.toLowerCase().includes('asymmetric') && isErrorBar;
  const isBidirectionalErrorBar = subType.toLowerCase().includes('bidirectional') && isErrorBar;
  
  // Get line shape for step plots
  const lineShape = getLineShape(subType);
  
  let traceConfig: any = {
    x: xv,
    y: yv,
    name: label,
    type: 'scatter',
    mode: showMarkers ? 'lines+markers' : 'lines',
    line: {
      color: color,
      width: lineWidth,
      dash: lineStyle,
      shape: lineShape  // Add line shape for step plots
    }
  };
  
  // Force step plots to use 'lines' mode only (no markers)
  if (subType.toLowerCase().includes('step plot') || subType.toLowerCase().includes('midpoint step')) {
    traceConfig.mode = 'lines';
    console.log(`🔍 Forcing step plot to lines mode (traceGeneration):`, {
      subType,
      originalMode: showMarkers ? 'lines+markers' : 'lines',
      forcedMode: 'lines'
    });
  }
  
  // Debug logging for step plots
  if (subType.toLowerCase().includes('step plot')) {
    console.log(`🔍 Step Plot Debug:`, {
      subType,
      showMarkers,
      mode: traceConfig.mode,
      lineShape
    });
  }
  
  // Add markers ONLY if explicitly requested (not by default for line plots)
  if (showMarkers === true) {
    traceConfig.marker = {
      color: color,
      symbol: symbol || 'circle',
      size: markerSize
    };
  } else {
    // Ensure no markers are shown for clean line plots
    traceConfig.marker = {
      color: 'transparent',
      size: 0
    };
  }
  
  // Handle error bars for line plots
  if (isErrorBar) {
    // Get error bar data
    let errorBarDataForCalculation: number[] | undefined;
    let errorBarDataXForCalculation: number[] | undefined;
    let errorBarDataYForCalculation: number[] | undefined;
    
    if (isBidirectionalErrorBar) {
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
      errorBarDataForCalculation = rows.map((row: any) => {
        const value = row[errorBarVariable];
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      });
    }
    
    // Calculate error values
    const errorValues = calculateErrorValues({
      xv, yv, symbolValue: '', 
      subType: subType || '',
      errorCalculationUpper, errorCalculationLower, 
      errorBarData: errorBarDataForCalculation,
      errorBarDataX: errorBarDataXForCalculation,
      errorBarDataY: errorBarDataYForCalculation
    });
    
    // Apply error bars
    if (isVerticalErrorBar || (!isHorizontalErrorBar && !isBidirectionalErrorBar)) {
      if (isAsymmetricErrorBar) {
        traceConfig.error_y = {
          type: 'data',
          symmetric: false,
          array: errorValues.yUpper,
          arrayminus: errorValues.yLower,
          color: errorBarColor || color
        };
      } else {
        traceConfig.error_y = {
          type: 'data',
          symmetric: true,
          array: errorValues.ySymmetric,
          color: errorBarColor || color
        };
      }
    } else if (isHorizontalErrorBar) {
      if (isAsymmetricErrorBar) {
        traceConfig.error_x = {
          type: 'data',
          symmetric: false,
          array: errorValues.xUpper,
          arrayminus: errorValues.xLower,
          color: errorBarColor || color
        };
      } else {
        traceConfig.error_x = {
          type: 'data',
          symmetric: true,
          array: errorValues.xSymmetric,
          color: errorBarColor || color
        };
      }
    } else if (isBidirectionalErrorBar) {
      if (isAsymmetricErrorBar) {
        traceConfig.error_y = {
          type: 'data',
          symmetric: false,
          array: errorValues.yUpper,
          arrayminus: errorValues.yLower,
          color: errorBarColor || color
        };
        traceConfig.error_x = {
          type: 'data',
          symmetric: false,
          array: errorValues.xUpper,
          arrayminus: errorValues.xLower,
          color: errorBarColor || color
        };
      } else {
        traceConfig.error_y = {
          type: 'data',
          symmetric: true,
          array: errorValues.ySymmetric,
          color: errorBarColor || color
        };
        traceConfig.error_x = {
          type: 'data',
          symmetric: true,
          array: errorValues.xSymmetric,
          color: errorBarColor || color
        };
      }
    }
  }
  
  return traceConfig;
};

/**
 * Create trace based on plot type - automatically determines line vs scatter vs 3D mesh
 */
export const createTrace = (config: TraceConfig): any => {
  const plotType = determinePlotType(config.graphConfig);
  
  console.log(`🎨 Creating trace for plot type: ${plotType}`, {
    label: config.label,
    subType: config.subType,
    dataFormat: config.graphConfig?.dataFormat,
    xLength: config.xv.length,
    yLength: config.yv.length,
    zLength: config.zv?.length || 0
  });

  switch (plotType) {
    case 'scatter':
      return createScatterTrace(config);
    case 'line':
      return createLinePlotTrace(config);
    case '3d-mesh':
      return create3DMeshTrace(config);
    default:
      console.warn(`Unknown plot type: ${plotType}, falling back to scatter`);
      return createScatterTrace(config);
  }
};

/**
 * Create multiple traces for different plot types
 */
export const createTraces = (configs: TraceConfig[]): any[] => {
  return configs.map(config => createTrace(config));
};

/**
 * Create regression traces if needed based on plot type and configuration
 */
export const createRegressionTracesIfNeeded = (
  xVals: number[],
  yVals: number[],
  label: string, 
  color: string, 
  subType: string,
  showConfidenceInterval: boolean = true,
  confidenceIntervalOpacity: number = 0.2
): any[] => {
  // Import regression functions directly
  const { computeLinearRegression, createRegressionTraces } = require('./regressionAnalysis');
  
  // Check if regression should be applied based on subType
  const lowerSubType = subType?.toLowerCase() || '';
  const shouldApplyRegression = subType && (
    lowerSubType.includes('regression') || 
    lowerSubType.includes('trend') ||
    lowerSubType.includes('linear')
  );
  
  console.log(`🔍 Regression Detection for "${label}":`, {
    subType,
    lowerSubType,
    shouldApplyRegression,
    xValsLength: xVals.length,
    yValsLength: yVals.length
  });
  
  if (!shouldApplyRegression || xVals.length < 2 || yVals.length < 2) {
    return [];
  }
  
  try {
    console.log(`📊 Computing regression for "${label}" with ${xVals.length} data points`);
    
    // Validate data before regression
    const validX = xVals.filter(x => Number.isFinite(x));
    const validY = yVals.filter(y => Number.isFinite(y));
    
    if (validX.length < 2 || validY.length < 2) {
      console.warn(`⚠️ Insufficient valid data for regression: ${validX.length} X values, ${validY.length} Y values`);
      return [];
    }
    
    // Compute linear regression
    const regressionResult = computeLinearRegression(xVals, yVals);
    
    if (!regressionResult) {
      console.warn(`⚠️ Could not compute regression for "${label}" - insufficient data or invalid values`);
      return [];
    }
    
    console.log(`✅ Regression computed for "${label}":`, {
      slope: regressionResult.m,
      intercept: regressionResult.b,
      rSquared: regressionResult.rSquared
    });
    
    // Create regression traces
    const regressionTraces = createRegressionTraces(
      xVals,
      yVals,
      `${label} (Regression)`,
      color,
      subType,
      regressionResult,
      showConfidenceInterval,
      confidenceIntervalOpacity
    );
    
    console.log(`📈 Created ${regressionTraces.length} regression traces for "${label}"`);
    
    // Add a simple test line to ensure something is visible
    if (regressionTraces.length === 0) {
      console.log(`🔧 Creating fallback regression line for "${label}"`);
      const testTrace = {
        x: [Math.min(...validX), Math.max(...validX)],
        y: [Math.min(...validY), Math.max(...validY)],
        type: 'scatter',
        mode: 'lines',
        name: `${label} (Test Line)`,
        line: { 
          color: '#ff0000', 
          width: 5, 
          dash: 'solid' 
        },
        showlegend: true,
        visible: true
      };
      return [testTrace];
    }
    
    return regressionTraces;
  } catch (error) {
    console.error(`❌ Error creating regression traces for "${label}":`, error);
    return [];
  }
};