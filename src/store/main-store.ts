import { create } from 'zustand';
import { Model } from 'flexlayout-react';
import { initialDocLayout } from '@constants';
export interface IProjectDetails {
  fileSize: string;
  isOpenedData: number;
  isOpenedOutput: number;
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
  model: Model;
  setBulkProjects: (projects: { [projectName: string]: IProjectDetails }) => void;
  setNewProject: (key: string, value: string) => void;
  setBlockUI: (value: IBlockUIProps) => void
}

export const useStartProStore = create<IStartProStore>((set) => ({
  projects: {},
  blockUI: { value: false, msg: "" },
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
}));
