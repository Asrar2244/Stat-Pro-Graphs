/**
 * Common utilities exports
 */

export * from './types';
export * from './seriesConfig';
export * from './plotTypeDetection';

// Re-export existing common utilities
export { calculateErrorValues } from '../errorCalculations';
export { computeLinearRegression, createRegressionTraces } from '../regressionAnalysis';

// Re-export trace generation utilities
export { 
  createTrace, 
  createScatterTrace, 
  createLinePlotTrace, 
  createTraces,
  createDotPlotDottedLines,
  getSeriesConfig,
  createRegressionTracesIfNeeded
} from '../traceGeneration';
export { assessDataQuality } from '../dataValidation';
export { optimizeDataForPerformance, measurePerformance, optimizeTraceForLargeData, getPerformanceRecommendations } from '../performanceOptimization';
export { getLegendConfig, getTitleText, getAxisConfig, getAnnotations } from '../layoutConfig';
export { getPlotProperties, applyScatterProperties, applyRegressionProperties, applyErrorBarProperties } from '../plotProperties';
