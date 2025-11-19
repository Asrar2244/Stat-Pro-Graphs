import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@fluentui/react-components';
import { usePrintReportStyles } from '../styles-hook/use-print-report-styles';

interface IPrintReportModalProps {
  open: boolean;
  closeModal: () => void;
}

export const PrintReportModal: React.FC<IPrintReportModalProps> = ({ open, closeModal }) => {
  const { t } = useTranslation(['outputToolBar', 'common']);
  const styles = usePrintReportStyles();

  if (!open) return null;
  
  return (
    <div className={styles.simpleModalOverlay}>
      <div className={styles.simpleModalContainer}>
        <h3 className={styles.simpleModalTitle}>{t('printReport')}</h3>
        <p className={styles.simpleModalDescription}>{t('printReportDescription')}</p>
        <div className={styles.simpleModalActions}>
          <Button onClick={closeModal}>{t('close', { ns: 'common' })}</Button>
        </div>
      </div>
    </div>
  );
}; 