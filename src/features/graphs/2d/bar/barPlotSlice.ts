import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BarPlotSubType, DataFormat, Variable } from './types';
import type { SymbolValueOption, ErrorCalculationOption } from '../scatter/scatterPlotSlice';

/**
 * State interface for the bar plot store
 */
interface BarPlotState {
    selectedProject?: string;
    graphType: 'Bar Plot';
    subType?: BarPlotSubType;
    selectedDataset?: string;
    dataFormat?: DataFormat;
    dataSource: 'project' | 'upload' | 'empty';
    uploadedFileName?: string;
    uploadedData?: Record<string, any>[];
    selectedXVariable?: string;
    selectedYVariable?: string;
    availableVariables: Variable[];
    graphConfig: Record<string, unknown>;

    // Variable Lists (Maps)
    xVariableList: Map<string, boolean>;
    yVariableList: Map<string, boolean>;
    errorBarVariableList: Map<string, boolean>;
    categoryVariableList: Map<string, boolean>;

    // Error Bar specific state
    symbolValue?: SymbolValueOption;
    errorCalculationUpper?: ErrorCalculationOption;
    errorCalculationLower?: ErrorCalculationOption;
    errorBarVariable?: string;

    setProject: (p?: string) => void;
    setSubType: (t?: BarPlotSubType) => void;
    setDataset: (d?: string) => void;
    setDataFormat: (f?: DataFormat) => void;
    setDataSource: (s: 'project' | 'upload' | 'empty') => void;
    setUploadedMeta: (fileName?: string) => void;
    setUploadedData: (data?: Record<string, any>[]) => void;
    setXVariable: (x?: string) => void;
    setYVariable: (y?: string) => void;
    setAvailableVariables: (v: Variable[]) => void;
    setGraphConfig: (c: Record<string, unknown>) => void;

    // Variable List Setters
    setXVariableList: (list: Map<string, boolean>) => void;
    setYVariableList: (list: Map<string, boolean>) => void;
    setErrorBarVariableList: (list: Map<string, boolean>) => void;
    setCategoryVariableList: (list: Map<string, boolean>) => void;

    // Error Bar specific setters
    setSymbolValue: (s?: SymbolValueOption) => void;
    setErrorCalculationUpper: (e?: ErrorCalculationOption) => void;
    setErrorCalculationLower: (e?: ErrorCalculationOption) => void;
    setErrorBarVariable: (v?: string) => void;

    reset: () => void;
}

const initial: Omit<BarPlotState, 'setProject' | 'setSubType' | 'setDataset' | 'setDataFormat' | 'setXVariable' | 'setYVariable' | 'setAvailableVariables' | 'setGraphConfig' | 'reset' | 'setDataSource' | 'setUploadedMeta' | 'setUploadedData' | 'setSymbolValue' | 'setErrorCalculationUpper' | 'setErrorCalculationLower' | 'setErrorBarVariable' | 'setXVariableList' | 'setYVariableList' | 'setErrorBarVariableList' | 'setCategoryVariableList'> = {
    graphType: 'Bar Plot',
    dataSource: 'project',
    availableVariables: [],
    graphConfig: {},
    xVariableList: new Map(),
    yVariableList: new Map(),
    errorBarVariableList: new Map(),
    categoryVariableList: new Map(),
    // Error Bar defaults
    symbolValue: 'Worksheet Columns',
    errorCalculationUpper: undefined,
    errorCalculationLower: undefined,
    errorBarVariable: undefined,
};

/**
 * Zustand store for managing bar plot configuration state with persistence
 */
export const useBarPlotStore = create<BarPlotState>()(
    persist(
        (set) => ({
            ...initial,
            setProject: (selectedProject) => set({ selectedProject }),
            setSubType: (subType) => {
                set({ subType });
                // Auto-set data format defaults if needed
                if (subType === 'Simple Vertical Bar') {
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

            // Variable List Setters
            setXVariableList: (xVariableList) => set({ xVariableList }),
            setYVariableList: (yVariableList) => set({ yVariableList }),
            setErrorBarVariableList: (errorBarVariableList) => set({ errorBarVariableList }),
            setCategoryVariableList: (categoryVariableList) => set({ categoryVariableList }),

            // Error Bar specific setters
            setSymbolValue: (symbolValue) => set({ symbolValue }),
            setErrorCalculationUpper: (errorCalculationUpper) => set({ errorCalculationUpper }),
            setErrorCalculationLower: (errorCalculationLower) => set({ errorCalculationLower }),
            setErrorBarVariable: (errorBarVariable) => set({ errorBarVariable }),

            reset: () => set({ ...initial }),
        }),
        {
            name: 'bar-plot-storage', // unique name for localStorage key
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
