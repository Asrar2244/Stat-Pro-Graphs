import { FC, useContext } from 'react';
import { OutputRenderContext } from '../../../context';
import { useRegressions } from '../../../styles-hook/use-regressions-style';
import { CardTableRender } from '@libs';
import configurations from './configuration/estimation-config.json';
import { useTranslation } from 'react-i18next';
import { ITableCreator } from '@utils';

export const EstimationOfModule: FC = () => {
  const context = useContext(OutputRenderContext);
  const { t } = useTranslation('estimationModuleOutput');
  const classes = useRegressions();

  // Robustly extract the table name from the backend result
  const result = context?.selectedRun?.result as any;
  const dbTableName = (
    result?.output_table_name ||
    result?.table_name ||
    (typeof result === 'string' ? result : '')
  ) as string;

  return (
    <div className={classes.regressionsLayout}>
      {configurations.tables.map((table) => (
        <CardTableRender
          key={table.name}
          t={t}
          table={table as ITableCreator}
          dbFileName={context?.selectedRun?.tabName as string}
          dbTableName={dbTableName}
        />
      ))}
    </div>
  );
};