/**
 * Data format helper utilities
 */

import { DataFormat } from '../scatterPlotSlice';

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

export const getDataFormatRequirements = (format: DataFormat): DataFormatRequirements => {
    switch (format) {
        case 'XYZ Triplets':
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

        case 'Many Z':
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

        case 'XY Many Z':
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
