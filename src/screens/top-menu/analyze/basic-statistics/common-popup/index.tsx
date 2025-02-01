import { FC, memo, useState } from 'react';
import { Tab, TabList, SelectTabData, SelectTabEvent } from '@fluentui/react-components';
import { IModal, useActiveNode, useAnalyzeSave } from '@hooks';
import { Modal } from '@libs';
import { useTranslation } from 'react-i18next';
import { useCommonStyles } from './styles-hook/use-basic-statistics';
import { Main } from './main';
import { NoIdSelected } from '@libs/no-id-selected-msg';
import { useBasicStatistics } from '../use-basic-statistics';
import { API } from '@constants';
interface ICommonPopup extends IModal {
  type: string;
}

const CommonStatisticsComponent: FC<ICommonPopup> = ({ type, ...props }) => {
  const [selectedTab, setSelectedTab] = useState<string>('main');
  const classes = useCommonStyles();
  const { t } = useTranslation(['basicStatistics', 'common']);
  const { mainOptions, mainSelectedList, setReset } = useBasicStatistics();

  const { id, config } = useActiveNode([props.open]);
  const { execute } = useAnalyzeSave();
  const onTabSelectHandler = (_event: SelectTabEvent, { value }: SelectTabData): void => {
    setSelectedTab(value as string);
  };
  const onCloseModal = (): void => {
    setReset();
    props.closeModal();
  };
  const onOkModal = async (): Promise<void> => {
    if (!id && id !== '') { onCloseModal(); return; }
    const tableName = config.tabName;
    const parameters = {
      data_name: tableName,
      input_data_type: 'file',
      db_name: tableName,
      selected_vars: mainSelectedList,
      operation: 'descriptive_statistics',
      desparameters: { ...mainOptions, CIofAM: Number(mainOptions.CIofAM) },
    };
    execute(config.tabName, parameters, {
      queueFor: t('title', { ns: 'basicStatistics' }),
      url: `/api/${API.analysis}`,
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
      showCancel={!id || id === '' ? false : true}
      ok={{ onClick: onOkModal }}
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
    default:
      return <p>{selectedTab}</p>;
  }
};
export const CommonStatistics = memo(CommonStatisticsComponent);
