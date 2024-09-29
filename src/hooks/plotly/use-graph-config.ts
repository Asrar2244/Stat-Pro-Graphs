import { useMemo } from 'react';
import { IGraph } from '@utils';
export const useGraphConfig = (graph: IGraph[] | IGraph | undefined) => {
  const graphConfig = useMemo(() => {
    if (Array.isArray(graph)) {
      return graph;
    } else if (graph) {
      return [graph];
    }
    return [];
  }, []);
  return graphConfig;
};
