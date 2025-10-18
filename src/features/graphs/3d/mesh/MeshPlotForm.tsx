import { FC, useEffect, useMemo, useRef } from 'react';
import { Spinner, Text, tokens, Button } from '@fluentui/react-components';
import { MdWarning } from 'react-icons/md';
import { MeshHeader } from './components/Header';
import { ProjectAndType } from './components/ProjectAndType';
import { DataFormatSection } from './components/DataFormatSection';
import { VariableSelection } from './components/VariableSelection';
import { MeshConfiguration } from './components/MeshConfiguration';
import { VariableList as VariableListRender } from './VariableList';
import { useMeshPlotStore } from './meshPlotSlice';
import { useMeshPlotStyles } from './styles-hook/use-mesh-plot-styles';
import { DATA_FORMATS } from './constants';
import { useProjectVariables, useVariableManagement, useAvailableFormats } from './hooks';

/**
 * Main form component for 3D mesh plot configuration
 */
export const MeshPlotForm: FC<{ projects: string[]; datasets: string[] }> = ({ projects }) => {
  const classes = useMeshPlotStyles();
  const isUpdatingDataFormat = useRef(false);
  
  // Store state
  const { 
    selectedProject, 
    dataFormat,
    setProject, 
    setDataFormat,
    setAvailableVariables,
    setGraphConfig,
  } = useMeshPlotStore();
  
  // Load project variables
  const { variables, isLoading: isLoadingVariables, error: loadError, retry, canRetry, retryCount } = useProjectVariables(selectedProject);

  // Variable management - pass variables so we can filter by type
  const variableManagement = useVariableManagement(dataFormat, variables);
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

  // Available formats (all formats are valid for 3D mesh)
  const availableFormats = useAvailableFormats();

  // Format requirements
  const requireX = useMemo(() => {
    return dataFormat === 'XYZ Triplets' || dataFormat === 'XY Many Z';
  }, [dataFormat]);
  
  const requireY = useMemo(() => {
    return dataFormat === 'XYZ Triplets' || dataFormat === 'XY Many Z';
  }, [dataFormat]);
  
  const requireZ = useMemo(() => {
    return true; // All formats require Z variables
  }, []);

  // Update store with loaded variables
  useEffect(() => {
    if (variables.length > 0) {
      setAvailableVariables(variables);
    }
  }, [variables.length, setAvailableVariables]);

  // Update available list when variables are loaded (but preserve existing selections)
  useEffect(() => {
    if (variables.length === 0) return;
    
    // Only update if we don't have any variables in the available list yet
    // This prevents clearing user selections when variables reload
    if (availableList.size === 0) {
      const newMap = new Map();
      // Show all variables in available list - filtering happens at send time
      variables.forEach(variable => {
        newMap.set(variable.name, false);
      });
      setAvailableList(newMap);
    } else {
      // If we already have variables, only add new ones that aren't already present
      const newMap = new Map(availableList);
      let hasNewVariables = false;
      
      variables.forEach(variable => {
        if (!newMap.has(variable.name)) {
          newMap.set(variable.name, false);
          hasNewVariables = true;
        }
      });
      
      // Only update if we found new variables
      if (hasNewVariables) {
        setAvailableList(newMap);
      }
    }
  }, [variables.length, setAvailableList, availableList]);

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
      graphType: '3D Mesh Plot',
      dataFormat: dataFormat || 'XYZ Triplets',
      variables: { x: xVars, y: yVars, z: zVars },
      meshConfig: {
        opacity: 0.9,
        surfaceType: 'mesh',
        colorScale: 'viridis',
        showContours: true,
        contourOpacity: 0.6,
        lighting: false,
        smoothShading: true,
        showGrid: true,
        gridOpacity: 0.5,
      },
    });
  }, [
    selectedProject, 
    dataFormat, 
    xVariableList, 
    yVariableList, 
    zVariableList,
    setGraphConfig
  ]);

  return (
    <div className={classes.root}>
      {/* Header Section */}
      <MeshHeader classes={classes} />

      {/* Project Selection */}
      <ProjectAndType
        classes={classes}
        projects={projects}
        selectedProject={selectedProject || null}
        setProject={(p) => setProject(p)}
      />

      {/* Data Format Selection */}
      <DataFormatSection
        classes={classes}
        dataFormat={dataFormat as any}
        setDataFormat={(f) => setDataFormat(f)}
        availableFormats={availableFormats as any}
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
          dataFormat={dataFormat as any}
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

      {/* Mesh Configuration - Only show when project is selected */}
      {selectedProject && (
        <MeshConfiguration classes={classes} />
      )}
    </div>
  );
};