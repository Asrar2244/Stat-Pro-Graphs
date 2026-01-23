/**
 * 3D Scatter plot types and interfaces
 */

export interface ScatterPlotConfig {
    opacity: number;
    markerSize: number;
    colorScale: string;
    showGrid: boolean;
    gridOpacity: number;
}

export interface ScatterPlotState {
    scatterConfig: ScatterPlotConfig;
    setScatterConfig: (config: Partial<ScatterPlotConfig>) => void;
    resetScatterConfig: () => void;
}

export interface ScatterPlotValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface ScatterPlotData {
    x: number[];
    y: number[];
    z: number[];
    xLabel: string;
    yLabel: string;
    zLabel: string;
}

export interface ScatterPlotProps {
    data: ScatterPlotData;
    config: ScatterPlotConfig;
    onConfigChange?: (config: Partial<ScatterPlotConfig>) => void;
}

export type ScatterDataFormat = 'xyz-columns' | 'z-matrix' | 'xy-z-columns';

export interface ScatterVariableSelection {
    xVariables: string[];
    yVariables: string[];
    zVariables: string[];
    categoryVariables?: string[];
}
