import { SuspenseLoad } from '@libs';
import { useModal, IModal } from '@hooks';
import { FC, lazy, useEffect, useState } from 'react';
import { exporters } from './configuration';
import { useTranslation } from 'react-i18next';
import { useLicenseStore, useStartProStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { useMenuCodeExecutor } from '@hooks';
import { useScatterPlotStore } from '@features/graphs/ScatterPlot/scatterPlotSlice';
import { GRAPHS } from '@constants';
import { LeastSquare } from './analyze/regression/linear/least-squares/least-squares';
import { Bayesian } from './analyze/regression/linear/bayesian/bayesian';
const BrowseFile = lazy(() =>
  import('./browse-file').then((module) => ({ default: module.BrowseFile })),
);
const Ridge = lazy(() => import('./analyze').then((module) => ({ default: module.RidgeModule })));

const DescriptiveStatistics = lazy(() =>
  import('./advanced').then((module) => ({ default: module.DescriptiveStatistics })),
);
const OpenDevTools = lazy(() =>
  import('./open-dev-tools').then((module) => ({ default: module.OpenDevTools })),
);
const EstimationOfModule = lazy(() =>
  import('./analyze').then((module) => ({ default: module.estimationOfModule })),
);

const PairwiseComparisonOfModule = lazy(() =>
  import('./analyze').then((module) => ({ default: module.PairwiseComparisonModule })),
);

const ForwardStepwise = lazy(() =>
  import('./analyze').then((module) => ({ default: module.ForwardStepwiseModule }))
);
const BackwardStepwise = lazy(() =>
  import('./analyze').then((module) => ({ default: module.BackwardStepwiseModule }))
);
const Stepwise = lazy(() =>
  import('./analyze').then((module) => ({ default: module.StepwiseModule }))
);
const BestSubset = lazy(() =>
  import('./analyze').then((module) => ({ default: module.BestSubsetModule }))
);
const MultipleLinear = lazy(() =>
  import('./analyze').then((module) => ({ default: module.MultipleLinearModule }))
);
const Polynomial = lazy(() =>
  import('./analyze').then((module) => ({ default: module.PolynomialModule }))
);
const TestsAnalysis = lazy(() => import('./advanced').then((module) => ({ default: module.TestsAnalysis })));

const Options = lazy(() => import('./advanced').then((module) => ({ default: module.Options })));

const PairedTestsAnalysis = lazy(() => import('./advanced').then((module) => ({ default: module.PairedTestsAnalysis })));


// Scatter Plot Modal
const ScatterPlotModal = lazy(() =>
  import('../../features/graphs/ScatterPlot').then((m) => ({ default: m.ScatterPlotModal })),
);

export const withMenuEvents = <P extends object>(
  translationNs: string,
  WrappedComponent: React.ComponentType<P>,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
  return function withMenuEvents(props: any) {
    const [selectedMenu, setSelectedMenu] = useState<string>('');
    const modal = useModal({});
    const setMenuItem = (item: string): void => {
      setSelectedMenu(item);
      modal.openModal();
    };
    return (
      <SuspenseLoad>
        <WrappedComponent {...props} setMenuItem={setMenuItem} />
        {selectedMenu && (
          <MenuSelector modal={modal} selector={selectedMenu} translationNs={translationNs} />
        )}
      </SuspenseLoad>
    );
  };
};

const MenuSelector: FC<{
  modal: IModal;
  selector: string;
  translationNs: string;
}> = ({ selector, modal }) => {
  const { t } = useTranslation(['common', 'errors', 'success']);
  const { licenseStatus } = useLicenseStore(
    useShallow((state) => ({ licenseStatus: state.licenseStatus })),
  );
  const [isLicensed, setIsLicensed] = useState(false);
  useEffect(() => {
    if (!selector || selector === exporters.openDevTools) {
      setIsLicensed(true);
      return;
    }
    if (licenseStatus.state === 'expired') {
      setIsLicensed(true);
    } else {
      setIsLicensed(false);
    }
  }, [selector]);

  if (isLicensed) {
    return <OpenDevTools {...modal} showCloseButton={true} />;
  }

  // Scatter Plot wrapper with real data integration
  const ScatterWrapper: FC<IModal> = (m) => {
    const { projects } = useStartProStore(useShallow((state) => ({ projects: state.projects })));
    const projectNames = Object.keys(projects);
    const { openNewTabAction } = useMenuCodeExecutor();
    const { setRenderLatestRun } = useStartProStore();
    
    // For now, use empty datasets array - this would be populated based on selected project
    const datasets: string[] = [];
    
    const onCreateGraph = async (config: any) => {
      console.log('Creating Scatter Plot with config:', config);
      try {
        const workspacePath = projects[config.selectedProject]?.workspacePath;
        // Persist a run immediately so history shows up
        const { insertGraphRun } = await import('../graphs-render/graph-body-render/graphs-store');
        await insertGraphRun(workspacePath, {
          name: config?.subType || 'Scatter Plot',
          createdAt: new Date().toISOString(),
          config: { graphConfig: config, workspacePath },
          tabName: config?.selectedProject || '',
          graphType: config?.graphType || 'Scatter Plot',
          properties: {},
        });
        
        // Set flag to auto-select the latest run when Graphs tab opens
        setRenderLatestRun(true);
      } catch (e) {
        console.error('Failed to insert graph run:', e);
      }

      // Open the Graphs output screen under Explorer for the selected project
      openNewTabAction({ 
        id: GRAPHS, // Use GRAPHS constant
        isEmptyDataView: false,
        extraConfig: {
          tabName: projects[config.selectedProject]?.workspacePath, // Pass workspacePath as tabName
          name: config.selectedProject, // Pass project name
          type: t(GRAPHS.toLowerCase(), { ns: 'workspace' }), // Pass type
          bareType: GRAPHS, // Pass bareType
          id: projects[config.selectedProject]?.id, // Pass project ID
          lastModified: new Date().toISOString(), // Current timestamp
          isActive: 1, // Set as active
          workspacePath: projects[config.selectedProject]?.workspacePath, // Pass workspacePath
        }
      });
      
      // TODO: Pass the scatter plot configuration to the graph tab
      // This would typically involve storing the config in a store or passing it via tab config
      console.log('Graph tab created. Config to be passed:', config);
    };
    
    return <ScatterPlotModal projects={projectNames} datasets={datasets} onCreateGraph={onCreateGraph} {...m} />;
  };

  const runSelector = () => {
    switch (selector) {
      case exporters.importBusinessObject:
        return <BrowseFile {...modal} t={t} />;
      case exporters.regressionLeastSquare:
        return <LeastSquare {...modal} />;
      case exporters.regressionBayesian:
        return <Bayesian {...modal} />;
      case exporters.regressionRidge:
        return <Ridge {...modal} />;
      case exporters.regressionForwardStepwise:
        return <ForwardStepwise {...modal} />;
      case exporters.regressionBackwardStepwise:
        return <BackwardStepwise {...modal} />;
      case exporters.regressionStepwise:
        return <Stepwise {...modal} />;
      case exporters.regressionBestSubset:
        return <BestSubset {...modal} />;
      case exporters.regressionMultipleLinear:
        return <MultipleLinear {...modal} />;
      case exporters.regressionPolynomial:
        return <Polynomial {...modal} />;
      case exporters.descriptiveStat:
        return <DescriptiveStatistics {...modal} />;
      case exporters.estimationOfModule:
        return <EstimationOfModule {...modal} />;
      case exporters.openDevTools:
        return <OpenDevTools {...modal} />;
      case exporters.pairwiseComparisonOfModule:
        return <PairwiseComparisonOfModule {...modal} />;
      case 'open-scatter-plot-modal':
        return <ScatterWrapper {...modal} />;
      case exporters.tests:
        return <TestsAnalysis {...modal} />
      case exporters.options:
        return <Options {...modal} />
      case exporters.pairedTTest:
        return <PairedTestsAnalysis {...modal} />
      default:
        return null;
    }
  };
  return modal.open ? <>{runSelector()}</> : <></>;
};

export { MenuSelector };