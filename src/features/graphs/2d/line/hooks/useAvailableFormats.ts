import { useMemo } from 'react';
import type { LineSubType, DataFormat, SymbolValueOption } from '../linePlotSlice';
import { getValidDataFormats } from '../constants';
import { getDataFormatsBySymbolValue, isErrorBarSubType, needsErrorBarsConfiguration } from '../utils/dataFormatHelpers';

/**
 * Custom hook for determining available data formats based on subtype and symbol value
 * @param subType - The selected scatter plot subtype
 * @param symbolValue - The selected symbol value (for error bars)
 * @returns Array of available data formats
 */
export const useAvailableFormats = (
  subType?: ScatterSubType,
  symbolValue?: SymbolValueOption
): DataFormat[] => {
  return useMemo(() => {
    if (!subType) return [];
    
    // For asymmetric error bars, use standard mapping (no Symbol Value needed)
    if (isErrorBarSubType(subType) && !needsErrorBarsConfiguration(subType)) {
      return getValidDataFormats(subType);
    }
    
    // For error bar subplot types with Symbol Value configuration
    if (isErrorBarSubType(subType) && symbolValue) {
      return getDataFormatsBySymbolValue(symbolValue, subType);
    }
    
    // For other subplot types, use the standard mapping
    return getValidDataFormats(subType);
  }, [subType, symbolValue]);
};


