import { FC, useContext } from 'react';
import { OutputRenderContext } from '../../../../context';
import { useGenerator } from './hooks/use-generator';
import { useRegressions } from '../../../../styles-hook/use-regressions-style';
import { TableCreator } from '@libs';
import { Card, CardHeader, Body1Stronger } from '@fluentui/react-components';
import { RidgePredictGraph } from './graphs/ridge-predict';
import ridgeConfig from './configuration/ridge-config.json';
import { useTranslation } from 'react-i18next';
export const LinearRidgeRegression: FC = () => {
  const context = useContext(OutputRenderContext);
  const { tables, tableRef } = useGenerator(context?.selectedRun, ridgeConfig, []);
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
      {tables.length > 0 && <RidgePredictGraph tableRef={tableRef} />}
    </div>
  );
};
