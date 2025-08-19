import React from 'react';
import { Button, Checkbox, Spinner, Text } from '@fluentui/react-components';
import { TbTable, TbChartBar, TbFile } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import type { IPrintSection } from '../types';
import { usePrintReportStyles } from '../styles-hook/use-print-report-styles';

interface ISectionListProps {
  sections: IPrintSection[];
  isLoading: boolean;
  error: string | null;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSection: (sectionId: string) => void;
}

export const SectionList: React.FC<ISectionListProps> = ({
  sections,
  isLoading,
  error,
  allSelected,
  onToggleSelectAll,
  onToggleSection,
}) => {
  const { t } = useTranslation('outputToolBar');
  const styles = usePrintReportStyles();

  const getSectionIcon = (section: IPrintSection) => {
    const hasTable = section.element.querySelector('table');
    const hasChart = section.element.querySelector('[class*="plotly"], svg');
    
    if (hasTable && hasChart) return <TbFile className={styles.sectionIcon} />;
    if (hasTable) return <TbTable className={styles.sectionIcon} />;
    if (hasChart) return <TbChartBar className={styles.sectionIcon} />;
    return <TbFile className={styles.sectionIcon} />;
  };

  const getSectionMeta = (section: IPrintSection) => {
    const hasTable = section.element.querySelector('table');
    const hasChart = section.element.querySelector('[class*="plotly"], svg');
    
    const types: string[] = [];
    if (hasTable) types.push('Table');
    if (hasChart) types.push('Chart');
    if (types.length === 0) types.push('Content');
    
    return types.join(' + ');
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="small" />
        <span className={styles.loadingText}>Loading sections...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        {error}
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className={styles.noSectionsMessage}>
        No printable sections found in the current output.
      </div>
    );
  }

  const selectedCount = sections.filter(s => s.selected).length;

  return (
    <div>
      <div className={styles.selectAllContainer}>
        <Button
          appearance="outline"
          onClick={onToggleSelectAll}
          className={styles.selectAllButton}
        >
          {allSelected ? (t('deselectAll') || 'Deselect All') : (t('selectAll') || 'Select All')}
        </Button>
        <span className={styles.sectionCount}>
          {selectedCount} of {sections.length} sections selected
        </span>
      </div>

      <div className={styles.sectionsList}>
        {sections.map((section) => (
          <div
            key={section.id}
            className={`${styles.sectionItem} ${section.selected ? styles.sectionItemSelected : ''}`}
          >
            <Checkbox
              checked={section.selected}
              onChange={() => onToggleSection(section.id)}
            />
            {getSectionIcon(section)}
            <Text className={styles.sectionTitle} title={section.title}>
              {section.title}
            </Text>
            <Text className={styles.sectionMeta}>
              {getSectionMeta(section)}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};