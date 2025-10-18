/**
 * 3D Mesh plot types and interfaces
 */

export interface MeshPlotConfig {
  opacity: number;
  surfaceType: 'surface' | 'mesh';
  colorScale: string;
  showContours: boolean;
  contourOpacity: number;
  lighting: boolean;
  smoothShading: boolean;
  showGrid: boolean;
  gridOpacity: number;
}

export interface MeshPlotState {
  meshConfig: MeshPlotConfig;
  setMeshConfig: (config: Partial<MeshPlotConfig>) => void;
  resetMeshConfig: () => void;
}

export interface MeshPlotValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MeshPlotData {
  x: number[];
  y: number[];
  z: number[];
  xLabel: string;
  yLabel: string;
  zLabel: string;
}

export interface MeshPlotProps {
  data: MeshPlotData;
  config: MeshPlotConfig;
  onConfigChange?: (config: Partial<MeshPlotConfig>) => void;
}

export type MeshDataFormat = 'xyz-columns' | 'z-matrix' | 'xy-z-columns';

export interface MeshVariableSelection {
  xVariables: string[];
  yVariables: string[];
  zVariables: string[];
  categoryVariables?: string[];
}

export interface MeshPlotCreationConfig {
  dataFormat: MeshDataFormat;
  variables: MeshVariableSelection;
  meshConfig: MeshPlotConfig;
  workspacePath: string;
  projectName: string;
  // Additional fields expected by the executer
  selectedProject?: string;
  graphType?: string;
  subType?: string;
}
