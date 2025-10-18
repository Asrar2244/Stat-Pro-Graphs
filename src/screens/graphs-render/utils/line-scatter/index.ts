/**
 * Line-scatter plot utilities exports
 */

// Data processing
export { processLineScatterData } from './lineScatterDataProcessing';

// Trace generation
export { 
  generateLineScatterTraces, 
  generateLineScatterTracesWithErrorBars 
} from './lineScatterTraceGeneration';

// Plot properties
export {
  getDefaultLineScatterPlotProperties,
  getLineScatterPlotPropertiesForSubType,
  applyLineScatterPlotProperties,
  getLineScatterColorPalette,
  getLineScatterSymbolPalette,
  getLineScatterLineStyles,
  validateLineScatterPlotProperties,
  mergeLineScatterPlotProperties,
  getLineScatterPlotPropertiesForDataFormat
} from './lineScatterPlotProperties';

// Types
export type {
  LineScatterDataConfig,
  LineScatterTraceConfig,
  LineScatterPlotProperties,
  LineScatterSubTypeConfig
} from './types';

export { LINE_SCATTER_SUB_TYPE_CONFIGS } from './types';
