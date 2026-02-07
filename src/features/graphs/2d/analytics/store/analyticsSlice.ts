import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AnalyticsType } from '../computers/types';
import { Variable } from '../../bar/types';

interface AnalyticsState {
    selectedProject?: string;
    graphType: 'Data Analytics';
    subType?: AnalyticsType; // The selected analytical plot type (ROC, QQ, etc.)
    dataFormat: 'Single X-Y' | 'Multi X-Y' | 'X Many Y' | 'XY Pairs';
    selectedDataset?: string;
    dataSource: 'project' | 'upload' | 'empty';
    uploadedFileName?: string;
    uploadedData?: Record<string, any>[];

    availableVariables: Variable[];

    // Dynamic Variable Selections
    // Key matches the 'id' in AnalyticsVariableRequirement (e.g., 'target', 'features')
    variableSelections: Map<string, string[]>;

    // Generic configuration for the specific analytics (e.g. 'positiveClass', 'k_value', 'distribution')
    analyticsConfig: Record<string, any>;

    // Actions
    setProject: (p?: string) => void;
    setSubType: (t?: AnalyticsType) => void;
    setDataFormat: (f: 'Single X-Y' | 'Multi X-Y' | 'X Many Y' | 'XY Pairs') => void;
    setDataset: (d?: string) => void;
    setDataSource: (s: 'project' | 'upload' | 'empty') => void;
    setUploadedMeta: (fileName?: string) => void;
    setUploadedData: (data?: Record<string, any>[]) => void;
    setAvailableVariables: (v: Variable[]) => void;

    // Variable Actions
    setVariableSelection: (requirementId: string, variables: string[]) => void;
    clearVariableSelection: (requirementId: string) => void;

    // Config Actions
    setAnalyticsConfig: (config: Record<string, any>) => void;
    updateAnalyticsConfig: (key: string, value: any) => void;

    reset: () => void;
}

const initial: Omit<AnalyticsState, 'setProject' | 'setSubType' | 'setDataFormat' | 'setDataset' | 'setDataSource' | 'setUploadedMeta' | 'setUploadedData' | 'setAvailableVariables' | 'setVariableSelection' | 'clearVariableSelection' | 'setAnalyticsConfig' | 'updateAnalyticsConfig' | 'reset'> = {
    graphType: 'Data Analytics',
    dataSource: 'project',
    dataFormat: 'Single X-Y',
    availableVariables: [],
    variableSelections: new Map(),
    analyticsConfig: {},
};

export const useAnalyticsStore = create<AnalyticsState>()(
    persist(
        (set) => ({
            ...initial,
            setProject: (selectedProject) => set({ selectedProject }),
            setSubType: (subType) => set({ subType, variableSelections: new Map(), analyticsConfig: {} }), // Reset selections on type change
            setDataFormat: (dataFormat) => set({ dataFormat }),
            setDataset: (selectedDataset) => set({ selectedDataset }),
            setDataSource: (dataSource) => set({ dataSource }),
            setUploadedMeta: (uploadedFileName) => set({ uploadedFileName }),
            setUploadedData: (uploadedData) => set({ uploadedData }),
            setAvailableVariables: (availableVariables) => set({ availableVariables }),

            setVariableSelection: (reqId, vars) => set((state) => {
                const newMap = new Map(state.variableSelections);
                newMap.set(reqId, vars);
                return { variableSelections: newMap };
            }),

            clearVariableSelection: (reqId) => set((state) => {
                const newMap = new Map(state.variableSelections);
                newMap.delete(reqId);
                return { variableSelections: newMap };
            }),

            setAnalyticsConfig: (analyticsConfig) => set({ analyticsConfig }),

            updateAnalyticsConfig: (key, value) => set((state) => ({
                analyticsConfig: { ...state.analyticsConfig, [key]: value }
            })),

            reset: () => set(initial),
        }),
        {
            name: 'analytics-storage',
            partialize: (state) => ({
                selectedProject: state.selectedProject,
                selectedDataset: state.selectedDataset,
                dataSource: state.dataSource,
                subType: state.subType,
                dataFormat: state.dataFormat,
                // Don't persist large data or variables usually, but maybe config
                analyticsConfig: state.analyticsConfig
            }),
        }
    )
);
