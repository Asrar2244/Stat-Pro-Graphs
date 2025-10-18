/**
 * Format requirements utilities
 */

import { MeshDataFormat } from '../types';

export interface FormatRequirement {
  format: MeshDataFormat;
  label: string;
  description: string;
  xRequired: boolean;
  yRequired: boolean;
  zMin: number;
  zMax: number;
  categorySupported: boolean;
  defaultScales: boolean;
}

export const FORMAT_REQUIREMENTS: FormatRequirement[] = [
  {
    format: 'xyz-columns',
    label: 'XYZ Triplet',
    description: 'Each row contains X, Y, and Z values as separate columns',
    xRequired: true,
    yRequired: true,
    zMin: 1,
    zMax: 1,
    categorySupported: false,
    defaultScales: false,
  },
  {
    format: 'z-matrix',
    label: 'Many Z Variables',
    description: 'Multiple Z variables with default X and Y scales (10,20,30... and 1,2,3...)',
    xRequired: false,
    yRequired: false,
    zMin: 2,
    zMax: Infinity,
    categorySupported: false,
    defaultScales: true,
  },
  {
    format: 'xy-z-columns',
    label: 'XY + Many Z Variables',
    description: 'Selected X and Y variables with multiple Z variables',
    xRequired: true,
    yRequired: true,
    zMin: 2,
    zMax: Infinity,
    categorySupported: false,
    defaultScales: false,
  },
];

export const getFormatRequirement = (format: MeshDataFormat): FormatRequirement | undefined => {
  return FORMAT_REQUIREMENTS.find(req => req.format === format);
};

export const validateFormatRequirements = (
  format: MeshDataFormat,
  xCount: number,
  yCount: number,
  zCount: number,
  categoryCount: number = 0
): { isValid: boolean; errors: string[] } => {
  const requirement = getFormatRequirement(format);
  if (!requirement) {
    return {
      isValid: false,
      errors: [`Unknown format: ${format}`]
    };
  }

  const errors: string[] = [];

  // Check X requirements
  if (requirement.xRequired && xCount !== 1) {
    errors.push(`${requirement.label} requires exactly 1 X variable`);
  } else if (!requirement.xRequired && xCount > 1) {
    errors.push(`${requirement.label} supports at most 1 X variable`);
  }

  // Check Y requirements
  if (requirement.yRequired && yCount !== 1) {
    errors.push(`${requirement.label} requires exactly 1 Y variable`);
  } else if (!requirement.yRequired && yCount > 1) {
    errors.push(`${requirement.label} supports at most 1 Y variable`);
  }

  // Check Z requirements
  if (zCount < requirement.zMin) {
    errors.push(`${requirement.label} requires at least ${requirement.zMin} Z variable(s)`);
  }
  if (requirement.zMax !== Infinity && zCount > requirement.zMax) {
    errors.push(`${requirement.label} supports at most ${requirement.zMax} Z variable(s)`);
  }

  // Check category support
  if (!requirement.categorySupported && categoryCount > 0) {
    errors.push(`${requirement.label} does not support category variables`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getFormatHelpText = (format: MeshDataFormat): string => {
  const requirement = getFormatRequirement(format);
  if (!requirement) {
    return 'Unknown format';
  }

  let helpText = requirement.description;
  
  if (requirement.defaultScales) {
    helpText += ' Uses default X scale (10,20,30...) and Y scale (1,2,3...) when no variables are selected.';
  }
  
  if (format === 'xy-z-columns') {
    helpText += ' The first and last Z variables are averaged to create a single surface.';
  }

  return helpText;
};

