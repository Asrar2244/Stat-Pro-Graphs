import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Available line plot sub-types
 */
export type LineSubType =
  // A) Simple Straight Line
  | 'Simple Straight Line'
  // B) Multiple Straight Lines
  | 'Multiple Straight Lines'
  // C) Simple Spline Curve
  | 'Simple Spline Curve'
  // D) Multiple Spline Curves
  | 'Multiple Spline Curves'
  // E) Simple Vertical Mid Point Step Plot
  | 'Simple Vertical Mid Point Step Plot'
  // F) Simple Vertical Step Plot
  | 'Simple Vertical Step Plot'
  // G) Multiple Vertical Step Plot
  | 'Multiple Vertical Step Plot'
  // H) Multiple Horizontal Step Plot
  | 'Multiple Horizontal Step Plot'
  // I) Multiple Vertical Mid Point Step Plot
  | 'Multiple Vertical Mid Point Step Plot'
  // J) Simple Horizontal Mid Point Step Plot
  | 'Simple Horizontal Mid Point Step Plot'
  // K) Simple Horizontal Step Plot
  | 'Simple Horizontal Step Plot'
  // L) Multiple Horizontal Mid Point Step Plot
  | 'Multiple Horizontal Mid Point Step Plot';

/**
 * Available data formats for line plots
 */
export type DataFormat =
  // Basic formats
  | 'XY Pairs'
  | 'Single X'
  | 'Single Y'
  // Multiple formats
  | 'Many X'
  | 'Many Y'
  | 'X Many Y'
  | 'Y Many X'
  // Category formats
  | 'XY Category'
  | 'X Category'
  | 'Y Category';

/**
 * Variable interface
 */
export interface Variable {
  name: string;
  type: 'numeric' | 'categorical';
  selected?: boolean;
}

/**
 * Line plot configuration interface
 */
export interface LinePlotConfig {
  selectedProject: string;
  graphType: 'Line Plot';
  subType: LineSubType;
  dataFormat: DataFormat;
  variables: {
    x: string[];
    y: string[];
    category?: string[];
  };
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'dashdot';
  lineWidth?: number;
  markerStyle?: string;
  stepDirection?: 'vertical' | 'horizontal' | 'vertical-midpoint' | 'horizontal-midpoint';
  splineSmoothing?: number;
  splineTension?: number;
}

/**
 * Line plot store interface
 */
interface LinePlotStore {
  // Project and type selection
  selectedProject: string | null;
  subType: LineSubType | null;
  dataFormat: DataFormat | null;
  
  // Variable management
  availableVariables: Variable[];
  xVariableList: Map<string, boolean>;
  yVariableList: Map<string, boolean>;
  categoryVariableList: Map<string, boolean>;
  selectedXVariable: string | undefined;
  selectedYVariable: string | undefined;
  
  // Line plot specific options
  lineStyle: 'solid' | 'dashed' | 'dotted' | 'dashdot';
  lineWidth: number;
  markerStyle: string;
  stepDirection: 'vertical' | 'horizontal' | 'vertical-midpoint' | 'horizontal-midpoint';
  splineSmoothing: number;
  splineTension: number;
  
  // Graph configuration
  graphConfig: LinePlotConfig | null;
  
  // Actions
  setProject: (project: string) => void;
  setSubType: (subType: LineSubType) => void;
  setDataFormat: (format: DataFormat) => void;
  setAvailableVariables: (variables: Variable[]) => void;
  setXVariableList: (list: Map<string, boolean>) => void;
  setYVariableList: (list: Map<string, boolean>) => void;
  setCategoryVariableList: (list: Map<string, boolean>) => void;
  setXVariable: (x?: string) => void;
  setYVariable: (y?: string) => void;
  setLineStyle: (style: 'solid' | 'dashed' | 'dotted' | 'dashdot') => void;
  setLineWidth: (width: number) => void;
  setMarkerStyle: (style: string) => void;
  setStepDirection: (direction: 'vertical' | 'horizontal' | 'vertical-midpoint' | 'horizontal-midpoint') => void;
  setSplineSmoothing: (smoothing: number) => void;
  setSplineTension: (tension: number) => void;
  setGraphConfig: (config: LinePlotConfig) => void;
  reset: () => void;
}

/**
 * Line plot store implementation with persistence
 */
export const useLinePlotStore = create<LinePlotStore>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedProject: null,
      subType: null,
      dataFormat: null,
      availableVariables: [],
      xVariableList: new Map(),
      yVariableList: new Map(),
      categoryVariableList: new Map(),
      selectedXVariable: undefined,
      selectedYVariable: undefined,
      lineStyle: 'solid',
      lineWidth: 2,
      markerStyle: 'circle',
      stepDirection: 'vertical',
      splineSmoothing: 0.5,
      splineTension: 0.5,
      graphConfig: null,
      
      // Actions
      setProject: (project) => set({ selectedProject: project }),
      setSubType: (subType) => set({ subType }),
      setDataFormat: (format) => set({ dataFormat: format }),
      setAvailableVariables: (variables) => set({ availableVariables: variables }),
      setXVariableList: (list) => set({ xVariableList: list }),
      setYVariableList: (list) => set({ yVariableList: list }),
      setCategoryVariableList: (list) => set({ categoryVariableList: list }),
      setXVariable: (selectedXVariable) => set({ selectedXVariable }),
      setYVariable: (selectedYVariable) => set({ selectedYVariable }),
      setLineStyle: (style) => set({ lineStyle: style }),
      setLineWidth: (width) => set({ lineWidth: width }),
      setMarkerStyle: (style) => set({ markerStyle: style }),
      setStepDirection: (direction) => set({ stepDirection: direction }),
      setSplineSmoothing: (smoothing) => set({ splineSmoothing: smoothing }),
      setSplineTension: (tension) => set({ splineTension: tension }),
      setGraphConfig: (config) => set({ graphConfig: config }),
      
      reset: () => set({
        selectedProject: null,
        subType: null,
        dataFormat: null,
        availableVariables: [],
        xVariableList: new Map(),
        yVariableList: new Map(),
        categoryVariableList: new Map(),
        selectedXVariable: undefined,
        selectedYVariable: undefined,
        lineStyle: 'solid',
        lineWidth: 2,
        markerStyle: 'circle',
        stepDirection: 'vertical',
        splineSmoothing: 0.5,
        splineTension: 0.5,
        graphConfig: null,
      }),
    }),
    {
      name: 'line-plot-storage', // unique name for localStorage key
      // Only persist the essential state, not the Maps and complex objects
      partialize: (state) => ({
        selectedProject: state.selectedProject,
        subType: state.subType,
        dataFormat: state.dataFormat,
        selectedXVariable: state.selectedXVariable,
        selectedYVariable: state.selectedYVariable,
        lineStyle: state.lineStyle,
        lineWidth: state.lineWidth,
        markerStyle: state.markerStyle,
        stepDirection: state.stepDirection,
        splineSmoothing: state.splineSmoothing,
        splineTension: state.splineTension,
      }),
    }
  )
);
