/**
 * Legend Properties section
 */

import { FC } from 'react';
import {
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Text,
  Card,
  CardHeader,
  Field,
  Switch,
  Slider,
  Input,
} from '@fluentui/react-components';
import { MdPalette } from 'react-icons/md';
import { useGraphPropertiesClasses } from '../../../../styles/use-graph-properties-style';
import { GraphPropertiesProps } from '../../types';

export const LegendPropertiesSection: FC<GraphPropertiesProps> = ({ properties }) => {
  const classes = useGraphPropertiesClasses();
  const globalProps = properties.graphProperties.global;

  return (
    <AccordionItem value="legends">
      <AccordionHeader>
        <div className={classes.accordionHeader}>
          <MdPalette size={20} />
          <Text weight="semibold">Legends</Text>
        </div>
      </AccordionHeader>
      <AccordionPanel>
        <div className={classes.propertyContent}>
          <Card>
            <CardHeader>
              <Text weight="semibold">Legend Settings</Text>
            </CardHeader>
            <div style={{ display: 'grid', gap: 12 }}>
              <Field label="Show Legend">
                <Switch 
                  checked={globalProps.showLegend}
                  onChange={(_, data) => properties.updateGraphProperty('showLegend', data.checked)}
                />
              </Field>
              <Field label="Legend Title">
                <Input 
                  value={globalProps.legendTitle}
                  onChange={(_, data) => properties.updateGraphProperty('legendTitle', data.value)}
                />
              </Field>
              <Field label={`Legend Columns: ${globalProps.legendColumns}`}>
                <Slider 
                  min={1} 
                  max={5} 
                  value={globalProps.legendColumns}
                  onChange={(_, data) => properties.updateGraphProperty('legendColumns', data.value)}
                />
              </Field>
              <Field label="Framed in Box">
                <Switch 
                  checked={globalProps.legendFramedInBox}
                  onChange={(_, data) => properties.updateGraphProperty('legendFramedInBox', data.checked)}
                />
              </Field>
            </div>
          </Card>
        </div>
      </AccordionPanel>
    </AccordionItem>
  );
};
