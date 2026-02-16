import { FC, useEffect, useMemo, useRef } from 'react';
import { Spinner, Text, Button } from '@fluentui/react-components';
import { MdWarning } from 'react-icons/md';
import { ContourHeader } from './components/Header';
import { ProjectAndType } from './components/ProjectAndType';
import { DataFormatSection } from './components/DataFormatSection';
import { VariableSelection } from './components/VariableSelection';
import { ContourConfiguration } from './components/ContourConfiguration';
import { VariableList as VariableListRender } from './VariableList';
import { useContourPlotStore } from './contourPlotSlice';
import { useContourPlotStyles } from './styles-hook/use-contour-plot-styles';
import { useProjectVariables, useVariableManagement, useAvailableFormats } from './hooks';

/**
 * Main form component for Contour plot configuration
 */
export const ContourPlotForm: FC<{ projects: string[]; datasets: string[] }> = ({ projects }) => {
    const classes = useContourPlotStyles();
    const isUpdatingDataFormat = useRef(false);

    // Store state
    const {
        selectedProject,
        dataFormat,
        setProject,
        setDataFormat,
        setAvailableVariables,
        setGraphConfig,
        // Contour configuration values
        contourType,
        setContourType,
        colorScale,
        opacity,
        showGrid,
        gridOpacity,
        zInterval,
        showLabels,
    } = useContourPlotStore();

    // Load project variables
    const { variables, isLoading: isLoadingVariables, error: loadError, retry, canRetry, retryCount } = useProjectVariables(selectedProject || undefined);

    // Filter out default empty columns and internal ID columns
    const filteredVariables = useMemo(() => {
        return variables.filter(v => {
            const lowerName = v.name.toLowerCase();
            return !v.name.startsWith('def_col_') &&
                !lowerName.includes('statpro') &&
                !lowerName.includes('start_pro');
        });
    }, [variables]);

    // Variable management - pass variables so we can filter by type
    const variableManagement = useVariableManagement(dataFormat || undefined, filteredVariables);
    const {
        availableList,
        xVariableList,
        yVariableList,
        zVariableList,
        setAvailableList,
        setXVariableList,
        setYVariableList,
        setZVariableList,
        selectAllAvailable,
        selectAllX,
        selectAllY,
        selectAllZ,
        setSelectAllAvailable,
        setSelectAllX,
        setSelectAllY,
        setSelectAllZ,
        xCount,
        yCount,
        zCount,
        handleSendToX,
        handleSendToY,
        handleSendToZ,
        handleRemoveFromX,
        handleRemoveFromY,
        handleRemoveFromZ,
        canSendX,
        canSendY,
        canSendZ,
    } = variableManagement;

    // Available formats
    const availableFormats = useAvailableFormats();

    // Format requirements
    const requireX = useMemo(() => {
        return dataFormat === 'XYZ Triplets' || dataFormat === 'XY Many Z';
    }, [dataFormat]);

    const requireY = useMemo(() => {
        return dataFormat === 'XYZ Triplets' || dataFormat === 'XY Many Z';
    }, [dataFormat]);

    const requireZ = useMemo(() => {
        return true; // All contour formats require Z variables
    }, []);

    // Update store with loaded variables
    useEffect(() => {
        if (variables.length > 0) {
            setAvailableVariables(variables);
        }
    }, [variables.length, setAvailableVariables]);

    // Ensure dataFormat remains valid when available formats change
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
        const zVars = Array.from(zVariableList.keys());

        setGraphConfig({
            selectedProject: selectedProject || '',
            graphType: '3D Contour Plot',
            dataFormat: dataFormat || 'XYZ Triplets',
            variables: { x: xVars, y: yVars, z: zVars },
            contourConfig: {
                contourType,
                colorScale,
                opacity,
                showGrid,
                gridOpacity,
                zInterval,
                showLabels,
            },
        });
    }, [
        selectedProject,
        dataFormat,
        xVariableList,
        yVariableList,
        zVariableList,
        setGraphConfig,
        // Include contour configuration values
        contourType,
        colorScale,
        opacity,
        showGrid,
        gridOpacity,
        zInterval,
        showLabels,
    ]);

    return (
        <div className={classes.root}>
            {/* Header Section */}
            <ContourHeader classes={classes} />

            {/* Project Selection */}
            <ProjectAndType
                classes={classes}
                projects={projects}
                selectedProject={selectedProject || null}
                setProject={(p) => setProject(p)}
                contourType={contourType}
                setContourType={setContourType}
            />

            {/* Data Format Selection */}
            <DataFormatSection
                classes={classes}
                dataFormat={dataFormat}
                setDataFormat={(f) => setDataFormat(f)}
                availableFormats={availableFormats}
            />

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
                    requireZ={requireZ}
                    showVariableSelection={true}
                    dataFormat={dataFormat || ''}
                    availableList={availableList}
                    selectAllAvailable={selectAllAvailable}
                    setSelectAllAvailable={setSelectAllAvailable}
                    setAvailableList={setAvailableList}
                    VariableListRender={VariableListRender as any}
                    yVariableList={yVariableList}
                    selectAllY={selectAllY}
                    setSelectAllY={setSelectAllY}
                    setYVariableList={setYVariableList}
                    xVariableList={xVariableList}
                    selectAllX={selectAllX}
                    setSelectAllX={setSelectAllX}
                    setXVariableList={setXVariableList}
                    zVariableList={zVariableList}
                    selectAllZ={selectAllZ}
                    setSelectAllZ={setSelectAllZ}
                    setZVariableList={setZVariableList}
                    handleSendToX={handleSendToX}
                    handleSendToY={handleSendToY}
                    handleSendToZ={handleSendToZ}
                    handleRemoveFromX={handleRemoveFromX}
                    handleRemoveFromY={handleRemoveFromY}
                    handleRemoveFromZ={handleRemoveFromZ}
                    canSendToX={canSendX}
                    canSendToY={canSendY}
                    canSendToZ={canSendZ}
                    xCount={xCount}
                    yCount={yCount}
                    zCount={zCount}
                />
            )}

            {/* Contour Configuration */}
            <ContourConfiguration classes={classes} />
        </div>
    );
};
