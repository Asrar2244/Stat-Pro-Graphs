/**
 * Simplified trace generation utilities for plotly graphs
 * Based on the old working implementation
 */

import { calculateErrorValues } from './errorCalculations';
import { computeLinearRegression, createRegressionTraces } from './regressionAnalysis';
import { createLinePlotTrace as createLineTrace } from './line/lineTraceGeneration';
import { LineTraceConfig } from './line/types';
import { parseLinePlotSubType, getLinePlotMode, getLineShape } from './line/linePlotProperties';
import { create3DMeshTrace } from './3d-mesh/meshTraceGeneration';
import { generateLineScatterTraces } from './line-scatter/lineScatterTraceGeneration';
import { processLineScatterData } from './line-scatter/lineScatterDataProcessing';
import { hexToRgba } from './common/plotlyCommon';
// Force rebuild

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
  // For bidirectional error bars - separate X and Y error bar variables
  errorBarVariableX?: string;
  errorBarVariableY?: string;
  errorBarDataX?: number[];
  errorBarDataY?: number[];
  // Error bar color override
  errorBarColor?: string;
  rows: any[];
  // For 3D mesh plots
  zv?: number[];
  graphConfig?: any;
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
  const lineConfig: LineTraceConfig = {
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

  return createLineTrace(lineConfig);
};

/**
 * Create scatter series trace with error bars
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
            visible: true,
            size: errorBarStyle.capSize,
            thickness: errorBarStyle.thickness,
            color: errorBarColor || color
          },
          visible: true
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
    } else if (isBidirectionalErrorBar) {
      // Bidirectional Error Bars with enhanced styling
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
            visible: true,
            size: errorBarStyle.capSize,
            thickness: errorBarStyle.thickness,
            color: errorBarColor || color
          },
          visible: true
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
          visible: true
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
  } else if (isPointPlot) {
    // SigmaPlot-style point plots with professional markers
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
  } else if (isDotPlot) {
    // SigmaPlot-style dot plots with compact, stacked appearance
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
 * Create a line-scatter trace combining both line and scatter elements
 */
export const createLineScatterTrace = (config: TraceConfig): any => {
  const { xv, yv, label, color, symbol, subType, errorBarData, errorBarDataX, errorBarDataY, symbolValue } = config;

  // Determine line style based on sub-type - use the same logic as line plots
  let lineShape = 'linear';
  const lowerSubType = subType.toLowerCase();

  if (lowerSubType.includes('spline curve') || lowerSubType.includes('spline')) {
    lineShape = 'spline';
  } else if (lowerSubType.includes('vertical step')) {
    lineShape = 'vh'; // Vertical then horizontal steps (correct for vertical step plots)
  } else if (lowerSubType.includes('horizontal step')) {
    lineShape = 'hv'; // Horizontal then vertical steps (correct for horizontal step plots)
  } else if (lowerSubType.includes('vertical mid point') || lowerSubType.includes('vertical midpoint')) {
    lineShape = 'vhv'; // Vertical-horizontal-vertical steps for vertical mid-point
  } else if (lowerSubType.includes('horizontal mid point') || lowerSubType.includes('horizontal midpoint')) {
    lineShape = 'hvh'; // Horizontal-vertical-horizontal steps for horizontal mid-point
  } else if (lowerSubType.includes('mid point')) {
    lineShape = 'hvh'; // Default mid-point behavior (horizontal-vertical-horizontal)
  } else if (lowerSubType.includes('step')) {
    lineShape = 'hv'; // Default step behavior
  }

  // Base trace configuration for line-scatter
  const trace: any = {
    x: xv,
    y: yv,
    name: label,
    type: 'scatter',
    mode: 'lines+markers', // Both lines and markers for line-scatter
    marker: {
      color: color,
      symbol: symbol,
      size: 8,
      line: {
        color: 'white',
        width: 1
      }
    },
    line: {
      color: color,
      width: 2,
      shape: lineShape
    },
    hovertemplate: `<b>${label}</b><br>` +
      `X: %{x}<br>` +
      `Y: %{y}<br>` +
      `<extra></extra>`,
    showlegend: true
  };

  // Add error bars if available - use the same logic as scatter plots
  if (errorBarData && errorBarData.length > 0) {
    // Determine error bar type - use the same logic as scatter plots
    const isErrorBar = subType.toLowerCase().includes('error bar');
    const isVerticalErrorBar = subType.toLowerCase().includes('vertical') && isErrorBar;
    const isHorizontalErrorBar = subType.toLowerCase().includes('horizontal') && isErrorBar;
    const isAsymmetricErrorBar = (subType.toLowerCase().includes('asymmetric') || symbolValue === 'Asymmetric Error Bar') && isErrorBar;
    const isBidirectionalErrorBar = (subType.toLowerCase().includes('bidirectional') || subType.toLowerCase().includes('bi-directional')) && isErrorBar;

    // Apply error bar configuration based on type - same logic as scatter plots
    if (isVerticalErrorBar || (!isHorizontalErrorBar && !isBidirectionalErrorBar)) {
      // Vertical Error Bars
      if (isAsymmetricErrorBar) {
        // For asymmetric error bars, use the same logic as scatter plots
        const yUpper = errorBarData.map(val => Math.abs(val));
        const yLower = errorBarData.map(val => Math.abs(val * 0.5)); // 50% of upper value for visible asymmetry

        trace.error_y = {
          type: 'data',
          symmetric: false,
          array: yUpper,
          arrayminus: yLower,
          visible: true,
          color: color,
          thickness: 1.5,
          width: 2,
          opacity: 0.9
        };

      } else {
        // For symmetric error bars (Worksheet Columns)
        trace.error_y = {
          type: 'data',
          symmetric: true,
          array: errorBarData,
          visible: true,
          color: color,
          thickness: 2,
          width: 3,
          opacity: 0.8
        };

      }
    }

    if (isHorizontalErrorBar) {
      // Horizontal Error Bars
      if (isAsymmetricErrorBar) {
        // For asymmetric horizontal error bars
        const xUpper = errorBarData.map(val => Math.abs(val));
        const xLower = errorBarData.map(val => Math.abs(val * 0.5)); // 50% of upper value

        trace.error_x = {
          type: 'data',
          symmetric: false,
          array: xUpper,
          arrayminus: xLower,
          visible: true,
          color: color,
          thickness: 1.5,
          width: 2,
          opacity: 0.9
        };

      } else {
        // For symmetric horizontal error bars
        trace.error_x = {
          type: 'data',
          symmetric: true,
          array: errorBarData,
          visible: true,
          color: color,
          thickness: 2,
          width: 3,
          opacity: 0.8
        };

      }
    }
  }

  // Add bidirectional error bars if available - use the same logic as scatter plots
  if (errorBarDataX && errorBarDataX.length > 0) {
    // Determine error bar type - use the same logic as scatter plots
    const isErrorBar = subType.toLowerCase().includes('error bar');
    const isAsymmetricErrorBar = (subType.toLowerCase().includes('asymmetric') || symbolValue === 'Asymmetric Error Bar') && isErrorBar;
    const isBidirectionalErrorBar = (subType.toLowerCase().includes('bidirectional') || subType.toLowerCase().includes('bi-directional')) && isErrorBar;

    if (isBidirectionalErrorBar) {
      // Bidirectional Error Bars
      if (isAsymmetricErrorBar) {
        // For asymmetric bidirectional X error bars
        const xUpper = errorBarDataX.map(val => Math.abs(val));
        const xLower = errorBarDataX.map(val => Math.abs(val * 0.5)); // 50% of upper value

        trace.error_x = {
          type: 'data',
          symmetric: false,
          array: xUpper,
          arrayminus: xLower,
          visible: true,
          color: color,
          thickness: 1.5,
          width: 2,
          opacity: 0.9
        };

      } else {
        // For symmetric bidirectional X error bars
        trace.error_x = {
          type: 'data',
          symmetric: true,
          array: errorBarDataX,
          visible: true,
          color: color,
          thickness: 2,
          width: 3,
          opacity: 0.8
        };

      }
    }
  }

  if (errorBarDataY && errorBarDataY.length > 0) {
    // Determine error bar type - use the same logic as scatter plots
    const isErrorBar = subType.toLowerCase().includes('error bar');
    const isAsymmetricErrorBar = (subType.toLowerCase().includes('asymmetric') || symbolValue === 'Asymmetric Error Bar') && isErrorBar;
    const isBidirectionalErrorBar = (subType.toLowerCase().includes('bidirectional') || subType.toLowerCase().includes('bi-directional')) && isErrorBar;

    if (isBidirectionalErrorBar) {
      // Bidirectional Error Bars
      if (isAsymmetricErrorBar) {
        // For asymmetric bidirectional Y error bars
        const yUpper = errorBarDataY.map(val => Math.abs(val));
        const yLower = errorBarDataY.map(val => Math.abs(val * 0.5)); // 50% of upper value

        trace.error_y = {
          type: 'data',
          symmetric: false,
          array: yUpper,
          arrayminus: yLower,
          visible: true,
          color: color,
          thickness: 1.5,
          width: 2,
          opacity: 0.9
        };

      } else {
        // For symmetric bidirectional Y error bars
        trace.error_y = {
          type: 'data',
          symmetric: true,
          array: errorBarDataY,
          visible: true,
          color: color,
          thickness: 2,
          width: 3,
          opacity: 0.8
        };

      }
    }
  }

  return trace;
};

/**
 * Create area series trace
 */
export const createAreaTrace = (config: TraceConfig): any => {
  const { xv, yv, label, color, subType } = config;

  const lowerSubType = subType.toLowerCase();
  const isVertical = lowerSubType.includes('vertical');

  // Handle missing axis data (Single X or Single Y) by generating index sequence
  let finalX = xv;
  let finalY = yv;

  const dataFormat = config.graphConfig?.dataFormat || '';

  // Force index generation if explicit 'Single' or 'Many' format is used, even if data was pre-filled
  if (dataFormat === 'Single Y' || dataFormat === 'Many Y') {
    // Single Y or Many Y: X should be index 1, 2, 3...
    finalX = Array.from({ length: finalY.length }, (_, i) => i + 1);
  } else if (dataFormat === 'Single X' || dataFormat === 'Many X') {
    // Single X or Many X: Y should be index 1, 2, 3... (Vertical Area usually)
    finalY = Array.from({ length: finalX.length }, (_, i) => i + 1);
  } else if ((!finalX || finalX.length === 0) && (finalY && finalY.length > 0)) {
    // Fallback: Single Y case (missing X)
    finalX = Array.from({ length: finalY.length }, (_, i) => i + 1);
  } else if ((!finalY || finalY.length === 0) && (finalX && finalX.length > 0)) {
    // Fallback: Single X case (missing Y)
    finalY = Array.from({ length: finalX.length }, (_, i) => i + 1);
  }

  // Basic area trace
  const trace: any = {
    x: finalX,
    y: finalY,
    name: label,
    type: 'scatter',
    mode: 'lines',
    fill: isVertical ? 'tozerox' : 'tozeroy', // Vertical area fills to X axis
    line: {
      color: color,
      width: 2
    },
    marker: {
      color: color
    },
    // Use a transparent fill color derived from the line color for better visibility when overlapping
    fillcolor: color && color.startsWith('#') ? hexToRgba(color, 0.4) : color,
    opacity: 1 // Keep the overall trace opaque (lines/markers), transparency is in fillcolor
  };

  return trace;
};

/**
 * Create trace based on plot type - automatically determines line vs scatter
 */
import { create3DScatterTrace } from './3d-scatter/scatterTraceGeneration';
import { createBoxTrace } from './box/boxTraceGeneration';
import { createPieTrace } from './pie/pieTraceGeneration';

/**
 * Create trace based on plot type - automatically determines line vs scatter
 */
export const createTrace = (config: TraceConfig, traceIndex: number = 0): any => {
  const { subType, label, graphConfig } = config;
  const lowerSubType = subType.toLowerCase();

  // Check if this is a Pie Plot
  if (graphConfig?.graphType === 'Pie Chart' || lowerSubType.includes('pie')) {
    return createPieTrace(config);
  }

  // Check if this is a Box Plot
  if (graphConfig?.graphType === 'Box Plot' || lowerSubType.includes('box plot') || config.subType?.toLowerCase().includes('box')) {
    return createBoxTrace(config, traceIndex);
  }

  // Check if this is a 3D mesh plot
  const is3DMeshPlot = lowerSubType.includes('3d mesh') ||
    subType === '3D Mesh Plot' ||
    config.graphConfig?.graphType === '3D Mesh Plot';

  if (is3DMeshPlot) {
    return create3DMeshTrace(config);
  }

  // Check if this is a 3D scatter plot
  const is3DScatterPlot = lowerSubType.includes('3d scatter') ||
    subType === '3D Scatter Plot' ||
    config.graphConfig?.graphType === '3D Scatter Plot';

  if (is3DScatterPlot) {
    return create3DScatterTrace(config);
  }
  lowerSubType.includes('3d-mesh') ||
    subType === '3D Mesh Plot' ||
    config.graphConfig?.graphType === '3D Mesh Plot';

  if (is3DMeshPlot) {
    return create3DMeshTrace(config);
  }

  // Check if this is an Area Plot
  const isAreaPlot = lowerSubType.includes('area') &&
    !lowerSubType.includes('scatter') &&
    !lowerSubType.includes('line') &&
    !lowerSubType.includes('bar'); // Avoid confusion if other types have 'area' in name

  if (isAreaPlot || config.graphConfig?.graphType === 'Area Plot') {
    return createAreaTrace(config);
  }

  // Check if this is a line-scatter plot
  // IMPORTANT: Only route to line-scatter if it's explicitly a line-scatter plot, NOT pure scatter plots with error bars
  const isLineScatterPlot = (lowerSubType.includes('line') && lowerSubType.includes('scatter') && !lowerSubType.includes('error bar')) ||
    (lowerSubType.includes('straight line') && lowerSubType.includes('scatter') && !lowerSubType.includes('error bar')) ||
    (lowerSubType.includes('spline curve') && lowerSubType.includes('scatter') && !lowerSubType.includes('error bar')) ||
    (lowerSubType.includes('step plot') && lowerSubType.includes('scatter') && !lowerSubType.includes('error bar')) ||
    // Only include error bar plots that are explicitly line-scatter (have both line AND scatter in the name)
    (lowerSubType.includes('error bar') && lowerSubType.includes('line') && lowerSubType.includes('scatter')) ||
    subType === 'Line-Scatter Plot' ||
    config.graphConfig?.graphType === 'Line-Scatter Plot';

  if (isLineScatterPlot) {
    // For line-scatter plots, we need to process the data first and then generate traces
    // This will be handled by the main processing function that calls this
    return createLineScatterTrace(config);
  }

  // Check if this is a line plot based on specific line plot subTypes
  // IMPORTANT: Scatter plots with error bars should NOT be treated as line plots
  const isLinePlot = (lowerSubType.includes('straight line') ||
    lowerSubType.includes('spline curve') ||
    lowerSubType.includes('step plot') ||
    lowerSubType.includes('mid point') ||
    lowerSubType.includes('vertical step') ||
    lowerSubType.includes('horizontal step') ||
    lowerSubType.includes('multiple straight') ||
    lowerSubType.includes('multiple spline') ||
    lowerSubType.includes('multiple vertical') ||
    lowerSubType.includes('multiple horizontal')) &&
    !lowerSubType.includes('scatter') && // Exclude scatter plots
    !lowerSubType.includes('error bar'); // Exclude error bar plots

  if (isLinePlot) {
    return createLinePlotTrace(config);
  } else {
    return createScatterTrace(config);
  }
};

/**
 * Create multiple traces for different plot types
 */
export const createTraces = (configs: TraceConfig[]): any[] => {
  return configs.map((config, index) => createTrace(config, index));
};

/**
 * Create regression traces if needed - SIMPLIFIED VERSION
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
