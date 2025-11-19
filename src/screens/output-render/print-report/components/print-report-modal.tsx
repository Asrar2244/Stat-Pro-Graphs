import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@libs';
import { Button } from '@fluentui/react-components';
import type { IPrintReportModalProps } from '../types';
import { usePrintSections, usePrintReport } from '../hooks';
import { usePrintReportStyles } from '../styles-hook/use-print-report-styles';
import { SectionList } from './section-list';

export const PrintReportModal: React.FC<IPrintReportModalProps> = ({ open, closeModal }) => {
  const { t } = useTranslation('outputToolBar');
  const styles = usePrintReportStyles();
  const [isOpen, setIsOpen] = useState(open);
  
  // Update local state when prop changes
  useEffect(() => {
    setIsOpen(open);
  }, [open]);
  
  const handleToggleModal = () => {
    setIsOpen(!isOpen);
    closeModal();
  };
  
  const handleOpenModal = () => {
    setIsOpen(true);
  };
  
  const {
    sections,
    isLoading,
    error,
    allSelected,
    toggleSelectAll,
    toggleSection,
    getSelectedSections,
    checkAndRefreshSections,
    forceRefreshSections,
    setModalOpen,
  } = usePrintSections();

  // Update modal state and refresh sections when modal opens
  useEffect(() => {
    setModalOpen(open);
    if (open) {
      checkAndRefreshSections();
    }
  }, [open, setModalOpen, checkAndRefreshSections]);

  const { generateReport, isGenerating } = usePrintReport();

  const handleGenerateReport = async () => {
    const selectedSections = getSelectedSections();
    await generateReport(selectedSections);
    closeModal();
  };

  return (
    <Modal
      open={open}
      closeModal={closeModal}
      toggleModal={handleToggleModal}
      openModal={handleOpenModal}
      title={t('printReport') || 'Print Report'}
      size="medium"
      okLabel={t('generateReport') || 'Generate Report'}
      cancelLabel={t('cancel') || 'Cancel'}
      showCancel={true}
      ok={{ 
        onClick: handleGenerateReport,
        disabled: isGenerating || getSelectedSections().length === 0
      }}
    >
      <div className={styles.modalContent}>
        <div className={styles.refreshContainer}>
          <Button
            appearance="outline"
            size="small"
            onClick={forceRefreshSections}
            disabled={isLoading}
          >
            🔄 {t('refreshSections')}
          </Button>
        </div>
        
        <SectionList
          sections={sections}
          isLoading={isLoading}
          error={error}
          allSelected={allSelected}
          onToggleSelectAll={toggleSelectAll}
          onToggleSection={toggleSection}
        />
        
        {isGenerating && (
          <div className={styles.successMessage}>
            🖨️ {t('generatingReport')}
          </div>
        )}
      </div>
    </Modal>
  );
};