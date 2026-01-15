import { create } from 'zustand';
import { Model } from 'flexlayout-react';
import { initialDocLayout } from '@constants';
export interface IProjectDetails {
  fileSize: string;
  isOpenedData: number;
  isOpenedOutput: number;
  isOpenedGraphs?: number;
  isActive: number;
  createdDateTime: string;
  modifiedDateTime: string;
  workspacePath: string;
  id: string;
  inputFileName: string;
  projectName: string;
  sheetId: string;
  isExternal: number;
}

interface IBlockUIProps { value: boolean; msg: string; hideOk?: boolean }

interface IStartProStore {
  projects: {
    [projectId: string]: IProjectDetails; // CRITICAL: Key by ID to prevent name-based collapsing
  };
  blockUI: IBlockUIProps;
  newProject?: {
    [key: string]: any;
  };
  renderLatestRun: boolean;
  setRenderLatestRun: (x: boolean) => void;
  // Graph run state for persistence across tabs
  selectedGraphRun: {
    id: number;
    title: string;
    subTitle?: string;
    config?: any;
  };
  setSelectedGraphRun: (id: number, title: string, subTitle?: string, config?: any) => void;
  // Graph data cache for persistence
  graphDataCache: {
    [key: string]: any;
  };
  setGraphDataCache: (key: string, data: any) => void;
  getGraphDataCache: (key: string) => any;
  model: Model;
  setBulkProjects: (projects: { [projectId: string]: IProjectDetails }) => void;
  setNewProject: (key: string, value: string) => void;
  setBlockUI: (value: IBlockUIProps) => void;
  deleteProject: (projectId: string) => void;
  globalSheetSelection: {
    open: boolean;
    sheetNames: string[];
    onConfirm: (sheetName: string) => void;
    onCancel: () => void;
  };
  setGlobalSheetSelection: (config: {
    open: boolean;
    sheetNames: string[];
    onConfirm: (sheetName: string) => void;
    onCancel: () => void;
  }) => void;
}

export const useStartProStore = create<IStartProStore>((set, get) => ({
  projects: {},
  renderLatestRun: false,
  blockUI: { value: false, msg: "" },
  selectedGraphRun: { id: 0, title: '', subTitle: undefined },
  graphDataCache: {},
  globalSheetSelection: {
    open: false,
    sheetNames: [],
    onConfirm: () => { },
    onCancel: () => { },
  },
  setGlobalSheetSelection(config) {
    set({ globalSheetSelection: config });
  },
  setRenderLatestRun(x) {
    set(() => {
      return { renderLatestRun: x }
    })
  },
  setSelectedGraphRun(id: number, title: string, subTitle?: string, config?: any) {
    set(() => {
      return { selectedGraphRun: { id, title, subTitle, config } }
    })
  },
  setGraphDataCache(key: string, data: any) {
    set((state) => ({
      graphDataCache: { ...state.graphDataCache, [key]: data }
    }))
  },
  getGraphDataCache(key: string) {
    return get().graphDataCache[key];
  },
  setBlockUI(value: IBlockUIProps): void {
    set(() => {
      return { blockUI: value }
    })
  },
  model: Model.fromJson(initialDocLayout),
  setBulkProjects(projects): void {
    set(() => {
      return { projects: { ...projects } };
    });
  },
  setNewProject(key, value): void {
    set((state: any) => {
      const newPro = state?.newProject ?? {};
      return { newProject: { ...newPro, [key]: value } };
    });
  },
  deleteProject(projectId): void {
    set((state) => {
      const updatedProjects = { ...state.projects };
      delete updatedProjects[projectId];
      return { projects: updatedProjects };
    });
  },
}));
