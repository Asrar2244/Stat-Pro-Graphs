import { useMemo, useState } from 'react';
import { Database, IGraph } from '@utils';
import { graphWorker } from '@workers/graph-worker';
import { EXCEL } from '@constants';
import { extendTraces, addTraces, relayout } from 'plotly.js-dist';
// import { INITIAL_GRAPH_LAYOUT } from '@constants';
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
    const initialQuery = await graphWorker.generateQueryForColumns(graph.traces, tableName);
    const db = new Database(dbName);
    const recordColumns = await db.selectQuery(initialQuery);
    if (recordColumns.length === 0) {
      setLoading(false);
      return {
        query: '',
      };
    }
    const { query, pagingQuery, newTraces } = await graphWorker.generateColumnsToFetch(
      graph,
      recordColumns,
      EXCEL,
    );

    addInitialTrace(newTraces);
    const recordCount = await db.selectQuery(pagingQuery);
    setTotalRecords(recordCount[0]['CNT']);
    setLoading(false);
    return {
      query,
      newTraces,
    };
  }, []);

  const addInitialTrace = (newTraces: any) => {
    const traceArray: any = [];
    const layout: any = { ...plotly.current?.layout };
    Object.keys(newTraces).forEach((key) => {
      if (newTraces[key]['xaxis']) {
        const xaxis = `xaxis${newTraces[key]['xaxis'].replace(/^\D+/g, '')}`;
        layout[xaxis] = { overlaying: 'x', showticklabels: false, showgrid: false };
      } else if (newTraces[key]['yaxis']) {
        const yaxis = `yaxis${newTraces[key]['yaxis'].replace(/^\D+/g, '')}`;
        layout[yaxis] = { overlaying: 'y', showticklabels: false, showgrid: false };
      }
      traceArray.push(newTraces[key]);
    });

    relayout(plotly.current, layout);
    addTraces(plotly.current, traceArray);
  };

  const loadPagingData = async (startIndex: number, stopIndex: number) => {
    setLoading(true);
    const { query, newTraces } = await statements;
    if (query !== '') {
      const db = new Database(dbName);
      const result = await db.selectQuery(
        `${query} ${totalRecords > 0 ? `LIMIT ${startIndex},${stopIndex}` : ''}`,
      );
      const { extendTrace, noOfTraces } = await graphWorker.generatingPlotlyData(result, newTraces);

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
