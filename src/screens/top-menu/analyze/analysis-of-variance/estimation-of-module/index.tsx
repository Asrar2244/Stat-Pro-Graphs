import { FC, useState } from 'react';
import { Tab, TabList, SelectTabData, SelectTabEvent } from '@fluentui/react-components';
import { Modal } from '@libs';
import { useTranslation } from 'react-i18next';
import { NoIdSelected } from '@libs/no-id-selected-msg';
import { IModal, useActiveNode } from '@hooks';
import { EstimationOfModuleModel } from '../estimation-of-module/model';
import { useShallow } from 'zustand/react/shallow';
import { useEstimateModel } from './use-estimation-store';
import { useEstimationOfModuleAnalyzeData } from './use-analyze-data';
interface IEstimationOfModules extends IModal { }
export const estimationOfModule: FC<IEstimationOfModules> = ({ ...props }) => {
  const [selectedTab, setSelectedTab] = useState<string>('model');
  const { estimationOfModuleAnalyzeData } = useEstimationOfModuleAnalyzeData();
  const { t } = useTranslation(['estimationOfModules']);
  const { id, config } = useActiveNode([props.open]);
  const { resetModule } = useEstimateModel(
    useShallow((state) => {
      const { resetModule } = state;
      return { resetModule };
    }),
  );
  const onCloseModal = (): void => {
    resetModule();
    props.closeModal();
  };
  const onOkModal = async (): Promise<void> => {
    if (!id && id !== '') { onCloseModal(); return; }
    const tableName = config.tabName;
    estimationOfModuleAnalyzeData(tableName, t('title'), 'estimationOfModules');
    onCloseModal();
  };
  const onTabSelectHandler = (_event: SelectTabEvent, { value }: SelectTabData): void => {
    setSelectedTab(value as string);
  };
  return (
    <Modal
      modalType="alert"
      {...props}
      cancelLabel={t('close')}
      okLabel={t('ok')}
      title={t('title')}
      size="medium"
      closeModal={onCloseModal}
      showCancel={!id || id === '' ? false : true}
      ok={{ onClick: onOkModal }}
    >
      <div>
        {!id || id === '' ? (
          <NoIdSelected />
        ) : (
          <>
            <TabList
              selectedValue={selectedTab}
              appearance="subtle"
              onTabSelect={onTabSelectHandler}
            >
              <Tab value="model">{t('model')}</Tab>
              <Tab value="repeatedMeasures">{t('repeatedMeasures')}</Tab>
              <Tab value="options">{t('options')}</Tab>
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

const LoadTabDetails: FC<{ selectedTab: string }> = ({ selectedTab }) => {
  switch (selectedTab) {
    case 'model':
      return <EstimationOfModuleModel />;
    case 'repeatedMeasures':
      return <p>Repeated Measures</p>;
    case 'options':
      return <p>Options</p>;
    case 'resampling':
      return <p>Resampling </p>;
    default:
      return <p>{selectedTab}</p>;
  }
};
