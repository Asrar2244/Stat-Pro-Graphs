import { Card, CardFooter, CardPreview } from '@fluentui/react-components';
import { FC, useRef, lazy } from 'react';
import { useGraphStyles } from './styles-hook/use-graph-style';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { IGraph, IGraphRef } from '@utils';

const GraphTools = lazy(() =>
  import('./tools').then((modules) => ({ default: modules.GraphTools })),
);

interface IGraphProps {
  graph: IGraph;
  dbFileName: string;
  dbTableName: string;
}
export const GraphPlot: FC<IGraphProps> = ({ graph, dbFileName, dbTableName }) => {
  const plotly = useRef<IGraphRef | undefined>(undefined);
  const classes = useGraphStyles();
  const handle = useFullScreenHandle();

  return (
    <FullScreen handle={handle}>
      <div className={classes.graph}>
        <Card>
          <CardPreview>
            <div ref={plotly as any} />
          </CardPreview>
          <CardFooter>
            <div className={classes.toolsWrapper}>
              <GraphTools
                handle={handle}
                // zoomed={zoomed}
                plotly={plotly as any}
                graph={graph}
                dbFileName={dbFileName}
                dbTableName={dbTableName}
              />
            </div>
          </CardFooter>
        </Card>
      </div>
    </FullScreen>
  );
};
