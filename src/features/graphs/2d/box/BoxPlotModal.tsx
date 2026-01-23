import { FC, useState } from 'react';
import { Modal } from '@libs';
import { BoxPlotForm } from './BoxPlotForm';
import { useBoxPlotStore } from './boxPlotSlice';
import { IModal } from '@hooks';
import { validateBoxPlotRequirements, BoxPlotValidationError } from './utils/validationUtils';
import { AdvancedValidationModal } from '../../shared/components';

interface BoxPlotModalProps extends IModal {
    projects: string[];
    datasets: string[];
    onCreateGraph: (config: any) => void;
}

export const BoxPlotModal: FC<BoxPlotModalProps> = ({
    projects,
    datasets,
    onCreateGraph,
    ...modalProps
}) => {
    const {
        graphConfig,
        reset,
        selectedXVariable,
        selectedYVariable,
        dataFormat
    } = useBoxPlotStore();

    const [validationErrors, setValidationErrors] = useState<any[]>([]);
    const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);

    const onCreate = () => {
        try {
            const graphConfigVars = (graphConfig as any)?.variables;
            const selectedVariables = {
                x: graphConfigVars?.x && graphConfigVars.x.length > 0
                    ? graphConfigVars.x
                    : (selectedXVariable ? [selectedXVariable] : undefined),
                y: graphConfigVars?.y && graphConfigVars.y.length > 0
                    ? graphConfigVars.y
                    : (selectedYVariable ? [selectedYVariable] : undefined),
            };

            const validation = validateBoxPlotRequirements(dataFormat, selectedVariables);

            if (!validation.isValid) {
                setValidationErrors(validation.errors);
                setShowValidationErrorModal(true);
                throw new BoxPlotValidationError(validation.errors);
            }

            setValidationErrors([]);
            setShowValidationErrorModal(false);

            const config = {
                ...graphConfig,
                variables: selectedVariables
            };

            onCreateGraph(config);
            reset();
            modalProps.closeModal();
        } catch (error) {
            if (error instanceof BoxPlotValidationError) {
                // Handled above
            } else {
                setValidationErrors([{
                    field: 'general',
                    message: 'An unexpected error occurred',
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
                title="Box Plot"
                size="large"
                showCancel={true}
                cancelLabel="Cancel"
                okLabel="Create Graph"
                ok={{ onClick: onCreate }}
                modalType="non-modal"
            >
                <BoxPlotForm projects={projects} datasets={datasets} />
            </Modal>

            <AdvancedValidationModal
                isOpen={showValidationErrorModal}
                onClose={() => setShowValidationErrorModal(false)}
                errors={validationErrors}
                graphType="Box Plot"
                dataFormat={dataFormat || ''}
                selectedVariables={{
                    x: graphConfig?.variables?.x || [],
                    y: graphConfig?.variables?.y || []
                }}
                onRetry={() => setShowValidationErrorModal(false)}
                showDetailedHelp={true}
            />
        </>
    );
};
