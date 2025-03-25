import { Field, Input, Button } from '@fluentui/react-components';
import { VscAdd } from 'react-icons/vsc';
import { useGraphPropertyLayout } from '../../styles-hook/use-graph-property';
export const GraphAddTraces = () => {
  const classes = useGraphPropertyLayout();
  return (
    <div className={classes.addTraces}>
      <Field label="Trace Name">
        <div className={classes.addTraceField}>
          <Input placeholder="Trace Name" />
          <Button icon={<VscAdd />} shape="square" appearance="primary" />
        </div>
      </Field>
    </div>
  );
};
