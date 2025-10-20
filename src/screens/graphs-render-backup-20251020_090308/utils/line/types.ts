/**
 * Line plot specific types and interfaces
 */

export interface LineDataConfig {
  graphConfig: any;
  rows: any[];
  xNames: string[];
  yNames: string[];
}

export interface LineTraceConfig {
  xv: number[];
  yv: number[];
  label: string;
  color: string;
  symbol: string;
  subType: string;
  symbolValue?: string;
  errorCalculationUpper?: string;
  errorCalculationLower?: string;
  errorBarVariable?: string;
  errorBarData?: number[];
  errorBarVariableX?: string;
  errorBarVariableY?: string;
  errorBarDataX?: number[];
  errorBarDataY?: number[];
  errorBarColor?: string;
  rows: any[];
  lineStyle?: string;
  lineWidth?: number;
  markerSize?: number;
  showMarkers?: boolean;
}

export interface LineStyleConfig {
  lineStyle: string;
  lineWidth: number;
  markerSize: number;
  showMarkers: boolean;
}
