import { useMemo } from 'react';
import { DATA_FORMATS } from '../constants';
import type { DataFormat } from '../scatterPlotSlice';

/**
 * Custom hook for determining available data formats
 * For 3D scatter plots, all formats are always available (no subplots)
 * @returns Array of available data formats
 */
export const useAvailableFormats = (): DataFormat[] => {
    return useMemo(() => {
        return DATA_FORMATS;
    }, []);
};
