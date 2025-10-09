/**
 * Axis Properties section
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
  Dropdown,
  Option,
} from '@fluentui/react-components';
import { MdTune } from 'react-icons/md';
import { useGraphPropertiesClasses } from '../../../styles/use-graph-properties-style';
import { GraphPropertiesProps } from '../../types';

export const AxisPropertiesSection: FC<GraphPropertiesProps> = ({ properties }) => {
  const classes = useGraphPropertiesClasses();
  const globalProps = properties.graphProperties.global;

  return (
    <AccordionItem value="axisLines">
      <AccordionHeader>
        <div className={classes.accordionHeader}>
          <MdTune size={20} />
          <Text weight="semibold">Axis Lines</Text>
        </div>
      </AccordionHeader>
      <AccordionPanel>
        <div className={classes.propertyContent}>
          <Card>
            <CardHeader>
              <Text weight="semibold">Axis Configuration</Text>
            </CardHeader>
            <div style={{ display: 'grid', gap: 12 }}>
              <Field label="Show Axis Labels">
                <Switch 
                  checked={globalProps.showAxisLabels}
                  onChange={(_, data) => properties.updateGraphProperty('showAxisLabels', data.checked)}
                />
              </Field>
              <Field label="Y Axis Side">
                <Dropdown
                  value={globalProps.yAxisSide}
                  onOptionSelect={(_, data) => properties.updateGraphProperty('yAxisSide', data.optionValue)}
                >
                  <Option value="left">Left</Option>
                  <Option value="right">Right</Option>
                </Dropdown>
              </Field>
              <Field label="Axis Line Color">
                <Input
                  type="color"
                  value={globalProps.axisLineColor}
                  onChange={(_, data) => properties.updateGraphProperty('axisLineColor', data.value)}
                />
              </Field>
              <Field label={`Axis Line Thickness: ${globalProps.axisLineThicknessInch}"`}>
                <Slider 
                  min={0.001} 
                  max={0.1} 
                  step={0.001}
                  value={globalProps.axisLineThicknessInch}
                  onChange={(_, data) => properties.updateGraphProperty('axisLineThicknessInch', data.value)}
                />
              </Field>
            </div>
          </Card>
        </div>
      </AccordionPanel>
    </AccordionItem>
  );
};
