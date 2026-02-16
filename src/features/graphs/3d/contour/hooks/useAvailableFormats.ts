import { useMemo } from 'react';
import { DATA_FORMATS } from '../constants';
import type { DataFormat } from '../contourPlotSlice';

/**
 * Custom hook to get available data formats for Contour plots
 * @returns Array of available data formats
 */
export const useAvailableFormats = (): DataFormat[] => {
    return useMemo(() => {
        return DATA_FORMATS;
    }, []);
};
