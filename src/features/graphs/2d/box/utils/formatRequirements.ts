import type { DataFormat } from '../types';

/**
 * Determines if X variables are required for the given data format
 */
export const requiresX = (dataFormat?: DataFormat): boolean => {
    if (!dataFormat) return false;

    switch (dataFormat) {
        case 'X Many Y':
        case 'Many X': // Horizontal multiple X
        case 'Y Many X':
            return true;
        case 'Many Y': // Vertical multiple Y, standard box plot, X is index
            return false;
        default:
            return false;
    }
};

/**
 * Determines if Y variables are required for the given data format
 */
export const requiresY = (dataFormat?: DataFormat): boolean => {
    if (!dataFormat) return false;

    switch (dataFormat) {
        case 'Many Y':
        case 'X Many Y':
        case 'Y Many X':
            return true;
        case 'Many X': // Horizontal, only X
            return false;
        default:
            return false;
    }
};

export const getMaxXCount = (dataFormat?: DataFormat): number | undefined => {
    if (dataFormat === 'X Many Y') return 1; // Grouping variable
    return undefined; // Many X allow multiple
};

export const getMaxYCount = (dataFormat?: DataFormat): number | undefined => {
    if (dataFormat === 'Y Many X') return 1; // Grouping variable
    return undefined; // Many Y allow multiple
};

export const canSendToX = (
    availableCheckedCount: number,
    xCount: number,
    dataFormat?: DataFormat
): boolean => {
    if (availableCheckedCount === 0) return false;

    // Check if X is even required
    if (!requiresX(dataFormat)) return false;

    const maxX = getMaxXCount(dataFormat);
    if (maxX !== undefined && xCount >= maxX) return false;

    return true;
};

export const canSendToY = (
    availableCheckedCount: number,
    yCount: number,
    dataFormat?: DataFormat
): boolean => {
    if (availableCheckedCount === 0) return false;

    // Check if Y is even required
    if (!requiresY(dataFormat)) return false;

    const maxY = getMaxYCount(dataFormat);
    if (maxY !== undefined && yCount >= maxY) return false;

    return true;
};
