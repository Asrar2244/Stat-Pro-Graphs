import { create } from 'zustand';

export type ScatterSubType =
  | 'Simple Scatter'
  | 'Simple Scatter Regression'
  | 'Multi Scatter'
  | 'Multi Scatter Regression'
  | 'Simple Scatter Error Bar'
  | 'Simple Scatter Error Bar and Regression'
  | 'Multi Scatter Error Bar'
  | 'Multi Scatter Error Bar and Regression'
  | 'Simple Scatter Horizontal Error Bar'
  | 'Simple Scatter Bidirectional Error Bars'
  | 'Vertical Asymmetric Error Bars'
  | 'Horizontal Asymmetric Error Bars'
  | 'Vertical Point Plots'
  | 'Horizontal Point Plots'
  | 'Vertical Dot Plot'
  | 'Horizontal Dot Plot';

export type DataFormat =
  | 'XY Pair'
  | 'Single Y'
  | 'Single X'
  | 'XY Pairs'
  | 'X Many Y'
  | 'Y Many X'
  | 'Many X'
  | 'Many Y'
  | 'XY Category'
  | 'X Category'
  | 'Y Category';

export interface Variable {
  id: string;
  name: string;
  type: 'numeric' | 'categorical';
}

interface ScatterPlotState {
  selectedProject?: string;
  graphType: 'Scatter Plot';
  subType?: ScatterSubType;
  selectedDataset?: string;
  dataFormat?: DataFormat;
  selectedXVariable?: string;
  selectedYVariable?: string;
  availableVariables: Variable[];
  graphConfig: Record<string, unknown>;
  
  setProject: (p?: string) => void;
  setSubType: (t?: ScatterSubType) => void;
  setDataset: (d?: string) => void;
  setDataFormat: (f?: DataFormat) => void;
  setXVariable: (x?: string) => void;
  setYVariable: (y?: string) => void;
  setAvailableVariables: (v: Variable[]) => void;
  setGraphConfig: (c: Record<string, unknown>) => void;
  reset: () => void;
}

const initial: Omit<ScatterPlotState, 'setProject' | 'setSubType' | 'setDataset' | 'setDataFormat' | 'setXVariable' | 'setYVariable' | 'setAvailableVariables' | 'setGraphConfig' | 'reset'> = {
  graphType: 'Scatter Plot',
  availableVariables: [],
  graphConfig: {},
};

export const useScatterPlotStore = create<ScatterPlotState>((set) => ({
  ...initial,
  setProject: (selectedProject) => set({ selectedProject }),
  setSubType: (subType) => {
    set({ subType });
    // Auto-set data format for Simple Scatter types
    if (subType === 'Simple Scatter' || subType === 'Simple Scatter Regression') {
      set({ dataFormat: 'XY Pair' });
    }
  },
  setDataset: (selectedDataset) => set({ selectedDataset }),
  setDataFormat: (dataFormat) => set({ dataFormat }),
  setXVariable: (selectedXVariable) => set({ selectedXVariable }),
  setYVariable: (selectedYVariable) => set({ selectedYVariable }),
  setAvailableVariables: (availableVariables) => set({ availableVariables }),
  setGraphConfig: (graphConfig) => set({ graphConfig }),
  reset: () => set({ ...initial }),
}));
