/**
 * Line plot trace generation utilities
 */

import { parseLinePlotSubType, getLinePlotMode, getLineShape } from './linePlotProperties';
import { LineTraceConfig, LineStyleConfig } from './types';

/**
 * Create line series trace with various line plot configurations
 */
export const createLinePlotTrace = (config: LineTraceConfig): any => {
  const {
    xv, yv, label, color, symbol, subType, symbolValue,
    errorCalculationUpper, errorCalculationLower, errorBarVariable, errorBarData, 
    errorBarVariableX, errorBarVariableY, errorBarDataX, errorBarDataY, errorBarColor, rows
  } = config;
  
  // Parse line plot specific configuration from subType
  const lineStyle = parseLinePlotSubType(subType);
  const lineShape = getLineShape(subType);
  const mode = getLinePlotMode(subType, lineStyle);
  
  // Create the line trace directly
  let traceConfig: any = {
    x: xv,
    y: yv,
    name: label,
    type: 'scatter',
    mode: mode,
    line: {
      color: color,
      width: lineStyle.lineWidth || 2,
      dash: lineStyle.lineStyle || 'solid',
      shape: lineShape  // This is the key for step plots!
    }
  };
  
  // Add markers ONLY if explicitly requested (not by default for line plots)
  if (lineStyle.showMarkers === true) {
    traceConfig.marker = {
      color: color,
      symbol: symbol || 'circle',
      size: lineStyle.markerSize || 8
    };
  } else {
    // Ensure no markers are shown for clean line plots
    traceConfig.marker = {
      color: 'transparent',
      size: 0
    };
  }
  
  return traceConfig;
};