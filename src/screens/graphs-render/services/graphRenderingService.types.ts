/**
 * Types for graph rendering service
 */

export interface PlotPayload {
  data: any[];
  layout: any;
  config: any;
}

export interface RenderingMetrics {
  totalDataPoints: number;
  traceCount: number;
  hasLargeDataset: boolean;
  recommendedOptimization: 'none' | 'light_sampling' | 'moderate_sampling' | 'aggressive_sampling';
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  exponentialBackoff: boolean;
}
