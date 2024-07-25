import { useEffect, useState } from 'react';
import { Database, ITranslate, IRecordTableType } from '@utils';
import { tableWorker } from '@workers/table-gen-worker';
interface IDataResult {
  totalRecords: number;
  templateView: Array<Array<string>>;
}
interface ITableFetch extends ITranslate {
  dbName: string;
  tableName: string;
  view: Array<Array<string>>;
  recordType: IRecordTableType;
}

export const useTableFetch = ({
  dbName,
  tableName,
  view,
  recordType,
}: ITableFetch): IDataResult => {
  const [templateView, setTemplateView] = useState<Array<Array<string>>>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  useEffect(() => {
    execute();
  }, [dbName, tableName]);

  const execute = async () => {
    const { query } = await tableWorker.generateQueryColumn(view, tableName, recordType);
    if (query !== '') {
      const db = new Database(dbName);
      const result = await db.selectQuery(query);
      const templateView = await tableWorker.mergingData(view, result, recordType);
      setTemplateView(templateView);
    }
  };
  return {
    templateView,
    totalRecords,
  };
};
