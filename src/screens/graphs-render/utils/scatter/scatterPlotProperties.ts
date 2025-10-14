/**
 * Scatter plot specific properties
 */

import { ErrorBarProperties, RegressionLineProperties } from '../common/commonPlotProperties';

export interface ScatterPointProperties {
  /** Point size in pixels */
  pointSize: number;
  /** Show data points */
  showDataPoints: boolean;
  /** Point opacity (0-1) */
  pointOpacity: number;
  /** Point border width in pixels */
  pointBorderWidth: number;
  /** Point border color */
  pointBorderColor: string;
  /** Use multi-color for points */
  useMultiColor: boolean;
  /** Single color for points */
  singleColor: string;
  /** Point color (optional override) */
  pointColor?: string;
}

export interface PointPlotProperties {
  /** Point size in pixels */
  pointSize: number;
  /** Point opacity (0-1) */
  pointOpacity: number;
  /** Point border width in pixels */
  pointBorderWidth: number;
  /** Point border color */
  pointBorderColor: string;
  /** Show data points */
  showDataPoints: boolean;
}

export interface DotPlotProperties {
  /** Dot size in pixels */
  dotSize: number;
  /** Dot opacity (0-1) */
  dotOpacity: number;
  /** Dot spacing */
  dotSpacing: number;
  /** Show dotted lines */
  showDottedLines: boolean;
  /** Dotted line opacity (0-1) */
  dottedLineOpacity: number;
  /** Dotted line color */
  dottedLineColor?: string;
}

export interface ScatterPlotSpecificProperties {
  scatter?: ScatterPointProperties;
  pointPlot?: PointPlotProperties;
  dotPlot?: DotPlotProperties;
  errorBar?: ErrorBarProperties;
  regression?: RegressionLineProperties;
}

/**
 * Default scatter plot properties
 */
export const DEFAULT_SCATTER_PROPERTIES: ScatterPlotSpecificProperties = {
  scatter: {
    pointSize: 8,
    showDataPoints: true,
    pointOpacity: 1,
    pointBorderWidth: 1,
    pointBorderColor: 'rgba(0,0,0,0.3)',
    useMultiColor: false,
    singleColor: '#1f77b4',
    pointColor: '#1f77b4'
  },
  pointPlot: {
    pointSize: 8,
    pointOpacity: 1,
    pointBorderWidth: 1,
    pointBorderColor: 'rgba(0,0,0,0.3)',
    showDataPoints: true
  },
  dotPlot: {
    dotSize: 6,
    dotOpacity: 0.8,
    dotSpacing: 0.1,
    showDottedLines: true,
    dottedLineOpacity: 0.5,
    dottedLineColor: 'rgba(0,0,0,0.3)'
  }
};

/**
 * Apply scatter-specific properties to a trace
 */
export const applyScatterProperties = (trace: any, properties: ScatterPointProperties): any => {
  if (!properties) return trace;

  const updatedTrace = { ...trace };

  // Apply point size
  if (properties.pointSize !== undefined) {
    updatedTrace.marker = {
      ...updatedTrace.marker,
      size: properties.pointSize
    };
  }

  // Apply point opacity
  if (properties.pointOpacity !== undefined) {
    updatedTrace.marker = {
      ...updatedTrace.marker,
      opacity: properties.pointOpacity
    };
  }

  // Apply point border
  if (properties.pointBorderWidth !== undefined || properties.pointBorderColor !== undefined) {
    updatedTrace.marker = {
      ...updatedTrace.marker,
      line: {
        width: properties.pointBorderWidth || 1,
        color: properties.pointBorderColor || 'rgba(0,0,0,0.3)'
      }
    };
  }

  // Apply point color
  if (properties.pointColor) {
    updatedTrace.marker = {
      ...updatedTrace.marker,
      color: properties.pointColor
    };
  }

  return updatedTrace;
};

/**
 * Apply point plot properties to a trace
 */
export const applyPointPlotProperties = (trace: any, properties: PointPlotProperties): any => {
  if (!properties) return trace;

  const updatedTrace = { ...trace };

  // Apply point size
  if (properties.pointSize !== undefined) {
    updatedTrace.marker = {
      ...updatedTrace.marker,
      size: properties.pointSize
    };
  }

  // Apply point opacity
  if (properties.pointOpacity !== undefined) {
    updatedTrace.marker = {
      ...updatedTrace.marker,
      opacity: properties.pointOpacity
    };
  }

  // Apply point border
  if (properties.pointBorderWidth !== undefined || properties.pointBorderColor !== undefined) {
    updatedTrace.marker = {
      ...updatedTrace.marker,
      line: {
        width: properties.pointBorderWidth || 1,
        color: properties.pointBorderColor || 'rgba(0,0,0,0.3)'
      }
    };
  }

  return updatedTrace;
};

/**
 * Apply dot plot properties to a trace
 */
export const applyDotPlotProperties = (trace: any, properties: DotPlotProperties): any => {
  if (!properties) return trace;

  const updatedTrace = { ...trace };

  // Apply dot size
  if (properties.dotSize !== undefined) {
    updatedTrace.marker = {
      ...updatedTrace.marker,
      size: properties.dotSize
    };
  }

  // Apply dot opacity
  if (properties.dotOpacity !== undefined) {
    updatedTrace.marker = {
      ...updatedTrace.marker,
      opacity: properties.dotOpacity
    };
  }

  return updatedTrace;
};
