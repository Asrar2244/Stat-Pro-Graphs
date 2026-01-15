import { FC } from 'react';
import { IModal } from '@hooks';
import { Modal } from '@libs';
import { useTranslation } from 'react-i18next';
import { useEmptyDataStore } from '@store';

export const SavePromptModal: FC<IModal> = (props) => {
    const { t } = useTranslation(['common']);
    const { triggerSave } = useEmptyDataStore();

    const handleSave = () => {
        triggerSave();
        // REMOVED: props.closeModal();
        // Parent (MenuSelector in executer.tsx) will detect dataState -> 'published' 
        // and automatically switch content to the analysis component.
    };

    return (
        <Modal
            modalType="alert"
            {...props}
            title={t('unsavedData', 'Unsaved Data')}
            size="small"
            okLabel={t('saveData', 'Save Data')}
            cancelLabel={t('cancel', 'Cancel')}
            ok={{ onClick: handleSave }}
        >
            <div style={{ padding: '20px 0' }}>
                {t('unsavedDataMessage', 'You have unsaved data. Please save the data using the "Save Data" button below before proceeding with the analysis.')}
            </div>
        </Modal>
    );
};
