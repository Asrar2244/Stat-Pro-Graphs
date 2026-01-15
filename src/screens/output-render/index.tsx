import { FC, lazy } from 'react';
import { SuspenseLoad } from '@libs';
import { useOutputRender } from './styles-hook/use-output-render-style';
const OutputSelection = lazy(() =>
  import('./output-selection').then((modules) => ({ default: modules.OutputSelection })),
);
const RunHistory = lazy(() =>
  import('./run-history/run-history').then((modules) => ({ default: modules.RunHistory })),
);
const ToolBar = lazy(() => import('./tool-bar').then((modules) => ({ default: modules.ToolBar })));
import { useTools } from './hooks/use-tools';
import { useGetRunID } from './hooks/use-selected-run';
export const OutputRender: FC<any> = (props) => {
  const classes = useOutputRender();
  const tools = useTools();
  const selectedRun = useGetRunID();

  // Extract configuration from props (passed by AppBodyArea)
  const { tabName, id: projectId } = props;

  return (
    <SuspenseLoad>
      <div className={classes.outputLayout} data-output-root="true">
        <ToolBar tools={tools} title={selectedRun.title} subTitle={selectedRun.subTitle} />
        <div className={classes['output-area']}>
          <OutputSelection
            id={selectedRun.id}
            tabName={tabName}
            fontBold={tools.fontBold}
            fontItalic={tools.fontItalic}
            fontSize={tools.fontSize}
            fontColor={tools.fontColor}
            showHistory={tools.showRunHistory}
          />
          <RunHistory
            tabName={tabName}
            selectedID={selectedRun.id}
            history={{
              showHistory: tools.showRunHistory,
              toggleShowHistory: tools.toggleShowHistory,
              setTotalRuns: tools.setTotalRuns,
              selectedRun: selectedRun.setRunDetail,
            }}
          />
        </div>
      </div>
    </SuspenseLoad>
  );
};
