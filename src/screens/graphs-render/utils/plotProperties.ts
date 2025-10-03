/**
 * Plot-specific properties for live customization
 * These properties align with the existing functional system
 */

export interface ScatterPointProperties {
  /** Point size in pixels */
  pointSize: number;
  /** Show data points */
  showDataPoints: boolean;
  /** Point opacity (0-1) */
  pointOpacity: number;
  /** Point border width in pixels */
  pointBorderWidth: number;
  /** Point color (optional override) */
  pointColor?: string;
}

export interface RegressionLineProperties {
  /** Line width in pixels */
  lineWidth: number;
  /** Line opacity (0-1) */
  lineOpacity: number;
  /** Line color */
  lineColor: string;
  /** Show confidence interval */
  showConfidenceInterval: boolean;
  /** Confidence interval opacity (0-1) */
  confidenceIntervalOpacity: number;
}

export interface ErrorBarProperties {
  /** Error bar thickness in pixels */
  errorBarThickness: number;
  /** Error bar width in pixels */
  errorBarWidth: number;
  /** Error bar opacity (0-1) */
  errorBarOpacity: number;
  /** Error bar cap size in pixels */
  errorBarCapSize: number;
  /** Show error bars */
  showErrorBars: boolean;
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

export interface PlotSpecificProperties {
  scatter?: ScatterPointProperties;
  regression?: RegressionLineProperties;
  errorBar?: ErrorBarProperties;
  pointPlot?: PointPlotProperties;
  dotPlot?: DotPlotProperties;
}

export interface LiveProperties {
  /** Global properties */
  global?: {
    seriesColor?: string;
    legendTextEntries?: Record<string, string>;
    legendSeriesColors?: Record<string, string>;
    xScaleType?: string;
    yScaleType?: string;
  };
  /** Plot-specific properties */
  plotSpecific?: PlotSpecificProperties;
}

/**
 * Default plot properties - aligned with existing system
 */
export const DEFAULT_PLOT_PROPERTIES: PlotSpecificProperties = {
  scatter: {
    pointSize: 8,
    showDataPoints: true,
    pointOpacity: 1,
    pointBorderWidth: 1,
    pointColor: '#1f77b4'
  },
  regression: {
    lineWidth: 2,
    lineOpacity: 0.85,
    lineColor: '#d62728',
    showConfidenceInterval: false,
    confidenceIntervalOpacity: 0.3
  },
  errorBar: {
    errorBarThickness: 1,
    errorBarWidth: 1,
    errorBarOpacity: 0.8,
    errorBarCapSize: 4,
    showErrorBars: true
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
 * Get plot properties with defaults applied
 */
export const getPlotProperties = (liveProps?: LiveProperties): PlotSpecificProperties => {
  if (!liveProps?.plotSpecific) {
    return DEFAULT_PLOT_PROPERTIES;
  }

  return {
    scatter: {
      ...DEFAULT_PLOT_PROPERTIES.scatter,
      ...liveProps.plotSpecific.scatter
    },
    regression: {
      ...DEFAULT_PLOT_PROPERTIES.regression,
      ...liveProps.plotSpecific.regression
    },
    errorBar: {
      ...DEFAULT_PLOT_PROPERTIES.errorBar,
      ...liveProps.plotSpecific.errorBar
    }
  };
};

/**
 * Apply scatter properties to a trace
 */
export const applyScatterProperties = (
  trace: any,
  properties: ScatterPointProperties
): any => {
  const updatedTrace = { ...trace };

  if (updatedTrace.marker) {
    updatedTrace.marker = {
      ...updatedTrace.marker,
      size: properties.pointSize,
      opacity: properties.pointOpacity,
      line: {
        ...updatedTrace.marker.line,
        width: properties.pointBorderWidth
      }
    };

    // Apply color override if provided
    if (properties.pointColor) {
      updatedTrace.marker.color = properties.pointColor;
    }
  }

  return updatedTrace;
};

/**
 * Apply regression properties to a trace
 */
export const applyRegressionProperties = (
  trace: any,
  properties: RegressionLineProperties
): any => {
  const updatedTrace = { ...trace };

  if (updatedTrace.line) {
    updatedTrace.line = {
      ...updatedTrace.line,
      color: properties.lineColor,
      width: properties.lineWidth,
      opacity: properties.lineOpacity
    };
  }

  return updatedTrace;
};

/**
 * Apply error bar properties to a trace
 */
export const applyErrorBarProperties = (
  trace: any,
  properties: ErrorBarProperties
): any => {
  const updatedTrace = { ...trace };

  if (updatedTrace.error_y || updatedTrace.error_x) {
    const errorConfig = {
      width: properties.errorBarWidth,
      thickness: properties.errorBarThickness,
      capsize: properties.errorBarCapSize
    };

    if (updatedTrace.error_y) {
      updatedTrace.error_y = { ...updatedTrace.error_y, ...errorConfig };
    }
    if (updatedTrace.error_x) {
      updatedTrace.error_x = { ...updatedTrace.error_x, ...errorConfig };
    }
  }

  return updatedTrace;
};
