//@ts-nocheck
import { IGraph } from '@utils';
type PropertyType<T, K extends keyof T> = T[K];

const sanitizedCell = (column: string): string => {
  return `"${column}"`;
};

//Create a query for columns given in the configurations object
export const generateQueryForColumns = (
  traces: PropertyType<IGraph, 'traces'>,
  tableName: string,
): string => {
  const columnSet = new Set<string>();
  Object.keys(traces).forEach((key) => {
    const trace = traces[key];
    if (trace.x) {
      columnSet.add(sanitizedCell(trace.x as string));
    }
    if (trace.y) {
      columnSet.add(sanitizedCell(trace.y as string));
    }
    if (trace.z) {
      columnSet.add(sanitizedCell(trace.z as string));
    }
  });
  const columns = Array.from(columnSet);
  const query = `SELECT ${columns.join(',')} FROM ${tableName} WHERE ${columns.join(' IS NOT NULL OR ')} IS NOT NULL`;
  return query;
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
        columnSet.add(sanitizedCell(column[key] as string));
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
) => {
  const { traces, multipleTraces } = graph;
  const newTraces: any = {};
  const columnSet = new Set<string>();

  if (!traces['traces1']) {
    return new Error('Required trace1');
  }
  const { x, y, z, ...others } = traces['traces1'];
  const commonAxisData: Array<string> = [];
  let commonAxis: string = multipleTraces?.commonAxis as string;
  if (multipleTraces?.commonAxis) {
    //@ts-ignore
    commonAxis = traces['traces1'][multipleTraces?.commonAxis];
  }
  for (let i = 0; i < fetchedColumns.length; i++) {
    const column = fetchedColumns[i];
    Object.keys(column).forEach((key: string) => {
      if (commonAxis === key && column[key]) {
        columnSet.add(sanitizedCell(column[key] as string));
        commonAxisData.push(column[key] as string);
      } else {
        if (column[key]) {
          columnSet.add(sanitizedCell(column[key] as string));
          if (!newTraces[column[key]]) {
            newTraces[column[key]] = { ...others, name: column[key], yaxis: column[key] };
            if (x) {
              newTraces[column[key]]['x'] = [];
            }
            if (y) {
              newTraces[column[key]]['y'] = [];
            }
            if (z) {
              newTraces[column[key]]['z'] = [];
            }
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
      if (axisType === 'x') {
        newTraces[key]['yaxis'] = `y${index + 1}`;
      } else if (axisType === 'y') {
        newTraces[key]['xaxis'] = `x${index + 1}`;
      }

      //@ts-ignore
      newTraces[key][axisType] = commonAxisData;
    });
  }
  return {
    columnSet,
    newTraces,
  };
};

// This calls after initial columns created to get actual vertical columns
export const generateColumnsToFetch = (
  graph: IGraph,
  fetchedColumns: Array<{ [key: string]: string | number }>,
  tableName: string,
) => {
  const { multipleTraces } = graph;

  let refObj: any = {};
  if (multipleTraces) {
    refObj = generatedMultipleTraces(graph, fetchedColumns);
  } else {
    refObj = generatedNewTraces(graph, fetchedColumns);
  }

  const { columnSet, newTraces } = refObj;
  const columns = Array.from(columnSet);
  const query = `SELECT ${columns.join(',')} FROM ${tableName} WHERE ${columns.join(' IS NOT NULL OR ')} IS NOT NULL`;
  const pagingQuery = `SELECT COUNT(${columns[0]}) as CNT FROM ${tableName} WHERE ${columns.join(' IS NOT NULL OR ')} IS NOT NULL`;

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
