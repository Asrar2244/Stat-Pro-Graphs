import { FC, lazy } from 'react';
import { SuspenseLoad } from '@libs';
import { useActiveNode } from '@hooks';
import { useSelectedRun } from './hooks/use-selected-run';
import { useGraphSelection } from './styles-hook/use-graph-selection';
import { GraphsRenderContext } from './context';
import { IToolBar } from '@utils';
import { useTranslation } from 'react-i18next';

const ScatterPlotGraph = lazy(() =>
  import('./graphs/scatter-plot/index').then((module) => ({ default: module.ScatterPlotGraph })),
);

interface IGraphSelection extends IToolBar {
  id: number;
  showHistory: boolean;
}

const loadByType = (graphType?: string) => {
  const t = (graphType || '').toLowerCase();
  if (t.includes('scatter')) return <ScatterPlotGraph />;
  return <></>;
};

export const GraphSelection: FC<IGraphSelection> = ({ id, showHistory, ...props }) => {
  const { config } = useActiveNode([]);
  const classes = useGraphSelection();
  const { t } = useTranslation('common');
  const run = useSelectedRun(config.tabName, id);
  const forceStyle = !showHistory ? { width: '100%' } : { width: 'calc(100% - 360px)' };
  
  return (
    <div className={classes.selectionLayout} style={forceStyle}>
      <GraphsRenderContext.Provider
        value={{
          toolBar: props,
          selectedRun: run?.selectedRun,
        }}
      >
        <div className={classes.graphContainer}>
          <div className={classes.content} data-graph-id={id}>
            {run?.loading ? (
              <p>{t('loadingConfigurations')}</p>
            ) : (
              <SuspenseLoad>
                {loadByType(run?.selectedRun?.graphType)}
              </SuspenseLoad>
            )}
          </div>
        </div>
      </GraphsRenderContext.Provider>
    </div>
  );
};