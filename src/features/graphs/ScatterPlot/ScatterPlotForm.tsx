import { FC, useEffect, useMemo, useState, useRef } from 'react';
import { Spinner, Text } from '@fluentui/react-components';
import { ScatterHeader } from './components/Header';
import { ProjectAndType } from './components/ProjectAndType';
import { DataFormatSection } from './components/DataFormatSection';
import { VariableSelection } from './components/VariableSelection';
import { ErrorBarsConfiguration } from './components/ErrorBarsConfiguration';
import { MdWarning } from 'react-icons/md';
import { useScatterPlotStore, DataFormat } from './scatterPlotSlice';
import { SUB_TYPES, getValidDataFormats } from './constants';
import { VariableList as VariableListRender } from './VariableList';
import { useScatterPlotStyles } from './styles-hook/use-scatter-plot-styles';
import { useStartProStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { Database } from '@utils';
import { EXCEL } from '@constants';

// Helper function to get data formats based on Symbol Value
const getDataFormatsBySymbolValue = (symbolValue: string): DataFormat[] => {
  switch (symbolValue) {
    case 'Worksheet Columns':
      return ['XY Pair', 'Single Y'];
    case 'Asymmetric Error Bar':
      return ['XY Pair', 'Single Y'];
    case 'Column Means':
      return ['X Many Y', 'Many Y'];
    case 'Row Means':
      return ['XY Replicate'];
    case 'By Category Mean':
      return ['Category Y'];
    case 'Column Median':
      return ['X Many Y', 'Many Y'];
    case 'Row Median':
      return ['X Replicate', 'Y Replicate'];
    case 'By Category Median':
      return ['Category Y'];
    case 'First Column Entry':
      return ['X Many Y', 'Many Y'];
    case 'First Row Entry':
      return ['X Replicate', 'Y Replicate'];
    case 'Last Column Entry':
      return ['X Many Y', 'Many Y'];
    case 'Last Row Entry':
      return ['X Replicate', 'Y Replicate'];
    default:
      return [];
  }
};

// Helper function to check if subType is an error bar type that needs variable selection
const isErrorBarSubType = (subType: string): boolean => {
  return [
    'Simple Scatter Error Bar',
    'Multiple Scatter Error Bar',
    'Simple Scatter Error Bar and Regression',
    'Multiple Scatter Error Bar and Regression',
    'Simple Scatter Horizontal Error Bar',
    'Simple Scatter Bidirectional Error Bars',
    'Vertical Asymmetric Error Bars',
    'Horizontal Asymmetric Error Bars',
    'Bidirectional Asymmetric Error Bars'
  ].includes(subType);
};

// Helper function to check if subType needs Error Bars Configuration dropdowns
const needsErrorBarsConfiguration = (subType: string): boolean => {
  return [
    'Simple Scatter Error Bar',
    'Multiple Scatter Error Bar',
    'Simple Scatter Error Bar and Regression',
    'Multiple Scatter Error Bar and Regression',
    'Simple Scatter Horizontal Error Bar',
    'Simple Scatter Bidirectional Error Bars'
  ].includes(subType);
};

// constants moved to constants.ts

export const ScatterPlotForm: FC<{ projects: string[]; datasets: string[] }> = ({ projects }) => {
  const classes = useScatterPlotStyles();
  const { 
    selectedProject, 
    subType, 
    dataFormat,
    availableVariables,
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
  
  const { projects: projectStore } = useStartProStore(useShallow((state) => ({ projects: state.projects })));

  // State for variable management
  const [availableList, setAvailableList] = useState<Map<string, boolean>>(new Map());
  const [xVariableList, setXVariableList] = useState<Map<string, boolean>>(new Map());
  const [yVariableList, setYVariableList] = useState<Map<string, boolean>>(new Map());
  const [errorBarVariableList, setErrorBarVariableList] = useState<Map<string, boolean>>(new Map());
  const [categoryVariableList, setCategoryVariableList] = useState<Map<string, boolean>>(new Map());
  const [selectAllAvailable, setSelectAllAvailable] = useState<boolean | string | undefined>(false);
  const [selectAllX, setSelectAllX] = useState<boolean | string | undefined>(false);
  const [selectAllY, setSelectAllY] = useState<boolean | string | undefined>(false);
  const [selectAllErrorBar, setSelectAllErrorBar] = useState<boolean | string | undefined>(false);
  const [selectAllCategory, setSelectAllCategory] = useState<boolean | string | undefined>(false);
  const [isLoadingVariables, setIsLoadingVariables] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isUpdatingDataFormat = useRef(false);

  // Clear symbolValue for asymmetric error bar types
  useEffect(() => {
    if (subType && [
      'Vertical Asymmetric Error Bars',
      'Horizontal Asymmetric Error Bars', 
      'Bidirectional Asymmetric Error Bars'
    ].includes(subType)) {
      if (symbolValue) {
        console.log('🔍 Clearing symbolValue for asymmetric error bar:', subType);
        setSymbolValue(undefined);
        setErrorCalculationUpper(undefined);
        setErrorCalculationLower(undefined);
      }
    }
  }, [subType, symbolValue, setSymbolValue, setErrorCalculationUpper, setErrorCalculationLower]);

  // Reset data format when symbol value changes for error bar subplot types
  useEffect(() => {
    if (needsErrorBarsConfiguration(subType || '') && symbolValue && dataFormat && !isUpdatingDataFormat.current) {
      const validFormats = getDataFormatsBySymbolValue(symbolValue);
      if (!validFormats.includes(dataFormat)) {
        isUpdatingDataFormat.current = true;
        // Reset to first valid format or clear if none available
        setDataFormat(validFormats[0] || undefined);
        // Reset the flag after a short delay
        setTimeout(() => {
          isUpdatingDataFormat.current = false;
        }, 0);
      }
    }
  }, [symbolValue, subType, setDataFormat]);

  // Load variables when project is selected
  useEffect(() => {
    if (selectedProject) {
      loadProjectVariables(selectedProject);
    } else {
      setAvailableVariables([]);
      setAvailableList(new Map());
      setXVariableList(new Map());
      setYVariableList(new Map());
    }
  }, [selectedProject]);

  // Update available list when variables are loaded
  useEffect(() => {
    console.log('🔄 Updating available list with variables:', availableVariables);
    const newMap = new Map();
    availableVariables.forEach(variable => {
      newMap.set(variable.name, false);
    });
    console.log('📝 New available list map:', Array.from(newMap.entries()));
    setAvailableList(newMap);
  }, [availableVariables]);

  const loadProjectVariables = async (projectName: string) => {
    setIsLoadingVariables(true);
    setLoadError(null);
    
    try {
      console.log('🔍 Loading variables for project:', projectName);
      const project = projectStore[projectName];
      if (!project) {
        console.log('❌ Project not found in store:', projectName);
        setLoadError('Project not found in workspace');
        return;
      }

      console.log('📁 Project details:', project);

      // Load variables from the project's database
      const db = new Database(project.workspacePath);
      const columnQuery = `PRAGMA table_info(${EXCEL});`;
      
      console.log('🗄️ Database path:', project.workspacePath);
      console.log('📋 Column query:', columnQuery);
      
      const columns = await db.selectQuery(columnQuery);
      console.log('📊 Raw columns from database:', columns);
      
      if (!columns || columns.length === 0) {
        setLoadError('No data columns found in the selected project');
        setAvailableVariables([]);
        return;
      }
      
      const variables = columns.map((col: any) => ({
        id: col.name,
        name: col.name,
        type: 'numeric' as const
      }));
      
      console.log('✅ Processed variables:', variables);
      setAvailableVariables(variables);
    } catch (error) {
      console.error('❌ Failed to load project variables:', error);
      setLoadError(`Failed to load variables: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setAvailableVariables([]);
    } finally {
      setIsLoadingVariables(false);
    }
  };

  const isSimple = subType === 'Simple Scatter' || subType === 'Simple Scatter Regression';
  const isMulti = subType === 'Multiple Scatter' || subType === 'Multiple Scatter Regression';
  const isErrorBar = subType === 'Simple Scatter Error Bar' || 
                     subType === 'Multiple Scatter Error Bar' ||
                     subType === 'Simple Scatter Error Bar and Regression' ||
                     subType === 'Multiple Scatter Error Bar and Regression' ||
                     subType === 'Simple Scatter Horizontal Error Bar' ||
                     subType === 'Simple Scatter Bidirectional Error Bars' ||
                     subType === 'Vertical Asymmetric Error Bars' ||
                     subType === 'Horizontal Asymmetric Error Bars' ||
                     subType === 'Bidirectional Asymmetric Error Bars';
  const isPointPlot = subType === 'Vertical Point Plot' || subType === 'Horizontal Point Plot';
  const isDotPlot = subType === 'Vertical Dot Plot' || subType === 'Horizontal Dot Plot';
  
  const showVariableSelection = isSimple || isMulti || isErrorBar || isPointPlot || isDotPlot;

  // Available data formats based on sub-type and symbol value
  const availableFormats = useMemo<DataFormat[]>(() => {
    if (!subType) return [];
    
    // For asymmetric error bars, use standard mapping (no Symbol Value needed)
    if (isErrorBarSubType(subType) && !needsErrorBarsConfiguration(subType)) {
      return getValidDataFormats(subType);
    }
    
    // For error bar subplot types with Symbol Value configuration
    if (isErrorBarSubType(subType) && symbolValue) {
      return getDataFormatsBySymbolValue(symbolValue);
    }
    
    // For other subplot types, use the standard mapping
    return getValidDataFormats(subType);
  }, [subType, symbolValue]);

  // Determine which variable buckets are required for current format
  const requireX = useMemo(() => {
    switch (dataFormat) {
      // Simple formats
      case 'Single X':
      case 'XY Pair':
        return true;
      
      // Multi formats
      case 'XY Pairs':
      case 'X Many Y':
      case 'Y Many X':
      case 'Many X':
      case 'XY Category':
      case 'X Category':
        return true;
      
      // Replicate formats
      case 'X Single Y Replicate':
      case 'X Many Y Replicates':
      case 'X Replicates':
      case 'Y Single X Replicates':
      case 'Y Many X Replicates':
        return true;
      
      // Special formats
      case 'YX Pairs':
      case 'Category Many X':
        return true;
      
      default:
        return false;
    }
  }, [dataFormat]);

  const requireY = useMemo(() => {
    switch (dataFormat) {
      // Simple formats
      case 'Single Y':
      case 'XY Pair':
        return true;
      
      // Multi formats
      case 'XY Pairs':
      case 'X Many Y':
      case 'Y Many X':
      case 'Many Y':
      case 'XY Category':
      case 'Y Category':
        return true;
      
      // Replicate formats
      case 'Y Replicate':
      case 'Many Y Replicates':
      case 'Y Many X Replicates':
      case 'Many X Replicates':
        return true;
      
      // Special formats
      case 'YX Pairs':
      case 'Category Many Y':
        return true;
      
      default:
        return false;
    }
  }, [dataFormat]);

  const requireErrorBar = useMemo(() => {
    // Error bar variables are ONLY needed for error bar subplot types
    if (subType && isErrorBarSubType(subType)) return true;
    
    return false;
  }, [subType]);

  const requireCategory = useMemo(() => {
    // Category variables are needed for category-based data formats
    if (dataFormat && [
      'XY Category',
      'X Category',
      'Y Category',
      'Category Many Y',
      'Category Many X'
    ].includes(dataFormat)) {
      return true;
    }
    
    return false;
  }, [dataFormat]);

  // Ensure dataFormat remains valid when subType changes
  useEffect(() => {
    if (!availableFormats.length) return;
    if (!dataFormat || !availableFormats.includes(dataFormat)) {
      setDataFormat(availableFormats[0]);
    }
  }, [availableFormats, dataFormat, setDataFormat]);

  // When format changes, clear lists that are not required
  useEffect(() => {
    if (!requireX && xVariableList.size > 0) setXVariableList(new Map());
    if (!requireY && yVariableList.size > 0) setYVariableList(new Map());
  }, [requireX, requireY]);

  // Validation: ensure variable selection satisfies chosen data format
  const xCount = useMemo(() => xVariableList.size, [xVariableList]);
  const yCount = useMemo(() => yVariableList.size, [yVariableList]);
  const availableCheckedCount = useMemo(() => Array.from(availableList.values()).filter(v => v).length, [availableList]);

  // Variable management functions
  const handleSendToX = () => {
    const newXList = new Map(xVariableList);
    const newAvailableList = new Map(availableList);
    // Determine max X allowed for current format
    const maxX = (dataFormat === 'X Many Y') ? 1 : undefined;
    const freeSlots = maxX ? Math.max(0, maxX - newXList.size) : Infinity;
    let moved = 0;
    for (const [variableName, checked] of availableList.entries()) {
      if (!checked) continue;
      if (moved >= freeSlots) break;
        newXList.set(variableName, false);
        newAvailableList.delete(variableName);
      moved++;
      }
    setXVariableList(newXList);
    setAvailableList(newAvailableList);
    if (newAvailableList.size === 0) setSelectAllAvailable(false);
  };

  const handleSendToY = () => {
    const newYList = new Map(yVariableList);
    const newAvailableList = new Map(availableList);
    // Determine max Y allowed for current format
    const maxY = (dataFormat === 'Y Many X') ? 1 : undefined;
    const freeSlots = maxY ? Math.max(0, maxY - newYList.size) : Infinity;
    let moved = 0;
    for (const [variableName, checked] of availableList.entries()) {
      if (!checked) continue;
      if (moved >= freeSlots) break;
        newYList.set(variableName, false);
        newAvailableList.delete(variableName);
      moved++;
      }
    setYVariableList(newYList);
    setAvailableList(newAvailableList);
    if (newAvailableList.size === 0) setSelectAllAvailable(false);
  };

  const handleSendToErrorBar = () => {
    const newErrorBarList = new Map(errorBarVariableList);
    const newAvailableList = new Map(availableList);
    // Error bar variables are limited to 1
    const maxErrorBar = 1;
    const freeSlots = Math.max(0, maxErrorBar - newErrorBarList.size);
    let moved = 0;
    for (const [variableName, checked] of availableList.entries()) {
      if (!checked) continue;
      if (moved >= freeSlots) break;
      newErrorBarList.set(variableName, false);
      newAvailableList.delete(variableName);
      moved++;
    }
    setErrorBarVariableList(newErrorBarList);
    setAvailableList(newAvailableList);
    if (newAvailableList.size === 0) setSelectAllAvailable(false);
  };

  const handleSendToCategory = () => {
    const newCategoryList = new Map(categoryVariableList);
    const newAvailableList = new Map(availableList);
    // Category variables are limited to 1
    const maxCategory = 1;
    const freeSlots = Math.max(0, maxCategory - newCategoryList.size);
    let moved = 0;
    for (const [variableName, checked] of availableList.entries()) {
      if (!checked) continue;
      if (moved >= freeSlots) break;
      newCategoryList.set(variableName, false);
      newAvailableList.delete(variableName);
      moved++;
    }
    setCategoryVariableList(newCategoryList);
    setAvailableList(newAvailableList);
    if (newAvailableList.size === 0) setSelectAllAvailable(false);
  };

  const handleRemoveFromX = () => {
    const newXList = new Map(xVariableList);
    const newAvailableList = new Map(availableList);
    
    xVariableList.forEach((checked, variableName) => {
      if (checked) {
        newXList.delete(variableName);
        newAvailableList.set(variableName, false);
      }
    });
    
    setXVariableList(newXList);
    setAvailableList(newAvailableList);
    if (xVariableList.size === 0) setSelectAllX(false);
  };

  const handleRemoveFromY = () => {
    const newYList = new Map(yVariableList);
    const newAvailableList = new Map(availableList);
    
    yVariableList.forEach((checked, variableName) => {
      if (checked) {
        newYList.delete(variableName);
        newAvailableList.set(variableName, false);
      }
    });
    
    setYVariableList(newYList);
    setAvailableList(newAvailableList);
    if (yVariableList.size === 0) setSelectAllY(false);
  };

  const handleRemoveFromErrorBar = () => {
    const newErrorBarList = new Map(errorBarVariableList);
    const newAvailableList = new Map(availableList);
    
    errorBarVariableList.forEach((checked, variableName) => {
      if (checked) {
        newErrorBarList.delete(variableName);
        newAvailableList.set(variableName, false);
      }
    });
    
    setErrorBarVariableList(newErrorBarList);
    setAvailableList(newAvailableList);
    if (errorBarVariableList.size === 0) setSelectAllErrorBar(false);
  };

  const handleRemoveFromCategory = () => {
    const newCategoryList = new Map(categoryVariableList);
    const newAvailableList = new Map(availableList);
    
    categoryVariableList.forEach((checked, variableName) => {
      if (checked) {
        newCategoryList.delete(variableName);
        newAvailableList.set(variableName, false);
      }
    });
    
    setCategoryVariableList(newCategoryList);
    setAvailableList(newAvailableList);
    if (categoryVariableList.size === 0) setSelectAllCategory(false);
  };

  // Button enable/disable logic for sending from Available → X/Y
  const canSendToX = useMemo(() => {
    if (availableCheckedCount === 0) return false;
    switch (dataFormat) {
      // Simple formats
      case 'Single X':
        return xCount < 1; // cap X to 1
      case 'XY Pair':
        return true; // allow one X
      
      // Multi formats
      case 'X Many Y':
        return xCount < 1; // cap X to 1
      case 'Y Many X':
      case 'Many X':
      case 'XY Pairs':
      case 'XY Category':
      case 'X Category':
        return true; // allow multiple or at least one; no cap here
      
      // Replicate formats
      case 'X Single Y Replicate':
      case 'X Many Y Replicates':
      case 'X Replicates':
      case 'Y Single X Replicates':
      case 'Y Many X Replicates':
        return true; // allow X variables
      
      // Special formats
      case 'YX Pairs':
      case 'Category Many X':
        return true; // allow X variables
      
      default:
        return true;
    }
  }, [availableCheckedCount, dataFormat, xCount]);

  const canSendToY = useMemo(() => {
    if (availableCheckedCount === 0) return false;
    switch (dataFormat) {
      // Simple formats
      case 'Single Y':
        return yCount < 1; // cap Y to 1
      case 'XY Pair':
        return true; // allow one Y
      
      // Multi formats
      case 'Y Many X':
        return yCount < 1; // cap Y to 1
      case 'X Many Y':
      case 'Many Y':
      case 'XY Pairs':
      case 'XY Category':
      case 'Y Category':
        return true; // allow multiple or at least one; no cap here
      
      // Replicate formats
      case 'Y Replicate':
      case 'Many Y Replicates':
      case 'Y Many X Replicates':
      case 'Many X Replicates':
        return true; // allow Y variables
      
      // Special formats
      case 'YX Pairs':
      case 'Category Many Y':
        return true; // allow Y variables
      
      default:
        return true;
    }
  }, [availableCheckedCount, dataFormat, yCount]);

  const canSendToErrorBar = useMemo(() => {
    if (availableCheckedCount === 0) return false;
    // Error bar variables are only needed for error bar subplot types
    if (!subType || !isErrorBarSubType(subType)) return false;
    // Error bar variables are limited to 1
    return errorBarVariableList.size < 1;
  }, [availableCheckedCount, subType, errorBarVariableList.size]);

  const canSendToCategory = useMemo(() => {
    if (availableCheckedCount === 0) return false;
    // Category variables are only needed for category-based data formats
    if (!requireCategory) return false;
    // Category variables are limited to 1
    return categoryVariableList.size < 1;
  }, [availableCheckedCount, requireCategory, categoryVariableList.size]);

  // Keep graphConfig in store up to date with current selections so modal can use it
  useEffect(() => {
    const xVars = Array.from(xVariableList.keys());
    const yVars = Array.from(yVariableList.keys());
    const errorBarVars = Array.from(errorBarVariableList.keys());
    const categoryVars = Array.from(categoryVariableList.keys());
    
    // For asymmetric error bars, don't include symbolValue (should be undefined)
    const isAsymmetricErrorBar = subType && [
      'Vertical Asymmetric Error Bars',
      'Horizontal Asymmetric Error Bars', 
      'Bidirectional Asymmetric Error Bars'
    ].includes(subType);
    
    setGraphConfig({
      selectedProject,
      graphType: 'Scatter Plot',
      subType,
      dataFormat,
      variables: { x: xVars, y: yVars, errorBar: errorBarVars, category: categoryVars },
      symbolValue: isAsymmetricErrorBar ? undefined : symbolValue,
      errorCalculationUpper: isAsymmetricErrorBar ? undefined : errorCalculationUpper,
      errorCalculationLower: isAsymmetricErrorBar ? undefined : errorCalculationLower,
      errorBarVariable: errorBarVars[0], // Use first selected error bar variable
    });
  }, [selectedProject, subType, dataFormat, xVariableList, yVariableList, errorBarVariableList, symbolValue, errorCalculationUpper, errorCalculationLower, setGraphConfig]);

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

      {/* Error Bars Configuration */}
          {subType && needsErrorBarsConfiguration(subType) && (
            <>
              {console.log('🔍 Rendering ErrorBarsConfiguration for subType:', subType)}
              <ErrorBarsConfiguration 
                errorBarVariableList={errorBarVariableList}
                setErrorBarVariableList={setErrorBarVariableList}
              />
            </>
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
        <div className={classes.error}>
          <MdWarning size={20} />
          <Text>{loadError}</Text>
        </div>
      )}

      {/* Variable Selection Layout */}
      {selectedProject && availableVariables.length > 0 && !isLoadingVariables && (
        <VariableSelection
          classes={classes}
          requireX={requireX}
          requireY={requireY}
          requireErrorBar={requireErrorBar}
          requireCategory={requireCategory}
          showVariableSelection={showVariableSelection}
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
          canSendToX={canSendToX}
          canSendToY={canSendToY}
          canSendToErrorBar={canSendToErrorBar}
          canSendToCategory={canSendToCategory}
        />
      )}
    </div>
  );
};

// variable list moved to VariableList.tsx