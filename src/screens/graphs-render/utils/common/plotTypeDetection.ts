/**
 * Plot type detection utilities
 */

import { PlotType } from './types';

/**
 * Determine plot type based on graph configuration
 */
export const determinePlotType = (graphConfig: any): PlotType['type'] => {
  const subType = graphConfig?.subType || '';
  const lowerSubType = subType.toLowerCase();
  const dataFormat = graphConfig?.dataFormat || '';
  const graphType = graphConfig?.graphType || '';

  // Check if this is a 3D mesh plot based on graph type and data format
  const is3DMeshPlot = (graphType === '3D Mesh Plot' || subType === '3D Mesh Plot' || lowerSubType.includes('3d mesh')) &&
                       ['XYZ Triplets', 'Many Z', 'XY Many Z', 'xyz-columns', 'z-matrix', 'xy-z-columns'].includes(dataFormat);

  if (is3DMeshPlot) {
    return '3d-mesh';
  }

  // Additional check: If graphType is '3D Mesh Plot' but dataFormat is not recognized, still treat as 3D mesh
  if (graphType === '3D Mesh Plot') {
    return '3d-mesh';
  }

  // Check if this is a line-scatter plot
  const isLineScatterPlot = graphType === 'Line-Scatter Plot' ||
                           (lowerSubType.includes('line') && lowerSubType.includes('scatter')) ||
                           lowerSubType.includes('straight line & scatter') ||
                           lowerSubType.includes('spline curve line & scatter') ||
                           lowerSubType.includes('step plot & scatter') ||
                           lowerSubType.includes('error bars') && (lowerSubType.includes('line') || lowerSubType.includes('scatter'));

  if (isLineScatterPlot) {
    return 'line-scatter';
  }

  // Check if this is a line plot based on specific line plot subTypes
  // IMPORTANT: Scatter plots with error bars should NOT be treated as line plots
  const isLinePlot = (lowerSubType.includes('straight line') || 
                     lowerSubType.includes('spline curve') || 
                     lowerSubType.includes('step plot') || 
                     lowerSubType.includes('mid point step') ||
                     lowerSubType.includes('vertical step plot') ||
                     lowerSubType.includes('horizontal step plot') ||
                     lowerSubType.includes('multiple straight lines') ||
                     lowerSubType.includes('multiple spline curves') ||
                     lowerSubType.includes('multiple vertical step plot') ||
                     lowerSubType.includes('multiple horizontal step plot') ||
                     lowerSubType.includes('multiple step plot') ||
                     lowerSubType.includes('multiple mid point step plot') ||
                     lowerSubType.includes('area') ||
                     lowerSubType.includes('multiple area')) &&
                     !lowerSubType.includes('scatter') && // Exclude scatter plots
                     !lowerSubType.includes('error bar'); // Exclude error bar plots

  if (isLinePlot) {
    return 'line';
  }

  // Default to scatter plot
  return 'scatter';
};

/**
 * Get full plot type information
 */
export const getPlotTypeInfo = (graphConfig: any): PlotType => {
  return {
    type: determinePlotType(graphConfig),
    dataFormat: graphConfig?.dataFormat || '',
    subType: graphConfig?.subType || ''
  };
};
