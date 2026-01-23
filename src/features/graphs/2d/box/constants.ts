import type { BoxPlotSubType, DataFormat } from './types';

export const SUB_TYPES: BoxPlotSubType[] = [
    'Vertical Box Plot',
    'Horizontal Box Plot'
];

export const DATA_FORMATS: DataFormat[] = [
    'Many Y',
    'X Many Y',
    'Many X',
    'Y Many X'
];

export const SUB_TYPE_DATA_FORMATS: Record<BoxPlotSubType, DataFormat[]> = {
    'Vertical Box Plot': ['Many Y', 'X Many Y'],
    'Horizontal Box Plot': ['Many X', 'Y Many X']
};

export const getValidDataFormats = (subType: BoxPlotSubType): DataFormat[] => {
    return SUB_TYPE_DATA_FORMATS[subType] || [];
};

export const isValidDataFormat = (subType: BoxPlotSubType, dataFormat: DataFormat): boolean => {
    const validFormats = getValidDataFormats(subType);
    return validFormats.includes(dataFormat);
};

export const BOX_PLOT_OPTIONS = {
    boxWidths: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
} as const;
