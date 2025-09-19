import { FC, memo, useEffect } from 'react';
import { Modal } from '@libs';
import { SampleSizeModal } from './main';
import ChiSquareSampleSizeModal from './chi-square-sample-size';
import { useSampleSizeStore } from './use-sample-size-store';

interface SampleSizeModalWrapperProps {
  open: boolean;
  onClose: () => void;
  selectedTest: string;
}

const SampleSizeModalWrapperComponent: FC<SampleSizeModalWrapperProps> = ({ 
  open, 
  onClose, 
  selectedTest 
}) => {
  const resetAll = useSampleSizeStore((state) => state.resetAll);

  useEffect(() => {
    if (open) {
      resetAll();
    }
  }, [open, resetAll]);

  const handleClose = (): void => {
    onClose();
  };

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
      title="Sample Size Calculator"
      size="small"
    >
      <SampleSizeModal selectedTest={selectedTest} onClose={handleClose} />
    </Modal>
  );
};

export const SampleSizeModalWrapper = memo(SampleSizeModalWrapperComponent); 