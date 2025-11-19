import { create } from 'zustand';
import cloneDeep from 'lodash.clonedeep';

interface IPayload {
  [key: string]: any;
}
interface IModel {
  availableList: Map<string, boolean>;
  dependentList: Map<string, boolean>;
  independentList: Map<string, boolean>;
  includeConst: boolean;
  save: boolean;
  init: boolean;
}
interface IEstimate {
  confidence: string;
  tolerance: string;
  direction: string;
  maxStep: string;
  force: string;
  propEnter: string;
  propRemove: string;
  fStatisticEnter: string;
  fStatisticRemove: string;
}
interface ILinearLeastSquare {
  model: IModel;
  estimate: IEstimate;
  setModelBulk(payload: Map<string, boolean>, listName: string): void;
  setModel: (payload: IPayload) => void;
  setEstimate: (payload: IPayload) => void;
  setReset: () => void;
}
const initValues = {
  model: {
    availableList: new Map<string, boolean>(),
    dependentList: new Map<string, boolean>(),
    independentList: new Map<string, boolean>(),
    includeConst: true,
    save: false,
    init: false,
  },
  estimate: {
    confidence: '0.95',
    tolerance: '1e-012',
    direction: 'forward',
    maxStep: '10',
    force: '',
    propEnter: '0.05',
    propRemove: '0.10',
    fStatisticEnter: '0.05',
    fStatisticRemove: '0.10',
  },
  // removed options, predict, resampling
};
export const useLinearLeastSquares = create<ILinearLeastSquare>((set) => ({
  ...(cloneDeep(initValues)),
  setModel(payload): void {
    set((state: any) => {
      const model = state.model;
      return { ...state, model: { ...model, ...payload } };
    });
  },
  setModelBulk(payload, listName): void {
    set((state: any) => {
      return { ...state, model: { ...state.model, [listName]: payload } };
    });
  },

  setEstimate(payload): void {
    set((state: any) => {
      const estimate = state.estimate;
      return { ...state, estimate: { ...estimate, ...payload } };
    });
  },
  // removed setOptions, setPredict, setResampling
  setReset(): void {
    set(initValues);
  },
}));
