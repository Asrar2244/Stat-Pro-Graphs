import React, { FC, useEffect, useMemo, useState } from 'react';
import { Spinner, Text, tokens } from '@fluentui/react-components';
import { ScatterHeader } from './components/Header';
import { ProjectAndType } from './components/ProjectAndType';
import { DataFormatSection } from './components/DataFormatSection';
import { VariableSelection } from './components/VariableSelection';
import { MdWarning } from 'react-icons/md';
import { useScatterPlotStore, ScatterSubType, DataFormat } from './scatterPlotSlice';
import { SUB_TYPES } from './constants';
import { VariableList as VariableListRender } from './VariableList';
import { useScatterPlotStyles } from './styles-hook/use-scatter-plot-styles';
import { useStartProStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { Database } from '@utils';
import { EXCEL } from '@constants';

// constants moved to constants.ts

export const ScatterPlotForm: FC<{ projects: string[]; datasets: string[] }> = ({ projects }) => {
  const classes = useScatterPlotStyles();
  const { 
    selectedProject, 
    subType, 
    dataFormat,
    availableVariables,
    setProject, 
    setSubType, 
    setDataFormat,
    setAvailableVariables,
    setGraphConfig
  } = useScatterPlotStore();
  
  const { projects: projectStore } = useStartProStore(useShallow((state) => ({ projects: state.projects })));

  // State for variable management
  const [availableList, setAvailableList] = useState<Map<string, boolean>>(new Map());
  const [xVariableList, setXVariableList] = useState<Map<string, boolean>>(new Map());
  const [yVariableList, setYVariableList] = useState<Map<string, boolean>>(new Map());
  const [selectAllAvailable, setSelectAllAvailable] = useState<boolean | string | undefined>(false);
  const [selectAllX, setSelectAllX] = useState<boolean | string | undefined>(false);
  const [selectAllY, setSelectAllY] = useState<boolean | string | undefined>(false);
  const [isLoadingVariables, setIsLoadingVariables] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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
  const isMulti = subType === 'Multi Scatter' || subType === 'Multi Scatter Regression';
  const showVariableSelection = isSimple || isMulti;

  // Available data formats based on sub-type
  const availableFormats = useMemo<DataFormat[]>(() => {
    if (isSimple) return ['XY Pair', 'Single Y', 'Single X'];
    if (isMulti) return [
      'XY Pairs',
      'X Many Y',
      'Y Many X',
      'Many X',
      'Many Y',
      'XY Category',
      'X Category',
      'Y Category',
    ];
    return [];
  }, [isSimple, isMulti]);

  // Determine which variable buckets are required for current format
  const requireX = useMemo(() => {
    switch (dataFormat) {
      case 'Single X':
      case 'XY Pair':
      case 'XY Pairs':
      case 'X Many Y':
      case 'Y Many X':
      case 'Many X':
      case 'XY Category':
      case 'X Category':
        return true;
      default:
        return false;
    }
  }, [dataFormat]);

  const requireY = useMemo(() => {
    switch (dataFormat) {
      case 'Single Y':
      case 'XY Pair':
      case 'XY Pairs':
      case 'X Many Y':
      case 'Y Many X':
      case 'Many Y':
      case 'XY Category':
      case 'Y Category':
        return true;
      default:
        return false;
    }
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

  const isFormatSatisfied = useMemo(() => {
    switch (dataFormat) {
      case 'XY Pair':
        return xCount >= 1 && yCount >= 1;
      case 'XY Pairs':
        return xCount >= 1 && yCount >= 1; // at least one pair
      case 'X Many Y':
        return xCount >= 1 && yCount >= 1; // one X, >=1 Y (we allow >=1 X, user can pick one)
      case 'Y Many X':
        return yCount >= 1 && xCount >= 1; // one Y, >=1 X (we allow >=1 Y)
      case 'Many X':
        return xCount >= 1; // Y assumed
      case 'Many Y':
        return yCount >= 1; // X assumed
      case 'XY Category':
        return xCount >= 1 && yCount >= 1; // requires category column too (not selected here)
      case 'X Category':
        return xCount >= 1; // requires category column too (not selected here)
      case 'Y Category':
        return yCount >= 1; // requires category column too (not selected here)
      case 'Single X':
        return xCount >= 1;
      case 'Single Y':
        return yCount >= 1;
      default:
        return true;
    }
  }, [dataFormat, xCount, yCount]);

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

  const isCreateDisabled = !selectedProject || !subType || (showVariableSelection && (!dataFormat || !isFormatSatisfied));

  // Button enable/disable logic for sending from Available → X/Y
  const canSendToX = useMemo(() => {
    if (availableCheckedCount === 0) return false;
    switch (dataFormat) {
      case 'Single X':
      case 'X Many Y':
        return xCount < 1; // cap X to 1
      case 'Y Many X':
      case 'Many X':
      case 'XY Pair':
      case 'XY Pairs':
      case 'XY Category':
      case 'X Category':
        return true; // allow multiple or at least one; no cap here
      default:
        return true;
    }
  }, [availableCheckedCount, dataFormat, xCount]);

  const canSendToY = useMemo(() => {
    if (availableCheckedCount === 0) return false;
    switch (dataFormat) {
      case 'Single Y':
      case 'Y Many X':
        return yCount < 1; // cap Y to 1
      case 'X Many Y':
      case 'Many Y':
      case 'XY Pair':
      case 'XY Pairs':
      case 'XY Category':
      case 'Y Category':
        return true;
      default:
        return true;
    }
  }, [availableCheckedCount, dataFormat, yCount]);

  // Keep graphConfig in store up to date with current selections so modal can use it
  useEffect(() => {
    const xVars = Array.from(xVariableList.keys());
    const yVars = Array.from(yVariableList.keys());
    setGraphConfig({
      selectedProject,
      graphType: 'Scatter Plot',
      subType,
      dataFormat,
      variables: { x: xVars, y: yVars },
    });
  }, [selectedProject, subType, dataFormat, xVariableList, yVariableList, setGraphConfig]);

  return (
    <div className={classes.root}>
      {/* Header Section */}
      <ScatterHeader classes={classes} />

      {/* Project and Sub-Type Selection */}
      <ProjectAndType
        classes={classes}
        projects={projects}
        selectedProject={selectedProject}
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
          handleSendToX={handleSendToX}
          handleSendToY={handleSendToY}
          handleRemoveFromX={handleRemoveFromX}
          handleRemoveFromY={handleRemoveFromY}
          canSendToX={canSendToX}
          canSendToY={canSendToY}
        />
      )}
    </div>
  );
};

// variable list moved to VariableList.tsx