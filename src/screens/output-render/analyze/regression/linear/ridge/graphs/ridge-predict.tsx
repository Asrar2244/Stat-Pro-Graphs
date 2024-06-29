import { Card, CardFooter } from '@fluentui/react-components';
import { FC, useContext, useMemo, useRef } from 'react';
import { OutputRenderContext } from '../../../../../context';
import { useFetchGraphData } from '../hooks/use-fetch-graph-data';
import { useGraphDataset } from '../hooks/use-graph-dataset';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { GraphPlot, GraphTools } from '@libs';
import { useZoomGraph, usePlotly } from '@hooks';
import { useTranslation } from 'react-i18next';
import { useGraphTools } from './styles-hook/use-graph-tools';
import config from '../configuration/ridge-config.json';
export const RidgePredictGraph: FC<{ tableRef: any }> = ({ tableRef }) => {
  const layout = useRef<any>(undefined);
  const { t } = useTranslation(['common', 'regLinearLeastSquare']);
  const title = useMemo(() => t('title', { ns: 'regLinearLeastSquare' }), [t]);
  const context = useContext(OutputRenderContext);
  const classes = useGraphTools();
  const { data } = useFetchGraphData(context?.selectedRun, tableRef);
  const datasets = useGraphDataset({ params: context?.selectedRun, data }, tableRef);
  const handle = useFullScreenHandle();
  const zoomed = useZoomGraph(layout.current);
  const plotly = usePlotly({
    data: datasets,
    layout: zoomed.layoutGraph,
    title,
    editedConfig: config.graphOptions,
    enablePointEvent: true,
  });
  return (
    <FullScreen handle={handle}>
      <div className={!handle.active ? classes.notFullScreen : classes.fullScreen}>
        <Card>
          <GraphPlot
            ref={plotly.graph}
            isFullScreen={
              handle.active
                ? true
                : {
                    height: '450px',
                  }
            }
          />
          <CardFooter>
            <div className={classes.toolsWrapper}>
              <GraphTools title={title} handle={handle} zoomed={zoomed} plotly={plotly} />
            </div>
          </CardFooter>
        </Card>
      </div>
    </FullScreen>
  );
};
