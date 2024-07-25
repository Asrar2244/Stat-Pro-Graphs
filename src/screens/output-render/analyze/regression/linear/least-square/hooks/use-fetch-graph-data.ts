import { useEffect, useState } from 'react';
import { IFetchSingleOutput, fetchSelected } from '@backend/fetch-output-table';
import { EXCEL } from '@constants/collection-names';
interface IOutput {
  data: any[];
  loading: boolean;
}
export const useFetchGraphData = (params?: IFetchSingleOutput, tableRef?: any): IOutput => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    if (params && params?.id > 0) {
      setLoading(true);
      const sqlColumns = (
        tableRef.current?.independent_var_names.concat(tableRef.current?.dependent_var_names) ?? []
      ).join(',');
      if (sqlColumns === '') {
        setData([]);
        setLoading(false);
        return;
      }
      fetchSelected(params.tabName, `SELECT ${sqlColumns} FROM ${EXCEL};`)
        .then((result) => {
          setData(result);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [params?.id]);

  return {
    data,
    loading,
  };
};
