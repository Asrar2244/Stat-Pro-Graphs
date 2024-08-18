import { relayout } from 'plotly.js-dist';

export interface IZoomGraph {
  zoom: (xAxis: number[], yAxis: number[]) => void;
  zoomReset: () => void;
}

export const useZoomGraph = (plotly: any): IZoomGraph => {
  const zoom = (xAxis: number[], yAxis: number[]): void => {
    relayout(plotly.current, {
      'xaxis.range': xAxis,
      'yaxis.range': yAxis,
    });
  };
  const zoomReset = (): void => {
    relayout(plotly.current, {
      'xaxis.autorange': true,
      'yaxis.autorange': true,
    });

    window.dispatchEvent(new Event('resize'));
  };
  return { zoom, zoomReset };
};
