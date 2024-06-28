import { IJsonModel } from 'flexlayout-react';

export const initialDocLayout: IJsonModel = {
  global: {
    tabSetMinWidth: 200,
    borderBarSize: 40,
    tabEnableRenderOnDemand: false,
  },
  borders: [
    {
      type: 'border',
      location: 'bottom',
      children: [
        {
          type: 'tab',
          id: '#0d85eed0-d3dc-4fa8-b723-5ef5d7f83a75',
          name: 'terminal',
          component: 'terminal',
          enableClose: false,
        },
      ],
    },
    {
      type: 'border',
      selected: 0,
      location: 'left',
      children: [
        {
          type: 'tab',
          id: '#24d20575-8059-41be-bacc-561a5d581528',
          name: 'workspace',
          component: 'workspace',
          enableClose: false,
          borderWidth: 250,
        },
      ],
    },
  ],
  layout: {
    type: 'row',
    id: '#e1c4da6b-19db-4d86-8bf9-12712063e2e5',
    weight: 100,
    children: [
      {
        type: 'tabset',
        id: 'layout-tabs',
        tabStripHeight: 40,
        enableDeleteWhenEmpty: false,
        children: [
          {
            type: 'tab',

            id: 'welcome',
            name: 'Welcome',
            component: 'welcome',
          },
        ],
        active: true,
      },
    ],
  },
};
export const skipLayoutToGetActiveNode = ['welcome'];
