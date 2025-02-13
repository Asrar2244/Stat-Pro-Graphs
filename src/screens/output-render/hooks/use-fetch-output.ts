import { useCallback, useEffect, useState } from 'react';
import { useWindowFocus } from '@hooks';
import { fetchRunListOutput } from '@backend';
import { useStartProStore } from '@store/main-store';
interface IFetch {
  isLoading: boolean;
  data: Array<any>;
}

export const useFetchOutput = (tabName: string): IFetch => {
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState<Array<any>>([]);
  const { setBlockUI } = useStartProStore()
  const focus = useWindowFocus();
  const loadRunHistory = useCallback(async () => {
    const newData = await fetchData();
    setData(newData);
  }, [tabName]);
  useEffect(() => {
    if (tabName !== '' && focus) loadRunHistory();
  }, [tabName, focus]);
  const fetchData = async (): Promise<any> => {
    try {
      setLoading(true);
      const result = await fetchRunListOutput(tabName);
      return result;
    } catch (e: any) {
      setBlockUI({ value: true, msg: e.message });
    } finally {
      setLoading(false);
    }
  };
  return {
    isLoading,
    data,
  };
};
