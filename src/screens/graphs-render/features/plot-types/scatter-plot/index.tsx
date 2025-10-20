import React, { FC, useContext, useRef, useState, useEffect } from 'react';
import { GraphsRenderContext } from '../../../context';
import { GraphCanvas, GraphCanvasRef } from '../../../plotly-canvas';
import { Card, CardFooter, CardPreview } from '@fluentui/react-components';
import { GraphTools } from '@libs/graphs/tools';
import { useFullScreenHandle } from 'react-full-screen';
import { useGraphStyles } from '@libs/graphs/styles-hook/use-graph-style';
import { useStartProStore } from '@store/main-store';

export const ScatterPlotGraph: FC = () => {
  const { selectedRun, graphProperties } = useContext(GraphsRenderContext);
  const handle = useFullScreenHandle();
  const plotlyRef = useRef<GraphCanvasRef>(null);
  const [isPlotlyReady, setIsPlotlyReady] = useState(false);
  const classes = useGraphStyles();
  const { projects } = useStartProStore();
  
  if (!selectedRun?.config?.graphConfig) {
    return <div>No graph configuration found</div>;
  }

  const { graphConfig, workspacePath } = selectedRun.config;
  
  console.log('🎨 ScatterPlotGraph - Props Debug:', {
    graphProperties,
    canvasMode: graphProperties?.global?.canvasMode,
    plotSpecific: graphProperties?.plotSpecific,
    hasGraphProperties: !!graphProperties,
    selectedRunId: selectedRun.id
  });
  
  // Track graphProperties changes
  useEffect(() => {
    console.log('🔄 ScatterPlotGraph - graphProperties changed:', {
      timestamp: new Date().toISOString(),
      graphProperties,
      plotSpecific: graphProperties?.plotSpecific,
      global: graphProperties?.global
    });
  }, [graphProperties]);
  // Fallback: if workspacePath missing (older runs), resolve from projects by selectedProject/tabName
  const resolvedWorkspacePath =
    workspacePath ||
    projects?.[graphConfig?.selectedProject || '']?.workspacePath ||
    projects?.[selectedRun?.tabName || '']?.workspacePath ||
    '';
  

  // Monitor when plotly ref becomes available
  useEffect(() => {
    const checkPlotlyReady = () => {
      if (plotlyRef.current?.current && plotlyRef.current?.plotly) {
        setIsPlotlyReady(true);
      }
    };

    // Check immediately
    checkPlotlyReady();

    // Set up interval to check periodically
    const interval = setInterval(checkPlotlyReady, 100);

    return () => clearInterval(interval);
  }, [selectedRun?.id]);

  // Create a proper graph object for the tools
  const graphObject = {
    name: graphConfig?.subType || 'Scatter Plot',
    traces: {} as { [key: string]: any }, // Will be populated by the actual plot
    download: [
      { format: 'png', description: 'pngFormat' },
      { format: 'svg', description: 'svgFormat' },
      { format: 'jpeg', description: 'jpegFormat' }
    ]
  };

  return (
    <div className={classes.graph}>
      <Card>
        <CardPreview>
          <div style={{ width: '100%', height: 'calc(100vh - 300px)', minHeight: '400px' }}>
            <GraphCanvas 
              ref={plotlyRef}
              key={`graph-${selectedRun?.id || 'new'}`}
              graphConfig={graphConfig} 
              workspacePath={resolvedWorkspacePath}
              liveProps={graphProperties}
            />
          </div>
        </CardPreview>
        <CardFooter>
          <div className={classes.toolsWrapper}>
            {isPlotlyReady && plotlyRef.current && (
              <GraphTools
                handle={handle}
                plotly={plotlyRef.current}
                graph={graphObject}
                dbFileName={workspacePath || ''}
                dbTableName="EXCEL"
              />
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ScatterPlotGraph;