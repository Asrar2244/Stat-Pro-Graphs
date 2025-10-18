/**
 * Scatter plot specific types and interfaces
 */

export interface ScatterDataConfig {
  graphConfig: any;
  rows: any[];
  xNames: string[];
  yNames: string[];
  categoryNames?: string[];
}

export interface ScatterTraceConfig {
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
}

export interface ScatterErrorBarConfig {
  isVerticalErrorBar: boolean;
  isHorizontalErrorBar: boolean;
  isAsymmetricErrorBar: boolean;
  isBidirectionalErrorBar: boolean;
  isPointPlot: boolean;
  isDotPlot: boolean;
}
