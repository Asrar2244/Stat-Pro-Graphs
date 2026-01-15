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
  /** Point border color */
  pointBorderColor: string;
  /** Use multi-color for points */
  useMultiColor: boolean;
  /** Single color for points */
  singleColor: string;
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
  /** Line style */
  lineStyle: string;
  /** Show confidence interval */
  showConfidenceInterval: boolean;
  /** Confidence interval opacity (0-1) */
  confidenceIntervalOpacity: number;
  /** Show R-squared value */
  showRSquared: boolean;
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
  /** Show in legend */
  showInLegend: boolean;
  /** Error bar color (optional override) */
  errorBarColor?: string;
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

export interface Mesh3DProperties {
  /** Surface type */
  surfaceType?: 'mesh' | 'surface' | 'wireframe';
  /** Surface opacity (0-1) */
  opacity?: number;
  /** Color scale */
  colorScale?: string;
  /** Show contours */
  showContours?: boolean;
  /** Contour opacity (0-1) */
  contourOpacity?: number;
  /** Lighting enabled */
  lighting?: boolean;
  /** Smooth shading */
  smoothShading?: boolean;
  /** Show grid */
  showGrid?: boolean;
  /** Grid opacity (0-1) */
  gridOpacity?: number;
  /** Original color scale from graph config */
  originalColorScale?: string;
}

export interface PlotSpecificProperties {
  scatter?: ScatterPointProperties;
  regression?: RegressionLineProperties;
  errorBar?: ErrorBarProperties;
  pointPlot?: PointPlotProperties;
  dotPlot?: DotPlotProperties;
  mesh3d?: Mesh3DProperties;
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
    pointBorderColor: 'rgba(0,0,0,0.3)',
    useMultiColor: false,
    singleColor: '#1f77b4',
    pointColor: '#1f77b4'
  },
  regression: {
    lineWidth: 2,
    lineOpacity: 0.85,
    lineColor: '#d62728',
    lineStyle: 'solid',
    showConfidenceInterval: false,
    confidenceIntervalOpacity: 0.3,
    showRSquared: false
  },
  errorBar: {
    errorBarThickness: 1,
    errorBarWidth: 1,
    errorBarOpacity: 0.8,
    errorBarCapSize: 10,  // Increased from 4 to 10 for better visibility
    showErrorBars: true,
    showInLegend: true,
    errorBarColor: '#1f77b4'
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
  },
  mesh3d: {
    surfaceType: 'surface',
    opacity: 1.0,
    colorScale: 'viridis',
    showContours: true,
    contourOpacity: 0.6,
    lighting: true,
    smoothShading: true,
    showGrid: true,
    gridOpacity: 0.5
  }
};

/**
 * Get plot properties with defaults applied
 */
export const getPlotProperties = (liveProps?: LiveProperties, graphConfig?: any): PlotSpecificProperties => {
  if (!liveProps?.plotSpecific) {
    return DEFAULT_PLOT_PROPERTIES;
  }

  // Extract 3D mesh properties from graph config if available
  // Priority: root-level properties (from modal) > meshConfig properties (from form)
  // Modal config
  const mesh3dFromConfig: any = {};
  if (graphConfig) {
    const p = graphConfig.meshConfig || {};
    if (graphConfig.surfaceType || p.surfaceType) mesh3dFromConfig.surfaceType = graphConfig.surfaceType || p.surfaceType;
    if (graphConfig.opacity !== undefined || p.opacity !== undefined) mesh3dFromConfig.opacity = graphConfig.opacity ?? p.opacity;
    if (graphConfig.colorScale || p.colorScale) mesh3dFromConfig.colorScale = graphConfig.colorScale || p.colorScale;
    if (graphConfig.showContours !== undefined || p.showContours !== undefined) mesh3dFromConfig.showContours = graphConfig.showContours ?? p.showContours;
    if (graphConfig.contourOpacity !== undefined || p.contourOpacity !== undefined) mesh3dFromConfig.contourOpacity = graphConfig.contourOpacity ?? p.contourOpacity;
    if (graphConfig.lighting !== undefined || p.lighting !== undefined) mesh3dFromConfig.lighting = graphConfig.lighting ?? p.lighting;
    if (graphConfig.smoothShading !== undefined || p.smoothShading !== undefined) mesh3dFromConfig.smoothShading = graphConfig.smoothShading ?? p.smoothShading;
    if (graphConfig.showGrid !== undefined || p.showGrid !== undefined) mesh3dFromConfig.showGrid = graphConfig.showGrid ?? p.showGrid;
    if (graphConfig.gridOpacity !== undefined || p.gridOpacity !== undefined) mesh3dFromConfig.gridOpacity = graphConfig.gridOpacity ?? p.gridOpacity;
  }

  const result = {
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
    },
    mesh3d: {
      ...DEFAULT_PLOT_PROPERTIES.mesh3d,
      ...mesh3dFromConfig,
      ...liveProps.plotSpecific.mesh3d
    }
  };

  return result;
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

  // Check if this is a confidence interval trace (has "CI" in name or has fillcolor)
  const isConfidenceInterval =
    updatedTrace.name?.includes('CI') ||
    updatedTrace.name?.includes('Confidence') ||
    updatedTrace.fillcolor;

  if (isConfidenceInterval) {
    // Apply confidence interval properties
    if (!properties.showConfidenceInterval) {
      // Hide confidence interval by setting visible to false
      updatedTrace.visible = false;
    } else {
      updatedTrace.visible = true;

      // Update fill opacity for confidence interval fill
      if (updatedTrace.fillcolor) {
        // Extract the base color and apply new opacity
        const baseColor = properties.lineColor;
        const opacity = properties.confidenceIntervalOpacity;
        // Convert hex to rgba
        const hexToRgba = (hex: string, alpha: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        updatedTrace.fillcolor = hexToRgba(baseColor, opacity);
      }

      // Update line color for confidence interval boundary lines
      if (updatedTrace.line && updatedTrace.line.dash === 'dot') {
        updatedTrace.line = {
          ...updatedTrace.line,
          color: properties.lineColor,
          opacity: properties.confidenceIntervalOpacity
        };
      }
    }
  } else {
    // Apply regular regression line properties
    if (updatedTrace.line) {
      updatedTrace.line = {
        ...updatedTrace.line,
        color: properties.lineColor,
        width: properties.lineWidth,
        opacity: properties.lineOpacity
      };
    }
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
    // Apply to Y error bars
    if (updatedTrace.error_y) {
      // Only update the properties we want to change, preserve everything else
      updatedTrace.error_y.width = properties.errorBarWidth;
      updatedTrace.error_y.thickness = properties.errorBarThickness;

      // Apply opacity and visibility
      if (typeof properties.errorBarOpacity !== 'undefined') {
        updatedTrace.error_y.opacity = properties.errorBarOpacity;
      }
      if (typeof properties.showErrorBars !== 'undefined') {
        updatedTrace.error_y.visible = properties.showErrorBars;
      }

      // Update cap properties if cap exists, preserve all other cap properties
      if (updatedTrace.error_y.cap) {
        // Preserve existing cap properties and only update what we need
        if (typeof properties.errorBarCapSize !== 'undefined') {
          updatedTrace.error_y.cap.size = properties.errorBarCapSize;
        }
        // Explicitly ensure visible is true
        if (!updatedTrace.error_y.cap.hasOwnProperty('visible')) {
          updatedTrace.error_y.cap.visible = true;
        }

        // Only apply color if explicitly provided
        if (properties.errorBarColor) {
          updatedTrace.error_y.color = properties.errorBarColor;
          updatedTrace.error_y.cap.color = properties.errorBarColor;
        }

      } else {
      }
    }

    // Apply to X error bars
    if (updatedTrace.error_x) {
      // Only update the properties we want to change, preserve everything else
      updatedTrace.error_x.width = properties.errorBarWidth;
      updatedTrace.error_x.thickness = properties.errorBarThickness;

      // Apply opacity and visibility
      if (typeof properties.errorBarOpacity !== 'undefined') {
        updatedTrace.error_x.opacity = properties.errorBarOpacity;
      }
      if (typeof properties.showErrorBars !== 'undefined') {
        updatedTrace.error_x.visible = properties.showErrorBars;
      }

      // Update cap properties if cap exists, preserve all other cap properties
      if (updatedTrace.error_x.cap) {
        // Preserve existing cap properties and only update what we need
        if (typeof properties.errorBarCapSize !== 'undefined') {
          updatedTrace.error_x.cap.size = properties.errorBarCapSize;
        }
        // Explicitly ensure visible is true
        if (!updatedTrace.error_x.cap.hasOwnProperty('visible')) {
          updatedTrace.error_x.cap.visible = true;
        }

        // Only apply color if explicitly provided
        if (properties.errorBarColor) {
          updatedTrace.error_x.color = properties.errorBarColor;
          updatedTrace.error_x.cap.color = properties.errorBarColor;
        }

      } else {
      }
    }
  }

  return updatedTrace;
};
