import { FC } from 'react';
import { makeStyles, tokens, Checkbox, Field, Input } from '@fluentui/react-components';
import { Modal, NoIdSelected, Fieldset } from '@libs';
import { IModal, useActiveNode } from '@hooks';
import { Model } from './model';
import { useShallow } from 'zustand/react/shallow';
import { useColumnsRowsCount } from '../../../../../table-render/use-column-count';
import { useLinearBayesian } from './use-bayesian-hook';
import { usePrepareAnalysis } from './use-anayse-hook';
import { useTranslation } from 'react-i18next';
import { useStartProStore } from '@store/main-store';

const useClasses = makeStyles({
	wrapper: {
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingHorizontalM,
		'& .details': {
			height: '53vh',
		},
	},
});

const BayesianComponent: FC<IModal> = ({ ...props }) => {
	const { t } = useTranslation('regLinearBayesian');
	const classes = useClasses();
	const { setReset } = useLinearBayesian(
		useShallow((state) => ({ setReset: state.setReset })),
	);
	const { id, config } = useActiveNode([props.open]);
	const { columns } = useColumnsRowsCount({ ...config, noRowCount: true });
	const { setBlockUI } = useStartProStore();

	const { executeAnalysis } = usePrepareAnalysis({
		config,
		columns,
		queueFor: t('title', { ns: 'regLinearBayesian' }) || 'Bayesian Linear Regression',
		queueType: 'regLinearBayesian',
	});

	const onCloseModal = (): void => {
		setReset();
		props.closeModal();
	};

	const onOkModal = (): void => {
		if (!id && id !== '') {
			props.closeModal();
			return;
		}
		executeAnalysis(id);
		props.closeModal();
		setBlockUI({ value: true, msg: 'processRequest', hideOk: true });
	};

	return (
		<Modal
			key={id}
   modalType="modal"
			{...props}
			cancelLabel={t('close', { ns: 'regLinearLeastSquare' })}
			okLabel={t('ok', { ns: 'regLinearLeastSquare' })}
			title={t('title', { ns: 'regLinearBayesian' }) || 'Bayesian Linear Regression'}
			size="medium"
			showCancel={!id || id === '' ? false : true}
			closeModal={onCloseModal}
			ok={{ onClick: onOkModal }}
		>
			<div className={classes.wrapper}>
				{!id || id === '' ? (
					<NoIdSelected />
				) : (
					<div>
						<Model />
						<BayesianParameters />
					</div>
				)}
			</div>
		</Modal>
	);
};

const BayesianParameters: FC = () => {
	const { t } = useTranslation('regLinearBayesian');
	const { constant_term, diffuse_prior, normal_gamma_prior, credibility, setBayesian } = useLinearBayesian(
		useShallow((state) => ({
			constant_term: state.bayesian.constant_term,
			diffuse_prior: state.bayesian.diffuse_prior,
			normal_gamma_prior: state.bayesian.normal_gamma_prior,
			credibility: state.bayesian.credibility,
			setBayesian: state.setBayesian,
		}))
	);

	return (
		<Fieldset>
			<Checkbox
				name="constant_term"
				label={t('constant_term') || 'Constant term'}
				checked={constant_term}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBayesian({ constant_term: e.target.checked })}
			/>
			<Checkbox
				name="diffuse_prior"
				label={t('diffuse_prior') || 'Diffuse prior'}
				checked={diffuse_prior}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBayesian({ diffuse_prior: e.target.checked })}
			/>
			<Checkbox
				name="normal_gamma_prior"
				label={t('normal_gamma_prior') || 'Normal-gamma prior'}
				checked={normal_gamma_prior}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBayesian({ normal_gamma_prior: e.target.checked })}
			/>
			<Field label={t('credibility') || 'Credibility (max 1)'}>
				<Input
					id="credibility-input"
					name="credibility"
					type="number"
					min="0"
					max="1"
					step="0.01"
					value={credibility}
					onChange={(e) => setBayesian({ credibility: e.target.value })}
					style={{ width: '100%' }}
					aria-label={t('credibility') || 'Credibility'}
				/>
			</Field>
		</Fieldset>
	);
};

export const Bayesian = BayesianComponent;
