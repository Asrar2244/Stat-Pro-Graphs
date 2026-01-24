import { FC, useEffect, useState, useMemo } from 'react';
import { Spinner, Text, Button, Field, Dropdown, Option } from '@fluentui/react-components';
import { PieHeader } from './components/Header';
import { usePiePlotStore } from './piePlotSlice';
import { usePiePlotStyles } from './styles-hook/use-pie-plot-styles';
import { useProjectVariables } from './hooks/useProjectVariables';
import { VariableList } from './VariableList';
import { Variable } from './types';
import { MdChevronRight, MdChevronLeft } from 'react-icons/md';

export const PiePlotForm: FC<{ projects: string[] }> = ({ projects }) => {
    const classes = usePiePlotStyles();

    const {
        graphConfig,
        selectedVariable,
        selectedLabelVariable,
        setConfig,
        setSelectedVariable,
        setSelectedLabelVariable
    } = usePiePlotStore();

    const selectedProject = graphConfig.selectedProject;

    const { variables, isLoading, error } = useProjectVariables(selectedProject);

    // Filter variables
    const filteredVariables = useMemo(() => {
        return variables.filter(v => {
            const lowerName = v.name.toLowerCase();
            return !v.name.startsWith('def_col_') &&
                !lowerName.includes('statpro') &&
                !lowerName.includes('start_pro');
        });
    }, [variables]);

    // Local state for lists
    const [availableList, setAvailableList] = useState<Map<string, boolean>>(new Map());
    const [selectedValuesList, setSelectedValuesList] = useState<Map<string, boolean>>(new Map());
    const [selectedLabelsList, setSelectedLabelsList] = useState<Map<string, boolean>>(new Map());

    const [selectAllAvailable, setSelectAllAvailable] = useState<boolean | string | undefined>(false);
    const [selectAllValues, setSelectAllValues] = useState<boolean | string | undefined>(false);
    const [selectAllLabels, setSelectAllLabels] = useState<boolean | string | undefined>(false);

    // Initialize/Update Available List
    useEffect(() => {
        const newAvailable = new Map();
        filteredVariables.forEach(v => {
            // Only add if not already selected
            if (v.name !== selectedVariable && v.name !== selectedLabelVariable) {
                newAvailable.set(v.name, false);
            }
        });
        setAvailableList(newAvailable);
    }, [filteredVariables, selectedVariable, selectedLabelVariable]);

    // Manage Selected Lists
    useEffect(() => {
        const valueMap = new Map();
        if (selectedVariable) valueMap.set(selectedVariable, false);
        setSelectedValuesList(valueMap);

        const labelMap = new Map();
        if (selectedLabelVariable) labelMap.set(selectedLabelVariable, false);
        setSelectedLabelsList(labelMap);
    }, [selectedVariable, selectedLabelVariable]);

    const handleProjectChange = (project: string) => {
        setConfig({ selectedProject: project });
        setSelectedVariable(null);
        setSelectedLabelVariable(null);
    };

    // Move handlers
    const moveToValues = () => {
        // Find checked in available
        let variableToAdd: string | null = null;
        for (const [key, checked] of availableList.entries()) {
            if (checked) {
                variableToAdd = key;
                break; // Only take one
            }
        }
        if (variableToAdd) {
            setSelectedVariable(variableToAdd);
        }
    };

    const moveToLabels = () => {
        // Find checked in available
        let variableToAdd: string | null = null;
        for (const [key, checked] of availableList.entries()) {
            if (checked) {
                variableToAdd = key;
                break; // Only take one
            }
        }
        if (variableToAdd) {
            setSelectedLabelVariable(variableToAdd);
        }
    };

    const removeFromValues = () => {
        setSelectedVariable(null);
    };

    const removeFromLabels = () => {
        setSelectedLabelVariable(null);
    };

    return (
        <div className={classes.root}>
            <PieHeader classes={classes} />

            <div className={classes.projectSection}>
                <Field label="Project" required>
                    <Dropdown
                        placeholder="Choose a project..."
                        value={selectedProject || ''}
                        onOptionSelect={(_, data) => handleProjectChange(data.optionValue || '')}
                    >
                        {projects.map((project) => (
                            <Option key={project} value={project} text={project}>
                                {project}
                            </Option>
                        ))}
                    </Dropdown>
                </Field>
            </div>

            {isLoading && (
                <div className={classes.loading}>
                    <Spinner size="medium" />
                    <Text className={classes.loadingText}>Loading variables...</Text>
                </div>
            )}

            {selectedProject && variables.length > 0 && !isLoading && (
                <div className={classes.variableContainer}>
                    <div className={classes.variableHeader}>
                        <div className={classes.variableHeaderRow}>
                            <Text weight="semibold" className={classes.variableHeaderTitle}>Variable Selection</Text>
                        </div>
                        <Text size={200} className={classes.variableHeaderSubtitle}>
                            Select a numeric variable for the pie slices. Optionally select a label variable.
                        </Text>
                    </div>

                    <div className={classes.columns}>
                        {/* Available Column */}
                        <div className={classes.column}>
                            <div className={classes.columnHeader}>
                                <Text className={classes.columnHeaderTitle}>Available Variables</Text>
                            </div>
                            <VariableList
                                list={availableList}
                                selectAll={selectAllAvailable}
                                setSelectAll={setSelectAllAvailable}
                                setList={setAvailableList}
                                listName="available"
                                selectAllText="Select All"
                            />
                        </div>

                        {/* Selected Column */}
                        <div className={classes.columnNoRightBorder}>
                            {/* Values Selection */}
                            <div style={{ marginBottom: '20px' }}>
                                <div className={classes.columnHeader}>
                                    <Text className={classes.columnHeaderTitle}>Pie Data (Numeric) *</Text>
                                    <span className={classes.columnHeaderBadge}>{selectedVariable ? 1 : 0}/1</span>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <Button
                                            icon={<MdChevronRight />}
                                            onClick={moveToValues}
                                            disabled={!!selectedVariable || Array.from(availableList.values()).filter(Boolean).length === 0}
                                            title="Add to Pie Data"
                                        />
                                        <Button
                                            icon={<MdChevronLeft />}
                                            onClick={removeFromValues}
                                            disabled={!selectedVariable}
                                            title="Remove from Pie Data"
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <VariableList
                                            list={selectedValuesList}
                                            selectAll={selectAllValues}
                                            setSelectAll={setSelectAllValues}
                                            setList={setSelectedValuesList}
                                            listName="values"
                                            selectAllText="Values"
                                            disabled={true} // Read only once moved
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Labels Selection */}
                            <div>
                                <div className={classes.columnHeader}>
                                    <Text className={classes.columnHeaderTitle}>Labels (Optional)</Text>
                                    <span className={classes.columnHeaderBadge}>{selectedLabelVariable ? 1 : 0}/1</span>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <Button
                                            icon={<MdChevronRight />}
                                            onClick={moveToLabels}
                                            disabled={!!selectedLabelVariable || Array.from(availableList.values()).filter(Boolean).length === 0}
                                            title="Add to Labels"
                                        />
                                        <Button
                                            icon={<MdChevronLeft />}
                                            onClick={removeFromLabels}
                                            disabled={!selectedLabelVariable}
                                            title="Remove from Labels"
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <VariableList
                                            list={selectedLabelsList}
                                            selectAll={selectAllLabels}
                                            setSelectAll={setSelectAllLabels}
                                            setList={setSelectedLabelsList}
                                            listName="labels"
                                            selectAllText="Labels"
                                            disabled={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
