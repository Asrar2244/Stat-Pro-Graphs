import { FC, useContext, useRef } from 'react';
import { GraphsRenderContext } from '../../context';
import { GraphCanvas } from '../../../graph-view-render/graph-body-render/plotly-canvas';
import { Card, CardFooter, CardPreview } from '@fluentui/react-components';
import { GraphTools } from '@libs/graphs/tools';
import { useFullScreenHandle } from 'react-full-screen';
import { useGraphStyles } from '@libs/graphs/styles-hook/use-graph-style';
import { useStartProStore } from '@store/main-store';

export const ScatterPlotGraph: FC = () => {
  const { selectedRun, graphProperties } = useContext(GraphsRenderContext);
  const handle = useFullScreenHandle();
  const plotlyRef = useRef<any>(null);
  const classes = useGraphStyles();
  const { projects } = useStartProStore();
  
  // Debug logging
  console.log('🔍 ScatterPlotGraph Debug:');
  console.log('selectedRun:', selectedRun);
  console.log('selectedRun?.config:', selectedRun?.config);
  console.log('selectedRun?.config?.graphConfig:', selectedRun?.config?.graphConfig);
  
  if (!selectedRun?.config?.graphConfig) {
    console.log('❌ No graph configuration found');
    return <div>No graph configuration found</div>;
  }

  const { graphConfig, workspacePath } = selectedRun.config;
  // Fallback: if workspacePath missing (older runs), resolve from projects by selectedProject/tabName
  const resolvedWorkspacePath =
    workspacePath ||
    projects?.[graphConfig?.selectedProject || '']?.workspacePath ||
    projects?.[selectedRun?.tabName || '']?.workspacePath ||
    '';
  
  console.log('✅ Graph config found:', graphConfig);
  console.log('✅ Workspace path:', workspacePath);

  // Create a mock graph object for the tools
  const mockGraph = {
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
          <div ref={plotlyRef} style={{ width: '100%', height: 'calc(100vh - 300px)', minHeight: '400px' }}>
            <GraphCanvas 
              key={`graph-${selectedRun?.id || 'new'}`}
              graphConfig={graphConfig} 
              workspacePath={resolvedWorkspacePath}
              liveProps={graphProperties}
            />
          </div>
        </CardPreview>
        <CardFooter>
          <div className={classes.toolsWrapper}>
            <GraphTools
              handle={handle}
              plotly={plotlyRef}
              graph={mockGraph}
              dbFileName={workspacePath || ''}
              dbTableName="EXCEL"
            />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ScatterPlotGraph;