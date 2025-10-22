import { useState, useEffect } from 'react';
import { useStartProStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { Database } from '@utils';
import { EXCEL } from '@constants';
import type { Variable } from '../lineScatterPlotSlice';

interface UseProjectVariablesResult {
  variables: Variable[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  canRetry: boolean;
  retryCount: number;
}

/**
 * Custom hook for loading and managing project variables
 * @param selectedProject - The name of the selected project
 * @returns Object containing variables, loading state, and error
 */
export const useProjectVariables = (selectedProject?: string): UseProjectVariablesResult => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const { projects: projectStore } = useStartProStore(
    useShallow((state) => ({ projects: state.projects }))
  );

  useEffect(() => {
    if (!selectedProject) {
      // Don't clear variables immediately - keep them for better UX
      return;
    }

    const loadVariables = async (isRetry = false) => {
      if (isRetry) {
        setIsRetrying(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      try {
        const project = projectStore[selectedProject];
        if (!project) {
          setError('Project not found in workspace');
          setVariables([]);
          return;
        }

        // Load variables from the project's database
        const db = new Database(project.workspacePath);
        const columnQuery = `PRAGMA table_info(${EXCEL});`;
        
        const columns = await db.selectQuery(columnQuery);
        
        if (!columns || columns.length === 0) {
          setError('No data columns found in the selected project');
          setVariables([]);
          return;
        }
        
        // Determine variable types based on column type from database
        const processedVariables = await Promise.all(
          columns.map(async (col: any) => {
            // Check column type from SQLite
            const colType = col.type?.toUpperCase() || '';
            let varType: 'numeric' | 'categorical' = 'numeric';
            
            // SQLite TEXT types are categorical
            if (colType.includes('TEXT') || colType.includes('VARCHAR') || colType.includes('CHAR')) {
              varType = 'categorical';
            } 
            // Numeric types
            else if (colType.includes('INT') || colType.includes('REAL') || colType.includes('NUMERIC') || colType.includes('FLOAT') || colType.includes('DOUBLE')) {
              varType = 'numeric';
            }
            // If no type specified, sample the data to determine
            else {
              try {
                const sampleQuery = `SELECT "${col.name}" FROM ${EXCEL} LIMIT 1`;
                const sample = await db.selectQuery(sampleQuery);
                if (sample && sample.length > 0) {
                  const value = sample[0][col.name];
                  // If value is a string (non-numeric), it's categorical
                  if (typeof value === 'string' && isNaN(Number(value))) {
                    varType = 'categorical';
                  }
                }
              } catch (err) {
                // If sampling fails, default to numeric
                varType = 'numeric';
              }
            }
            
            return {
              id: col.name,
              name: col.name,
              type: varType
            };
          })
        );
        
        setVariables(processedVariables);
        setRetryCount(0); // Reset retry count on success
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load variables: ${errorMessage}`);
        setVariables([]);
        
      } finally {
        setIsLoading(false);
        setIsRetrying(false);
      }
    };

    loadVariables();
  }, [selectedProject]); // Removed workspacePath dependency that was causing unnecessary reloads

  // Retry function for manual retry
  const retry = () => {
    if (retryCount < 3) { // Max 3 retries
      setRetryCount(prev => prev + 1);
      // Force reload by updating a dependency
      window.location.reload();
    }
  };

  return { 
    variables, 
    isLoading: isLoading || isRetrying, 
    error, 
    retry,
    canRetry: retryCount < 3 && !!error,
    retryCount
  };
};