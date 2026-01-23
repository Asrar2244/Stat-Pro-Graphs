import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBoxPlotStore } from '../boxPlotSlice';
import type { DataFormat, Variable } from '../types';

export const useVariableManagement = (dataFormat?: DataFormat, availableVariables: Variable[] = []) => {
    // Variable lists state
    const [availableList, setAvailableList] = useState<Map<string, boolean>>(new Map());
    const [xVariableList, setXVariableList] = useState<Map<string, boolean>>(new Map());
    const [yVariableList, setYVariableList] = useState<Map<string, boolean>>(new Map());

    // Select all states
    const [selectAllAvailable, setSelectAllAvailable] = useState<boolean | string | undefined>(false);
    const [selectAllX, setSelectAllX] = useState<boolean | string | undefined>(false);
    const [selectAllY, setSelectAllY] = useState<boolean | string | undefined>(false);

    // Get store methods
    const { setXVariable, setYVariable } = useBoxPlotStore();

    // Reset when available variables change
    useEffect(() => {
        setAvailableList(new Map());
        setXVariableList(new Map());
        setYVariableList(new Map());

        setSelectAllAvailable(false);
        setSelectAllX(false);
        setSelectAllY(false);

        if (availableVariables.length > 0) {
            const newMap = new Map<string, boolean>();
            availableVariables.forEach(variable => {
                newMap.set(variable.name, false);
            });
            setAvailableList(newMap);
        }
    }, [availableVariables]);

    const getVariable = useCallback((name: string): Variable | undefined => {
        return availableVariables.find(v => v.name === name);
    }, [availableVariables]);

    // Box plots mostly need numeric data, but X/Y axis might be categorical depending on orientation
    const isValidForSlot = useCallback((variableName: string, slot: 'x' | 'y'): boolean => {
        const variable = getVariable(variableName);
        if (!variable) return false;

        return variable.type === 'numeric'; // Default to numeric for simplicity first
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

    const handleSendToX = useCallback(() => {
        const newXList = new Map(xVariableList);
        const newAvailableList = new Map(availableList);
        // Box plot limits depending on format?
        // Many Y: X is generated, so X list probably implicitly 0? Or maybe CATEGORY goes to X?
        // The requirements said: "Format data columns as: Many Y".
        // In "Many Y", usually we select multiple Y variables. X is optional (sequence) or categories?
        // Let's assume standard behavior:
        // Many Y: Multiple Ys, 0 X.
        // X Many Y: 1 X (Categorical/Numeric), Multiple Ys.

        // Logic for limits:
        let maxX = Infinity;
        if (dataFormat === 'Many Y') maxX = 0;
        if (dataFormat === 'X Many Y') maxX = 1;
        if (dataFormat === 'Many X') maxX = Infinity; // Horizontal equivalent of Many Y? No, Many X means multiple X vars.
        if (dataFormat === 'Y Many X') maxX = Infinity; // Wait, Y Many X usually means 1 Y (category), Multiple X.

        // Let's refine limits based on format definitions later, but generally:

        const freeSlots = maxX === Infinity ? Infinity : Math.max(0, maxX - newXList.size);
        let moved = 0;

        for (const [variableName, checked] of availableList.entries()) {
            if (!checked) continue;
            if (moved >= freeSlots) break;

            // Allow categorical for X if format is X Many Y
            // But verify logic later.

            newXList.set(variableName, false);
            newAvailableList.set(variableName, false);
            moved++;
        }

        setXVariableList(newXList);
        setAvailableList(newAvailableList);
        setSelectAllAvailable(false);
        setXVariable(pickFirstVariable(newXList));
    }, [availableList, xVariableList, dataFormat, pickFirstVariable, setXVariable]);

    const handleSendToY = useCallback(() => {
        const newYList = new Map(yVariableList);
        const newAvailableList = new Map(availableList);

        let maxY = Infinity;
        if (dataFormat === 'Many X') maxY = 0; // Horizontal Many X means 0 Y?
        if (dataFormat === 'Y Many X') maxY = 1;

        const freeSlots = maxY === Infinity ? Infinity : Math.max(0, maxY - newYList.size);
        let moved = 0;

        for (const [variableName, checked] of availableList.entries()) {
            if (!checked) continue;
            if (moved >= freeSlots) break;

            newYList.set(variableName, false);
            newAvailableList.set(variableName, false);
            moved++;
        }

        setYVariableList(newYList);
        setAvailableList(newAvailableList);
        setSelectAllAvailable(false);
        setYVariable(pickFirstVariable(newYList));
    }, [availableList, yVariableList, dataFormat, pickFirstVariable, setYVariable]);

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
        setXVariable(pickFirstVariable(newXList));
    }, [xVariableList, availableList, pickFirstVariable, setXVariable]);

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
        setYVariable(pickFirstVariable(newYList));
    }, [yVariableList, availableList, pickFirstVariable, setYVariable]);

    return {
        availableList,
        xVariableList,
        yVariableList,
        setAvailableList,
        setXVariableList,
        setYVariableList,
        selectAllAvailable,
        selectAllX,
        selectAllY,
        setSelectAllAvailable,
        setSelectAllX,
        setSelectAllY,
        xCount,
        yCount,
        availableCheckedCount,
        handleSendToX,
        handleSendToY,
        handleRemoveFromX,
        handleRemoveFromY
    };
};
