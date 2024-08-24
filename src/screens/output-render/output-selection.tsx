import { FC, lazy } from 'react';
import { SuspenseLoad } from '@libs';
import { useActiveNode } from '@hooks';
import { useSelectedRun } from './hooks/use-selected-run';
import { useOutputSelection } from './styles-hook/use-output-selection';
import { OutputRenderContext } from './context';
import { IToolBar } from '@utils';
import { useTranslation } from 'react-i18next';
const LinearLeastSquareRegression = lazy(() =>
  import('./analyze/regression/linear/least-square').then((modules) => ({
    default: modules.LinearLeastSquareRegression,
  })),
);
const LinearRidgeRegression = lazy(() =>
  import('./analyze/regression/linear/ridge').then((modules) => ({
    default: modules.LinearRidgeRegression,
  })),
);
const BasicStatistics = lazy(() =>
  import('./analyze/basic-statistics').then((modules) => ({
    default: modules.BasicStatisticsRegression,
  })),
);
interface IOutputSelection extends IToolBar {
  id: number;
}
const load: any = {
  regLinearLeastSquare: <LinearLeastSquareRegression />,
  regLinearRidge: <LinearRidgeRegression />,
  basicStatistics: <BasicStatistics />,
};
export const OutputSelection: FC<IOutputSelection> = ({ id, ...props }) => {
  const { config } = useActiveNode([]);
  const classes = useOutputSelection();
  const { t } = useTranslation('common');
  const run = useSelectedRun(config.tabName, id);
  return (
    <div className={classes.selectionLayout}>
      {id > 0 && (
        <OutputRenderContext.Provider
          value={{
            toolBar: props,
            selectedRun: run?.selectedRun,
          }}
        >
          <div className={classes.outputContainer}>
            <div className={classes.content}>
              <SuspenseLoad>
                {run?.selectedRun?.outputType && load[run?.selectedRun?.outputType] ? (
                  load[run?.selectedRun?.outputType]
                ) : (
                  <center>{t('typeNotFound')}</center>
                )}
              </SuspenseLoad>
            </div>
          </div>
        </OutputRenderContext.Provider>
      )}
    </div>
  );
};
