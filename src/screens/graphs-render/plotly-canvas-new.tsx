/**
 * NEW MODULAR plotly-canvas.tsx
 * This is the refactored version that uses the new modular structure
 * 
 * TO USE: Replace the existing plotly-canvas.tsx with this file
 */

import React, { FC, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { GraphCanvas } from './components/GraphCanvas';

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

export const PlotlyCanvas: FC<GraphCanvasProps> = forwardRef<GraphCanvasRef, GraphCanvasProps>(
  (props, ref) => {
    return <GraphCanvas {...props} ref={ref} />;
  }
);

PlotlyCanvas.displayName = 'PlotlyCanvas';

// Export for backward compatibility
export default PlotlyCanvas;
