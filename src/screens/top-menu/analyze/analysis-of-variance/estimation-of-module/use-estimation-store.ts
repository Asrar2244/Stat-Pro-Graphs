import { create } from 'zustand';

interface IPayload {
  [key: string]: any;
}
export interface IList {
  [key: string]: boolean;
}
interface IEstimateModel {
  model: IModel;
  setModel: (payload: IPayload) => void;
  resetModule: () => void;
}
interface IModel {
  availableList: IList;
  dependentList: IList;
  factorList: IList;
  covariateList: IList;
  coding: 'effect' | 'dummy';
  save: boolean;
  saveDropdown: string;
  saveLocation: string;
}

const initValues: Omit<IEstimateModel, 'setModel' | 'resetModule'> = {
  model: {
    availableList: {},
    dependentList: {},
    factorList: {},
    covariateList: {},
    coding: 'effect',
    save: false,
    saveDropdown: 'residuals',
    saveLocation: '',
  },
};

export const useEstimateModel = create<IEstimateModel>((set) => ({
  ...initValues,
  setModel(payload: IPayload): void {
    set((state) => ({
      ...state,
      model: {
        ...state.model,
        ...payload,
      },
    }));
  },
  resetModule(): void {
    set((state) => {
      return {
        ...state,
        ...initValues,
      };
    });
  },
}));
