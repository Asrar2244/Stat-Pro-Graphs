import { useEffect, useState } from 'react';
import { useStartProStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { Actions, DockLocation } from 'flexlayout-react';
import { skipLayoutToGetActiveNode } from '@constants/dock-layout';
import { ISelector } from 'src/screens/workspace/explorer';
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
  openNewTab: (data: ISelector, projectId: number, type: string, t: any) => void;
  getOpenRecords: (data: ISelector, type: string,) => any | undefined
}
export const useNodeActions = (): INodeActions => {
  const { model } = useStartProStore(useShallow((state) => ({ model: state.model })));
  const selectTab = (tabToSelect: string): void => {
    model.doAction(Actions.selectTab(`${tabToSelect}`));
  };

  const getOpenRecords = (data: ISelector, type: string) => {
    const tabChildren = model.getNodeById('layout-tabs')?.getChildren();
    const record = tabChildren?.find((f) => f.getId() === `${type}-${data?.id}`);
    const nextIndex = tabChildren?.length ?? 1;
    return { record, nextIndex }
  }

  const openNewTab = (data: ISelector, tabId: number, type: string, t: any) => {

    const { record, nextIndex: index } = getOpenRecords(data, type)

    if (record) {
      selectTab(record.getId())
      return;
    }
    model.doAction(
      Actions.addNode(
        {
          type: 'tab',
          enableClose: true,
          name: data.projectName,
          id: `${type}-${tabId}`,
          component: `${type}-render`,
          config: {
            tabName: data.workspacePath,
            name: data.projectName,
            type: t(type.toLowerCase(), { ns: 'workspace' }),
            bareType: type,
            id: data.id,
            lastModified: data.modifiedDateTime,
            isActive: data.isActive,
            workspacePath: data.workspacePath,
          },
        },
        'layout-tabs',
        DockLocation.CENTER,
        index,
        true,
      ),
    );
  }
  return {
    selectTab,
    openNewTab,
    getOpenRecords
  };
};
