import type { DataFormat } from '../areaPlotSlice';

/**
 * Determines if X variables are required for the given data format
 * @param dataFormat - The selected data format
 * @returns True if X variables are required
 */
export const requiresX = (dataFormat?: DataFormat): boolean => {
    if (!dataFormat) return false;

    switch (dataFormat) {
        case 'XY Pair':
        case 'XY Pairs':
        case 'X Many Y':
        case 'Single X':
        case 'YX Pair':
        case 'YX Pairs':
        case 'Many X':
        case 'Y Many X':
            return true;

        // Formats that don't need X (implicit index or Y only)
        case 'Single Y':
        case 'Many Y':
            return false;

        default:
            return false;
    }
};

/**
 * Determines if Y variables are required for the given data format
 * @param dataFormat - The selected data format
 * @returns True if Y variables are required
 */
export const requiresY = (dataFormat?: DataFormat): boolean => {
    if (!dataFormat) return false;

    switch (dataFormat) {
        case 'XY Pair':
        case 'XY Pairs':
        case 'Single Y':
        case 'X Many Y':
        case 'Many Y':
        case 'YX Pair':
        case 'YX Pairs':
        case 'Y Many X':
            return true;

        // Formats that don't need Y (implicit index or X only)
        case 'Single X':
        case 'Many X':
            return false;

        default:
            return false;
    }
};

/**
 * Gets the maximum allowed count for X variables based on data format
 * @param dataFormat - The selected data format
 * @returns Maximum count or undefined for unlimited
 */
export const getMaxXCount = (dataFormat?: DataFormat): number | undefined => {
    if (dataFormat === 'X Many Y') return 1;
    if (dataFormat === 'Single X') return 1; // Explicitly single
    return undefined;
};

/**
 * Gets the maximum allowed count for Y variables based on data format
 * @param dataFormat - The selected data format
 * @returns Maximum count or undefined for unlimited
 */
export const getMaxYCount = (dataFormat?: DataFormat): number | undefined => {
    if (dataFormat === 'Y Many X') return 1;
    if (dataFormat === 'Single Y') return 1; // Explicitly single
    return undefined;
};

/**
 * Determines if variables can be sent to X based on current state
 * @param availableCheckedCount - Number of selected available variables
 * @param xCount - Current X variable count
 * @param dataFormat - The selected data format
 * @returns True if variables can be sent to X
 */
export const canSendToX = (
    availableCheckedCount: number,
    xCount: number,
    dataFormat?: DataFormat
): boolean => {
    if (availableCheckedCount === 0) return false;

    const maxX = getMaxXCount(dataFormat);
    if (maxX !== undefined && xCount >= maxX) return false;

    return requiresX(dataFormat);
};

/**
 * Determines if variables can be sent to Y based on current state
 * @param availableCheckedCount - Number of selected available variables
 * @param yCount - Current Y variable count
 * @param dataFormat - The selected data format
 * @returns True if variables can be sent to Y
 */
export const canSendToY = (
    availableCheckedCount: number,
    yCount: number,
    dataFormat?: DataFormat
): boolean => {
    if (availableCheckedCount === 0) return false;

    const maxY = getMaxYCount(dataFormat);
    if (maxY !== undefined && yCount >= maxY) return false;

    return requiresY(dataFormat);
};
