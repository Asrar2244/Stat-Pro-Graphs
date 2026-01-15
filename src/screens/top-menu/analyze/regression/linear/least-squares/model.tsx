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
import { useLinearLeastSquares } from './use-squares-hook';
import { useModelStyle } from './styles-hook/use-model-style';
import { ListCheckboxWithSelectAll } from '@libs';
import { useStartProStore } from '@store/main-store';
import { generateKey } from '@utils/helper';

export const Model: FC = () => {
  const classes = useModelStyle();
  const { t } = useTranslation('regLinearLeastSquare');
  const { includeConst, setModel } = useLinearLeastSquares(
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
      </Fieldset>
    </div>
  );
};
const IndependentListRender: FC = () => {
  const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);

  const { t } = useTranslation('regLinearLeastSquare');
  const { availableList, independentList, setModelBulk } = useLinearLeastSquares(
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
        type="button"
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
  const [, setSelectAll] = useState<boolean | string | undefined>(false);

  const { t } = useTranslation('regLinearLeastSquare');
  const { availableList, dependentList, setModelBulk } = useLinearLeastSquares(
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
        type="button"
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
  const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);
  const { t } = useTranslation('regLinearLeastSquare');

  const { setBlockUI } = useStartProStore();
  const { availableList, dependentList, independentList, setModelBulk } = useLinearLeastSquares(
    useShallow((state) => ({
      availableList: state.model.availableList,
      dependentList: state.model.dependentList,
      independentList: state.model.independentList,
      setModelBulk: state.setModelBulk,
    })),
  );
  const [propKey, setPropKey] = useState(generateKey(availableList))

  useEffect(() => {
    setPropKey(generateKey(availableList))
  }, [availableList])

  const onSendHandler = (e: MouseEvent<HTMLButtonElement>): void => {
    const name = (e.currentTarget as HTMLButtonElement).dataset.name;
    const selectedItems = new Map<string, boolean>();
    const nextAvail = new Map<string, boolean>();

    availableList.forEach((value, key) => {
      if (value) {
        selectedItems.set(key, false);
      } else {
        nextAvail.set(key, false);
      }
    });

    if (name === 'dependent') {
      if (dependentList.size === 0 && selectedItems.size === 1) {
        setModelBulk(selectedItems, 'dependentList');
      } else {
        setBlockUI({ value: true, msg: t('allowOnlyOneRecord', { ns: 'errors' }) });
        return;
      }
    } else {
      const nextIndep = new Map<string, boolean>(independentList);
      selectedItems.forEach((v, k) => nextIndep.set(k, v));
      setModelBulk(nextIndep, 'independentList');
    }

    setModelBulk(nextAvail, 'availableList');
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
          type="button"
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
