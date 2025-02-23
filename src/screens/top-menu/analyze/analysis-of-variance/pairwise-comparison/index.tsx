import { FC, useState } from 'react';
import { Tab, TabList, SelectTabData, SelectTabEvent } from '@fluentui/react-components';
import { Modal } from '@libs';
import { useTranslation } from 'react-i18next';
import { NoIdSelected } from '@libs/no-id-selected-msg';
import { IModal, useActiveNode } from '@hooks';
import { useShallow } from 'zustand/react/shallow';
import { useEstimateModel } from './use-pairwise-comparison-store';
import { usePairwiseComparisonModuleAnalyzeData } from './use-analyze-data';
import { PairwiseComparisonModuleModel } from './model';
import { useStartProStore } from '@store/main-store';

interface IEstimationOfModules extends IModal { }
export const PairwiseComparisonModule: FC<IEstimationOfModules> = ({ ...props }) => {
    const [selectedTab, setSelectedTab] = useState<string>('model');
    const { setBlockUI } = useStartProStore()
    const { pairwiseComparisonModuleAnalyzeData } = usePairwiseComparisonModuleAnalyzeData();
    const { t } = useTranslation(['pairwiseComparisonOfModules']);
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
        setBlockUI({ value: true, msg: "processRequest", hideOk: true })
        pairwiseComparisonModuleAnalyzeData(tableName, t('title'), 'pairwiseComparisonModules', id as string);
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
            ok={{ onClick: onOkModal, disabled: !id || id === '' }}
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
                            <Tab value="errorTerms">{t('errorTerms')}</Tab>

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
            return <PairwiseComparisonModuleModel />;
        case 'errorTerms':
            return <p>Error Terms</p>;
        default:
            return <p>{selectedTab}</p>;
    }
};
