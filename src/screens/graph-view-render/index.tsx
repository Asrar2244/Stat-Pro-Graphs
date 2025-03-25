import { TopStripe } from './top-stripe';
import { useGraphViewLayout } from './styles-hook/use-graph-view';
import { GraphBodyRender } from './graph-body-render';
export const GraphViewRender = () => {
  const classes = useGraphViewLayout();
  return (
    <div className={classes.toolStrip}>
      <TopStripe />
      <GraphBodyRender />
    </div>
  );
};
