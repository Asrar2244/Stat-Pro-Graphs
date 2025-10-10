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
  const { availableList, dependentList, setModelBulk, setModel } = useLinearLeastSquares(
    useShallow((state) => ({
      availableList: state.model.availableList,
      dependentList: state.model.dependentList,
      independentList: state.model.independentList,
      setModelBulk: state.setModelBulk,
      setModel: state.setModel
    })),
  );
  const [propKey, setPropKey] = useState(generateKey(availableList))

  useEffect(() => {
    setPropKey(generateKey(availableList))
  }, [...availableList.values()])

  const onSendHandler = (e: MouseEvent<HTMLButtonElement>): void => {
    const name = (e.currentTarget as HTMLButtonElement).dataset.name;
    const movList = new Map<string, boolean>();
    const availList = new Map<string, boolean>();

    availableList.forEach((value, key) =>
      (value ? movList : availList).set(key, value)
    );
    if (name === 'dependent') {
      if (dependentList.size === 0 && movList.size === 1) {

        setModel({ dependentList: movList });
      } else {
        setBlockUI({ value: true, msg: t('allowOnlyOneRecord', { ns: 'errors' }) });
        return;
      }
    } else {
      setModel({ independentList: movList });
    }

    setModelBulk(availList, 'availableList');
    if (!availableList.size) setSelectAll(false);
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
        <Button type="button" icon={<MdKeyboardDoubleArrowLeft />} data-name="dependent" onClick={onSendHandler} disabled={dependentList.size >= 1}>
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
