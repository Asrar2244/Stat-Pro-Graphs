import { DataFormat } from '../types';

export const requiresX = (dataFormat?: DataFormat): boolean => {
    if (!dataFormat) return false;
    switch (dataFormat) {
        case 'Single X': return true;
        case 'XY Pair': return true;
        case 'XY Pairs': return true;
        case 'X Many Y': return true;
        case 'Y Many X': return true;
        case 'Many X': return true;
        case 'XY Category': return true;
        case 'X Category': return true;
        case 'X Single Y Replicate': return true;
        case 'X Many Y Replicates': return true;
        case 'X Replicates': return true; // if used
        case 'Y Single X Replicate': return true;
        case 'Y Many X Replicates': return true;
        case 'Many X Replicates': return true;
        case 'YX Pair': return true;
        case 'X Many X Replicates': return true;
        case 'X Replicate': return true;
        default: return false;
    }
};

export const requiresY = (dataFormat?: DataFormat): boolean => {
    if (!dataFormat) return false;
    switch (dataFormat) {
        case 'Single Y': return true;
        case 'XY Pair': return true;
        case 'XY Pairs': return true;
        case 'X Many Y': return true;
        case 'Y Many X': return true;
        case 'Many Y': return true;
        case 'XY Category': return true;
        case 'Y Category': return true;
        case 'Y Replicate': return true;
        case 'X Many Y Replicates': return true;
        case 'Many Y Replicates': return true;
        case 'Y Many X Replicates': return true;
        case 'X Single Y Replicate': return true;
        case 'YX Pair': return true;
        default: return false;
    }
};

// Error bars required if it's an Error Bar subtype
export const requiresErrorBar = (subType?: string): boolean => {
    return subType?.toLowerCase().includes('error bar') || false;
};

export const requiresCategory = (dataFormat?: DataFormat): boolean => {
    if (!dataFormat) return false;
    return [
        'XY Category',
        'X Category',
        'Y Category',
    ].includes(dataFormat);
};

export const getRequiredErrorBarCount = (
    xCount: number,
    yCount: number,
    dataFormat?: DataFormat,
    subType?: string
): number => {
    if (!dataFormat) return 0;

    // Check if this is a bidirectional error bar (if bar plots support it)
    // Assuming logic is similar to scatter for now

    if (xCount > 1 || yCount > 1) {
        return Math.max(xCount, yCount);
    }

    switch (dataFormat) {
        case 'XY Pair':
        case 'Single X':
        case 'Single Y':
            return 1;
        case 'XY Pairs':
            return Math.max(xCount, yCount);
        case 'X Many Y':
            return yCount;
        case 'Y Many X':
            return xCount;
        case 'Many X':
            return xCount;
        case 'Many Y':
            return yCount;
        case 'XY Category':
            return 1;
        case 'X Category':
        case 'Y Category':
            return 1;
        default:
            return 0;
    }
};

export const getMaxXCount = (dataFormat?: DataFormat): number | undefined => {
    // If 'Single X', max 1
    if (dataFormat === 'Single X' || dataFormat === 'X Many Y') return 1;
    return undefined;
};

export const getMaxYCount = (dataFormat?: DataFormat): number | undefined => {
    if (dataFormat === 'Single Y' || dataFormat === 'Y Many X') return 1;
    return undefined;
};

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

export const canSendToErrorBar = (
    availableCheckedCount: number,
    errorBarCount: number,
    xCount: number,
    yCount: number,
    dataFormat?: DataFormat,
    subType?: string
): boolean => {
    if (availableCheckedCount === 0) return false;

    const isErrorBarSubType = subType?.toLowerCase().includes('error bar') || false;
    if (!isErrorBarSubType) return false;

    const requiredCount = getRequiredErrorBarCount(xCount, yCount, dataFormat, subType);
    if (requiredCount === 0) return false;

    return errorBarCount < requiredCount;
};

export const canSendToCategory = (
    availableCheckedCount: number,
    categoryCount: number,
    dataFormat?: DataFormat
): boolean => {
    if (availableCheckedCount === 0) return false;
    if (categoryCount >= 1) return false;
    return requiresCategory(dataFormat);
};
