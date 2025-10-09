import { FC, useMemo } from 'react';
import { Modal } from '@libs';
import { ScatterPlotForm } from './ScatterPlotForm';
import { useScatterPlotStore } from './scatterPlotSlice';
import { IModal } from '@hooks';
import { useScatterPlotModalStyles } from './styles-hook/use-scatter-plot-modal-styles';

/**
 * Props for the ScatterPlotModal component
 */
interface ScatterPlotModalProps extends IModal {
  projects: string[];
  datasets: string[];
  onCreateGraph: (config: any) => void;
}

/**
 * Modal component for configuring and creating scatter plots
 */
export const ScatterPlotModal: FC<ScatterPlotModalProps> = ({ 
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
    reset,
    selectedXVariable,
    selectedYVariable,
  } = useScatterPlotStore();

  const { modalContentStyles } = useScatterPlotModalStyles();

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
    // Build variables explicitly so downstream always receives clear mapping
    // Prefer explicit selections; fall back to graphConfig.variables if provided by the form
    const gx = (graphConfig as any)?.variables?.x as string[] | undefined;
    const gy = (graphConfig as any)?.variables?.y as string[] | undefined;
    const gCategory = (graphConfig as any)?.variables?.category as string[] | undefined;
    const gErrorBar = (graphConfig as any)?.variables?.errorBar as string[] | undefined;
    
    // For X Many Y Replicates format, always use the full variable lists from graphConfig
    // For other formats, fall back to single variables if no lists are available
    const xVars: string[] = Array.isArray(gx) && gx.length > 0 ? gx : (selectedXVariable ? [selectedXVariable] : []);
    const yVars: string[] = Array.isArray(gy) && gy.length > 0 ? gy : (selectedYVariable ? [selectedYVariable] : []);
    const categoryVars: string[] = Array.isArray(gCategory) ? gCategory : [];
    const errorBarVars: string[] = Array.isArray(gErrorBar) ? gErrorBar : [];


    // Basic validation to avoid surprises
    if (dataFormat === 'Single X' && xVars.length === 0 && yVars.length === 0) {
      // No variables selected for Single X format
      return;
    }
    if (dataFormat === 'Single Y' && xVars.length === 0 && yVars.length === 0) {
      // No variables selected for Single Y format
      return;
    }

    // Normalize intent so renderer doesn't guess
    let normalizedFormat = dataFormat;
    // If user picked a single variable but placed it on the wrong side, coerce to the intended axis
    if (normalizedFormat === 'Single X' && xVars.length === 0 && yVars.length === 1) {
      // Treat the single provided Y as X
      xVars.push(yVars[0]);
      yVars.length = 0;
    } else if (normalizedFormat === 'Single Y' && yVars.length === 0 && xVars.length === 1) {
      // Treat the single provided X as Y
      yVars.push(xVars[0]);
      xVars.length = 0;
    }
    if (normalizedFormat === 'Single X' && xVars.length > 0 && yVars.length > 0) {
      normalizedFormat = 'X Many Y';
    } else if (normalizedFormat === 'Single Y' && xVars.length > 0 && yVars.length > 0) {
      normalizedFormat = 'Y Many X';
    } else if (normalizedFormat === 'Single X' && xVars.length === 0 && yVars.length > 0) {
      // User picked Y only while selecting Single X → honor Y intent
      normalizedFormat = 'Single Y';
    } else if (normalizedFormat === 'Single Y' && yVars.length === 0 && xVars.length > 0) {
      // User picked X only while selecting Single Y → honor X intent
      normalizedFormat = 'Single X';
    }


    const config = { 
      ...graphConfig, 
      graphType, 
      subType, 
      selectedProject, 
      dataFormat: normalizedFormat,
      variables: { 
        x: xVars, 
        y: yVars,
        category: categoryVars,
        errorBar: errorBarVars
      }
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
      <div style={modalContentStyles}>
        <ScatterPlotForm projects={projects} datasets={datasets} />
      </div>
    </Modal>
  );
};
