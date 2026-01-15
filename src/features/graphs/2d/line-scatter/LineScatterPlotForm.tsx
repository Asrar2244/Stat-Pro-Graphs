import { FC, useEffect, useMemo, useRef } from 'react';
import { Spinner, Text, tokens, Button } from '@fluentui/react-components';
import { MdWarning } from 'react-icons/md';
import { LineScatterHeader } from './components/Header';
import { ProjectAndType } from './components/ProjectAndType';
import { DataFormatSection } from './components/DataFormatSection';
import { VariableSelection } from './components/VariableSelection';
import { ErrorBarsConfiguration } from './components/ErrorBarsConfiguration';
import { VariableList as VariableListRender } from './VariableList';
import { useLineScatterPlotStore } from './lineScatterPlotSlice';
import { useLineScatterPlotStyles } from './styles-hook/use-line-scatter-plot-styles';
import { useLineScatterPlotFormStyles } from './styles-hook';
import { SUB_TYPES } from './constants';
import { useProjectVariables, useVariableManagement, useAvailableFormats } from './hooks';
import { requiresX, requiresY, requiresCategory, canSendToX, canSendToY, canSendToErrorBar, getRequiredErrorBarCount } from './utils';
import { FieldValidationIndicator } from './components/ValidationErrors';
import { validateLineScatterPlotRequirements } from './utils/validationUtils';
import { getPlotTypeFlags, isAsymmetricErrorBar, needsErrorBarsConfiguration, isErrorBarSubType } from './utils';

/**
 * Main form component for line-scatter plot configuration
 */
export const LineScatterPlotForm: FC<{ projects: string[]; datasets: string[] }> = ({ projects }) => {
  const classes = useLineScatterPlotStyles();
  const { errorBarValidationStyles, errorBarValidationTextStyles } = useLineScatterPlotFormStyles();
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
  } = useLineScatterPlotStore();

  // Load project variables
  const { variables, isLoading: isLoadingVariables, error: loadError, retry, canRetry, retryCount } = useProjectVariables(selectedProject);

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
  const variableManagement = useVariableManagement(dataFormat, subType, filteredVariables);
  const {
    availableList,
    xVariableList,
    yVariableList,
    errorBarVariableList,
    categoryVariableList,
    setAvailableList,
    setXVariableList,
    setYVariableList,
    setErrorBarVariableList,
    setCategoryVariableList,
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

  // Reset all lists when project changes
  useEffect(() => {
    if (selectedProject) {
      setAvailableList(new Map());
      setXVariableList(new Map());
      setYVariableList(new Map());
      setErrorBarVariableList(new Map());
      setCategoryVariableList(new Map());
      setSelectAllAvailable(false);
      setSelectAllX(false);
      setSelectAllY(false);
      setSelectAllErrorBar(false);
      setSelectAllCategory(false);
    }
  }, [
    selectedProject,
    setAvailableList,
    setXVariableList,
    setYVariableList,
    setErrorBarVariableList,
    setCategoryVariableList,
    setSelectAllAvailable,
    setSelectAllX,
    setSelectAllY,
    setSelectAllErrorBar,
    setSelectAllCategory,
  ]);

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

  // Set default symbol value for error bar types
  useEffect(() => {
    if (needsErrorBarsConfiguration(subType || '')) {
      // Check if the subplot name explicitly contains "asymmetric" (not just bidirectional)
      const isExplicitlyAsymmetric = subType?.toLowerCase().includes('asymmetric');

      if (isExplicitlyAsymmetric) {
        // For explicitly asymmetric error bar types, clear symbol value
        if (symbolValue) {
          setSymbolValue(undefined);
          setErrorCalculationUpper(undefined);
          setErrorCalculationLower(undefined);
        }
      } else if (!symbolValue) {
        // For all other error bar types (including bidirectional), set default to "Worksheet Columns"
        setSymbolValue('Worksheet Columns');
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
  }, [subType, symbolValue, dataFormat, availableFormats, setDataFormat]);

  // Auto-set first data format when subplot changes
  useEffect(() => {
    if (subType && availableFormats.length > 0 && !isUpdatingDataFormat.current) {
      // Check if current data format is valid for the new subplot
      if (!availableFormats.includes(dataFormat as any)) {
        isUpdatingDataFormat.current = true;
        // Set the first data format as default
        setDataFormat(availableFormats[0] || undefined);
        setTimeout(() => {
          isUpdatingDataFormat.current = false;
        }, 0);
      }
    }
  }, [subType, availableFormats, dataFormat, setDataFormat]);

  // Update available variables when project variables change
  useEffect(() => {
    if (filteredVariables.length > 0) {
      setAvailableVariables(filteredVariables);
    }
  }, [filteredVariables, setAvailableVariables]);

  // Update graph config when form state changes
  useEffect(() => {
    const config = {
      selectedProject,
      subType,
      dataFormat,
      symbolValue,
      errorCalculationUpper,
      errorCalculationLower,
      xVariable: Array.from(xVariableList.entries()).find(([, selected]) => selected)?.[0],
      yVariable: Array.from(yVariableList.entries()).find(([, selected]) => selected)?.[0],
      errorBarVariable: Array.from(errorBarVariableList.entries()).find(([, selected]) => selected)?.[0],
      categoryVariable: Array.from(categoryVariableList.entries()).find(([, selected]) => selected)?.[0],
    };

    setGraphConfig(config);
  }, [
    selectedProject,
    subType,
    dataFormat,
    symbolValue,
    errorCalculationUpper,
    errorCalculationLower,
    xVariableList,
    yVariableList,
    errorBarVariableList,
    categoryVariableList,
    setGraphConfig,
  ]);

  // Update graphConfig whenever variables change (like scatter plot does)
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
      graphType: 'Line-Scatter Plot',
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

  if (isLoadingVariables) {
    return (
      <div style={{ padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spinner size="large" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          backgroundColor: tokens.colorPaletteRedBackground2,
          borderRadius: '4px',
          border: `1px solid ${tokens.colorPaletteRedBorder1}`
        }}>
          <MdWarning color={tokens.colorPaletteRedForeground1} />
          <Text color={tokens.colorPaletteRedForeground1}>
            Failed to load variables: {loadError}
          </Text>
          {canRetry && (
            <Button
              appearance="outline"
              size="small"
              onClick={retry}
            >
              Retry ({retryCount}/3)
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <LineScatterHeader />

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

      {(needsErrorBarsConfiguration(subType) || isAsymmetricErrorBar(subType) || isErrorBarSubType(subType)) && (
        <div className={classes.simpleCard}>
          <ErrorBarsConfiguration
            subType={subType}
            symbolValue={symbolValue}
            errorCalculationUpper={errorCalculationUpper}
            errorCalculationLower={errorCalculationLower}
            onSymbolValueChange={setSymbolValue}
            onErrorCalculationUpperChange={setErrorCalculationUpper}
            onErrorCalculationLowerChange={setErrorCalculationLower}
          />
        </div>
      )}

      {showVariableSelection && selectedProject && (
        <VariableSelection
          classes={classes}
          requireX={requireX}
          requireY={requireY}
          requireErrorBar={requireErrorBar}
          requireCategory={requireCategory}
          showVariableSelection={showVariableSelection}
          dataFormat={dataFormat || ''}
          subType={subType || ''}
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
          errorBarVariableList={errorBarVariableList}
          selectAllErrorBar={selectAllErrorBar}
          setSelectAllErrorBar={setSelectAllErrorBar}
          setErrorBarVariableList={setErrorBarVariableList}
          categoryVariableList={categoryVariableList}
          selectAllCategory={selectAllCategory}
          setSelectAllCategory={setSelectAllCategory}
          setCategoryVariableList={setCategoryVariableList}
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