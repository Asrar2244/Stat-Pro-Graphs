import { useEffect, useState } from 'react';
import { IFetchSingleGraph, fetchSingleGraph } from '@backend';
import { useStartProStore } from '@store/main-store';

interface ISelectedRun {
  loading: boolean;
  selectedRun: IFetchSingleGraph | undefined;
}

export const useSelectedRun = (dbName: string, id: number): ISelectedRun | undefined => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRun, setSelectedRun] = useState<IFetchSingleGraph | undefined>(undefined);
  const { setBlockUI, setGraphDataCache, getGraphDataCache } = useStartProStore();
  const cacheKey = `${dbName}-${id}`;

  useEffect(() => {
    if (id > 0) {
      // Check global cache first
      const cachedData = getGraphDataCache(cacheKey);
      if (cachedData) {
        setSelectedRun(cachedData);
        return;
      }

      // Fetch data if not in cache
      setLoading(true);
      fetchSingleGraph(dbName, id)
        .then((result) => {
          setGraphDataCache(cacheKey, result);
          setSelectedRun(result);
        })
        .catch((e) => {
          setBlockUI({ value: true, msg: e.message });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, dbName, cacheKey, setGraphDataCache, getGraphDataCache, setBlockUI]);

  return {
    loading,
    selectedRun,
  };
};

export const useGetRunID = (): {
  id: number;
  title: string;
  subTitle?: string;
  setRunDetail: (id: number, title: string, subTitle?: string) => void;
} => {
  const [runId, setRunId] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [subTitle, setSubTitle] = useState<string | undefined>(undefined);
  
  const setRunDetail = (id: number, title: string, subTitle?: string): void => {
    setRunId(id);
    setTitle(title);
    setSubTitle(subTitle);
  };
  
  return {
    id: runId,
    title,
    setRunDetail,
    subTitle,
  };
};


