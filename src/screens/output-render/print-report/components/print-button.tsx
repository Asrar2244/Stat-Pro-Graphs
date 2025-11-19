import React from 'react';
import { Button, Tooltip } from '@fluentui/react-components';
import { TbFileReport } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import { usePrintReportStyles } from '../styles-hook/use-print-report-styles';

interface IPrintButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const PrintButton: React.FC<IPrintButtonProps> = ({ onClick, disabled = false }) => {
  const { t } = useTranslation('outputToolBar');
  const styles = usePrintReportStyles();

  return (
    <Tooltip content={t('printReport') || 'Print Report'} relationship="label" withArrow>
      <Button
        aria-label={t('printReport') || 'Print Report'}
        icon={<TbFileReport />}
        appearance="transparent"
        onClick={onClick}
        disabled={disabled}
        className={styles.printButton}
      />
    </Tooltip>
  );
};