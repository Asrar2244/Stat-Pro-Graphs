import { TopStripe } from './top-stripe';
import { useGraphViewLayout } from './styles-hook/use-graph-view';
import { GraphBodyRender } from './graph-body-render';
export const GraphViewRender = (props: any) => {
  const classes = useGraphViewLayout();
  return (
    <div className={classes.toolStrip}>
      <TopStripe />
      <GraphBodyRender {...props} />
    </div>
  );
};
