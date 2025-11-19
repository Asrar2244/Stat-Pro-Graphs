import { ChangeEvent, FC, memo } from 'react';
import { Checkbox } from '@fluentui/react-components';
import { ITranslate, Fieldset } from '@libs';
import { useShallow } from 'zustand/react/shallow';
import { useLinearLeastSquares } from './use-squares-hook';
import { useOptionsStyle } from './styles-hook/use-options-style';

const OptionsComponent: FC<ITranslate> = ({ t }) => {
  const classes = useOptionsStyle();
  const { options, setOptions } = useLinearLeastSquares(
    useShallow((state) => ({ options: state.options, setOptions: state.setOptions })),
  );
  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    setOptions({ [e.target.name]: e.target.checked });
  };
  return (
    <div className={classes.optionsLayout}>
      <div className={classes.optionsWrapper}>
        <Fieldset title={t('normalityTest', { ns: 'regLinearLeastSquare' })}>
          <div className="normality">
            <Checkbox
              name="kolmogorovSmirnov"
              value="kolmogorovSmirnov"
              onChange={onChangeHandler}
              defaultChecked={options.kolmogorovSmirnov}
              label={t('kolmogorovSmirnov', { ns: 'regLinearLeastSquare' })}
            />
            <Checkbox
              name="shapiroWilk"
              value="shapiroWilk"
              onChange={onChangeHandler}
              defaultChecked={options.shapiroWilk}
              label={t('shapiroWilk', { ns: 'regLinearLeastSquare' })}
            />
            <Checkbox
              name="andersonDArling"
              value="andersonDArling"
              onChange={onChangeHandler}
              defaultChecked={options.andersonDArling}
              label={t('andersonDArling', { ns: 'regLinearLeastSquare' })}
            />
          </div>
        </Fieldset>
      </div>
    </div>
  );
};
export const Options = memo(OptionsComponent);
