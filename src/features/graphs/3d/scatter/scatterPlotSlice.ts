import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Available data formats for 3D scatter plots
 */
export type DataFormat =
    | 'XYZ Triplets'   // XYZ Triplet format
    | 'Many Z'         // Many Z Variables format  
    | 'XY Many Z';     // XY + Many Z Variables format

/**
 * Variable interface
 */
export interface Variable {
    name: string;
    type: 'numeric' | 'categorical';
    selected?: boolean;
}

/**
 * 3D scatter plot configuration interface
 */
export interface ScatterPlotConfig {
    selectedProject: string;
    graphType: '3D Scatter Plot';
    dataFormat: DataFormat;
    variables: {
        x: string[];
        y: string[];
        z: string[];
    };
    // scatterConfig removed
}

/**
 * 3D scatter plot store interface
 */
interface ScatterPlotStore {
    // Project and format selection
    selectedProject: string | null;
    dataFormat: DataFormat | null;

    // Variable management
    availableVariables: Variable[];
    xVariableList: Map<string, boolean>;
    yVariableList: Map<string, boolean>;
    zVariableList: Map<string, boolean>;
    selectedXVariable: string | undefined;
    selectedYVariable: string | undefined;
    selectedZVariable: string | undefined;

    // Graph configuration
    graphConfig: ScatterPlotConfig | null;

    // Actions
    setProject: (project: string) => void;
    setDataFormat: (format: DataFormat) => void;
    setAvailableVariables: (variables: Variable[]) => void;
    setXVariableList: (list: Map<string, boolean>) => void;
    setYVariableList: (list: Map<string, boolean>) => void;
    setZVariableList: (list: Map<string, boolean>) => void;
    setXVariable: (x?: string) => void;
    setYVariable: (y?: string) => void;
    setZVariable: (z?: string) => void;
    setGraphConfig: (config: ScatterPlotConfig) => void;
    reset: () => void;
}

/**
 * 3D scatter plot store implementation with persistence
 */
export const useScatterPlotStore = create<ScatterPlotStore>()(
    persist(
        (set, get) => ({
            // Initial state
            selectedProject: null,
            dataFormat: null,
            availableVariables: [],
            xVariableList: new Map(),
            yVariableList: new Map(),
            zVariableList: new Map(),
            selectedXVariable: undefined,
            selectedYVariable: undefined,
            selectedZVariable: undefined,
            graphConfig: null,

            // Actions
            setProject: (project) => set({ selectedProject: project }),
            setDataFormat: (format) => set({ dataFormat: format }),
            setAvailableVariables: (variables) => set({ availableVariables: variables }),
            setXVariableList: (list) => set({ xVariableList: list }),
            setYVariableList: (list) => set({ yVariableList: list }),
            setZVariableList: (list) => set({ zVariableList: list }),
            setXVariable: (selectedXVariable) => set({ selectedXVariable }),
            setYVariable: (selectedYVariable) => set({ selectedYVariable }),
            setZVariable: (selectedZVariable) => set({ selectedZVariable }),
            setGraphConfig: (config) => set({ graphConfig: config }),

            reset: () => set({
                selectedProject: null,
                dataFormat: null,
                availableVariables: [],
                xVariableList: new Map(),
                yVariableList: new Map(),
                zVariableList: new Map(),
                selectedXVariable: undefined,
                selectedYVariable: undefined,
                selectedZVariable: undefined,
                graphConfig: null,
            }),
        }),
        {
            name: 'scatter-plot-storage', // unique name for localStorage key
            // Only persist the essential state
            partialize: (state) => ({
                selectedProject: state.selectedProject,
                dataFormat: state.dataFormat,
                selectedXVariable: state.selectedXVariable,
                selectedYVariable: state.selectedYVariable,
                selectedZVariable: state.selectedZVariable,
            }),
        }
    )
);
