import { ChangeEvent, FC, MouseEvent, useMemo, useState } from 'react';
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
  const { t } = useTranslation('regLinearForwardStepwise');
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
        <Fieldset title={t('dependent', { ns: 'regLinearForwardStepwise' })}>
          <DependentListRender />
        </Fieldset>
        <Fieldset title={t('availableVar', { ns: 'regLinearForwardStepwise' })}>
          <AvailableListRender />
        </Fieldset>
        <Fieldset title={t('independent', { ns: 'regLinearForwardStepwise' })}>
          <IndependentListRender />
        </Fieldset>
      </div>
      <Fieldset>
        <div>
          <Checkbox
            name="includeConst"
            label={t('includeConst', { ns: 'regLinearForwardStepwise' })}
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

  const { t } = useTranslation('regLinearForwardStepwise');
  const { availableList, independentList, setModelBulk } = useLinearLeastSquares(
    useShallow((state) => ({
      availableList: state.model.availableList,
      independentList: state.model.independentList,
      setModelBulk: state.setModelBulk,
    })),
  );
  const independentListKey = useMemo(() => {
    return Array.from(independentList.keys()).sort().join(',') + '-' + independentList.size;
  }, [independentList]);

  const propKey = useMemo(() => generateKey(independentList), [independentListKey]);

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
        {t('removeFromIndependent', { ns: 'regLinearForwardStepwise' })}
      </Button>
    </div>
  );
};
const DependentListRender: FC = () => {
  const [, setSelectAll] = useState<boolean | string | undefined>(false);

  const { t } = useTranslation('regLinearForwardStepwise');
  const { availableList, dependentList, setModelBulk } = useLinearLeastSquares(
    useShallow((state) => ({
      availableList: state.model.availableList,
      dependentList: state.model.dependentList,
      setModelBulk: state.setModelBulk,
    })),
  );
  const dependentListKey = useMemo(() => {
    return Array.from(dependentList.keys()).sort().join(',') + '-' + dependentList.size;
  }, [dependentList]);

  const propKey = useMemo(() => generateKey(dependentList), [dependentListKey]);
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
        {t('removeFromDependent', { ns: 'regLinearForwardStepwise' })}
      </Button>
    </div>
  );
};

const AvailableListRender: FC = () => {
  const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);
  const { t } = useTranslation('regLinearForwardStepwise');
  const { availableList, dependentList, independentList, setModelBulk } = useLinearLeastSquares(
    useShallow((state) => ({
      availableList: state.model.availableList,
      dependentList: state.model.dependentList,
      independentList: state.model.independentList,
      setModelBulk: state.setModelBulk,
    })),
  );
  const { setBlockUI } = useStartProStore();

  const availableListKey = useMemo(() => {
    return Array.from(availableList.keys()).sort().join(',') + '-' + availableList.size;
  }, [availableList]);

  const propKey = useMemo(() => generateKey(availableList), [availableListKey]);

  const onSendHandler = (e: MouseEvent<HTMLButtonElement>): void => {
    const name = (e.currentTarget as HTMLButtonElement).dataset.name;
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
          dependentList.clear();
          dependentList.set(key, true);
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
