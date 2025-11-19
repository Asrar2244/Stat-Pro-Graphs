import { FC, useContext } from 'react';
import { OutputRenderContext } from '../../../../context';
import { useRegressions } from '../../../../styles-hook/use-regressions-style';
import { CardTableRender, GraphPlot } from '@libs';
import configurations from './configuration/multiple-linear-config.json';
import { useTranslation } from 'react-i18next';
import { ITableCreator, IGraph } from '@utils';
import { useGraphConfig } from '@hooks';
import { renderRawBackendOutput } from '@outputRegressionCommon/render-raw-backend-output';

export const MultipleLinearRegression: FC = () => {
  const context = useContext(OutputRenderContext);
  const { t } = useTranslation('reqLinearLeastSquareOutput');
  const classes = useRegressions();
  const graphConfig = useGraphConfig(configurations.graph as any);
  const result = context?.selectedRun?.result;

  if (typeof result === 'string') {
    return renderRawBackendOutput(result, {
      containerClassName: classes.regressionsLayout,
    });
  }

  // Normal rendering if result is an object
  return (
    <div className={classes.regressionsLayout}>
      {configurations.tables.map((table, index) => (
        <CardTableRender
          key={`${table.name}-${index}`}
          t={t}
          table={table as ITableCreator}
          dbFileName={context?.selectedRun?.tabName as string}
          dbTableName={result?.output_table_name as string}
        />
      ))}
      {graphConfig.map((graph: IGraph, index: number) => (
        <GraphPlot
          key={`${graph.name}-${index}`}
          graph={graph as any}
          dbFileName={context?.selectedRun?.tabName as string}
          dbTableName={result?.output_table_name as string}
        />
      ))}

    </div>
  );
};