/**
 * Data Format Properties section
 */

import { FC } from 'react';
import {
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Text,
} from '@fluentui/react-components';
import { MdPalette } from 'react-icons/md';
import { useGraphPropertiesClasses } from '../../../../styles/use-graph-properties-style';
import { GraphPropertiesProps } from '../../types';
import { DataFormatProperties } from '../../../../utils/dataFormatProperties';
import { DataFormatPropertiesPanel } from '../../../../components/DataFormatPropertiesPanel';

interface DataFormatPropertiesSectionProps extends GraphPropertiesProps {
  dataFormatProperties: DataFormatProperties;
  setDataFormatProperties: (properties: DataFormatProperties) => void;
  seriesLabels: string[];
}

export const DataFormatPropertiesSection: FC<DataFormatPropertiesSectionProps> = ({ 
  properties, 
  dataFormatProperties, 
  setDataFormatProperties, 
  seriesLabels 
}) => {
  const classes = useGraphPropertiesClasses();

  return (
    <AccordionItem value="dataFormatProperties">
      <AccordionHeader>
        <div className={classes.accordionHeader}>
          <MdPalette size={20} />
          <Text weight="semibold">Data Format Properties</Text>
          <Text size={200} style={{ marginLeft: 'auto', color: 'rgba(0,0,0,0.6)' }}>
            ({properties.currentDataFormat})
          </Text>
        </div>
      </AccordionHeader>
      <AccordionPanel>
        <div className={classes.propertyContent}>
          <DataFormatPropertiesPanel
            properties={dataFormatProperties}
            onPropertiesChange={setDataFormatProperties}
            dataFormat={properties.currentDataFormat || ''}
            seriesLabels={seriesLabels}
          />
        </div>
      </AccordionPanel>
    </AccordionItem>
  );
};
