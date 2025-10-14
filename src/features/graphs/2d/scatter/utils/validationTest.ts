import { validateScatterPlotRequirements } from './validationUtils';

/**
 * Test function to verify category validation logic
 */
export const testCategoryValidation = () => {
  console.log('=== CATEGORY VALIDATION TEST ===');
  
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
  console.log('Test 1 - Multiple Scatter + XY Pair (no categories):', test1.isValid ? '✅ PASS' : '❌ FAIL', test1.errors);
  
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
  console.log('Test 2 - Multiple Scatter + XY Pair (with categories):', test2.isValid ? '✅ PASS' : '❌ FAIL', test2.errors);
  
  // Test 3: Multiple Scatter + Many X (should NOT require categories)
  const test3 = validateScatterPlotRequirements(
    'Multiple Scatter',
    'Many X',
    {
      x: ['var1', 'var2']
      // No category variables - should be OK
    }
  );
  console.log('Test 3 - Multiple Scatter + Many X (no categories):', test3.isValid ? '✅ PASS' : '❌ FAIL', test3.errors);
  
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
  console.log('Test 4 - Multiple Scatter + XY Category (missing categories):', test4.isValid ? '❌ FAIL' : '✅ PASS', test4.errors);
  
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
  console.log('Test 5 - Multiple Scatter + XY Category (with categories):', test5.isValid ? '✅ PASS' : '❌ FAIL', test5.errors);
  
  console.log('=== END CATEGORY VALIDATION TEST ===');
};

// Call the test function
if (typeof window !== 'undefined') {
  (window as any).testCategoryValidation = testCategoryValidation;
}
