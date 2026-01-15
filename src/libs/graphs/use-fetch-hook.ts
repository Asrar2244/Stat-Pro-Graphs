import { useMemo, useState } from 'react';
import { Database, IGraph } from '@utils';
import { graphWorker } from '@workers/graph-worker';
import { EXCEL, DEFAULT_GRAPH_PAGE_SIZE } from '@constants';
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

  const fallbackPlotFromInput = async (dbNameLocal: string, outputTable: string) => {
    try {
      const db = new Database(dbNameLocal);
      // Read variable names from output table
      const names = await db.selectQuery(
        `SELECT dependent_var_names, independent_var_names FROM ${outputTable} 
         WHERE dependent_var_names IS NOT NULL OR independent_var_names IS NOT NULL LIMIT 1`
      );
      if (!names || names.length === 0) return false;
      const depName = (names[0]['dependent_var_names'] || '').toString().split(',')[0].trim().replaceAll('"', '');
      // independent could be CSV
      const indepRaw = (names[0]['independent_var_names'] || '').toString();
      const indepName = indepRaw.split(',')[0].trim().replaceAll('"', '');
      if (!depName || !indepName) return false;

      // Ensure plot element exists
      await waitForGraph();

      // Build and add a single initial trace
      const layout: any = { ...plotly.current?.layout };
      layout['xaxis'] = { showline: false, zeroline: true, showticklabels: true, ticklabelposition: 'inside', ...graph?.layout?.xaxis };
      layout['yaxis'] = { showline: false, showticklabels: true, zeroline: true, ticklabelposition: 'inside', ...graph?.layout?.yaxis };
      const baseTrace = { type: 'scatter', mode: 'lines+markers', name: `${depName}-${indepName}` } as any;
      try {
        relayout(plotly.current, layout);
        addTraces(plotly.current, [{ ...baseTrace, x: [], y: [] }]);
      } catch { }

      // Load first page from input table
      const inputRows = await db.selectQuery(`SELECT "${indepName}", "${depName}" FROM input LIMIT 0, ${DEFAULT_GRAPH_PAGE_SIZE}`);
      if (inputRows && inputRows.length > 0) {
        const xVals = inputRows.map((r: any) => r[indepName]);
        const yVals = inputRows.map((r: any) => r[depName]);
        const extendTrace = { x: [xVals], y: [yVals] } as any;
        await waitForGraph();
        extendTraces(plotly.current, extendTrace, [0]);
        setTotalRecords(inputRows.length);
        setLoading(false);
        return true;
      }
    } catch (e) {
      console.warn('⚠️ Fallback input plotting failed:', e);
    }
    return false;
  };

  const waitForGraph = async (maxRetries = 20, intervalMs = 100): Promise<boolean> => {
    let retries = 0;
    while (retries < maxRetries) {
      if (plotly.current) return true;
      await new Promise((r) => setTimeout(r, intervalMs));
      retries += 1;
    }
    return !!plotly.current;
  };

  const statements = useMemo(async () => {
    setLoading(true);
    if (!dbName || !tableName) {
      setLoading(false);
      setTotalRecords(0);
      return { query: '', dynamicQuery: '', newTraces: {} } as any;
    }

    // Fallback: If graph.traces is empty, try to use current plotly data
    let tracesToUse = graph.traces;
    if ((!tracesToUse || Object.keys(tracesToUse).length === 0) && plotly?.current?.data) {
      // Convert plotly data array to compatible traces object
      tracesToUse = (plotly.current.data as any[]).reduce((acc, trace, idx) => {
        acc[trace.name || `trace_${idx}`] = trace;
        return acc;
      }, {} as any);
    }

    if (!tracesToUse || Object.keys(tracesToUse).length === 0) {
      // No traces defined yet - cannot generate query
      setLoading(false);
      return { query: '', dynamicQuery: '', newTraces: {} } as any;
    }

    const { initialQuery, dynamic } = await graphWorker.generateQueryForColumns(
      tracesToUse,
      tableName,
    );

    // Sanity check for malformed queries (e.g. empty column list)
    if (initialQuery.match(/SELECT\s+FROM/i) || initialQuery.match(/SELECT\s*,/i)) {
      console.warn('⚠️ Generated invalid query (likely no columns):', initialQuery);
      setLoading(false);
      return { query: '' } as any;
    }

    const db = new Database(dbName);
    const recordColumns = await db.selectQuery(initialQuery);
    console.log('🔍 Graph data fetch - Initial query:', initialQuery);
    console.log('🔍 Graph data fetch - Record columns:', recordColumns);

    if (recordColumns.length === 0) {
      console.log('⚠️ No data found in output table, trying fallback to input table');
      // Try plotting directly from input as a fallback for first graph
      const didFallback = await fallbackPlotFromInput(dbName, tableName);
      if (didFallback) {
        console.log('✅ Fallback to input table successful');
        return { query: '', dynamicQuery: '', newTraces: {} } as any;
      }
      console.log('❌ Fallback to input table failed');
      setLoading(false);
      return { query: '' } as any;
    }
    const { query, pagingQuery, newTraces, dynamicQuery } =
      await graphWorker.generateColumnsToFetch(
        { ...graph, traces: tracesToUse },
        recordColumns,
        EXCEL,
        tableName,
        dynamic?.columns,
      );

    // Final sanity check on main query
    if (query && (query.match(/SELECT\s+FROM/i) || query.match(/SELECT\s*,/i))) {
      console.warn('⚠️ Generated invalid computed query:', query);
      setLoading(false);
      return { query: '' } as any;
    }

    // Ensure the Plotly element is ready before adding initial traces
    await waitForGraph();
    addInitialTrace(newTraces);
    const recordCount = await db.selectQuery(pagingQuery);
    setTotalRecords(recordCount[0]['CNT']);
    // Proactively load the first page so the first graph renders immediately
    try {
      if (query && query !== '') {
        const startIndex = 0;
        const stopIndex = DEFAULT_GRAPH_PAGE_SIZE;
        const appendLimit = recordCount[0]['CNT'] > 0 ? `LIMIT ${startIndex},${stopIndex}` : '';
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
        // Wait for plotly and traces to exist before extending
        await waitForGraph();
        try {
          extendTraces(plotly.current, extendTrace, noOfTraces);
        } catch (err) {
          // Retry once after a short delay in case traces were not added yet
          await new Promise((r) => setTimeout(r, 150));
          extendTraces(plotly.current, extendTrace, noOfTraces);
        }
      }
    } catch (e) {
      console.warn('⚠️ Initial page load failed:', e);
    }
    setLoading(false);
    return {
      query,
      dynamicQuery,
      newTraces,
    };
  }, [dbName, tableName, graph]); // Added dependencies to ensure updates trigger re-fetch


  const addInitialTrace = (newTraces: any) => {
    console.log('🔍 Adding initial traces:', newTraces);
    // Guard against null plotly reference
    if (!plotly.current) {
      console.warn('⚠️ Plotly element not ready, skipping initial trace');
      return;
    }

    const traceArray: any = [];
    const layout: any = { ...plotly.current?.layout };
    Object.keys(newTraces).forEach((key: string, index: number) => {
      newTraces[key].name = String(newTraces[key].name || key || `Trace ${index + 1}`).toUpperCase();
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

    try {
      relayout(plotly.current, layout);
      addTraces(
        plotly.current,
        traceArray.map((tra: any) => {
          return { ...tra, x: [], y: [], z: [] };
        }),
      );
    } catch (error) {
      console.warn('⚠️ Error adding initial traces:', error);
    }
  };

  const loadPagingData = async (startIndex: number, stopIndex: number) => {
    setLoading(true);
    if (!dbName || !tableName) {
      setLoading(false);
      return;
    }
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
