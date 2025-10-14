// Updated: 2025-10-14 15:05 - Fixed missing createLineTrace export
import { LineTraceConfig } from './linePlotProperties';

/**
 * Create a line plot trace for Plotly.js
 */
export const createLineTrace = (config: LineTraceConfig): any => {
  const {
    xv, yv, label, color, symbol, subType, symbolValue,
    errorCalculationUpper, errorCalculationLower, errorBarVariable, errorBarData,
    errorBarVariableX, errorBarVariableY, errorBarDataX, errorBarDataY, errorBarColor, rows,
    lineStyle = 'solid', lineWidth = 2, markerSize = 8, showMarkers = false
  } = config;

  const isErrorBar = subType.toLowerCase().includes('error bar');
  const isVerticalErrorBar = subType.toLowerCase().includes('vertical') && isErrorBar;
  const isHorizontalErrorBar = subType.toLowerCase().includes('horizontal') && isErrorBar;
  const isAsymmetricErrorBar = (subType.toLowerCase().includes('asymmetric') || symbolValue === 'Asymmetric Error Bar') && isErrorBar;
  const isBidirectionalErrorBar = subType.toLowerCase().includes('bidirectional') && isErrorBar;

  // Line plot type detection
  const lowerSubType = subType.toLowerCase();
  const isLinePlot = lowerSubType.includes('straight line') || lowerSubType.includes('line');
  const isSplinePlot = lowerSubType.includes('spline curve') || lowerSubType.includes('spline');
  const isStepPlot = lowerSubType.includes('step plot') || lowerSubType.includes('step');
  const isAreaPlot = lowerSubType.includes('area');
  const isLineMarkers = lowerSubType.includes('line+markers') || lowerSubType.includes('line with markers');
  const isMarkersOnly = lowerSubType.includes('markers only');

  // Specific step plot types
  const isVerticalStepPlot = lowerSubType.includes('vertical step');
  const isHorizontalStepPlot = lowerSubType.includes('horizontal step');
  const isMidPointStepPlot = lowerSubType.includes('mid point') || lowerSubType.includes('midpoint');

  // Multiple vs Simple
  const isMultipleSeries = lowerSubType.includes('multiple');
  const isSimpleSeries = lowerSubType.includes('simple');

  // Use original data (midpoint logic removed for now)
  let processedX = xv;
  let processedY = yv;

  // Determine line shape based on subType
  let lineShape = 'linear';
  if (isSplinePlot) {
    lineShape = 'spline';
  } else if (isStepPlot) {
    if (isVerticalStepPlot) {
      lineShape = 'vh'; // Vertical then horizontal steps (for vertical step plots)
    } else if (isHorizontalStepPlot) {
      lineShape = 'hv'; // Horizontal then vertical steps (for horizontal step plots)
    } else {
      lineShape = 'hv'; // Default to hv for step plots
    }
  }
  
  // Determine mode based on subType
  let mode = 'lines'; // Default to lines only for line plots
  if (isLineMarkers || (isLinePlot && showMarkers)) {
    mode = 'lines+markers';
  } else if (isMarkersOnly) {
    mode = 'markers';
  } else if (isStepPlot || isMidPointStepPlot) {
    // Step plots and midpoint plots: lines only, no markers
    mode = 'lines';
  } else if (isLinePlot && !isLineMarkers) {
    mode = 'lines'; // Lines only, no markers
  }

  let traceConfig: any = {
    x: processedX, // Use processed data for midpoint plots
    y: processedY, // Use processed data for midpoint plots
    name: label,
    type: 'scatter',
    mode: mode,
    line: {
      color: color,
      width: lineWidth,
      shape: lineShape,
      dash: getLineDashStyle(lineStyle)
    }
  };

  // Configure markers only when explicitly requested
  if (showMarkers && (mode.includes('markers') || mode === 'lines+markers')) {
    traceConfig.marker = {
      color: color,
      symbol: symbol,
      size: markerSize,
      line: {
        width: 1,
        color: color
      }
    };
  } else {
    // Explicitly set no markers for clean line plots (including step plots and midpoint plots)
    traceConfig.marker = {
      size: 0,
      opacity: 0
    };
  }

  // Configure trace based on sub-type and error bar configuration
  if (isErrorBar) {
    // Get error bar data if needed
    let errorBarDataForCalculation: number[] | undefined;

    if (isAsymmetricErrorBar) {
      // For asymmetric error bars, we need separate upper and lower values
      if (errorCalculationUpper && errorCalculationLower) {
        // Use the calculation methods to get error values (use original data, not processed)
        const upperValues = getErrorBarValues(xv, yv, errorBarData, errorCalculationUpper, rows);
        const lowerValues = getErrorBarValues(xv, yv, errorBarData, errorCalculationLower, rows);
        
        if (isVerticalErrorBar) {
          traceConfig.error_y = {
            type: 'data',
            symmetric: false,
            array: upperValues,
            arrayminus: lowerValues,
            color: errorBarColor || color
          };
        } else if (isHorizontalErrorBar) {
          traceConfig.error_x = {
            type: 'data',
            symmetric: false,
            array: upperValues,
            arrayminus: lowerValues,
            color: errorBarColor || color
          };
        }
      }
    } else if (isBidirectionalErrorBar) {
      // Bidirectional error bars (both X and Y)
      if (errorBarDataX && errorBarDataY) {
        traceConfig.error_x = {
          type: 'data',
          array: errorBarDataX,
          color: errorBarColor || color
        };
        traceConfig.error_y = {
          type: 'data',
          array: errorBarDataY,
          color: errorBarColor || color
        };
      }
    } else {
      // Standard symmetric error bars
      if (isVerticalErrorBar && errorBarData) {
        traceConfig.error_y = {
          type: 'data',
          array: errorBarData,
          color: errorBarColor || color
        };
      } else if (isHorizontalErrorBar && errorBarData) {
        traceConfig.error_x = {
          type: 'data',
          array: errorBarData,
          color: errorBarColor || color
        };
      }
    }
  }

  // Area plot configuration
  if (isAreaPlot) {
    traceConfig.fill = 'tonexty';
    traceConfig.fillcolor = color + '40'; // Add transparency
  }

  console.log(`🎨 Line Plot Trace Created:`, {
    label,
    subType,
    color,
    lineStyle,
    lineWidth,
    markerSize,
    showMarkers,
    mode,
    lineShape,
    isStepPlot,
    isMidPointStepPlot,
    isVerticalStepPlot,
    isHorizontalStepPlot,
    hasErrorBars: isErrorBar,
    markersConfigured: showMarkers && (mode.includes('markers') || mode === 'lines+markers'),
    dataPoints: xv.length
  });

  return traceConfig;
};

/**
 * Get line dash style based on line style
 */
function getLineDashStyle(lineStyle: string): string {
  switch (lineStyle.toLowerCase()) {
    case 'dashed':
      return 'dash';
    case 'dotted':
      return 'dot';
    case 'dashdot':
      return 'dashdot';
    default:
      return 'solid';
  }
}

/**
 * Get error bar values based on calculation method
 */
function getErrorBarValues(xv: any[], yv: any[], errorBarData: number[] | undefined, calculation: string, rows: any[]): number[] {
  if (!errorBarData || errorBarData.length === 0) {
    return new Array(xv.length).fill(0);
  }

  switch (calculation.toLowerCase()) {
    case 'standard deviation':
      return errorBarData.map(val => val); // Already calculated
    case 'standard error':
      return errorBarData.map(val => val); // Already calculated
    case 'confidence interval':
      return errorBarData.map(val => val); // Already calculated
    case 'percentage':
      return yv.map((y, index) => (y * (errorBarData[index] || 0)) / 100);
    default:
      return errorBarData.map(val => val);
  }
}

/**
 * Default hover template for line plots
 */
export const getDefaultLinePlotHoverTemplate = (): string => {
  return '<b>%{fullData.name}</b><br>' +
         'X: %{x}<br>' +
         'Y: %{y}<br>' +
         '<extra></extra>';
};

/**
 * Default hover configuration
 */
export const getDefaultLinePlotHoverConfig = (): any => {
  return {
    bgcolor: 'rgba(255,255,255,0.95)',
    bordercolor: 'rgba(0,0,0,0.3)',
    font: { size: 12, color: 'rgba(0,0,0,0.8)' }
  };
};