import { FC, memo, useState } from 'react';
import { Tab, TabList, SelectTabData, SelectTabEvent } from '@fluentui/react-components';
import { IModal, useActiveNode } from '@hooks';
import { Modal } from '@libs';
import { useTranslation } from 'react-i18next';
import { useCommonStyles } from './styles-hook/use-basic-statistics';
import { Main } from './main';
import { NoIdSelected } from '@libs/no-id-selected-msg';
import { useTasks } from '@store';
import { v4 as uuidv4 } from 'uuid';
import { useBasicStatistics } from '../use-basic-statistics';
import { convertToLinuxPath, collectionsLocation } from '@utils';
import { useShallow } from 'zustand/react/shallow';
import { API } from '@constants';
interface ICommonPopup extends IModal {
  type: string;
}

const CommonStatisticsComponent: FC<ICommonPopup> = ({ type, ...props }) => {
  const [selectedTab, setSelectedTab] = useState<string>('main');
  const classes = useCommonStyles();
  const { t } = useTranslation(['basicStatistics', 'common']);
  const { mainOptions, mainSelectedList, mainTermedMean, mainWeightedMean, setReset } =
    useBasicStatistics();
  const { setQueueTask } = useTasks(useShallow((state) => ({ setQueueTask: state.setQueueTask })));

  const { id, config } = useActiveNode([props.open]);
  const onTabSelectHandler = (_event: SelectTabEvent, { value }: SelectTabData): void => {
    setSelectedTab(value as string);
  };
  const onCloseModal = (): void => {
    setReset();
    props.closeModal();
  };
  const onOkModal = async (): Promise<void> => {
    const uuid = uuidv4();
    const tableName = convertToLinuxPath(await collectionsLocation(config.tabName));
    // executeAnalysis();
    const parameters = {
      data_name: tableName,
      input_data_type: 'file',
      db_name: tableName,
      selected_vars: mainSelectedList,
      operation: 'descriptive_statistics',
      desparameters: { ...mainOptions, CIofAM: Number(mainOptions.CIofAM) },
    };
    setQueueTask({
      uuid,
      parameters,
      tabId: config.id.toString(),
      queueFor: t('title', { ns: 'basicStatistics' }),
      tabName: config.tabName,
      url: `${API.analysis}/api`,
      queueType: 'basicStatistics',
    });

    onCloseModal();
  };
  return (
    <Modal
      modalType="alert"
      {...props}
      cancelLabel={t('close')}
      okLabel={t('ok')}
      title={t('title', { type: t(type) })}
      size="medium"
      closeModal={onCloseModal}
      ok={{ onClick: onOkModal, disabled: !id || id === '' }}
    >
      <div className={classes.commonWrapper}>
        {!id || id === '' ? (
          <NoIdSelected />
        ) : (
          <>
            <TabList
              selectedValue={selectedTab}
              appearance="subtle"
              onTabSelect={onTabSelectHandler}
            >
              <Tab value="main">{t('main')}</Tab>
              <Tab value="nPTiles">{t('nPTiles')}</Tab>
              <Tab value="normality">{t('normality')}</Tab>
              <Tab value="resampling">{t('resampling')}</Tab>
            </TabList>
            <div className="details">
              <LoadTabDetails selectedTab={selectedTab} />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
const LoadTabDetails: FC<{ selectedTab: string }> = ({ selectedTab, ...props }) => {
  switch (selectedTab) {
    case 'main':
      return <Main {...props} />;
    // case 'model':
    //   return <Model {...props} />;
    // case 'estimation':
    //   return <Estimation {...props} />;
    // case 'options':
    //   return <Options {...props} />;
    // case 'predict':
    //   return <Predict {...props} />;
    // case 'resampling':
    //   return <Resampling {...props} />;
    default:
      return <p>{selectedTab}</p>;
  }
};
export const CommonStatistics = memo(CommonStatisticsComponent);
