import { useState, useEffect } from 'react';
import { useStartProStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { Database } from '@utils';
import { EXCEL } from '@constants';
import type { Variable } from '../types';

export const useProjectVariables = (selectedProject?: string) => {
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

                const db = new Database(project.workspacePath);
                const columnQuery = `PRAGMA table_info(${EXCEL});`;

                const columns = await db.selectQuery(columnQuery);

                if (!columns || columns.length === 0) {
                    setError('No data columns found in the selected project');
                    setVariables([]);
                    return;
                }

                const processedVariables = await Promise.all(
                    columns.map(async (col: any) => {
                        const colType = col.type?.toUpperCase() || '';
                        let varType: 'numeric' | 'categorical' = 'numeric';

                        if (colType.includes('TEXT') || colType.includes('VARCHAR') || colType.includes('CHAR')) {
                            varType = 'categorical';
                        }
                        else if (colType.includes('INT') || colType.includes('REAL') || colType.includes('NUMERIC') || colType.includes('FLOAT') || colType.includes('DOUBLE')) {
                            varType = 'numeric';
                        }
                        else {
                            try {
                                const sampleQuery = `SELECT "${col.name}" FROM ${EXCEL} LIMIT 1`;
                                const sample = await db.selectQuery(sampleQuery);
                                if (sample && sample.length > 0) {
                                    const value = sample[0][col.name];
                                    if (typeof value === 'string' && isNaN(Number(value))) {
                                        varType = 'categorical';
                                    }
                                }
                            } catch (err) {
                                varType = 'numeric';
                            }
                        }

                        return {
                            name: col.name,
                            type: varType
                        };
                    })
                );

                setVariables(processedVariables);
                setRetryCount(0);
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
    }, [selectedProject]);

    const retry = () => {
        if (retryCount < 3) {
            setRetryCount(prev => prev + 1);
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
