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
  }, [independentList])

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
  }, [dependentList])
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
  }, [availableList])

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
    const nextAvail = new Map(availableList);
    const nextDep = new Map(dependentList);
    const nextIndep = new Map(independentList);

    availableList.forEach((value: boolean, key: string) => {
      if (value) {
        if (name === 'dependent') {
          // Enforce single dependent in polynomial
          nextDep.clear();
          nextDep.set(key, false);
        } else {
          // Only add if we don't already have an independent variable
          if (nextIndep.size === 0) {
            nextIndep.set(key, false);
          }
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
