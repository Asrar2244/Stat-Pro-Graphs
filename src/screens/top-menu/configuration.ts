
export interface IMenuItem {
  label: string;
  id: string;
  execute?: string;
  submenu?: IMenuItem[];
  icon?: string;
  codeExecute?: string;
}

export const exporters = {
  importBusinessObject: 'project-details',
  regressionLeastSquare: 'least-square',
  regressionRidge: 'ridge',
  regressionForwardStepwise: 'forward-stepwise',
  regressionBackwardStepwise: 'backward-stepwise',
  regressionStepwise: 'stepwise',
  regressionBestSubset: 'best-subset',
  regressionMultipleLinear: 'multiple-linear',
  regressionPolynomial: 'polynomial',
  descriptiveStat: 'basic-statistics-column-wise',
  openDevTools: 'open-dev-tools',
  estimationOfModule: 'estimation-of-module',
  pairwiseComparisonOfModule: 'pairwise-comparison',
  openNewTabForGraph: 'openNewTabAction',
  emptyDataView: 'openNewTabAction',
  regressionBayesian: 'bayesian',
  tests: "tests",
  options: "options",
  pairedTTest: "paired-t-test",
  openProject: 'openProjectAction',
  importData: 'importDataAction',
};

export const topMenuConfig = {
  translateNs: 'menus',
  menus: [
    {
      id: 'file',
      label: 'file',
      submenu: [
        {
          id: 'new',
          label: 'new',
          submenu: [
            {
              id: 'emptyDataView',
              label: 'emptyDataView',
              codeExecute: exporters.emptyDataView,
              isEmptyDataView: true,
            },
            {
              id: 'new_data',
              label: 'data',
              execute: exporters.importBusinessObject,
            },

          ],
        },

        {
          id: 'import_data',
          label: 'Import Data',
          codeExecute: exporters.importData,
        },
        {
          id: 'open',
          label: 'open',
          codeExecute: exporters.openProject,
        },
        // {
        //   id: 'data_capture',
        //   label: 'dataCapture',
        // },
      ],
    },
    {
      id: 'tests',
      label: 'Analysis',
      submenu: [
        {
          id: "options",
          label: "options",
          execute: exporters.options,
        },
        {
          id: "t-test",
          label: "t-test",
          execute: exporters.options,
        },
        {
          id: "paired-t-test",
          label: "paired-t-test",
          execute: exporters.options,
        }
      ]
    },
    {
      id: 'graphs',
      label: 'Graphs',
      submenu: [
        {
          id: 'graphView',
          label: 'graphView',
          codeExecute: exporters.openNewTabForGraph,
        },
      ],
    },
    {
      id: 'help',
      label: 'help',
      submenu: [
        {
          id: 'open-dev-tools',
          label: 'openDevTools',
          execute: exporters.openDevTools,
        },
      ],
    },
  ],
};
