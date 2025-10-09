import { create } from 'zustand';
import cloneDeep from 'lodash.clonedeep';

interface IPayload {
	[key: string]: any;
}

interface IModel {
	availableList: Map<string, boolean>;
	dependentList: Map<string, boolean>;
	independentList: Map<string, boolean>;
}

interface IBayesianParams {
	constant_term: boolean;
	diffuse_prior: boolean;
	normal_gamma_prior: boolean;
	credibility: string; // kept as string for controlled input, parse to number on submit
}

interface ILinearBayesianStore {
	model: IModel;
	bayesian: IBayesianParams;
	setModelBulk(payload: Map<string, boolean>, listName: keyof IModel): void;
	setModel: (payload: IPayload) => void;
	setBayesian: (payload: Partial<IBayesianParams>) => void;
	setReset: () => void;
}

const initValues = {
	model: {
		availableList: new Map<string, boolean>(),
		dependentList: new Map<string, boolean>(),
		independentList: new Map<string, boolean>(),
	},
	bayesian: {
		constant_term: true,
		diffuse_prior: true,
		normal_gamma_prior: false,
		credibility: '0.95',
	},
};

export const useLinearBayesian = create<ILinearBayesianStore>((set) => ({
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
	setBayesian(payload): void {
		set((state: any) => {
			const bayesian = state.bayesian;
			return { ...state, bayesian: { ...bayesian, ...payload } };
		});
	},
	setReset(): void {
		set(initValues);
	},
}));
