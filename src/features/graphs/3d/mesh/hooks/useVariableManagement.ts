import { useState, useMemo, useCallback, useEffect } from 'react';
import { useMeshPlotStore } from '../meshPlotSlice';
import type { DataFormat, Variable } from '../meshPlotSlice';

/**
 * Custom hook for managing variable lists and operations
 * Handles all variable selection, movement, and validation logic
 * @param dataFormat - The selected data format
 * @param availableVariables - Array of all available variables with their types
 */
export const useVariableManagement = (dataFormat?: DataFormat, availableVariables: Variable[] = []) => {
  // Variable lists state
  const [availableList, setAvailableList] = useState<Map<string, boolean>>(new Map());
  const [xVariableList, setXVariableList] = useState<Map<string, boolean>>(new Map());
  const [yVariableList, setYVariableList] = useState<Map<string, boolean>>(new Map());
  const [zVariableList, setZVariableList] = useState<Map<string, boolean>>(new Map());

  // Select all states
  const [selectAllAvailable, setSelectAllAvailable] = useState<boolean | string | undefined>(false);
  const [selectAllX, setSelectAllX] = useState<boolean | string | undefined>(false);
  const [selectAllY, setSelectAllY] = useState<boolean | string | undefined>(false);
  const [selectAllZ, setSelectAllZ] = useState<boolean | string | undefined>(false);

  // Get store methods for updating X/Y/Z variables
  const { setXVariable, setYVariable, setZVariable } = useMeshPlotStore();

  // Reset all lists when availableVariables changes (e.g., project switch)
  useEffect(() => {
    // Clear all variable lists
    setAvailableList(new Map());
    setXVariableList(new Map());
    setYVariableList(new Map());
    setZVariableList(new Map());

    // Reset select all states
    setSelectAllAvailable(false);
    setSelectAllX(false);
    setSelectAllY(false);
    setSelectAllZ(false);

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

  // Helper to check if variable is valid for a slot (for 3D mesh, all numeric variables are valid)
  const isValidForSlot = useCallback((variableName: string, slot: 'x' | 'y' | 'z'): boolean => {
    const variable = getVariable(variableName);
    if (!variable) return false;
    // For 3D mesh plots, we prefer numeric variables but allow all
    return true;
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
  const zCount = useMemo(() => zVariableList.size, [zVariableList]);
  const availableCheckedCount = useMemo(
    () => Array.from(availableList.values()).filter(v => v).length,
    [availableList]
  );

  // Send to X handler
  const handleSendToX = useCallback(() => {
    const newXList = new Map(xVariableList);
    const newAvailableList = new Map(availableList);

    // For XYZ Triplets and XY Many Z, allow only 1 X variable
    const maxX = (dataFormat === 'XYZ Triplets' || dataFormat === 'XY Many Z') ? 1 : Infinity;
    const freeSlots = Math.max(0, maxX - newXList.size);
    let moved = 0;

    for (const [variableName, checked] of availableList.entries()) {
      if (!checked) continue;
      if (moved >= freeSlots) break;
      if (!isValidForSlot(variableName, 'x')) continue;

      newXList.set(variableName, false);
      newAvailableList.set(variableName, false);
      moved++;
    }

    setXVariableList(newXList);
    setAvailableList(newAvailableList);
    setSelectAllAvailable(false);

    // Update store
    const firstX = pickFirstVariable(newXList);
    setXVariable(firstX);
  }, [availableList, xVariableList, dataFormat, isValidForSlot, setXVariableList, setAvailableList, setSelectAllAvailable, setXVariable, pickFirstVariable]);

  // Send to Y handler
  const handleSendToY = useCallback(() => {
    const newYList = new Map(yVariableList);
    const newAvailableList = new Map(availableList);

    // For XYZ Triplets and XY Many Z, allow only 1 Y variable
    const maxY = (dataFormat === 'XYZ Triplets' || dataFormat === 'XY Many Z') ? 1 : Infinity;
    const freeSlots = Math.max(0, maxY - newYList.size);
    let moved = 0;

    for (const [variableName, checked] of availableList.entries()) {
      if (!checked) continue;
      if (moved >= freeSlots) break;
      if (!isValidForSlot(variableName, 'y')) continue;

      newYList.set(variableName, false);
      newAvailableList.set(variableName, false);
      moved++;
    }

    setYVariableList(newYList);
    setAvailableList(newAvailableList);
    setSelectAllAvailable(false);

    // Update store
    const firstY = pickFirstVariable(newYList);
    setYVariable(firstY);
  }, [availableList, yVariableList, dataFormat, isValidForSlot, setYVariableList, setAvailableList, setSelectAllAvailable, setYVariable, pickFirstVariable]);

  // Send to Z handler
  const handleSendToZ = useCallback(() => {
    const newZList = new Map(zVariableList);
    const newAvailableList = new Map(availableList);

    // For XYZ Triplets, allow only 1 Z variable; for Many Z and XY Many Z, allow exactly 2
    const maxZ = (dataFormat === 'XYZ Triplets') ? 1 :
      (dataFormat === 'Many Z' || dataFormat === 'XY Many Z') ? 2 : Infinity;
    const freeSlots = Math.max(0, maxZ - newZList.size);
    let moved = 0;

    for (const [variableName, checked] of availableList.entries()) {
      if (!checked) continue;
      if (moved >= freeSlots) break;
      if (!isValidForSlot(variableName, 'z')) continue;

      newZList.set(variableName, false);
      newAvailableList.set(variableName, false);
      moved++;
    }

    setZVariableList(newZList);
    setAvailableList(newAvailableList);
    setSelectAllAvailable(false);

    // Update store
    const firstZ = pickFirstVariable(newZList);
    setZVariable(firstZ);
  }, [availableList, zVariableList, dataFormat, isValidForSlot, setZVariableList, setAvailableList, setSelectAllAvailable, setZVariable, pickFirstVariable]);

  // Remove from X handler
  const handleRemoveFromX = useCallback(() => {
    const newXList = new Map(xVariableList);
    const newAvailableList = new Map(availableList);

    // Move selected X variables back to available
    for (const [variableName, checked] of xVariableList.entries()) {
      if (checked) {
        newXList.delete(variableName);
        newAvailableList.set(variableName, false);
      }
    }

    setXVariableList(newXList);
    setAvailableList(newAvailableList);
    setSelectAllX(false);

    // Update store
    const firstX = pickFirstVariable(newXList);
    setXVariable(firstX);
  }, [xVariableList, setXVariableList, setAvailableList, setSelectAllX, setXVariable, pickFirstVariable]);

  // Remove from Y handler
  const handleRemoveFromY = useCallback(() => {
    const newYList = new Map(yVariableList);
    const newAvailableList = new Map(availableList);

    // Move selected Y variables back to available
    for (const [variableName, checked] of yVariableList.entries()) {
      if (checked) {
        newYList.delete(variableName);
        newAvailableList.set(variableName, false);
      }
    }

    setYVariableList(newYList);
    setAvailableList(newAvailableList);
    setSelectAllY(false);

    // Update store
    const firstY = pickFirstVariable(newYList);
    setYVariable(firstY);
  }, [yVariableList, setYVariableList, setAvailableList, setSelectAllY, setYVariable, pickFirstVariable]);

  // Remove from Z handler
  const handleRemoveFromZ = useCallback(() => {
    const newZList = new Map(zVariableList);
    const newAvailableList = new Map(availableList);

    // Move selected Z variables back to available
    for (const [variableName, checked] of zVariableList.entries()) {
      if (checked) {
        newZList.delete(variableName);
        newAvailableList.set(variableName, false);
      }
    }

    setZVariableList(newZList);
    setAvailableList(newAvailableList);
    setSelectAllZ(false);

    // Update store
    const firstZ = pickFirstVariable(newZList);
    setZVariable(firstZ);
  }, [zVariableList, setZVariableList, setAvailableList, setSelectAllZ, setZVariable, pickFirstVariable]);

  // Can send validation
  const canSendX = useMemo(() => {
    if (availableCheckedCount === 0) return false;
    if (dataFormat === 'Many Z') return false; // Many Z doesn't need X variables
    const maxX = (dataFormat === 'XYZ Triplets' || dataFormat === 'XY Many Z') ? 1 : Infinity;
    return xCount < maxX;
  }, [availableCheckedCount, xCount, dataFormat]);

  const canSendY = useMemo(() => {
    if (availableCheckedCount === 0) return false;
    if (dataFormat === 'Many Z') return false; // Many Z doesn't need Y variables
    const maxY = (dataFormat === 'XYZ Triplets' || dataFormat === 'XY Many Z') ? 1 : Infinity;
    return yCount < maxY;
  }, [availableCheckedCount, yCount, dataFormat]);

  const canSendZ = useMemo(() => {
    if (availableCheckedCount === 0) return false;
    const maxZ = (dataFormat === 'XYZ Triplets') ? 1 :
      (dataFormat === 'Many Z' || dataFormat === 'XY Many Z') ? 2 : Infinity;
    return zCount < maxZ;
  }, [availableCheckedCount, zCount, dataFormat]);

  return {
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
  };
};