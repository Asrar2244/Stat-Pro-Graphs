import type { AreaSubType, DataFormat } from './areaPlotSlice';

/**
 * Available area plot sub-types
 */
export const SUB_TYPES: AreaSubType[] = [
    'Simple Area',
    'Multiple Area',
    'Vertical Area',
    'Multiple Vertical Area',
    'Complex Area Plot'
];

/**
 * Mapping between area plot sub-types and their valid data formats
 */
export const SUB_TYPE_DATA_FORMATS: Record<AreaSubType, DataFormat[]> = {
    // A) Simple Area
    'Simple Area': [
        'XY Pair',
        'Single Y'
    ],

    // B) Multiple Area
    'Multiple Area': [
        'XY Pairs',
        'Many Y',
        'X Many Y'
    ],

    // C) Vertical Area
    'Vertical Area': [
        'Single X',
        'YX Pair'
    ],

    // D) Multiple Vertical Area
    'Multiple Vertical Area': [
        'YX Pairs',
        'Many X',
        'Y Many X'
    ],

    // E) Complex Area Plot
    'Complex Area Plot': [
        'XY Pairs',
        'X Many Y',
        'Y Many X',
        'Many X',
        'Many Y'
    ]
};

/**
 * Gets valid data formats for a given area plot sub-type
 * @param subType - The area plot sub-type
 * @returns Array of valid data formats for the sub-type
 */
export const getValidDataFormats = (subType?: AreaSubType): DataFormat[] => {
    if (!subType) return [];
    return SUB_TYPE_DATA_FORMATS[subType] || [];
};

/**
 * Checks if a data format is valid for an area plot sub-type
 * @param subType - The area plot sub-type
 * @param dataFormat - The data format to validate
 * @returns True if the data format is valid for the sub-type
 */
export const isValidDataFormat = (subType?: AreaSubType, dataFormat?: DataFormat): boolean => {
    if (!subType || !dataFormat) return false;
    return getValidDataFormats(subType).includes(dataFormat);
};
