/**
 * Data format helper utilities
 */

import { MeshDataFormat, MeshVariableSelection } from '../types';

export interface DataFormatRequirements {
  minXVariables: number;
  maxXVariables: number;
  minYVariables: number;
  maxYVariables: number;
  minZVariables: number;
  maxZVariables: number;
  supportsCategories: boolean;
  description: string;
}

export const getDataFormatRequirements = (format: MeshDataFormat): DataFormatRequirements => {
  switch (format) {
    case 'xyz-columns':
      return {
        minXVariables: 1,
        maxXVariables: 1,
        minYVariables: 1,
        maxYVariables: 1,
        minZVariables: 1,
        maxZVariables: 1,
        supportsCategories: false,
        description: 'Each row contains X, Y, and Z values as separate columns'
      };
    
    case 'z-matrix':
      return {
        minXVariables: 0,
        maxXVariables: 1,
        minYVariables: 0,
        maxYVariables: 1,
        minZVariables: 2,
        maxZVariables: Infinity,
        supportsCategories: false,
        description: 'Multiple Z variables with default X and Y scales'
      };
    
    case 'xy-z-columns':
      return {
        minXVariables: 1,
        maxXVariables: 1,
        minYVariables: 1,
        maxYVariables: 1,
        minZVariables: 2,
        maxZVariables: Infinity,
        supportsCategories: false,
        description: 'Selected X and Y variables with multiple Z variables'
      };
    
    default:
      return {
        minXVariables: 0,
        maxXVariables: Infinity,
        minYVariables: 0,
        maxYVariables: Infinity,
        minZVariables: 1,
        maxZVariables: Infinity,
        supportsCategories: false,
        description: 'Unknown format'
      };
  }
};

export const validateDataFormatCompatibility = (
  format: MeshDataFormat,
  variables: MeshVariableSelection
): { isValid: boolean; errors: string[] } => {
  const requirements = getDataFormatRequirements(format);
  const errors: string[] = [];

  // Check X variables
  if (variables.xVariables.length < requirements.minXVariables) {
    errors.push(`At least ${requirements.minXVariables} X variable(s) required`);
  }
  if (variables.xVariables.length > requirements.maxXVariables) {
    errors.push(`At most ${requirements.maxXVariables} X variable(s) allowed`);
  }

  // Check Y variables
  if (variables.yVariables.length < requirements.minYVariables) {
    errors.push(`At least ${requirements.minYVariables} Y variable(s) required`);
  }
  if (variables.yVariables.length > requirements.maxYVariables) {
    errors.push(`At most ${requirements.maxYVariables} Y variable(s) allowed`);
  }

  // Check Z variables
  if (variables.zVariables.length < requirements.minZVariables) {
    errors.push(`At least ${requirements.minZVariables} Z variable(s) required`);
  }
  if (variables.zVariables.length > requirements.maxZVariables) {
    errors.push(`At most ${requirements.maxZVariables} Z variable(s) allowed`);
  }

  // Check category variables
  if (!requirements.supportsCategories && variables.categoryVariables && variables.categoryVariables.length > 0) {
    errors.push('Category variables are not supported for this format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getRecommendedVariables = (format: MeshDataFormat): Partial<MeshVariableSelection> => {
  switch (format) {
    case 'xyz-columns':
      return {
        xVariables: [],
        yVariables: [],
        zVariables: [],
        categoryVariables: []
      };
    
    case 'z-matrix':
      return {
        xVariables: [], // Optional - will use default scales
        yVariables: [], // Optional - will use default scales
        zVariables: [], // At least 2 required
        categoryVariables: []
      };
    
    case 'xy-z-columns':
      return {
        xVariables: [], // Exactly 1 required
        yVariables: [], // Exactly 1 required
        zVariables: [], // At least 2 required
        categoryVariables: []
      };
    
    default:
      return {};
  }
};

export const getDataFormatDisplayName = (format: MeshDataFormat): string => {
  switch (format) {
    case 'xyz-columns':
      return 'XYZ Triplet';
    case 'z-matrix':
      return 'Many Z Variables';
    case 'xy-z-columns':
      return 'XY + Many Z Variables';
    default:
      return 'Unknown Format';
  }
};

