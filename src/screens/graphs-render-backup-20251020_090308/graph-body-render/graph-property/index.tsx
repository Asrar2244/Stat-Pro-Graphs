import { Field, Combobox, Option } from '@fluentui/react-components';
import { useGraphPropertyLayout } from '../../styles/use-graph-property';
import { GraphProperties } from './graph-properties';
import { PlotSpecificProperties } from '../../../graphs-render/utils/plotProperties';

interface GraphPropertyProps {
  graphConfig?: any;
  plotProperties?: PlotSpecificProperties;
  onPlotPropertiesChange?: (properties: PlotSpecificProperties) => void;
}

export const GraphProperty = ({ graphConfig, plotProperties, onPlotPropertiesChange }: GraphPropertyProps) => {
  const classes = useGraphPropertyLayout();
  return (
    <div className={classes.propsLayout}>
      <div className={classes.projectSelector}>
        <div>
          <Field label="Select Project">
            <Combobox appearance="filled-lighter">
              <Option>Cat</Option>
              <Option>Dog</Option>
              <Option>Fish</Option>
              <Option>Bird</Option>
            </Combobox>
          </Field>
        </div>
      </div>
      <div className={classes.propertySelector}>
        <GraphProperties 
          graphConfig={graphConfig} 
          plotProperties={plotProperties}
          onPlotPropertiesChange={onPlotPropertiesChange}
        />
      </div>
    </div>
  );
};
