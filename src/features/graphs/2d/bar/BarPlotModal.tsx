import { FC, useMemo, useState } from 'react';
import { Modal } from '@libs';
import { BarPlotForm } from './BarPlotForm';
import { useBarPlotStore } from './barPlotSlice';
import { IModal } from '@hooks';
import { useBarPlotModalStyles } from './styles-hook/use-bar-plot-modal-styles';
import { GraphErrorBoundary, AdvancedValidationModal } from '../../shared/components';
import { validateBarPlotRequirements, BarPlotValidationError } from './utils/validationUtils';

/**
 * Props for the BarPlotModal component
 */
interface BarPlotModalProps extends IModal {
    projects: string[];
    datasets: string[];
    onCreateGraph: (config: any) => void;
}

/**
 * Modal component for configuring and creating bar plots
 */
export const BarPlotModal: FC<BarPlotModalProps> = ({
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
        xVariableList,
        yVariableList,
        categoryVariableList,
        errorBarVariableList
    } = useBarPlotStore();

    // Validation state
    const [validationErrors, setValidationErrors] = useState<any[]>([]);
    const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);

    const { modalContentStyles } = useBarPlotModalStyles();

    // Determine if error bar variables are required (for variable selection column)
    const isErrorBarSubType = (subType: string): boolean => {
        const lower = subType.toLowerCase();
        return lower.includes('error');
    };

    // Use extra large size when error bar variables are required (3 columns)
    const modalSize = useMemo(() => {
        return subType && isErrorBarSubType(subType) ? 'extra-large' : 'large';
    }, [subType]);

    const onCreate = () => {
        try {
            // Validate requirements before creating graph

            // Get selected variables from store maps (only those checked as true)
            const getSelectedKeys = (map: Map<string, boolean>) =>
                Array.from(map.entries())
                    .filter(([, isChecked]) => isChecked === true)
                    .map(([key]) => key);

            const xKeys = getSelectedKeys(xVariableList);
            const yKeys = getSelectedKeys(yVariableList);
            const categoryKeys = getSelectedKeys(categoryVariableList);
            const errorBarKeys = getSelectedKeys(errorBarVariableList);

            // Fallback to single selected variable if map is empty (e.g. if logic wasn't fully migrated or for single selection modes updating single var)
            // But usually map should be source of truth now.

            const xVars = xKeys.length > 0 ? xKeys : (selectedXVariable ? [selectedXVariable] : []);
            const yVars = yKeys.length > 0 ? yKeys : (selectedYVariable ? [selectedYVariable] : []);
            const categoryVars = categoryKeys;
            const errorBarVars = errorBarKeys; // Error bar variable is usually single, but list supports multiple if needed by format

            const selectedVariables = {
                x: xVars.length > 0 ? xVars : undefined,
                y: yVars.length > 0 ? yVars : undefined,
                category: categoryVars.length > 0 ? categoryVars : undefined,
                errorBar: errorBarVars.length > 0 ? errorBarVars : undefined
            };


            const validation = validateBarPlotRequirements(subType as any, dataFormat as any, selectedVariables);

            if (!validation.isValid) {
                setValidationErrors(validation.errors);
                setShowValidationErrorModal(true);
                throw new BarPlotValidationError(validation.errors);
            }

            // Clear any previous validation errors
            setValidationErrors([]);
            setShowValidationErrorModal(false);

            // Basic validation to avoid surprises
            if (dataFormat === 'Single X' && xVars.length === 0 && yVars.length === 0) {
                // No variables selected
                return;
            }

            // Normalize intent so renderer doesn't guess
            let normalizedFormat = dataFormat;

            const config = {
                ...graphConfig,
                graphType: 'Bar Plot',
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
            if (error instanceof BarPlotValidationError) {
                // Validation errors are already handled above
            } else {
                // Handle unexpected errors
                console.error("BarPlotModal onCreate error:", error);
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
                title="Bar Plot"
                size={modalSize}
                showCancel={true}
                cancelLabel="Cancel"
                okLabel="Create Graph"
                ok={{ onClick: onCreate }}
                modalType="non-modal"
            >
                <div style={modalContentStyles}>
                    <GraphErrorBoundary
                        graphType="Bar Plot"
                        onError={(error, errorInfo) => {
                            // In production, you might want to send this to an error reporting service
                        }}
                    >
                        <BarPlotForm projects={projects} datasets={datasets} />
                    </GraphErrorBoundary>
                </div>
            </Modal>

            {/* Advanced Validation Error Modal */}
            <AdvancedValidationModal
                isOpen={showValidationErrorModal}
                onClose={() => setShowValidationErrorModal(false)}
                errors={validationErrors}
                graphType="Bar Plot"
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
