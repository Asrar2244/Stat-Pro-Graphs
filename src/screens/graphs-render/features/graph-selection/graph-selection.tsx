import { FC, lazy } from 'react';
import { SuspenseLoad } from '@libs';
import { useActiveNode } from '@hooks';
import { useSelectedRun } from '../../hooks/use-selected-run';
import { useGraphSelection } from '../../styles/use-graph-selection';
import { GraphsRenderContext } from '../../context';
import { IToolBar } from '@utils';
import { useTranslation } from 'react-i18next';
import { GlobalGraphProperties } from '../../hooks/use-tools';

const ScatterPlotGraph = lazy(() =>
  import('../plot-types/scatter-plot/index').then(module => ({ default: module.ScatterPlotGraph })),
);

const LinePlotGraph = lazy(() =>
  import('../plot-types/line-plot/index').then(module => ({ default: module.LinePlotGraph })),
);

const AreaPlotGraph = lazy(() =>
  import('../plot-types/area-plot/index').then(module => ({ default: module.AreaPlotGraph })),
);

interface IGraphSelection extends IToolBar {
  id: number;
  showHistory: boolean;
  graphProperties?: any;
  onUpdateGraphProperty?: <K extends keyof GlobalGraphProperties>(key: K, value: GlobalGraphProperties[K]) => void;
}

const loadByType = (graphType?: string) => {
  const t = (graphType || '').toLowerCase();
  if (t.includes('scatter')) return <ScatterPlotGraph />;
  if (t.includes('line')) return <LinePlotGraph />;
  if (t.includes('area')) return <AreaPlotGraph />;
  if (t.includes('3d mesh') || t.includes('3d-mesh')) return <ScatterPlotGraph />; // Use ScatterPlotGraph for 3D mesh
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
          graphProperties: (props.graphProperties as any) || (run?.selectedRun as any)?.properties,
          onUpdateGraphProperty: props.onUpdateGraphProperty as any,
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