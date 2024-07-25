import { ChangeEvent, FC, memo } from 'react';
import { Dropdown, Checkbox, Option, Field, Input } from '@fluentui/react-components';
import { ITranslate, Fieldset } from '@libs';
import { useShallow } from 'zustand/react/shallow';
import { useLinearLeastSquares } from './use-squares-hook';
import { useResamplingStyle } from './styles-hook/use-resampling-style';

const ResamplingComponent: FC<ITranslate> = ({ t }) => {
  const classes = useResamplingStyle();
  const { resampling, setResampling } = useLinearLeastSquares(
    useShallow((state) => ({ resampling: state.resampling, setResampling: state.setResampling })),
  );
  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.tagName === 'checkbox' ? e.target.checked : e.target.value;
    setResampling({ [e.target.name]: value });
  };
  return (
    <div className={classes.resamplingLayout}>
      <Checkbox
        value="performResampling"
        label={t('performResampling', { ns: 'regLinearLeastSquare' })}
        name="performResampling"
        defaultChecked={resampling.performResampling}
        onChange={onChangeHandler}
      />
      <div className={classes.resamplingWrapper}>
        <Fieldset disabled>
          <Field label={t('method', { ns: 'regLinearLeastSquare' })}>
            <Dropdown
              name="method"
              defaultSelectedOptions={[resampling.method]}
              defaultValue={resampling.method}
            >
              <Option value="Bootstrap">{t('bootstrap', { ns: 'regLinearLeastSquare' })}</Option>
            </Dropdown>
          </Field>
          <Field label={t('bootstrap', { ns: 'regLinearLeastSquare' })}>
            <Dropdown
              name="bootstrap"
              defaultSelectedOptions={[resampling.bootstrap]}
              defaultValue={resampling.bootstrap}
            >
              <Option value="Cases">{t('cases', { ns: 'regLinearLeastSquare' })}</Option>
            </Dropdown>
          </Field>
          <Field label={t('noOfSamples', { ns: 'regLinearLeastSquare' })}>
            <Input
              name="noOfSamples"
              type="number"
              onChange={onChangeHandler}
              defaultValue={resampling.noOfSamples}
            />
          </Field>
          <Field label={t('sampleSize', { ns: 'regLinearLeastSquare' })}>
            <Input
              name="sampleSize"
              onChange={onChangeHandler}
              type="number"
              defaultValue={resampling.sampleSize}
            />
          </Field>
          <Field label={t('randomSeed', { ns: 'regLinearLeastSquare' })}>
            <Input
              name="randomSeed"
              onChange={onChangeHandler}
              type="number"
              defaultValue={resampling.randomSeed}
            />
          </Field>
          <Field label={t('confidence', { ns: 'regLinearLeastSquare' })}>
            <Input
              name="confidence"
              onChange={onChangeHandler}
              type="number"
              defaultValue={resampling.confidence}
            />
          </Field>
        </Fieldset>
      </div>
    </div>
  );
};
export const Resampling = memo(ResamplingComponent);
