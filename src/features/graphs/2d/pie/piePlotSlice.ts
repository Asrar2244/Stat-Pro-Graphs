import { create } from 'zustand';
import { GraphConfig } from '../../../shared/types';

interface PiePlotState {
    graphConfig: GraphConfig;
    selectedVariable: string | null;
    selectedLabelVariable: string | null;
    setConfig: (config: Partial<GraphConfig>) => void;
    setSelectedVariable: (variable: string | null) => void;
    setSelectedLabelVariable: (variable: string | null) => void;
    reset: () => void;
}

const initialState = {
    graphConfig: {
        graphType: 'Pie Chart',
        subType: 'Pie Chart',
        selectedProject: '',
        selectedDataset: '',
        dataFormat: 'Standard',
        variables: {
            values: [],
            labels: []
        },
        orientation: 'vertical',
        showLegend: true,
        title: 'Pie Chart',
    },
    selectedVariable: null,
    selectedLabelVariable: null,
};

export const usePiePlotStore = create<PiePlotState>((set) => ({
    ...initialState,

    setConfig: (config) =>
        set((state) => ({
            graphConfig: { ...state.graphConfig, ...config },
        })),

    setSelectedVariable: (variable) =>
        set((state) => ({
            selectedVariable: variable,
            graphConfig: {
                ...state.graphConfig,
                variables: {
                    ...state.graphConfig.variables,
                    values: variable ? [variable] : [],
                },
            },
        })),

    setSelectedLabelVariable: (variable) =>
        set((state) => ({
            selectedLabelVariable: variable,
            graphConfig: {
                ...state.graphConfig,
                variables: {
                    ...state.graphConfig.variables,
                    labels: variable ? [variable] : [],
                },
            },
        })),

    reset: () => set(initialState),
}));
