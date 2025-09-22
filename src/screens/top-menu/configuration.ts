
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
  descriptiveStat: 'basic-statistics-column-wise',
  openDevTools: 'open-dev-tools',
  estimationOfModule: 'estimation-of-module',
  pairwiseComparisonOfModule: 'pairwise-comparison',
  openNewTabForGraph: 'openNewTabAction',
  emptyDataView: 'openNewTabAction',
  tests: "tests",
  options: "options",
  pairedTTest: "paired-t-test"
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
              id: 'new_data',
              label: 'data',
              execute: exporters.importBusinessObject,
            },
            {
              id: 'emptyDataView',
              label: 'emptyDataView',
              codeExecute: exporters.emptyDataView,
              isEmptyDataView: true,
            },
            {
              id: 'new_command',
              label: 'command',
            },
            {
              id: 'new_output',
              label: 'output',
            },
          ],
        },
        {
          id: 'open',
          label: 'open',
        },
        {
          id: 'data_capture',
          label: 'dataCapture',
        },
      ],
    },
    {
      id: 'edit',
      label: 'edit',
    },
    {
      id: 'view',
      label: 'view',
    },
    {
      id: 'data',
      label: 'data',
    },
    {
      id: 'utilities',
      label: 'utilities',
    },
    {
      id: 'graph',
      label: 'graph',
      submenu: [
        {
          id: 'graphView',
          label: 'graphView',
          codeExecute: exporters.openNewTabForGraph,
        },
      ],
    },
    {
      id: 'analyze',
      label: 'analyze',
      submenu: [
        {
          id: 'regression',
          label: 'regression',
          submenu: [
            {
              id: 'linear',
              label: 'linear',
              submenu: [
                {
                  id: 'leastSquares',
                  label: 'leastSquares',
                  execute: exporters.regressionLeastSquare,
                },
                // ToDO: Uncomment them when these are needed
                // {
                //   id: 'bestSubsets',
                //   label: 'bestSubsets',
                // },
                // {
                //   id: 'polynomial',
                //   label: 'polynomial',
                // },
                // {
                //   id: 'bayesian',
                //   label: 'bayesian',
                // },
                {
                  id: 'ridge',
                  label: 'ridge',
                  execute: exporters.regressionRidge,
                },
              ],
            },
          ],
        },
        {
          id: 'analysisOfVariance',
          label: 'analysisOfVariance',
          submenu: [
            {
              id: 'estimationOfModule',
              label: 'estimationOfModule',
              execute: exporters.estimationOfModule,
            },
            {
              id: 'pairwiseComparison',
              label: 'pairwiseComparison',
              execute: exporters.pairwiseComparisonOfModule,
            },
          ],
        },
      ],
    },
    {
      id: 'advanced',
      label: 'advanced',
      submenu: [
        {
          id: 'descriptiveStat',
          label: 'descriptiveStat',
          execute: exporters.descriptiveStat,
        },
        {
          id: 'test',
          label: 'test',
          submenu: [
            {
              id: "options",
              label: "options",
              execute: exporters.options,
            },
            {
              id: "t-test",
              label: "t-test",
              execute: exporters.tests,
            },
            // {
            //   id: "paired-t-test",
            //   label: "paired-t-test",
            //   execute: exporters.pairedTTest,
            // }
          ]
        },
      ],
    },
    {
      id: 'quick_access',
      label: 'quickAccess',
    },
    {
      id: 'window',
      label: 'window',
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
