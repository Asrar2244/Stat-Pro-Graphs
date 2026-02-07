import React, { useCallback, FC, useEffect } from 'react';
import {
    Text,
    makeStyles,
    shorthands
} from '@fluentui/react-components';
import { Modal } from '@libs';
import { useAnalyticsStore } from './store/analyticsSlice';
import { AnalyticsVariableSelection } from './components/AnalyticsVariableSelection';
import { AnalyticsHeader } from './components/AnalyticsHeader';
import { getComputer } from './computers';
import { useProjectVariables } from '../../3d/scatter/hooks/useProjectVariables';
import { useAnalyticsVariables } from './hooks/useAnalyticsVariables';
import { Database } from '@utils';
import { EXCEL } from '@constants';
import { useStartProStore } from '@store';
import { useShallow } from 'zustand/react/shallow';

interface AnalyticsModalProps {
    open: boolean;
    projects: string[]; // Added projects prop
    datasets: string[]; // (Unused for now but kept for consistency)
    onClose: () => void;
    onCreateGraph: (config: any) => void;
}

const useStyles = makeStyles({
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: '500px',
        ...shorthands.padding('16px'),
    }
});

import { ValidationErrorModal } from '../../shared/components/ValidationErrorModal';
import { ValidationError } from '../../shared/types/validation';

export const AnalyticsModal: FC<AnalyticsModalProps> = ({ open, projects, onClose, onCreateGraph }) => {
    const styles = useStyles();
    const {
        selectedProject,
        setProject,
        subType,
        setSubType,
        variableSelections: selectionsMap,
        analyticsConfig,
        dataFormat,
    } = useAnalyticsStore();

    // Default to first project if none selected
    useEffect(() => {
        if (open && projects.length > 0 && !selectedProject) {
            setProject(projects[0]);
        }
    }, [open, projects, selectedProject, setProject]);

    // Load variables from project
    const { variables } = useProjectVariables(selectedProject);
    useAnalyticsVariables(variables);

    const { projects: projectStore } = useStartProStore(
        useShallow((state) => ({ projects: state.projects }))
    );

    const [validationErrors, setValidationErrors] = React.useState<ValidationError[]>([]);

    const computer = subType ? getComputer(subType) : undefined;

    const handleCreateGraph = useCallback(async () => {
        if (!computer || !selectedProject) return;

        const variablesRecord: Record<string, string[]> = {};
        selectionsMap.forEach((val, key) => {
            variablesRecord[key] = val;
        });

        // 1. Basic Structural Validation (Computer dependent)
        const validation = computer.validate(variablesRecord);
        if (!validation.isValid) {
            setValidationErrors([{
                message: validation.error || "Invalid configuration",
                severity: 'error'
            }]);
            return;
        }

        // 2. Data Range Validation for ROC
        if (subType === 'ROC_CURVE' && dataFormat !== 'XY Pairs') {
            const predictorCols = variablesRecord['predictor'] || [];
            const project = projectStore[selectedProject];

            if (project && predictorCols.length > 0) {
                try {
                    const db = new Database(project.workspacePath);
                    const rangeErrors: ValidationError[] = [];

                    for (const col of predictorCols) {
                        // Check for values outside [0, 1]
                        const query = `SELECT "${col}" as val FROM ${EXCEL} WHERE "${col}" < 0 OR "${col}" > 1 LIMIT 5`;
                        const outOfRange = await db.selectQuery(query);

                        if (outOfRange && outOfRange.length > 0) {
                            const samples = outOfRange.map(r => r.val).join(', ');
                            rangeErrors.push({
                                field: `Predictor: ${col}`,
                                message: `Values must be between 0 and 1. Found invalid samples: [${samples}${outOfRange.length >= 5 ? '...' : ''}]`,
                                severity: 'error'
                            });
                        }
                    }

                    if (rangeErrors.length > 0) {
                        setValidationErrors(rangeErrors);
                        return;
                    }
                } catch (err) {
                    console.warn("Skipping data range validation due to query error", err);
                }
            }
        }

        try {
            const plotConfig = computer.compute([], variablesRecord, { ...analyticsConfig, dataFormat });

            const newGraph = {
                graphType: 'Data Analytics',
                subType: computer.displayName,
                selectedProject: selectedProject,
                dataFormat: dataFormat, // Use the selected data format
                analyticsData: {
                    type: computer.type,
                    plotConfig,
                    variables: variablesRecord
                },
                ...plotConfig.data,
            };

            onCreateGraph(newGraph);
            onClose();
        } catch (e: any) {
            console.error("Analytics Error", e);
            setValidationErrors([{
                message: e.message || "Failed to compute analytics",
                severity: 'error'
            }]);
        }
    }, [computer, selectionsMap, analyticsConfig, selectedProject, projectStore, dataFormat, onCreateGraph, onClose]);

    React.useEffect(() => {
        if (open) {
            setValidationErrors([]);
        }
    }, [open]);

    // Check if we can enable the create button
    const canCreate = !!computer && !!selectedProject;

    return (
        <>
            <Modal
                open={open}
                closeModal={onClose}
                openModal={() => { }}
                toggleModal={() => { }}
                title="Data Analytics & Statistical Plots"
                size="large" // Matches BarPlotModal size for consistency
                modalType="non-modal" // Enables floating/draggable behavior
                showCancel={true}
                cancelLabel="Cancel"
                okLabel="Create Graph"
                ok={{
                    onClick: handleCreateGraph,
                    disabled: !canCreate
                }}
            >
                <div className={styles.content}>
                    <AnalyticsHeader
                        projects={projects}
                        selectedProject={selectedProject}
                        onProjectChange={setProject}
                        subType={subType}
                        onSubTypeChange={setSubType}
                    />

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {subType ? (
                            <AnalyticsVariableSelection />
                        ) : (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#888' }}>
                                Select an Analysis Type above to configure variables.
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            <ValidationErrorModal
                isOpen={validationErrors.length > 0}
                errors={validationErrors}
                onClose={() => setValidationErrors([])}
                graphType={computer?.displayName || "Analytics Plot"}
            />
        </>
    );
};
