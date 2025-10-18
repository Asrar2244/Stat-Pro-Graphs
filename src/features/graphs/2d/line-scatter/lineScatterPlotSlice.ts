import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Available line-scatter plot sub-types
 */
export type LineScatterSubType =
  // A) Simple Straight Line & Scatter
  | 'Simple Straight Line and Scatter'
  // B) Multiple Straight Lines & Scatter
  | 'Multiple Straight Lines and Scatter'
  // C) Simple Spline Curve Line & Scatter
  | 'Simple Spline Curve Line and Scatter'
  // D) Multiple Spline Curves Lines and Scatter
  | 'Multiple Spline Curves Lines and Scatter'
  // E) Simple Line & Scatter - Error Bars
  | 'Simple Line and Scatter Error Bars'
  // F) Multiple Line & Scatter - Error Bars
  | 'Multiple Line and Scatter Error Bars'
  // G) Simple Vertical Step Plot
  | 'Simple Vertical Step Plot'
  // H) Simple Vertical Midpoint Step Plot
  | 'Simple Vertical Midpoint Step Plot'
  // I) Multiple Vertical Step Plot
  | 'Multiple Vertical Step Plot'
  // J) Multiple Vertical Midpoint Step Plot
  | 'Multiple Vertical Midpoint Step Plot'
  // K) Simple Horizontal Step Plot
  | 'Simple Horizontal Step Plot'
  // L) Simple Horizontal Midpoint Step Plot
  | 'Simple Horizontal Midpoint Step Plot'
  // M) Multiple Horizontal Step Plot
  | 'Multiple Horizontal Step Plot'
  // N) Multiple Horizontal Midpoint Step Plot
  | 'Multiple Horizontal Midpoint Step Plot'
  // O) Horizontal Error Bars
  | 'Horizontal Error Bars'
  // P) Bi-Directional Error Bars
  | 'Bi-Directional Error Bars';

/**
 * Available data formats for line-scatter plots
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
  | 'X Category'
  | 'Y Category';

/**
 * Symbol value options for error bar configuration
 */
export type SymbolValueOption =
  | 'Worksheet'
  | 'Asymmetric Error Bar Column';

/**
 * Error calculation options for error bars
 */
export type ErrorCalculationOption =
  | 'Mean'
  | 'Median'
  | 'Standard Deviation'
  | '2 Standard Deviations'
  | '3 Standard Deviations'
  | 'Standard Error'
  | '2 Standard Errors'
  | '3 Standard Errors'
  | '95% Confidence'
  | '99% Confidence'
  | '95% Prediction Interval'
  | '99% Prediction Interval'
  | '95% Tolerance Interval'
  | '99% Tolerance Interval'
  | 'Robust Standard Deviation'
  | '2 Robust Standard Deviations'
  | 'Interquartile Range'
  | '1.5 IQR'
  | '75th Percentile'
  | '90th Percentile'
  | '95th Percentile'
  | '99th Percentile'
  | 'Maximum'
  | 'Minimum'
  | 'Range'
  | 'Last Entry'
  | 'First Entry'
  | 'Dynamic (Data-driven)'
  | 'None';

/**
 * Represents a variable that can be used in line-scatter plots
 */
export interface Variable {
  id: string;
  name: string;
  type: 'numeric' | 'categorical';
}

/**
 * State interface for the line-scatter plot store
 */
interface LineScatterPlotState {
  selectedProject?: string;
  graphType: 'Line-Scatter Plot';
  subType?: LineScatterSubType;
  selectedDataset?: string;
  dataFormat?: DataFormat;
  dataSource: 'project' | 'upload' | 'empty';
  uploadedFileName?: string;
  uploadedData?: Record<string, any>[];
  selectedXVariable?: string;
  selectedYVariable?: string;
  availableVariables: Variable[];
  graphConfig: Record<string, unknown>;
  
  // Error Bar specific state
  symbolValue?: SymbolValueOption;
  errorCalculationUpper?: ErrorCalculationOption;
  errorCalculationLower?: ErrorCalculationOption;
  errorBarVariable?: string;
  
  setProject: (p?: string) => void;
  setSubType: (t?: LineScatterSubType) => void;
  setDataset: (d?: string) => void;
  setDataFormat: (f?: DataFormat) => void;
  setDataSource: (s: 'project' | 'upload' | 'empty') => void;
  setUploadedMeta: (fileName?: string) => void;
  setUploadedData: (data?: Record<string, any>[]) => void;
  setXVariable: (x?: string) => void;
  setYVariable: (y?: string) => void;
  setAvailableVariables: (v: Variable[]) => void;
  setGraphConfig: (c: Record<string, unknown>) => void;
  
  // Error Bar specific setters
  setSymbolValue: (s?: SymbolValueOption) => void;
  setErrorCalculationUpper: (e?: ErrorCalculationOption) => void;
  setErrorCalculationLower: (e?: ErrorCalculationOption) => void;
  setErrorBarVariable: (v?: string) => void;
  
  reset: () => void;
}

const initial: Omit<LineScatterPlotState, 'setProject' | 'setSubType' | 'setDataset' | 'setDataFormat' | 'setXVariable' | 'setYVariable' | 'setAvailableVariables' | 'setGraphConfig' | 'reset' | 'setDataSource' | 'setUploadedMeta' | 'setUploadedData' | 'setSymbolValue' | 'setErrorCalculationUpper' | 'setErrorCalculationLower' | 'setErrorBarVariable'> = {
  graphType: 'Line-Scatter Plot',
  dataSource: 'project',
  availableVariables: [],
  graphConfig: {},
  // Error Bar defaults to prevent uncontrolled to controlled warnings
  symbolValue: 'Worksheet',
  errorCalculationUpper: undefined,
  errorCalculationLower: undefined,
  errorBarVariable: undefined,
};

/**
 * Zustand store for managing line-scatter plot configuration state with persistence
 */
export const useLineScatterPlotStore = create<LineScatterPlotState>()(
  persist(
    (set) => ({
      ...initial,
      setProject: (selectedProject) => set({ selectedProject }),
      setSubType: (subType) => {
        set({ subType });
        // Auto-set data format for Simple types
        if (subType === 'Simple Straight Line and Scatter' || 
            subType === 'Simple Spline Curve Line and Scatter' ||
            subType === 'Simple Vertical Step Plot' ||
            subType === 'Simple Vertical Midpoint Step Plot' ||
            subType === 'Simple Horizontal Step Plot' ||
            subType === 'Simple Horizontal Midpoint Step Plot') {
          set({ dataFormat: 'XY Pairs' });
        }
        // Auto-set symbol value to Worksheet for error bar subplot types
        if (subType === 'Simple Line and Scatter Error Bars' || 
            subType === 'Multiple Line and Scatter Error Bars' ||
            subType === 'Horizontal Error Bars' ||
            subType === 'Bi-Directional Error Bars') {
          set({ symbolValue: 'Worksheet' });
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
      
      // Error Bar specific setters
      setSymbolValue: (symbolValue) => set({ symbolValue }),
      setErrorCalculationUpper: (errorCalculationUpper) => set({ errorCalculationUpper }),
      setErrorCalculationLower: (errorCalculationLower) => set({ errorCalculationLower }),
      setErrorBarVariable: (errorBarVariable) => set({ errorBarVariable }),
      
      reset: () => set({ ...initial }),
    }),
    {
      name: 'line-scatter-plot-storage', // unique name for localStorage key
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
        symbolValue: state.symbolValue,
        errorCalculationUpper: state.errorCalculationUpper,
        errorCalculationLower: state.errorCalculationLower,
        errorBarVariable: state.errorBarVariable,
      }),
    }
  )
);
