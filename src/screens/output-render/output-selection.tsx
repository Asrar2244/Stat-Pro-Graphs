import { FC, lazy, useEffect } from 'react';
import { SuspenseLoad } from '@libs';
import { useActiveNode } from '@hooks';
import { useSelectedRun } from './hooks/use-selected-run';
import { useOutputSelection } from './styles-hook/use-output-selection';
import { OutputRenderContext } from './context';
import { IToolBar } from '@utils';
import { useTranslation } from 'react-i18next';
import { useStartProStore } from '@store';
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
const LinearBayesianRegression = lazy(() =>
  import('./analyze/regression/linear/bayesian').then((modules) => ({
    default: modules.default,
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
const BackwardStepwiseRegression = lazy(() =>
  import('./analyze/regression/linear/backward-stepwise').then((modules) => ({
    default: modules.BackwardStepwiseRegression,
  }))
);
const StepwiseRegression = lazy(() =>
  import('./analyze/regression/linear/stepwise').then((modules) => ({
    default: modules.StepwiseRegression,
  }))
);
const BestSubsetRegression = lazy(() =>
  import('./analyze/regression/linear/best-subset').then((modules) => ({
    default: modules.BestSubsetRegression,
  }))
);
const MultipleLinearRegression = lazy(() =>
  import('./analyze/regression/linear/multiple-linear').then((modules) => ({
    default: modules.MultipleLinearRegression,
  }))
);
const PolynomialRegression = lazy(() =>
  import('./analyze/regression/linear/polynomial').then((modules) => ({
    default: modules.PolynomialRegression,
  }))
);
const TTestComponent = lazy(() =>
  import('./analyze/tests/t-test').then((modules) => ({
    default: modules.TTestComponent,
  })),
);
const SampleSizeOutput = lazy(() =>
  import('./sample-size').then((modules) => ({
    default: modules.SampleSizeOutput,
  })),
);

interface IOutputSelection extends IToolBar {
  id: number;
  showHistory: boolean;
}
const load: any = {
  regLinearLeastSquare: <LinearLeastSquareRegression />,
  regLinearForwardStepwise: <ForwardStepwiseRegression />,
  regLinearBackwardStepwise: <BackwardStepwiseRegression />,
  regLinearStepwise: <StepwiseRegression />,
  regLinearBestSubset: <BestSubsetRegression />,
  regLinearMultipleLinear: <MultipleLinearRegression />,
  regLinearPolynomial: <PolynomialRegression />,
  regLinearRidge: <LinearRidgeRegression />,
  regLinearBayesian: <LinearBayesianRegression />,
  estimationOfModules: <EstimationOfModule />,
  pairwiseComparisonModules: <PairwiseComparisonOfModules />,
  descriptiveStatistics: <DescriptiveStatistics />,
  tTestModule: <TTestComponent />,
  sampleSize: <SampleSizeOutput />
};
export const OutputSelection: FC<IOutputSelection> = ({ id, showHistory, ...props }) => {
  const { config } = useActiveNode([]);
  const classes = useOutputSelection();
  const { t } = useTranslation('common');
  const run = useSelectedRun(config.tabName, id);
  const { setBlockUI } = useStartProStore();

  // Surface backend errors as a popup/modal as well as inline
  useEffect(() => {
    const result: any = run?.selectedRun?.result as any;
    const outType = run?.selectedRun?.outputType || '';
    const missingOutputTable =
      outType.startsWith('regLinear') && (!result || typeof result !== 'object' || !result.output_table_name);
    const isEmptyObject = result && typeof result === 'object' && Object.keys(result).length === 0;
    const errorMessage =
      typeof result === 'string'
        ? result
        : result?.error || result?.message || result?.detail || (missingOutputTable ? 'No output generated from backend.' : (isEmptyObject ? 'Backend returned no data.' : undefined));
    if (!run?.loading && errorMessage) {
      setBlockUI({ value: true, msg: String(errorMessage) });
    }
  }, [run?.loading, run?.selectedRun?.result, run?.selectedRun?.outputType, setBlockUI]);
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
          <div className={classes.content} key={id} data-output-id={id}>
            {run?.loading ? (
              <p>{t('loadingConfigurations')}</p>
            ) : (
              (() => {
                const result: any = run?.selectedRun?.result as any;
                const outType = run?.selectedRun?.outputType || '';
                const missingOutputTable =
                  outType.startsWith('regLinear') && (!result || typeof result !== 'object' || !result.output_table_name);
                const isEmptyObject = result && typeof result === 'object' && Object.keys(result).length === 0;
                const errorMessage =
                  typeof result === 'string'
                    ? result
                    : result?.error || result?.message || result?.detail || (missingOutputTable ? 'No output generated from backend.' : (isEmptyObject ? 'Backend returned no data.' : undefined));
                if (errorMessage) {
                  return (
                    <div style={{
                      padding: 16,
                      borderRadius: 8,
                      background: '#fff3f3',
                      color: '#8a1c1c',
                      border: '1px solid #f0c4c4',
                      whiteSpace: 'pre-wrap'
                    }}>
                      <strong>Error:</strong> {String(errorMessage)}
                    </div>
                  );
                }
                return (
                  <SuspenseLoad>
                    {run?.selectedRun?.outputType && load[run?.selectedRun?.outputType] &&
                      load[run?.selectedRun?.outputType]
                    }
                  </SuspenseLoad>
                );
              })()
            )}
          </div>
        </div>
      </OutputRenderContext.Provider>
    </div>
  );
};
