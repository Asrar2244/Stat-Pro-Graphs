/**
 * Export Properties section
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
  Input,
  Dropdown,
  Option,
} from '@fluentui/react-components';
import { MdTune } from 'react-icons/md';
import { useGraphPropertiesClasses } from '../../../../styles/use-graph-properties-style';
import { GraphPropertiesProps } from '../../types';

export const ExportPropertiesSection: FC<GraphPropertiesProps> = ({ properties }) => {
  const classes = useGraphPropertiesClasses();
  const globalProps = properties.graphProperties.global;

  return (
    <AccordionItem value="export">
      <AccordionHeader>
        <div className={classes.accordionHeader}>
          <MdTune size={20} />
          <Text weight="semibold">Export Properties</Text>
        </div>
      </AccordionHeader>
      <AccordionPanel>
        <div className={classes.propertyContent}>
          <Card>
            <CardHeader>
              <Text weight="semibold">Export Configuration</Text>
            </CardHeader>
            <div style={{ display: 'grid', gap: 12 }}>
              <Field label="Graph Width (inches)">
                <Input 
                  type="number"
                  value={globalProps.graphWidthInch.toString()}
                  onChange={(_, data) => properties.updateGraphProperty('graphWidthInch', parseFloat(data.value) || 0)}
                />
              </Field>
              <Field label="Graph Height (inches)">
                <Input 
                  type="number"
                  value={globalProps.graphHeightInch.toString()}
                  onChange={(_, data) => properties.updateGraphProperty('graphHeightInch', parseFloat(data.value) || 0)}
                />
              </Field>
              <Field label="DPI">
                <Input 
                  type="number"
                  value={globalProps.dpi.toString()}
                  onChange={(_, data) => properties.updateGraphProperty('dpi', parseInt(data.value) || 0)}
                />
              </Field>
              <Field label="Export Format">
                <Dropdown
                  value={globalProps.exportFormat}
                  onOptionSelect={(_, data) => properties.updateGraphProperty('exportFormat', data.optionValue)}
                >
                  <Option value="png">PNG</Option>
                  <Option value="jpg">JPG</Option>
                  <Option value="svg">SVG</Option>
                  <Option value="pdf">PDF</Option>
                </Dropdown>
              </Field>
            </div>
          </Card>
        </div>
      </AccordionPanel>
    </AccordionItem>
  );
};
