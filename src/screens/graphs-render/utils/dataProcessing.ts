/**
 * Main data processing orchestrator
 * Routes data processing to appropriate plot type modules
 */

import { ProcessedSeries, DataProcessingConfig } from './common/types';
import { determinePlotType } from './common/plotTypeDetection';

// Import plot-specific data processors
import { processScatterData } from './scatter/scatterDataProcessing';
import { processLineData } from './line/lineDataProcessing';
import { process3DMeshData } from './3d-mesh/meshDataProcessing';

/**
 * Main data processing function that routes to appropriate plot type
 */
export const processDataByFormat = (config: DataProcessingConfig): ProcessedSeries[] => {
  const plotType = determinePlotType(config.graphConfig);
  
  console.log(`🔍 Processing data for plot type: ${plotType}`, {
    dataFormat: config.graphConfig?.dataFormat,
    subType: config.graphConfig?.subType,
    xNames: config.xNames,
    yNames: config.yNames,
    zNames: config.zNames,
    categoryNames: config.categoryNames
  });

  switch (plotType) {
    case 'scatter':
      return processScatterData(config);
    case 'line':
      return processLineData(config);
    case '3d-mesh':
      return process3DMeshData(config);
    default:
      console.warn(`Unknown plot type: ${plotType}, falling back to scatter`);
      return processScatterData(config);
  }
};