import type { TestOption } from './types';

// Helper: Flatten analyze menu structure for dropdown with execute functions
export const analysisOptions: TestOption[] = [
  {
    label: 'Regression',
    value: 'regression',
    children: [
      { label: 'Linear', value: 'linear', children: [
        { label: 'Least Squares', value: 'leastSquares', execute: 'least-square' },
        { label: 'Ridge', value: 'ridge', execute: 'ridge' },
        { label: 'Forward Stepwise', value: 'forwardStepwise', execute: 'forward-stepwise' },
        { label: 'Backward Stepwise', value: 'backwardStepwise', execute: 'backward-stepwise' },
        { label: 'Stepwise', value: 'stepwise', execute: 'stepwise' },
        { label: 'Best Subset', value: 'bestSubset', execute: 'best-subset' },
        { label: 'Multiple Linear', value: 'multipleLinear', execute: 'multiple-linear' },
        { label: 'Polynomial', value: 'polynomial', execute: 'polynomial' },
        { label: 'Bayesian', value: 'bayesian', execute: 'bayesian' },
      ] },
    ],
  },
  {
    label: 'Analysis of Variance',
    value: 'analysisOfVariance',
    children: [
      { label: 'Estimation of Module', value: 'estimationOfModule', execute: 'estimation-of-module' },
      { label: 'Pairwise Comparison', value: 'pairwiseComparison', execute: 'pairwise-comparison' },
    ],
  },
];

// Helper: Advanced analysis options
export const advancedOptions: TestOption[] = [
  {
    label: 'Descriptive Statistics',
    value: 'descriptiveStat',
    execute: 'basic-statistics-column-wise',
  },
  {
    label: 'T-Test',
    value: 'tTest',
    execute: 'tests',
  },
  {
    label: 'Paired T-Test',
    value: 'pairedTTest',
    execute: 'paired-t-test',
  },
  // Add more advanced options here as needed
]; 