import { useEffect } from 'react';
import { newPlot, purge } from 'plotly.js-dist';
import { INITIAL_GRAPH_LAYOUT } from '@constants';
import { IGraph } from '@utils';
export const useGraphInit = (plotly: any, graph: IGraph) => {
  useEffect(() => {
    if (plotly.current) {
      const layout = { ...INITIAL_GRAPH_LAYOUT.layout, ...graph.layout };
      const config = { ...INITIAL_GRAPH_LAYOUT.config, ...graph.config };
      newPlot(plotly.current, [], layout, config);
    }
    return () => {
      if (plotly.current) {
        purge(plotly.current);
      }
    };
  }, []);
};
