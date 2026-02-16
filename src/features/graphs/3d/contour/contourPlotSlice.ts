import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Available data formats for Contour plots
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
 * Contour plot configuration interface
 */
export interface ContourPlotConfig {
    selectedProject: string;
    graphType: '3D Contour Plot';
    dataFormat: DataFormat;
    variables: {
        x: string[];
        y: string[];
        z: string[];
    };
    contourConfig: {
        contourType: 'contour' | 'filled';
        colorScale: string;
        opacity: number;
        showGrid: boolean;
        gridOpacity: number;
        zInterval?: number; // For non-filled contour
        showLabels: boolean; // Show Z values on contour lines
    };
}

/**
 * Contour plot store interface
 */
interface ContourPlotStore {
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

    // Contour plot specific options
    contourType: 'contour' | 'filled';
    colorScale: string;
    opacity: number;
    showGrid: boolean;
    gridOpacity: number;
    zInterval: number;
    showLabels: boolean;

    // Graph configuration
    graphConfig: ContourPlotConfig | null;

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

    setContourType: (type: 'contour' | 'filled') => void;
    setColorScale: (scale: string) => void;
    setOpacity: (opacity: number) => void;
    setShowGrid: (show: boolean) => void;
    setGridOpacity: (opacity: number) => void;
    setZInterval: (interval: number) => void;
    setShowLabels: (show: boolean) => void;

    setGraphConfig: (config: ContourPlotConfig) => void;
    reset: () => void;
}

/**
 * Contour plot store implementation with persistence
 */
export const useContourPlotStore = create<ContourPlotStore>()(
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

            contourType: 'contour',
            colorScale: 'viridis',
            opacity: 1.0,
            showGrid: true,
            gridOpacity: 0.5,
            zInterval: 10,
            showLabels: true,

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

            setContourType: (contourType) => set({ contourType }),
            setColorScale: (colorScale) => set({ colorScale }),
            setOpacity: (opacity) => set({ opacity }),
            setShowGrid: (showGrid) => set({ showGrid }),
            setGridOpacity: (gridOpacity) => set({ gridOpacity }),
            setZInterval: (zInterval) => set({ zInterval }),
            setShowLabels: (showLabels) => set({ showLabels }),

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

                contourType: 'contour',
                colorScale: 'viridis',
                opacity: 1.0,
                showGrid: true,
                gridOpacity: 0.5,
                zInterval: 10,
                showLabels: true,

                graphConfig: null,
            }),
        }),
        {
            name: 'contour-plot-storage', // unique name for localStorage key
            // Only persist the essential state
            partialize: (state) => ({
                selectedProject: state.selectedProject,
                dataFormat: state.dataFormat,
                selectedXVariable: state.selectedXVariable,
                selectedYVariable: state.selectedYVariable,
                selectedZVariable: state.selectedZVariable,
                contourType: state.contourType,
                colorScale: state.colorScale,
                opacity: state.opacity,
                showGrid: state.showGrid,
                gridOpacity: state.gridOpacity,
                zInterval: state.zInterval,
                showLabels: state.showLabels,
            }),
        }
    )
);
