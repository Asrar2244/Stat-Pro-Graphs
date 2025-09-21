/**
 * Performance optimization utilities for large datasets
 * SigmaPlot-level performance optimizations
 */

export interface PerformanceConfig {
  maxPointsPerTrace: number;
  enableSampling: boolean;
  enableDecimation: boolean;
  enableProgressiveRendering: boolean;
  samplingThreshold: number;
  decimationFactor: number;
  performanceWarningThreshold: number;
}

export interface OptimizedData {
  xv: number[];
  yv: number[];
  originalLength: number;
  optimizedLength: number;
  optimizationMethod: 'none' | 'sampling' | 'decimation' | 'progressive';
  performanceWarning?: string;
}

export interface PerformanceMetrics {
  dataSize: number;
  processingTime: number;
  optimizationApplied: boolean;
  optimizationMethod?: string;
  performanceScore: 'excellent' | 'good' | 'fair' | 'poor';
}

// Default performance configuration (SigmaPlot standards)
const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  maxPointsPerTrace: 10000,        // Maximum points per trace for smooth rendering
  enableSampling: true,            // Enable smart sampling for large datasets
  enableDecimation: true,          // Enable decimation for very large datasets
  enableProgressiveRendering: true, // Enable progressive rendering
  samplingThreshold: 5000,         // Start sampling above this threshold
  decimationFactor: 2,             // Decimation factor (every nth point)
  performanceWarningThreshold: 50000 // Warn about performance above this threshold
};

/**
 * Smart data sampling for large datasets
 */
export const smartSampling = (
  xv: number[],
  yv: number[],
  targetSize: number,
  method: 'random' | 'systematic' | 'adaptive' = 'adaptive'
): OptimizedData => {
  const originalLength = xv.length;
  
  if (originalLength <= targetSize) {
    return {
      xv,
      yv,
      originalLength,
      optimizedLength: originalLength,
      optimizationMethod: 'none'
    };
  }

  let sampledX: number[], sampledY: number[];
  
  switch (method) {
    case 'random':
      // Random sampling - good for general purpose
      const randomIndices = new Set<number>();
      while (randomIndices.size < targetSize) {
        randomIndices.add(Math.floor(Math.random() * originalLength));
      }
      const sortedIndices = Array.from(randomIndices).sort((a, b) => a - b);
      sampledX = sortedIndices.map(i => xv[i]);
      sampledY = sortedIndices.map(i => yv[i]);
      break;
      
    case 'systematic':
      // Systematic sampling - maintains data distribution
      const step = originalLength / targetSize;
      const indices = Array.from({ length: targetSize }, (_, i) => 
        Math.floor(i * step)
      );
      sampledX = indices.map(i => xv[i]);
      sampledY = indices.map(i => yv[i]);
      break;
      
    case 'adaptive':
    default:
      // Adaptive sampling - optimized for very large datasets
      const adaptiveStep = Math.max(1, Math.floor(originalLength / targetSize));
      const adaptiveIndices: number[] = [];
      
      // Include first and last points
      adaptiveIndices.push(0);
      adaptiveIndices.push(originalLength - 1);
      
      // Add systematic samples (more efficient for large datasets)
      for (let i = adaptiveStep; i < originalLength - 1; i += adaptiveStep) {
        if (adaptiveIndices.length < targetSize - 2) {
          adaptiveIndices.push(i);
        }
      }
      
      // For very large datasets, use more systematic approach to avoid infinite loops
      if (originalLength > 100000) {
        // Use only systematic sampling for very large datasets
        const finalStep = Math.max(adaptiveStep, Math.floor(originalLength / (targetSize - adaptiveIndices.length)));
        for (let i = adaptiveStep; i < originalLength - 1; i += finalStep) {
          if (adaptiveIndices.length < targetSize) {
            adaptiveIndices.push(i);
          }
        }
      } else {
        // Add random samples to reach target (only for smaller datasets)
        const maxAttempts = Math.min(targetSize * 2, 10000); // Prevent infinite loops
        let attempts = 0;
        while (adaptiveIndices.length < targetSize && attempts < maxAttempts) {
          const randomIndex = Math.floor(Math.random() * originalLength);
          if (!adaptiveIndices.includes(randomIndex)) {
            adaptiveIndices.push(randomIndex);
          }
          attempts++;
        }
      }
      
      adaptiveIndices.sort((a, b) => a - b);
      sampledX = adaptiveIndices.map(i => xv[i]);
      sampledY = adaptiveIndices.map(i => yv[i]);
      break;
  }

  return {
    xv: sampledX,
    yv: sampledY,
    originalLength,
    optimizedLength: sampledX.length,
    optimizationMethod: 'sampling'
  };
};

/**
 * Data decimation for very large datasets
 */
export const dataDecimation = (
  xv: number[],
  yv: number[],
  factor: number = 2
): OptimizedData => {
  const originalLength = xv.length;
  
  if (originalLength <= 1000) {
    return {
      xv,
      yv,
      originalLength,
      optimizedLength: originalLength,
      optimizationMethod: 'none'
    };
  }

  const decimatedX: number[] = [];
  const decimatedY: number[] = [];
  
  // Keep every nth point
  for (let i = 0; i < originalLength; i += factor) {
    decimatedX.push(xv[i]);
    decimatedY.push(yv[i]);
  }
  
  // Always include the last point
  if (decimatedX[decimatedX.length - 1] !== xv[originalLength - 1]) {
    decimatedX.push(xv[originalLength - 1]);
    decimatedY.push(yv[originalLength - 1]);
  }

  return {
    xv: decimatedX,
    yv: decimatedY,
    originalLength,
    optimizedLength: decimatedX.length,
    optimizationMethod: 'decimation'
  };
};

/**
 * Progressive rendering for extremely large datasets
 */
export const progressiveRendering = (
  xv: number[],
  yv: number[],
  batchSize: number = 1000
): OptimizedData => {
  const originalLength = xv.length;
  
  if (originalLength <= batchSize) {
    return {
      xv,
      yv,
      originalLength,
      optimizedLength: originalLength,
      optimizationMethod: 'none'
    };
  }

  // For progressive rendering, we'll return a subset for initial render
  // The full dataset can be loaded progressively
  const initialBatch = Math.min(batchSize, originalLength);
  
  return {
    xv: xv.slice(0, initialBatch),
    yv: yv.slice(0, initialBatch),
    originalLength,
    optimizedLength: initialBatch,
    optimizationMethod: 'progressive'
  };
};

/**
 * Main data optimization function
 */
export const optimizeDataForPerformance = (
  xv: number[],
  yv: number[],
  config: Partial<PerformanceConfig> = {}
): OptimizedData => {
  const perfConfig = { ...DEFAULT_PERFORMANCE_CONFIG, ...config };
  const dataSize = xv.length;
  
  // Performance warning for very large datasets
  let performanceWarning: string | undefined;
  if (dataSize > perfConfig.performanceWarningThreshold) {
    performanceWarning = `Large dataset detected (${dataSize} points). Consider data reduction for better performance.`;
  }

  // Determine optimization strategy based on data size
  if (dataSize <= perfConfig.maxPointsPerTrace) {
    return {
      xv,
      yv,
      originalLength: dataSize,
      optimizedLength: dataSize,
      optimizationMethod: 'none',
      performanceWarning
    };
  }

  // Apply appropriate optimization with better thresholds for very large datasets
  if (perfConfig.enableProgressiveRendering && dataSize > 200000) {
    // Only use progressive rendering for extremely large datasets
    return {
      ...progressiveRendering(xv, yv, 2000), // Increased batch size
      performanceWarning
    };
  } else if (perfConfig.enableDecimation && dataSize > 100000) {
    // Use aggressive decimation for very large datasets
    const decimationFactor = Math.max(2, Math.floor(dataSize / perfConfig.maxPointsPerTrace));
    return {
      ...dataDecimation(xv, yv, decimationFactor),
      performanceWarning
    };
  } else if (perfConfig.enableSampling && dataSize > perfConfig.samplingThreshold) {
    // Use smart sampling for large datasets
    return {
      ...smartSampling(xv, yv, perfConfig.maxPointsPerTrace),
      performanceWarning
    };
  }

  return {
    xv,
    yv,
    originalLength: dataSize,
    optimizedLength: dataSize,
    optimizationMethod: 'none',
    performanceWarning
  };
};

/**
 * Performance monitoring and metrics
 */
export const measurePerformance = (
  dataSize: number,
  processingTime: number
): PerformanceMetrics => {
  const performanceScore = (() => {
    if (dataSize < 1000 && processingTime < 100) return 'excellent';
    if (dataSize < 10000 && processingTime < 500) return 'good';
    if (dataSize < 50000 && processingTime < 2000) return 'fair';
    return 'poor';
  })();

  return {
    dataSize,
    processingTime,
    optimizationApplied: dataSize > DEFAULT_PERFORMANCE_CONFIG.maxPointsPerTrace,
    performanceScore
  };
};

/**
 * Optimize error calculations for large datasets
 */
export const optimizeErrorCalculations = (
  xv: number[],
  yv: number[],
  errorCalculationMethod: string,
  sampleSize: number = 1000
): { optimized: boolean; sampleData?: { xv: number[]; yv: number[] } } => {
  const dataSize = xv.length;
  
  // For very large datasets, use sampling for error calculations
  if (dataSize > sampleSize && errorCalculationMethod !== 'Dynamic (Data-driven)') {
    const sampled = smartSampling(xv, yv, sampleSize, 'adaptive');
    return {
      optimized: true,
      sampleData: {
        xv: sampled.xv,
        yv: sampled.yv
      }
    };
  }
  
  return { optimized: false };
};

/**
 * Smart trace optimization for large datasets
 */
export const optimizeTraceForLargeData = (
  traceConfig: any,
  dataSize: number
): any => {
  const optimizedTrace = { ...traceConfig };
  
  // Reduce marker size for large datasets
  if (dataSize > 1000) {
    if (optimizedTrace.marker) {
      optimizedTrace.marker.size = Math.max(2, optimizedTrace.marker.size * 0.7);
      optimizedTrace.marker.opacity = Math.max(0.3, optimizedTrace.marker.opacity * 0.8);
    }
  }
  
  // Disable hover for very large datasets
  if (dataSize > 10000) {
    optimizedTrace.hoverinfo = 'skip';
    delete optimizedTrace.hoverlabel;
  }
  
  // Optimize line rendering for large datasets
  if (optimizedTrace.line && dataSize > 5000) {
    optimizedTrace.line.width = Math.max(1, optimizedTrace.line.width * 0.8);
    optimizedTrace.line.opacity = Math.max(0.5, optimizedTrace.line.opacity * 0.9);
  }
  
  return optimizedTrace;
};

/**
 * Get performance recommendations based on data size
 */
export const getPerformanceRecommendations = (dataSize: number): string[] => {
  const recommendations: string[] = [];
  
  if (dataSize > 100000) {
    recommendations.push('Consider using data sampling or decimation for better performance');
    recommendations.push('Progressive rendering is recommended for datasets this large');
  } else if (dataSize > 50000) {
    recommendations.push('Data decimation may improve rendering performance');
    recommendations.push('Consider reducing marker size and opacity');
  } else if (dataSize > 10000) {
    recommendations.push('Smart sampling can optimize performance while preserving data characteristics');
    recommendations.push('Hover interactions may be disabled for better performance');
  } else if (dataSize > 5000) {
    recommendations.push('Performance is good, but consider optimization for very large datasets');
  }
  
  return recommendations;
};
