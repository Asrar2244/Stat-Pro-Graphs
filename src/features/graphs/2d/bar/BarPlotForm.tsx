import { FC, useEffect } from 'react';
import { useBarPlotStore } from './barPlotSlice';
import { SUB_TYPES } from './constants';
import { useBarPlotStyles, useBarPlotFormStyles } from './styles-hook';
import { useProjectVariables, useBarAvailableFormats, useBarVariableManagement } from './hooks';
import {
    BarHeader,
    ProjectAndType,
    DataFormatSection,
    VariableSelection,
    VariableList as VariableListRender,
    ErrorBarsConfiguration,
} from './components';
import {
    requiresX,
    requiresY,
    requiresCategory,
    requiresErrorBar,
    canSendToX,
    canSendToY,
    canSendToCategory,
    canSendToErrorBar
} from './utils/formatRequirements';

/*
 * BarPlotForm Component
 * Main form for configuring bar plots
 */

interface BarPlotFormProps {
    projects?: string[];
    datasets?: string[];
}

export const BarPlotForm: FC<BarPlotFormProps> = ({ projects = [], datasets = [] }) => {
    const styles = useBarPlotStyles();
    const formStyles = useBarPlotFormStyles();

    // Store state
    const {
        selectedProject,
        subType,
        dataFormat,
        setProject,
        setSubType,
        setDataFormat,
        setAvailableVariables,
        availableVariables,
        setGraphConfig,
        uploadedFileName,
        uploadedData,
        dataSource,
        // Error bar stuff
        symbolValue,
        errorCalculationUpper,
        errorCalculationLower,
        errorBarVariable,
    } = useBarPlotStore();

    // Load project variables
    const { variables, isLoading, error: loadError } = useProjectVariables(selectedProject);

    // Sync variables to store
    useEffect(() => {
        setAvailableVariables(variables);
    }, [variables, setAvailableVariables]);

    // Derived state
    const availableFormats = useBarAvailableFormats(subType, symbolValue);

    // Ensure dataFormat remains valid when subType changes
    useEffect(() => {
        if (!availableFormats.length) return;
        if (!dataFormat || !availableFormats.includes(dataFormat)) {
            setDataFormat(availableFormats[0]);
        }
    }, [availableFormats, dataFormat, setDataFormat]);

    // Initialize variable management
    const variableManagement = useBarVariableManagement(dataFormat, subType, availableVariables);

    // Sync validation logic moved to Modal to avoid redundancy

    // Determine visibility flags
    const showVariableSelection = !!subType;
    const requireX = requiresX(dataFormat);
    const requireY = requiresY(dataFormat);
    const requireCategory = requiresCategory(dataFormat);
    const requireErrorBarVal = requiresErrorBar(subType);

    // Determine if specific variable slots need to be hidden/shown is handled by VariableSelection logic + dataFormat check inside it.
    // But we pass flags.

    return (
        <div className={styles.root}>
            <BarHeader classes={styles} />

            <ProjectAndType
                classes={styles}
                projects={projects}
                selectedProject={selectedProject || null}
                setProject={setProject}
                subType={subType}
                setSubType={setSubType}
                subTypes={SUB_TYPES}
            />

            {subType && (
                <DataFormatSection
                    classes={styles}
                    dataFormat={dataFormat || undefined}
                    setDataFormat={setDataFormat}
                    availableFormats={availableFormats}
                />
            )}

            {requireErrorBarVal && (
                <ErrorBarsConfiguration
                    errorBarVariableList={variableManagement.errorBarVariableList}
                    setErrorBarVariableList={variableManagement.setErrorBarVariableList}
                />
            )}

            {dataFormat && (
                <VariableSelection
                    classes={styles}
                    requireX={requireX}
                    requireY={requireY}
                    requireErrorBar={requireErrorBarVal}
                    requireCategory={requireCategory}
                    showVariableSelection={showVariableSelection}
                    dataFormat={dataFormat}
                    subType={subType}
                    availableList={variableManagement.availableList}
                    selectAllAvailable={variableManagement.selectAllAvailable}
                    setSelectAllAvailable={variableManagement.setSelectAllAvailable}
                    setAvailableList={variableManagement.setAvailableList}
                    VariableListRender={VariableListRender}

                    yVariableList={variableManagement.yVariableList}
                    selectAllY={variableManagement.selectAllY}
                    setSelectAllY={variableManagement.setSelectAllY}
                    setYVariableList={variableManagement.setYVariableList}

                    xVariableList={variableManagement.xVariableList}
                    selectAllX={variableManagement.selectAllX}
                    setSelectAllX={variableManagement.setSelectAllX}
                    setXVariableList={variableManagement.setXVariableList}

                    errorBarVariableList={variableManagement.errorBarVariableList}
                    selectAllErrorBar={variableManagement.selectAllErrorBar}
                    setSelectAllErrorBar={variableManagement.setSelectAllErrorBar}
                    setErrorBarVariableList={variableManagement.setErrorBarVariableList}

                    categoryVariableList={variableManagement.categoryVariableList}
                    selectAllCategory={variableManagement.selectAllCategory}
                    setSelectAllCategory={variableManagement.setSelectAllCategory}
                    setCategoryVariableList={variableManagement.setCategoryVariableList}

                    handleSendToX={variableManagement.handleSendToX}
                    handleSendToY={variableManagement.handleSendToY}
                    handleSendToErrorBar={variableManagement.handleSendToErrorBar}
                    handleSendToCategory={variableManagement.handleSendToCategory}

                    handleRemoveFromX={variableManagement.handleRemoveFromX}
                    handleRemoveFromY={variableManagement.handleRemoveFromY}
                    handleRemoveFromErrorBar={variableManagement.handleRemoveFromErrorBar}
                    handleRemoveFromCategory={variableManagement.handleRemoveFromCategory}

                    canSendToX={canSendToX(variableManagement.availableCheckedCount, variableManagement.xCount, dataFormat)}
                    canSendToY={canSendToY(variableManagement.availableCheckedCount, variableManagement.yCount, dataFormat)}
                    canSendToErrorBar={canSendToErrorBar(
                        variableManagement.availableCheckedCount,
                        variableManagement.errorBarVariableList.size,
                        variableManagement.xCount,
                        variableManagement.yCount,
                        dataFormat,
                        subType
                    )}
                    canSendToCategory={canSendToCategory(
                        variableManagement.availableCheckedCount,
                        variableManagement.categoryVariableList.size,
                        dataFormat
                    )}

                    canSendToYForReplicates={variableManagement.canSendToYForReplicates}
                    canSendToXForYReplicates={variableManagement.canSendToXForYReplicates}
                    canSendToYForXReplicates={variableManagement.canSendToYForXReplicates}

                    xCount={variableManagement.xCount}
                    yCount={variableManagement.yCount}
                />
            )}

            {/* Validation and Create Button removed to match Scatter Plot behavior (handled by Modal) */}
        </div>
    );
};
