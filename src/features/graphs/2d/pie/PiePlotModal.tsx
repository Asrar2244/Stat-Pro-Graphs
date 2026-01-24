import { FC } from 'react';
import { Modal } from '@libs';
import { PiePlotForm } from './PiePlotForm';
import { usePiePlotStore } from './piePlotSlice';
import { IModal } from '@hooks';

interface PiePlotModalProps extends IModal {
    projects: string[];
    datasets: string[];
    onCreateGraph: (config: any) => void;
}

export const PiePlotModal: FC<PiePlotModalProps> = ({
    projects,
    datasets,
    onCreateGraph,
    ...modalProps
}) => {
    const {
        graphConfig,
        reset,
        selectedVariable,
        selectedLabelVariable
    } = usePiePlotStore();

    const onCreate = () => {
        if (!graphConfig.selectedProject) {
            alert('Please select a project');
            return;
        }
        if (!selectedVariable) {
            alert('Please select a variable for Pie Data');
            return;
        }

        const config = {
            ...graphConfig,
            variables: {
                // Standardizing variable passing. 
                // For Pie, 'y' usually represents values in many Plotly examples if 'x' is labels, 
                // or 'values' and 'labels' props.
                // We'll pass them distinctively.
                values: [selectedVariable],
                labels: selectedLabelVariable ? [selectedLabelVariable] : [],

                // Fallback for generic processors that look for x/y
                x: selectedLabelVariable ? [selectedLabelVariable] : [], // Labels
                y: [selectedVariable] // Values
            }
        };

        onCreateGraph(config);
        reset();
        modalProps.closeModal();
    };

    return (
        <Modal
            {...modalProps}
            title="Pie Chart"
            size="large"
            showCancel={true}
            cancelLabel="Cancel"
            okLabel="Create Graph"
            ok={{ onClick: onCreate }}
            modalType="non-modal"
        >
            <PiePlotForm projects={projects} />
        </Modal>
    );
};
