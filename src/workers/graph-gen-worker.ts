//@ts-nocheck
import { IGraph, IGraphAxis } from '@utils';
type PropertyType<T, K extends keyof T> = T[K];
interface IDynamicTableTrace {
  columns?: Set<string>;
}
const sanitizedCell = (column: string): string => {
  return `"${column}"`;
};
const checkDynamicTable = (
  trace: IGraphAxis,
  axis: string,
  columnSet: Set<string>,
  dynamicTableCols: IDynamicTableTrace,
) => {
  // Ensure we only add strings (column names), not data arrays or objects
  const value = trace[axis];
  if (typeof value !== 'string' || !value) {
    return;
  }

  if (trace.dynamicTableColumns) {
    const existsDynamicCol = trace.dynamicTableColumns.find((col) => col === value);
    if (existsDynamicCol) {
      if (!dynamicTableCols.columns) {
        dynamicTableCols.columns = new Set<string>();
      }
      dynamicTableCols.columns.add(value);
    } else {
      columnSet.add(sanitizedCell(value));
    }
  } else {
    columnSet.add(sanitizedCell(value));
  }
};
//Create a query for columns given in the configurations object
export const generateQueryForColumns = (
  traces: PropertyType<IGraph, 'traces'>,
  tableName: string,
): { initialQuery: string; dynamic?: { query?: string; columns?: Set<string> } } => {
  const columnSet = new Set<string>();
  const dynamicTableCols: IDynamicTableTrace = {};
  Object.keys(traces).forEach((key) => {
    const trace = traces[key];
    ['x', 'y', 'z'].forEach((axis) => {
      if (trace[axis]) {
        checkDynamicTable(trace, axis, columnSet, dynamicTableCols);
      }
    });
  });
  const columns = Array.from(columnSet);
  const query = `SELECT ${columns.join(',')} FROM ${tableName} WHERE ${columns.join(' IS NOT NULL OR ')} IS NOT NULL`;
  if (Object.keys(dynamicTableCols).length > 0) {
    const dynamicColumns = Array.from(dynamicTableCols.columns);
    const dynamicQuery = `SELECT ${dynamicColumns.join(',')} FROM ${tableName} WHERE ${dynamicColumns.join(
      ' IS NOT NULL OR ',
    )} IS NOT NULL`;
    return {
      initialQuery: query,
      dynamic: { query: dynamicQuery, columns: dynamicTableCols.columns },
    };
  }
  return { initialQuery: query };
};

const generatedNewTraces = (
  graph: IGraph,
  fetchedColumns: Array<{ [key: string]: string | number }>,
) => {
  const { traces } = graph;
  const newTraces: any = {};
  const columnSet = new Set<string>();
  for (let i = 0; i < fetchedColumns.length; i++) {
    const column = fetchedColumns[i];
    Object.keys(column).forEach((key: string) => {
      if (column[key]) {
        columnSet.add(sanitizedCell(key));
        Object.keys(traces).forEach((tKey: string) => {
          if (!newTraces[tKey] && traces[tKey]) {
            const { x, y, z, ...others } = traces[tKey];
            newTraces[tKey] = { ...others };
            if (x) {
              newTraces[tKey]['x'] = [];
            }
            if (y) {
              newTraces[tKey]['y'] = [];
            }
            if (z) {
              newTraces[tKey]['z'] = [];
            }
          }
          if (traces[tKey].x === key) {
            newTraces[tKey]['x'].push(column[key]);
          }
          if (traces[tKey].y === key) {
            newTraces[tKey]['y'].push(column[key]);
          }
          if (traces[tKey].z === key) {
            newTraces[tKey]['z'].push(column[key]);
          }
        });
      }
    });
  }
  return {
    columnSet,
    newTraces,
  };
};

const generatedMultipleTraces = (
  graph: IGraph,
  fetchedColumns: Array<{ [key: string]: string | number }>,
  dynamicColumns?: Set<string>,
) => {
  const { traces, multipleTraces } = graph;
  const newTraces: any = {};
  const columnSet = new Set<string>();

  if (!traces) {
    return new Error('Required trace1');
  }
  const commonAxisData: Array<string> = [];
  let commonAxis: string = multipleTraces?.commonAxis as string;
  if (multipleTraces?.commonAxis) {
    //@ts-ignore
    commonAxis = traces['traces1'][multipleTraces?.commonAxis];
  }
  const hasValue = (keyName: string, traceIdPass: number) => {
    if (!dynamicColumns) {
      return traces[`traces${traceIdPass}`] ?? traces[`traces1`];
    }
    let trace: any = traces[`traces1`];
    const traceId = Array.from(dynamicColumns).indexOf(keyName);
    if (traceId !== -1) {
      trace = traces[`traces${traceId + 1}`];
    }
    return trace;
  };
  for (let i = 0; i < fetchedColumns.length; i++) {
    const column = fetchedColumns[i];

    Object.keys(column).forEach((key: string) => {
      const { x, y, z, ...others } = hasValue(key, i + 1);
      if (commonAxis === key && column[key]) {
        if (dynamicColumns && dynamicColumns.size > 0) {
          const haskey = dynamicColumns.has(column[key]);
          if (!haskey) {
            columnSet.add(sanitizedCell(key));
          }
        } else {
          columnSet.add(sanitizedCell(key));
        }
        commonAxisData.push(column[key] as string);
      } else {
        if (column[key]) {
          if (dynamicColumns && dynamicColumns.size > 0) {
            const haskey = dynamicColumns.has(column[key]);
            if (!haskey) {
              columnSet.add(sanitizedCell(key));
            }
          } else {
            columnSet.add(sanitizedCell(key));
          }
          if (!newTraces[column[key]]) {
            newTraces[column[key]] = { ...others, name: column[key], yaxis: column[key] };
            ['x', 'y', 'z'].forEach((axis) => {
              if (axis === 'x' || axis === 'y' || axis === 'z') {
                newTraces[column[key]][axis] = [];
              }
            });
          }
          if (x === key) {
            newTraces[column[key]]['x'].push(column[key]);
          }
          if (y === key) {
            newTraces[column[key]]['y'].push(column[key]);
          }
          if (z === key) {
            newTraces[column[key]]['z'].push(column[key]);
          }
        }
      }
    });
  }

  const axisType = multipleTraces?.commonAxis;

  if (axisType && commonAxisData.length > 0) {
    Object.keys(newTraces).forEach((key, index) => {
      //@ts-ignore
      newTraces[key][axisType] = commonAxisData;
    });
  }
  return {
    columnSet,
    newTraces,
  };
};

const dynamicColumnSetToArray = (
  fetchedColumns: Array<{ [key: string]: string | number }>,
  dynamicColumns?: Set<string>,
) => {
  if (dynamicColumns && dynamicColumns.size > 0) {
    dynamicColumns.forEach((item) => {
      fetchedColumns.push({
        [item]: item,
      });
    });
  }
};

// This calls after initial columns created to get actual vertical columns
export const generateColumnsToFetch = (
  graph: IGraph,
  fetchedColumns: Array<{ [key: string]: string | number }>,
  tableName: string,
  dynamicTable?: string,
  dynamicColumns?: Set<string>,
) => {
  const { multipleTraces } = graph;

  let refObj: any = {};
  dynamicColumnSetToArray(fetchedColumns, dynamicColumns);

  if (multipleTraces) {
    refObj = generatedMultipleTraces(graph, fetchedColumns, dynamicColumns);
  } else {
    refObj = generatedNewTraces(graph, fetchedColumns);
  }
  const { columnSet, newTraces } = refObj;
  const columns = Array.from(columnSet);
  const query = `SELECT ${columns.join(',')} FROM ${tableName} WHERE ${columns.join(' IS NOT NULL OR ')} IS NOT NULL`;
  const pagingQuery = `SELECT COUNT(${columns[0]}) as CNT FROM ${tableName} WHERE ${columns.join(' IS NOT NULL OR ')} IS NOT NULL`;
  if (dynamicColumns && dynamicColumns.size > 0) {
    const dynamicColumnsArray = Array.from(dynamicColumns);
    const dynamicQuery = `SELECT ${dynamicColumnsArray.join(',')} FROM ${dynamicTable} WHERE ${dynamicColumnsArray.join(
      ' IS NOT NULL OR ',
    )} IS NOT NULL`;
    return {
      newTraces,
      query,
      pagingQuery,
      dynamicQuery: dynamicQuery,
    };
  }

  return {
    newTraces,
    query,
    pagingQuery,
  };
};
interface IExtendGraph {
  extendTrace: {
    [key: string]: Array<Array<string | number>>;
  };
  noOfTraces: Array<number>;
}

export const generatingPlotlyData = (
  data: Array<any>,
  traces: PropertyType<IGraph, 'traces'>,
): IExtendGraph => {
  const newTraces: any = {};

  for (let i = 0; i < data.length; i++) {
    Object.keys(traces).forEach((key) => {
      const { x, y, z, ...others } = traces[key];
      if (!newTraces[key]) {
        newTraces[key] = { ...others };
        Object.keys(traces[key]).map((axis) => {
          if (axis === 'x' || axis === 'y' || axis === 'z') {
            newTraces[key][axis] = [];
          }
        });
      }
      if (x) {
        for (let x = 0; x < traces[key].x.length; x++) {
          newTraces[key].x.push(data[i][traces[key].x[x]]);
        }
      }
      if (y) {
        for (let y = 0; y < traces[key].y.length; y++) {
          newTraces[key].y.push(data[i][traces[key].y[y]]);
        }
      }
      if (traces[key].z) {
        for (let z = 0; z < traces[key].z.length; z++) {
          newTraces[key].z.push(data[i][traces[key].z[z]]);
        }
      }
    });
  }
  const newData: IExtendGraph = {
    extendTrace: {},
    noOfTraces: [],
  };
  Object.keys(newTraces).forEach((key, index) => {
    if (Object.keys(newData.extendTrace).length === 0) {
      Object.keys(newTraces[key]).forEach((axis) => {
        if (axis === 'x' || axis === 'y' || axis === 'z') {
          newData.extendTrace[axis] = [];
        }
      });
    }
    if (newTraces[key].x) {
      newData.extendTrace.x.push(newTraces[key].x);
    }
    if (newTraces[key].y) {
      newData.extendTrace.y.push(newTraces[key].y);
    }
    if (newTraces[key].z) {
      newData.extendTrace.z.push(newTraces[key].z);
    }
    newData.noOfTraces.push(index);
  });
  return newData;
};

export const createSingleArray = (mainArray: Array<any>, dynamicArray: Array<any>): Array<any> => {
  const newArray: Array<any> = [];
  for (let i = 0; i < mainArray.length; i++) {
    if (dynamicArray.length >= i) {
      newArray.push({ ...mainArray[i], ...dynamicArray[i] });
    }
  }
  return newArray;
};
