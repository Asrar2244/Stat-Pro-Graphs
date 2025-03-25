import { Field, Combobox, Option } from '@fluentui/react-components';
import { useGraphPropertyLayout } from '../../styles-hook/use-graph-property';
import { GraphProperties } from './graph-properties';
export const GraphProperty = () => {
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
        <GraphProperties />
      </div>
    </div>
  );
};
