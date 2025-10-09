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
  sheetId: string
}

interface IBlockUIProps { value: boolean; msg: string; hideOk?: boolean }

interface IStartProStore {
  projects: {
    [projectName: string]: IProjectDetails;
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
  };
  setSelectedGraphRun: (id: number, title: string, subTitle?: string) => void;
  // Graph data cache for persistence
  graphDataCache: {
    [key: string]: any;
  };
  setGraphDataCache: (key: string, data: any) => void;
  getGraphDataCache: (key: string) => any;
  model: Model;
  setBulkProjects: (projects: { [projectName: string]: IProjectDetails }) => void;
  setNewProject: (key: string, value: string) => void;
  setBlockUI: (value: IBlockUIProps) => void;
  deleteProject: (projectName: string) => void;
}

export const useStartProStore = create<IStartProStore>((set, get) => ({
  projects: {},
  renderLatestRun: false,
  blockUI: { value: false, msg: "" },
  selectedGraphRun: { id: 0, title: '', subTitle: undefined },
  graphDataCache: {},
  setRenderLatestRun(x) {
    set(() => {
      return { renderLatestRun: x }
    })
  },
  setSelectedGraphRun(id: number, title: string, subTitle?: string) {
    set(() => {
      return { selectedGraphRun: { id, title, subTitle } }
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
  deleteProject(projectName): void {
    set((state) => {
      const updatedProjects = { ...state.projects };
      delete updatedProjects[projectName];
      return { projects: updatedProjects };
    });
  },
}));
