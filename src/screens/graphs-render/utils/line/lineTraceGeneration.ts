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
  
  // Enhanced detection for all vertical step plot variants
  const isAnyVerticalStepPlot = isVerticalStepPlot || 
                                isMidPointStepPlot || 
                                lowerSubType.includes('vertical') ||
                                (lowerSubType.includes('step') && lowerSubType.includes('vertical'));

  // Multiple vs Simple
  const isMultipleSeries = lowerSubType.includes('multiple');
  const isSimpleSeries = lowerSubType.includes('simple');

  // Process data for midpoint step plots
  let processedX = xv;
  let processedY = yv;
  
  // For midpoint step plots, create midpoint data
  if (isMidPointStepPlot && xv.length > 1) {
    const midX: number[] = [];
    const midY: number[] = [];
    
    // Check if this is a vertical midpoint step plot
    const isVerticalMidPointStepPlot = isMidPointStepPlot && lowerSubType.includes('vertical');
    
    if (isVerticalMidPointStepPlot) {
      // For Vertical Mid Point Step Plot: start vertical, then create midpoints
      // Add first point
      midX.push(xv[0]);
      midY.push(yv[0]);
      
      // Create midpoint data: each segment becomes vertical then horizontal
      for (let i = 0; i < xv.length - 1; i++) {
        // Add vertical segment: go up to next Y value at current X
        midX.push(xv[i]);
        midY.push(yv[i + 1]); // Next Y value at current X (vertical step)
        
        // Add horizontal segment: go to midpoint X at next Y value
        const midPointX = (xv[i] + xv[i + 1]) / 2;
        midX.push(midPointX);
        midY.push(yv[i + 1]); // Keep next Y value for horizontal step
      }
      
      // Add the last point
      midX.push(xv[xv.length - 1]);
      midY.push(yv[yv.length - 1]);
      
      console.log('📊 Vertical Mid Point Step Plot Data Processing:', {
        originalLength: xv.length,
        processedLength: midX.length,
        originalX: xv.slice(0, 3),
        processedX: midX.slice(0, 6),
        originalY: yv.slice(0, 3),
        processedY: midY.slice(0, 6),
        note: 'Starts vertical, then creates midpoints'
      });
    } else {
      // For Horizontal Mid Point Step Plot: keep original behavior (horizontal first)
      // Add first point
      midX.push(xv[0]);
      midY.push(yv[0]);
      
      // Create midpoint data: each point becomes the midpoint between current and next
      for (let i = 0; i < xv.length - 1; i++) {
        // Add current point
        midX.push(xv[i]);
        midY.push(yv[i]);
        
        // Add midpoint between current and next
        const midPointX = (xv[i] + xv[i + 1]) / 2;
        const midPointY = yv[i]; // Keep current Y value for horizontal step
        midX.push(midPointX);
        midY.push(midPointY);
      }
      
      // Add the last point
      midX.push(xv[xv.length - 1]);
      midY.push(yv[yv.length - 1]);
      
      console.log('📊 Horizontal Mid Point Step Plot Data Processing:', {
        originalLength: xv.length,
        processedLength: midX.length,
        originalX: xv.slice(0, 3),
        processedX: midX.slice(0, 6),
        originalY: yv.slice(0, 3),
        processedY: midY.slice(0, 6),
        note: 'Keeps original horizontal-first behavior'
      });
    }
    
    processedX = midX;
    processedY = midY;
  }

  // Determine line shape based on subType
  let lineShape = 'linear';
  if (isSplinePlot) {
    lineShape = 'spline';
  } else if (isStepPlot || isMidPointStepPlot) {
    // ALL vertical step plots should start vertical (like Simple Vertical Step Plot)
    if (isAnyVerticalStepPlot) {
      // For ALL Vertical Step Plots (Simple, Multiple, Mid Point): start vertical
      lineShape = 'vh'; // Vertical then horizontal steps (starts vertical)
      console.log('📈 Vertical Step Plot: Using vh shape (starts vertical)', {
        subType,
        isVerticalStepPlot,
        isMidPointStepPlot,
        isAnyVerticalStepPlot
      });
    } else if (isHorizontalStepPlot) {
      lineShape = 'hv'; // Horizontal then vertical steps (for horizontal step plots)
      console.log('📈 Horizontal Step Plot: Using hv shape (starts horizontal)');
    } else {
      lineShape = 'vh'; // Default to vh for step plots (starts vertical)
      console.log('📈 Default Step Plot: Using vh shape (starts vertical)');
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