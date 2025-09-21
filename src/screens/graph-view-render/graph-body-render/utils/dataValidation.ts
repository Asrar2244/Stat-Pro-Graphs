/**
 * Data validation and outlier detection utilities
 * SigmaPlot-style data quality assessment
 */

export interface DataQualityReport {
  isValid: boolean;
  outliers: number[];
  missingValues: number[];
  warnings: string[];
  recommendations: string[];
}

export interface ValidationOptions {
  outlierMethod: 'iqr' | 'zscore' | 'modified_zscore' | 'grubbs' | 'none';
  outlierThreshold: number;
  missingValueThreshold: number;
  minSampleSize: number;
}

/**
 * Detect outliers using various statistical methods
 */
export const detectOutliers = (
  values: number[], 
  method: ValidationOptions['outlierMethod'] = 'iqr',
  threshold: number = 1.5
): number[] => {
  if (values.length < 3) return [];
  
  const sorted = [...values].sort((a, b) => a - b);
  const n = values.length;
  
  switch (method) {
    case 'iqr':
      return detectOutliersIQR(values, threshold);
    case 'zscore':
      return detectOutliersZScore(values, threshold);
    case 'modified_zscore':
      return detectOutliersModifiedZScore(values, threshold);
    case 'grubbs':
      return detectOutliersGrubbs(values);
    default:
      return [];
  }
};

/**
 * IQR-based outlier detection (SigmaPlot default)
 */
const detectOutliersIQR = (values: number[], threshold: number = 1.5): number[] => {
  const sorted = [...values].sort((a, b) => a - b);
  const n = values.length;
  
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - threshold * iqr;
  const upperBound = q3 + threshold * iqr;
  
  return values
    .map((val, index) => ({ val, index }))
    .filter(({ val }) => val < lowerBound || val > upperBound)
    .map(({ index }) => index);
};

/**
 * Z-score based outlier detection
 */
const detectOutliersZScore = (values: number[], threshold: number = 2.5): number[] => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1));
  
  if (std === 0) return [];
  
  return values
    .map((val, index) => ({ val, index, zScore: Math.abs(val - mean) / std }))
    .filter(({ zScore }) => zScore > threshold)
    .map(({ index }) => index);
};

/**
 * Modified Z-score using median absolute deviation (MAD)
 */
const detectOutliersModifiedZScore = (values: number[], threshold: number = 3.5): number[] => {
  const median = [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  const mad = values.reduce((sum, val) => sum + Math.abs(val - median), 0) / values.length;
  
  if (mad === 0) return [];
  
  return values
    .map((val, index) => ({ val, index, modifiedZScore: 0.6745 * (val - median) / mad }))
    .filter(({ modifiedZScore }) => Math.abs(modifiedZScore) > threshold)
    .map(({ index }) => index);
};

/**
 * Grubbs test for outlier detection
 */
const detectOutliersGrubbs = (values: number[]): number[] => {
  if (values.length < 3) return [];
  
  const sorted = [...values].sort((a, b) => a - b);
  const n = values.length;
  const mean = values.reduce((sum, val) => sum + val, 0) / n;
  const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1));
  
  if (std === 0) return [];
  
  // Check extreme values
  const g1 = Math.abs(sorted[0] - mean) / std;
  const g2 = Math.abs(sorted[n - 1] - mean) / std;
  
  // Critical value for Grubbs test (approximate)
  const criticalValue = 1.96; // Simplified for demo
  
  const outliers: number[] = [];
  if (g1 > criticalValue) {
    outliers.push(values.indexOf(sorted[0]));
  }
  if (g2 > criticalValue) {
    outliers.push(values.indexOf(sorted[n - 1]));
  }
  
  return outliers;
};

/**
 * Comprehensive data quality assessment
 */
export const assessDataQuality = (
  xValues: number[],
  yValues: number[],
  options: Partial<ValidationOptions> = {}
): DataQualityReport => {
  const defaultOptions: ValidationOptions = {
    outlierMethod: 'iqr',
    outlierThreshold: 1.5,
    missingValueThreshold: 0.1,
    minSampleSize: 3,
    ...options
  };
  
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Check sample size
  if (xValues.length < defaultOptions.minSampleSize) {
    warnings.push(`Small sample size (${xValues.length}). Consider collecting more data.`);
  }
  
  // Check for missing values
  const xMissing = xValues.filter(val => val === null || val === undefined || isNaN(val)).length;
  const yMissing = yValues.filter(val => val === null || val === undefined || isNaN(val)).length;
  const missingRatio = (xMissing + yMissing) / (xValues.length * 2);
  
  if (missingRatio > defaultOptions.missingValueThreshold) {
    warnings.push(`High missing value ratio (${(missingRatio * 100).toFixed(1)}%). Consider data cleaning.`);
    recommendations.push('Review data collection process and handle missing values appropriately.');
  }
  
  // Detect outliers
  const xOutliers = detectOutliers(xValues, defaultOptions.outlierMethod, defaultOptions.outlierThreshold);
  const yOutliers = detectOutliers(yValues, defaultOptions.outlierMethod, defaultOptions.outlierThreshold);
  const allOutliers = [...new Set([...xOutliers, ...yOutliers])];
  
  if (allOutliers.length > 0) {
    warnings.push(`${allOutliers.length} potential outliers detected.`);
    recommendations.push('Review outliers for data entry errors or consider robust statistical methods.');
  }
  
  // Check data range and variability
  const xRange = Math.max(...xValues) - Math.min(...xValues);
  const yRange = Math.max(...yValues) - Math.min(...yValues);
  
  if (xRange === 0) {
    warnings.push('No variation in X values detected.');
    recommendations.push('Consider using different X variable or check data.');
  }
  
  if (yRange === 0) {
    warnings.push('No variation in Y values detected.');
    recommendations.push('Consider using different Y variable or check data.');
  }
  
  // Check for sufficient variability for error calculations
  const xStd = Math.sqrt(xValues.reduce((sum, val) => sum + Math.pow(val - xValues.reduce((s, v) => s + v, 0) / xValues.length, 2), 0) / (xValues.length - 1));
  const yStd = Math.sqrt(yValues.reduce((sum, val) => sum + Math.pow(val - yValues.reduce((s, v) => s + v, 0) / yValues.length, 2), 0) / (yValues.length - 1));
  
  if (xStd < 0.001) {
    warnings.push('Very low variability in X values may affect error calculations.');
  }
  
  if (yStd < 0.001) {
    warnings.push('Very low variability in Y values may affect error calculations.');
  }
  
  return {
    isValid: warnings.length === 0,
    outliers: allOutliers,
    missingValues: [...xValues.map((val, i) => ({ val, i })).filter(({ val }) => val === null || val === undefined || isNaN(val)).map(({ i }) => i),
                   ...yValues.map((val, i) => ({ val, i })).filter(({ val }) => val === null || val === undefined || isNaN(val)).map(({ i }) => i)],
    warnings,
    recommendations
  };
};

/**
 * Clean data by removing outliers and missing values
 */
export const cleanData = (
  xValues: number[],
  yValues: number[],
  options: Partial<ValidationOptions> = {}
): { xValues: number[]; yValues: number[]; removedIndices: number[] } => {
  const qualityReport = assessDataQuality(xValues, yValues, options);
  
  const validIndices = xValues
    .map((_, i) => i)
    .filter(i => 
      !qualityReport.outliers.includes(i) &&
      !qualityReport.missingValues.includes(i) &&
      !isNaN(xValues[i]) && !isNaN(yValues[i]) &&
      xValues[i] !== null && yValues[i] !== null &&
      xValues[i] !== undefined && yValues[i] !== undefined
    );
  
  return {
    xValues: validIndices.map(i => xValues[i]),
    yValues: validIndices.map(i => yValues[i]),
    removedIndices: xValues.map((_, i) => i).filter(i => !validIndices.includes(i))
  };
};
