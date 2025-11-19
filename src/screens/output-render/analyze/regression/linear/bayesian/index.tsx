import { FC, useContext } from 'react';
import { OutputRenderContext } from '../../../../context';
import { useRegressions } from '../../../../styles-hook/use-regressions-style';
import { CardTableRender, GraphPlot } from '@libs';
import configurations from './configuration/bayesian-config.json';
import { useTranslation } from 'react-i18next';
import { ITableCreator, IGraph } from '@utils';


const LinearBayesianRegression: FC = () => {
  const context = useContext(OutputRenderContext);
  const { t } = useTranslation('reqLinearBayesianOutput');
  const classes = useRegressions();
  
  // Bayesian config only has tables, no graphs
  const graphConfig: IGraph[] = [];
  
  return (
    <div className={classes.regressionsLayout}>
      {configurations.tables.map((table) => (
        <CardTableRender
          key={table.name}
          t={t}
          table={table as ITableCreator}
          dbFileName={context?.selectedRun?.tabName as string}
          dbTableName={context?.selectedRun?.result.output_table_name as string}
        />
      ))}
      {graphConfig.map((graph: IGraph) => (
        <GraphPlot
          key={graph.name}
          graph={graph as any}
          dbFileName={context?.selectedRun?.tabName as string}
          dbTableName={context?.selectedRun?.result.output_table_name as string}
        />
      ))}
    </div>
  );
};

export default LinearBayesianRegression;
