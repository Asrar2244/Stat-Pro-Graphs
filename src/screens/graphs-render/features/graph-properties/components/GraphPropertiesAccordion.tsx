/**
 * Accordion container for all graph property sections
 */

import { FC, useEffect, useState } from 'react';
import {
  Accordion,
} from '@fluentui/react-components';
import { useGraphPropertiesClasses } from '../../../styles/use-graph-properties-style';
import { GraphPropertiesProps } from '../types';
import { DataFormatProperties, createDataFormatProperties, getSeriesLabels } from '../../../utils/dataFormatProperties';
import { GeneralGraphSettings } from './sections/GeneralGraphSettings';
import { DataFormatPropertiesSection } from './sections/DataFormatPropertiesSection';
import { PlotSpecificPropertiesSection } from './sections/PlotSpecificPropertiesSection';
import { LegendPropertiesSection } from './sections/LegendPropertiesSection';
import { GridSettingsSection } from './sections/GridSettingsSection';
import { AxisPropertiesSection } from './sections/AxisPropertiesSection';
import { ExportPropertiesSection } from './sections/ExportPropertiesSection';

export const GraphPropertiesAccordion: FC<GraphPropertiesProps> = ({ properties }) => {
  
  // Data format properties state
  const [dataFormatProperties, setDataFormatProperties] = useState<DataFormatProperties | null>(null);
  
  // Create series labels based on current data format and variables
  const seriesLabels = properties.currentDataFormat && properties.currentVariables ? 
    getSeriesLabels(
      properties.currentDataFormat, 
      properties.currentVariables.xNames, 
      properties.currentVariables.yNames, 
      properties.currentVariables.categoryNames
    ) : [];
  
  // Initialize data format properties when data format or variables change
  useEffect(() => {
    if (properties.currentDataFormat && properties.currentVariables && seriesLabels.length > 0) {
      const newProperties = createDataFormatProperties(properties.currentDataFormat, seriesLabels);
      setDataFormatProperties(newProperties);
    }
  }, [properties.currentDataFormat, properties.currentVariables, seriesLabels.join(',')]);

  return (
    <Accordion collapsible defaultOpenItems={["global"]}>
      {/* General Graph Settings */}
      <GeneralGraphSettings properties={properties} />
      
      {/* Data Format Properties */}
      {dataFormatProperties && (
        <DataFormatPropertiesSection 
          properties={properties}
          dataFormatProperties={dataFormatProperties}
          setDataFormatProperties={setDataFormatProperties}
          seriesLabels={seriesLabels}
        />
      )}
      
      {/* Plot-Specific Properties */}
      <PlotSpecificPropertiesSection properties={properties} />
      
      {/* Legend Properties */}
      <LegendPropertiesSection properties={properties} />
      
      {/* Grid Settings */}
      <GridSettingsSection properties={properties} />
      
      {/* Axis Properties */}
      <AxisPropertiesSection properties={properties} />
      
      {/* Export Properties */}
      <ExportPropertiesSection properties={properties} />
    </Accordion>
  );
};
