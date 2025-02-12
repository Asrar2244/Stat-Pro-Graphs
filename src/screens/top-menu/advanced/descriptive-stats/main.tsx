import { FC, useEffect, useState } from 'react';
import { ListCheckboxWithSelectAll } from '@libs';
import { useTranslation } from 'react-i18next';
import { useMainStyles } from './styles-hook/use-column';
import { Button, Tooltip } from '@fluentui/react-components';
import { useDescriptiveStatistics } from './use-descriptive-statistics';
import { IoMdCheckmark, IoMdClose } from 'react-icons/io';
import { generateKey } from '@utils/helper';
import { useShallow } from 'zustand/react/shallow';

export const Main: React.FC = () => {
  const classes = useMainStyles();
  const { t } = useTranslation(['descriptiveStatistics']);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const onClickSelected = (): void => {
    setIsSelected(!isSelected);
  };
  return (
    <div className={classes.mainLayout} data-testid="mainLayout">
      <div className={classes.selector} data-testid="selector">
        <div className={!isSelected ? 'selected' : ''} onClick={onClickSelected}>
          <span>{t("Available")}</span>
        </div>
        <div className={isSelected ? 'selected' : ''} onClick={onClickSelected}>
          <span>{t("Selected")}</span>
        </div>
      </div>
      {!isSelected ? <AvailableListRender /> : <MainListRender />}
    </div>
  );
};

const MainListRender: FC = () => {
  const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);
  const classes = useMainStyles();
  const { mainSelectedList, availableList, setModelBulk } = useDescriptiveStatistics(useShallow((state) => ({
    mainSelectedList: state.model.mainSelectedList,
    availableList: state.model.availableList,
    setModelBulk: state.setModelBulk,
    setModel: state.setModel
  })));
  const { t } = useTranslation('descriptiveStatistics');

  const [propKey, setPropKey] = useState(generateKey(mainSelectedList))
  useEffect(() => {
    setPropKey(generateKey(mainSelectedList))
  }, [[...mainSelectedList.values()].join("")])
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
    <div className="section-available">
      <ListCheckboxWithSelectAll
        listSize={mainSelectedList.size}
        list={mainSelectedList}
        selectAllText={t('selectAll')}
        selectValue={selectAll}
        requiredSelectAll
        onSelectAllChanged={setSelectAll}
        propKey={propKey}
        setModelBulk={setModelBulk}
        listName='mainSelectedList'
      />
      <div className={classes.removeButton}>
        <Tooltip relationship="label" withArrow content={t('remove')}>
          <Button
            icon={<IoMdClose />}
            size="large"
            onClick={onRemoveHandler}
          />
        </Tooltip>
      </div>

    </div>
  );
};

const AvailableListRender: FC = () => {
  const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);
  const { t } = useTranslation('descriptiveStatistics');

  const classes = useMainStyles();
  const { mainSelectedList, availableList, setModelBulk } = useDescriptiveStatistics(useShallow((state) => ({
    mainSelectedList: state.model.mainSelectedList,
    availableList: state.model.availableList,
    setModelBulk: state.setModelBulk,
    setModel: state.setModel
  })));
  const [propKey, setPropKey] = useState(generateKey(availableList))

  useEffect(() => {
    setPropKey(generateKey(availableList))
  }, [[...availableList.values()].join("")])

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
      <div className={classes.applyButton}>
        <Tooltip relationship="label" withArrow content={t('add')}>
          <Button
            icon={<IoMdCheckmark />}
            size="large"
            onClick={onSendHandler}
          />
        </Tooltip>
      </div>

    </div>
  );
};
