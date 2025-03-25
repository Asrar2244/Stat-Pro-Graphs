import { useGraphBodyLayout } from '../styles-hook/use-graph-body-render';
import { GraphProperty } from './graph-property';
import { GraphTabs } from './graph-tabs';
export const GraphBodyRender = () => {
  const classes = useGraphBodyLayout();
  return (
    <div className={classes.graphBodyLayout}>
      <GraphTabs />
      <GraphProperty />
    </div>
  );
};
