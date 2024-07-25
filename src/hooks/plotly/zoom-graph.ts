import { Layout } from 'plotly.js';
import { useState } from 'react';
type ILayoutGraph = Partial<Layout> | undefined;
export interface IZoomGraph {
  zoom: (value: number[]) => void;
  zoomReset: () => void;
  layoutGraph: ILayoutGraph;
}

export const useZoomGraph = (layoutGraph: ILayoutGraph): IZoomGraph => {
  const [layout, setLayout] = useState<ILayoutGraph>(layoutGraph ?? {});
  const zoom = (value: number[]): void => {
    if (!layoutGraph) {
      layoutGraph = {};
    }
    layoutGraph['xaxis'] = { range: value };
    setLayout(layoutGraph);
  };
  const zoomReset = (): void => {
    if (!layoutGraph) {
      layoutGraph = {};
    }
    layoutGraph['xaxis'] = { range: undefined };
    setLayout(layoutGraph);
  };
  return { zoom, zoomReset, layoutGraph: layout };
};
