import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAreaPlotStore } from '../areaPlotSlice';
import type { DataFormat, Variable } from '../areaPlotSlice';
import {
    getMaxXCount,
    getMaxYCount,
    requiresX,
    requiresY
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

    // Select all states
    const [selectAllAvailable, setSelectAllAvailable] = useState<boolean | string | undefined>(false);
    const [selectAllX, setSelectAllX] = useState<boolean | string | undefined>(false);
    const [selectAllY, setSelectAllY] = useState<boolean | string | undefined>(false);

    // Get store methods for updating X/Y variables
    const { setXVariable, setYVariable } = useAreaPlotStore();

    // Reset all lists when availableVariables changes (e.g., project switch)
    useEffect(() => {
        // Clear all variable lists
        setAvailableList(new Map());
        setXVariableList(new Map());
        setYVariableList(new Map());

        // Reset select all states
        setSelectAllAvailable(false);
        setSelectAllX(false);
        setSelectAllY(false);

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
    const isValidForSlot = useCallback((variableName: string, slot: 'x' | 'y'): boolean => {
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
        if (!requiresX(dataFormat)) return;

        const newXList = new Map(xVariableList);
        const newAvailableList = new Map(availableList);
        const maxX = getMaxXCount(dataFormat);
        let freeSlots = maxX !== undefined ? Math.max(0, maxX - newXList.size) : Infinity;
        let moved = 0;

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
            // Only move valid variables to X
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
    }, [availableList, xVariableList, dataFormat, pickFirstVariable, setXVariable, isValidForSlot]);

    // Send to Y handler
    const handleSendToY = useCallback(() => {
        if (!requiresY(dataFormat)) return;

        const newYList = new Map(yVariableList);
        const newAvailableList = new Map(availableList);
        const maxY = getMaxYCount(dataFormat);
        let freeSlots = maxY !== undefined ? Math.max(0, maxY - newYList.size) : Infinity;
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

        // Move variables
        for (const [variableName, checked] of availableList.entries()) {
            if (!checked) continue;
            if (moved >= freeSlots) break;
            // Only move valid variables to Y
            if (!isValidForSlot(variableName, 'y')) {
                continue;
            }

            newYList.set(variableName, false);
            // Keep variable in available list but uncheck it
            newAvailableList.set(variableName, false);
            moved++;
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
    }, [availableList, yVariableList, dataFormat, pickFirstVariable, setYVariable, isValidForSlot]);

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

    return {
        // Lists
        availableList,
        xVariableList,
        yVariableList,

        // Setters
        setAvailableList,
        setXVariableList,
        setYVariableList,

        // Select all states
        selectAllAvailable,
        selectAllX,
        selectAllY,
        setSelectAllAvailable,
        setSelectAllX,
        setSelectAllY,

        // Counts
        xCount,
        yCount,
        availableCheckedCount,

        // Handlers
        handleSendToX,
        handleSendToY,
        handleRemoveFromX,
        handleRemoveFromY,
    };
};
