import { create } from 'zustand';

export interface IList {
  [key: string]: boolean;
}
interface IPayload {
  [key: string]: any;
}
interface IRidge {
  availableList: IList;
  dependentList: IList;
  independentList: IList;
  lambdaRangeOfValues: boolean;
  lambdaMinimum: number;
  lambdaMaximum: number;
  lambdaIncrement: number;
  lambdaIndividualValues: number;
  saveCoefficient: boolean;
  lambdaIndividual: boolean;
  setRidge: (payload: IPayload) => void;
}

const initialValues = {
  availableList: {},
  dependentList: {},
  independentList: {},
  lambdaMinimum: 0,
  lambdaMaximum: 0,
  lambdaIncrement: 0,
  lambdaIndividualValues: 0,
  lambdaRangeOfValues: false,
  saveCoefficient: false,
  lambdaIndividual: false,
};

export const useRidge = create<IRidge>((set) => ({
  ...initialValues,
  setRidge(payload): void {
    set((state) => ({ ...state, ...payload }));
  },
}));
