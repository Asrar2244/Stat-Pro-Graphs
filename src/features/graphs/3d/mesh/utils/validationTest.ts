/**
 * Validation test utilities for 3D mesh plots
 */

import { MeshPlotValidationResult, MeshPlotCreationConfig, MeshDataFormat } from '../types';

/**
 * Test validation for XYZ Columns format
 */
export const testXYZColumnsValidation = (config: MeshPlotCreationConfig): MeshPlotValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // XYZ Columns requires exactly 1 X, 1 Y, and 1 Z variable
  if (config.variables.xVariables.length !== 1) {
    errors.push('XYZ Columns format requires exactly 1 X variable');
  }
  
  if (config.variables.yVariables.length !== 1) {
    errors.push('XYZ Columns format requires exactly 1 Y variable');
  }
  
  if (config.variables.zVariables.length !== 1) {
    errors.push('XYZ Columns format requires exactly 1 Z variable');
  }
  
  // Check for category variables (should be none for XYZ Columns)
  if (config.variables.categoryVariables && config.variables.categoryVariables.length > 0) {
    warnings.push('Category variables are not used in XYZ Columns format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Test validation for Z Matrix format
 */
export const testZMatrixValidation = (config: MeshPlotCreationConfig): MeshPlotValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Z Matrix requires multiple Z variables (at least 2 for meaningful mesh)
  if (config.variables.zVariables.length < 2) {
    errors.push('Z Matrix format requires at least 2 Z variables');
  }
  
  // X and Y variables are optional for Z Matrix (will use default scales)
  if (config.variables.xVariables.length > 1) {
    errors.push('Z Matrix format supports at most 1 X variable');
  }
  
  if (config.variables.yVariables.length > 1) {
    errors.push('Z Matrix format supports at most 1 Y variable');
  }
  
  // Check for category variables (should be none for Z Matrix)
  if (config.variables.categoryVariables && config.variables.categoryVariables.length > 0) {
    warnings.push('Category variables are not used in Z Matrix format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Test validation for XY Many Z format
 */
export const testXYManyZValidation = (config: MeshPlotCreationConfig): MeshPlotValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // XY Many Z requires exactly 1 X, 1 Y, and multiple Z variables
  if (config.variables.xVariables.length !== 1) {
    errors.push('XY Many Z format requires exactly 1 X variable');
  }
  
  if (config.variables.yVariables.length !== 1) {
    errors.push('XY Many Z format requires exactly 1 Y variable');
  }
  
  if (config.variables.zVariables.length < 2) {
    errors.push('XY Many Z format requires at least 2 Z variables');
  }
  
  // Check for category variables (should be none for XY Many Z)
  if (config.variables.categoryVariables && config.variables.categoryVariables.length > 0) {
    warnings.push('Category variables are not used in XY Many Z format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Test validation for mesh configuration
 */
export const testMeshConfigValidation = (config: MeshPlotCreationConfig): MeshPlotValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check opacity range
  if (config.meshConfig.opacity < 0 || config.meshConfig.opacity > 1) {
    errors.push('Opacity must be between 0 and 1');
  }
  
  // Check surface type
  if (!['surface', 'mesh'].includes(config.meshConfig.surfaceType)) {
    errors.push('Surface type must be either "surface" or "mesh"');
  }
  
  // Check color scale
  const validColorScales = [
    'viridis', 'plasma', 'inferno', 'magma', 'cividis',
    'Greys', 'Reds', 'Blues', 'Greens', 'Purples', 'Oranges',
    'RdYlBu', 'RdYlGn', 'RdBu', 'RdGy', 'BrBG'
  ];
  
  if (!validColorScales.includes(config.meshConfig.colorScale)) {
    warnings.push(`Color scale "${config.meshConfig.colorScale}" may not be supported by Plotly`);
  }
  
  // Check contour opacity
  if (config.meshConfig.contourOpacity < 0 || config.meshConfig.contourOpacity > 1) {
    errors.push('Contour opacity must be between 0 and 1');
  }
  
  // Check grid opacity
  if (config.meshConfig.gridOpacity < 0 || config.meshConfig.gridOpacity > 1) {
    errors.push('Grid opacity must be between 0 and 1');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Comprehensive validation test for mesh plot creation
 */
export const testMeshPlotCreation = (config: MeshPlotCreationConfig): MeshPlotValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  // Test data format specific validation
  let formatResult: MeshPlotValidationResult;
  
  switch (config.dataFormat) {
    case 'xyz-columns':
      formatResult = testXYZColumnsValidation(config);
      break;
    case 'z-matrix':
      formatResult = testZMatrixValidation(config);
      break;
    case 'xy-z-columns':
      formatResult = testXYManyZValidation(config);
      break;
    default:
      formatResult = {
        isValid: false,
        errors: [`Unknown data format: ${config.dataFormat}`],
        warnings: []
      };
  }
  
  allErrors.push(...formatResult.errors);
  allWarnings.push(...formatResult.warnings);
  
  // Test mesh configuration validation
  const configResult = testMeshConfigValidation(config);
  allErrors.push(...configResult.errors);
  allWarnings.push(...configResult.warnings);
  
  // Test workspace path
  if (!config.workspacePath || config.workspacePath.trim() === '') {
    allErrors.push('Workspace path is required');
  }
  
  // Test project name
  if (!config.projectName || config.projectName.trim() === '') {
    allErrors.push('Project name is required');
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
};

/**
 * Test validation with debug logging
 */
export const testMeshPlotCreationWithDebug = (config: MeshPlotCreationConfig): MeshPlotValidationResult => {
  const result = testMeshPlotCreation(config);
  
  // Debug logging
  console.group('🧪 Mesh Plot Creation Test');
  console.log('Config:', config);
  console.log('Result:', result);
  
  if (result.isValid) {
    console.log('✅ All validation tests passed');
  } else {
    console.error('❌ Validation tests failed:', result.errors);
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️ Validation warnings:', result.warnings);
  }
  
  console.groupEnd();
  
  return result;
};

