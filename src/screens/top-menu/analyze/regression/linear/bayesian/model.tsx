import { FC, MouseEvent, useEffect, useState } from 'react';
import { Button } from '@fluentui/react-components';
import { Fieldset, ListCheckboxWithSelectAll } from '@libs';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useLinearBayesian } from './use-bayesian-hook';
import { useModelStyle } from '../least-squares/styles-hook/use-model-style';
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight, MdOutlineRemove } from 'react-icons/md';
import { useStartProStore } from '@store/main-store';
import { generateKey } from '@utils/helper';

export const Model: FC = () => {
	const classes = useModelStyle();
	const { t } = useTranslation('regLinearBayesian');
	return (
		<div className={classes.modelLayout}>
			<div className={classes.modelWrapper}>
				<Fieldset title={t('dependent', { ns: 'regLinearLeastSquare' })}>
					<DependentListRender />
				</Fieldset>
				<Fieldset title={t('availableVar', { ns: 'regLinearLeastSquare' })}>
					<AvailableListRender />
				</Fieldset>
				<Fieldset title={t('independent', { ns: 'regLinearLeastSquare' })}>
					<IndependentListRender />
				</Fieldset>
			</div>
		</div>
	);
};

const IndependentListRender: FC = () => {
	const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);
	const { t } = useTranslation('regLinearLeastSquare');
	const { availableList, independentList, setModelBulk } = useLinearBayesian(
		useShallow((state) => ({
			availableList: state.model.availableList,
			independentList: state.model.independentList,
			setModelBulk: state.setModelBulk,
		})),
	);
	const [propKey, setPropKey] = useState(generateKey(independentList));
	useEffect(() => { setPropKey(generateKey(independentList)); }, [...independentList.values()]);

	const onRemoveHandler = (): void => {
		independentList.forEach((value: boolean, name: string) => {
			if (value) {
				availableList.set(name, false);
				independentList.delete(name);
			}
		});
		setModelBulk(availableList, 'availableList');
		setModelBulk(independentList, 'independentList');
		if (independentList.size === 0) {
			setSelectAll(false);
		}
	};
	return (
		<div className="section-available">
			<ListCheckboxWithSelectAll
				listSize={independentList.size}
				list={independentList}
				selectAllText={t('selectAll')}
				selectValue={selectAll}
				requiredSelectAll
				onSelectAllChanged={setSelectAll}
				setModelBulk={setModelBulk}
				listName='independentList'
				propKey={propKey}
			/>
			<Button icon={<MdOutlineRemove />} className="remove-button" name="independent" onClick={onRemoveHandler}>
				{t('removeFromIndependent', { ns: 'regLinearLeastSquare' })}
			</Button>
		</div>
	);
};

const DependentListRender: FC = () => {
	const [, setSelectAll] = useState<boolean | string | undefined>(false);
	const { t } = useTranslation('regLinearLeastSquare');
	const { availableList, dependentList, setModelBulk } = useLinearBayesian(
		useShallow((state) => ({
			availableList: state.model.availableList,
			dependentList: state.model.dependentList,
			setModelBulk: state.setModelBulk,
		})),
	);
	const [propKey, setPropKey] = useState(generateKey(dependentList));
	useEffect(() => { setPropKey(generateKey(dependentList)); }, [...dependentList.values()]);

	const onRemoveHandler = (): void => {
		dependentList.forEach((value: boolean, name: string) => {
			if (value) {
				availableList.set(name, false);
				dependentList.delete(name);
			}
		});
		setModelBulk(availableList, 'availableList');
		setModelBulk(dependentList, 'dependentList');
		if (dependentList.size === 0) setSelectAll(false);
	};
	return (
		<div className="section-available">
			<ListCheckboxWithSelectAll
				listSize={dependentList.size}
				list={dependentList}
				selectAllText={t('selectAll')}
				selectValue={false}
				requiredSelectAll
				onSelectAllChanged={setSelectAll}
				propKey={propKey}
				setModelBulk={setModelBulk}
				listName='dependentList'
			/>
			<Button icon={<MdOutlineRemove />} className="remove-button" name="dependent" onClick={onRemoveHandler}>
				{t('removeFromDependent', { ns: 'regLinearLeastSquare' })}
			</Button>
		</div>
	);
};

const AvailableListRender: FC = () => {
	const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);
	const { t } = useTranslation('regLinearLeastSquare');
	const { availableList, dependentList, independentList, setModelBulk } = useLinearBayesian(
		useShallow((state) => ({
			availableList: state.model.availableList,
			dependentList: state.model.dependentList,
			independentList: state.model.independentList,
			setModelBulk: state.setModelBulk,
		})),
	);
	const [propKey, setPropKey] = useState(generateKey(availableList));
	const { setBlockUI } = useStartProStore();
	useEffect(() => { setPropKey(generateKey(availableList)); }, [...availableList.values()]);

	const onSendHandler = (e: MouseEvent<HTMLButtonElement>): void => {
		const name = (e.currentTarget as HTMLButtonElement).dataset.name;
		if (name === 'dependent') {
			const selected = Array.from(availableList.entries()).filter(([, v]) => v).map(([k]) => k);
			if (selected.length > 1) {
				setBlockUI({ value: true, msg: 'Please select exactly one dependent variable.' });
				return;
			}
		}
		availableList.forEach((value: boolean, key: string) => {
			if (value) {
				if (name === 'dependent') {
					dependentList.clear();
					dependentList.set(key, true);
				} else {
					independentList.set(key, false);
				}
				availableList.delete(key);
			}
		});
		setModelBulk(availableList, 'availableList');
		if (availableList.size === 0) setSelectAll(false);
	};
	return (
		<div className="section-available">
			<ListCheckboxWithSelectAll
				listSize={availableList.size}
				list={availableList}
				selectAllText={t('selectAll')}
				selectValue={selectAll}
				requiredSelectAll
				onSelectAllChanged={setSelectAll}
				propKey={propKey}
				setModelBulk={setModelBulk}
				listName='availableList'
			/>
			<div className="send-buttons">
				<Button icon={<MdKeyboardDoubleArrowLeft />} data-name="dependent" onClick={onSendHandler} disabled={dependentList.size >= 1}>
					{t('sendToDependent')}
				</Button>
				<Button icon={<MdKeyboardDoubleArrowRight />} iconPosition="after" data-name="independent" onClick={onSendHandler}>
					{t('sendToIndependent')}
				</Button>
			</div>
		</div>
	);
};
