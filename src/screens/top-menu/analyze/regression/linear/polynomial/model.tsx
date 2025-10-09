import { ChangeEvent, FC, MouseEvent, useEffect, useState } from 'react';
import { Checkbox, Button } from '@fluentui/react-components';
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdOutlineRemove,
} from 'react-icons/md';
import { Fieldset } from '@libs';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { usePolynomial } from './use-polynomial-hook';
import { useModelStyle } from '../forward-stepwise/styles-hook/use-model-style';
import { useStartProStore } from '@store/main-store';
import { ListCheckboxWithSelectAll } from '@libs';
import { generateKey } from '@utils/helper';

export const Model: FC = () => {
  const classes = useModelStyle();
  const { t } = useTranslation('regLinearPolynomial');
  const { includeConst, setModel } = usePolynomial(
    useShallow((state) => ({
      includeConst: state.model.includeConst,
      setModel: state.setModel,
    })),
  );
  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    setModel({ [e.target.name]: e.target.checked });
  };

  return (
    <div className={classes.modelLayout}>
      <div className={classes.modelWrapper}>
        <Fieldset title={t('dependent', { ns: 'regLinearPolynomial' })}>
          <DependentListRender />
        </Fieldset>
        <Fieldset title={t('availableVar', { ns: 'regLinearPolynomial' })}>
          <AvailableListRender />
        </Fieldset>
        <Fieldset title={t('independent', { ns: 'regLinearPolynomial' })}>
          <IndependentListRender />
        </Fieldset>
      </div>
      <Fieldset>
        <div>
          <Checkbox
            name="includeConst"
            label={t('includeConst', { ns: 'regLinearPolynomial' })}
            checked={includeConst}
            onChange={onChangeHandler}
          />
        </div>
      </Fieldset>
    </div>
  );
};

const IndependentListRender: FC = () => {
  const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);
  const { t } = useTranslation('regLinearPolynomial');
  const { availableList, independentList, setModelBulk } = usePolynomial(
    useShallow((state) => ({
      availableList: state.model.availableList,
      independentList: state.model.independentList,
      setModelBulk: state.setModelBulk,
    })),
  );
  const [propKey, setPropKey] = useState(generateKey(independentList));

  useEffect(() => {
    setPropKey(generateKey(independentList))
  }, [...independentList.values()])

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

      <Button
        icon={<MdOutlineRemove />}
        className="remove-button"
        name="independent"
        onClick={onRemoveHandler}
      >
        {t('removeFromIndependent', { ns: 'regLinearPolynomial' })}
      </Button>
    </div>
  );
};
const DependentListRender: FC = () => {
  const [, setSelectAll] = useState<boolean | string | undefined>(false);

  const { t } = useTranslation('regLinearPolynomial');
  const { availableList, dependentList, setModelBulk } = usePolynomial(
    useShallow((state) => ({
      availableList: state.model.availableList,
      dependentList: state.model.dependentList,
      setModelBulk: state.setModelBulk,
    })),
  );
  const [propKey, setPropKey] = useState(generateKey(dependentList))

  useEffect(() => {
    setPropKey(generateKey(dependentList))
  }, [...dependentList.values()])
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

      <Button
        icon={<MdOutlineRemove />}
        className="remove-button"
        name="dependent"
        onClick={onRemoveHandler}
      >
        {t('removeFromDependent', { ns: 'regLinearPolynomial' })}
      </Button>
    </div>
  );
};

const AvailableListRender: FC = () => {
  const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);
  const { t } = useTranslation('regLinearPolynomial');
  const { availableList, dependentList, independentList, setModelBulk } = usePolynomial(
    useShallow((state) => ({
      availableList: state.model.availableList,
      dependentList: state.model.dependentList,
      independentList: state.model.independentList,
      setModelBulk: state.setModelBulk,
    })),
  );
  const [propKey, setPropKey] = useState(generateKey(availableList))
  const { setBlockUI } = useStartProStore();

  useEffect(() => {
    setPropKey(generateKey(availableList))
  }, [...availableList.values()])

  const onSendHandler = (e: MouseEvent<HTMLButtonElement>): void => {
    const name = (e.currentTarget as HTMLButtonElement).dataset.name;
    // Check if trying to add independent variable when one already exists
    if (name === 'independent' && independentList.size >= 1) {
      setBlockUI({ value: true, msg: 'Polynomial regression allows only one independent variable. Please remove the existing one first.' });
      return;
    }

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
          // Enforce single dependent in polynomial
          dependentList.clear();
          dependentList.set(key, true);
        } else {
          // Only add if we don't already have an independent variable
          if (independentList.size === 0) {
            independentList.set(key, true);
          }
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

        <Button
          icon={<MdKeyboardDoubleArrowRight />}
          iconPosition="after"
          data-name="independent"
          onClick={onSendHandler}
        >
          {t('sendToIndependent')}
        </Button>
      </div>
    </div>
  );
};
