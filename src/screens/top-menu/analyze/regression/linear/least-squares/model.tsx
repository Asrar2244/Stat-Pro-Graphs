import { ChangeEvent, FC, MouseEvent, useState } from 'react';
import { Checkbox, Button } from '@fluentui/react-components';
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdOutlineRemove,
} from 'react-icons/md';
import { Fieldset } from '@libs';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useLinearLeastSquares } from './use-squares-hook';
import { useModelStyle } from './styles-hook/use-model-style';
import { ListCheckboxWithSelectAll } from '@libs';
export const Model: FC = () => {
  const classes = useModelStyle();
  const { t } = useTranslation('regLinearLeastSquare');
  const { includeConst, save, setModel } = useLinearLeastSquares(
    useShallow((state) => ({
      includeConst: state.model.includeConst,
      save: state.model.save,
      setModel: state.setModel,
    })),
  );
  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    setModel({ [e.target.name]: e.target.checked });
  };

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
      <Fieldset>
        <div>
          <Checkbox
            name="includeConst"
            label={t('includeConst', { ns: 'regLinearLeastSquare' })}
            checked={includeConst}
            onChange={onChangeHandler}
          />
        </div>
        <div>
          <Checkbox
            name="save"
            label={t('save', { ns: 'regLinearLeastSquare' })}
            checked={save}
            onChange={onChangeHandler}
          />
        </div>
      </Fieldset>
    </div>
  );
};
const IndependentListRender: FC = () => {
  const [selectAll, setSelectAll] = useState<boolean | undefined>(false);

  const { t } = useTranslation('regLinearLeastSquare');
  const { availableList, independentList, setModelBulk } = useLinearLeastSquares(
    useShallow((state) => ({
      availableList: state.model.availableList,
      independentList: state.model.independentList,
      setModelBulk: state.setModelBulk,
    })),
  );

  const onRemoveHandler = (): void => {
    independentList.forEach((value: boolean, name: string) => {
      if (value) {
        availableList.set(name, false);
        independentList.delete(name);
      }
    });
    setModelBulk(availableList, 'availableList');
    setModelBulk(independentList, 'independentList');
    if (independentList.size === 0) setSelectAll(false);
  };
  return (
    <div className="section-available">
      <ListCheckboxWithSelectAll
        listSize={independentList.size}
        list={independentList}
        selectAllText={t('selectAll')}
        selectValue={selectAll}
        requiredSelectAll
      />

      <Button
        icon={<MdOutlineRemove />}
        className="remove-button"
        name="independent"
        onClick={onRemoveHandler}
      >
        {t('removeFromIndependent', { ns: 'regLinearLeastSquare' })}
      </Button>
    </div>
  );
};
const DependentListRender: FC = () => {
  const [selectAll, setSelectAll] = useState<boolean | undefined>(false);

  const { t } = useTranslation('regLinearLeastSquare');
  const { availableList, dependentList, setModelBulk } = useLinearLeastSquares(
    useShallow((state) => ({
      availableList: state.model.availableList,
      dependentList: state.model.dependentList,
      setModelBulk: state.setModelBulk,
    })),
  );

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
        selectValue={selectAll}
        requiredSelectAll
      />

      <Button
        icon={<MdOutlineRemove />}
        className="remove-button"
        name="dependent"
        onClick={onRemoveHandler}
      >
        {t('removeFromDependent', { ns: 'regLinearLeastSquare' })}
      </Button>
    </div>
  );
};

const AvailableListRender: FC = () => {
  const [selectAll, setSelectAll] = useState<boolean | undefined>(false);

  const { t } = useTranslation('regLinearLeastSquare');
  const { availableList, dependentList, independentList, setModelBulk } = useLinearLeastSquares(
    useShallow((state) => ({
      availableList: state.model.availableList,
      dependentList: state.model.dependentList,
      independentList: state.model.independentList,
      setModelBulk: state.setModelBulk,
    })),
  );

  const onSendHandler = (e: MouseEvent<HTMLButtonElement>): void => {
    const { name } = e.target as any;
    availableList.forEach((value: boolean, key: string) => {
      if (value) {
        if (name === 'dependent') {
          dependentList.set(key, false);
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
      />

      <div className="send-buttons">
        <Button icon={<MdKeyboardDoubleArrowLeft />} name="dependent" onClick={onSendHandler}>
          {t('sendToDependent')}
        </Button>

        <Button
          icon={<MdKeyboardDoubleArrowRight />}
          iconPosition="after"
          name="independent"
          onClick={onSendHandler}
        >
          {t('sendToIndependent')}
        </Button>
      </div>
    </div>
  );
};
