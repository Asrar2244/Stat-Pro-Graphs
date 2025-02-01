import { IRecordTableType } from '@utils';

interface IQuery {
  checkColumnsExistsQuery: string;
  columns: Array<string>;
  query: string;
  pageQuery: string;
  viewNew?: Array<string>;
}

const numberFormat = (value: string | number): string => {
  if (isNaN(value as number)) {
    return value?.toString();
  }
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 4,
  }).format(Number(value));
};

const checkColumnExistsQuery = (columns: Array<string>, tableName: string) => {
  return tableName ? `SELECT name
FROM pragma_table_info('${tableName}')
WHERE name IN(${columns.join(",")})` : ""
}
const withOutRecordType = (view: Array<Array<string>>): Array<string> => {
  const columns: Array<string> = [];
  for (let i = 0; i < view.length; i++) {
    for (let j = 0; j < view[i].length; j++) {
      const cell = view[i][j];
      if (cell !== '' && !cell.startsWith('t-')) {
        const sanitized = cell.includes('.') ? `"${cell}"` : cell;
        columns.push(sanitized);
      }
    }
  }
  return columns;
};
const withRecordType = (view: Array<string>): Array<string> => {
  const columns: Array<string> = [];
  for (let i = 0; i < view.length; i++) {
    const cell = view[i];
    if (cell !== '') {
      const sanitized = `"${cell.replace('t-', '')}"`;
      columns.push(sanitized);
    }
  }
  return columns;
};

export const generateQueryColumn = (
  view: Array<Array<string>> | Array<string>,
  tableName: string,
  recordType: IRecordTableType,
  noPaging: boolean = false,
): IQuery => {
  let columns: Array<string> = [];
  if (recordType) {
    columns = withRecordType(view as Array<string>);
  } else {
    columns = withOutRecordType(view as Array<Array<string>>);
  }

  const query = `SELECT ${columns.join(',')} FROM ${tableName} WHERE ${columns.join(' IS NOT NULL OR ')} IS NOT NULL`;
  let pageQuery = '';
  if (!noPaging && typeof recordType !== 'boolean' && recordType?.pageSize) {
    pageQuery =
      columns.length > 0
        ? `SELECT COUNT(${columns[0]}) as CNT FROM ${tableName} WHERE ${columns.join(' IS NOT NULL OR ')} IS NOT NULL`
        : '';
  }
  const checkColumnsExistsQuery = checkColumnExistsQuery(columns, tableName);
  return {
    checkColumnsExistsQuery,
    columns,
    query,
    pageQuery,
  };
};

const mergingDataWithOutRecordType = (
  viewDtl: Array<Array<string>>,
  result: Array<any>,
): Array<Array<string>> => {
  const view: Array<Array<string>> = viewDtl;
  for (let i = 0; i < view.length; i++) {
    for (let j = 0; j < view[i].length; j++) {
      const cell = view[i][j];
      if (cell !== '') {
        if (cell.startsWith('t-')) {
          view[i][j] = cell;
        } else {
          const details = [];
          for (let l = 0; l < result.length; l++) {
            if (result[l][cell] !== null && result[l][cell] !== undefined) {
              details.push(numberFormat(result[l][cell]));
            }
          }
          view[i][j] = details.length === 1 ? String(details[0]) : details.join(',');
        }
      }
    }
  }
  return view;
};

const mergingDataWithRecordType = (
  viewDtl: Array<string>,
  result: Array<any>,
): Array<Array<string>> => {
  const view: Array<Array<string>> = [viewDtl];
  for (let i = 0; i < result.length; i++) {
    const row = [];
    for (let c = 0; c < viewDtl.length; c++) {
      const sanitizedCell = viewDtl[c].replace('t-', '');
      row.push(String(result[i][sanitizedCell]));
    }
    view.push(row);
  }
  return view;
};

export const mergingData = (
  view: Array<Array<string>> | Array<string>,
  result: Array<any>,
  recordType: IRecordTableType,
): Array<Array<string>> => {
  if (recordType) {
    return mergingDataWithRecordType(view as Array<string>, result);
  } else {
    return mergingDataWithOutRecordType(view as Array<Array<string>>, result);
  }
};
