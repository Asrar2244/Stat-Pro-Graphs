import { validateScatterPlotRequirements } from './validationUtils';

/**
 * Debug function to test validation with different inputs
 */
export const testValidation = () => {
  console.log('=== VALIDATION DEBUG TEST ===');
  
  // Test 1: Simple Scatter with X and Y variables
  const test1 = validateScatterPlotRequirements(
    'Simple Scatter',
    'XY Pair',
    {
      x: ['var1'],
      y: ['var2']
    }
  );
  console.log('Test 1 - Simple Scatter with X,Y:', test1);
  
  // Test 2: Simple Scatter without variables
  const test2 = validateScatterPlotRequirements(
    'Simple Scatter',
    'XY Pair',
    {
      x: [],
      y: []
    }
  );
  console.log('Test 2 - Simple Scatter without variables:', test2);
  
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
  console.log('Test 3 - Error Bar without error variables:', test3);
  
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
  console.log('Test 4 - Multiple Scatter without category:', test4);
  
  console.log('=== END VALIDATION DEBUG TEST ===');
};

// Call the test function
if (typeof window !== 'undefined') {
  (window as any).testScatterPlotValidation = testValidation;
}
