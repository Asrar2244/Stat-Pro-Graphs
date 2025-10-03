import { useState, useMemo, useCallback } from 'react';
import { useScatterPlotStore } from '../scatterPlotSlice';
import type { DataFormat, Variable } from '../scatterPlotSlice';
import { 
  getMaxXCount, 
  getMaxYCount, 
  canSendToErrorBar, 
  canSendToCategory,
  getRequiredErrorBarCount 
} from '../utils/formatRequirements';
import { isVariableValidForSlot } from '../utils/variableFilters';

/**
 * Custom hook for managing variable lists and operations
 * Handles all variable selection, movement, and validation logic
 * @param dataFormat - The selected data format
 * @param subType - The selected sub type
 * @param availableVariables - Array of all available variables with their types
 */
export const useVariableManagement = (dataFormat?: DataFormat, subType?: string, availableVariables: Variable[] = []) => {
  // Variable lists state
  const [availableList, setAvailableList] = useState<Map<string, boolean>>(new Map());
  const [xVariableList, setXVariableList] = useState<Map<string, boolean>>(new Map());
  const [yVariableList, setYVariableList] = useState<Map<string, boolean>>(new Map());
  const [errorBarVariableList, setErrorBarVariableList] = useState<Map<string, boolean>>(new Map());
  const [categoryVariableList, setCategoryVariableList] = useState<Map<string, boolean>>(new Map());
  
  // Select all states
  const [selectAllAvailable, setSelectAllAvailable] = useState<boolean | string | undefined>(false);
  const [selectAllX, setSelectAllX] = useState<boolean | string | undefined>(false);
  const [selectAllY, setSelectAllY] = useState<boolean | string | undefined>(false);
  const [selectAllErrorBar, setSelectAllErrorBar] = useState<boolean | string | undefined>(false);
  const [selectAllCategory, setSelectAllCategory] = useState<boolean | string | undefined>(false);

  // Get store methods for updating X/Y variables
  const { setXVariable, setYVariable } = useScatterPlotStore();

  // Helper to get variable by name
  const getVariable = useCallback((name: string): Variable | undefined => {
    return availableVariables.find(v => v.name === name);
  }, [availableVariables]);

  // Helper to check if variable is valid for a slot
  const isValidForSlot = useCallback((variableName: string, slot: 'x' | 'y' | 'errorBar' | 'category'): boolean => {
    const variable = getVariable(variableName);
    if (!variable) return false;
    return isVariableValidForSlot(variable, slot);
  }, [getVariable]);

  // Helper to pick first variable from a list
  const pickFirstVariable = useCallback((list: Map<string, boolean>): string | undefined => {
    const selected = Array.from(list.entries()).find(([, v]) => v);
    if (selected) return selected[0];
    const it = list.keys();
    const first = it.next();
    return first.done ? undefined : first.value;
  }, []);

  // Counts
  const xCount = useMemo(() => xVariableList.size, [xVariableList]);
  const yCount = useMemo(() => yVariableList.size, [yVariableList]);
  const availableCheckedCount = useMemo(
    () => Array.from(availableList.values()).filter(v => v).length,
    [availableList]
  );

  // Send to X handler
  const handleSendToX = useCallback(() => {
    const newXList = new Map(xVariableList);
    const newAvailableList = new Map(availableList);
    const maxX = getMaxXCount(dataFormat);
    const freeSlots = maxX ? Math.max(0, maxX - newXList.size) : Infinity;
    let moved = 0;
    
    for (const [variableName, checked] of availableList.entries()) {
      if (!checked) continue;
      if (moved >= freeSlots) break;
      // Only move numeric variables to X
      if (!isValidForSlot(variableName, 'x')) continue;
      newXList.set(variableName, false);
      // Keep variable in available list but uncheck it
      newAvailableList.set(variableName, false);
      moved++;
    }
    
    setXVariableList(newXList);
    setAvailableList(newAvailableList);
    setSelectAllAvailable(false);
    
    // Update store
    const nextX = pickFirstVariable(newXList);
    setXVariable(nextX);
  }, [availableList, xVariableList, dataFormat, pickFirstVariable, setXVariable, isValidForSlot]);

  // Send to Y handler
  const handleSendToY = useCallback(() => {
    const newYList = new Map(yVariableList);
    const newAvailableList = new Map(availableList);
    const maxY = getMaxYCount(dataFormat);
    const freeSlots = maxY ? Math.max(0, maxY - newYList.size) : Infinity;
    let moved = 0;
    
    for (const [variableName, checked] of availableList.entries()) {
      if (!checked) continue;
      if (moved >= freeSlots) break;
      // Only move numeric variables to Y
      if (!isValidForSlot(variableName, 'y')) continue;
      newYList.set(variableName, false);
      // Keep variable in available list but uncheck it
      newAvailableList.set(variableName, false);
      moved++;
    }
    
    setYVariableList(newYList);
    setAvailableList(newAvailableList);
    setSelectAllAvailable(false);
    
    // Update store
    const nextY = pickFirstVariable(newYList);
    setYVariable(nextY);
  }, [availableList, yVariableList, dataFormat, pickFirstVariable, setYVariable, isValidForSlot]);

  // Send to ErrorBar handler - validates required count based on XY pairs
  const handleSendToErrorBar = useCallback(() => {
    const newErrorBarList = new Map(errorBarVariableList);
    const newAvailableList = new Map(availableList);
    
    // Calculate required error bars based on current X/Y counts and data format
    const xCount = xVariableList.size;
    const yCount = yVariableList.size;
    const requiredCount = getRequiredErrorBarCount(xCount, yCount, dataFormat);
    const currentCount = newErrorBarList.size;
    const freeSlots = Math.max(0, requiredCount - currentCount);
    
    // Check if we can send error bars (based on subType)
    const availableCheckedCount = Array.from(availableList.values()).filter(Boolean).length;
    if (!canSendToErrorBar(availableCheckedCount, currentCount, xCount, yCount, dataFormat, subType)) {
      return;
    }
    
    let moved = 0;
    
    for (const [variableName, checked] of availableList.entries()) {
      if (!checked) continue;
      if (moved >= freeSlots) break;
      // Only move numeric variables to ErrorBar
      if (!isValidForSlot(variableName, 'errorBar')) continue;
      
      newErrorBarList.set(variableName, false);
      // Keep variable in available list but uncheck it
      newAvailableList.set(variableName, false);
      moved++;
    }
    
    setErrorBarVariableList(newErrorBarList);
    setAvailableList(newAvailableList);
    setSelectAllAvailable(false);
  }, [availableList, errorBarVariableList, xVariableList.size, yVariableList.size, dataFormat, subType, isValidForSlot]);

  // Send to Category handler - ONLY accepts categorical (text) variables
  const handleSendToCategory = useCallback(() => {
    const newCategoryList = new Map(categoryVariableList);
    const newAvailableList = new Map(availableList);
    
    // Check if we can send to category using validation logic
    const availableCheckedCount = Array.from(availableList.values()).filter(Boolean).length;
    const currentCount = newCategoryList.size;
    if (!canSendToCategory(availableCheckedCount, currentCount, dataFormat)) {
      return;
    }
    
    const maxCategory = 1;
    const freeSlots = Math.max(0, maxCategory - currentCount);
    let moved = 0;
    
    for (const [variableName, checked] of availableList.entries()) {
      if (!checked) continue;
      if (moved >= freeSlots) break;
      // IMPORTANT: Only move categorical (text/words) variables to Category
      if (!isValidForSlot(variableName, 'category')) continue;
      
      newCategoryList.set(variableName, false);
      // Keep variable in available list but uncheck it
      newAvailableList.set(variableName, false);
      moved++;
    }
    
    setCategoryVariableList(newCategoryList);
    setAvailableList(newAvailableList);
    setSelectAllAvailable(false);
  }, [availableList, categoryVariableList, dataFormat, isValidForSlot]);

  // Remove from X handler
  const handleRemoveFromX = useCallback(() => {
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
    if (newXList.size === 0) setSelectAllX(false);
    
    // Update store
    const nextX = pickFirstVariable(newXList);
    setXVariable(nextX);
  }, [xVariableList, availableList, pickFirstVariable, setXVariable]);

  // Remove from Y handler
  const handleRemoveFromY = useCallback(() => {
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
    if (newYList.size === 0) setSelectAllY(false);
    
    // Update store
    const nextY = pickFirstVariable(newYList);
    setYVariable(nextY);
  }, [yVariableList, availableList, pickFirstVariable, setYVariable]);

  // Remove from ErrorBar handler
  const handleRemoveFromErrorBar = useCallback(() => {
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
    if (newErrorBarList.size === 0) setSelectAllErrorBar(false);
  }, [errorBarVariableList, availableList]);

  // Remove from Category handler
  const handleRemoveFromCategory = useCallback(() => {
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
    if (newCategoryList.size === 0) setSelectAllCategory(false);
  }, [categoryVariableList, availableList]);

  return {
    // Lists
    availableList,
    xVariableList,
    yVariableList,
    errorBarVariableList,
    categoryVariableList,
    
    // Setters
    setAvailableList,
    setXVariableList,
    setYVariableList,
    setErrorBarVariableList,
    setCategoryVariableList,
    
    // Select all states
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
    
    // Counts
    xCount,
    yCount,
    availableCheckedCount,
    
    // Handlers
    handleSendToX,
    handleSendToY,
    handleSendToErrorBar,
    handleSendToCategory,
    handleRemoveFromX,
    handleRemoveFromY,
    handleRemoveFromErrorBar,
    handleRemoveFromCategory,
  };
};

