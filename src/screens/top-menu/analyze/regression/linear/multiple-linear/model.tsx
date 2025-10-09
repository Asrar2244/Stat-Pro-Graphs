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
import { useMultipleLinear } from './use-multiple-linear-hook';
import { useStartProStore } from '@store/main-store';
import { useModelStyle } from '../forward-stepwise/styles-hook/use-model-style';

export const Model: FC = () => {
  const classes = useModelStyle();
  const { t } = useTranslation('regLinearMultipleLinear');
  const { includeConst, setModel } = useMultipleLinear(
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
        <Fieldset title={t('dependent', { ns: 'regLinearMultipleLinear' })}>
          <DependentListRender />
        </Fieldset>
        <Fieldset title={t('availableVar', { ns: 'regLinearMultipleLinear' })}>
          <AvailableListRender />
        </Fieldset>
        <Fieldset title={t('independent', { ns: 'regLinearMultipleLinear' })}>
          <IndependentListRender />
        </Fieldset>
      </div>
      <Fieldset>
        <div>
          <Checkbox
            name="includeConst"
            label={t('includeConst', { ns: 'regLinearMultipleLinear' })}
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
  const { t } = useTranslation('regLinearMultipleLinear');
  const { availableList, independentList, setModelBulk } = useMultipleLinear(
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
    if (independentList.size === 0) {
      setSelectAll(false);
    }
  };

  return (
    <div className="section-available">
      <SimpleListRender
        list={independentList}
        selectAll={selectAll}
        setSelectAll={setSelectAll}
        setModelBulk={setModelBulk}
        listName="independentList"
        selectAllText={t('selectAll')}
      />
      <Button
        icon={<MdOutlineRemove />}
        className="remove-button"
        name="independent"
        onClick={onRemoveHandler}
      >
        {t('removeFromIndependent', { ns: 'regLinearMultipleLinear' })}
      </Button>
    </div>
  );
};

const DependentListRender: FC = () => {
  const [, setSelectAll] = useState<boolean | string | undefined>(false);
  const { t } = useTranslation('regLinearMultipleLinear');
  const { availableList, dependentList, setModelBulk } = useMultipleLinear(
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
    if (dependentList.size === 0) {
      setSelectAll(false);
    }
  };

  return (
    <div className="section-available">
      <SimpleListRender
        list={dependentList}
        selectAll={false}
        setSelectAll={setSelectAll}
        setModelBulk={setModelBulk}
        listName="dependentList"
        selectAllText={t('selectAll')}
      />
      <Button
        icon={<MdOutlineRemove />}
        className="remove-button"
        name="dependent"
        onClick={onRemoveHandler}
      >
        {t('removeFromDependent', { ns: 'regLinearMultipleLinear' })}
      </Button>
    </div>
  );
};

const AvailableListRender: FC = () => {
  const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);
  const { t } = useTranslation('regLinearMultipleLinear');
  const { availableList, dependentList, independentList, setModelBulk } = useMultipleLinear(
    useShallow((state) => ({
      availableList: state.model.availableList,
      dependentList: state.model.dependentList,
      independentList: state.model.independentList,
      setModelBulk: state.setModelBulk,
    })),
  );

  const { setBlockUI } = useStartProStore();
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
          // enforce single dependent
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
      <SimpleListRender
        list={availableList}
        selectAll={selectAll}
        setSelectAll={setSelectAll}
        setModelBulk={setModelBulk}
        listName="availableList"
        selectAllText={t('selectAll')}
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

// Simple implementation of ListCheckboxWithSelectAll functionality
interface SimpleListRenderProps {
  list: Map<string, boolean>;
  selectAll: boolean | string | undefined;
  setSelectAll: (value: boolean | string | undefined) => void;
  setModelBulk: (list: Map<string, boolean>, listName: string) => void;
  listName: string;
  selectAllText: string;
}

const SimpleListRender: FC<SimpleListRenderProps> = ({
  list,
  selectAll,
  setSelectAll,
  setModelBulk,
  listName,
  selectAllText
}) => {
  const handleSelectAllChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    list.forEach((_, key) => list.set(key, checked));
    setModelBulk(list, listName);
    setSelectAll(checked);
  };

  const handleItemChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    list.set(name, checked);
    setModelBulk(list, listName);
    
    const allChecked = Array.from(list.values()).every((val) => val);
    const someChecked = Array.from(list.values()).some((val) => val);
    setSelectAll(allChecked ? true : someChecked ? "mixed" : false);
  };

  // Determine the appropriate CSS class based on listName
  const getListClassName = () => {
    if (listName === 'availableList') return 'available-list';
    if (listName === 'dependentList') return 'dependent-list';
    return 'available-list'; // default for independentList
  };

  return (
    <div>
      <div className="select-size">
        <Checkbox
          label={selectAllText}
          checked={selectAll === true}
          onChange={handleSelectAllChange}
        />
        <span>{list.size}</span>
      </div>
      <div className={getListClassName()}>
        {Array.from(list.entries()).map(([key, checked]) => (
          <div key={key}>
            <Checkbox
              label={key}
              name={key}
              checked={checked}
              onChange={handleItemChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
};