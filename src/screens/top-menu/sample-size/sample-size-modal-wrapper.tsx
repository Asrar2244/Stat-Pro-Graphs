import { FC, memo, useEffect } from 'react';
import { Modal } from '@libs';
import { SampleSizeModal } from './main';
import ChiSquareSampleSizeModal from './chi-square-sample-size';
import { useSampleSizeStore } from './use-sample-size-store';
import { SampleSizeTestType } from './types';

interface SampleSizeModalWrapperProps {
  open: boolean;
  onClose: () => void;
  selectedTest: string;
}

// Get display title for each test type
const getTestTitle = (test: string): string => {
  const titles: Record<string, string> = {
    'ttest-sample-size': 'T-Test Sample Size',
    'proportion-sample-size': 'Proportion Sample Size',
    'paired-ttest-sample-size': 'Paired T-Test Sample Size',
    'anova-sample-size': 'ANOVA Sample Size',
    'chi-square-sample-size': 'Chi-Square Sample Size',
  };
  return titles[test] || 'Sample Size Calculator';
};

const SampleSizeModalWrapperComponent: FC<SampleSizeModalWrapperProps> = ({ 
  open, 
  onClose, 
  selectedTest 
}) => {
  const resetAll = useSampleSizeStore((state) => state.resetAll);

  useEffect(() => {
    if (open) {
      // Only reset when modal first opens, not on every render
      resetAll();
    }
  }, [open]);

  const handleClose = (): void => {
    onClose();
  };

  // Get the title for the current test
  const modalTitle = getTestTitle(selectedTest);

  // Chi-Square needs its own modal with data selection workflow
  if (selectedTest === 'chi-square-sample-size') {
    return (
      <ChiSquareSampleSizeModal
        open={open}
        onClose={handleClose}
      />
    );
  }

  // Other sample size tests use the standard modal
  return (
    <Modal
      open={open}
      closeModal={handleClose}
      toggleModal={handleClose}
      openModal={() => {}}
      title={modalTitle}
      size="medium"
      showOk={false}
      showCancel={false}
    >
      <SampleSizeModal selectedTest={selectedTest} onClose={handleClose} />
    </Modal>
  );
};

export const SampleSizeModalWrapper = memo(SampleSizeModalWrapperComponent); 