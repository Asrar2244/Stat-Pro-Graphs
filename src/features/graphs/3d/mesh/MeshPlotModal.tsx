import { FC, useMemo, useState } from 'react';
import { Modal } from '@libs';
import { MeshPlotForm } from './MeshPlotForm';
import { useMeshPlotStore } from './meshPlotSlice';
import { IModal } from '@hooks';
import { useMeshPlotModalStyles } from './styles-hook/use-mesh-plot-modal-styles';
import { GraphErrorBoundary, AdvancedValidationModal } from '../../shared/components';
import { validateMeshPlotRequirements, MeshPlotValidationError } from './utils/validationUtils';
import { isValidDataFormat } from './constants';

/**
 * Props for the MeshPlotModal component
 */
interface MeshPlotModalProps extends IModal {
  projects: string[];
  datasets: string[];
  onCreateGraph: (config: any) => void;
}

/**
 * Modal component for configuring and creating 3D mesh plots
 */
export const MeshPlotModal: FC<MeshPlotModalProps> = ({ 
  projects, 
  datasets, 
  onCreateGraph, 
  ...modalProps 
}) => {
  const { 
    selectedProject, 
    dataFormat,
    graphConfig, 
    setGraphConfig, 
    reset,
    selectedXVariable,
    selectedYVariable,
    selectedZVariable,
    // Mesh configuration values
    opacity,
    surfaceType,
    colorScale,
    showContours,
    contourOpacity,
    lighting,
    smoothShading,
    showGrid,
    gridOpacity,
  } = useMeshPlotStore();
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);

  const { modalContentStyles } = useMeshPlotModalStyles();

  // Use large size for 3D mesh plots
  const modalSize = useMemo(() => {
    return 'large';
  }, []);

  const onCreate = () => {
    try {
      // Validate basic requirements first
      const errors: any[] = [];
      
      if (!selectedProject) {
        errors.push({
          field: 'project',
          message: 'Please select a project before creating the graph',
          severity: 'error'
        });
      }
      
      if (!dataFormat) {
        errors.push({
          field: 'dataFormat',
          message: 'Please select a data format before creating the graph',
          severity: 'error'
        });
      }
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        setShowValidationErrorModal(true);
        return;
      }

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
        z: graphConfigVars?.z && Array.isArray(graphConfigVars.z) && graphConfigVars.z.length > 0 
          ? graphConfigVars.z 
          : (selectedZVariable ? [selectedZVariable] : undefined),
      };


      const validation = validateMeshPlotRequirements(dataFormat as any, selectedVariables);
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setShowValidationErrorModal(true);
        throw new MeshPlotValidationError(validation.errors);
      }

      // Clear any previous validation errors
      setValidationErrors([]);
      setShowValidationErrorModal(false);

      // Build variables explicitly so downstream always receives clear mapping
      const gx = selectedVariables.x;
      const gy = selectedVariables.y;
      const gz = selectedVariables.z;
    
      // For all formats, fall back to single variables if no lists are available
      const xVars: string[] = Array.isArray(gx) && gx.length > 0 ? gx : (selectedXVariable ? [selectedXVariable] : []);
      const yVars: string[] = Array.isArray(gy) && gy.length > 0 ? gy : (selectedYVariable ? [selectedYVariable] : []);
      const zVars: string[] = Array.isArray(gz) && gz.length > 0 ? gz : (selectedZVariable ? [selectedZVariable] : []);

      // Basic validation to avoid surprises
      if (dataFormat === 'XYZ Triplets' && (xVars.length === 0 || yVars.length === 0 || zVars.length === 0)) {
        // Missing variables for XYZ Triplets format
        return;
      }
      if (dataFormat === 'Many Z' && zVars.length === 0) {
        // No Z variables selected for Many Z format
        return;
      }
      if (dataFormat === 'XY Many Z' && (xVars.length === 0 || yVars.length === 0 || zVars.length === 0)) {
        // Missing variables for XY Many Z format
        return;
      }

      const config = { 
        ...graphConfig, 
        graphType: '3D Mesh Plot' as const, 
        selectedProject, 
        dataFormat,
        variables: { 
          x: xVars, 
          y: yVars,
          z: zVars
        },
        // Include all mesh configuration values from the store
        surfaceType,
        colorScale,
        opacity,
        showContours,
        contourOpacity,
        lighting,
        smoothShading,
        showGrid,
        gridOpacity
      };
      
      
      setGraphConfig(config);
      onCreateGraph(config);
      reset();
      modalProps.closeModal();
    } catch (error) {
      if (error instanceof MeshPlotValidationError) {
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
      title="3D Mesh Plot"
      size={modalSize as "medium" | "large" | "small" | "extra-large"}
      showCancel={true}
      cancelLabel="Cancel"
      okLabel="Create Graph"
      ok={{ onClick: onCreate }}
      modalType="non-modal"
    >
      <div style={modalContentStyles}>
        <GraphErrorBoundary
          graphType="3D Mesh Plot"
          onError={(error, errorInfo) => {
            // In production, you might want to send this to an error reporting service
          }}
        >
          <MeshPlotForm projects={projects} datasets={datasets} />
        </GraphErrorBoundary>
      </div>
    </Modal>
    
    {/* Advanced Validation Error Modal */}
    <AdvancedValidationModal
      isOpen={showValidationErrorModal}
      onClose={() => setShowValidationErrorModal(false)}
      errors={validationErrors}
      graphType="3D Mesh Plot"
      dataFormat={dataFormat}
      selectedVariables={{
        x: (graphConfig as any)?.variables?.x || (selectedXVariable && selectedXVariable.trim() !== '' ? [selectedXVariable] : []),
        y: (graphConfig as any)?.variables?.y || (selectedYVariable && selectedYVariable.trim() !== '' ? [selectedYVariable] : []),
        z: (graphConfig as any)?.variables?.z || (selectedZVariable && selectedZVariable.trim() !== '' ? [selectedZVariable] : [])
      }}
      onRetry={() => {
        // Close the modal and let user try again
        setShowValidationErrorModal(false);
      }}
      title={validationErrors.some(e => e.field === 'project' || e.field === 'dataFormat') 
        ? "Please Complete Required Fields" 
        : undefined}
      showDetailedHelp={true}
      />
    </>
  );
};