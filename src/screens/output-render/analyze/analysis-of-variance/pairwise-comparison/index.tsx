import { FC, useContext } from 'react';
import { OutputRenderContext } from '../../../context';
import { useRegressions } from '../../../styles-hook/use-regressions-style';
import { CardTableRender } from '@libs';
import configurations from './configuration/pairwise-comparison-config.json';
import { useTranslation } from 'react-i18next';
import { ITableCreator } from '@utils';

export const PairwiseComparisonOfModules: FC = () => {
  const context = useContext(OutputRenderContext);
  const { t } = useTranslation('pairwiseComparisonOutput');
  const classes = useRegressions();
  return (
    <div className={classes.regressionsLayout}>
      {configurations.tables.map((table) => (
        <CardTableRender
          key={table.name}
          t={t}
          table={table as ITableCreator}
          dbFileName={context?.selectedRun?.tabName as string}
          // From backend its coming in this structure, need to check
          dbTableName={context?.selectedRun?.result as unknown as string}
        />
      ))}
    </div>
  );
};