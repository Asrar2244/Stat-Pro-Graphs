import { validateScatterPlotRequirements } from './validationUtils';

/**
 * Test function to verify category validation logic
 */
export const testCategoryValidation = () => {
  // Test function - console logs removed
  
  // Test 1: Multiple Scatter + XY Pair (should NOT require categories)
  const test1 = validateScatterPlotRequirements(
    'Multiple Scatter',
    'XY Pair',
    {
      x: ['var1'],
      y: ['var2']
      // No category variables - should be OK
    }
  );
  
  // Test 2: Multiple Scatter + XY Pair (with unnecessary categories - should warn)
  const test2 = validateScatterPlotRequirements(
    'Multiple Scatter',
    'XY Pair',
    {
      x: ['var1'],
      y: ['var2'],
      category: ['cat1'] // Unnecessary category - should warn
    }
  );
  
  // Test 3: Multiple Scatter + Many X (should NOT require categories)
  const test3 = validateScatterPlotRequirements(
    'Multiple Scatter',
    'Many X',
    {
      x: ['var1', 'var2']
      // No category variables - should be OK
    }
  );
  
  // Test 4: Multiple Scatter + XY Category (SHOULD require categories)
  const test4 = validateScatterPlotRequirements(
    'Multiple Scatter',
    'XY Category',
    {
      x: ['var1'],
      y: ['var2']
      // Missing category variables - should fail
    }
  );
  
  // Test 5: Multiple Scatter + XY Category (with categories - should pass)
  const test5 = validateScatterPlotRequirements(
    'Multiple Scatter',
    'XY Category',
    {
      x: ['var1'],
      y: ['var2'],
      category: ['cat1'] // Required category - should pass
    }
  );
};

// Call the test function
if (typeof window !== 'undefined') {
  (window as any).testCategoryValidation = testCategoryValidation;
}
