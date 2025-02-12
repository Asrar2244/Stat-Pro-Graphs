import { FC, useContext } from 'react';
import { OutputRenderContext } from '../../context';
import { useRegressions } from '../../styles-hook/use-regressions-style';
import { CardColumnRender } from '@libs';
import configurations from './configuration/descriptive-stat-config.json';
import { useTranslation } from 'react-i18next';
import { ICardInterface } from '@utils';
export const DescriptiveStatisticsRegression: FC = () => {
  const context = useContext(OutputRenderContext);
  const { t } = useTranslation('descriptiveStatisticsOutput');
  const classes = useRegressions();
  return (
    <div className={classes.regressionsLayout}>
      {configurations.card.map((card) => (
        <CardColumnRender
          key={card.name}
          t={t}
          card={card as ICardInterface}
          dbFileName={context?.selectedRun?.tabName as string}
          dbTableName={context?.selectedRun?.result.output_table_name as string}
        />
      ))}
    </div>
  );
};
