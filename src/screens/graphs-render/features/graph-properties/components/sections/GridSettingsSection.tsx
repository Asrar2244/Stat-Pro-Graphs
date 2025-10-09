/**
 * Grid Settings section
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
import { MdTune } from 'react-icons/md';
import { useGraphPropertiesClasses } from '../../../styles/use-graph-properties-style';
import { GraphPropertiesProps } from '../../types';

export const GridSettingsSection: FC<GraphPropertiesProps> = ({ properties }) => {
  const classes = useGraphPropertiesClasses();
  const globalProps = properties.graphProperties.global;
  const gridDisabled = !globalProps.showGridLines;

  return (
    <AccordionItem value="gridSettings">
      <AccordionHeader>
        <div className={classes.accordionHeader}>
          <MdTune size={20} />
          <Text weight="semibold">Grid Settings</Text>
        </div>
      </AccordionHeader>
      <AccordionPanel>
        <div className={classes.propertyContent}>
          <Card>
            <CardHeader>
              <Text weight="semibold">Grid Configuration</Text>
            </CardHeader>
            <div style={{ display: 'grid', gap: 12 }}>
              <Field label="Show Grid Lines">
                <Switch 
                  checked={globalProps.showGridLines}
                  onChange={(_, data) => properties.updateGraphProperty('showGridLines', data.checked)}
                />
              </Field>
              <Field label="X Major Grid" disabled={gridDisabled}>
                <Switch 
                  checked={globalProps.gridXMajor}
                  onChange={(_, data) => properties.updateGraphProperty('gridXMajor', data.checked)}
                  disabled={gridDisabled}
                />
              </Field>
              <Field label="Y Major Grid" disabled={gridDisabled}>
                <Switch 
                  checked={globalProps.gridYMajor}
                  onChange={(_, data) => properties.updateGraphProperty('gridYMajor', data.checked)}
                  disabled={gridDisabled}
                />
              </Field>
              <Field label="Grid Color" disabled={gridDisabled}>
                <Input
                  type="color"
                  value={globalProps.gridColor}
                  onChange={(_, data) => properties.updateGraphProperty('gridColor', data.value)}
                  disabled={gridDisabled}
                />
              </Field>
              <Field label={`Grid Thickness: ${globalProps.gridThicknessInch}"`} disabled={gridDisabled}>
                <Slider 
                  min={0.001} 
                  max={0.1} 
                  step={0.001}
                  value={globalProps.gridThicknessInch}
                  onChange={(_, data) => properties.updateGraphProperty('gridThicknessInch', data.value)}
                  disabled={gridDisabled}
                />
              </Field>
            </div>
          </Card>
        </div>
      </AccordionPanel>
    </AccordionItem>
  );
};
