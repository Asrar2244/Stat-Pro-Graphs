import { FC, useContext } from 'react';
import { OutputRenderContext } from '../../../../context';
import { useGenerator } from './hooks/use-generator';
import { useRegressions } from '../../../../styles-hook/use-regressions-style';
import { TableCreator } from '@libs';
import { Card, CardHeader, Body1Stronger } from '@fluentui/react-components';
import { ResidualPredictGraph } from './graphs/residual-predict';
import leastSquareConfig from './configuration/least-square-config.json';
import { useTranslation } from 'react-i18next';
export const LinearLeastSquareRegression: FC = () => {
  const context = useContext(OutputRenderContext);
  const { tables, tableRef } = useGenerator(context?.selectedRun, leastSquareConfig, [
    { name: 'outlierData', showCaption: true },
  ]);
  const { t } = useTranslation('reqLinearLeastSquareOutput');
  const classes = useRegressions();
  return (
    <div className={classes.regressionsLayout}>
      {tables.map((table) => (
        <Card key={table.name}>
          {table?.showCaption && (
            <CardHeader header={<Body1Stronger>{t(table.name)}</Body1Stronger>} />
          )}
          <TableCreator {...table} />
        </Card>
      ))}
      {tables.length > 0 && <ResidualPredictGraph tableRef={tableRef} />}
    </div>
  );
};
