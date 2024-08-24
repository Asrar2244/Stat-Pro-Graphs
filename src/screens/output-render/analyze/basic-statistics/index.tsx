import { FC, useContext } from 'react';
import { OutputRenderContext } from '../../context';
import { useRegressions } from '../../styles-hook/use-regressions-style';
import { CardTableRender } from '@libs';
import configurations from './configuration/basic-stat-config.json';
import { useTranslation } from 'react-i18next';
import { ITableCreator } from '@utils';
export const BasicStatisticsRegression: FC = () => {
  const context = useContext(OutputRenderContext);
  const { t } = useTranslation('basicStatisticsOutput');
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
    </div>
  );
};
