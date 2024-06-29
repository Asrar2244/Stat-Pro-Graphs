import { useCallback, useEffect, useState } from 'react';
import { useToaster, useWindowFocus } from '@hooks';
import { fetchRunListOutput } from '@backend';
interface IFetch {
  isLoading: boolean;
  data: Array<any>;
}

export const useFetchOutput = (tabName: string): IFetch => {
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState<Array<any>>([]);
  const toast = useToaster();
  const focus = useWindowFocus();
  const loadRunHistory = useCallback(async () => {
    const newData = await fetchData();
    setData(newData);
  }, [tabName, focus]);
  useEffect(() => {
    if (tabName !== '') loadRunHistory();
  }, [tabName]);
  const fetchData = async (): Promise<any> => {
    try {
      setLoading(true);
      const result = await fetchRunListOutput(tabName);
      return result;
    } catch (e: any) {
      toast.error({ body: e.message });
    } finally {
      setLoading(false);
    }
  };
  return {
    isLoading,
    data,
  };
};
