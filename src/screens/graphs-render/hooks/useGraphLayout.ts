/**
 * Custom hook for graph layout configuration
 * Handles layout generation, axis configuration, and 3D scene setup
 */

import { useMemo } from 'react';
import { getLegendConfig, getTitleText, getAxisConfig, getAnnotations } from '../utils/common';
import { getAxisType } from '../utils/axisTransforms';

export interface UseGraphLayoutProps {
  graphConfig: any;
  liveProps?: any;
  has3DMeshTraces: boolean;
  xNames: string[];
  yNames: string[];
  categoryNames: string[];
  rows: any[];
  normalizedFormat: string;
  isPointPlot: boolean;
  isCategoryPlot: boolean;
  isCategoryFormat: boolean;
  categoryPlotResult?: any;
}

export interface UseGraphLayoutReturn {
  layout: any;
  config: any;
}

export const useGraphLayout = ({
  graphConfig,
  liveProps,
  has3DMeshTraces,
  xNames,
  yNames,
  categoryNames,
  rows,
  normalizedFormat,
  isPointPlot,
  isCategoryPlot,
  isCategoryFormat,
  categoryPlotResult
}: UseGraphLayoutProps): UseGraphLayoutReturn => {
  
  const layout = useMemo(() => {
    const subType = graphConfig?.subType || '';
    
    // Live Properties mapping
    const showTitle = liveProps?.global?.showTitle ?? true;
    const liveTitle = (showTitle ? (liveProps?.global?.graphName || graphConfig?.graphName) : '') || undefined;
    const legendTitle = liveProps?.global?.legendTitle || undefined;
    const useDirectLabels = liveProps?.global?.legendDirectLabeling ?? false;
    const showLegend = useDirectLabels ? false : (liveProps?.global?.showLegend ?? true);
    
    // Legend options mapping
    const framed = liveProps?.global?.legendFramedInBox ?? true;
    const legendColumns = liveProps?.global?.legendColumns ?? 1;
    const legendBoxSpacingInch = liveProps?.global?.legendBoxSpacingInch ?? 0.25;
    const userLegendPosition = liveProps?.global?.legendPosition;
    
    // Convert inches to pixels (approximate 96 dpi)
    const borderpad = Math.max(0, Math.min(48, Math.round(legendBoxSpacingInch * 96)));
    const orientation = legendColumns > 1 ? 'h' : undefined;
    
    // Only override legend position if the user explicitly chose one; otherwise keep defaults
    const legendPos = userLegendPosition
      ? (userLegendPosition === 'front'
          ? { x: 0.02, y: 0.98, xanchor: 'left' as const, yanchor: 'top' as const }
          : { x: 1.02, y: 1, xanchor: 'left' as const, yanchor: 'top' as const })
      : {} as any;
    
    // Local RGBA helper for background and plot colors (avoid order issues)
    const toRgba = (hex?: string, alpha?: number) => {
      if (!hex) return undefined as any;
      const h = hex.replace('#', '');
      if (h.length !== 6) return hex;
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      const a = typeof alpha === 'number' ? alpha : 1;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    };
    
    const bgAlpha = Math.max(0, Math.min(1, 1 - (liveProps?.global?.backgroundTransparencyPct || 0) / 100));
    const plotAlpha = Math.max(0, Math.min(1, 1 - (liveProps?.global?.plotTransparencyPct || 0) / 100));
    const paperBg = liveProps?.global?.backgroundColor ? toRgba(liveProps.global.backgroundColor, bgAlpha) : undefined;
    const plotBg = liveProps?.global?.plotColor ? toRgba(liveProps.global.plotColor, plotAlpha) : paperBg;
    
    // Axis labels: keep defaults, but allow override when provided
    const axisXTitle = liveProps?.global?.showAxisLabels && liveProps?.global?.axisXData
      ? { text: liveProps.global.axisXData }
      : undefined;
    const axisYTitle = liveProps?.global?.showAxisLabels && liveProps?.global?.axisYData
      ? { text: liveProps.global.axisYData }
      : undefined;
    
    // Convert inches to pixels (~96 dpi heuristic)
    const inchToPx = (inch: number) => Math.max(0, Math.round(inch * 96));
    const gridOpacity = Math.max(0, Math.min(1, 1 - (liveProps?.global?.gridTransparencyPct || 0) / 100));
    
    const hexToRgba = (hex?: string, alpha?: number) => {
      if (!hex) return undefined as any;
      const h = hex.replace('#', '');
      if (h.length !== 6) return hex;
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      const a = typeof alpha === 'number' ? alpha : 1;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    };
    
    const gridDash = ((): any => {
      switch (liveProps?.global?.gridLineStyle) {
        case 'dashed': return 'dash';
        case 'dotted': return 'dot';
        case 'none': return undefined;
        default: return 'solid';
      }
    })();

    // Axis line computed properties
    const axisLineAlpha = Math.max(0, Math.min(1, 1 - (liveProps?.global?.axisLineTransparencyPct || 0) / 100));
    const axisLineWidthPx = Math.max(1, Math.round((liveProps?.global?.axisLineThicknessInch || 0.0104) * 96));
    const axisLineColor = hexToRgba(liveProps?.global?.axisLineColor || '#444444', axisLineAlpha);

    const titleVisible = liveProps?.global?.showTitle !== false;
    
    let baseLayout: any = {
      title: titleVisible
        ? {
            text: liveTitle || getTitleText(subType),
            font: { size: 18, family: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif', color: '#111' },
            x: 0.5,
            xanchor: 'center',
            y: 0.98,
            yanchor: 'top',
            pad: { t: 8, b: 4, l: 0, r: 0 },
          }
        : undefined,
      autosize: true,
      // Force Plotly to fully re-evaluate layout changes like RGBA grid colors
      datarevision: Date.now(),
      showlegend: showLegend,
      legend: {
        ...getLegendConfig(subType),
        title: legendTitle ? { text: legendTitle } : undefined,
        traceorder: 'normal',
        ...(orientation ? { orientation } : {}),
        borderwidth: framed ? 1 : 0,
        bordercolor: framed ? '#999' : undefined,
        bgcolor: framed ? 'rgba(255,255,255,0.85)' : undefined,
        borderpad,
        ...legendPos,
        // Legend Items properties
        ...(liveProps?.global?.legendWidth && { width: liveProps.global.legendWidth }),
        ...(liveProps?.global?.legendHeight && { height: liveProps.global.legendHeight }),
        ...(liveProps?.global?.symbolPlacement && {
          traceorder: liveProps.global.symbolPlacement === 'before' ? 'normal' : 'reversed'
        }),
      },
      margin: { l: liveProps?.global?.marginSize ?? 20, r: 16, t: 64, b: liveProps?.global?.padding ?? 16 },
      automargin: true,
      paper_bgcolor: paperBg,
      plot_bgcolor: plotBg,
    };

    // Add 2D axes configuration if not 3D mesh
    if (!has3DMeshTraces) {
      baseLayout.xaxis = createXAxisConfig({
        subType,
        xNames,
        categoryNames,
        normalizedFormat,
        isPointPlot,
        liveProps,
        axisXTitle,
        axisLineColor,
        axisLineWidthPx,
        gridOpacity,
        hexToRgba,
        inchToPx,
        gridDash,
        rows
      });

      baseLayout.yaxis = createYAxisConfig({
        subType,
        yNames,
        categoryNames,
        normalizedFormat,
        isPointPlot,
        liveProps,
        axisYTitle,
        axisLineColor,
        axisLineWidthPx,
        gridOpacity,
        hexToRgba,
        inchToPx,
        gridDash,
        rows
      });
    }

    // Add 3D scene configuration for 3D mesh plots
    if (has3DMeshTraces) {
      baseLayout.scene = {
        xaxis: { 
          title: xNames[0] || 'X',
          // Ensure X-axis goes from low to high (left to right)
          autorange: true,
          showgrid: true,
          zeroline: false,
          // Ensure proper orientation: low values on left, high on right
          tickmode: 'auto',
          nticks: 8
        },
        yaxis: { 
          title: yNames[0] || 'Y',
          // Ensure Y-axis goes from low to high (front to back)
          autorange: true,
          showgrid: true,
          zeroline: false,
          // Ensure proper orientation: low values in front, high in back
          tickmode: 'auto',
          nticks: 8
        },
        zaxis: { 
          title: 'Z',
          // Ensure Z-axis goes from low to high (bottom to top)
          autorange: true,
          showgrid: true,
          zeroline: false,
          // Ensure proper Z-axis scaling with single range
          tickmode: 'auto',
          nticks: 8
        },
        camera: {
          // Camera angle to show 400 starting from bottom-left, increasing to 600 going right
          // X-axis: 400 (bottom-left) → 600 (bottom-right)
          // Y-axis: 24k (front-left) → 31k (back-right)
          eye: { x: 0.8, y: 1.5, z: 1.8 },
          center: { x: 0, y: 0, z: 0 },
          up: { x: 0, y: 0, z: 1 }
        },
        // Enable proper 3D interaction
        aspectmode: 'auto',
        bgcolor: 'rgba(0,0,0,0)'
      };
    }

    // For category plots, merge category-specific axis settings
    if (isCategoryPlot && isCategoryFormat && categoryPlotResult) {
      // Merge category-specific axis settings while preserving all the comprehensive settings
      if (categoryPlotResult.layout.xaxis) {
        baseLayout.xaxis = { ...baseLayout.xaxis, ...categoryPlotResult.layout.xaxis };
      }
      if (categoryPlotResult.layout.yaxis) {
        baseLayout.yaxis = { ...baseLayout.yaxis, ...categoryPlotResult.layout.yaxis };
      }
    }

    // Add annotations if needed
    const annotations = getAnnotations(subType);
    if (annotations.length > 0) {
      baseLayout.annotations = annotations;
    }

    return baseLayout;
  }, [
    graphConfig,
    liveProps,
    has3DMeshTraces,
    xNames,
    yNames,
    categoryNames,
    rows,
    normalizedFormat,
    isPointPlot,
    isCategoryPlot,
    isCategoryFormat,
    categoryPlotResult
  ]);

  const config = useMemo(() => {
    const allowDragResize = (liveProps?.global?.legendAllowDragResize ?? true) && !(liveProps?.global?.legendLock);
    
    return { 
      responsive: true, 
      edits: { legendPosition: allowDragResize, titleText: true, axisTitleText: true },
      // Replace Plotly logo with Stat Pro logo
      displaylogo: false,  // Hide the default Plotly logo
      watermark: false,    // Disable Plotly watermark
    } as any;
  }, [liveProps]);

  return { layout, config };
};

// Helper functions for axis configuration
const createXAxisConfig = ({ subType, xNames, categoryNames, normalizedFormat, isPointPlot, liveProps, axisXTitle, axisLineColor, axisLineWidthPx, gridOpacity, hexToRgba, inchToPx, gridDash, rows }: any) => {
  return {
    ...getAxisConfig(subType, 'x'),
    title: (() => {
      // Special handling for X Category point plots
      if (isPointPlot && normalizedFormat === 'X Category' && xNames?.length > 0) {
        return { text: xNames[0], standoff: 12 };
      }
      return axisXTitle ? { ...axisXTitle, standoff: 12 } : undefined;
    })(),
    showline: true,
    linecolor: axisLineColor,
    linewidth: axisLineWidthPx,
    type: ((): any => {
      // Special handling for Y Category point plots
      if (isPointPlot && normalizedFormat === 'Y Category' && categoryNames?.length > 0) {
        return 'category';
      }
      
      return getAxisType(liveProps?.global?.xScaleType);
    })(),
    // Range handling
    ...(liveProps?.global?.xRangeStartMode === 'constant' && typeof liveProps?.global?.xRangeStart === 'number' && liveProps?.global?.xRangeEndMode === 'constant' && typeof liveProps?.global?.xRangeEnd === 'number'
      ? { range: [liveProps.global.xRangeStart, liveProps.global.xRangeEnd] }
      : {}),
    ...(liveProps?.global?.xPad5 ? { rangepadding: 5 } : {}),
    ...(liveProps?.global?.xNearestTick ? { tickmode: 'auto' } : {}),
    // Special category tick configuration for Y Category point plots
    ...(isPointPlot && normalizedFormat === 'Y Category' && categoryNames?.length > 0 ? (() => {
      // Get unique category values from the data
      const categoryCol = categoryNames[0];
      const uniqueCategories = [...new Set(rows.map((row: any) => row[categoryCol]))];
      
      return {
        tickmode: 'array',
        tickvals: uniqueCategories.map((_, index) => index + 1),
        ticktext: uniqueCategories,
        title: categoryCol
      };
    })() : {}),
    showgrid: (liveProps?.global?.showGridLines ?? true) && (liveProps?.global?.gridLineStyle !== 'none') && (liveProps?.global?.gridXMajor),
    gridcolor: hexToRgba(liveProps?.global?.gridColor, gridOpacity),
    gridwidth: inchToPx(liveProps?.global?.gridThicknessInch || 0.01),
    griddash: gridDash,
    zeroline: false,
    minor: createMinorAxisConfig(liveProps, gridOpacity, hexToRgba, inchToPx, gridDash, 'X'),
    layer: liveProps?.global?.gridLayering === 'gridFront' ? 'above traces' : 'below traces',
    tickprefix: liveProps?.global?.majorTickPrefix || undefined,
    ticksuffix: liveProps?.global?.majorTickSuffix || undefined,
    showticklabels: liveProps?.global?.majorTickShowLeft || liveProps?.global?.majorTickShowRight,
    tickformat: createTickFormat(liveProps),
    exponentformat: liveProps?.global?.majorTickExponentFormat,
    tickformatstops: liveProps?.global?.majorTickFactor && liveProps.global.majorTickFactor !== '1' ? [{ enabled: true, dtickrange: [null, null], value: liveProps.global.majorTickFactor }] : undefined,
    // Tick marks properties
    ticklen: Math.max(1, Math.floor(inchToPx(liveProps?.global?.majorTickLength || 0.1))),
    tickwidth: Math.max(1, Math.floor(inchToPx(liveProps?.global?.majorTickThickness || 0.01))),
    tickcolor: hexToRgba(liveProps?.global?.majorTickColor || '#444444', Math.max(0, Math.min(1, 1 - ((liveProps?.global?.majorTickTransparency || 0) / 100)))),
    ticks: createTickDirection(liveProps),
    // Manual tick interval
    ...(liveProps?.global?.majorTickInterval === 'manual' && liveProps?.global?.majorTickManualInterval 
      ? { dtick: liveProps.global.majorTickManualInterval }
      : {}),
    // Break properties for X-axis
    ...(liveProps?.global?.showBreak && 
      typeof liveProps?.global?.omitRangeStart === 'number' && 
      typeof liveProps?.global?.omitRangeEnd === 'number' 
      ? (() => {
          return {
            rangebreaks: [{
              bounds: [liveProps.global.omitRangeStart, liveProps.global.omitRangeEnd]
            }]
          };
        })()
      : {}),
    automargin: true,
  };
};

const createYAxisConfig = ({ subType, yNames, categoryNames, normalizedFormat, isPointPlot, liveProps, axisYTitle, axisLineColor, axisLineWidthPx, gridOpacity, hexToRgba, inchToPx, gridDash, rows }: any) => {
  return {
    ...getAxisConfig(subType, 'y'),
    title: (() => {
      // Special handling for Y Category point plots
      if (isPointPlot && normalizedFormat === 'Y Category' && yNames?.length > 0) {
        return { text: yNames[0], standoff: 12 };
      }
      // Special handling for X Category point plots
      if (isPointPlot && normalizedFormat === 'X Category' && categoryNames?.length > 0) {
        return { text: categoryNames[0], standoff: 12 };
      }
      return axisYTitle ? { ...axisYTitle, standoff: 12 } : undefined;
    })(),
    showline: true,
    linecolor: axisLineColor,
    linewidth: axisLineWidthPx,
    side: (liveProps?.global?.yAxisSide === 'right') ? 'right' : 'left',
    type: ((): any => {
      // Special handling for X Category point plots
      if (isPointPlot && normalizedFormat === 'X Category' && categoryNames?.length > 0) {
        return 'category';
      }
      
      return getAxisType(liveProps?.global?.yScaleType);
    })(),
    ...(liveProps?.global?.yRangeStartMode === 'constant' && typeof liveProps?.global?.yRangeStart === 'number' && liveProps?.global?.yRangeEndMode === 'constant' && typeof liveProps?.global?.yRangeEnd === 'number'
      ? { range: [liveProps.global.yRangeStart, liveProps.global.yRangeEnd] }
      : {}),
    ...(liveProps?.global?.yPad5 ? { rangepadding: 5 } : {}),
    ...(liveProps?.global?.yNearestTick ? { tickmode: 'auto' } : {}),
    // Special category tick configuration for X Category point plots
    ...(isPointPlot && normalizedFormat === 'X Category' && categoryNames?.length > 0 ? (() => {
      // Get unique category values from the data
      const categoryCol = categoryNames[0];
      const uniqueCategories = [...new Set(rows.map((row: any) => row[categoryCol]))];
      
      return {
        tickmode: 'array',
        tickvals: uniqueCategories.map((_, index) => index + 1),
        ticktext: uniqueCategories,
        title: categoryCol
      };
    })() : {}),
    showgrid: (liveProps?.global?.showGridLines ?? true) && (liveProps?.global?.gridLineStyle !== 'none') && (liveProps?.global?.gridYMajor),
    gridcolor: hexToRgba(liveProps?.global?.gridColor, gridOpacity),
    gridwidth: inchToPx(liveProps?.global?.gridThicknessInch || 0.01),
    griddash: gridDash,
    zeroline: false,
    minor: createMinorAxisConfig(liveProps, gridOpacity, hexToRgba, inchToPx, gridDash, 'Y'),
    layer: liveProps?.global?.gridLayering === 'gridFront' ? 'above traces' : 'below traces',
    tickprefix: liveProps?.global?.majorTickPrefix || undefined,
    ticksuffix: liveProps?.global?.majorTickSuffix || undefined,
    showticklabels: liveProps?.global?.majorTickShowLeft || liveProps?.global?.majorTickShowRight,
    tickformat: createTickFormat(liveProps),
    exponentformat: liveProps?.global?.majorTickExponentFormat,
    tickformatstops: liveProps?.global?.majorTickFactor && liveProps.global.majorTickFactor !== '1' ? [{ enabled: true, dtickrange: [null, null], value: liveProps.global.majorTickFactor }] : undefined,
    // Tick marks properties
    ticklen: Math.max(1, Math.floor(inchToPx(liveProps?.global?.majorTickLength || 0.1))),
    tickwidth: Math.max(1, Math.floor(inchToPx(liveProps?.global?.majorTickThickness || 0.01))),
    tickcolor: hexToRgba(liveProps?.global?.majorTickColor || '#444444', Math.max(0, Math.min(1, 1 - ((liveProps?.global?.majorTickTransparency || 0) / 100)))),
    ticks: createTickDirection(liveProps),
    // Manual tick interval
    ...(liveProps?.global?.majorTickInterval === 'manual' && liveProps?.global?.majorTickManualInterval 
      ? { dtick: liveProps.global.majorTickManualInterval }
      : {}),
    // Break properties for Y-axis
    ...(liveProps?.global?.showBreak && 
      typeof liveProps?.global?.omitRangeStart === 'number' && 
      typeof liveProps?.global?.omitRangeEnd === 'number' 
      ? (() => {
          return {
            rangebreaks: [{
              bounds: [liveProps.global.omitRangeStart, liveProps.global.omitRangeEnd]
            }]
          };
        })()
      : {}),
    automargin: true,
  };
};

const createMinorAxisConfig = (liveProps: any, gridOpacity: number, hexToRgba: Function, inchToPx: Function, gridDash: any, axis: string) => {
  return {
    showgrid: (liveProps?.global?.showGridLines ?? true) && (liveProps?.global?.gridLineStyle !== 'none') && (liveProps?.global?.[`grid${axis}Minor`]),
    gridcolor: hexToRgba(liveProps?.global?.gridColor, Math.max(0, Math.min(1, gridOpacity * 0.6))),
    gridwidth: Math.max(1, Math.floor(inchToPx((liveProps?.global?.gridThicknessInch || 0.01) / 2))),
    griddash: gridDash || 'dot',
    // Minor tick marks
    ticks: (() => {
      const direction = liveProps?.global?.minorTickDirection || 'outward';
      switch (direction) {
        case 'none': return '';
        case 'inward': return 'inside';
        case 'outward': return 'outside';
        case 'both': return 'outside';
        default: return 'outside';
      }
    })(),
    ticklen: Math.max(1, Math.floor(inchToPx(liveProps?.global?.minorTickLength || 0.05))),
    tickwidth: Math.max(1, Math.floor(inchToPx(liveProps?.global?.minorTickThickness || 0.005))),
    tickcolor: hexToRgba(liveProps?.global?.minorTickColor || '#888888', Math.max(0, Math.min(1, 1 - ((liveProps?.global?.minorTickTransparency || 0) / 100)))),
    nticks: liveProps?.global?.minorTickInterval || 5,
  };
};

const createTickFormat = (liveProps: any) => {
  const mode = liveProps?.global?.majorTickPrecisionMode;
  const prec = liveProps?.global?.majorTickPrecision ?? 2;
  const numeric = liveProps?.global?.majorTickNumericType;
  if (numeric === 'percent') return mode === 'manual' ? `.${prec}%` : '.%';
  if (numeric === 'scientific') return mode === 'manual' ? `.${prec}e` : '.e';
  if (numeric === 'engineering') return mode === 'manual' ? `.${prec}s` : '.s';
  return mode === 'manual' ? `.${prec}f` : undefined;
};

const createTickDirection = (liveProps: any) => {
  const direction = liveProps?.global?.majorTickDirection || 'outward';
  switch (direction) {
    case 'none': return '';
    case 'inward': return 'inside';
    case 'outward': return 'outside';
    case 'both': return 'outside';
    default: return 'outside';
  }
};
