export const friendlyTitleForOutput = (
  outputType?: string,
  fallback?: string,
): string => {
  if (!outputType) return fallback ?? '';
  const map: Record<string, string> = {
    regLinearLeastSquare: 'Regression: Linear: Least Squares',
    regLinearRidge: 'Regression: Linear: Ridge',
    regLinearForwardStepwise: 'Regression: Linear: Forward Stepwise',
    regLinearBackwardStepwise: 'Regression: Linear: Backward Stepwise',
    regLinearStepwise: 'Regression: Linear: Stepwise',
    regLinearBestSubset: 'Regression: Linear: Best Subset',
    regLinearMultipleLinear: 'Regression: Linear: Multiple Linear',
    descriptiveStatistics: 'Descriptive Statistics',
    estimationOfModules: 'Analysis of Variance: Estimation of Module',
    pairwiseComparisonModules: 'Analysis of Variance: Pairwise Comparison',
  };
  return map[outputType] ?? (fallback ?? outputType);
};

