/**
 * Format requirements utilities
 */

import { DataFormat } from '../scatterPlotSlice';

export interface FormatRequirement {
    format: DataFormat;
    label: string;
    description: string;
    xRequired: boolean;
    yRequired: boolean;
    zMin: number;
    zMax: number;
    categorySupported: boolean;
    defaultScales: boolean;
}

// NOTE: Mapping the strings manually to match the DataFormat type
// Types are: 'XYZ Triplets' | 'Many Z' | 'XY Many Z'
// The mesh implementation used mixed types (internal codes vs display names).
// I will ensure this matches `scatterPlotSlice` DataFormat type exactly.
export const FORMAT_REQUIREMENTS: FormatRequirement[] = [
    {
        format: 'XYZ Triplets',
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
        format: 'Many Z',
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
        format: 'XY Many Z',
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

export const getFormatRequirement = (format: DataFormat): FormatRequirement | undefined => {
    return FORMAT_REQUIREMENTS.find(req => req.format === format);
};
