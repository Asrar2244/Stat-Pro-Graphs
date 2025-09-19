import type { ScatterSubType, DataFormat } from './scatterPlotSlice';

export const SUB_TYPES: ScatterSubType[] = [
  'Simple Scatter',
  'Simple Scatter Regression',
  'Multi Scatter',
  'Multi Scatter Regression',
  'Simple Scatter Error Bar',
  'Simple Scatter Error Bar and Regression',
  'Multi Scatter Error Bar',
  'Multi Scatter Error Bar and Regression',
  'Simple Scatter Horizontal Error Bar',
  'Simple Scatter Bidirectional Error Bars',
  'Vertical Asymmetric Error Bars',
  'Horizontal Asymmetric Error Bars',
  'Vertical Point Plots',
  'Horizontal Point Plots',
  'Vertical Dot Plot',
  'Horizontal Dot Plot',
];

export const DATA_FORMATS: DataFormat[] = [
  'XY Pair',
  'Single Y',
  'Single X',
  // Multi Scatter formats
  'XY Pairs',
  'X Many Y',
  'Y Many X',
  'Many X',
  'Many Y',
  'XY Category',
  'X Category',
  'Y Category',
];


