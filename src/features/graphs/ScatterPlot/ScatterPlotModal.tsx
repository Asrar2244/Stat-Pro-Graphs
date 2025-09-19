import React, { FC } from 'react';
import { Modal } from '@libs';
import { ScatterPlotForm } from './ScatterPlotForm';
import { useScatterPlotStore } from './scatterPlotSlice';
import { IModal } from '@hooks';

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
      size="large"
      showCancel={true}
      cancelLabel="Cancel"
      okLabel="Create Graph"
      ok={{ onClick: onCreate }}
    >
      <ScatterPlotForm projects={projects} datasets={datasets} />
    </Modal>
  );
};
