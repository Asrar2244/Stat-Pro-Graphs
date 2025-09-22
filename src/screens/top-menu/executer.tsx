import { SuspenseLoad } from '@libs';
import { useModal, IModal } from '@hooks';
import { FC, lazy, useEffect, useState } from 'react';
import { exporters } from './configuration';
import { useTranslation } from 'react-i18next';
import { useLicenseStore, useStartProStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { useMenuCodeExecutor } from '@hooks';
import { useScatterPlotStore } from '@features/graphs/ScatterPlot/scatterPlotSlice';
import { DATA, GRAPHS } from '@constants';
import { useNodeActions } from '@hooks';
const BrowseFile = lazy(() =>
  import('./browse-file').then((module) => ({ default: module.BrowseFile })),
);
const LeastSquare = lazy(() =>
  import('./analyze').then((module) => ({ default: module.LeastSquare })),
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
    const { openNewTab, getOpenRecords } = useNodeActions();
    const { setRenderLatestRun } = useStartProStore();
    
    // For now, use empty datasets array - this would be populated based on selected project
    const datasets: string[] = [];
    
    const onCreateGraph = async (config: any) => {
      console.log('Creating Scatter Plot with config:', config);
      try {
        const workspacePath = projects[config.selectedProject]?.workspacePath;
        // Persist a run immediately so history shows up
        const { insertGraphRun } = await import('../graph-view-render/graph-body-render/graphs-store');
        await insertGraphRun(workspacePath, {
          name: config?.subType || 'Scatter Plot',
          createdAt: new Date().toISOString(),
          config: { graphConfig: config, workspacePath },
          tabName: config?.selectedProject || '',
          graphType: config?.graphType || 'Scatter Plot',
        });
        
        // Set flag to auto-select the latest run when Graphs tab opens
        setRenderLatestRun(true);
      } catch (e) {
        console.error('Failed to insert graph run:', e);
      }

      // Ensure DATA tab for the selected project is open to the left of the GRAPHS tab
      const project = projects[config.selectedProject];
      if (project) {
        const dataSelector: any = { ...project, projectName: config.selectedProject };
        const { record: existingDataTab } = getOpenRecords(dataSelector, DATA);
        if (!existingDataTab) {
          // Open DATA tab first so it appears immediately to the left of the GRAPHS tab
          openNewTab(dataSelector, Number(project.id), DATA, t);
        }
      }

      // Now open the GRAPHS tab for the selected project
      openNewTabAction({
        id: GRAPHS,
        isEmptyDataView: false,
        extraConfig: {
          tabName: projects[config.selectedProject]?.workspacePath,
          name: config.selectedProject,
          type: t(GRAPHS.toLowerCase(), { ns: 'workspace' }),
          bareType: GRAPHS,
          id: projects[config.selectedProject]?.id,
          lastModified: new Date().toISOString(),
          isActive: 1,
          workspacePath: projects[config.selectedProject]?.workspacePath,
        },
      });
      
      // TODO: Pass the scatter plot configuration to the graph tab
      // This would typically involve storing the config in a store or passing it via tab config
      console.log('Graph tab created. Config to be passed:', config);
    };
    
    return <ScatterPlotModal projects={projectNames} datasets={datasets} onCreateGraph={onCreateGraph} {...m} />;
  };

  const d = () => {
    switch (selector) {
      case exporters.importBusinessObject:
        return <BrowseFile {...modal} t={t} />;
      case exporters.regressionLeastSquare:
        return <LeastSquare {...modal} />;
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
      default:
        return null;
    }
  };
  return modal.open ? <>{d()}</> : <></>;
};

export { MenuSelector };