import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AreaSubType, DataFormat, Variable } from './types';

// Re-export for consumers
export type { AreaSubType, DataFormat, Variable };

/**
 * State interface for the area plot store
 */
interface AreaPlotState {
    selectedProject?: string;
    graphType: 'Area Plot';
    subType?: AreaSubType;
    selectedDataset?: string;
    dataFormat?: DataFormat;
    dataSource: 'project' | 'upload' | 'empty';
    uploadedFileName?: string;
    uploadedData?: Record<string, any>[];
    selectedXVariable?: string;
    selectedYVariable?: string;
    availableVariables: Variable[];
    graphConfig: Record<string, unknown>;

    setProject: (p?: string) => void;
    setSubType: (t?: AreaSubType) => void;
    setDataset: (d?: string) => void;
    setDataFormat: (f?: DataFormat) => void;
    setDataSource: (s: 'project' | 'upload' | 'empty') => void;
    setUploadedMeta: (fileName?: string) => void;
    setUploadedData: (data?: Record<string, any>[]) => void;
    setXVariable: (x?: string) => void;
    setYVariable: (y?: string) => void;
    setAvailableVariables: (v: Variable[]) => void;
    setGraphConfig: (c: Record<string, unknown>) => void;

    reset: () => void;
}

const initial: Omit<AreaPlotState, 'setProject' | 'setSubType' | 'setDataset' | 'setDataFormat' | 'setXVariable' | 'setYVariable' | 'setAvailableVariables' | 'setGraphConfig' | 'reset' | 'setDataSource' | 'setUploadedMeta' | 'setUploadedData'> = {
    graphType: 'Area Plot',
    dataSource: 'project',
    availableVariables: [],
    graphConfig: {},
};

/**
 * Zustand store for managing area plot configuration state with persistence
 */
export const useAreaPlotStore = create<AreaPlotState>()(
    persist(
        (set) => ({
            ...initial,
            setProject: (selectedProject) => set({ selectedProject }),
            setSubType: (subType) => {
                set({ subType });
                // Auto-set data format for Simple Area types
                if (subType === 'Simple Area') {
                    set({ dataFormat: 'XY Pair' });
                }
            },
            setDataset: (selectedDataset) => set({ selectedDataset }),
            setDataFormat: (dataFormat) => set({ dataFormat }),
            setDataSource: (dataSource) => set({ dataSource }),
            setUploadedMeta: (uploadedFileName) => set({ uploadedFileName }),
            setUploadedData: (uploadedData) => set({ uploadedData }),
            setXVariable: (selectedXVariable) => set({ selectedXVariable }),
            setYVariable: (selectedYVariable) => set({ selectedYVariable }),
            setAvailableVariables: (availableVariables) => set({ availableVariables }),
            setGraphConfig: (graphConfig) => set({ graphConfig }),

            reset: () => set({ ...initial }),
        }),
        {
            name: 'area-plot-storage', // unique name for localStorage key
            // Only persist the essential state, not complex objects
            partialize: (state) => ({
                selectedProject: state.selectedProject,
                subType: state.subType,
                selectedDataset: state.selectedDataset,
                dataFormat: state.dataFormat,
                dataSource: state.dataSource,
                uploadedFileName: state.uploadedFileName,
                selectedXVariable: state.selectedXVariable,
                selectedYVariable: state.selectedYVariable,
            }),
        }
    )
);
