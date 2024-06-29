import { useState, useEffect } from 'react';
import { IFetchSingleOutput } from '@backend/fetch-output-table';
import { PlotData } from 'plotly.js';

interface IUseGraphDataset {
  params?: IFetchSingleOutput;
  data: any[];
}
export const useGraphDataset = (parameters: IUseGraphDataset, tableRef: any): any[] => {
  const [dataSet, setDataSet] = useState<PlotData[]>([]);
  useEffect(() => {
    if (parameters.params && parameters.params?.id > 0) {
      const ds: PlotData[] = [];
      // for leaner regression only one x axis
      const xKey = tableRef.current?.independent_var_names[0];

      for (
        let dependent = 0;
        dependent < tableRef.current?.dependent_var_names.length;
        dependent++
      ) {
        const yKey = tableRef.current?.dependent_var_names[dependent];
        const x: number[] = [];
        const y: number[] = [];
        for (let i = 0; i < parameters.data.length; i++) {
          x.push(parameters.data[i][xKey]);
          y.push(parameters.data[i][yKey]);
        }
        ds.push({
          x,
          y,
          type: 'scatter',
          mode: 'markers',
          name: yKey,
        } as PlotData);
      }
      setDataSet(ds);
    }
  }, [parameters.params?.id, parameters.data, tableRef.current]);
  return dataSet;
};
