import { FC, useState } from 'react';
import { Modal } from '@libs';
import { AreaPlotForm } from './AreaPlotForm';
import { useAreaPlotStore } from './areaPlotSlice';
import { IModal } from '@hooks';
import { useAreaPlotModalStyles } from './styles-hook/use-area-plot-modal-styles';
import { GraphErrorBoundary, AdvancedValidationModal } from '../../shared/components';
import { validateAreaPlotRequirements } from './utils/validationUtils';
import { AreaPlotValidationError } from './types';

/**
 * Props for the AreaPlotModal component
 */
interface AreaPlotModalProps extends IModal {
    projects: string[];
    datasets: string[];
    onCreateGraph: (config: any) => void;
}

/**
 * Modal component for configuring and creating area plots
 */
export const AreaPlotModal: FC<AreaPlotModalProps> = ({
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
    } = useAreaPlotStore();

    // Validation state
    const [validationErrors, setValidationErrors] = useState<any[]>([]);
    const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);

    const { modalContentStyles } = useAreaPlotModalStyles();

    const onCreate = () => {
        try {
            // Validate requirements before creating graph
            const graphConfigVars = (graphConfig as any)?.variables;
            const selectedVariables = {
                x: graphConfigVars?.x && Array.isArray(graphConfigVars.x) && graphConfigVars.x.length > 0
                    ? graphConfigVars.x
                    : (selectedXVariable ? [selectedXVariable] : undefined),
                y: graphConfigVars?.y && Array.isArray(graphConfigVars.y) && graphConfigVars.y.length > 0
                    ? graphConfigVars.y
                    : (selectedYVariable ? [selectedYVariable] : undefined),
            };

            const validation = validateAreaPlotRequirements(subType as any, dataFormat as any, selectedVariables);

            if (!validation.isValid) {
                setValidationErrors(validation.errors);
                setShowValidationErrorModal(true);
                throw new AreaPlotValidationError(validation.errors);
            }

            // Clear any previous validation errors
            setValidationErrors([]);
            setShowValidationErrorModal(false);

            // Build variables explicitly
            const gx = selectedVariables.x;
            const gy = selectedVariables.y;

            const xVars: string[] = Array.isArray(gx) && gx.length > 0 ? gx : (selectedXVariable ? [selectedXVariable] : []);
            const yVars: string[] = Array.isArray(gy) && gy.length > 0 ? gy : (selectedYVariable ? [selectedYVariable] : []);

            // Basic validation
            if (dataFormat === 'Single X' && xVars.length === 0 && yVars.length === 0) {
                return;
            }
            if (dataFormat === 'Single Y' && xVars.length === 0 && yVars.length === 0) {
                return;
            }

            // Normalize intent - simpler logic to respect user choice
            let normalizedFormat = dataFormat;

            // Only swap if strictly needed (e.g. Single X but data is in y var slot)
            if (normalizedFormat === 'Single X' && xVars.length === 0 && yVars.length === 1) {
                xVars.push(yVars[0]);
                yVars.length = 0;
            } else if (normalizedFormat === 'Single Y' && yVars.length === 0 && xVars.length === 1) {
                yVars.push(xVars[0]);
                xVars.length = 0;
            }

            // Removed aggressive auto-switching (e.g. Single X -> X Many Y) to allow traceOrchestrator to handle Single X/Y logic correctly

            const config = {
                ...graphConfig,
                graphType,
                subType,
                selectedProject,
                dataFormat: normalizedFormat,
                variables: {
                    x: xVars,
                    y: yVars,
                }
            };

            setGraphConfig(config);
            onCreateGraph(config);
            reset();
            modalProps.closeModal();
        } catch (error) {
            if (error instanceof AreaPlotValidationError) {
                // Validation errors handled above
            } else {
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
                title="Area Plot"
                size="large"
                showCancel={true}
                cancelLabel="Cancel"
                okLabel="Create Graph"
                ok={{ onClick: onCreate }}
                modalType="non-modal"
            >
                <div style={modalContentStyles}>
                    <GraphErrorBoundary
                        graphType="Area Plot"
                        onError={(error, errorInfo) => {
                            // In production, you might want to send this to an error reporting service
                        }}
                    >
                        <AreaPlotForm projects={projects} datasets={datasets} />
                    </GraphErrorBoundary>
                </div>
            </Modal>

            {/* Advanced Validation Error Modal - adapting usage for Area Plot */}
            <AdvancedValidationModal
                isOpen={showValidationErrorModal}
                onClose={() => setShowValidationErrorModal(false)}
                errors={validationErrors}
                graphType="Area Plot"
                dataFormat={dataFormat}
                selectedVariables={{
                    x: (graphConfig as any)?.variables?.x || (selectedXVariable && selectedXVariable.trim() !== '' ? [selectedXVariable] : []),
                    y: (graphConfig as any)?.variables?.y || (selectedYVariable && selectedYVariable.trim() !== '' ? [selectedYVariable] : []),
                    category: [],
                    errorBar: []
                }}
                onRetry={() => {
                    setShowValidationErrorModal(false);
                }}
                showDetailedHelp={true}
            />
        </>
    );
};
