import { BarPlotSubType, DataFormat } from '../types';
import { getValidDataFormats } from '../constants';
import { SymbolValueOption } from '../../scatter/scatterPlotSlice'; // Reuse type

export const isErrorBarSubType = (subType: string): boolean => {
    return subType.toLowerCase().includes('error bar');
};

export const needsErrorBarsConfiguration = (subType: string): boolean => {
    return isErrorBarSubType(subType);
};

export const getDataFormatsBySymbolValue = (
    symbolValue: SymbolValueOption,
    subType: BarPlotSubType
): DataFormat[] => {
    const allFormats = getValidDataFormats(subType);

    // Filter logic can be added here if specific SymbolValues restrict formats
    // For now return all valid formats for the subtype
    return allFormats;
};
