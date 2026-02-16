/**
 * Contour plot types and interfaces
 */

export interface ContourPlotConfig {
    contourType: 'contour' | 'filled';
    colorScale: string;
    opacity: number;
    showGrid: boolean;
    gridOpacity: number;
    zInterval?: number;
    showLabels: boolean;
}

export interface ContourPlotState {
    contourConfig: ContourPlotConfig;
    setContourConfig: (config: Partial<ContourPlotConfig>) => void;
    resetContourConfig: () => void;
}

export interface ContourPlotValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface ContourPlotData {
    x: number[];
    y: number[];
    z: number[];
    xLabel: string;
    yLabel: string;
    zLabel: string;
}

export interface ContourPlotProps {
    data: ContourPlotData;
    config: ContourPlotConfig;
    onConfigChange?: (config: Partial<ContourPlotConfig>) => void;
}

export type ContourDataFormat = 'xyz-columns' | 'z-matrix' | 'xy-z-columns';

export interface ContourVariableSelection {
    xVariables: string[];
    yVariables: string[];
    zVariables: string[];
    categoryVariables?: string[];
}

export interface ContourPlotCreationConfig {
    dataFormat: ContourDataFormat;
    variables: ContourVariableSelection;
    contourConfig: ContourPlotConfig;
    workspacePath: string;
    projectName: string;
    // Additional fields expected by the executer
    selectedProject?: string;
    graphType?: string;
    subType?: string;
}
