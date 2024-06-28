// global: Plotly
import { forwardRef } from 'react';
import { useGraphStyles } from './styles-hook/use-graph-style';
interface IScreenFix {
  width?: string;
  height?: string;
}
interface IGraph {
  isFullScreen?: boolean | IScreenFix;
}
export const GraphPlot = forwardRef<any, IGraph>((graphProps, ref) => {
  const { isFullScreen } = graphProps;
  const classes = useGraphStyles();
  const screen =
    isFullScreen === true
      ? {
          width: '100%',
          height: '100%',
        }
      : isFullScreen;
  return (
    <div className={classes.graph}>
      <div ref={ref} style={screen as object} />
    </div>
  );
});
