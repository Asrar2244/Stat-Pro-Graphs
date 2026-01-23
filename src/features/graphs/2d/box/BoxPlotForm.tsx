import { FC, useEffect, useMemo, useRef } from 'react';
import { Spinner, Text, Button } from '@fluentui/react-components';
import { MdWarning } from 'react-icons/md';

import { BoxHeader } from './components/Header';
import { ProjectAndType } from './components/ProjectAndType';
import { DataFormatSection } from './components/DataFormatSection';
import { VariableSelection } from './components/VariableSelection';
import { VariableList as VariableListRender } from './VariableList';

import { useBoxPlotStore } from './boxPlotSlice';
import { useBoxPlotStyles } from './styles-hook/use-box-plot-styles';
import { SUB_TYPES, getValidDataFormats } from './constants';
import { useProjectVariables, useVariableManagement } from './hooks';
import { requiresX, requiresY, canSendToX, canSendToY } from './utils';

export const BoxPlotForm: FC<{ projects: string[]; datasets: string[] }> = ({ projects }) => {
    const classes = useBoxPlotStyles();
    const isUpdatingDataFormat = useRef(false);

    const {
        selectedProject,
        subType,
        dataFormat,
        setProject,
        setSubType,
        setDataFormat,
        setAvailableVariables,
        setGraphConfig,
        boxWidth, showMean, showOutliers, showAllPoints, orientation
    } = useBoxPlotStore();

    const { variables, isLoading: isLoadingVariables, error: loadError, retry, canRetry, retryCount } = useProjectVariables(selectedProject);

    const filteredVariables = useMemo(() => {
        return variables.filter(v => {
            const lowerName = v.name.toLowerCase();
            return !v.name.startsWith('def_col_') &&
                !lowerName.includes('statpro') &&
                !lowerName.includes('start_pro');
        });
    }, [variables]);

    const variableManagement = useVariableManagement(dataFormat, filteredVariables);
    const {
        availableList, xVariableList, yVariableList,
        setAvailableList, setXVariableList, setYVariableList,
        selectAllAvailable, selectAllX, selectAllY,
        setSelectAllAvailable, setSelectAllX, setSelectAllY,
        handleSendToX, handleSendToY, handleRemoveFromX, handleRemoveFromY,
        availableCheckedCount, xCount, yCount
    } = variableManagement;

    const availableFormats = useMemo(() => {
        return getValidDataFormats(subType);
    }, [subType]);

    // Format requirements
    const requireX = requiresX(dataFormat);
    const requireY = requiresY(dataFormat);

    // Can send validation
    const canSendX = canSendToX(availableCheckedCount, xCount, dataFormat);
    const canSendY = canSendToY(availableCheckedCount, yCount, dataFormat);

    // Ensure dataFormat remains valid
    useEffect(() => {
        if (!availableFormats.length) return;
        if (!dataFormat || !availableFormats.includes(dataFormat)) {
            setDataFormat(availableFormats[0]);
        }
    }, [availableFormats, dataFormat, setDataFormat]);

    // Update store with loaded variables
    useEffect(() => {
        if (variables.length > 0) {
            setAvailableVariables(variables);
        }
    }, [variables.length, setAvailableVariables]);

    // Keep graphConfig updated
    useEffect(() => {
        const xVars = Array.from(xVariableList.keys());
        const yVars = Array.from(yVariableList.keys());

        setGraphConfig({
            selectedProject: selectedProject || '',
            graphType: 'Box Plot',
            subType: subType,
            dataFormat: dataFormat,
            variables: { x: xVars, y: yVars },
            boxWidth, showMean, showOutliers, showAllPoints, orientation
        });
    }, [
        selectedProject, subType, dataFormat,
        xVariableList, yVariableList,
        boxWidth, showMean, showOutliers, showAllPoints, orientation,
        setGraphConfig
    ]);

    return (
        <div className={classes.root}>
            <BoxHeader classes={classes} />

            <ProjectAndType
                classes={classes}
                projects={projects}
                selectedProject={selectedProject}
                setProject={setProject}
                subType={subType}
                setSubType={setSubType}
                subTypes={SUB_TYPES}
            />

            <DataFormatSection
                classes={classes}
                dataFormat={dataFormat}
                setDataFormat={setDataFormat}
                availableFormats={availableFormats}
            />

            {isLoadingVariables && (
                <div className={classes.loading}>
                    <Spinner size="medium" />
                    <Text className={classes.loadingText}>Loading variables...</Text>
                </div>
            )}

            {loadError && (
                <div className={classes.error}>
                    <Text>{loadError}</Text>
                    {canRetry && <Button onClick={retry}>Retry</Button>}
                </div>
            )}

            {selectedProject && variables.length > 0 && !isLoadingVariables && (
                <VariableSelection
                    classes={classes}
                    availableList={availableList}
                    selectAllAvailable={selectAllAvailable}
                    setSelectAllAvailable={setSelectAllAvailable}
                    setAvailableList={setAvailableList}
                    VariableListRender={VariableListRender}

                    yVariableList={yVariableList}
                    selectAllY={selectAllY}
                    setSelectAllY={setSelectAllY}
                    setYVariableList={setYVariableList}

                    xVariableList={xVariableList}
                    selectAllX={selectAllX}
                    setSelectAllX={setSelectAllX}
                    setXVariableList={setXVariableList}

                    handleSendToX={handleSendToX}
                    handleSendToY={handleSendToY}
                    handleRemoveFromX={handleRemoveFromX}
                    handleRemoveFromY={handleRemoveFromY}

                    requireX={requireX}
                    requireY={requireY}
                    canSendToX={canSendX}
                    canSendToY={canSendY}
                />
            )}
        </div>
    );
};
