import { useCallback, useEffect, useState } from 'react';
import { useWindowFocus } from '@hooks';
import { fetchGraphRunList } from '@backend';
import { useStartProStore } from '@store/main-store';
import { isValidWorkspacePath } from '@utils/helper';

interface IFetch {
  isLoading: boolean;
  data: Array<any>;
}

export const useFetchGraphs = (tabName: string): IFetch => {
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState<Array<any>>([]);
  const { setBlockUI } = useStartProStore();
  const focus = useWindowFocus();

  const loadRunHistory = useCallback(async () => {
    const newData = await fetchData();
    setData(newData);
  }, [tabName]);

  useEffect(() => {
    // Load immediately when tabName is valid, don't wait for focus
    // This ensures graphs display when tab first opens
    if (tabName !== '' && isValidWorkspacePath(tabName)) {
      loadRunHistory();
    }
  }, [tabName]); // Only depend on tabName, not loadRunHistory

  // Also reload when window regains focus (for data freshness)
  useEffect(() => {
    if (tabName !== '' && isValidWorkspacePath(tabName) && focus) {
      loadRunHistory();
    }
  }, [focus, tabName]); // Add tabName to ensure loadRunHistory is current

  // Listen for project updates (e.g., when a new graph is created)
  useEffect(() => {
    const handleProjectUpdate = (event: CustomEvent) => {
      const { workspacePath } = event.detail;
      // Only refresh if the update is for the current project
      if (workspacePath === tabName) {
        console.log('🔔 Graph list: Received project update, refreshing...');
        loadRunHistory();
      }
    };

    // @ts-ignore - Custom event
    window.addEventListener('statpro:projectUpdated', handleProjectUpdate);

    return () => {
      // @ts-ignore
      window.removeEventListener('statpro:projectUpdated', handleProjectUpdate);
    };
  }, [tabName, loadRunHistory]);

  const fetchData = async (): Promise<any> => {
    try {
      setLoading(true);
      const result = await fetchGraphRunList(tabName);
      return result;
    } catch (e: any) {
      // Don't show error dialog for graph fetching errors - just log them
      // setBlockUI({ value: true, msg: e.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading,
    data,
  };
};
