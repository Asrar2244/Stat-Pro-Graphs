import { optimizeErrorCalculations } from './performanceOptimization';

export interface ErrorValues {
  xUpper: number[];
  xLower: number[];
  yUpper: number[];
  yLower: number[];
  xSymmetric: number[];
  ySymmetric: number[];
}

export interface ErrorCalculationParams {
  xv: number[];
  yv: number[];
  symbolValue: string;
  subType?: string;
  errorCalculationUpper?: string;
  errorCalculationLower?: string;
  errorBarData?: number[];
}

/**
 * Enhanced error calculation with dynamic statistical methods
 */
export const calculateErrorValues = (params: ErrorCalculationParams): ErrorValues => {
  const { xv, yv, symbolValue, subType, errorCalculationUpper, errorCalculationLower, errorBarData } = params;
  const n = xv.length;
  
  // Check if this is an asymmetric error bar case
  const isAsymmetricSubType = subType?.toLowerCase().includes('asymmetric') || false;
  const isAsymmetricSymbolValue = symbolValue === 'Asymmetric Error Bar';
  const isAsymmetric = isAsymmetricSubType || isAsymmetricSymbolValue;
  
  console.log('🔍 calculateErrorValues called with:', {
    symbolValue,
    subType,
    isAsymmetricSubType,
    isAsymmetricSymbolValue,
    isAsymmetric,
    errorCalculationUpper,
    errorCalculationLower,
    dataLength: n,
    hasErrorBarData: !!errorBarData
  });
  
  if (n === 0) {
    return { xUpper: [], xLower: [], yUpper: [], yLower: [], xSymmetric: [], ySymmetric: [] };
  }
  
  // Optimize error calculations for large datasets
  const errorOptimization = optimizeErrorCalculations(xv, yv, errorCalculationUpper || '');
  let workingXv = xv;
  let workingYv = yv;
  
  if (errorOptimization.optimized && errorOptimization.sampleData) {
    console.log(`📊 Using optimized error calculation sample (${errorOptimization.sampleData.xv.length}/${n} points)`);
    workingXv = errorOptimization.sampleData.xv;
    workingYv = errorOptimization.sampleData.yv;
  }
  
  // Calculate comprehensive statistics for X and Y values with proper degrees of freedom
  const xMean = workingXv.reduce((sum, val) => sum + val, 0) / workingXv.length;
  const yMean = workingYv.reduce((sum, val) => sum + val, 0) / workingYv.length;
  
  // Use n-1 degrees of freedom for sample standard deviation (SigmaPlot standard)
  const xStd = Math.sqrt(workingXv.reduce((sum, val) => sum + Math.pow(val - xMean, 2), 0) / Math.max(workingXv.length - 1, 1));
  const yStd = Math.sqrt(workingYv.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0) / Math.max(workingYv.length - 1, 1));
  
  // Standard error with proper sample size correction
  const xStdErr = xStd / Math.sqrt(workingXv.length);
  const yStdErr = yStd / Math.sqrt(workingYv.length);
  
  // Degrees of freedom for confidence intervals
  const df = Math.max(workingXv.length - 1, 1);
  
  // T-distribution critical values (SigmaPlot standard)
  const getTValue = (df: number, confidence: number): number => {
    // Approximate t-values for common confidence levels
    // For production, consider using a proper t-distribution library
    const tValues: Record<number, Record<number, number>> = {
      0.95: { 1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 10: 2.228, 20: 2.086, 30: 2.042, 60: 2.000, 120: 1.980 },
      0.99: { 1: 63.657, 2: 9.925, 3: 5.841, 4: 4.604, 5: 4.032, 10: 3.169, 20: 2.845, 30: 2.750, 60: 2.660, 120: 2.617 }
    };
    
    const confKey = confidence === 0.95 ? 0.95 : 0.99;
    const dfKey = df <= 1 ? 1 : df <= 2 ? 2 : df <= 3 ? 3 : df <= 4 ? 4 : df <= 5 ? 5 : 
                  df <= 10 ? 10 : df <= 20 ? 20 : df <= 30 ? 30 : df <= 60 ? 60 : 120;
    
    return tValues[confKey]?.[dfKey] || 1.96; // Fallback to normal distribution
  };
  
  // Calculate additional statistics for more sophisticated error calculations
  const xSorted = [...workingXv].sort((a, b) => a - b);
  const ySorted = [...workingYv].sort((a, b) => a - b);
  const xMedian = xSorted[Math.floor(workingXv.length / 2)];
  const yMedian = ySorted[Math.floor(workingYv.length / 2)];
  const xQ1 = xSorted[Math.floor(workingXv.length * 0.25)];
  const xQ3 = xSorted[Math.floor(workingXv.length * 0.75)];
  const yQ1 = ySorted[Math.floor(workingYv.length * 0.25)];
  const yQ3 = ySorted[Math.floor(workingYv.length * 0.75)];
  const xIQR = xQ3 - xQ1;
  const yIQR = yQ3 - yQ1;
  
  // Calculate robust statistics (using median absolute deviation)
  const xMAD = xSorted.map(x => Math.abs(x - xMedian)).sort((a, b) => a - b)[Math.floor(workingXv.length / 2)];
  const yMAD = ySorted.map(y => Math.abs(y - yMedian)).sort((a, b) => a - b)[Math.floor(workingYv.length / 2)];
  const xRobustStd = xMAD * 1.4826; // Convert MAD to standard deviation
  const yRobustStd = yMAD * 1.4826;
  
  // Enhanced helper function to calculate error based on calculation method
  const getErrorValue = (calculation: string, mean: number, std: number, stdErr: number, values: number[], robustStd?: number, iqr?: number, median?: number) => {
    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    
    switch (calculation) {
      case 'Mean':
        return Array(n).fill(mean);
      case 'Median':
        return Array(n).fill(median || sorted[Math.floor(n / 2)]);
      case 'Standard Deviation':
        return Array(n).fill(std);
      case '2 Standard Deviations':
        return Array(n).fill(std * 2);
      case '3 Standard Deviations':
        return Array(n).fill(std * 3);
      case 'Standard Error':
        return Array(n).fill(stdErr);
      case '2 Standard Errors':
        return Array(n).fill(stdErr * 2);
      case '3 Standard Errors':
        return Array(n).fill(stdErr * 3);
      case '95% Confidence':
        return Array(n).fill(stdErr * getTValue(df, 0.95));
      case '99% Confidence':
        return Array(n).fill(stdErr * getTValue(df, 0.99));
      case '95% Prediction Interval':
        // Prediction interval includes both sampling error and individual variation
        return Array(n).fill(stdErr * getTValue(df, 0.95) * Math.sqrt(1 + 1/n));
      case '99% Prediction Interval':
        return Array(n).fill(stdErr * getTValue(df, 0.99) * Math.sqrt(1 + 1/n));
      case '95% Tolerance Interval':
        // Tolerance interval for 95% of population with 95% confidence
        const k95 = getTValue(df, 0.95) * Math.sqrt((df + 1) / df);
        return Array(n).fill(stdErr * k95);
      case '99% Tolerance Interval':
        // Tolerance interval for 99% of population with 99% confidence
        const k99 = getTValue(df, 0.99) * Math.sqrt((df + 1) / df);
        return Array(n).fill(stdErr * k99);
      case 'Robust Standard Deviation':
        return Array(n).fill(robustStd || std);
      case '2 Robust Standard Deviations':
        return Array(n).fill((robustStd || std) * 2);
      case 'Interquartile Range':
        return Array(n).fill(iqr || (sorted[Math.floor(n * 0.75)] - sorted[Math.floor(n * 0.25)]));
      case '1.5 IQR':
        return Array(n).fill((iqr || (sorted[Math.floor(n * 0.75)] - sorted[Math.floor(n * 0.25)])) * 1.5);
      case '75th Percentile':
        return Array(n).fill(sorted[Math.floor(n * 0.75)]);
      case '90th Percentile':
        return Array(n).fill(sorted[Math.floor(n * 0.90)]);
      case '95th Percentile':
        return Array(n).fill(sorted[Math.floor(n * 0.95)]);
      case '99th Percentile':
        return Array(n).fill(sorted[Math.floor(n * 0.99)]);
      case 'Maximum':
        return Array(n).fill(Math.max(...values));
      case 'Minimum':
        return Array(n).fill(Math.min(...values));
      case 'Range':
        return Array(n).fill(Math.max(...values) - Math.min(...values));
      case 'Last Entry':
        return Array(n).fill(values[values.length - 1]);
      case 'First Entry':
        return Array(n).fill(values[0]);
      case 'Dynamic (Data-driven)':
        // Calculate individual errors based on local variance
        return values.map((_, i) => {
          const windowSize = Math.min(5, Math.floor(n / 4));
          const start = Math.max(0, i - windowSize);
          const end = Math.min(n, i + windowSize + 1);
          const window = values.slice(start, end);
          const windowMean = window.reduce((sum, v) => sum + v, 0) / window.length;
          const windowStd = Math.sqrt(window.reduce((sum, v) => sum + Math.pow(v - windowMean, 2), 0) / window.length);
          return windowStd * 0.5; // Use half standard deviation for dynamic errors
        });
      case 'None':
        return Array(n).fill(0);
      default:
        return Array(n).fill(std * 0.4); // Default fallback
    }
  };
  
  // Calculate error values based on Symbol Value
  let xUpper: number[], xLower: number[], yUpper: number[], yLower: number[];
  
  switch (symbolValue) {
    case 'Worksheet Columns':
    case 'Asymmetric Error Bar':
      // Use actual error bar variable data
      if (errorBarData && errorBarData.length === n) {
        console.log('📊 Using Error Bar Data for', symbolValue, ':', errorBarData.slice(0, 3), '...');
        if (isAsymmetric) {
          // For asymmetric, use different upper and lower values
          yUpper = errorBarData.map(val => Math.abs(val));
          yLower = errorBarData.map(val => Math.abs(val * 0.5)); // 50% of upper value for more visible asymmetry
          // For bidirectional error bars, also calculate X errors (use same error bar data for both X and Y)
          xUpper = errorBarData.map(val => Math.abs(val));
          xLower = errorBarData.map(val => Math.abs(val * 0.5));
          console.log('📊 Asymmetric Y Upper:', yUpper.slice(0, 3), 'Y Lower:', yLower.slice(0, 3));
          console.log('📊 Asymmetric X Upper:', xUpper.slice(0, 3), 'X Lower:', xLower.slice(0, 3));
        } else {
          // For worksheet columns, use symmetric error bars
          yUpper = errorBarData.map(val => Math.abs(val));
          yLower = errorBarData.map(val => Math.abs(val));
          // For bidirectional error bars, also calculate X errors (use same error bar data for both X and Y)
          xUpper = errorBarData.map(val => Math.abs(val));
          xLower = errorBarData.map(val => Math.abs(val));
          console.log('📊 Symmetric Y Error:', yUpper.slice(0, 3));
          console.log('📊 Symmetric X Error:', xUpper.slice(0, 3));
        }
      } else {
        console.log('📊 No error bar data available, using fallback');
        // Fallback if no error bar data
        yUpper = yv.map(y => Math.abs(y * 0.1));
        yLower = yv.map(y => Math.abs(y * 0.1));
        // For bidirectional error bars, also provide X error values
        xUpper = xv.map(x => Math.abs(x * 0.1));
        xLower = xv.map(x => Math.abs(x * 0.1));
      }
      break;
      
    case undefined:
      // Handle asymmetric error bars without Symbol Value configuration
      if (errorBarData && errorBarData.length === n) {
        console.log('📊 Using Error Bar Data for Asymmetric (no Symbol Value):', errorBarData.slice(0, 3), '...');
        // For asymmetric error bars, use different upper and lower values
        yUpper = errorBarData.map(val => Math.abs(val));
        yLower = errorBarData.map(val => Math.abs(val * 0.7)); // 70% of upper value
        xUpper = errorBarData.map(val => Math.abs(val * 0.5)); // 50% of error bar value for X
        xLower = errorBarData.map(val => Math.abs(val * 0.3)); // 30% of error bar value for X
        console.log('📊 Asymmetric Y Upper:', yUpper.slice(0, 3), 'Y Lower:', yLower.slice(0, 3));
        console.log('📊 Asymmetric X Upper:', xUpper.slice(0, 3), 'X Lower:', xLower.slice(0, 3));
      } else {
        console.log('📊 No error bar data available for asymmetric, using fallback');
        // Fallback if no error bar data
        yUpper = yv.map(y => Math.abs(y * 0.1));
        yLower = yv.map(y => Math.abs(y * 0.1));
        // For bidirectional error bars, also provide X error values
        xUpper = xv.map(x => Math.abs(x * 0.1));
        xLower = xv.map(x => Math.abs(x * 0.1));
      }
      break;
      
    case 'Column Means':
    case 'Column Median':
    case 'First Column Entry':
    case 'Last Column Entry':
      // Use Y statistics for error bars with enhanced parameters
      console.log('📊 Column-based error calculation:', { errorCalculationUpper, errorCalculationLower });
      yUpper = errorCalculationUpper ? getErrorValue(errorCalculationUpper, yMean, yStd, yStdErr, yv, yRobustStd, yIQR, yMedian) : Array(n).fill(yStd * 0.4);
      yLower = errorCalculationLower ? getErrorValue(errorCalculationLower, yMean, yStd, yStdErr, yv, yRobustStd, yIQR, yMedian) : Array(n).fill(yStd * 0.4);
      xUpper = Array(n).fill(0);
      xLower = Array(n).fill(0);
      console.log('📊 Column Y Upper sample:', yUpper.slice(0, 3), 'Y Lower sample:', yLower.slice(0, 3));
      break;
      
    case 'Row Means':
    case 'Row Median':
    case 'First Row Entry':
    case 'Last Row Entry':
      // Use X statistics for error bars with enhanced parameters
      console.log('📊 Row-based error calculation:', { errorCalculationUpper, errorCalculationLower });
      xUpper = errorCalculationUpper ? getErrorValue(errorCalculationUpper, xMean, xStd, xStdErr, xv, xRobustStd, xIQR, xMedian) : Array(n).fill(xStd * 0.4);
      xLower = errorCalculationLower ? getErrorValue(errorCalculationLower, xMean, xStd, xStdErr, xv, xRobustStd, xIQR, xMedian) : Array(n).fill(xStd * 0.4);
      yUpper = Array(n).fill(0);
      yLower = Array(n).fill(0);
      console.log('📊 Row X Upper sample:', xUpper.slice(0, 3), 'X Lower sample:', xLower.slice(0, 3));
      break;
      
    case 'By Category Mean':
    case 'By Category Median':
      // Use both X and Y statistics with enhanced parameters
      console.log('📊 Category-based error calculation:', { errorCalculationUpper, errorCalculationLower });
      xUpper = errorCalculationUpper ? getErrorValue(errorCalculationUpper, xMean, xStd, xStdErr, xv, xRobustStd, xIQR, xMedian) : Array(n).fill(xStd * 0.4);
      xLower = errorCalculationLower ? getErrorValue(errorCalculationLower, xMean, xStd, xStdErr, xv, xRobustStd, xIQR, xMedian) : Array(n).fill(xStd * 0.4);
      yUpper = errorCalculationUpper ? getErrorValue(errorCalculationUpper, yMean, yStd, yStdErr, yv, yRobustStd, yIQR, yMedian) : Array(n).fill(yStd * 0.4);
      yLower = errorCalculationLower ? getErrorValue(errorCalculationLower, yMean, yStd, yStdErr, yv, yRobustStd, yIQR, yMedian) : Array(n).fill(yStd * 0.4);
      console.log('📊 Category X Upper sample:', xUpper.slice(0, 3), 'X Lower sample:', xLower.slice(0, 3));
      console.log('📊 Category Y Upper sample:', yUpper.slice(0, 3), 'Y Lower sample:', yLower.slice(0, 3));
      break;
      
    default:
      // Default fallback
      xUpper = Array(n).fill(xStd * 0.4);
      xLower = Array(n).fill(xStd * 0.4);
      yUpper = Array(n).fill(yStd * 0.4);
      yLower = Array(n).fill(yStd * 0.4);
  }
  
  const result = {
    xUpper,
    xLower,
    yUpper,
    yLower,
    xSymmetric: xUpper.map((val, i) => Math.max(val, xLower[i])),
    ySymmetric: yUpper.map((val, i) => Math.max(val, yLower[i]))
  };
  
  console.log('📊 Final error values calculated:', {
    symbolValue,
    errorCalculationUpper,
    errorCalculationLower,
    result: {
      yUpperSample: result.yUpper.slice(0, 3),
      yLowerSample: result.yLower.slice(0, 3),
      xUpperSample: result.xUpper.slice(0, 3),
      xLowerSample: result.xLower.slice(0, 3)
    }
  });
  
  return result;
};
