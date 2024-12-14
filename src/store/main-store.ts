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
}

interface IStartProStore {
  projects: {
    [projectName: string]: IProjectDetails;
  };
  newProject?: {
    [key: string]: any;
  };
  model: Model;
  setBulkProjects: (projects: { [projectName: string]: IProjectDetails }) => void;
  setNewProject: (key: string, value: string) => void;
}

export const useStartProStore = create<IStartProStore>((set) => ({
  projects: {},
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
