/**
 * Main data processing orchestrator
 * Routes data processing to appropriate plot type modules
 */

import { ProcessedSeries, DataProcessingConfig } from './common/types';
import { determinePlotType } from './common/plotTypeDetection';

// Import plot-specific data processors
import { processScatterData } from './scatter/scatterDataProcessing';
import { processLineData } from './line/lineDataProcessing';
import { processLineScatterData } from './line-scatter/lineScatterDataProcessing';
import { process3DMeshData } from './3d-mesh/meshDataProcessing';
import { process3DScatterData } from './3d-scatter/scatterDataProcessing';
import { processBoxData } from './box/boxDataProcessing';
import { processPieData } from './pie/pieDataProcessing';

/**
 * Main data processing function that routes to appropriate plot type
 */
export const processDataByFormat = (config: DataProcessingConfig): ProcessedSeries[] => {
  const plotType = determinePlotType(config.graphConfig);

  switch (plotType) {
    case 'scatter':
      return processScatterData(config);
    case 'line':
      return processLineData(config);
    case 'line-scatter':
      return processLineScatterData(config);
    case '3d-mesh':
      return process3DMeshData(config);
    case '3d-scatter':
      return process3DScatterData(config);
    case 'box':
      return processBoxData(config);
    case 'pie':
      return processPieData(config);
    default:
      return processScatterData(config);
  }
};