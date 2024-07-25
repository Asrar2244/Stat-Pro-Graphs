export interface IMenuItem {
  label: string;
  id: string;
  execute?: string;
  submenu?: IMenuItem[];
}

export const exporters = {
  importBusinessObject: 'project-details',
  regressionLeastSquare: 'least-square',
  regressionRidge: 'ridge',
  basicStatisticsColumnWise: 'basic-statistics-column-wise',
  openDevTools: 'open-dev-tools',
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
        {
          id: 'import_business_object',
          label: 'ImportBusinessObject',
          execute: exporters.importBusinessObject,
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
                {
                  id: 'bestSubsets',
                  label: 'bestSubsets',
                },
                {
                  id: 'polynomial',
                  label: 'polynomial',
                },
                {
                  id: 'bayesian',
                  label: 'bayesian',
                },
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
          id: 'basicStatistics',
          label: 'basicStatistics',
          submenu: [
            {
              id: 'rowWise',
              label: 'rowWise',
            },
            {
              id: 'columnWise',
              label: 'columnWise',
              execute: exporters.basicStatisticsColumnWise,
            },
          ],
        },
      ],
    },
    {
      id: 'advanced',
      label: 'advanced',
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
