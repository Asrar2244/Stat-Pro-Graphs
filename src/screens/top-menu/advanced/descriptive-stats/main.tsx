import { FC, useEffect, useState } from 'react';
import { ListCheckboxWithSelectAll, Fieldset } from '@libs';
import { useTranslation } from 'react-i18next';
import { useMainStyles } from './styles-hook/use-column';
import { Button } from '@fluentui/react-components';
import { useDescriptiveStatistics } from './use-descriptive-statistics';
import { IoMdCheckmark, IoMdClose } from 'react-icons/io';
import { generateKey } from '@utils/helper';
import { useShallow } from 'zustand/react/shallow';

export const Main: React.FC = () => {
  const classes = useMainStyles();
  return (
    <div className={classes.mainLayout} data-testid="mainLayout">
      <AvailableListRender />
      <MainListRender />
    </div>
  );
};

const MainListRender: FC = () => {
  const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);
  const classes = useMainStyles();
  const { mainSelectedList, availableList, setModelBulk } = useDescriptiveStatistics(
    useShallow((state) => ({
      mainSelectedList: state.model.mainSelectedList,
      availableList: state.model.availableList,
      setModelBulk: state.setModelBulk,
      setModel: state.setModel,
    })),
  );
  const { t } = useTranslation('descriptiveStatistics');

  const [propKey, setPropKey] = useState(generateKey(mainSelectedList));
  useEffect(() => {
    setPropKey(generateKey(mainSelectedList));
  }, [[...mainSelectedList.values()].join('')]);
  const onRemoveHandler = (): void => {
    mainSelectedList.forEach((value: boolean, name: string) => {
      if (value) {
        availableList.set(name, false);
        mainSelectedList.delete(name);
      }
    });
    setModelBulk(availableList, 'availableList');
    setModelBulk(mainSelectedList, 'mainSelectedList');
    if (mainSelectedList.size === 0) setSelectAll(false);
  };
  return (
    <Fieldset title={t('selectedVariables')}>
      <div className={classes.availableList}>
        <ListCheckboxWithSelectAll
          listSize={mainSelectedList.size}
          list={mainSelectedList}
          selectAllText={t('selectAll')}
          selectValue={selectAll}
          requiredSelectAll
          onSelectAllChanged={setSelectAll}
          propKey={propKey}
          setModelBulk={setModelBulk}
          listName="mainSelectedList"
        />
      </div>
      <div className={classes.removeButton}>
        <Button icon={<IoMdClose />} name="apply" onClick={onRemoveHandler}>
          {t('remove')}
        </Button>
      </div>
    </Fieldset>
  );
};

const AvailableListRender: FC = () => {
  const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);
  const { t } = useTranslation('descriptiveStatistics');

  const classes = useMainStyles();
  const { mainSelectedList, availableList, setModelBulk } = useDescriptiveStatistics(
    useShallow((state) => ({
      mainSelectedList: state.model.mainSelectedList,
      availableList: state.model.availableList,
      setModelBulk: state.setModelBulk,
      setModel: state.setModel,
    })),
  );
  const [propKey, setPropKey] = useState(generateKey(availableList));

  useEffect(() => {
    setPropKey(generateKey(availableList));
  }, [[...availableList.values()].join('')]);

  const onSendHandler = (): void => {
    availableList.forEach((value: boolean, key: string) => {
      if (value) {
        mainSelectedList.set(key, false);
        availableList.delete(key);
      }
    });

    setModelBulk(availableList, 'availableList');
    setModelBulk(mainSelectedList, 'mainSelectedList');
    if (availableList.size === 0) setSelectAll(false);
  };
  return (
    <Fieldset title={t('Available')}>
      <div className={classes.availableList}>
        <ListCheckboxWithSelectAll
          listSize={availableList.size}
          list={availableList}
          selectAllText={t('selectAll')}
          selectValue={selectAll}
          requiredSelectAll
          onSelectAllChanged={setSelectAll}
          propKey={propKey}
          setModelBulk={setModelBulk}
          listName="availableList"
        />
      </div>
      <div className={classes.applyButton}>
        <Button icon={<IoMdCheckmark />} name="apply" onClick={onSendHandler}>
          {t('add')}
        </Button>
      </div>
    </Fieldset>
  );
};
