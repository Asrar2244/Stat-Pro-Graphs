import { ChangeEvent, FC, MouseEvent, useEffect, useState } from 'react';
import { Checkbox, Divider, Button } from '@fluentui/react-components';
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdOutlineRemove,
} from 'react-icons/md';
import { ITranslate, Fieldset } from '@libs';
import { useShallow } from 'zustand/react/shallow';
import { useLinearLeastSquares } from './use-squares-hook';
import { useModelStyle } from './styles-hook/use-model-style';

export const Model: FC<ITranslate> = ({ t }) => {
  const classes = useModelStyle();
  const [avaSelectAll, setAvaSelectAll] = useState<boolean | 'mixed' | undefined>(false);
  const [depSelectAll, setDepSelectAll] = useState<boolean | 'mixed' | undefined>(false);
  const [indSelectAll, setIndSelectAll] = useState<boolean | 'mixed' | undefined>(false);
  const { model, setModel } = useLinearLeastSquares(
    useShallow((state) => ({ model: state.model, setModel: state.setModel })),
  );
  const onSendHandler = (e: MouseEvent<HTMLButtonElement>): void => {
    const { name } = e.target as any;
    const availList: any = {};
    const insertList: any = {};
    Object.keys(model.availableList).forEach((key: string) => {
      if (model.availableList[key]) {
        insertList[key] = false;
      } else {
        availList[key] = false;
      }
    });
    const list: any = {};
    if (name === 'dependent') {
      list['dependentList'] = insertList;
    } else {
      list['independentList'] = insertList;
    }
    if (Object.keys(availList).length === 0) setAvaSelectAll(false);

    setModel({ availableList: availList, ...list });
  };

  const onRemoveHandler = (e: MouseEvent<HTMLButtonElement>): void => {
    const { name } = e.target as any;
    const availList = model.availableList;
    const list = name === 'dependent' ? model.dependentList : model.independentList;
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
    setModel({ availableList: availList, ...listOpt });
  };
  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    setModel({ [e.target.name]: e.target.checked });
  };
  const onChangeSelectAll = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;
    //@ts-expect-error
    const list: any = model[name];
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
    setModel({ [name]: { ...list } });
  };

  return (
    <div className={classes.modelLayout}>
      <div className={classes.modelWrapper}>
        <Fieldset title={t('dependent', { ns: 'regLinearLeastSquare' })}>
          <div className="section-available">
            <Checkbox
              name="dependentList"
              label={t('selectAll', { ns: 'regLinearLeastSquare' })}
              onChange={onChangeSelectAll}
              checked={depSelectAll}
            />
            <ListRender list={model.dependentList} selected={depSelectAll} />
            <Button
              icon={<MdOutlineRemove />}
              className={classes.removeButtons}
              name="dependent"
              onClick={onRemoveHandler}
            >
              {t('removeFromDependent', { ns: 'regLinearLeastSquare' })}
            </Button>
          </div>
        </Fieldset>
        <Fieldset title={t('availableVar', { ns: 'regLinearLeastSquare' })}>
          <div className="section-available">
            <Checkbox
              name="availableList"
              label={t('selectAll', { ns: 'regLinearLeastSquare' })}
              onChange={onChangeSelectAll}
              checked={avaSelectAll}
            />
            <ListRender list={model.availableList} selected={avaSelectAll} />
            <div className="send-buttons">
              <Button icon={<MdKeyboardDoubleArrowLeft />} name="dependent" onClick={onSendHandler}>
                {t('sendToDependent', { ns: 'regLinearLeastSquare' })}
              </Button>

              <Button
                icon={<MdKeyboardDoubleArrowRight />}
                iconPosition="after"
                name="independent"
                onClick={onSendHandler}
              >
                {t('sendToIndependent', { ns: 'regLinearLeastSquare' })}
              </Button>
            </div>
          </div>
        </Fieldset>
        <Fieldset title={t('independent', { ns: 'regLinearLeastSquare' })}>
          <div className="section-available">
            <Checkbox
              name="independentList"
              label={t('selectAll', { ns: 'regLinearLeastSquare' })}
              onChange={onChangeSelectAll}
              checked={indSelectAll}
            />
            <ListRender list={model.independentList} selected={indSelectAll} />

            <Button
              icon={<MdOutlineRemove />}
              className={classes.removeButtons}
              name="independent"
              onClick={onRemoveHandler}
            >
              {t('removeFromIndependent', { ns: 'regLinearLeastSquare' })}
            </Button>
          </div>
        </Fieldset>
      </div>
      <Fieldset>
        <div>
          <Checkbox
            name="includeConst"
            label={t('includeConst', { ns: 'regLinearLeastSquare' })}
            checked={model.includeConst}
            onChange={onChangeHandler}
          />
        </div>
        <div>
          <Checkbox
            name="save"
            label={t('save', { ns: 'regLinearLeastSquare' })}
            checked={model.save}
            onChange={onChangeHandler}
          />
        </div>
      </Fieldset>
    </div>
  );
};

const ListRender: FC<{
  list: { [key: string]: boolean };
  selected: boolean | 'mixed' | undefined;
}> = ({ list, selected }) => {
  const [localList, setLocalList] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLocalList(list);
    setLoading(true);
  }, [selected, list]);
  useEffect(() => {
    setLoading(false);
  }, [localList]);
  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    list[e.target.name] = e.target.checked;
  };
  return (
    <div className="dependent-list">
      {loading ? (
        <div>Loading</div>
      ) : (
        Object.keys(localList).map((key: string, index: number) => (
          <div key={key + '-' + index}>
            <Checkbox
              label={key}
              name={key}
              defaultChecked={localList[key]}
              onChange={onChangeHandler}
            />
            <Divider />
          </div>
        ))
      )}
    </div>
  );
};
