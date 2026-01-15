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
	useEffect(() => { setPropKey(generateKey(independentList)); }, [independentList]);

	const onRemoveHandler = (): void => {
		const nextAvail = new Map(availableList);
		const nextIndep = new Map(independentList);
		independentList.forEach((value: boolean, name: string) => {
			if (value) {
				nextAvail.set(name, false);
				nextIndep.delete(name);
			}
		});
		setModelBulk(nextAvail, 'availableList');
		setModelBulk(nextIndep, 'independentList');
		if (nextIndep.size === 0) {
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
	useEffect(() => { setPropKey(generateKey(dependentList)); }, [dependentList]);

	const onRemoveHandler = (): void => {
		const nextAvail = new Map(availableList);
		const nextDep = new Map(dependentList);
		dependentList.forEach((value: boolean, name: string) => {
			if (value) {
				nextAvail.set(name, false);
				nextDep.delete(name);
			}
		});
		setModelBulk(nextAvail, 'availableList');
		setModelBulk(nextDep, 'dependentList');
		if (nextDep.size === 0) setSelectAll(false);
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
	useEffect(() => { setPropKey(generateKey(availableList)); }, [availableList]);

	const onSendHandler = (e: MouseEvent<HTMLButtonElement>): void => {
		const name = (e.currentTarget as HTMLButtonElement).dataset.name;
		if (name === 'dependent') {
			const selected = Array.from(availableList.entries()).filter(([, v]) => v).map(([k]) => k);
			if (selected.length > 1) {
				setBlockUI({ value: true, msg: 'Please select exactly one dependent variable.' });
				return;
			}
		}
		const nextAvail = new Map(availableList);
		const nextDep = new Map(dependentList);
		const nextIndep = new Map(independentList);

		availableList.forEach((value: boolean, key: string) => {
			if (value) {
				if (name === 'dependent') {
					nextDep.clear();
					nextDep.set(key, false);
				} else {
					nextIndep.set(key, false);
				}
				nextAvail.delete(key);
			}
		});
		setModelBulk(nextAvail, 'availableList');
		if (name === 'dependent') {
			setModelBulk(nextDep, 'dependentList');
		} else {
			setModelBulk(nextIndep, 'independentList');
		}
		if (nextAvail.size === 0) setSelectAll(false);
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
