import { FC, useEffect, useMemo, useRef } from 'react';
import { Spinner, Text, tokens } from '@fluentui/react-components';
import { MdWarning } from 'react-icons/md';
import { ScatterHeader } from './components/Header';
import { ProjectAndType } from './components/ProjectAndType';
import { DataFormatSection } from './components/DataFormatSection';
import { VariableSelection } from './components/VariableSelection';
import { ErrorBarsConfiguration } from './components/ErrorBarsConfiguration';
import { VariableList as VariableListRender } from './VariableList';
import { useScatterPlotStore } from './scatterPlotSlice';
import { useScatterPlotStyles } from './styles-hook/use-scatter-plot-styles';
import { useScatterPlotFormStyles } from './styles-hook';
import { SUB_TYPES } from './constants';
import { useProjectVariables, useVariableManagement, useAvailableFormats } from './hooks';
import { requiresX, requiresY, requiresCategory, canSendToX, canSendToY, canSendToErrorBar, getRequiredErrorBarCount } from './utils';
import { FieldValidationIndicator } from './components/ValidationErrors';
import { validateScatterPlotRequirements } from './utils/validationUtils';
import { getPlotTypeFlags, isAsymmetricErrorBar, needsErrorBarsConfiguration, isErrorBarSubType } from './utils';

/**
 * Main form component for scatter plot configuration
 */
export const ScatterPlotForm: FC<{ projects: string[]; datasets: string[] }> = ({ projects }) => {
  const classes = useScatterPlotStyles();
  const { errorBarValidationStyles, errorBarValidationTextStyles } = useScatterPlotFormStyles();
  const isUpdatingDataFormat = useRef(false);
  
  // Store state
  const { 
    selectedProject, 
    subType, 
    dataFormat,
    symbolValue,
    errorCalculationUpper,
    errorCalculationLower,
    setProject, 
    setSubType, 
    setDataFormat,
    setAvailableVariables,
    setGraphConfig,
    setSymbolValue,
    setErrorCalculationUpper,
    setErrorCalculationLower
  } = useScatterPlotStore();
  
  // Load project variables
  const { variables, isLoading: isLoadingVariables, error: loadError, retry, canRetry, retryCount } = useProjectVariables(selectedProject);

  // Variable management - pass variables so we can filter by type
  const variableManagement = useVariableManagement(dataFormat, subType, variables);
  const {
    availableList,
    xVariableList,
    yVariableList,
    errorBarVariableList,
    categoryVariableList,
    setAvailableList,
    setXVariableList,
    setYVariableList,
    selectAllAvailable,
    selectAllX,
    selectAllY,
    selectAllErrorBar,
    selectAllCategory,
    setSelectAllAvailable,
    setSelectAllX,
    setSelectAllY,
    setSelectAllErrorBar,
    setSelectAllCategory,
    xCount,
    yCount,
    availableCheckedCount,
    handleSendToX,
    handleSendToY,
    handleSendToErrorBar,
    handleSendToCategory,
    handleRemoveFromX,
    handleRemoveFromY,
    handleRemoveFromErrorBar,
    handleRemoveFromCategory,
    canSendToXForReplicates,
    canSendToYForReplicates,
    canSendToXForYReplicates,
    canSendToYForXReplicates,
  } = variableManagement;

  // Available formats based on subtype and symbol value
  const availableFormats = useAvailableFormats(subType, symbolValue);

  // Plot type flags
  const { showVariableSelection } = getPlotTypeFlags(subType);

  // Format requirements
  const requireX = requiresX(dataFormat);
  const requireY = requiresY(dataFormat);
  const requireErrorBar = useMemo(() => {
    return subType ? isErrorBarSubType(subType) : false;
  }, [subType]);
  const requireCategory = requiresCategory(dataFormat);

  // Can send validation
  const canSendX = canSendToX(availableCheckedCount, xCount, dataFormat);
  const canSendY = canSendToY(availableCheckedCount, yCount, dataFormat);
  const canSendErrorBar = canSendToErrorBar(
    availableCheckedCount, 
    errorBarVariableList.size, 
    xCount, 
    yCount, 
    dataFormat, 
    subType
  );
  
  const canSendCategory = useMemo(() => {
    if (availableCheckedCount === 0) return false;
    if (!requireCategory) return false;
    return categoryVariableList.size < 1;
  }, [availableCheckedCount, requireCategory, categoryVariableList.size]);

  // Clear symbolValue for asymmetric error bar types
  useEffect(() => {
    if (isAsymmetricErrorBar(subType)) {
      if (symbolValue) {
        setSymbolValue(undefined);
        setErrorCalculationUpper(undefined);
        setErrorCalculationLower(undefined);
      }
    }
  }, [subType, symbolValue, setSymbolValue, setErrorCalculationUpper, setErrorCalculationLower]);

  // Reset data format when symbol value changes for error bar subplot types
  useEffect(() => {
    if (needsErrorBarsConfiguration(subType || '') && symbolValue && dataFormat && !isUpdatingDataFormat.current) {
      if (!availableFormats.includes(dataFormat)) {
        isUpdatingDataFormat.current = true;
        setDataFormat(availableFormats[0] || undefined);
        setTimeout(() => {
          isUpdatingDataFormat.current = false;
        }, 0);
      }
    }
  }, [symbolValue, subType, dataFormat, setDataFormat, availableFormats]);

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
    const errorBarVars = Array.from(errorBarVariableList.keys());
    const categoryVars = Array.from(categoryVariableList.keys());
    
    
    const isAsymmetric = isAsymmetricErrorBar(subType);
    const isManualAsymmetric = symbolValue === 'Asymmetric Error Bar';
    const shouldUseAsymmetric = isAsymmetric || isManualAsymmetric;
    
    setGraphConfig({
      selectedProject,
      graphType: 'Scatter Plot',
      subType,
      dataFormat,
      variables: { x: xVars, y: yVars, errorBar: errorBarVars, category: categoryVars },
      symbolValue: shouldUseAsymmetric ? 'Asymmetric Error Bar' : symbolValue,
      errorCalculationUpper: shouldUseAsymmetric ? undefined : errorCalculationUpper,
      errorCalculationLower: shouldUseAsymmetric ? undefined : errorCalculationLower,
      errorBarVariable: errorBarVars[0], // Legacy single variable support
    });
  }, [
    selectedProject, 
    subType, 
    dataFormat, 
    xVariableList, 
    yVariableList, 
    errorBarVariableList, 
    categoryVariableList,
    symbolValue, 
    errorCalculationUpper, 
    errorCalculationLower, 
    setGraphConfig
  ]);

  return (
    <div className={classes.root}>
      {/* Header Section */}
      <ScatterHeader classes={classes} />

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

      {/* Error Bar Validation Message */}
      {isErrorBarSubType(subType || '') && dataFormat && (xVariableList.size > 0 || yVariableList.size > 0) && (
        <div style={errorBarValidationStyles}>
          <Text size={300} style={errorBarValidationTextStyles}>
            📊 Error Bar Requirement: {(() => {
              const required = getRequiredErrorBarCount(xVariableList.size, yVariableList.size, dataFormat);
              const current = errorBarVariableList.size;
              
              if (required === 0) return 'No error bars needed for this format';
              if (current === required) return `✅ ${required} error bar variable${required > 1 ? 's' : ''} selected (correct)`;
              if (current < required) return `⚠️ Need ${required} error bar variable${required > 1 ? 's' : ''}, currently have ${current}`;
              return `❌ Too many error bars: need ${required}, have ${current}`;
            })()}
          </Text>
        </div>
      )}

      {/* Error Bars Configuration */}
          {subType && needsErrorBarsConfiguration(subType) && (
              <ErrorBarsConfiguration 
                errorBarVariableList={errorBarVariableList}
          setErrorBarVariableList={variableManagement.setErrorBarVariableList}
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
          requireErrorBar={requireErrorBar}
          requireCategory={requireCategory}
          showVariableSelection={showVariableSelection}
          dataFormat={dataFormat as any}
          subType={subType}
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
          errorBarVariableList={errorBarVariableList}
          selectAllErrorBar={selectAllErrorBar}
          setSelectAllErrorBar={setSelectAllErrorBar}
          setErrorBarVariableList={variableManagement.setErrorBarVariableList}
          categoryVariableList={categoryVariableList}
          selectAllCategory={selectAllCategory}
          setSelectAllCategory={setSelectAllCategory}
          setCategoryVariableList={variableManagement.setCategoryVariableList}
          handleSendToX={handleSendToX}
          handleSendToY={handleSendToY}
          handleSendToErrorBar={handleSendToErrorBar}
          handleSendToCategory={handleSendToCategory}
          handleRemoveFromX={handleRemoveFromX}
          handleRemoveFromY={handleRemoveFromY}
          handleRemoveFromErrorBar={handleRemoveFromErrorBar}
          handleRemoveFromCategory={handleRemoveFromCategory}
          canSendToX={canSendX}
          canSendToY={canSendY}
          canSendToErrorBar={canSendErrorBar}
          canSendToCategory={canSendCategory}
          canSendToXForReplicates={canSendToXForReplicates}
          canSendToYForReplicates={canSendToYForReplicates}
          canSendToXForYReplicates={canSendToXForYReplicates}
          canSendToYForXReplicates={canSendToYForXReplicates}
          xCount={xCount}
          yCount={yCount}
        />
      )}
    </div>
  );
};
