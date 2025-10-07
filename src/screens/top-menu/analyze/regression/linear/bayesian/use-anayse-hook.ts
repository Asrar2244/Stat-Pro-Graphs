import { useLinearBayesian } from './use-bayesian-hook';
import { useShallow } from 'zustand/react/shallow';
import { IActiveNode, useAnalyzeSave } from '@hooks';
import { useEffect } from 'react';
import { IColumn } from '../../../../../table-render/use-column-count';
import { EXCEL, API } from '@constants';
import { useStartProStore } from '@store/main-store';

interface IOutput {
	executeAnalysis: (id: string) => void;
}

export const usePrepareAnalysis = ({
	config,
	columns,
	queueFor,
	queueType,
}: IActiveNode & { columns: IColumn[]; queueFor: string; queueType: string }): IOutput => {
	const { setModel, model, bayesian } = useLinearBayesian(
		useShallow((state) => ({
			model: state.model,
			bayesian: state.bayesian,
			setModel: state.setModel,
		})),
	);
	const { execute } = useAnalyzeSave();
	const { setBlockUI } = useStartProStore();

	useEffect(() => {
		const columnMap = new Map<string, boolean>();
		columns.forEach((column) => {
			if (!model.availableList.has(column.columnId)) columnMap.set(column.columnId, false);
		});
		setModel({
			availableList: columnMap,
			independentList: new Map<string, boolean>(),
			dependentList: new Map<string, boolean>(),
		});
	}, [columns.length]);

	const executeAnalysis = async (id: string): Promise<void> => {
		const tableName = config.tabName;
		const dependentVars = Array.from(model.dependentList.keys());
		if (dependentVars.length !== 1) {
			setBlockUI({ value: true, msg: 'Please select exactly one dependent variable.' });
			return;
		}

		const parameters = {
			input_data_type: 'file',
			operation: 'regression',
			sheet_name: EXCEL,
			notification_id: '3',
			db_name: tableName,
			dependent_var_names: dependentVars,
			independent_var_names: Array.from(model.independentList.keys()),
			regressionType: 'linear',
			sub_type: 'bayesian',
			bayesianparameters: {
				constant_term: bayesian.constant_term ? 'True' : 'False',
				diffuse_prior: bayesian.diffuse_prior ? 'True' : 'False',
				normal_gamma_prior: bayesian.normal_gamma_prior ? 'True' : 'False',
				credibility: Math.min(1, Math.max(0, parseFloat(bayesian.credibility || '0.95'))),
			},
		} as any;

		await execute(
			config.tabName,
			parameters,
			{
				queueFor,
				url: `/api/${API.analysis}`,
				method: 'POST',
				queueType,
			},
			id,
		);
	};

	return { executeAnalysis };
};
