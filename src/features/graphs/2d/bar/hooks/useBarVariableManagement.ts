import { useState, useMemo, useCallback, useEffect } from 'react';
import { useBarPlotStore } from '../barPlotSlice';
import type { DataFormat, Variable } from '../types';
import {
    getMaxXCount,
    getMaxYCount,
    canSendToErrorBar,
    canSendToCategory,
    getRequiredErrorBarCount
} from '../utils/formatRequirements';
import { isVariableValidForSlot } from '../utils/variableFilters';

export const useBarVariableManagement = (dataFormat?: DataFormat, subType?: string, availableVariables: Variable[] = []) => {
    // Variable lists state from Global Store
    const {
        // Getters
        xVariableList,
        yVariableList,
        errorBarVariableList,
        categoryVariableList,
        // Setters
        setXVariableList,
        setYVariableList,
        setErrorBarVariableList,
        setCategoryVariableList,
        // Single var setters (legacy/helper)
        setXVariable,
        setYVariable
    } = useBarPlotStore();

    // Local state for available list checkboxes (transient UI state)
    const [availableList, setAvailableList] = useState<Map<string, boolean>>(new Map());

    // Select all states (UI only)
    const [selectAllAvailable, setSelectAllAvailable] = useState<boolean | string | undefined>(false);
    const [selectAllX, setSelectAllX] = useState<boolean | string | undefined>(false);
    const [selectAllY, setSelectAllY] = useState<boolean | string | undefined>(false);
    const [selectAllErrorBar, setSelectAllErrorBar] = useState<boolean | string | undefined>(false);
    const [selectAllCategory, setSelectAllCategory] = useState<boolean | string | undefined>(false);


    // Reset all lists when availableVariables changes (e.g., project switch)
    useEffect(() => {
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

        if (availableVariables.length > 0) {
            const newMap = new Map<string, boolean>();
            availableVariables.forEach(variable => {
                newMap.set(variable.name, false);
            });
            setAvailableList(newMap);
        }
    }, [availableVariables, setXVariableList, setYVariableList, setErrorBarVariableList, setCategoryVariableList]);

    const getVariable = useCallback((name: string): Variable | undefined => {
        return availableVariables.find(v => v.name === name);
    }, [availableVariables]);

    const isValidForSlot = useCallback((variableName: string, slot: 'x' | 'y' | 'errorBar' | 'category'): boolean => {
        const variable = getVariable(variableName);
        if (!variable) return false;
        return isVariableValidForSlot(variable, slot);
    }, [getVariable]);

    const pickFirstVariable = useCallback((list: Map<string, boolean>): string | undefined => {
        const selected = Array.from(list.entries()).find(([, v]) => v);
        if (selected) return selected[0];
        const it = list.keys();
        const first = it.next();
        return first.done ? undefined : first.value;
    }, []);

    const xCount = useMemo(() => xVariableList.size, [xVariableList]);
    const yCount = useMemo(() => yVariableList.size, [yVariableList]);
    const availableCheckedCount = useMemo(
        () => Array.from(availableList.values()).filter(v => v).length,
        [availableList]
    );

    const canSendToXForReplicates = useMemo(() => {
        if (dataFormat === 'X Many Y Replicates') {
            const currentXCount = xVariableList.size;
            return currentXCount === 0;
        } else if (dataFormat === 'Many Y Replicates') {
            return false;
        }
        return true;
    }, [dataFormat, xVariableList.size]);

    const canSendToYForReplicates = useMemo(() => {
        if (dataFormat === 'X Many Y Replicates') {
            const currentXCount = xVariableList.size;
            return currentXCount > 0;
        } else if (dataFormat === 'Many Y Replicates') {
            return true;
        }
        return true;
    }, [dataFormat, xVariableList.size]);

    const canSendToXForYReplicates = useMemo(() => {
        if (dataFormat === 'Y Many X Replicates') {
            const currentYCount = yVariableList.size;
            return currentYCount > 0;
        } else if (dataFormat === 'Many X Replicates') {
            return true;
        }
        return true;
    }, [dataFormat, yVariableList.size]);

    const canSendToYForXReplicates = useMemo(() => {
        if (dataFormat === 'Y Many X Replicates') {
            const currentYCount = yVariableList.size;
            return currentYCount === 0;
        } else if (dataFormat === 'Many X Replicates') {
            return false;
        }
        return true;
    }, [dataFormat, yVariableList.size]);

    const handleSendToX = useCallback(() => {
        const newXList = new Map(xVariableList);
        const newAvailableList = new Map(availableList);
        const maxX = getMaxXCount(dataFormat);
        let freeSlots = maxX ? Math.max(0, maxX - newXList.size) : Infinity;
        let moved = 0;

        if (dataFormat === 'X Many Y Replicates') {
            if (newXList.size >= 1) return;
            freeSlots = 1;
        } else if (dataFormat === 'Many Y Replicates') {
            return;
        } else if (dataFormat === 'Y Many X Replicates') {
            if (yVariableList.size === 0) return;
        }

        const selectedVariables = Array.from(availableList.entries()).filter(([, checked]) => checked);
        if (selectedVariables.length === 0) return;

        for (const [variableName, checked] of availableList.entries()) {
            if (!checked) continue;
            if (moved >= freeSlots) break;
            if (!isValidForSlot(variableName, 'x')) continue;

            newXList.set(variableName, true);
            newAvailableList.set(variableName, false);
            moved++;
        }

        if (moved === 0) return;

        setXVariableList(newXList);
        setAvailableList(newAvailableList);
        setSelectAllAvailable(false);

        // Update single var store for backward compatibility/graphConfig
        const nextX = pickFirstVariable(newXList);
        setXVariable(nextX);
    }, [availableList, xVariableList, dataFormat, pickFirstVariable, setXVariable, setXVariableList, isValidForSlot, yVariableList.size]);

    const handleSendToY = useCallback(() => {
        const newYList = new Map(yVariableList);
        const newAvailableList = new Map(availableList);
        const maxY = getMaxYCount(dataFormat);
        let freeSlots = maxY ? Math.max(0, maxY - newYList.size) : Infinity;
        let moved = 0;

        const selectedVariables = Array.from(availableList.entries()).filter(([, checked]) => checked);
        if (selectedVariables.length === 0) return;

        if (dataFormat === 'X Many Y Replicates') {
            if (xVariableList.size === 0) return;
        } else if (dataFormat === 'Y Many X Replicates') {
            if (newYList.size >= 1) return;
            freeSlots = 1;
        } else if (dataFormat === 'Many X Replicates') {
            return;
        }

        for (const [variableName, checked] of availableList.entries()) {
            if (!checked) continue;
            if (moved >= freeSlots) break;
            if (!isValidForSlot(variableName, 'y')) continue;

            newYList.set(variableName, true);
            newAvailableList.set(variableName, false);
            moved++;
        }

        if (moved === 0) return;

        setYVariableList(newYList);
        setAvailableList(newAvailableList);
        setSelectAllAvailable(false);

        // Update single var store
        const nextY = pickFirstVariable(newYList);
        setYVariable(nextY);
    }, [availableList, yVariableList, dataFormat, pickFirstVariable, setYVariable, setYVariableList, isValidForSlot, xVariableList.size]);

    const handleSendToErrorBar = useCallback(() => {
        const newErrorBarList = new Map(errorBarVariableList);
        const newAvailableList = new Map(availableList);

        const xCount = xVariableList.size;
        const yCount = yVariableList.size;
        const requiredCount = getRequiredErrorBarCount(xCount, yCount, dataFormat, subType);
        const currentCount = newErrorBarList.size;
        const freeSlots = Math.max(0, requiredCount - currentCount);

        const availableCheckedCount = Array.from(availableList.values()).filter(Boolean).length;
        if (!canSendToErrorBar(availableCheckedCount, currentCount, xCount, yCount, dataFormat, subType)) {
            return;
        }

        const checkedVariables = Array.from(availableList.entries()).filter(([, checked]) => checked);
        // ... (rest logic same, just using state from store)
        // Re-implement loop for clarity to avoid scope issues in replace:

        const validVariables = checkedVariables.filter(([variableName]) => isValidForSlot(variableName, 'errorBar'));
        const variablesToMove = Math.min(validVariables.length, freeSlots);
        let moved = 0;

        for (const [variableName, checked] of availableList.entries()) {
            if (!checked) continue;
            if (moved >= variablesToMove) break;
            if (!isValidForSlot(variableName, 'errorBar')) continue;

            newErrorBarList.set(variableName, true);
            newAvailableList.set(variableName, false);
            moved++;
        }

        setErrorBarVariableList(newErrorBarList);
        setAvailableList(newAvailableList);
        setSelectAllAvailable(false);
    }, [availableList, errorBarVariableList, xVariableList.size, yVariableList.size, dataFormat, subType, isValidForSlot, setErrorBarVariableList]);

    const handleSendToCategory = useCallback(() => {
        const newCategoryList = new Map(categoryVariableList);
        const newAvailableList = new Map(availableList);

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
            if (!isValidForSlot(variableName, 'category')) continue;

            newCategoryList.set(variableName, true);
            newAvailableList.set(variableName, false);
            moved++;
        }

        setCategoryVariableList(newCategoryList);
        setAvailableList(newAvailableList);
        setSelectAllAvailable(false);
    }, [availableList, categoryVariableList, dataFormat, isValidForSlot, setCategoryVariableList]);

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

        // Update single var store
        const nextX = pickFirstVariable(newXList);
        setXVariable(nextX);
    }, [xVariableList, availableList, pickFirstVariable, setXVariable, setXVariableList]);

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

        // Update single var store
        const nextY = pickFirstVariable(newYList);
        setYVariable(nextY);
    }, [yVariableList, availableList, pickFirstVariable, setYVariable, setYVariableList]);

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
    }, [errorBarVariableList, availableList, setErrorBarVariableList]);

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
    }, [categoryVariableList, availableList, setCategoryVariableList]);

    return {
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
    };
};
