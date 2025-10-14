import { FC, useMemo, useState } from 'react';
import { Modal } from '@libs';
import { LinePlotForm } from './LinePlotForm';
import { useLinePlotStore } from './linePlotSlice';
import { IModal } from '@hooks';
import { useLinePlotModalStyles } from './styles-hook/use-line-plot-modal-styles';
import { LinePlotErrorBoundary } from './components/ErrorBoundary';
import { AdvancedValidationModal } from './components/AdvancedValidationModal';
import { validateLinePlotRequirements, LinePlotValidationError } from './utils/validationUtils';
import { isValidDataFormat } from './constants';

/**
 * Props for the LinePlotModal component
 */
interface LinePlotModalProps extends IModal {
  projects: string[];
  datasets: string[];
  onCreateGraph: (config: any) => void;
}

/**
 * Modal component for configuring and creating line plots
 */
export const LinePlotModal: FC<LinePlotModalProps> = ({ 
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
  } = useLinePlotStore();
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);

  const { modalContentStyles } = useLinePlotModalStyles();

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
    try {
      // Validate requirements before creating graph
      // Try to get variables from graphConfig first, fallback to individual variables
      const graphConfigVars = (graphConfig as any)?.variables;
      const selectedVariables = {
        x: graphConfigVars?.x && Array.isArray(graphConfigVars.x) && graphConfigVars.x.length > 0 
          ? graphConfigVars.x 
          : (selectedXVariable ? [selectedXVariable] : undefined),
        y: graphConfigVars?.y && Array.isArray(graphConfigVars.y) && graphConfigVars.y.length > 0 
          ? graphConfigVars.y 
          : (selectedYVariable ? [selectedYVariable] : undefined),
        category: graphConfigVars?.category && Array.isArray(graphConfigVars.category) && graphConfigVars.category.length > 0 
          ? graphConfigVars.category 
          : undefined,
        errorBar: graphConfigVars?.errorBar && Array.isArray(graphConfigVars.errorBar) && graphConfigVars.errorBar.length > 0 
          ? graphConfigVars.errorBar 
          : undefined
      };

      // Debug logging
      console.log('Validation Debug:', {
        subType,
        dataFormat,
        selectedVariables,
        graphConfig: graphConfig,
        selectedXVariable,
        selectedYVariable,
        isValidFormat: isValidDataFormat(subType as any, dataFormat)
      });

      const validation = validateLinePlotRequirements(subType as any, dataFormat as any, selectedVariables);
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setShowValidationErrorModal(true);
        throw new LinePlotValidationError(validation.errors);
      }

      // Clear any previous validation errors
      setValidationErrors([]);
      setShowValidationErrorModal(false);

      // Build variables explicitly so downstream always receives clear mapping
      const gx = selectedVariables.x;
      const gy = selectedVariables.y;
      const gCategory = selectedVariables.category;
      const gErrorBar = selectedVariables.errorBar;
    
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
    } catch (error) {
      if (error instanceof LinePlotValidationError) {
        // Validation errors are already handled above
        console.warn('Graph creation blocked due to validation errors:', error.errors);
      } else {
        // Handle unexpected errors
        console.error('Unexpected error during graph creation:', error);
        setValidationErrors([{
          field: 'general',
          message: 'An unexpected error occurred while creating the graph',
          severity: 'error'
        }]);
        setShowValidationErrorModal(true);
      }
    }
  };

  return (
    <>
      <Modal
      {...modalProps}
      title="Line Plot"
      size={modalSize}
      showCancel={true}
      cancelLabel="Cancel"
      okLabel="Create Graph"
      ok={{ onClick: onCreate }}
      modalType="non-modal"
    >
      <div style={modalContentStyles}>
        <LinePlotErrorBoundary
          onError={(error, errorInfo) => {
            console.error('LinePlot Modal Error:', error, errorInfo);
            // In production, you might want to send this to an error reporting service
          }}
        >
          <LinePlotForm projects={projects} datasets={datasets} />
        </LinePlotErrorBoundary>
      </div>
    </Modal>
    
    {/* Advanced Validation Error Modal */}
    <AdvancedValidationModal
      isOpen={showValidationErrorModal}
      onClose={() => setShowValidationErrorModal(false)}
      errors={validationErrors}
      onRetry={() => {
        // Close the modal and let user try again
        setShowValidationErrorModal(false);
      }}
      title="Cannot Create Line Plot"
      showDetailedHelp={true}
      />
    </>
  );
};
