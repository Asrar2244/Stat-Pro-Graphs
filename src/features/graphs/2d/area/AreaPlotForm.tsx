import { FC, useEffect, useMemo } from 'react';
import { Spinner, Text, Button } from '@fluentui/react-components';
import { MdWarning } from 'react-icons/md';
import { AreaHeader } from './components/Header';
import { ProjectAndType } from './components/ProjectAndType';
import { DataFormatSection } from './components/DataFormatSection';
import { VariableSelection } from './components/VariableSelection';
import { VariableList as VariableListRender } from './VariableList';
import { useAreaPlotStore } from './areaPlotSlice';
import { useAreaPlotStyles } from './styles-hook/use-area-plot-styles';
import { SUB_TYPES } from './constants';
import { useProjectVariables, useVariableManagement, useAvailableFormats } from './hooks';
import { requiresX, requiresY, canSendToX, canSendToY } from './utils/formatRequirements';

/**
 * Main form component for area plot configuration
 */
export const AreaPlotForm: FC<{ projects: string[]; datasets: string[] }> = ({ projects }) => {
    const classes = useAreaPlotStyles();

    // Store state
    const {
        selectedProject,
        subType,
        dataFormat,
        setProject,
        setSubType,
        setDataFormat,
        setAvailableVariables,
        setGraphConfig,
    } = useAreaPlotStore();

    // Load project variables
    const { variables, isLoading: isLoadingVariables, error: loadError, retry, canRetry, retryCount } = useProjectVariables(selectedProject);

    // Filter out default empty columns before passing to variable management
    const filteredVariables = useMemo(() => {
        return variables.filter(v => {
            const lowerName = v.name.toLowerCase();
            return !v.name.startsWith('def_col_') &&
                !lowerName.includes('statpro') &&
                !lowerName.includes('start_pro');
        });
    }, [variables]);

    // Variable management
    const variableManagement = useVariableManagement(dataFormat, subType as any, filteredVariables);
    const {
        availableList,
        xVariableList,
        yVariableList,
        setAvailableList,
        setXVariableList,
        setYVariableList,
        selectAllAvailable,
        selectAllX,
        selectAllY,
        setSelectAllAvailable,
        setSelectAllX,
        setSelectAllY,
        xCount,
        yCount,
        availableCheckedCount,
        handleSendToX,
        handleSendToY,
        handleRemoveFromX,
        handleRemoveFromY,
    } = variableManagement;

    // Available formats based on subtype
    const availableFormats = useAvailableFormats(subType);
    const showVariableSelection = !!subType;

    // Format requirements using generic utils
    const requireX = requiresX(dataFormat);
    const requireY = requiresY(dataFormat);

    // Can send validation
    const canSendX = canSendToX(availableCheckedCount, xCount, dataFormat);
    const canSendY = canSendToY(availableCheckedCount, yCount, dataFormat);

    // Update store with loaded variables
    useEffect(() => {
        if (variables.length > 0) {
            setAvailableVariables(variables);
        }
    }, [variables.length, setAvailableVariables]);

    // Ensure dataFormat remains valid when subType changes
    useEffect(() => {
        if (!availableFormats.length) return;
        if (!dataFormat || !availableFormats.includes(dataFormat)) {
            setDataFormat(availableFormats[0]);
        }
    }, [availableFormats, dataFormat, setDataFormat]);

    // Clear lists that are not required when format changes
    useEffect(() => {
        if (!requireX && xVariableList.size > 0) setXVariableList(new Map());
        if (!requireY && yVariableList.size > 0) setYVariableList(new Map());
    }, [requireX, requireY, xVariableList.size, yVariableList.size, setXVariableList, setYVariableList]);

    // Keep graphConfig in store up to date
    useEffect(() => {
        const xVars = Array.from(xVariableList.keys());
        const yVars = Array.from(yVariableList.keys());

        setGraphConfig({
            selectedProject,
            graphType: 'Area Plot',
            subType,
            dataFormat,
            variables: { x: xVars, y: yVars },
        });
    }, [
        selectedProject,
        subType,
        dataFormat,
        xVariableList,
        yVariableList,
        setGraphConfig
    ]);

    return (
        <div className={classes.root}>
            {/* Header Section */}
            <AreaHeader classes={classes} />

            {/* Project and Sub-Type Selection */}
            <ProjectAndType
                classes={classes}
                projects={projects}
                selectedProject={selectedProject || null}
                setProject={(p) => setProject(p)}
                subType={subType as any}
                setSubType={(t) => setSubType(t)}
                subTypes={SUB_TYPES as any}
            />

            {/* Data Format Selection */}
            {showVariableSelection && (
                <DataFormatSection
                    classes={classes}
                    dataFormat={dataFormat as any}
                    setDataFormat={(f) => setDataFormat(f)}
                    availableFormats={availableFormats as any}
                />
            )}

            {/* Loading State */}
            {isLoadingVariables && (
                <div className={classes.loading}>
                    <Spinner size="medium" />
                    <Text className={classes.loadingText}>Loading variables from {selectedProject}...</Text>
                </div>
            )}

            {/* Error State */}
            {loadError && (
                <div className={classes.error} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MdWarning size={20} />
                    <div style={{ flex: 1 }}>
                        <Text>{loadError}</Text>
                        {retryCount > 0 && (
                            <Text size={200} style={{ opacity: 0.8 }}>
                                Retry attempt {retryCount} of 3
                            </Text>
                        )}
                    </div>
                    {canRetry && (
                        <Button
                            appearance="secondary"
                            size="small"
                            onClick={retry}
                            disabled={isLoadingVariables}
                        >
                            Retry
                        </Button>
                    )}
                </div>
            )}

            {/* Variable Selection Layout */}
            {selectedProject && variables.length > 0 && !isLoadingVariables && (
                <VariableSelection
                    classes={classes}
                    requireX={requireX}
                    requireY={requireY}
                    showVariableSelection={showVariableSelection}
                    dataFormat={dataFormat as any}
                    subType={subType as any}
                    availableList={availableList}
                    selectAllAvailable={selectAllAvailable}
                    setSelectAllAvailable={setSelectAllAvailable}
                    setAvailableList={setAvailableList}
                    VariableListRender={VariableListRender as any}
                    yVariableList={yVariableList}
                    selectAllY={selectAllY}
                    setSelectAllY={setSelectAllY}
                    setYVariableList={variableManagement.setYVariableList}
                    xVariableList={xVariableList}
                    selectAllX={selectAllX}
                    setSelectAllX={setSelectAllX}
                    setXVariableList={variableManagement.setXVariableList}
                    handleSendToX={handleSendToX}
                    handleSendToY={handleSendToY}
                    handleRemoveFromX={handleRemoveFromX}
                    handleRemoveFromY={handleRemoveFromY}
                    xCount={xCount}
                    yCount={yCount}
                />
            )}
        </div>
    );
};
