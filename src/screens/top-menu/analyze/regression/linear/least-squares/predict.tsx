import { ChangeEvent, FC, memo } from 'react';
import {
  makeStyles,
  tokens,
  shorthands,
  Dropdown,
  Checkbox,
  Option,
  Field,
  Input,
} from '@fluentui/react-components';
import { ITranslate, Fieldset } from '@libs';
import { useShallow } from 'zustand/react/shallow';
import { useLinearLeastSquares } from './use-squares-hook';
import { usePredictStyle } from './styles-hook/use-predict-style';

const PredictComponent: FC<ITranslate> = ({ t }) => {
  const classes = usePredictStyle();
  const { predict, setPredict } = useLinearLeastSquares(
    useShallow((state) => ({ predict: state.predict, setPredict: state.setPredict })),
  );
  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.tagName === 'checkbox' ? e.target.checked : e.target.value;
    setPredict({ [e.target.name]: value });
  };

  return (
    <div className={classes.predictLayout}>
      <div className={classes.predictWrapper}>
        <Fieldset>
          <Field label={''} className="align-checkbox">
            <Checkbox
              name="predictForNewObservation"
              value="predictForNewObservation"
              onChange={onChangeHandler}
              defaultChecked={predict.predictForNewObservation}
              label={t('predictForNewObservation', { ns: 'regLinearLeastSquare' })}
            />
          </Field>
          <Field label={''} className="align-checkbox">
            <Checkbox
              name="save"
              value="save"
              disabled
              defaultChecked={predict.save}
              onChange={onChangeHandler}
              label={t('save', { ns: 'regLinearLeastSquare' })}
            />
          </Field>
          <Field label={''} className="align-checkbox">
            <Dropdown
              name="savePrediction"
              defaultSelectedOptions={[predict.savePrediction]}
              defaultValue={predict.savePrediction}
              disabled
            >
              <Option value="Prediction">{t('prediction', { ns: 'regLinearLeastSquare' })}</Option>
            </Dropdown>
          </Field>
          <Field label={t('confidence', { ns: 'regLinearLeastSquare' })}>
            <Input
              name="confidence"
              type="number"
              defaultValue={predict.confidence}
              onChange={onChangeHandler}
            />
          </Field>
        </Fieldset>
      </div>
    </div>
  );
};
export const Predict = memo(PredictComponent);
