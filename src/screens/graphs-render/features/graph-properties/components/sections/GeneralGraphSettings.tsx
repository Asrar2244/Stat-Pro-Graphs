/**
 * General Graph Settings section
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
  Switch,
} from '@fluentui/react-components';
import { MdSettings } from 'react-icons/md';
import { useGraphPropertiesClasses } from '../../../styles/use-graph-properties-style';
import { GraphPropertiesProps } from '../../types';

export const GeneralGraphSettings: FC<GraphPropertiesProps> = ({ properties }) => {
  const classes = useGraphPropertiesClasses();
  const globalProps = properties.graphProperties.global;

  return (
    <AccordionItem value="global">
      <AccordionHeader>
        <div className={classes.accordionHeader}>
          <MdSettings size={20} />
          <Text weight="semibold">General Graph Settings</Text>
          <Text size={200} style={{ marginLeft: 'auto', color: 'rgba(0,0,0,0.6)' }}>
            (Used for all graphs)
          </Text>
        </div>
      </AccordionHeader>
      <AccordionPanel>
        <div className={classes.propertyContent}>
          <Card>
            <CardHeader>
              <Text weight="semibold">General Graph Settings</Text>
            </CardHeader>
            <div style={{ display: 'grid', gap: 12 }}>
              <Field label="Graph Name">
                <Input 
                  value={globalProps.graphName}
                  onChange={(_, data) => properties.updateGraphProperty('graphName', data.value)}
                />
              </Field>
              <Field label="Axis (X data)">
                <Input 
                  value={globalProps.axisXData || ''}
                  onChange={(_, data) => properties.updateGraphProperty('axisXData', data.value)}
                />
              </Field>
              <Field label="Axis (Y data)">
                <Input 
                  value={globalProps.axisYData || ''}
                  onChange={(_, data) => properties.updateGraphProperty('axisYData', data.value)}
                />
              </Field>
              <Field label="Title Visibility">
                <Switch 
                  checked={globalProps.showTitle}
                  onChange={(_, data) => properties.updateGraphProperty('showTitle', data.checked)}
                />
              </Field>
            </div>
          </Card>
        </div>
      </AccordionPanel>
    </AccordionItem>
  );
};
