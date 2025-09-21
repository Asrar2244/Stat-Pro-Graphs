/**
 * Regression analysis utilities for plotly graphs
 * Handles linear regression calculations and confidence intervals
 */

export interface RegressionResult {
  m: number;
  b: number;
  rSquared: number;
  seRegression: number;
  seSlope: number;
  seIntercept: number;
  predictionIntervals: Array<{ upper: number; lower: number }>;
  n: number;
  xMean: number;
  yMean: number;
}

/**
 * Enhanced linear regression with comprehensive statistics
 */
export const computeLinearRegression = (xs: number[], ys: number[]): RegressionResult | null => {
  const pairs = xs
    .map((x, i) => [x, ys[i]] as [number, number])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  const n = pairs.length;
  if (n < 2) return null;
  
  let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0, sumYY = 0;
  for (let i = 0; i < n; i++) {
    const x = pairs[i][0];
    const y = pairs[i][1];
    sumX += x; sumY += y; sumXX += x * x; sumXY += x * y; sumYY += y * y;
  }
  
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;
  
  const m = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;
  
  // Calculate R-squared
  const yMean = sumY / n;
  const ssRes = pairs.reduce((sum, [, y]) => sum + Math.pow(y - (m * pairs[sum]?.[0] + b), 2), 0);
  const ssTot = pairs.reduce((sum, [, y]) => sum + Math.pow(y - yMean, 2), 0);
  const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
  
  // Calculate standard error of regression
  const seRegression = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0;
  
  // Calculate confidence intervals for slope and intercept
  const xMean = sumX / n;
  const sxx = sumXX - n * xMean * xMean;
  const seSlope = sxx > 0 ? seRegression / Math.sqrt(sxx) : 0;
  const seIntercept = seRegression * Math.sqrt(sumXX / (n * sxx));
  
  // Calculate prediction intervals
  const predictionIntervals = xs.map(xVal => {
    const sePrediction = seRegression * Math.sqrt(1 + 1/n + Math.pow(xVal - xMean, 2) / sxx);
    const tValue = 1.96; // Approximate t-value for 95% confidence
    return {
      upper: m * xVal + b + tValue * sePrediction,
      lower: m * xVal + b - tValue * sePrediction
    };
  });
  
  return { 
    m, 
    b, 
    rSquared, 
    seRegression, 
    seSlope, 
    seIntercept,
    predictionIntervals,
    n,
    xMean,
    yMean
  };
};

/**
 * Creates regression line traces with confidence intervals
 */
export const createRegressionTraces = (
  xVals: number[], 
  yVals: number[], 
  label: string, 
  color: string,
  subType: string,
  regressionResult: RegressionResult
): any[] => {
  const traces: any[] = [];
  const isErrorBar = subType.toLowerCase().includes('error bar');
  const { m, b, rSquared, predictionIntervals } = regressionResult;
  
  // Determine domain from finite x values
  const finiteX = xVals.filter((x) => Number.isFinite(x));
  if (finiteX.length < 2) return traces;
  
  const xMin = Math.min(...finiteX);
  const xMax = Math.max(...finiteX);
  
  // Create more points for smoother regression line
  const numPoints = Math.max(50, finiteX.length * 2);
  const lineX = Array.from({ length: numPoints }, (_, i) => xMin + (xMax - xMin) * i / (numPoints - 1));
  const lineY = lineX.map(x => m * x + b);
  
  // Configure regression line based on sub-type
  let lineConfig: any = {
    x: lineX,
    y: lineY,
    type: 'scatter',
    mode: 'lines',
    name: `${label} (fit, R²=${rSquared.toFixed(3)})`,
    line: { color: color || 'rgba(200,0,0,0.85)', width: 2 },
    hoverinfo: 'skip',
  };

  // Different regression line styles based on sub-type
  if (subType.toLowerCase().includes('multiple')) {
    // Multiple regression - dashed line
    lineConfig.line.dash = 'dash';
    lineConfig.line.width = 1.5;
  } else if (isErrorBar) {
    // Error bar regression - thicker line with enhanced styling
    lineConfig.line.width = 3;
    lineConfig.line.color = color || 'rgba(100,100,100,0.9)';
    lineConfig.line.dash = 'solid';
  } else {
    // Simple regression - solid line
    lineConfig.line.width = 2;
  }

  traces.push(lineConfig);
  
  // Add confidence intervals for error bar regression
  if (isErrorBar && predictionIntervals) {
    const confidenceX = lineX;
    const confidenceUpper = confidenceX.map(x => {
      const idx = Math.round((x - xMin) / (xMax - xMin) * (predictionIntervals.length - 1));
      return predictionIntervals[Math.max(0, Math.min(idx, predictionIntervals.length - 1))].upper;
    });
    const confidenceLower = confidenceX.map(x => {
      const idx = Math.round((x - xMin) / (xMax - xMin) * (predictionIntervals.length - 1));
      return predictionIntervals[Math.max(0, Math.min(idx, predictionIntervals.length - 1))].lower;
    });
    
    // Add confidence interval fill
    const confidenceFill = {
      x: [...confidenceX, ...confidenceX.slice().reverse()],
      y: [...confidenceUpper, ...confidenceLower.slice().reverse()],
      type: 'scatter',
      mode: 'lines',
      fill: 'tonexty',
      fillcolor: color ? `${color}20` : 'rgba(200,0,0,0.1)',
      line: { color: 'transparent' },
      name: `${label} (95% CI)`,
      hoverinfo: 'skip',
      showlegend: false
    };
    
    traces.push(confidenceFill);
    
    // Add confidence interval lines
    const confidenceUpperLine = {
      x: confidenceX,
      y: confidenceUpper,
      type: 'scatter',
      mode: 'lines',
      line: { 
        color: color || 'rgba(200,0,0,0.5)', 
        width: 1, 
        dash: 'dot' 
      },
      name: `${label} (95% CI Upper)`,
      hoverinfo: 'skip',
      showlegend: false
    };
    
    const confidenceLowerLine = {
      x: confidenceX,
      y: confidenceLower,
      type: 'scatter',
      mode: 'lines',
      line: { 
        color: color || 'rgba(200,0,0,0.5)', 
        width: 1, 
        dash: 'dot' 
      },
      name: `${label} (95% CI Lower)`,
      hoverinfo: 'skip',
      showlegend: false
    };
    
    traces.push(confidenceUpperLine);
    traces.push(confidenceLowerLine);
  }
  
  return traces;
};
