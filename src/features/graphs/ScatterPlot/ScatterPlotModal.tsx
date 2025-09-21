import React, { FC, useMemo } from 'react';
import { Modal } from '@libs';
import { ScatterPlotForm } from './ScatterPlotForm';
import { useScatterPlotStore } from './scatterPlotSlice';
import { IModal } from '@hooks';
import { tokens } from '@fluentui/react-components';

export const ScatterPlotModal: FC<IModal & { projects: string[]; datasets: string[]; onCreateGraph: (config: any) => void; }> = ({ 
  projects, 
  datasets, 
  onCreateGraph, 
  ...modalProps 
}) => {
  const { 
    selectedProject, 
    subType, 
    dataFormat,
    graphType, 
    graphConfig, 
    setGraphConfig, 
    reset 
  } = useScatterPlotStore();

  // Determine if error bar variables are required (for variable selection column)
  const isErrorBarSubType = (subType: string): boolean => {
    return [
      'Simple Scatter Error Bar',
      'Multiple Scatter Error Bar',
      'Simple Scatter Error Bar and Regression',
      'Multiple Scatter Error Bar and Regression',
      'Simple Scatter Horizontal Error Bar',
      'Simple Scatter Bidirectional Error Bars',
      'Vertical Asymmetric Error Bars',
      'Horizontal Asymmetric Error Bars',
      'Bidirectional Asymmetric Error Bars'
    ].includes(subType);
  };

  // Use extra large size when error bar variables are required (3 columns)
  const modalSize = useMemo(() => {
    return subType && isErrorBarSubType(subType) ? 'extra-large' : 'large';
  }, [subType]);

  const onCreate = () => {
    if (!selectedProject || !subType) return;
    
    const config = { 
      ...graphConfig, 
      graphType, 
      subType, 
      selectedProject, 
      dataFormat
    };
    
    setGraphConfig(config);
    onCreateGraph(config);
    reset();
    modalProps.closeModal();
  };

  return (
    <Modal
      {...modalProps}
      title="Scatter Plot"
      size={modalSize}
      showCancel={true}
      cancelLabel="Cancel"
      okLabel="Create Graph"
      ok={{ onClick: onCreate }}
      modalType="non-modal"
    >
      <div style={{ 
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
        overflowY: 'auto'
      }}>
        <ScatterPlotForm projects={projects} datasets={datasets} />
      </div>
    </Modal>
  );
};
