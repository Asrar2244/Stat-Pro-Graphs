import { SuspenseLoad } from '@libs';
import { useModal, IModal } from '@hooks';
import { FC, lazy, useEffect, useState } from 'react';
import { exporters } from './configuration';
import { useTranslation } from 'react-i18next';
import { useLicenseStore, useStartProStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { useMenuCodeExecutor } from '@hooks';
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

const SavePromptModal = lazy(() =>
  import('./save-prompt-modal').then((module) => ({ default: module.SavePromptModal })),
);


// Scatter Plot Modal
const ScatterPlotModal = lazy(() =>
  import('../../features/graphs/2d/scatter').then(
    (m) => ({ default: m.ScatterPlotModal }),
    (error) => {
      console.error('Failed to load ScatterPlotModal:', error);
      throw error;
    }
  ),
);

// Line Plot Modal
const LinePlotModal = lazy(() =>
  import('../../features/graphs/2d/line').then(
    (m) => ({ default: m.LinePlotModal }),
    (error) => {
      console.error('Failed to load LinePlotModal:', error);
      throw error;
    }
  ),
);

// Line-Scatter Plot Modal
const LineScatterPlotModal = lazy(() =>
  import('../../features/graphs/2d/line-scatter').then(
    (m) => ({ default: m.LineScatterPlotModal }),
    (error) => {
      console.error('Failed to load LineScatterPlotModal:', error);
      throw error;
    }
  ),
);

// Area Plot Modal
const AreaPlotModal = lazy(() =>
  import('../../features/graphs/2d/area').then(
    (m) => ({ default: m.AreaPlotModal }),
    (error) => {
      console.error('Failed to load AreaPlotModal:', error);
      throw error;
    }
  ),
);

// 3D Mesh Plot Modal
const MeshPlotModal = lazy(() =>
  import('../../features/graphs/3d/mesh').then(
    (m) => ({ default: m.MeshPlotModal }),
    (error) => {
      console.error('Failed to load MeshPlotModal:', error);
      throw error;
    }
  ),
);

// 3D Scatter Plot Modal
const Scatter3DPlotModal = lazy(() =>
  import('../../features/graphs/3d/scatter').then(
    (m) => ({ default: m.ScatterPlotModal }),
    (error) => {
      console.error('Failed to load Scatter3DPlotModal:', error);
      throw error;
    }
  ),
);

// Box Plot Modal
const BoxPlotModal = lazy(() =>
  import('../../features/graphs/2d/box').then(
    (m) => ({ default: m.BoxPlotModal }),
    (error) => {
      console.error('Failed to load BoxPlotModal:', error);
      throw error;
    }
  ),
);

// Pie Plot Modal
const PiePlotModal = lazy(() =>
  import('../../features/graphs/2d/pie').then(
    (m) => ({ default: m.PiePlotModal }),
    (error) => {
      console.error('Failed to load PiePlotModal:', error);
      throw error;
    }
  ),
);

// Bar Plot Modal
const BarPlotModal = lazy(() =>
  import('../../features/graphs/2d/bar').then(
    (m) => ({ default: m.BarPlotModal }),
    (error) => {
      console.error('Failed to load BarPlotModal:', error);
      throw error;
    }
  ),
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
      <>
        <WrappedComponent {...props} setMenuItem={setMenuItem} />
        {selectedMenu && (
          <MenuSelector modal={modal} selector={selectedMenu} translationNs={translationNs} />
        )}
      </>
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
  }, [selector, licenseStatus.state]);

  if (isLicensed) {
    return <OpenDevTools {...modal} showCloseButton={true} />;
  }

  const { model } = useStartProStore(useShallow((state: any) => ({ model: state.model })));

  // Scatter Plot wrapper with real data integration
  const ScatterWrapper: FC<IModal> = (m) => {
    const { projects } = useStartProStore(useShallow((state) => ({ projects: state.projects })));
    const projectNames = Object.keys(projects);
    const { openNewTabAction } = useMenuCodeExecutor();
    const { setRenderLatestRun } = useStartProStore();

    // For now, use empty datasets array - this would be populated based on selected project
    const datasets: string[] = [];

    const onCreateGraph = async (config: any) => {
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
    };

    return <ScatterPlotModal projects={projectNames} datasets={datasets} onCreateGraph={onCreateGraph} {...m} />;
  };

  // Line Plot wrapper with real data integration
  const LineWrapper: FC<IModal> = (m) => {
    const { projects } = useStartProStore(useShallow((state) => ({ projects: state.projects })));
    const projectNames = Object.keys(projects);
    const { openNewTabAction } = useMenuCodeExecutor();
    const { setRenderLatestRun } = useStartProStore();
    const { t } = useTranslation('common');

    // For now, use empty datasets array - this would be populated based on selected project
    const datasets: string[] = [];

    const onCreateGraph = async (config: any) => {
      try {
        const workspacePath = projects[config.selectedProject]?.workspacePath;
        // Persist a run immediately so history shows up
        const { insertGraphRun } = await import('../graphs-render/graph-body-render/graphs-store');
        await insertGraphRun(workspacePath, {
          name: config?.subType || 'Line Plot',
          createdAt: new Date().toISOString(),
          config: { graphConfig: config, workspacePath },
          tabName: config?.selectedProject || '',
          graphType: config?.graphType || 'Line Plot',
          properties: {},
        });

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
        setRenderLatestRun(true);

        // TODO: Pass the line plot configuration to the graph tab
        // This would typically involve setting some state or context
        // that the graphs-render component can access to configure the plot

      } catch (error) {
        console.error('Error creating Line Plot:', error);
      }
    };

    return <LinePlotModal projects={projectNames} datasets={datasets} onCreateGraph={onCreateGraph} {...m} />;
  };

  // Line-Scatter Plot wrapper with real data integration
  const LineScatterWrapper: FC<IModal> = (m) => {
    const { projects } = useStartProStore(useShallow((state) => ({ projects: state.projects })));
    const projectNames = Object.keys(projects);
    const { openNewTabAction } = useMenuCodeExecutor();
    const { setRenderLatestRun } = useStartProStore();
    const { t } = useTranslation('common');

    // For now, use empty datasets array - this would be populated based on selected project
    const datasets: string[] = [];

    const onCreateGraph = async (config: any) => {
      try {
        const workspacePath = projects[config.selectedProject]?.workspacePath;

        // Persist a run immediately so history shows up
        const { insertGraphRun } = await import('../graphs-render/graph-body-render/graphs-store');
        await insertGraphRun(workspacePath, {
          name: config?.subType || 'Line-Scatter Plot',
          createdAt: new Date().toISOString(),
          config: { graphConfig: config, workspacePath },
          tabName: config?.selectedProject || '',
          graphType: config?.graphType || 'Line-Scatter Plot',
          properties: {},
        });

        // Set flag to auto-select the latest run when Graphs tab opens
        setRenderLatestRun(true);

      } catch (error) {
        console.error('Error creating Line-Scatter Plot:', error);
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

      // TODO: Pass the line-scatter plot configuration to the graph tab
      // This would typically involve setting some state or context
      // that the graphs-render component can access to configure the plot

    };

    return <LineScatterPlotModal projects={projectNames} datasets={datasets} onCreateGraph={onCreateGraph} {...m} />;
  };

  // Area Plot wrapper with real data integration
  const AreaWrapper: FC<IModal> = (m) => {
    const { projects } = useStartProStore(useShallow((state) => ({ projects: state.projects })));
    const projectNames = Object.keys(projects);
    const { openNewTabAction } = useMenuCodeExecutor();
    const { setRenderLatestRun } = useStartProStore();
    const { t } = useTranslation('common');

    // For now, use empty datasets array
    const datasets: string[] = [];

    const onCreateGraph = async (config: any) => {
      try {
        const workspacePath = projects[config.selectedProject]?.workspacePath;
        // Persist a run immediately so history shows up
        const { insertGraphRun } = await import('../graphs-render/graph-body-render/graphs-store');
        await insertGraphRun(workspacePath, {
          name: config?.subType || 'Area Plot',
          createdAt: new Date().toISOString(),
          config: { graphConfig: config, workspacePath },
          tabName: config?.selectedProject || '',
          graphType: config?.graphType || 'Area Plot',
          properties: {},
        });

        // Set flag to auto-select the latest run when Graphs tab opens
        setRenderLatestRun(true);

      } catch (error) {
        console.error('Error creating Area Plot:', error);
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
    };

    return <AreaPlotModal projects={projectNames} datasets={datasets} onCreateGraph={onCreateGraph} {...m} />;
  };

  // 3D Mesh Plot wrapper with real data integration
  const MeshWrapper: FC<IModal> = (m) => {
    const { projects } = useStartProStore(useShallow((state) => ({ projects: state.projects })));
    const projectNames = Object.keys(projects);
    const { openNewTabAction } = useMenuCodeExecutor();
    const { setRenderLatestRun } = useStartProStore();
    const { t } = useTranslation('common');

    // For now, use empty datasets array - this would be populated based on selected project
    const datasets: string[] = [];

    const onCreateGraph = async (config: any) => {
      try {
        const workspacePath = projects[config.selectedProject]?.workspacePath;

        // Ensure 3D mesh configuration is properly structured with meshConfig in graphConfig
        const meshConfig = {
          ...config,
          graphType: '3D Mesh Plot',
          subType: '3D Mesh Plot', // Ensure subType is set for 3D mesh detection
          dataFormat: config.dataFormat || 'XYZ Triplets', // Ensure dataFormat is set
          // Store mesh configuration directly in graphConfig under meshConfig property
          meshConfig: {
            surfaceType: config.surfaceType || 'surface',
            interpolation: config.interpolation || 'linear',
            colorScale: config.colorScale || 'Viridis',
            showContours: config.showContours !== false,
            showSurface: config.showSurface !== false,
            opacity: config.opacity || 0.8,
            lighting: config.lighting !== false,
            contourOpacity: config.contourOpacity || 0.5,
            smoothShading: config.smoothShading !== false,
            showGrid: config.showGrid !== false,
            gridOpacity: config.gridOpacity || 0.3,
            // Add any other mesh-specific settings from the modal
            ...config.meshSettings // Include any additional mesh settings from the modal
          }
        };

        // Persist a run immediately so history shows up
        const { insertGraphRun } = await import('../graphs-render/graph-body-render/graphs-store');
        await insertGraphRun(workspacePath, {
          name: meshConfig?.subType || '3D Mesh Plot',
          createdAt: new Date().toISOString(),
          config: { graphConfig: meshConfig, workspacePath },
          tabName: meshConfig?.selectedProject || '',
          graphType: meshConfig?.graphType || '3D Mesh Plot',
          properties: {}, // Keep properties empty, store everything in graphConfig
        });

        // Set flag to auto-select the latest run when Graphs tab opens
        setRenderLatestRun(true);

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

      } catch (error) {
        console.error('Error creating 3D Mesh Plot:', error);
      }
    };

    return <MeshPlotModal projects={projectNames} datasets={datasets} onCreateGraph={onCreateGraph} {...m} />;
  };

  // 3D Scatter Plot wrapper with real data integration
  const Scatter3DWrapper: FC<IModal> = (m) => {
    const { projects } = useStartProStore(useShallow((state) => ({ projects: state.projects })));
    const projectNames = Object.keys(projects);
    const { openNewTabAction } = useMenuCodeExecutor();
    const { setRenderLatestRun } = useStartProStore();
    const { t } = useTranslation('common');

    // For now, use empty datasets array
    const datasets: string[] = [];

    const onCreateGraph = async (config: any) => {
      try {
        const workspacePath = projects[config.selectedProject]?.workspacePath;

        // Ensure 3D scatter configuration is properly structured
        const scatterConfig = {
          ...config,
          graphType: '3D Scatter Plot',
          subType: '3D Scatter Plot',
          dataFormat: config.dataFormat || 'XYZ Triplets',
          // scatterConfig removed as per user request
          // scatterConfig: { ... }
        };

        // Persist a run immediately so history shows up
        const { insertGraphRun } = await import('../graphs-render/graph-body-render/graphs-store');
        await insertGraphRun(workspacePath, {
          name: scatterConfig?.subType || '3D Scatter Plot',
          createdAt: new Date().toISOString(),
          config: { graphConfig: scatterConfig, workspacePath },
          tabName: scatterConfig?.selectedProject || '',
          graphType: scatterConfig?.graphType || '3D Scatter Plot',
          properties: {},
        });

        setRenderLatestRun(true);

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
          }
        });

      } catch (error) {
        console.error('Error creating 3D Scatter Plot:', error);
      }
    };

    return <Scatter3DPlotModal projects={projectNames} datasets={datasets} onCreateGraph={onCreateGraph} {...m} />;
  };

  // Box Plot wrapper with real data integration
  const BoxPlotWrapper: FC<IModal> = (m) => {
    const { projects } = useStartProStore(useShallow((state) => ({ projects: state.projects })));
    const projectNames = Object.keys(projects);
    const { openNewTabAction } = useMenuCodeExecutor();
    const { setRenderLatestRun } = useStartProStore();
    const { t } = useTranslation('common');

    // For now, use empty datasets array
    const datasets: string[] = [];

    const onCreateGraph = async (config: any) => {
      try {
        const workspacePath = projects[config.selectedProject]?.workspacePath;

        // Persist a run immediately so history shows up
        const { insertGraphRun } = await import('../graphs-render/graph-body-render/graphs-store');

        await insertGraphRun(workspacePath, {
          name: config?.subType || 'Box Plot',
          createdAt: new Date().toISOString(),
          config: { graphConfig: config, workspacePath },
          tabName: config?.selectedProject || '',
          graphType: config?.graphType || 'Box Plot',
          properties: {},
        });

        setRenderLatestRun(true);

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
          }
        });

      } catch (error) {
        console.error('Error creating Box Plot:', error);
      }
    };

    return <BoxPlotModal projects={projectNames} datasets={datasets} onCreateGraph={onCreateGraph} {...m} />;
  };

  // Pie Plot wrapper with real data integration
  const PieWrapper: FC<IModal> = (m) => {
    const { projects } = useStartProStore(useShallow((state) => ({ projects: state.projects })));
    const projectNames = Object.keys(projects);
    const { openNewTabAction } = useMenuCodeExecutor();
    const { setRenderLatestRun } = useStartProStore();
    const { t } = useTranslation('common');

    const datasets: string[] = [];

    const onCreateGraph = async (config: any) => {
      try {
        const workspacePath = projects[config.selectedProject]?.workspacePath;

        const { insertGraphRun } = await import('../graphs-render/graph-body-render/graphs-store');

        await insertGraphRun(workspacePath, {
          name: config?.subType || 'Pie Chart',
          createdAt: new Date().toISOString(),
          config: { graphConfig: config, workspacePath },
          tabName: config?.selectedProject || '',
          graphType: config?.graphType || 'Pie Chart',
          properties: {},
        });

        setRenderLatestRun(true);

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
          }
        });

      } catch (error) {
        console.error('Error creating Pie Chart:', error);
      }
    };

    return <PiePlotModal projects={projectNames} datasets={datasets} onCreateGraph={onCreateGraph} {...m} />;
  };

  // Bar Plot wrapper with real data integration
  const BarPlotWrapper: FC<IModal> = (m) => {
    const { projects } = useStartProStore(useShallow((state) => ({ projects: state.projects })));
    const projectNames = Object.keys(projects);
    const { openNewTabAction } = useMenuCodeExecutor();
    const { setRenderLatestRun } = useStartProStore();
    const { t } = useTranslation('common');

    const datasets: string[] = [];

    const onCreateGraph = async (config: any) => {
      try {
        const workspacePath = projects[config.selectedProject]?.workspacePath;

        const { insertGraphRun } = await import('../graphs-render/graph-body-render/graphs-store');

        await insertGraphRun(workspacePath, {
          name: config?.subType || 'Bar Plot',
          createdAt: new Date().toISOString(),
          config: { graphConfig: config, workspacePath },
          tabName: config?.selectedProject || '',
          graphType: config?.graphType || 'Bar Plot',
          properties: {},
        });

        setRenderLatestRun(true);

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
          }
        });

      } catch (error) {
        console.error('Error creating Bar Plot:', error);
      }
    };

    return <BarPlotModal projects={projectNames} datasets={datasets} onCreateGraph={onCreateGraph} {...m} />;
  };

  const runSelector = () => {
    // CRITICAL: Synchronously get the active tab config directly from the model
    // This bypasses the 500ms delay in hooks and prevents race conditions during tab switching
    const activeTab: any = model.getActiveTabset()?.getSelectedNode()?.toJson();
    const config = activeTab?.config;

    // Intercept analysis actions if data is unsaved
    const isAnalysisAction = selector !== exporters.importBusinessObject && selector !== exporters.openDevTools && selector !== exporters.options;

    // Only prompt for NEW data views (isEmptyDataView === true) that are unsaved (draft)
    // We look at the per-tab dataState stored in node configuration for perfect isolation
    const activeDataState = config?.dataState;

    const isUnsavedNewData = isAnalysisAction &&
      config?.isEmptyDataView === true &&
      activeDataState === 'draft';

    if (isUnsavedNewData) {
      return <SavePromptModal {...modal} />;
    }

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
      case 'open-line-plot-modal':
        return <LineWrapper {...modal} />;
      case 'open-line-scatter-plot-modal':
        return <LineScatterWrapper {...modal} />;
      case 'open-area-plot-modal':
        return <AreaWrapper {...modal} />;
      case '3d-mesh':
        return <MeshWrapper {...modal} />;
      case '3d-scatter':
        return <Scatter3DWrapper {...modal} />;
      case exporters.tests:
        return <TestsAnalysis {...modal} />
      case exporters.options:
        return <Options {...modal} />
      case exporters.pairedTTest:
        return <PairedTestsAnalysis {...modal} />
      case 'open-box-plot-modal':
        return <BoxPlotWrapper {...modal} />;
      case 'open-pie-plot-modal':
        return <PieWrapper {...modal} />;
      case 'open-bar-plot-modal':
        return <BarPlotWrapper {...modal} />;
      default:
        return null;
    }
  };
  return modal.open ? <>{runSelector()}</> : <></>;
};

export { MenuSelector };