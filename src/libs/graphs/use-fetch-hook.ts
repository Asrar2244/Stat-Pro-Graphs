import { useMemo, useState } from 'react';
import { Database, IGraph } from '@utils';
import { graphWorker } from '@workers/graph-worker';
import { EXCEL } from '@constants';
import { extendTraces, addTraces, relayout } from 'plotly.js-dist';
interface IDataResult {
  totalRecords: number;
  loadPagingData: (startIndex: number, stopIndex: number) => Promise<void>;
  loading: boolean;
}
interface ITableFetch {
  dbName: string;
  tableName: string;
  graph: IGraph;
  plotly: any;
}
export const useTableFetch = ({ dbName, tableName, graph, plotly }: ITableFetch): IDataResult => {
  const [loading, setLoading] = useState<boolean>(true);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const statements = useMemo(async () => {
    setLoading(true);
    const { initialQuery, dynamic } = await graphWorker.generateQueryForColumns(
      graph.traces,
      tableName,
    );
    const db = new Database(dbName);
    const recordColumns = await db.selectQuery(initialQuery);
    if (recordColumns.length === 0) {
      setLoading(false);
      return {
        query: '',
      };
    }
    const { query, pagingQuery, newTraces, dynamicQuery } =
      await graphWorker.generateColumnsToFetch(
        graph,
        recordColumns,
        EXCEL,
        tableName,
        dynamic?.columns,
      );
    addInitialTrace(newTraces);
    const recordCount = await db.selectQuery(pagingQuery);
    setTotalRecords(recordCount[0]['CNT']);
    setLoading(false);
    return {
      query,
      dynamicQuery,
      newTraces,
    };
  }, []);

  const addInitialTrace = (newTraces: any) => {
    const traceArray: any = [];
    const layout: any = { ...plotly.current?.layout };
    Object.keys(newTraces).forEach((key: string, index: number) => {
      newTraces[key].name = String(newTraces[key].name).toUpperCase();
      if (index === 0) {
        layout['xaxis'] = {
          showline: false,
          zeroline: true,
          showticklabels: true,
          ticklabelposition: 'inside',
          ...graph?.layout?.xaxis,
        };
        layout['yaxis'] = {
          showline: false,
          showticklabels: true,
          zeroline: true,
          ticklabelposition: 'inside',
          ...graph?.layout?.yaxis,
        };
      }

      traceArray.push(newTraces[key]);
    });
    relayout(plotly.current, layout);

    addTraces(
      plotly.current,
      traceArray.map((tra: any) => {
        return { ...tra, x: [], y: [], z: [] };
      }),
    );
  };

  const loadPagingData = async (startIndex: number, stopIndex: number) => {
    setLoading(true);
    const { query, newTraces, dynamicQuery } = await statements;
    if (query !== '') {
      const db = new Database(dbName);
      const appendLimit = totalRecords > 0 ? `LIMIT ${startIndex},${stopIndex}` : '';
      const initQuery = `${query} ${appendLimit}`;
      const dynamics = dynamicQuery && dynamicQuery !== '' ? `${dynamicQuery} ${appendLimit}` : '';
      const result = await db.selectQuery(`${initQuery}`);
      let resultArray: Array<any> = result;
      if (dynamics !== '') {
        const dynamicResult = await db.selectQuery(`${dynamics}`);
        resultArray = await graphWorker.createSingleArray(result, dynamicResult);
      }

      const { extendTrace, noOfTraces } = await graphWorker.generatingPlotlyData(
        resultArray,
        newTraces,
      );
      extendTraces(plotly.current, extendTrace, noOfTraces);
      setLoading(false);
    }
  };
  return {
    totalRecords,
    loadPagingData,
    loading,
  };
};
