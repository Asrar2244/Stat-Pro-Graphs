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
const DescriptiveStatistics = lazy(() =>
  import('./analyze/descriptive-stats').then((modules) => ({
    default: modules.DescriptiveStatisticsRegression,
  })),
);

const EstimationOfModule = lazy(() =>
  import('./analyze/analysis-of-variance/estimation-of-module').then((modules) => ({
    default: modules.EstimationOfModule,
  })),
);

const PairwiseComparisonOfModules = lazy(() =>
  import('./analyze/analysis-of-variance/pairwise-comparison').then((modules) => ({
    default: modules.PairwiseComparisonOfModules,
  })),
);

const ForwardStepwiseRegression = lazy(() =>
  import('./analyze/regression/linear/forward-stepwise').then((modules) => ({
    default: modules.ForwardStepwiseRegression,
  }))
);

interface IOutputSelection extends IToolBar {
  id: number;
  showHistory: boolean;
}
const load: any = {
  regLinearLeastSquare: <LinearLeastSquareRegression />,
  regLinearForwardStepwise: <ForwardStepwiseRegression />,
  regLinearRidge: <LinearRidgeRegression />,
  estimationOfModules: <EstimationOfModule />,
  pairwiseComparisonModules: <PairwiseComparisonOfModules />,
  descriptiveStatistics: <DescriptiveStatistics />
};
export const OutputSelection: FC<IOutputSelection> = ({ id, showHistory, ...props }) => {
  const { config } = useActiveNode([]);
  const classes = useOutputSelection();
  const { t } = useTranslation('common');
  const run = useSelectedRun(config.tabName, id);
  const forceStyle = !showHistory ? { width: '100%' } : {};
  return (
    <div className={classes.selectionLayout} style={forceStyle}>
      <OutputRenderContext.Provider
        value={{
          toolBar: props,
          selectedRun: run?.selectedRun,
        }}
      >
        <div className={classes.outputContainer}>
          <div className={classes.content} key={id}>
            {run?.loading ? (
              <p>{t('loadingConfigurations')}</p>
            ) : (
              <SuspenseLoad>
                {run?.selectedRun?.outputType && load[run?.selectedRun?.outputType] &&
                  load[run?.selectedRun?.outputType]
                }
              </SuspenseLoad>
            )}
          </div>
        </div>
      </OutputRenderContext.Provider>
    </div>
  );
};
