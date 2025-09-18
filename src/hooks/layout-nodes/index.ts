import { useEffect, useState } from 'react';
import { useStartProStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { Actions, DockLocation } from 'flexlayout-react';
import { skipLayoutToGetActiveNode } from '@constants/dock-layout';
import { ISelector } from 'src/screens/workspace/explorer';
import { CONFIGURATION_DB, DATA, OUTPUT } from '@constants/db';
import { updateDataProjectClose, updateOutputProjectClose } from '@backend/project';
import { Database } from '@utils/db';
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
    workspacePath: string;
    inputFileName: string;
    isEmptyDataView?: boolean;
    dataState?: 'draft' | 'published';
    dataName?: string;
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
      workspacePath: '',
      inputFileName: ''
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
          workspacePath: '',
          inputFileName: ''
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
  updateNodeAttributes: (nodeId: string, config: any) => void;
  selectTab: (tabToSelect: string) => void;
  openNewTab: (data: ISelector, projectId: number, type: string, t: any) => void;
  getOpenRecords: (data: ISelector, type: string) => any | undefined;
  closeActiveTab: () => void;
}
export const useNodeActions = (): INodeActions => {
  const { model, setBlockUI, setRenderLatestRun } = useStartProStore(
    useShallow((state) => ({
      model: state.model,
      setBlockUI: state.setBlockUI,
      setRenderLatestRun: state.setRenderLatestRun,
    })),
  );
  const selectTab = (tabToSelect: string): void => {
    model.doAction(Actions.selectTab(`${tabToSelect}`));
  };

  const getOpenRecords = (data: ISelector, type: string) => {
    const tabChildren = model.getNodeById('layout-tabs')?.getChildren();
    const record = tabChildren?.find((f) => f.getId() === `${type}-${data?.id}`);
    const nextIndex = tabChildren?.length ?? 1;
    return { record, nextIndex };
  };

  const closeActiveTab = () => {
    const activeTabId = model.getActiveTabset()?.getSelectedNode()?.getId();

    if (activeTabId) {
      const [type, id] = activeTabId.split('-');
      let query = '';
      switch (type) {
        case DATA:
          query = updateDataProjectClose;
          break;
        case OUTPUT:
          query = updateOutputProjectClose;
          break;
      }
      if (query === '') return;
      const db = new Database(CONFIGURATION_DB);
      db.executeQuery(query, [id])
        .then(() => {
          model.doAction(Actions.deleteTab(activeTabId));
        })
        .catch((error) => {
          setBlockUI({ value: true, msg: error.message });
        });
    }
  };

  const openNewTab = (data: ISelector, tabId: number, type: string, t: any) => {
    const { record, nextIndex: index } = getOpenRecords(data, type);

    if (record) {
      selectTab(record.getId());
      window.dispatchEvent(new Event('blur'));
      setTimeout(() => {
        setRenderLatestRun(true);
        window.dispatchEvent(new Event('focus'));
      }, 100);
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
            isEmptyDataView: data.isEmptyDataView,
            inputFileName: data.inputFileName
          },
        },
        'layout-tabs',
        DockLocation.CENTER,
        index,
        true,
      ),
    );
  };

  const updateNodeAttributes = (nodeId: string, config: any) => {
    model.doAction(Actions.updateNodeAttributes(nodeId, config));
  };

  return {
    selectTab,
    openNewTab,
    getOpenRecords,
    updateNodeAttributes,
    closeActiveTab,
  };
};
