import { FC } from 'react';
import { Field, Input, Checkbox, Dropdown, Option } from '@fluentui/react-components';
import { Fieldset } from '@libs';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { usePolynomial } from './use-polynomial-hook';

export const Estimation: FC = () => {
  const { t } = useTranslation('regLinearPolynomial');
  const { confidence, degree, polynomialType, inference, setEstimate } = usePolynomial(
    useShallow((state) => ({
      confidence: state.estimate.confidence,
      degree: state.estimate.degree,
      polynomialType: state.estimate.polynomialType,
      inference: state.estimate.inference,
      setEstimate: state.setEstimate,
    })),
  );

  const handleConfidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEstimate({ confidence: e.target.value });
  };

  const handleDegreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEstimate({ degree: e.target.value });
  };

  const handlePolynomialTypeChange = (e: any, data: any) => {
    console.log('Polynomial type change event:', e);
    console.log('Polynomial type change data:', data);
    console.log('Setting polynomial type to:', data.optionValue);
    setEstimate({ polynomialType: data.optionValue as 'natural' | 'orthogonal' });
  };

  const handleInferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEstimate({ inference: e.target.checked });
  };

  return (
    <Fieldset title={t('estimation', { ns: 'regLinearPolynomial' })}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Field label={t('confidence', { ns: 'regLinearPolynomial' })}>
          <Input
            id="confidence-input"
            name="confidence"
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={confidence}
            onChange={handleConfidenceChange}
            style={{ width: '100%' }}
            aria-label={t('confidence', { ns: 'regLinearPolynomial' })}
          />
        </Field>

        <Field label={t('degree', { ns: 'regLinearPolynomial' })}>
          <Input
            id="degree-input"
            name="degree"
            type="number"
            min="1"
            max="5"
            step="1"
            value={degree}
            onChange={handleDegreeChange}
            style={{ width: '100%' }}
            aria-label={t('degree', { ns: 'regLinearPolynomial' })}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Recommended: 1-3 for most datasets. Higher degrees may cause errors with small datasets.
          </div>
        </Field>

        <Field label={t('polynomialType', { ns: 'regLinearPolynomial' })}>
          <Dropdown
            id="polynomial-type-dropdown"
            value={polynomialType}
            onOptionSelect={handlePolynomialTypeChange}
            style={{ width: '100%' }}
          >
            <Option value="natural">{t('natural', { ns: 'regLinearPolynomial' })}</Option>
            <Option value="orthogonal">{t('orthogonal', { ns: 'regLinearPolynomial' })}</Option>
          </Dropdown>
        </Field>

        <Checkbox
          name="inference"
          label={t('inference', { ns: 'regLinearPolynomial' })}
          checked={inference}
          onChange={handleInferenceChange}
        />
      </div>
    </Fieldset>
  );
};
