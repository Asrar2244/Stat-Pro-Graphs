import { useCallback, useEffect, useState } from 'react';
import { EXCEL } from '@constants';
import { Database } from '@utils';
import { useStartProStore } from '@store/main-store';
interface IFetch {
  isLoading: boolean;
  loadMoreFun: (startIndex: number, stopIndex: number) => Promise<void>;
  data: Array<any>;
}

export const useFetchRecords = (tabName: string, pageSize?: number): IFetch => {
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState<Array<any>>([]);
  const { setBlockUI } = useStartProStore();
  const loadMoreFun = useCallback(async (startIndex: number, stopIndex: number) => {
    const newData = await fetchData(startIndex, stopIndex);
    setData(newData);
  }, []);
  useEffect(() => {
    if (!pageSize) {
      loadMoreFun(0, 500);
    }
  }, []);
  const fetchData = async (startIndex: number, stopIndex: number): Promise<any> => {
    let db: Database | null = null;
    try {
      setLoading(true);
      db = new Database(tabName);
      const result = await db.selectQuery(
        `SELECT * FROM ${EXCEL}
            LIMIT ${startIndex},${stopIndex - startIndex}`,
      );
      result.unshift({});
      return result;
    } catch (e: any) {
      setBlockUI({ value: true, msg: e.message });
    } finally {
      if (db) {
        await db.close();
      }
      setLoading(false);
    }
  };
  return {
    isLoading,
    loadMoreFun,
    data,
  };
};
