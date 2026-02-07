import { useState, useMemo, useCallback } from 'react';
import type { Variable } from '../lineScatterPlotSlice';
import type { DataFormat, LineScatterSubType } from '../lineScatterPlotSlice';
import { isSimplePlot, isMultiplePlot } from '../utils/dataFormatHelpers';

interface UseVariableManagementResult {
    // Variable lists
    availableList: Map<string, boolean>;
    xVariableList: Map<string, boolean>;
    yVariableList: Map<string, boolean>;
    errorBarVariableList: Map<string, boolean>;
    categoryVariableList: Map<string, boolean>;

    // Selection states
    availableCheckedCount: number;
    xCount: number;
    yCount: number;
    errorBarCount: number;
    categoryCount: number;

    // Actions
    setAvailableList: (list: Map<string, boolean>) => void;
    setXVariableList: (list: Map<string, boolean>) => void;
    setYVariableList: (list: Map<string, boolean>) => void;
    setErrorBarVariableList: (list: Map<string, boolean>) => void;
    setCategoryVariableList: (list: Map<string, boolean>) => void;

    // Selection actions
    handleSendToX: (variables: string[]) => void;
    handleSendToY: (variables: string[]) => void;
    handleSendToErrorBar: (variables: string[]) => void;
    handleSendToCategory: (variables: string[]) => void;
    handleRemoveFromX: (variables: string[]) => void;
    handleRemoveFromY: (variables: string[]) => void;
    handleRemoveFromErrorBar: (variables: string[]) => void;
    handleRemoveFromCategory: (variables: string[]) => void;

    // Selection states
    selectAllAvailable: boolean | string | undefined;
    selectAllX: boolean | string | undefined;
    selectAllY: boolean | string | undefined;
    selectAllErrorBar: boolean | string | undefined;
    selectAllCategory: boolean | string | undefined;

    setSelectAllAvailable: (selected: boolean | string | undefined) => void;
    setSelectAllX: (selected: boolean | string | undefined) => void;
    setSelectAllY: (selected: boolean | string | undefined) => void;
    setSelectAllErrorBar: (selected: boolean | string | undefined) => void;
    setSelectAllCategory: (selected: boolean | string | undefined) => void;

    // Validation helpers
    canSendToXForReplicates: boolean;
    canSendToYForReplicates: boolean;
    canSendToXForYReplicates: boolean;
    canSendToYForXReplicates: boolean;
}

/**
 * Hook for managing variable selection and organization
 */
export const useVariableManagement = (
    dataFormat?: DataFormat,
    subType?: LineScatterSubType,
    availableVariables: Variable[] = []
): UseVariableManagementResult => {
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

    // Initialize available list when variables change
    useMemo(() => {
        const newMap = new Map<string, boolean>();
        availableVariables.forEach(variable => {
            newMap.set(variable.name, false);
        });
        setAvailableList(newMap);
    }, [availableVariables]);

    // Computed counts
    const availableCheckedCount = useMemo(() =>
        Array.from(availableList.values()).filter(v => v).length, [availableList]
    );
    const xCount = xVariableList.size;
    const yCount = yVariableList.size;
    const errorBarCount = errorBarVariableList.size;
    const categoryCount = categoryVariableList.size;

    // Helper function to move variables between lists
    const moveVariables = useCallback((
        fromList: Map<string, boolean>,
        toList: Map<string, boolean>,
        variables: string[],
        setFromList: (list: Map<string, boolean>) => void,
        setToList: (list: Map<string, boolean>) => void
    ) => {
        const newFromList = new Map(fromList);
        const newToList = new Map(toList);

        variables.forEach(variableName => {
            if (newFromList.has(variableName)) {
                newFromList.delete(variableName);
                newToList.set(variableName, false);
            }
        });

        setFromList(newFromList);
        setToList(newToList);
    }, []);

    // Send variables to X - limit based on simple vs multiple plot
    const handleSendToX = useCallback((variables: string[]) => {
        if (isSimplePlot(subType)) {
            // For simple plots, limit to 1 variable
            if (xVariableList.size >= 1) {
                return; // Already at limit
            }
            // Take only the first variable
            const limitedVariables = variables.slice(0, 1);
            moveVariables(availableList, xVariableList, limitedVariables, setAvailableList, setXVariableList);
        } else {
            // For multiple plots, allow multiple variables
            moveVariables(availableList, xVariableList, variables, setAvailableList, setXVariableList);
        }
    }, [availableList, xVariableList, moveVariables, subType]);

    // Send variables to Y - limit based on simple vs multiple plot
    const handleSendToY = useCallback((variables: string[]) => {
        if (isSimplePlot(subType)) {
            // For simple plots, limit to 1 variable
            if (yVariableList.size >= 1) {
                return; // Already at limit
            }
            // Take only the first variable
            const limitedVariables = variables.slice(0, 1);
            moveVariables(availableList, yVariableList, limitedVariables, setAvailableList, setYVariableList);
        } else {
            // For multiple plots, allow multiple variables
            moveVariables(availableList, yVariableList, variables, setAvailableList, setYVariableList);
        }
    }, [availableList, yVariableList, moveVariables, subType]);

    // Send variables to Error Bar
    const handleSendToErrorBar = useCallback((variables: string[]) => {
        moveVariables(availableList, errorBarVariableList, variables, setAvailableList, setErrorBarVariableList);
    }, [availableList, errorBarVariableList, moveVariables]);

    // Send variables to Category
    const handleSendToCategory = useCallback((variables: string[]) => {
        moveVariables(availableList, categoryVariableList, variables, setAvailableList, setCategoryVariableList);
    }, [availableList, categoryVariableList, moveVariables]);

    // Remove variables from X
    const handleRemoveFromX = useCallback((variables: string[]) => {
        moveVariables(xVariableList, availableList, variables, setXVariableList, setAvailableList);
    }, [xVariableList, availableList, moveVariables]);

    // Remove variables from Y
    const handleRemoveFromY = useCallback((variables: string[]) => {
        moveVariables(yVariableList, availableList, variables, setYVariableList, setAvailableList);
    }, [yVariableList, availableList, moveVariables]);

    // Remove variables from Error Bar
    const handleRemoveFromErrorBar = useCallback((variables: string[]) => {
        moveVariables(errorBarVariableList, availableList, variables, setErrorBarVariableList, setAvailableList);
    }, [errorBarVariableList, availableList, moveVariables]);

    // Remove variables from Category
    const handleRemoveFromCategory = useCallback((variables: string[]) => {
        moveVariables(categoryVariableList, availableList, variables, setCategoryVariableList, setAvailableList);
    }, [categoryVariableList, availableList, moveVariables]);

    const handleSetSelectAllAvailable = useCallback((selected: boolean | string | undefined) => {
        if (typeof selected !== 'boolean') return;
        setAvailableList(prev => {
            const newMap = new Map(prev);
            newMap.forEach((_, key) => newMap.set(key, selected));
            return newMap;
        });
        setSelectAllAvailable(selected);
    }, []);

    const handleSetSelectAllX = useCallback((selected: boolean | string | undefined) => {
        if (typeof selected !== 'boolean') return;
        setXVariableList(prev => {
            const newMap = new Map(prev);
            newMap.forEach((_, key) => newMap.set(key, selected));
            return newMap;
        });
        setSelectAllX(selected);
    }, []);

    const handleSetSelectAllY = useCallback((selected: boolean | string | undefined) => {
        if (typeof selected !== 'boolean') return;
        setYVariableList(prev => {
            const newMap = new Map(prev);
            newMap.forEach((_, key) => newMap.set(key, selected));
            return newMap;
        });
        setSelectAllY(selected);
    }, []);

    const handleSetSelectAllErrorBar = useCallback((selected: boolean | string | undefined) => {
        if (typeof selected !== 'boolean') return;
        setErrorBarVariableList(prev => {
            const newMap = new Map(prev);
            newMap.forEach((_, key) => newMap.set(key, selected));
            return newMap;
        });
        setSelectAllErrorBar(selected);
    }, []);

    const handleSetSelectAllCategory = useCallback((selected: boolean | string | undefined) => {
        if (typeof selected !== 'boolean') return;
        setCategoryVariableList(prev => {
            const newMap = new Map(prev);
            newMap.forEach((_, key) => newMap.set(key, selected));
            return newMap;
        });
        setSelectAllCategory(selected);
    }, []);

    const validationHelpers = useMemo(() => {
        const isReplicateFormat = dataFormat?.includes('Replicate') || false;

        return {
            canSendToXForReplicates: isReplicateFormat,
            canSendToYForReplicates: isReplicateFormat,
            canSendToXForYReplicates: dataFormat === 'Y Many X' || dataFormat === 'Y Single X Replicates',
            canSendToYForXReplicates: dataFormat === 'X Many Y' || dataFormat === 'X Single Y Replicates',
        };
    }, [dataFormat]);

    return {
        // Variable lists
        availableList,
        xVariableList,
        yVariableList,
        errorBarVariableList,
        categoryVariableList,

        // Selection states
        availableCheckedCount,
        xCount,
        yCount,
        errorBarCount,
        categoryCount,

        // Actions
        setAvailableList,
        setXVariableList,
        setYVariableList,
        setErrorBarVariableList,
        setCategoryVariableList,

        // Selection actions
        handleSendToX,
        handleSendToY,
        handleSendToErrorBar,
        handleSendToCategory,
        handleRemoveFromX,
        handleRemoveFromY,
        handleRemoveFromErrorBar,
        handleRemoveFromCategory,

        // Select all states
        selectAllAvailable,
        selectAllX,
        selectAllY,
        selectAllErrorBar,
        selectAllCategory,
        setSelectAllAvailable: handleSetSelectAllAvailable,
        setSelectAllX: handleSetSelectAllX,
        setSelectAllY: handleSetSelectAllY,
        setSelectAllErrorBar: handleSetSelectAllErrorBar,
        setSelectAllCategory: handleSetSelectAllCategory,

        // Validation helpers
        ...validationHelpers,
    };
};
