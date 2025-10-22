import { FC, useMemo, useState } from 'react';
import { Modal } from '@libs';
import { LineScatterPlotForm } from './LineScatterPlotForm';
import { useLineScatterPlotStore } from './lineScatterPlotSlice';
import { IModal } from '@hooks';
import { useLineScatterPlotModalStyles } from './styles-hook/use-line-scatter-plot-modal-styles';
import { GraphErrorBoundary, AdvancedValidationModal } from '../../shared/components';
import { validateLineScatterPlotRequirements, LineScatterPlotValidationError } from './utils/validationUtils';
import { isValidDataFormat } from './constants';

/**
 * Props for the LineScatterPlotModal component
 */
interface LineScatterPlotModalProps extends IModal {
  projects: string[];
  datasets: string[];
  onCreateGraph: (config: any) => void;
}

/**
 * Modal component for configuring and creating line-scatter plots
 */
export const LineScatterPlotModal: FC<LineScatterPlotModalProps> = ({ 
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
  } = useLineScatterPlotStore();
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);

  const { modalContentStyles } = useLineScatterPlotModalStyles();

  // Determine if error bar variables are required (for variable selection column)
  const isErrorBarSubType = (subType: string): boolean => {
    return [
      'Simple Line and Scatter Error Bars',
      'Multiple Line and Scatter Error Bars',
      'Horizontal Error Bars',
      'Bi-Directional Error Bars'
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


      const validation = validateLineScatterPlotRequirements(subType as any, dataFormat as any, selectedVariables);
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setShowValidationErrorModal(true);
        throw new LineScatterPlotValidationError(validation.errors);
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
      if (error instanceof LineScatterPlotValidationError) {
        // Validation errors are already handled above
      } else {
        // Handle unexpected errors
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
      title="Line-Scatter Plot"
      size={modalSize}
      showCancel={true}
      cancelLabel="Cancel"
      okLabel="Create Graph"
      ok={{ onClick: onCreate }}
      modalType="non-modal"
    >
      <div style={modalContentStyles}>
        <GraphErrorBoundary
          graphType="Line-Scatter Plot"
          onError={(error, errorInfo) => {
            // In production, you might want to send this to an error reporting service
          }}
        >
          <LineScatterPlotForm projects={projects} datasets={datasets} />
        </GraphErrorBoundary>
      </div>
    </Modal>
    
    {/* Advanced Validation Error Modal */}
    <AdvancedValidationModal
      isOpen={showValidationErrorModal}
      onClose={() => setShowValidationErrorModal(false)}
      errors={validationErrors}
      graphType="Line-Scatter Plot"
      dataFormat={dataFormat}
      selectedVariables={{
        x: (graphConfig as any)?.variables?.x || (selectedXVariable && selectedXVariable.trim() !== '' ? [selectedXVariable] : []),
        y: (graphConfig as any)?.variables?.y || (selectedYVariable && selectedYVariable.trim() !== '' ? [selectedYVariable] : []),
        category: (graphConfig as any)?.variables?.category || [],
        errorBar: (graphConfig as any)?.variables?.errorBar || []
      }}
      onRetry={() => {
        // Close the modal and let user try again
        setShowValidationErrorModal(false);
      }}
      showDetailedHelp={true}
      />
    </>
  );
};