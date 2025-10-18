import { useMemo } from 'react';
import { DATA_FORMATS } from '../constants';
import type { DataFormat } from '../meshPlotSlice';

/**
 * Custom hook for determining available data formats
 * For 3D mesh plots, all formats are always available (no subplots)
 * @returns Array of available data formats
 */
export const useAvailableFormats = (): DataFormat[] => {
  return useMemo(() => {
    // For 3D mesh plots, all formats are always available since there are no subplots
    return DATA_FORMATS;
  }, []);
};