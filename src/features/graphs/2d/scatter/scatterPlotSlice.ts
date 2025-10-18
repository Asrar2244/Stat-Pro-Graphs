import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Available scatter plot sub-types
 */
export type ScatterSubType =
  // A) Simple Scatter
  | 'Simple Scatter'
  // B) Multiple Scatter  
  | 'Multiple Scatter'
  // C) Simple Scatter - Regression
  | 'Simple Scatter Regression'
  // D) Multiple Scatter - Regressions
  | 'Multiple Scatter Regression'
  // E) Simple Scatter Error Bars
  | 'Simple Scatter Error Bar'
  // F) Multiple Scatter Error Bars
  | 'Multiple Scatter Error Bar'
  // G) Simple Scatter - Error Bars & Regression
  | 'Simple Scatter Error Bar and Regression'
  // H) Multiple Scatter - Error Bars & Regressions
  | 'Multiple Scatter Error Bar and Regression'
  // I) Simple Scatter - Horizontal Error Bars
  | 'Simple Scatter Horizontal Error Bar'
  // J) Simple Scatter - Bi-directional Error Bars
  | 'Simple Scatter Bidirectional Error Bars'
  // K) Vertical Asymmetric Error Bars
  | 'Vertical Asymmetric Error Bars'
  // L) Horizontal Asymmetric Error Bars
  | 'Horizontal Asymmetric Error Bars'
  // M) Bi-directional Asymmetric Error Bars
  | 'Bidirectional Asymmetric Error Bars'
  // N) Vertical Point Plot
  | 'Vertical Point Plot'
  // O) Horizontal Point Plot
  | 'Horizontal Point Plot'
  // P) Vertical Dot Plot
  | 'Vertical Dot Plot'
  // Q) Horizontal Dot Plot
  | 'Horizontal Dot Plot';

/**
 * Available data formats for scatter plots
 */
export type DataFormat =
  // Basic formats
  | 'XY Pair'
  | 'Single Y'
  | 'Single X'
  // Multiple formats
  | 'XY Pairs'
  | 'X Many Y'
  | 'Y Many X'
  | 'Many X'
  | 'Many Y'
  // Category formats
  | 'XY Category'
  | 'X Category'
  | 'Y Category'
  // Replicate formats
  | 'X Single Y Replicate'
  | 'Y Replicate'
  | 'X Many Y Replicates'
  | 'Many Y Replicates'
  | 'Y Many X Replicates'
  | 'Many X Replicates'
  | 'X Replicates'
  | 'Y Single X Replicates'
  // Special formats
  | 'YX Pairs'
  | 'Category Many Y'
  | 'Category Many X'
  // Error Bar specific formats
  | 'XY Replicate'
  | 'X Replicate'
  | 'Y Replicate'
  | 'Category Y';

/**
 * Symbol value options for error bar configuration
 */
export type SymbolValueOption =
  | 'Worksheet Columns'
  | 'Asymmetric Error Bar'
  | 'Column Means'
  | 'Row Means'
  | 'By Category Mean'
  | 'Column Median'
  | 'Row Median'
  | 'By Category Median'
  | 'First Column Entry'
  | 'First Row Entry'
  | 'Last Column Entry'
  | 'Last Row Entry';

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
 * Represents a variable that can be used in scatter plots
 */
export interface Variable {
  id: string;
  name: string;
  type: 'numeric' | 'categorical';
}

/**
 * State interface for the scatter plot store
 */
interface ScatterPlotState {
  selectedProject?: string;
  graphType: 'Scatter Plot';
  subType?: ScatterSubType;
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
  setSubType: (t?: ScatterSubType) => void;
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

const initial: Omit<ScatterPlotState, 'setProject' | 'setSubType' | 'setDataset' | 'setDataFormat' | 'setXVariable' | 'setYVariable' | 'setAvailableVariables' | 'setGraphConfig' | 'reset' | 'setDataSource' | 'setUploadedMeta' | 'setUploadedData' | 'setSymbolValue' | 'setErrorCalculationUpper' | 'setErrorCalculationLower' | 'setErrorBarVariable'> = {
  graphType: 'Scatter Plot',
  dataSource: 'project',
  availableVariables: [],
  graphConfig: {},
  // Error Bar defaults to prevent uncontrolled to controlled warnings
  symbolValue: 'Worksheet Columns',
  errorCalculationUpper: undefined,
  errorCalculationLower: undefined,
  errorBarVariable: undefined,
};

/**
 * Zustand store for managing scatter plot configuration state with persistence
 */
export const useScatterPlotStore = create<ScatterPlotState>()(
  persist(
    (set) => ({
      ...initial,
      setProject: (selectedProject) => set({ selectedProject }),
      setSubType: (subType) => {
        set({ subType });
        // Auto-set data format for Simple Scatter types
        if (subType === 'Simple Scatter' || subType === 'Simple Scatter Regression') {
          set({ dataFormat: 'XY Pair' });
        }
        // Auto-set symbol value to Worksheet Columns for specific error bar subplot types
        if (subType === 'Multiple Scatter Error Bar and Regression' || 
            subType === 'Simple Scatter Horizontal Error Bar' || 
            subType === 'Simple Scatter Bidirectional Error Bars') {
          set({ symbolValue: 'Worksheet Columns' });
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
      name: 'scatter-plot-storage', // unique name for localStorage key
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