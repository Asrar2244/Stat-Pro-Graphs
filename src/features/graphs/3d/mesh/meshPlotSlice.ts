import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Available data formats for 3D mesh plots (no subplots, only 3 formats)
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
 * 3D mesh plot configuration interface
 */
export interface MeshPlotConfig {
  selectedProject: string;
  graphType: '3D Mesh Plot';
  dataFormat: DataFormat;
  variables: {
    x: string[];
    y: string[];
    z: string[];
  };
  meshConfig: {
    opacity: number;
    surfaceType: 'surface' | 'wireframe' | 'mesh';
    colorScale: string;
    showContours: boolean;
    contourOpacity: number;
    lighting: boolean;
    smoothShading: boolean;
    showGrid: boolean;
    gridOpacity: number;
  };
}

/**
 * 3D mesh plot store interface
 */
interface MeshPlotStore {
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
  
  // Mesh plot specific options
  opacity: number;
  surfaceType: 'surface' | 'wireframe' | 'mesh';
  colorScale: string;
  showContours: boolean;
  contourOpacity: number;
  lighting: boolean;
  smoothShading: boolean;
  showGrid: boolean;
  gridOpacity: number;
  
  // Graph configuration
  graphConfig: MeshPlotConfig | null;
  
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
  setOpacity: (opacity: number) => void;
  setSurfaceType: (type: 'surface' | 'wireframe' | 'mesh') => void;
  setColorScale: (scale: string) => void;
  setShowContours: (show: boolean) => void;
  setContourOpacity: (opacity: number) => void;
  setLighting: (lighting: boolean) => void;
  setSmoothShading: (shading: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setGridOpacity: (opacity: number) => void;
  setGraphConfig: (config: MeshPlotConfig) => void;
  reset: () => void;
}

/**
 * 3D mesh plot store implementation with persistence
 */
export const useMeshPlotStore = create<MeshPlotStore>()(
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
      opacity: 1.0,
      surfaceType: 'mesh',
      colorScale: 'viridis',
      showContours: true,
      contourOpacity: 0.6,
      lighting: true,
      smoothShading: true,
      showGrid: true,
      gridOpacity: 0.5,
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
      setOpacity: (opacity) => set({ opacity }),
      setSurfaceType: (surfaceType) => set({ surfaceType }),
      setColorScale: (colorScale) => set({ colorScale }),
      setShowContours: (showContours) => set({ showContours }),
      setContourOpacity: (contourOpacity) => set({ contourOpacity }),
      setLighting: (lighting) => set({ lighting }),
      setSmoothShading: (smoothShading) => set({ smoothShading }),
      setShowGrid: (showGrid) => set({ showGrid }),
      setGridOpacity: (gridOpacity) => set({ gridOpacity }),
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
        opacity: 1.0,
        surfaceType: 'mesh',
        colorScale: 'viridis',
        showContours: true,
        contourOpacity: 0.6,
        lighting: true,
        smoothShading: true,
        showGrid: true,
        gridOpacity: 0.5,
        graphConfig: null,
      }),
    }),
    {
      name: 'mesh-plot-storage', // unique name for localStorage key
      // Only persist the essential state, not the Maps and complex objects
      partialize: (state) => ({
        selectedProject: state.selectedProject,
        dataFormat: state.dataFormat,
        selectedXVariable: state.selectedXVariable,
        selectedYVariable: state.selectedYVariable,
        selectedZVariable: state.selectedZVariable,
        opacity: state.opacity,
        surfaceType: state.surfaceType,
        colorScale: state.colorScale,
        showContours: state.showContours,
        contourOpacity: state.contourOpacity,
        lighting: state.lighting,
        smoothShading: state.smoothShading,
        showGrid: state.showGrid,
        gridOpacity: state.gridOpacity,
      }),
    }
  )
);