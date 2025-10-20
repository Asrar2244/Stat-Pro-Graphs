/**
 * 3D Mesh specific types and interfaces
 */

export interface MeshConfig {
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

export interface MeshDataConfig {
  graphConfig: any;
  rows: any[];
  xNames: string[];
  yNames: string[];
  zNames: string[];
}

export interface MeshInterpolationConfig {
  xv: number[];
  yv: number[];
  zv: number[];
  targetX: number;
  targetY: number;
}

export interface MeshGridConfig {
  xv: number[];
  yv: number[];
  gridSize: number;
  preserveDefaultScales?: boolean;
}
