/**
 * Types for GraphCanvas component
 */

export interface GraphCanvasRef {
  redraw: () => void;
  getCurrentPlot: () => any;
  exportImage: (format: 'png' | 'jpeg' | 'svg' | 'pdf') => Promise<string>;
}

export interface GraphCanvasProps {
  graphConfig: any;
  workspacePath?: string;
  liveProps?: any;
  className?: string;
  style?: React.CSSProperties;
}

export interface PlotMetrics {
  totalDataPoints: number;
  traceCount: number;
  hasLargeDataset: boolean;
  recommendedOptimization: string;
}
