import { FC, useContext } from 'react';
import { OutputRenderContext } from '../../../../context';
import { useRegressions } from '../../../../styles-hook/use-regressions-style';
import { CardTableRender, GraphPlot } from '@libs';
import configurations from './configuration/ridge-config.json';
import { useTranslation } from 'react-i18next';
import { ITableCreator } from '@utils';
export const LinearRidgeRegression: FC = () => {
  const context = useContext(OutputRenderContext);
  const { t } = useTranslation('regLinearRidge');
  const classes = useRegressions();
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
      {configurations.graph && (
        <GraphPlot
          graph={configurations.graph as any}
          dbFileName={context?.selectedRun?.tabName as string}
          dbTableName={context?.selectedRun?.result.output_table_name as string}
        />
      )}
    </div>
  );
};
