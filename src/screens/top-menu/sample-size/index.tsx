import React from "react";
import { FC, memo } from 'react';
import { SampleSizeModal as FormContent } from './main';
import { ISampleSizeProps } from './types';
import ChiSquareSampleSizeModal from './chi-square-sample-size';
import { Modal } from '../../../libs/modal';

const SampleSizeComponent: FC<ISampleSizeProps> = ({ open, onClose, selectedTest }) => {
  // Chi-Square needs its own modal with data selection workflow
  if (selectedTest === 'chi-square-sample-size') {
    return (
      <ChiSquareSampleSizeModal
        open={open}
        onClose={onClose}
      />
    );
  }

  // Other sample size tests use the standard modal
  return (
    <Modal
      open={open}
      closeModal={onClose}
      toggleModal={onClose}
      openModal={() => {}}
      title="Sample Size Calculator"
      size="medium"
    >
      <FormContent selectedTest={selectedTest} onClose={onClose} />
    </Modal>
  );
};

export const SampleSize = memo(SampleSizeComponent);

export { default as ChiSquareSampleSizeModal } from './chi-square-sample-size'; 