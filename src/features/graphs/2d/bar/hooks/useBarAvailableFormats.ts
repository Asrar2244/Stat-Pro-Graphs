import { useMemo } from 'react';
import type { BarPlotSubType, DataFormat } from '../types';
import type { SymbolValueOption } from '../../scatter/scatterPlotSlice';
import { getValidDataFormats } from '../constants';
import { getDataFormatsBySymbolValue, isErrorBarSubType, needsErrorBarsConfiguration } from '../utils/dataFormatHelpers';

export const useBarAvailableFormats = (
    subType?: BarPlotSubType,
    symbolValue?: SymbolValueOption
): DataFormat[] => {
    return useMemo(() => {
        if (!subType) return [];

        if (isErrorBarSubType(subType) && !needsErrorBarsConfiguration(subType)) {
            return getValidDataFormats(subType);
        }

        if (isErrorBarSubType(subType) && symbolValue) {
            return getDataFormatsBySymbolValue(symbolValue, subType);
        }

        return getValidDataFormats(subType);
    }, [subType, symbolValue]);
};
