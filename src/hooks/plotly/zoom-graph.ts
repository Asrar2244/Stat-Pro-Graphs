import { relayout } from 'plotly.js-dist';

export interface IZoomGraph {
  zoom: (xAxis: number[], yAxis: number[]) => void;
  zoomReset: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export const useZoomGraph = (plotly: any): IZoomGraph => {
  const zoom = (xAxis: number[], yAxis: number[]): void => {
    relayout(plotly.current, {
      'xaxis.range': xAxis,
      'yaxis.range': yAxis,
    });
  };

  const zoomIncrement = (factor: number): void => {
    const gd = plotly.current;
    if (!gd || !gd.layout) return;

    // Get current ranges. Plotly might store them in layout.xaxis.range
    // or we might need to use the calculated values from fullLayout if they aren't explicit
    const layout = gd.layout;
    const fullLayout = gd._fullLayout;

    const xRange = layout.xaxis?.range || fullLayout?.xaxis?.range;
    const yRange = layout.yaxis?.range || fullLayout?.yaxis?.range;

    if (!xRange || !yRange || xRange.length < 2 || yRange.length < 2) return;

    // Ensure we are dealing with numeric ranges (Plotly ranges can be strings for logging/categorical)
    const x0 = Number(xRange[0]);
    const x1 = Number(xRange[1]);
    const y0 = Number(yRange[0]);
    const y1 = Number(yRange[1]);

    if (isNaN(x0) || isNaN(x1) || isNaN(y0) || isNaN(y1)) return;

    const xDiff = x1 - x0;
    const yDiff = y1 - y0;

    const xCenter = (x0 + x1) / 2;
    const yCenter = (y0 + y1) / 2;

    const newXHalf = (xDiff * factor) / 2;
    const newYHalf = (yDiff * factor) / 2;

    relayout(gd, {
      'xaxis.range': [xCenter - newXHalf, xCenter + newXHalf],
      'yaxis.range': [yCenter - newYHalf, yCenter + newYHalf],
    });
  };

  const zoomIn = () => zoomIncrement(0.8);
  const zoomOut = () => zoomIncrement(1.25);

  const zoomReset = (): void => {
    relayout(plotly.current, {
      'xaxis.autorange': true,
      'yaxis.autorange': true,
    });

    window.dispatchEvent(new Event('resize'));
  };
  return { zoom, zoomReset, zoomIn, zoomOut };
};
