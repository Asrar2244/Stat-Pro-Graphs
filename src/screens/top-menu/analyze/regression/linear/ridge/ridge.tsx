import { ChangeEvent, FC, MouseEvent, useState } from 'react';
import { Checkbox, Button, Input, Field } from '@fluentui/react-components';
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdOutlineRemove,
} from 'react-icons/md';
import { Fieldset, CheckListRender } from '@libs';
import { useActiveNode, useColumnsRowsCount } from '@hooks';
import { useShallow } from 'zustand/react/shallow';
import { useRidgeStyles } from './styles-hook/use-ridge-hook';
import { useTranslation } from 'react-i18next';
import { useRidge } from './use-ridge-store-hook';
import { useRidgePrepare } from './use-ridge-analyze';
import { useStartProStore } from '@store/main-store';
export const Ridge: FC = () => {
  const [avaSelectAll, setAvaSelectAll] = useState<boolean | 'mixed' | undefined>(false);
  const [depSelectAll, setDepSelectAll] = useState<boolean | 'mixed' | undefined>(false);
  const [indSelectAll, setIndSelectAll] = useState<boolean | 'mixed' | undefined>(false);
  const classes = useRidgeStyles();
  const { setBlockUI } = useStartProStore()
  const { config } = useActiveNode([]);
  const { t } = useTranslation(['regLinearRidge', 'errors']);
  const { columns } = useColumnsRowsCount({
    ...config,
    noRowCount: true,
  });

  useRidgePrepare({ columns });
  const { ridge, setRidge } = useRidge(
    useShallow((state) => {
      const { setRidge, ...others } = state;
      return { ridge: others, setRidge };
    }),
  );

  const onSendHandler = (e: MouseEvent<HTMLButtonElement>): void => {
    const name = (e.currentTarget as HTMLButtonElement).dataset.name;
    const availList: any = {};
    const insertList: any = {};
    Object.keys(ridge.availableList).forEach((key: string) => {
      if (ridge.availableList[key]) {
        insertList[key] = false;
      } else {
        availList[key] = false;
      }
    });
    const list: any = {};
    if (name === 'dependent') {
      if (Object.keys(ridge.dependentList).length === 0 && Object.keys(insertList).length === 1) {
        list['dependentList'] = insertList;
      } else {
        setBlockUI({ value: true, msg: t('allowOnlyOneRecord', { ns: 'errors' }) })
        return;
      }
    } else {
      list['independentList'] = { ...ridge.independentList, ...insertList };
    }
    if (Object.keys(availList).length === 0) {
      setAvaSelectAll(false);
    }
    setRidge({ availableList: availList, ...list });
  };

  const onRemoveHandler = (e: MouseEvent<HTMLButtonElement>): void => {
    const { name } = e.target as any;
    const availList = ridge.availableList;
    const list = name === 'dependent' ? ridge.dependentList : ridge.independentList;
    const insertList: any = {};
    Object.keys(list).forEach((key: string) => {
      if (list[key]) {
        availList[key] = false;
      } else {
        insertList[key] = false;
      }
    });
    const listOpt: any = {};
    if (name === 'dependent') {
      listOpt['dependentList'] = insertList;
      if (Object.keys(insertList).length === 0) {
        setDepSelectAll(false);
      }
    } else {
      if (Object.keys(insertList).length === 0) {
        setIndSelectAll(false);
      }
      listOpt['independentList'] = insertList;
    }
    setRidge({ availableList: availList, ...listOpt });
  };

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.type === 'checkbox') {
      // Implement mutually exclusive behavior for lambda options
      if (e.target.name === 'lambdaRangeOfValues' && e.target.checked) {
        // If Range of Values is selected, disable and uncheck Individual
        setRidge({ 
          [e.target.name]: e.target.checked,
          lambdaIndividual: false 
        });
      } else if (e.target.name === 'lambdaIndividual' && e.target.checked) {
        // If Individual is selected, disable and uncheck Range of Values
        setRidge({ 
          [e.target.name]: e.target.checked,
          lambdaRangeOfValues: false 
        });
      } else {
        // For other checkboxes or when unchecking, use normal behavior
        setRidge({ [e.target.name]: e.target.checked });
      }
    } else {
      setRidge({ [e.target.name]: Number(e.target.value) });
    }
  };
  const onBlurHandler = (e: React.FocusEvent<HTMLInputElement>): void => {
    if (e.target.value === '') {
      setRidge({ [e.target.name]: [] });
    }
    setRidge({ [e.target.name]: e.target.value.split(',') });
  };
  const onChangeSelectAll = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;
    // @ts-ignore
    const list: any = ridge[name];
    Object.keys(list).forEach((key) => {
      list[key] = checked;
    });
    switch (name) {
      case 'dependentList':
        setDepSelectAll(checked);
        break;
      case 'availableList':
        setAvaSelectAll(checked);
        break;
      default:
        setIndSelectAll(checked);
    }
    setRidge({ [name]: { ...list } });
  };

  return (
    <div className={classes.modelLayout}>
      <div className={classes.modelWrapper}>
        <Fieldset title={t('dependent', { ns: 'regLinearRidge' })}>
          <div className="section-available">
            <Checkbox
              name="dependentList"
              label={t('selectAll', { ns: 'regLinearRidge' })}
              onChange={onChangeSelectAll}
              checked={depSelectAll}
            />
            <CheckListRender
              className="dependent-list"
              list={ridge.dependentList}
              selected={depSelectAll}
              setSelectAll={setDepSelectAll}
              key={Object.values(ridge.dependentList).length > 0 ? Object.values(ridge.dependentList).join("-") : ""}
            />
            <Button
              icon={<MdOutlineRemove />}
              className={classes.removeButtons}
              name="dependent"
              onClick={onRemoveHandler}
            >
              {t('removeFromDependent', { ns: 'regLinearRidge' })}
            </Button>
          </div>
        </Fieldset>
        <Fieldset title={t('availableVar', { ns: 'regLinearRidge' })}>
          <div className="section-available">
            <Checkbox
              name="availableList"
              label={t('selectAll', { ns: 'regLinearRidge' })}
              onChange={onChangeSelectAll}
              checked={avaSelectAll}
            />
            <CheckListRender
              className="dependent-list"
              list={ridge.availableList}
              selected={avaSelectAll}
              setSelectAll={setAvaSelectAll}
              key={Object.values(ridge.availableList).length > 0 ? Object.values(ridge.availableList).join("-") : ""}
            />
            <div className="send-buttons">
              <Button icon={<MdKeyboardDoubleArrowLeft />} data-name="dependent" onClick={onSendHandler}>
                {t('sendToDependent', { ns: 'regLinearRidge' })}
              </Button>

              <Button
                icon={<MdKeyboardDoubleArrowRight />}
                iconPosition="after"
                data-name="independent"
                onClick={onSendHandler}
              >
                {t('sendToIndependent', { ns: 'regLinearRidge' })}
              </Button>
            </div>
          </div>
        </Fieldset>
        <Fieldset title={t('independent', { ns: 'regLinearRidge' })}>
          <div className="section-available">
            <Checkbox
              name="independentList"
              label={t('selectAll', { ns: 'regLinearRidge' })}
              onChange={onChangeSelectAll}
              checked={indSelectAll}
            />
            <CheckListRender
              className="dependent-list"
              list={ridge.independentList}
              selected={indSelectAll}
              setSelectAll={setIndSelectAll}
              key={Object.values(ridge.independentList).length > 0 ? Object.values(ridge.independentList).join("-") : ""}
            />
            <Button
              icon={<MdOutlineRemove />}
              className={classes.removeButtons}
              name="independent"
              onClick={onRemoveHandler}
            >
              {t('removeFromIndependent', { ns: 'regLinearRidge' })}
            </Button>
          </div>
        </Fieldset>
      </div>
      <Fieldset title={t('lambdaRang')}>
        <div>
          <Checkbox
            name="lambdaRangeOfValues"
            label={t('rangeOfValues', { ns: 'regLinearRidge' })}
            onChange={onChangeHandler}
            checked={ridge.lambdaRangeOfValues}
            disabled={ridge.lambdaIndividual} 
          />
        </div>
        <div className={classes.lambda}>
          <Field label={t('minimum', { ns: 'regLinearRidge' })}>
            <Input
              type="number"
              name="lambdaMinimum"
              value={String(ridge.lambdaMinimum)}
              disabled={!ridge.lambdaRangeOfValues || ridge.lambdaIndividual} 
              onChange={onChangeHandler}
            />
          </Field>
          <Field label={t('maximum', { ns: 'regLinearRidge' })}>
            <Input
              type="number"
              name="lambdaMaximum"
              value={String(ridge.lambdaMaximum)}
              disabled={!ridge.lambdaRangeOfValues || ridge.lambdaIndividual} 
              onChange={onChangeHandler}
            />
          </Field>
          <Field label={t('increment', { ns: 'regLinearRidge' })}>
            <Input
              type="number"
              name="lambdaIncrement"
              disabled={!ridge.lambdaRangeOfValues || ridge.lambdaIndividual} 
              value={String(ridge.lambdaIncrement)}
              onChange={onChangeHandler}
            />
          </Field>
        </div>
      </Fieldset>
      <Fieldset title={t('lambdaIndivisal')}>
        <div className={classes.individualBox}>
          <Checkbox
            name="lambdaIndividual"
            label={t('individual', { ns: 'regLinearRidge' })}
            checked={ridge.lambdaIndividual}
            onChange={onChangeHandler}
            disabled={ridge.lambdaRangeOfValues} 
          />
          <Input
            name="lambdaIndividualValues"
            type="text"
            disabled={!ridge.lambdaIndividual || ridge.lambdaRangeOfValues}
            onBlur={onBlurHandler}
          />
        </div>
      </Fieldset>
      <Fieldset>
        <Checkbox
          name="saveCoefficient"
          label={t('saveCoefficient', { ns: 'regLinearRidge' })}
          onChange={onChangeHandler}
          checked={ridge.saveCoefficient}
        />
        <Input name="saveCoefficientFile" type={'file' as any} disabled={!ridge.saveCoefficient} />
      </Fieldset>
    </div>
  );
};
