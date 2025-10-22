/**
 * Line-scatter plot trace generation utilities
 * Generates Plotly traces for line-scatter plots combining both line and scatter elements
 */

import { ProcessedSeries } from '../common/types';
import { LineScatterTraceConfig, LINE_SCATTER_SUB_TYPE_CONFIGS } from './types';

/**
 * Generate Plotly traces for line-scatter plots
 */
export const generateLineScatterTraces = (processedSeries: ProcessedSeries[]): any[] => {
  const traces: any[] = [];

  processedSeries.forEach((series, index) => {
    const trace = generateSingleLineScatterTrace(series, index);
    if (trace) {
      traces.push(trace);
    }
  });

  return traces;
};

/**
 * Generate a single line-scatter trace
 */
function generateSingleLineScatterTrace(series: ProcessedSeries, index: number): any {
  const {
    x,
    y,
    label,
    color,
    symbol,
    subType,
    dataFormat,
    errorBarData,
    categoryData,
    isLinePlot,
    isScatterPlot,
    showMarkers,
    showLines,
    markerSize = 8,
    lineWidth = 2
  } = series;

  // Get sub-type configuration
  const subTypeConfig = LINE_SCATTER_SUB_TYPE_CONFIGS[subType] || LINE_SCATTER_SUB_TYPE_CONFIGS['Simple Straight Line & Scatter Plots'];
  
  // Determine line style based on sub-type
  let lineStyle = 'solid';
  if (subType.includes('Step')) {
    lineStyle = 'hv'; // Step line for step plots
  } else if (subType.includes('Spline')) {
    lineStyle = 'spline'; // Smooth spline for spline plots
  }

  // Base trace configuration
  const trace: any = {
    x: x,
    y: y,
    name: label,
    type: 'scatter',
    mode: determineMode(showMarkers, showLines, subTypeConfig),
    marker: showMarkers ? {
      color: color,
      symbol: getPlotlySymbol(symbol),
      size: markerSize,
      line: {
        color: 'white',
        width: 1
      }
    } : undefined,
    line: showLines ? {
      color: color,
      width: lineWidth,
      shape: lineStyle
    } : undefined,
    hovertemplate: generateHoverTemplate(dataFormat, label),
    showlegend: true,
    legendgroup: `series_${index}`,
    visible: true
  };

  // Add error bars if available
  if (errorBarData && errorBarData.length > 0) {
    trace.error_y = {
      type: 'data',
      array: errorBarData,
      visible: true,
      color: color,
      thickness: 1,
      width: 3
    };
  }

  // Add category information if available
  if (categoryData && categoryData.length > 0) {
    trace.customdata = categoryData;
    trace.hovertemplate = generateHoverTemplateWithCategory(dataFormat, label);
  }

  // Apply sub-type specific configurations
  applySubTypeSpecificConfig(trace, subType, subTypeConfig);

  return trace;
}

/**
 * Determine the mode for the trace based on line and scatter settings
 */
function determineMode(showMarkers: boolean, showLines: boolean, subTypeConfig: any): string {
  if (showMarkers && showLines) {
    return 'lines+markers';
  } else if (showMarkers) {
    return 'markers';
  } else if (showLines) {
    return 'lines';
  } else {
    return 'lines+markers'; // Default to both
  }
}

/**
 * Convert symbol name to Plotly symbol
 */
function getPlotlySymbol(symbol: string): string {
  const symbolMap: Record<string, string> = {
    'circle': 'circle',
    'square': 'square',
    'diamond': 'diamond',
    'triangle-up': 'triangle-up',
    'triangle-down': 'triangle-down',
    'triangle-left': 'triangle-left',
    'triangle-right': 'triangle-right',
    'pentagon': 'pentagon',
    'hexagon': 'hexagon',
    'star': 'star',
    'cross': 'x',
    'x': 'x',
    'plus': '+'
  };
  
  return symbolMap[symbol] || 'circle';
}

/**
 * Generate hover template for the trace
 */
function generateHoverTemplate(dataFormat: string, label: string): string {
  switch (dataFormat) {
    case 'XY Pair':
    case 'XY Pairs':
      return `<b>${label}</b><br>` +
             `X: %{x}<br>` +
             `Y: %{y}<br>` +
             `<extra></extra>`;
    
    case 'Single X':
    case 'Many X':
      return `<b>${label}</b><br>` +
             `Index: %{x}<br>` +
             `X: %{y}<br>` +
             `<extra></extra>`;
    
    case 'Single Y':
    case 'Many Y':
      return `<b>${label}</b><br>` +
             `Index: %{x}<br>` +
             `Y: %{y}<br>` +
             `<extra></extra>`;
    
    case 'X Many Y':
      return `<b>${label}</b><br>` +
             `X: %{x}<br>` +
             `Y: %{y}<br>` +
             `<extra></extra>`;
    
    case 'Y Many X':
      return `<b>${label}</b><br>` +
             `X: %{x}<br>` +
             `Y: %{y}<br>` +
             `<extra></extra>`;
    
    case 'XY Category':
    case 'X Category':
    case 'Y Category':
      return `<b>%{customdata}</b><br>` +
             `X: %{x}<br>` +
             `Y: %{y}<br>` +
             `<extra></extra>`;
    
    default:
      return `<b>${label}</b><br>` +
             `X: %{x}<br>` +
             `Y: %{y}<br>` +
             `<extra></extra>`;
  }
}

/**
 * Generate hover template with category information
 */
function generateHoverTemplateWithCategory(dataFormat: string, label: string): string {
  return `<b>%{customdata}</b><br>` +
         `X: %{x}<br>` +
         `Y: %{y}<br>` +
         `<extra></extra>`;
}

/**
 * Apply sub-type specific configurations to the trace
 */
function applySubTypeSpecificConfig(trace: any, subType: string, subTypeConfig: any): void {
  // Apply step plot configuration
  if (subType.includes('Step')) {
    trace.line.shape = 'hv'; // Step line
    
    // For midpoint step plots, adjust the step positioning
    if (subType.includes('Midpoint')) {
      trace.line.shape = 'hv';
      // Add midpoint step logic if needed
    }
  }
  
  // Apply spline configuration
  if (subType.includes('Spline')) {
    trace.line.shape = 'spline';
    trace.line.smoothing = 0.3; // Smooth spline curves
  }
  
  // Apply error bar specific configurations
  if (subType.includes('Error Bars')) {
    // Ensure error bars are visible and properly styled
    if (trace.error_y) {
      trace.error_y.thickness = 2;
      trace.error_y.width = 4;
    }
    
    // For bidirectional error bars, add X error bars too
    if (subType.includes('Bi-Directional')) {
      // This would need X error bar data, which would be added separately
      // For now, just ensure Y error bars are properly configured
    }
  }
  
  // Apply horizontal error bar configuration
  if (subType.includes('Horizontal Error Bars')) {
    // Horizontal error bars would need error_x instead of error_y
    // This would be handled in the data processing phase
  }
}

/**
 * Generate traces with error bars for line-scatter plots
 */
export const generateLineScatterTracesWithErrorBars = (
  processedSeries: ProcessedSeries[],
  errorBarConfig: {
    symbolValue?: string;
    errorCalculationUpper?: string;
    errorCalculationLower?: string;
  }
): any[] => {
  const traces: any[] = [];

  processedSeries.forEach((series, index) => {
    const trace = generateSingleLineScatterTraceWithErrorBars(series, index, errorBarConfig);
    if (trace) {
      traces.push(trace);
    }
  });

  return traces;
};

/**
 * Generate a single line-scatter trace with error bars
 */
function generateSingleLineScatterTraceWithErrorBars(
  series: ProcessedSeries,
  index: number,
  errorBarConfig: any
): any {
  const baseTrace = generateSingleLineScatterTrace(series, index);
  
  if (!baseTrace) {
    return null;
  }

  // Add error bar configuration
  if (series.errorBarData && series.errorBarData.length > 0) {
    baseTrace.error_y = {
      type: 'data',
      array: series.errorBarData,
      visible: true,
      color: series.color,
      thickness: 2,
      width: 4
    };
  }

  // Apply error bar calculation method if specified
  if (errorBarConfig.errorCalculationUpper || errorBarConfig.errorCalculationLower) {
    // This would integrate with the error calculation utilities
    // For now, use the provided error bar data
  }

  return baseTrace;
}
