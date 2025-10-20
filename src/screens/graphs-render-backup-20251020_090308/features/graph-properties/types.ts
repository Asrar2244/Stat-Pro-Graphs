/**
 * Types for graph properties components
 */

import { IGraphProperties } from '../../types/types';

export interface GraphPropertiesProps {
  properties: IGraphProperties;
}

export interface DataFormatPropertiesSectionProps {
  dataFormatProperties: any;
  setDataFormatProperties: (properties: any) => void;
  seriesLabels: string[];
}
