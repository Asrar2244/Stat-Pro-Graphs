/**
 * Types for axis transformation utilities
 */

export interface AxisTransformConfig {
  value: number;
  scale?: string;
}

export interface TransformArrayConfig {
  array: number[];
  scale?: string;
}

export interface ScaleType {
  type: 'linear' | 'log' | 'category' | 'date';
  transform?: 'reciprocal' | 'logit' | 'probit' | 'weibull' | 'probability';
}
