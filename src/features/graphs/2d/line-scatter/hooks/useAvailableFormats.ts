import { useMemo } from 'react';
import type { LineScatterSubType, DataFormat, SymbolValueOption } from '../lineScatterPlotSlice';
import { getValidDataFormats } from '../constants';

/**
 * Hook to get available data formats for the current sub-type
 */
export const useAvailableFormats = (subType?: LineScatterSubType): DataFormat[] => {
  return useMemo(() => {
    if (!subType) return [];
    return getValidDataFormats(subType);
  }, [subType]);
};

/**
 * Hook to get available symbol value options based on sub-type
 */
export const useAvailableSymbolValues = (subType?: LineScatterSubType): SymbolValueOption[] => {
  return useMemo(() => {
    if (!subType) return [];
    
    const errorBarSubTypes: LineScatterSubType[] = [
      'Simple Line and Scatter Error Bars',
      'Multiple Line and Scatter Error Bars',
      'Horizontal Error Bars',
      'Bi-Directional Error Bars'
    ];
    
    if (errorBarSubTypes.includes(subType)) {
      return ['Worksheet', 'Asymmetric Error Bar Column'];
    }
    
    return [];
  }, [subType]);
};
