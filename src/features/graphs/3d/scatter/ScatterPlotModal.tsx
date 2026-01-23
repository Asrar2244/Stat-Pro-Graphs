import { FC, useMemo, useState } from 'react';
import { Modal } from '@libs';
import { ScatterPlotForm } from './ScatterPlotForm';
import { useScatterPlotStore } from './scatterPlotSlice';
import { IModal } from '@hooks';
import { useScatterPlotModalStyles } from './styles-hook/use-scatter-plot-modal-styles';
import { GraphErrorBoundary, AdvancedValidationModal } from '../../shared/components';
import { validateScatterPlotRequirements, ScatterPlotValidationError } from './utils/validationUtils';

/**
 * Props for the ScatterPlotModal component
 */
interface ScatterPlotModalProps extends IModal {
    projects: string[];
    datasets: string[];
    onCreateGraph: (config: any) => void;
}

/**
 * Modal component for configuring and creating 3D scatter plots
 */
export const ScatterPlotModal: FC<ScatterPlotModalProps> = ({
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
        xVariableList,
        yVariableList,
        zVariableList
    } = useScatterPlotStore();

    // Validation state
    const [validationErrors, setValidationErrors] = useState<any[]>([]);
    const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);

    const { modalContentStyles } = useScatterPlotModalStyles();

    // Use large size for 3D scatter plots
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

            // Get all selected variables from lists
            const getSelectedVars = (list: Map<string, boolean>) =>
                Array.from(list.keys());

            const xSelected = getSelectedVars(xVariableList);
            const ySelected = getSelectedVars(yVariableList);
            const zSelected = getSelectedVars(zVariableList);

            console.log('🔍 [ScatterPlotModal] onCreate - Store Lists:', {
                xSize: xVariableList?.size,
                ySize: yVariableList?.size,
                zSize: zVariableList?.size,
                xKeys: xSelected,
                yKeys: ySelected,
                zKeys: zSelected
            });

            // Validate requirements before creating graph
            // Try to get variables from graphConfig first, fallback to store lists
            const graphConfigVars = (graphConfig as any)?.variables;
            const selectedVariables = {
                x: xSelected.length > 0
                    ? xSelected
                    : (graphConfigVars?.x && Array.isArray(graphConfigVars.x) && graphConfigVars.x.length > 0
                        ? graphConfigVars.x
                        : (selectedXVariable ? [selectedXVariable] : [])),
                y: ySelected.length > 0
                    ? ySelected
                    : (graphConfigVars?.y && Array.isArray(graphConfigVars.y) && graphConfigVars.y.length > 0
                        ? graphConfigVars.y
                        : (selectedYVariable ? [selectedYVariable] : [])),
                z: zSelected.length > 0
                    ? zSelected
                    : (graphConfigVars?.z && Array.isArray(graphConfigVars.z) && graphConfigVars.z.length > 0
                        ? graphConfigVars.z
                        : (selectedZVariable ? [selectedZVariable] : [])),
            };

            const validation = validateScatterPlotRequirements(dataFormat as any, selectedVariables);

            if (!validation.isValid) {
                setValidationErrors(validation.errors);
                setShowValidationErrorModal(true);
                throw new ScatterPlotValidationError(validation.errors);
            }

            // Clear any previous validation errors
            setValidationErrors([]);
            setShowValidationErrorModal(false);

            // Build variables explicitly so downstream always receives clear mapping
            const gx = selectedVariables.x;
            const gy = selectedVariables.y;
            const gz = selectedVariables.z;

            // For all formats, fall back to single variables if no lists are available
            const xVars: string[] = Array.isArray(gx) && gx.length > 0 ? gx : [];
            const yVars: string[] = Array.isArray(gy) && gy.length > 0 ? gy : [];
            const zVars: string[] = Array.isArray(gz) && gz.length > 0 ? gz : [];

            // Basic validation to avoid surprises
            if (dataFormat === 'XYZ Triplets' && (xVars.length === 0 || yVars.length === 0 || zVars.length === 0)) {
                return;
            }
            if (dataFormat === 'Many Z' && zVars.length === 0) {
                return;
            }
            if (dataFormat === 'XY Many Z' && (xVars.length === 0 || yVars.length === 0 || zVars.length === 0)) {
                return;
            }

            // Destructure to ensure we don't accidentally spread stale scatterConfig from persistence
            const { scatterConfig: _staleConfig, ...cleanGraphConfig } = graphConfig || {} as any;

            const config = {
                ...cleanGraphConfig,
                graphType: '3D Scatter Plot' as const,
                selectedProject,
                dataFormat,
                variables: {
                    x: xVars,
                    y: yVars,
                    z: zVars
                },
                // Include configuration values
                // scatterConfig removed as per user request
                // scatterConfig: { ... }
            };

            setGraphConfig(config);
            onCreateGraph(config);
            reset();
            modalProps.closeModal();
        } catch (error) {
            if (error instanceof ScatterPlotValidationError) {
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
                title="3D Scatter Plot"
                size={modalSize as "medium" | "large" | "small" | "extra-large"}
                showCancel={true}
                cancelLabel="Cancel"
                okLabel="Create Graph"
                ok={{ onClick: onCreate }}
                modalType="non-modal"
            >
                <div style={modalContentStyles}>
                    <GraphErrorBoundary
                        graphType="3D Scatter Plot"
                        onError={(error, errorInfo) => {
                            // In production, you might want to send this to an error reporting service
                        }}
                    >
                        <ScatterPlotForm projects={projects} datasets={datasets} />
                    </GraphErrorBoundary>
                </div>
            </Modal>

            {/* Advanced Validation Error Modal */}
            <AdvancedValidationModal
                isOpen={showValidationErrorModal}
                onClose={() => setShowValidationErrorModal(false)}
                errors={validationErrors}
                graphType="3D Scatter Plot"
                dataFormat={dataFormat || ''}
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
