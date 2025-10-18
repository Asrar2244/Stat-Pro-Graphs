/**
 * Debug utilities for 3D mesh plot validation
 */

import { MeshPlotValidationResult, MeshPlotCreationConfig } from '../types';

/**
 * Debug validation results with detailed logging
 */
export const debugMeshPlotValidation = (
  config: MeshPlotCreationConfig,
  result: MeshPlotValidationResult
): void => {
  console.group('🔍 Mesh Plot Validation Debug');
  console.log('Config:', {
    dataFormat: config.dataFormat,
    selectedVariables: {
      x: config.variables.xVariables,
      y: config.variables.yVariables,
      z: config.variables.zVariables,
      category: config.variables.categoryVariables
    },
    graphConfig: config.meshConfig,
    selectedXVariable: config.variables.xVariables[0],
    selectedYVariable: config.variables.yVariables[0],
    selectedZVariables: config.variables.zVariables
  });
  
  if (result.isValid) {
    console.log('✅ Validation passed');
  } else {
    console.error('❌ Validation failed:', result.errors);
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️ Warnings:', result.warnings);
  }
  
  console.groupEnd();
};

/**
 * Debug data format specific validation
 */
export const debugDataFormatValidation = (
  dataFormat: string,
  variables: any,
  errors: string[]
): void => {
  console.group(`🔍 ${dataFormat} Format Validation`);
  console.log('Variables:', variables);
  
  if (errors.length > 0) {
    console.error('Format-specific errors:', errors);
  } else {
    console.log('✅ Format validation passed');
  }
  
  console.groupEnd();
};

/**
 * Debug variable selection validation
 */
export const debugVariableValidation = (
  xVars: string[],
  yVars: string[],
  zVars: string[],
  categoryVars: string[] = []
): void => {
  console.group('🔍 Variable Selection Validation');
  
  console.log('X Variables:', xVars.length > 0 ? xVars : '❌ None selected');
  console.log('Y Variables:', yVars.length > 0 ? yVars : '❌ None selected');
  console.log('Z Variables:', zVars.length > 0 ? zVars : '❌ None selected');
  
  if (categoryVars.length > 0) {
    console.log('Category Variables:', categoryVars);
  }
  
  // Check for common issues
  if (xVars.length === 0) {
    console.warn('⚠️ No X variables selected');
  }
  if (yVars.length === 0) {
    console.warn('⚠️ No Y variables selected');
  }
  if (zVars.length === 0) {
    console.warn('⚠️ No Z variables selected');
  }
  
  console.groupEnd();
};

/**
 * Debug mesh configuration
 */
export const debugMeshConfig = (config: any): void => {
  console.group('🔍 Mesh Configuration Debug');
  console.log('Surface Type:', config.surfaceType);
  console.log('Color Scale:', config.colorScale);
  console.log('Opacity:', config.opacity);
  console.log('Show Contours:', config.showContours);
  console.log('Lighting:', config.lighting);
  console.log('Smooth Shading:', config.smoothShading);
  console.log('Show Grid:', config.showGrid);
  console.groupEnd();
};

/**
 * Debug data processing steps
 */
export const debugDataProcessing = (
  step: string,
  data: any,
  metadata?: any
): void => {
  console.group(`🔍 Data Processing: ${step}`);
  console.log('Data:', data);
  if (metadata) {
    console.log('Metadata:', metadata);
  }
  console.groupEnd();
};

/**
 * Debug trace generation
 */
export const debugTraceGeneration = (
  traceType: string,
  traceData: any,
  config: any
): void => {
  console.group(`🔍 Trace Generation: ${traceType}`);
  console.log('Trace Data:', traceData);
  console.log('Config:', config);
  console.groupEnd();
};

