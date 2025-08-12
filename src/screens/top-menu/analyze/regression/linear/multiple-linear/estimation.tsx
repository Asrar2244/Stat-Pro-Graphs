import { ChangeEvent, FC } from 'react';
import { Input } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { Fieldset } from '@libs';
import { useMultipleLinear } from './use-multiple-linear-hook';

export const Estimation: FC = () => {
  const { t } = useTranslation('regLinearMultipleLinear');
  const { estimate, setEstimate } = useMultipleLinear(
    useShallow((state) => ({
      estimate: state.estimate,
      setEstimate: state.setEstimate,
    })),
  );

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    setEstimate({ [e.target.name]: e.target.value });
  };

  return (
    <Fieldset title={t('estimation', { ns: 'regLinearMultipleLinear' })}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Field label={t('confidence_level', { ns: 'regLinearMultipleLinear' })}>
          <Input
            name="confidence"
            value={estimate.confidence}
            onChange={onChangeHandler}
            placeholder="0.95"
          />
        </Field>

        <Field label={t('vif_threshold', { ns: 'regLinearMultipleLinear' })}>
          <Input
            name="vifThreshold"
            value={estimate.vifThreshold}
            onChange={onChangeHandler}
            placeholder="5.0"
          />
        </Field>
      </div>
    </Fieldset>
  );
};

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

const Field: FC<FieldProps> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label style={{ fontWeight: 'bold' }}>{label}</label>
    {children}
  </div>
);