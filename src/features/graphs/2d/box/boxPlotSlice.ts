import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BoxPlotSubType, DataFormat, Variable, BoxPlotConfig, BoxPlotOrientation } from './types';

interface BoxPlotStore {
    // Project and type selection
    selectedProject: string | null;
    subType: BoxPlotSubType | 'Vertical Box Plot'; // Default to Vertical
    dataFormat: DataFormat | 'Many Y'; // Default for Vertical

    // Variable management
    availableVariables: Variable[];
    xVariableList: Map<string, boolean>;
    yVariableList: Map<string, boolean>;
    categoryVariableList: Map<string, boolean>;
    selectedXVariable: string | undefined;
    selectedYVariable: string | undefined;

    // Box plot specific options
    boxWidth: number;
    showMean: boolean;
    showOutliers: boolean;
    showAllPoints: boolean;
    orientation: BoxPlotOrientation;

    // Graph configuration
    graphConfig: BoxPlotConfig | null;

    // Actions
    setProject: (project: string) => void;
    setSubType: (subType: BoxPlotSubType) => void;
    setDataFormat: (format: DataFormat) => void;
    setAvailableVariables: (variables: Variable[]) => void;
    setXVariableList: (list: Map<string, boolean>) => void;
    setYVariableList: (list: Map<string, boolean>) => void;
    setCategoryVariableList: (list: Map<string, boolean>) => void;
    setXVariable: (x?: string) => void;
    setYVariable: (y?: string) => void;
    setBoxWidth: (width: number) => void;
    setShowMean: (show: boolean) => void;
    setShowOutliers: (show: boolean) => void;
    setShowAllPoints: (show: boolean) => void;
    setOrientation: (orientation: BoxPlotOrientation) => void;
    setGraphConfig: (config: BoxPlotConfig) => void;
    reset: () => void;
}

export const useBoxPlotStore = create<BoxPlotStore>()(
    persist(
        (set, get) => ({
            // Initial state
            selectedProject: null,
            subType: 'Vertical Box Plot',
            dataFormat: 'Many Y',
            availableVariables: [],
            xVariableList: new Map(),
            yVariableList: new Map(),
            categoryVariableList: new Map(),
            selectedXVariable: undefined,
            selectedYVariable: undefined,
            boxWidth: 0.5,
            showMean: true,
            showOutliers: true,
            showAllPoints: false,
            orientation: 'vertical',
            graphConfig: null,

            // Actions
            setProject: (project) => set({ selectedProject: project }),
            setSubType: (subType) => {
                const orientation = subType.includes('Horizontal') ? 'horizontal' : 'vertical';
                set({ subType, orientation });
            },
            setDataFormat: (format) => set({ dataFormat: format }),
            setAvailableVariables: (variables) => set({ availableVariables: variables }),
            setXVariableList: (list) => set({ xVariableList: list }),
            setYVariableList: (list) => set({ yVariableList: list }),
            setCategoryVariableList: (list) => set({ categoryVariableList: list }),
            setXVariable: (selectedXVariable) => set({ selectedXVariable }),
            setYVariable: (selectedYVariable) => set({ selectedYVariable }),
            setBoxWidth: (boxWidth) => set({ boxWidth }),
            setShowMean: (showMean) => set({ showMean }),
            setShowOutliers: (showOutliers) => set({ showOutliers }),
            setShowAllPoints: (showAllPoints) => set({ showAllPoints }),
            setOrientation: (orientation) => set({ orientation }),
            setGraphConfig: (config) => set({ graphConfig: config }),

            reset: () => set({
                selectedProject: null,
                subType: 'Vertical Box Plot',
                dataFormat: 'Many Y',
                availableVariables: [],
                xVariableList: new Map(),
                yVariableList: new Map(),
                categoryVariableList: new Map(),
                selectedXVariable: undefined,
                selectedYVariable: undefined,
                boxWidth: 0.5,
                showMean: true,
                showOutliers: true,
                showAllPoints: false,
                orientation: 'vertical',
                graphConfig: null,
            }),
        }),
        {
            name: 'box-plot-storage',
            partialize: (state) => ({
                selectedProject: state.selectedProject,
                subType: state.subType,
                dataFormat: state.dataFormat,
                selectedXVariable: state.selectedXVariable,
                selectedYVariable: state.selectedYVariable,
                boxWidth: state.boxWidth,
                showMean: state.showMean,
                showOutliers: state.showOutliers,
                showAllPoints: state.showAllPoints,
                orientation: state.orientation,
            }),
        }
    )
);
