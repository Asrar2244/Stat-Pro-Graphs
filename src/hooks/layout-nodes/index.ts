import { useEffect, useState } from 'react';
import { useStartProStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { Actions, DockLocation, TabNode } from 'flexlayout-react';
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

  // Function to update active tab from model
  const updateActiveTab = () => {
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
  };

  useEffect(() => {
    updateActiveTab();
  }, [...dependency]);

  // CRITICAL: Also check for config changes periodically to detect tabName updates after save
  // This ensures that when config.tabName changes (e.g., after EmptyDataView save),
  // useActiveNode will return the updated config, which will trigger useColumnsRowsCount to refresh
  useEffect(() => {
    // Poll every 500ms to check for tab switches or config changes
    // This is a robust fallback since FlexLayout model actions are hard to intercept globally
    const intervalId = setInterval(() => {
      const currentTabNode = model.getActiveTabset()?.getSelectedNode();
      if (!currentTabNode) return;

      const currentTab: any = currentTabNode.toJson();
      const currentTabName = currentTab?.config?.tabName;
      const currentId = currentTab?.id;

      // Only update if tabName or id changed (prevents unnecessary updates)
      // Update if:
      // 1. The selected tab ID changed (user switched tabs)
      // 2. The tabName changed (e.g., after save, database path updated)
      if (currentId !== activeTab.id || currentTabName !== activeTab.config.tabName) {
        updateActiveTab();
      }
    }, 500); // Check every 500ms for responsiveness

    return () => clearInterval(intervalId);
  }, [model, activeTab.id, activeTab.config.tabName]);

  return activeTab;
};

interface INodeActions {
  updateNodeAttributes: (nodeId: string, config: any) => void;
  selectTab: (tabToSelect: string) => void;
  openNewTab: (data: ISelector, projectId: number, type: string, t: any) => void;
  getOpenRecords: (data: ISelector, type: string) => any | undefined;
  closeActiveTab: () => void;
  closeTabsByProjectId: (projectId: number | string) => void;
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
    let record: any = undefined;
    model.visitNodes((node) => {
      if (node.getType() === 'tab') {
        const idMatches = node.getId() === `${type}-${data?.id}`;
        if (idMatches) {
          record = node;
          return;
        }

        const config = (node as TabNode).getConfig();
        if (config?.bareType === type && config?.id?.toString() === data?.id?.toString()) {
          record = node;
          return;
        }
      }
    });

    // For index/count, we still look at 'layout-tabs' as a reference or use a global count
    const tabChildren = model.getNodeById('layout-tabs')?.getChildren();
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

  const closeTabsByProjectId = (projectId: number | string) => {
    const tabsToDelete: string[] = [];

    // Visit all nodes in the model to find matching tabs
    model.visitNodes((node) => {
      if (node.getType() === 'tab') {
        const id = node.getId();
        const config = (node as TabNode).getConfig();

        if (id.endsWith(`-${projectId}`) || config?.id?.toString() === projectId.toString()) {
          tabsToDelete.push(id);
        }
      }
    });

    // Delete all found tabs
    tabsToDelete.forEach((id) => {
      model.doAction(Actions.deleteTab(id));
    });
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
            type: (data as any).customTitle || t(type.toLowerCase(), { ns: 'workspace' }),
            bareType: type,
            id: data.id,
            lastModified: data.modifiedDateTime,
            isActive: data.isActive,
            workspacePath: data.workspacePath,
            isEmptyDataView: data.isEmptyDataView,
            inputFileName: data.inputFileName,
            dataState: (data as any).dataState,
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
    closeTabsByProjectId,
  };
};
