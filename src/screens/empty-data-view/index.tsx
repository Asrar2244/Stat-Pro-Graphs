import { FC, useCallback, useState, useEffect, useRef, useMemo, memo } from 'react';
import { useActiveNode, useNodeActions } from '@hooks';
import { useContainerLayout } from './styles-hook/use-container-layout';
// import { ToolStrip } from './tool-strip';
import { ViewRender } from './view-render';
import { EmptyDataContext } from './context';
import { Matrix, CellBase } from 'react-spreadsheet';
import { useEmptyDataStore } from '@store';

interface EmptyDataViewProps {
  id?: string;
  name?: string;
  tabName?: string;
  [key: string]: any;
}

// CRITICAL: Memoize component to prevent remounts when props change
// Only remount if the actual tab identity changes (id/name/tabName)
const EmptyDataViewComponent: FC<EmptyDataViewProps> = (props) => {
  // Capture nodeId from props (passed from AppBodyArea via FlexLayout node.getId())
  const nodeId = props?.nodeId;
  // CRITICAL: Use id or name, NOT tabName, because tabName changes when saving (file path)
  // This ensures state persists even when tabName (workspacePath) changes after save
  const storageKey = useMemo(() => {
    const id = nodeId || props?.id || props?.name || 'default';
    return `empty-data-view-state-${id}`;
  }, [nodeId, props?.id, props?.name]); // Added nodeId to dependencies

  // Load persisted state from sessionStorage on mount
  const loadPersistedState = useCallback((): {
    data: Matrix<CellBase>;
    columns: Record<string, string>;
    dataState: undefined | 'draft' | 'published';
    projectId?: number | string; // CRITICAL: Store project ID per tab
    workspacePath?: string; // CRITICAL: Store workspacePath for database loading
  } => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);

        // CRITICAL: Check if this is a large dataset (data stored in database, not sessionStorage)
        if (parsed.isLargeDataset) {
          // For large datasets, only restore metadata (projectId, dataState, columns, workspacePath)
          // The actual data is in the database and will be loaded by the spreadsheet component
          return {
            data: [], // Empty data - spreadsheet will load from database
            columns: parsed.columns || {},
            dataState: parsed.dataState,
            projectId: parsed.projectId, // Restore project ID
            workspacePath: parsed.workspacePath, // Restore workspacePath for database loading
          };
        }

        // For small datasets, restore full data from sessionStorage
        if (parsed.data && Array.isArray(parsed.data) && parsed.data.length > 0) {
          const hasData = parsed.data.some((row: any) =>
            row && Array.isArray(row) && row.some((cell: any) =>
              cell && typeof cell === 'object' && 'value' in cell && cell.value
            )
          );
          if (hasData) {
            return {
              data: parsed.data || [],
              columns: parsed.columns || {},
              dataState: parsed.dataState,
              projectId: parsed.projectId, // Restore project ID
              workspacePath: parsed.workspacePath, // Restore workspacePath
            };
          }
        }
      }
    } catch (e) {
      // Failed to load persisted state
    }
    // CRITICAL: If no sessionStorage data, return defaults from props
    return {
      data: [],
      columns: {},
      dataState: props?.dataState, // Use dataState passed from explorer or menu executor
      projectId: props?.projectId || props?.id, // CRITICAL: Fallback to props.id (from explorer) if projectId not explicit
      workspacePath: props?.tabName || props?.workspacePath
    };
  }, [storageKey, props?.projectId, props?.id, props?.dataState, props?.tabName, props?.workspacePath]);

  // CRITICAL: Always load initial state from sessionStorage directly (not from ref)
  // This ensures state is always fresh when component mounts or remounts
  const getInitialState = useCallback(() => {
    return loadPersistedState();
  }, [loadPersistedState]);

  // Initialize state from sessionStorage - always fresh on mount
  const initialState = getInitialState();
  const [data, setData] = useState<Matrix<CellBase>>(initialState.data);
  const [selectedCell, setSelectedCell] = useState<Selection | undefined>();
  const [columns, setColumnsState] = useState<Record<string, string>>(initialState.columns);
  const [dataState, setDataStateBase] = useState<undefined | 'draft' | 'published'>(initialState.dataState);

  // CRITICAL: Store project ID per tab - this ensures each EmptyDataView has its own project
  const [projectId, setProjectId] = useState<number | string | undefined>(initialState.projectId);
  // CRITICAL: Store workspacePath per tab - prioritize props.tabName (from explorer) over sessionStorage
  const [workspacePath, setWorkspacePath] = useState<string | undefined>(
    props?.tabName || initialState.workspacePath
  );

  const classes = useContainerLayout();

  // Global store for data access
  const { setSpreadsheetData, setColumns: setGlobalColumns, setDataState: setGlobalDataState, setProjectId: setGlobalProjectId, setWorkspacePath: setGlobalWorkspacePath } = useEmptyDataStore();

  const { updateNodeAttributes } = useNodeActions();

  // Get current active tab ID to isolate global state updates
  const activeNode = useActiveNode([nodeId, dataState, projectId]);

  // CRITICAL: Robust per-tab state persistence
  // This wrapped function ensures that when we mark a tab as 'draft' or 'published',
  // we update the FlexLayout node's configuration immediately.
  const setDataState = useCallback((state: 'draft' | 'published' | undefined) => {
    console.log(`🔄 [EmptyDataView] setDataState called with: ${state}, nodeId: ${nodeId}`);
    setDataStateBase(state);
    if (nodeId) {
      console.log(`✅ [EmptyDataView] Updating node config with dataState: ${state}`);
      updateNodeAttributes(nodeId, {
        config: {
          ...props,
          dataState: state
        }
      });
    } else {
      console.warn('⚠️ [EmptyDataView] nodeId is not available, cannot update node config!');
    }
  }, [nodeId, props, updateNodeAttributes]);


  // CRITICAL: Always reload state from ses sionStorage when storageKey changes or component remounts
  // This ensures state is always fresh and prevents resets when switching tabs or changing theme
  // Use a ref to track the last loaded storageKey to prevent unnecessary reloads
  const lastLoadedStorageKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // Only reload if storageKey changed (new tab) or this is first mount
    const shouldReload = lastLoadedStorageKeyRef.current !== storageKey;

    if (shouldReload) {
      lastLoadedStorageKeyRef.current = storageKey;

      // Always reload from sessionStorage for this storageKey (handles tab switches and remounts)
      const currentState = loadPersistedState();

      // Check if we have data to restore
      const hasData = currentState.data.some((row: any) =>
        row && Array.isArray(row) && row.some((cell: any) =>
          cell && typeof cell === 'object' && 'value' in cell && cell.value
        )
      );

      // Always update state if we have data (even if it's the same - ensures fresh state)
      // CRITICAL: For large datasets (isLargeDataset flag), don't set empty data array
      // The spreadsheet will load data from database using projectId
      if (hasData) {
        setData(currentState.data);
        setColumnsState(currentState.columns);
        if (currentState.dataState) {
          setDataState(currentState.dataState);
        }
        if (currentState.projectId) {
          setProjectId(currentState.projectId);
        }
        // CRITICAL: Restore workspacePath from sessionStorage or use props.tabName
        if (currentState.workspacePath) {
          setWorkspacePath(currentState.workspacePath);
        } else if (props?.tabName) {
          setWorkspacePath(props.tabName);
        }
      } else if (currentState.projectId || props?.tabName) {
        // For large datasets, we still need to restore metadata (projectId, dataState, columns, workspacePath)
        // But don't set empty data array - let spreadsheet manage its own state
        setColumnsState(currentState.columns);
        if (currentState.dataState) {
          setDataState(currentState.dataState);
        }
        if (currentState.projectId) {
          setProjectId(currentState.projectId);
        }
        // CRITICAL: Restore workspacePath from sessionStorage or use props.tabName (when opening from explorer)
        if (currentState.workspacePath) {
          setWorkspacePath(currentState.workspacePath);
        } else if (props?.tabName) {
          setWorkspacePath(props.tabName);
        }
      } else if (props?.tabName) {
        // CRITICAL: If no sessionStorage data but we have props.tabName (opening from explorer),
        // set workspacePath so data can be loaded from database
        setWorkspacePath(props.tabName);
      }
    }
  }, [storageKey, loadPersistedState]); // Re-run when storageKey changes (new tab) or component remounts

  // CRITICAL: Update workspacePath when props.tabName changes (e.g., when opening from explorer)
  useEffect(() => {
    if (props?.tabName && props.tabName !== workspacePath) {
      setWorkspacePath(props.tabName);
    }
  }, [props?.tabName, workspacePath]);

  // Persist state to sessionStorage whenever it changes
  // CRITICAL: Only persist if we've initialized this storageKey (prevents overwriting with empty state on mount)
  useEffect(() => {
    // Only persist if this storageKey has been loaded (prevents overwriting with empty state on initial mount)
    if (lastLoadedStorageKeyRef.current === storageKey) {
      // Add a small delay to avoid persisting stale data right after save
      const timeoutId = setTimeout(() => {
        try {
          const hasData = data.some((row: any) =>
            row && Array.isArray(row) && row.some((cell: any) =>
              cell && typeof cell === 'object' && 'value' in cell && cell.value
            )
          );

          // CRITICAL: For large datasets (>2k rows), skip persisting data to sessionStorage
          // The database is the source of truth for large datasets
          // Only persist metadata (projectId, dataState) to avoid QuotaExceededError
          const isLargeDataset = data.length > 2000;

          if (isLargeDataset) {
            // For large datasets, only persist metadata (not the actual data)
            // This prevents QuotaExceededError and state resets
            const metadataOnly = {
              columns,
              dataState,
              projectId, // CRITICAL: Persist project ID per tab
              workspacePath: workspacePath || props?.tabName, // CRITICAL: Persist workspacePath (from state or props) for database loading
              isLargeDataset: true, // Flag to indicate data is in database, not sessionStorage
            };
            sessionStorage.setItem(storageKey, JSON.stringify(metadataOnly));
          } else if (hasData || dataState) {
            // For small datasets, persist everything normally
            sessionStorage.setItem(storageKey, JSON.stringify({
              data,
              columns,
              dataState,
              projectId, // CRITICAL: Persist project ID per tab
              workspacePath: workspacePath || props?.tabName, // CRITICAL: Persist workspacePath (from state or props) for database loading
            }));
          }
        } catch (e) {
          // If quota exceeded or any other error, skip sessionStorage
          // For large datasets, this is expected and not a problem
          // The database is the source of truth
        }
      }, 100); // Small delay to ensure save completes first

      return () => clearTimeout(timeoutId);
    }
  }, [data, columns, dataState, projectId, workspacePath, props?.tabName, storageKey]); // Added workspacePath and props?.tabName to persist them

  const setColumns = useCallback((column: Record<string, string>) => {
    setColumnsState((cols: Record<string, string>) => {
      const newColumns = { ...cols, ...column };
      // Sync with global store
      setGlobalColumns(newColumns);
      return newColumns;
    });
  }, [setGlobalColumns]);

  // Sync data with global store whenever it changes
  useEffect(() => {
    // CRITICAL: Only sync to global store if this is the active tab
    // This prevents background tabs from "leaking" their save state (e.g., 'draft') 
    // into the global store and triggering incorrect prompts in other tabs.
    if (activeNode.id !== nodeId && nodeId !== undefined) return;

    setSpreadsheetData(data);

    // Sync other states to global store
    // CRITICAL: Always sync dataState, defaulting to 'published' if undefined
    setGlobalDataState(dataState || 'published');

    if (projectId) setGlobalProjectId(projectId);
    if (workspacePath) setGlobalWorkspacePath(workspacePath);

  }, [data, setSpreadsheetData, dataState, projectId, workspacePath, setGlobalDataState, setGlobalProjectId, setGlobalWorkspacePath, activeNode.id, nodeId]);
  return (
    <div className={classes.layoutContainer}>
      <EmptyDataContext.Provider
        value={{
          data,
          selectedCell,
          columns,
          setData,
          setSelectedCell,
          setColumns,
          dataState,
          setDataState,
          projectId, // CRITICAL: Pass project ID to context
          setProjectId, // CRITICAL: Allow updating project ID
          storageKey, // CRITICAL: Pass storageKey to context so ViewRender can use it for unique INIT_DATA_KEY
          workspacePath: workspacePath || props?.tabName, // CRITICAL: Pass workspacePath (from state or props) to load data from database
          nodeId, // CRITICAL: Pass nodeId to context for robust save identification
          nodeConfig: props, // CRITICAL: Pass original props (config) to context for reference
        }}
      >
        {/* <ToolStrip /> */}
        <ViewRender />
      </EmptyDataContext.Provider>
    </div>
  );
};

// Memoize with custom comparison - only remount if tab identity changes
// CRITICAL: Do NOT include tabName in comparison - it changes after save and should NOT cause remount
// tabName is just metadata (file path) and doesn't affect component identity
export const EmptyDataView = memo(EmptyDataViewComponent, (prevProps, nextProps) => {
  // Only remount if the actual tab identity changes (id or name)
  // Ignore tabName, dataState, modifiedDateTime, and other metadata changes to prevent resets
  return (
    prevProps.id === nextProps.id &&
    prevProps.name === nextProps.name
    // Removed tabName from comparison - it changes after save and should NOT trigger remount
  );
});
