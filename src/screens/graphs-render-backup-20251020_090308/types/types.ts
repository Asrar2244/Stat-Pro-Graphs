/**
 * Types and interfaces for graph properties
 */

import { GraphProperties as GraphPropertiesType, GlobalGraphProperties, PlotSpecificProperties } from '../hooks/use-tools';
import { DataFormatProperties } from '../utils/dataFormatProperties';

export interface IGraphProperties {
  showGraphProperties: boolean;
  toggleGraphProperties: () => void;
  graphProperties: GraphPropertiesType;
  resetAllProperties: () => void;
  updateGraphProperty: <K extends keyof GlobalGraphProperties>(key: K, value: GlobalGraphProperties[K]) => void;
  updatePlotSpecificProperty: <T extends keyof PlotSpecificProperties>(plotType: T, key: keyof NonNullable<PlotSpecificProperties[T]>, value: any) => void;
  updateLegendTextEntry: (originalLabel: string, newText: string) => void;
  updateLegendSeriesColor: (label: string, color: string) => void;
  getCurrentPlotType: (subType?: string) => keyof PlotSpecificProperties | null;
  getDetectedPlotFeatures: (subType?: string) => {
    hasScatter: boolean;
    hasRegression: boolean;
    hasErrorBars: boolean;
    hasPointPlot: boolean;
    hasDotPlot: boolean;
  };
  currentSubType?: string;
  currentLegendLabels?: string[];
  currentDataFormat?: string;
  currentVariables?: { xNames: string[]; yNames: string[]; categoryNames: string[] };
}

export interface GraphPropertiesProps {
  properties: IGraphProperties;
}
