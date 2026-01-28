import type { BarPlotSubType, DataFormat } from './types';

export const SUB_TYPES: BarPlotSubType[] = [
    'Simple Vertical Bar',
    'Grouped Vertical Bar',
    'Simple Vertical Error Bar',
    'Grouped Vertical Error Bar',
    'Stacked Vertical Bar',
    'Simple Horizontal Bar',
    'Grouped Horizontal Bar',
    'Simple Horizontal Error Bar',
    'Grouped Horizontal Error Bar',
    'Stacked Horizontal Bar'
];

export const SUB_TYPE_DATA_FORMATS: Record<BarPlotSubType, DataFormat[]> = {
    'Simple Vertical Bar': [
        'XY Pair',
        'Single Y'
    ],
    'Grouped Vertical Bar': [
        'X Many Y',
        'Many Y',
        'Many Y Replicates',
        'X Many Y Replicates'
    ],
    'Simple Vertical Error Bar': [
        'Single Y',
        'XY Pair',
        'X Many Y',
        'Many Y',
        'Y Replicate', // User said "Y Replicate"
        'X Single Y Replicate' // User said "X, Y Replicate" -> Mapping to X Single Y Replicate
    ],
    'Grouped Vertical Error Bar': [
        'Many Y',
        'X Many Y',
        'X Many Y Replicates',
        'Single X', // User listed "Single X" ??? For Grouped Vertical Error Bar? Unusual but okay.
        'Many Y Replicates'
    ],
    'Stacked Vertical Bar': [
        'X Many Y',
        'Many Y',
        'Many Y Replicates',
        'X Many Y Replicates'
    ],
    'Simple Horizontal Bar': [
        'XY Pair',
        'Single X'
    ],
    'Grouped Horizontal Bar': [
        'Y Many X',
        'Many X',
        'Many X Replicates',
        'Y Many X Replicates'
    ],
    'Simple Horizontal Error Bar': [
        'Single X',
        'XY Pair', // User said "YX pair" but effectively XY Pair swapped in logic? Or consistent?
        'Many X',
        'Y Many X',
        'Many X Replicates',
        'Y Many X Replicates'
    ],
    'Grouped Horizontal Error Bar': [
        'Single Y', // User listed "Single Y".
        'Many X',
        'Many X Replicates',
        'Y Many X Replicates'
    ],
    'Stacked Horizontal Bar': [
        'Y Many X',
        'Many X',
        'Single Y',
        'Many X Replicates'
    ]
};

export const getValidDataFormats = (subType?: BarPlotSubType): DataFormat[] => {
    if (!subType) return [];
    return SUB_TYPE_DATA_FORMATS[subType] || [];
};

export const isValidDataFormat = (subType?: BarPlotSubType, dataFormat?: DataFormat): boolean => {
    if (!subType || !dataFormat) return false;
    return getValidDataFormats(subType).includes(dataFormat);
};
