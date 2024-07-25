import { useEffect, useState } from 'react';
import { useStartProStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { Actions } from 'flexlayout-react';
import { skipLayoutToGetActiveNode } from '@constants/dock-layout';
export interface IActiveNode {
  id?: string;
  name?: string;
  config: {
    bareType: string;
    id: number;
    isActive: number;
    lastModified: string;
    tabName: string;
    type: string;
  };
}

export const useActiveNode = (dependency: any[]): IActiveNode => {
  const [activeTab, setActivateTab] = useState<IActiveNode>({
    config: {
      bareType: '',
      id: 0,
      isActive: 0,
      lastModified: '',
      tabName: '',
      type: '',
    },
  });
  const { model } = useStartProStore(useShallow((state) => ({ model: state.model })));
  useEffect(() => {
    const activeTab: any = model.getActiveTabset()?.getSelectedNode()?.toJson();
    const isSkip = skipLayoutToGetActiveNode.includes(activeTab?.id);
    if (isSkip) {
      setActivateTab({
        id: undefined,
        config: {
          bareType: '',
          id: 0,
          isActive: 0,
          lastModified: '',
          tabName: '',
          type: '',
        },
      });
    } else {
      setActivateTab({
        id: activeTab?.id,
        config: activeTab?.config,
        name: activeTab?.name,
      });
    }
  }, [...dependency]);
  return activeTab;
};

interface INodeActions {
  selectTab: (tabToSelect: string) => void;
}
export const useNodeActions = (): INodeActions => {
  const { model } = useStartProStore(useShallow((state) => ({ model: state.model })));
  const selectTab = (tabToSelect: string): void => {
    model.doAction(Actions.selectTab(`${tabToSelect}`));
  };
  return {
    selectTab,
  };
};
