import { FC, lazy, useEffect } from 'react';
import { SuspenseLoad } from '@libs';
import { useGraphsRender } from './styles-hook/use-graphs-render-style';
import { useActiveNode } from '@hooks';
import { useFetchGraphs } from './hooks/use-fetch-graphs';
import { friendlyTitleForGraph } from './utils/title';
import { useStartProStore } from '@store/main-store';

const GraphSelection = lazy(() =>
  import('./graph-selection').then((modules) => ({ default: modules.GraphSelection })),
);
const RunHistory = lazy(() =>
  import('./run-history/run-history').then((modules) => ({ default: modules.RunHistory })),
);
const ToolBar = lazy(() => import('./tool-bar').then((modules) => ({ default: modules.ToolBar })));

import { useTools } from './hooks/use-tools';

export const GraphsRender: FC = () => {
  const classes = useGraphsRender();
  const tools = useTools();
  const { config } = useActiveNode([]);
  const { data } = useFetchGraphs(config.tabName);
  const { setRenderLatestRun, renderLatestRun, selectedGraphRun, setSelectedGraphRun } = useStartProStore();
  
  // Auto-select latest run when renderLatestRun flag is set
  useEffect(() => {
    console.log('🔍 Auto-selection check:', { 
      dataLength: data?.length, 
      renderLatestRun, 
      selectedRunId: selectedGraphRun.id 
    });
    
    if (Array.isArray(data) && data.length > 0 && renderLatestRun) {
      const nice = friendlyTitleForGraph(data[0]?.graphType, data[0]?.config?.graphConfig?.subType);
      setSelectedGraphRun(data[0]?.id, nice);
      setRenderLatestRun(false);
      console.log('🎯 Auto-selected latest graph:', data[0]?.id, nice);
    }
  }, [data, renderLatestRun, selectedGraphRun.id, setSelectedGraphRun, setRenderLatestRun]);
  
  return (
    <SuspenseLoad>
      <div className={classes.graphsLayout} data-graphs-root="true">
        <ToolBar tools={tools} title={selectedGraphRun.title} subTitle={selectedGraphRun.subTitle} />
        <div className={classes['graphs-area']}>
          <GraphSelection
            id={selectedGraphRun.id}
            fontBold={tools.fontBold}
            fontItalic={tools.fontItalic}
            fontSize={tools.fontSize}
            fontColor={tools.fontColor}
            showHistory={tools.showRunHistory}
          />
          <RunHistory
            selectedID={selectedGraphRun.id}
            history={{
              showHistory: tools.showRunHistory,
              toggleShowHistory: tools.toggleShowHistory,
              setTotalRuns: tools.setTotalRuns,
              selectedRun: setSelectedGraphRun,
            }}
          />
        </div>
      </div>
    </SuspenseLoad>
  );
};
