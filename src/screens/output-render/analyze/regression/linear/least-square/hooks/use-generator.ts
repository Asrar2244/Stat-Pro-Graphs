import { useEffect, useState, useRef } from 'react';
// import { IFetchSingleOutput, fetchSelected } from '@backend/fetch-output-table';
import { ITableCreator } from '@libs';
interface ITableCreators extends ITableCreator {
  name: string;
}
interface IUseGenerator {
  tables: ITableCreators[];
  tableRef: any;
}
interface IDynamicTables {
  name: string;
  showHeaders?: boolean;
  showCaption?: boolean;
}
export const useGenerator = (
  params?: any,
  config?: any,
  dynamicTableKeys?: IDynamicTables[],
): IUseGenerator => {
  const [tables, setTables] = useState<ITableCreators[]>([]);
  const tableRef = useRef<any>(undefined);
  useEffect(() => {
    if (params && params.id > 0) {
      const _tables: ITableCreators[] = [];
      const resultTable = params.result.output_table_name;
      console.log('resultTable==>', params);
      // fetchSelected(params.tabName, `SELECT * FROM ${resultTable};`)
      //   .then((result) => {
      //     tableRef.current = {};
      //     result.forEach((row: any): void => {
      //       try {
      //         tableRef.current[row.id] = JSON.parse(row.value);
      //       } catch {
      //         tableRef.current[row.id] = row.value;
      //       }
      //     });
      //     tableGenerator(_tables);
      //     generateDynamicTable(_tables);
      //     setTables(_tables);
      //   })
      //   .catch((error: any) => {
      //     console.error(error);
      //   });
    }
    return () => {
      tableRef.current = undefined;
    };
  }, [params?.id]);

  // const tableGenerator = (_tables: ITableCreators[]): ITableCreators[] => {
  //   for (let i = 0; i < config.tables.length; i++) {
  //     const table = config.tables[i];
  //     if (Array.isArray(table.data)) {
  //       const data = staticDataFromConfig(table);
  //       _tables.push({
  //         ...table,
  //         data,
  //       });
  //     } else if (table?.array) {
  //       const data = dynamicDataWithArrayFromConfig(table);
  //       _tables.push({
  //         ...table,
  //         data,
  //       });
  //     }
  //   }
  //   return _tables;
  // };
  // const dynamicDataWithArrayFromConfig = (table: ITableCreators): any => {
  //   const data: any = [];
  //   for (let c = 0; c < table.columns.length; c++) {
  //     const col: any = table.columns[c];
  //     const row: any[] = tableRef.current[col.key];
  //     for (let r = 0; r < row.length; r++) {
  //       if (c === 0) {
  //         data.push({ [col.key]: valueParser(row[r]) });
  //       } else {
  //         if (data.length >= r) {
  //           data[r][col.key] = valueParser(row[r]);
  //         }
  //       }
  //     }
  //   }
  //   return data;
  // };
  // const staticDataFromConfig = (table: ITableCreators): any => {
  //   const data: any = [];
  //   for (let r = 0; r < table.data.length; r++) {
  //     const row = table.data[r];
  //     const localCol = {};
  //     for (let c = 0; c < table.columns.length; c++) {
  //       const col: any = table.columns[c];
  //       let value = col?.get ? tableRef.current[col.key] : row[col.key];
  //       if (col?.get) {
  //         const key = row[col.key];
  //         value = tableRef.current[key];
  //       } else {
  //         value = row[col.key];
  //       }
  //       localCol[col.key] = valueParser(value);
  //     }
  //     data.push(localCol);
  //   }
  //   return data;
  // };
  // const generateDynamicTable = (_tables: ITableCreators[]): void => {
  //   if (dynamicTableKeys && dynamicTableKeys.length > 0) {
  //     for (let i = 0; i < dynamicTableKeys.length; i++) {
  //       const dynamic = dynamicTableKeys[i];
  //       const dt = tableRef.current[dynamic.name];
  //       const data = typeof dt === 'string' ? JSON.parse(dt) : dt;

  //       if (data && data.length > 0) {
  //         const columns: any[] = [];
  //         const details: any[] = [];
  //         data.forEach((dtl: string[], index: number) => {
  //           if (index === 0) {
  //             dtl.forEach((key: string) => {
  //               columns.push({
  //                 key,
  //                 label: key,
  //               });
  //             });
  //           } else {
  //             const _dtl: any = {};
  //             dtl.forEach((key: string, index: number) => {
  //               _dtl[columns[index]['key']] = key;
  //             });
  //             details.push(_dtl);
  //           }
  //         });
  //         _tables.push({
  //           name: dynamic.name,
  //           showHeaders: dynamic.showHeaders ?? true,
  //           showCaption: dynamic.showCaption ?? false,
  //           columns,
  //           data: details,
  //         });
  //       }
  //     }
  //   }
  // };
  // const valueParser = (value: any): string => {
  //   if (Array.isArray(value)) return value.join(', ');
  //   return value;
  // };
  return {
    tables,
    tableRef,
  };
};
