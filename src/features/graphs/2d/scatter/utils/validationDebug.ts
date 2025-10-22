import { validateScatterPlotRequirements } from './validationUtils';

/**
 * Debug function to test validation with different inputs
 */
export const testValidation = () => {
  // Test function - console logs removed
  
  // Test 1: Simple Scatter with X and Y variables
  const test1 = validateScatterPlotRequirements(
    'Simple Scatter',
    'XY Pair',
    {
      x: ['var1'],
      y: ['var2']
    }
  );
  
  // Test 2: Simple Scatter without variables
  const test2 = validateScatterPlotRequirements(
    'Simple Scatter',
    'XY Pair',
    {
      x: [],
      y: []
    }
  );
  
  // Test 3: Error Bar plot without error bar variables
  const test3 = validateScatterPlotRequirements(
    'Simple Scatter Error Bar',
    'XY Pair',
    {
      x: ['var1'],
      y: ['var2'],
      errorBar: []
    }
  );
  
  // Test 4: Multiple Scatter without category variables
  const test4 = validateScatterPlotRequirements(
    'Multiple Scatter',
    'XY Pairs',
    {
      x: ['var1'],
      y: ['var2'],
      category: []
    }
  );
};

// Call the test function
if (typeof window !== 'undefined') {
  (window as any).testScatterPlotValidation = testValidation;
}
