import { Card, CardFooter, CardPreview } from '@fluentui/react-components';
import { FC, useRef, lazy, useEffect } from 'react';
import { useGraphStyles } from './styles-hook/use-graph-style';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { IGraph } from '@utils';

const GraphTools = lazy(() =>
  import('./tools').then((modules) => ({ default: modules.GraphTools })),
);

interface IGraphProps {
  graph: IGraph;
  dbFileName: string;
  dbTableName: string;
}
export const GraphPlot: FC<IGraphProps> = ({ graph, dbFileName, dbTableName }) => {
  const plotly = useRef<HTMLDivElement | null>(null);
  const graphContainerRef = useRef<HTMLDivElement | null>(null);
  const classes = useGraphStyles();
  const handle = useFullScreenHandle();

  // Set initial height for plotly container to prevent it from appearing full screen
  // This ensures the graph doesn't appear in full screen mode when first opened
  useEffect(() => {
    if (plotly.current) {
      const element = plotly.current as unknown as HTMLElement;
      if (!handle.active) {
        element.style.width = '100%';
        element.style.height = '400px';
      } else {
        element.style.width = '100%';
        element.style.height = '96vh';
      }
    }
  }, [handle.active]);

  // Ensure graph container doesn't go fullscreen when not active
  useEffect(() => {
    if (graphContainerRef.current && !handle.active) {
      const container = graphContainerRef.current;
      // Force constraints to prevent fullscreen
      container.style.position = 'relative';
      container.style.height = 'auto';
      container.style.maxHeight = '550px';
      container.style.top = 'auto';
      container.style.left = 'auto';
      container.style.right = 'auto';
      container.style.bottom = 'auto';
      container.style.zIndex = 'auto';
    }
  }, [handle.active]);

  // Ensure initial height is set on mount and when plotly ref becomes available
  useEffect(() => {
    const setInitialHeight = () => {
      if (plotly.current && !handle.active) {
        plotly.current.style.width = '100%';
        plotly.current.style.height = '400px';
      }
    };
    
    // Try immediately
    setInitialHeight();
    
    // Also try after a short delay in case the ref isn't ready yet
    const timeout = setTimeout(setInitialHeight, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  // Ensure graph container is constrained on mount
  useEffect(() => {
    if (graphContainerRef.current && !handle.active) {
      const container = graphContainerRef.current;
      container.style.position = 'relative';
      container.style.height = 'auto';
      container.style.maxHeight = '550px';
    }
  }, []);

  return (
    <div 
      className="graph-wrapper"
      style={{ 
        width: '100%', 
        maxHeight: '550px', 
        height: 'auto', 
        overflow: 'visible',
        position: 'relative',
        marginTop: '16px'
      }}
    >
      <FullScreen handle={handle}>
        <div 
          ref={graphContainerRef}
          className={`${classes.graph} ${handle.active ? 'graph-fullscreen-active' : 'graph-normal'}`}
          style={{ 
            maxHeight: handle.active ? '100vh' : '550px', 
            height: handle.active ? '100vh' : 'auto',
            width: '100%',
            position: handle.active ? 'fixed' : 'relative',
            top: handle.active ? 0 : 'auto',
            left: handle.active ? 0 : 'auto',
            right: handle.active ? 0 : 'auto',
            bottom: handle.active ? 0 : 'auto',
            zIndex: handle.active ? 9999 : 'auto',
            backgroundColor: handle.active ? '#fff' : 'transparent'
          }}
        >
          <Card style={{ 
            height: handle.active ? '100%' : 'auto', 
            maxHeight: handle.active ? '100%' : '550px',
            width: '100%',
            display: 'block'
          }}>
            <CardPreview>
              <div 
                ref={plotly}
                style={{ 
                  width: '100%', 
                  height: handle.active ? '96vh' : '400px',
                  minHeight: handle.active ? '96vh' : '400px',
                  display: 'block'
                }} 
              />
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
    </div>
  );
};
