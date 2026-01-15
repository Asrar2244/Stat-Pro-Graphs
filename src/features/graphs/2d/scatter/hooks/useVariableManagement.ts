import { useState, useMemo, useCallback, useEffect } from 'react';
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

  // Reset all lists when availableVariables changes (e.g., project switch)
  useEffect(() => {
    // Clear all variable lists
    setAvailableList(new Map());
    setXVariableList(new Map());
    setYVariableList(new Map());
    setErrorBarVariableList(new Map());
    setCategoryVariableList(new Map());

    // Reset select all states
    setSelectAllAvailable(false);
    setSelectAllX(false);
    setSelectAllY(false);
    setSelectAllErrorBar(false);
    setSelectAllCategory(false);

    // Populate available list with new variables
    if (availableVariables.length > 0) {
      const newMap = new Map<string, boolean>();
      availableVariables.forEach(variable => {
        newMap.set(variable.name, false);
      });
      setAvailableList(newMap);
    }
  }, [availableVariables]);

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

  // Helper functions for replicate formats
  const canSendToXForReplicates = useMemo(() => {
    if (dataFormat === 'X Many Y Replicates') {
      const currentXCount = xVariableList.size;

      // For X Many Y Replicates format, only allow one X variable
      // Once X is selected, no more X variables can be added
      return currentXCount === 0;
    } else if (dataFormat === 'Many Y Replicates') {
      // For Many Y Replicates format, no X variables needed
      return false;
    }

    return true;
  }, [dataFormat, xVariableList.size]);

  const canSendToYForReplicates = useMemo(() => {
    if (dataFormat === 'X Many Y Replicates') {
      // For X Many Y Replicates format, require X to be selected first
      const currentXCount = xVariableList.size;

      // Can send to Y if X is selected (no limit on Y variables)
      return currentXCount > 0;
    } else if (dataFormat === 'Many Y Replicates') {
      // For Many Y Replicates format, allow Y selection freely (no X requirement)
      // This format is for vertical point plots where Y variables are grouped
      return true;
    }

    return true;
  }, [dataFormat, xVariableList.size]);

  // Helper functions for Y Many X Replicates format (horizontal)
  const canSendToXForYReplicates = useMemo(() => {
    if (dataFormat === 'Y Many X Replicates') {
      // For Y Many X Replicates format, require Y to be selected first
      const currentYCount = yVariableList.size;


      // Can send to X if Y is selected (no limit on X variables)
      return currentYCount > 0;
    } else if (dataFormat === 'Many X Replicates') {
      // For Many X Replicates format, allow X selection freely (no Y requirement)
      // This format is for horizontal point plots where X variables are grouped
      return true;
    }

    return true;
  }, [dataFormat, yVariableList.size]);

  const canSendToYForXReplicates = useMemo(() => {
    if (dataFormat === 'Y Many X Replicates') {
      // For Y Many X Replicates format, only allow one Y variable total
      // Once Y is selected, no more Y variables can be added
      return yVariableList.size === 0;
    } else if (dataFormat === 'Many X Replicates') {
      // For Many X Replicates format, no Y variables needed
      return false;
    }

    return true;
  }, [dataFormat, yVariableList.size]);

  // Send to X handler
  const handleSendToX = useCallback(() => {
    const newXList = new Map(xVariableList);
    const newAvailableList = new Map(availableList);
    const maxX = getMaxXCount(dataFormat);
    let freeSlots = maxX ? Math.max(0, maxX - newXList.size) : Infinity;
    let moved = 0;

    // Special logic for replicate formats
    if (dataFormat === 'X Many Y Replicates') {
      // For X Many Y Replicates format, only allow one X variable total
      const currentXCount = newXList.size;

      // Only allow one X variable total
      if (currentXCount >= 1) {
        return; // Don't allow more than one X variable
      }

      // Limit to only one X variable even if multiple are selected
      freeSlots = 1;
    } else if (dataFormat === 'Many Y Replicates') {
      // For Many Y Replicates format, no X variables needed
      return; // Don't allow X selection for this format
    } else if (dataFormat === 'Y Many X Replicates') {
      // For Y Many X Replicates format, require Y variables to be selected first

      if (yVariableList.size === 0) {
        return; // Don't allow X selection until Y is selected
      }

      // For this format, allow multiple sets of X variables for the same Y
      // No limit on X variables for this format
    } else if (dataFormat === 'Many X Replicates') {
      // For Many X Replicates format, allow X selection freely (no Y requirement)
      // This format is for horizontal point plots where X variables are grouped
      // No limit on X variables for this format
    }

    // Check if there are any selected variables
    const selectedVariables = Array.from(availableList.entries()).filter(([, checked]) => checked);
    if (selectedVariables.length === 0) {
      return;
    }

    // Check if any selected variables are valid for X
    const validVariables = selectedVariables.filter(([variableName]) => isValidForSlot(variableName, 'x'));
    if (validVariables.length === 0) {
      return;
    }

    // Move variables
    for (const [variableName, checked] of availableList.entries()) {
      if (!checked) continue;
      if (moved >= freeSlots) break;
      // Only move numeric variables to X
      if (!isValidForSlot(variableName, 'x')) {
        continue;
      }

      newXList.set(variableName, false);
      // Keep variable in available list but uncheck it
      newAvailableList.set(variableName, false);
      moved++;
    }

    if (moved === 0) {
      return;
    }

    setXVariableList(newXList);
    setAvailableList(newAvailableList);
    setSelectAllAvailable(false);

    // Update store
    const nextX = pickFirstVariable(newXList);
    setXVariable(nextX);
  }, [availableList, xVariableList, dataFormat, pickFirstVariable, setXVariable, isValidForSlot, yVariableList.size]);

  // Send to Y handler
  const handleSendToY = useCallback(() => {
    const newYList = new Map(yVariableList);
    const newAvailableList = new Map(availableList);
    const maxY = getMaxYCount(dataFormat);
    let freeSlots = maxY ? Math.max(0, maxY - newYList.size) : Infinity;
    let moved = 0;

    // Check if there are any selected variables
    const selectedVariables = Array.from(availableList.entries()).filter(([, checked]) => checked);
    if (selectedVariables.length === 0) {
      return;
    }

    // Check if any selected variables are valid for Y
    const validVariables = selectedVariables.filter(([variableName]) => isValidForSlot(variableName, 'y'));
    if (validVariables.length === 0) {
      return;
    }

    // Special logic for replicate formats
    if (dataFormat === 'X Many Y Replicates') {
      // For X Many Y Replicates format, require X variables to be selected first
      if (xVariableList.size === 0) {
        return; // Don't allow Y selection until X is selected
      }

      // For this format, allow multiple sets of Y variables for the same X
      // Move all selected Y variables (no limit)
      const variablesToMove = Math.min(validVariables.length, freeSlots);

      for (const [variableName, checked] of availableList.entries()) {
        if (!checked) continue;
        if (moved >= variablesToMove) break;
        // Only move numeric variables to Y
        if (!isValidForSlot(variableName, 'y')) {
          continue;
        }
        newYList.set(variableName, false);
        // Keep variable in available list but uncheck it
        newAvailableList.set(variableName, false);
        moved++;
      }
    } else if (dataFormat === 'Many Y Replicates') {
      // Special logic for Many Y Replicates format (vertical point plots)
      // For this format, we can select Y variables freely (no X requirement)
      // This format is for vertical point plots where Y variables are grouped

      // Move all selected Y variables
      const variablesToMove = Math.min(validVariables.length, freeSlots);

      for (const [variableName, checked] of availableList.entries()) {
        if (!checked) continue;
        if (moved >= variablesToMove) break;
        // Only move numeric variables to Y
        if (!isValidForSlot(variableName, 'y')) {
          continue;
        }
        newYList.set(variableName, false);
        // Keep variable in available list but uncheck it
        newAvailableList.set(variableName, false);
        moved++;
      }
    } else if (dataFormat === 'Y Many X Replicates') {
      // Special logic for Y Many X Replicates format (horizontal)
      // For this format, only allow one Y variable total
      const currentYCount = newYList.size;

      // Only allow one Y variable total
      if (currentYCount >= 1) {
        return; // Don't allow more than one Y variable
      }

      // Limit to only one Y variable even if multiple are selected
      freeSlots = 1;
    } else if (dataFormat === 'Many X Replicates') {
      // Special logic for Many X Replicates format (horizontal point plots)
      // For this format, Y is assumed as index, so no Y variables should be selected
      return; // Don't allow Y selection for this format
    } else {
      // Standard logic for other formats
      for (const [variableName, checked] of availableList.entries()) {
        if (!checked) continue;
        if (moved >= freeSlots) break;
        // Only move numeric variables to Y
        if (!isValidForSlot(variableName, 'y')) {
          continue;
        }
        newYList.set(variableName, false);
        // Keep variable in available list but uncheck it
        newAvailableList.set(variableName, false);
        moved++;
      }
    }

    if (moved === 0) {
      return;
    }

    setYVariableList(newYList);
    setAvailableList(newAvailableList);
    setSelectAllAvailable(false);

    // Update store
    const nextY = pickFirstVariable(newYList);
    setYVariable(nextY);
  }, [availableList, yVariableList, dataFormat, pickFirstVariable, setYVariable, isValidForSlot, xVariableList.size]);

  // Send to ErrorBar handler - validates required count based on XY pairs
  const handleSendToErrorBar = useCallback(() => {
    const newErrorBarList = new Map(errorBarVariableList);
    const newAvailableList = new Map(availableList);

    // Calculate required error bars based on current X/Y counts and data format
    const xCount = xVariableList.size;
    const yCount = yVariableList.size;
    const requiredCount = getRequiredErrorBarCount(xCount, yCount, dataFormat, subType);
    const currentCount = newErrorBarList.size;
    const freeSlots = Math.max(0, requiredCount - currentCount);

    // Check if we can send error bars (based on subType)
    const availableCheckedCount = Array.from(availableList.values()).filter(Boolean).length;
    if (!canSendToErrorBar(availableCheckedCount, currentCount, xCount, yCount, dataFormat, subType)) {
      return;
    }

    // For bidirectional error bars, allow sending multiple variables at once
    // Calculate how many variables we can actually move
    const checkedVariables = Array.from(availableList.entries()).filter(([, checked]) => checked);
    const validVariables = checkedVariables.filter(([variableName]) => isValidForSlot(variableName, 'errorBar'));
    const variablesToMove = Math.min(validVariables.length, freeSlots);

    let moved = 0;

    for (const [variableName, checked] of availableList.entries()) {
      if (!checked) continue;
      if (moved >= variablesToMove) break;
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

    // Helper functions for replicate formats
    canSendToXForReplicates,
    canSendToYForReplicates,
    canSendToXForYReplicates,
    canSendToYForXReplicates,
  };
};

