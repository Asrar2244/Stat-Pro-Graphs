import { useMemo } from 'react';
import type { AreaSubType, DataFormat } from '../areaPlotSlice';
import { getValidDataFormats } from '../constants';

/**
 * Custom hook for determining available data formats based on subtype
 * @param subType - The selected area plot subtype
 * @returns Array of available data formats
 */
export const useAvailableFormats = (
    subType?: AreaSubType
): DataFormat[] => {
    return useMemo(() => {
        if (!subType) return [];

        return getValidDataFormats(subType);
    }, [subType]);
};
