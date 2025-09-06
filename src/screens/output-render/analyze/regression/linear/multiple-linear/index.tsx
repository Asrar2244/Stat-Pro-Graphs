import { FC, useContext } from 'react';
import { OutputRenderContext } from '../../../../context';
import { useRegressions } from '../../../../styles-hook/use-regressions-style';
import { CardTableRender, GraphPlot } from '@libs';
import configurations from './configuration/multiple-linear-config.json';
import { useTranslation } from 'react-i18next';
import { ITableCreator, IGraph } from '@utils';
import { useGraphConfig } from '@hooks';

export const MultipleLinearRegression: FC = () => {
  const context = useContext(OutputRenderContext);
  const { t } = useTranslation('reqLinearLeastSquareOutput');
  const classes = useRegressions();
  const graphConfig = useGraphConfig(configurations.graph as any);
  const result = context?.selectedRun?.result;

  // Fallback: if result is a string, display it more prominently
  if (typeof result === 'string') {
    return (
      <div className={classes.regressionsLayout} style={{ padding: 24, color: '#b71c1c', background: '#fff3e0', borderRadius: 8 }}>
        <h2>Backend Output (Raw String)</h2>
        <p style={{ fontWeight: 'bold', marginBottom: 8 }}>
          The backend did not return a structured result. Only the raw output string is available:
        </p>
        <pre style={{ fontSize: 18, color: '#263238', background: '#eceff1', padding: 16, borderRadius: 4 }}>{result}</pre>
        <p style={{ marginTop: 16, color: '#b71c1c' }}>
          To see full tables and statistics, please ask your backend developer to return a JSON object as described in the documentation.
        </p>
      </div>
    );
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