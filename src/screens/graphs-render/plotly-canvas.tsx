import { FC, useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { usePlotly } from '@hooks/plotly';
import { Database } from '@utils';
import { ensureGraphFolderAndSave } from './services/plotly-save';
import { EXCEL } from '@constants';
import { GraphLoader } from './components/GraphLoader';

// Import utility modules
import { 
  getLegendConfig, 
  getTitleText, 
  getAxisConfig, 
  getAnnotations,
  getSeriesConfig,
  assessDataQuality,
  optimizeDataForPerformance,
  measurePerformance,
  optimizeTraceForLargeData,
  getPerformanceRecommendations,
  getPlotProperties,
  applyScatterProperties,
  applyRegressionProperties
} from './utils/common';
import { createTrace, createRegressionTracesIfNeeded } from './utils/traceGeneration';
import { processDataByFormat } from './utils/dataProcessing';
import { createDotPlotDottedLines } from './utils/scatter';
import { plotWithCategory, getCategoryPlotLayout } from './utils/categoryScatterPlot';

// ✅ PHASE 2: Import extracted services for data fetching and trace orchestration
import { fetchGraphData } from './utils/core/data-processing/dataFetchingService';
import { orchestrateTraceGeneration } from './utils/orchestration/traceOrchestrator';

export interface GraphCanvasRef {
  current: HTMLDivElement | null;
  plotly: any;
}

export const GraphCanvas = forwardRef<GraphCanvasRef, any>(({ graphConfig, workspacePath, liveProps }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plot = usePlotly({ data: [], layout: { title: graphConfig?.subType || 'Scatter Plot', autosize: true } as any, config: { responsive: true } } as any);
  // Keep last successful plot payload to restore on visibility/resize
  const lastPlotRef = useRef<{ data: any[]; layout: any; config: any } | null>(null);
  
  // Loading state for professional loader
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Expose the container ref and plotly instance to parent components
  useImperativeHandle(ref, () => ({
    current: containerRef.current,
    plotly: plot
  }), [plot]);

  // Track liveProps changes
  useEffect(() => {
    const canvasMode = liveProps?.canvasMode || liveProps?.global?.canvasMode || 'light';
    console.log('🎨 Plotly Canvas - liveProps Changed:', {
      canvasMode,
      livePropsCanvasMode: liveProps?.canvasMode,
      livePropsGlobalCanvasMode: liveProps?.global?.canvasMode,
      hasLiveProps: !!liveProps,
      hasGlobal: !!liveProps?.global,
      timestamp: new Date().toISOString()
    });
  }, [liveProps?.canvasMode, liveProps?.global?.canvasMode]);


  // Build data arrays from project DB based on selected variables
  useEffect(() => {
    // Clear any existing timeout when effect runs
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    setIsLoading(false);
    
    const run = async () => {
      if (!graphConfig?.selectedProject || !graphConfig?.variables) {
        return;
      }
      
      // Show loading state after 1.5 seconds if graph generation is still in progress
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(true);
      }, 1500);
      
      // ✅ STEP 2: Fetch data using extracted service
      let fetchResult;
      try {
        fetchResult = await fetchGraphData({ graphConfig, workspacePath });
      } catch (error) {
        console.error('❌ Data fetching failed:', error);
        return;
      }

      const { rows, xNames, yNames, zNames, categoryNames, normalizedFormat } = fetchResult;
      
      // Merge mesh3d properties from liveProps into graphConfig
      const enhancedGraphConfig = {
        ...graphConfig,
        meshConfig: {
          ...(graphConfig.meshConfig || {}),
          ...(liveProps?.plotSpecific?.mesh3d || {})
        }
      };

      console.log('🎨 3D Mesh Config Merge - DETAILED:', {
        originalMeshConfig: graphConfig.meshConfig,
        liveProps3D: liveProps?.plotSpecific?.mesh3d,
        enhancedMeshConfig: enhancedGraphConfig.meshConfig,
        hasLiveProps: !!liveProps,
        hasPlotSpecific: !!liveProps?.plotSpecific,
        hasMesh3d: !!liveProps?.plotSpecific?.mesh3d,
        // DETAILED DEBUG
        livePropsKeys: liveProps ? Object.keys(liveProps) : [],
        plotSpecificKeys: liveProps?.plotSpecific ? Object.keys(liveProps.plotSpecific) : [],
        mesh3dKeys: liveProps?.plotSpecific?.mesh3d ? Object.keys(liveProps.plotSpecific.mesh3d) : [],
        fullMesh3dObject: liveProps?.plotSpecific?.mesh3d,
        // Background color debug
        backgroundColor: liveProps?.global?.backgroundColor,
        hasGlobal: !!liveProps?.global,
        globalKeys: liveProps?.global ? Object.keys(liveProps.global) : []
      });

      // Process data by format
      const processedSeries = processDataByFormat({
        graphConfig: { ...enhancedGraphConfig, dataFormat: normalizedFormat },
        rows,
        xNames,
        yNames,
        zNames,
        categoryNames,
        errorBarNames: graphConfig.variables?.errorBar || []
      });

      // ✅ STEP 3: Generate traces using extracted orchestrator
      let orchestrationResult;
      try {
        orchestrationResult = await orchestrateTraceGeneration({
          graphConfig: enhancedGraphConfig,
          processedSeries,
          rows,
          xNames,
          yNames,
          categoryNames,
          normalizedFormat,
          liveProps
        });
      } catch (error) {
        console.error('❌ Trace orchestration failed:', error);
        return;
      }

      const { traces, legendLabels, categoryPlotResult } = orchestrationResult;

      // NOTE: All trace generation (quality assessment, optimization, transformations,
      // category plots, regression lines, dot plot lines) is now handled by the orchestrator

      // Helper flags for layout configuration
      const isCategoryPlot = categoryNames && categoryNames.length > 0;
      const isCategoryFormat = normalizedFormat?.toLowerCase().includes('category');
      const isPointPlot = graphConfig?.subType?.toLowerCase().includes('point plot');

      // Check if we have any traces to plot
      if (traces.length === 0) {
        console.warn('⚠️ No traces generated');
        return;
      }

      // Create layout based on sub-type
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
      // convert inches to pixels (approximate 96 dpi)
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
      // Get canvas mode from tools (check both direct and nested paths)
      const canvasMode = liveProps?.canvasMode || liveProps?.global?.canvasMode || 'light';
      
      console.log('🎨 Canvas Mode Debug:', {
        canvasMode,
        livePropsCanvasMode: liveProps?.canvasMode,
        livePropsGlobalCanvasMode: liveProps?.global?.canvasMode,
        hasLiveProps: !!liveProps,
        hasGlobal: !!liveProps?.global,
        livePropsKeys: liveProps ? Object.keys(liveProps) : 'no liveProps',
        globalKeys: liveProps?.global ? Object.keys(liveProps.global) : 'no global'
      });
      
      // Define canvas mode colors
      const lightModeColors = {
        paperBg: '#ffffff',
        plotBg: '#ffffff',
        textColor: '#111111',
        axisTextColor: '#111111',
        gridColor: '#e5e5e5', // 2D grid color (light gray)
        axisColor: '#444444'
      };
      
      const darkModeColors = {
        paperBg: '#000000',        // Pitch black background
        plotBg: '#000000',         // Pitch black plot area
        textColor: '#ffffff',      // Pure white text
        axisTextColor: '#ffffff',  // Pure white axis text
        gridColor: '#333333',      // Dark gray grid
        axisColor: '#555555'       // Medium gray axes
      };
      
      const modeColors = canvasMode === 'dark' ? darkModeColors : lightModeColors;
      
      const axisLineColor = hexToRgba(modeColors.axisColor, axisLineAlpha);

      const titleVisible = liveProps?.global?.showTitle !== false;
      
      // Check if we have 3D mesh traces
      const has3DMeshTraces = traces.some(trace => trace.type === 'scatter3d' || trace.type === 'mesh3d' || trace.type === 'surface');
      
      // Function to determine text color based on background color
      const getTextColorForBackground = (bgColor: string): string => {
        if (!bgColor) return '#111111'; // Default dark text
        
        // Parse background color to RGB values
        let r, g, b;
        
        if (bgColor.startsWith('#')) {
          // Hex color
          const hex = bgColor.replace('#', '');
          r = parseInt(hex.substr(0, 2), 16);
          g = parseInt(hex.substr(2, 2), 16);
          b = parseInt(hex.substr(4, 2), 16);
        } else if (bgColor.startsWith('rgb')) {
          // RGB/RGBA color
          const values = bgColor.match(/\d+/g);
          if (values && values.length >= 3) {
            r = parseInt(values[0]);
            g = parseInt(values[1]);
            b = parseInt(values[2]);
          } else {
            return '#111111'; // Default if parsing fails
          }
        } else {
          return '#111111'; // Default for unknown formats
        }
        
        // Calculate luminance using relative luminance formula
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return dark text for light backgrounds, light text for dark backgrounds
        return luminance > 0.5 ? '#111111' : '#FFFFFF';
      };
      
      // Override background colors with canvas mode colors
      const finalPaperBg = modeColors.paperBg;
      const finalPlotBg = modeColors.plotBg;
      const textColor = modeColors.textColor;
      const axisTextColor = modeColors.axisTextColor;
      
      console.log('🎨 Canvas Mode Colors Applied:', {
        canvasMode,
        finalPaperBg,
        finalPlotBg,
        textColor,
        axisTextColor,
        modeColors
      });
      
      let layout: any = {
        title: titleVisible
          ? {
              text: liveTitle || getTitleText(subType),
              font: { size: 18, family: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif', color: textColor },
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
          ...getLegendConfig(subType, canvasMode),
          title: legendTitle ? { text: legendTitle } : undefined,
          traceorder: 'normal',
          ...(orientation ? { orientation } : {}),
          borderwidth: framed ? 1 : 0,
          bordercolor: framed ? modeColors.axisColor : undefined,
          bgcolor: framed ? hexToRgba(modeColors.paperBg, 0.85) : undefined,
          font: {
            color: modeColors.textColor,
            size: 12,
            family: 'Arial, sans-serif'
          },
          borderpad,
          ...legendPos,
          // Legend Items properties
          ...(liveProps?.global?.legendWidth && { width: liveProps.global.legendWidth }),
          ...(liveProps?.global?.legendHeight && { height: liveProps.global.legendHeight }),
          ...(liveProps?.global?.symbolPlacement && {
            traceorder: liveProps.global.symbolPlacement === 'before' ? 'normal' : 'reversed'
          }),
        },
        xaxis: {
          ...getAxisConfig(subType, 'x', canvasMode),
          title: (() => {
            // Special handling for X Category point plots
            if (isPointPlot && normalizedFormat === 'X Category' && xNames?.length > 0) {
              return { 
                text: xNames[0], 
                standoff: 12,
                font: { color: modeColors.axisTextColor }
              };
            }
            return axisXTitle ? { 
              ...axisXTitle, 
              standoff: 12,
              font: { color: modeColors.axisTextColor }
            } : undefined;
          })(),
          showline: true,
          linecolor: axisLineColor,
          linewidth: axisLineWidthPx,
          type: ((): any => {
            // Special handling for Y Category point plots
            if (isPointPlot && normalizedFormat === 'Y Category' && categoryNames?.length > 0) {
              return 'category';
            }
            
            switch (liveProps?.global?.xScaleType) {
              case 'linear': return 'linear';
              case 'log10': return 'log';
              case 'loge': return 'log';
              case 'category': return 'category';
              case 'datetime': return 'date';
              // Probability/probit/logit/weibull/reciprocal would require transforms; default to linear for now
              default: return 'linear';
            }
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
              tickvals: uniqueCategories.map((_, index) => index), // Use 0-based indexing to match data
              ticktext: uniqueCategories,
              title: categoryCol
            };
          })() : {}),
          showgrid: (liveProps?.global?.showGridLines ?? true) && (liveProps?.global?.gridLineStyle !== 'none') && (liveProps?.global?.gridXMajor),
          gridcolor: hexToRgba(modeColors.gridColor, gridOpacity),
          gridwidth: inchToPx(liveProps?.global?.gridThicknessInch || 0.01),
          griddash: gridDash,
          zeroline: false,
          minor: {
            showgrid: (liveProps?.global?.showGridLines ?? true) && (liveProps?.global?.gridLineStyle !== 'none') && (liveProps?.global?.gridXMinor),
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
          },
          layer: liveProps?.global?.gridLayering === 'gridFront' ? 'above traces' : 'below traces',
          tickprefix: liveProps?.global?.majorTickPrefix || undefined,
          ticksuffix: liveProps?.global?.majorTickSuffix || undefined,
          showticklabels: liveProps?.global?.majorTickShowLeft || liveProps?.global?.majorTickShowRight,
          tickformat: ((): any => {
            const mode = liveProps?.global?.majorTickPrecisionMode;
            const prec = liveProps?.global?.majorTickPrecision ?? 2;
            const numeric = liveProps?.global?.majorTickNumericType;
            if (numeric === 'percent') return mode === 'manual' ? `.${prec}%` : '.%';
            if (numeric === 'scientific') return mode === 'manual' ? `.${prec}e` : '.e';
            if (numeric === 'engineering') return mode === 'manual' ? `.${prec}s` : '.s';
            return mode === 'manual' ? `.${prec}f` : undefined;
          })(),
          exponentformat: liveProps?.global?.majorTickExponentFormat,
          tickformatstops: liveProps?.global?.majorTickFactor && liveProps.global.majorTickFactor !== '1' ? [{ enabled: true, dtickrange: [null, null], value: liveProps.global.majorTickFactor }] : undefined,
          // Tick marks properties
          ticklen: Math.max(1, Math.floor(inchToPx(liveProps?.global?.majorTickLength || 0.1))),
          tickwidth: Math.max(1, Math.floor(inchToPx(liveProps?.global?.majorTickThickness || 0.01))),
          tickcolor: hexToRgba(liveProps?.global?.majorTickColor || '#444444', Math.max(0, Math.min(1, 1 - ((liveProps?.global?.majorTickTransparency || 0) / 100)))),
          ticks: (() => {
            const direction = liveProps?.global?.majorTickDirection || 'outward';
            switch (direction) {
              case 'none': return '';
              case 'inward': return 'inside';
              case 'outward': return 'outside';
              case 'both': return 'outside';
              default: return 'outside';
            }
          })(),
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
        },
        yaxis: {
          ...getAxisConfig(subType, 'y', canvasMode),
          title: (() => {
            // Special handling for Y Category point plots
            if (isPointPlot && normalizedFormat === 'Y Category' && yNames?.length > 0) {
              return { 
                text: yNames[0], 
                standoff: 12,
                font: { color: modeColors.axisTextColor }
              };
            }
            // Special handling for X Category point plots
            if (isPointPlot && normalizedFormat === 'X Category' && categoryNames?.length > 0) {
              return { 
                text: categoryNames[0], 
                standoff: 12,
                font: { color: modeColors.axisTextColor }
              };
            }
            return axisYTitle ? { 
              ...axisYTitle, 
              standoff: 12,
              font: { color: modeColors.axisTextColor }
            } : undefined;
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
            
            switch (liveProps?.global?.yScaleType) {
              case 'linear': return 'linear';
              case 'log10': return 'log';
              case 'loge': return 'log';
              case 'category': return 'category';
              case 'datetime': return 'date';
              default: return 'linear';
            }
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
              tickvals: uniqueCategories.map((_, index) => index), // Use 0-based indexing to match data
              ticktext: uniqueCategories,
              title: categoryCol
            };
          })() : {}),
          showgrid: (liveProps?.global?.showGridLines ?? true) && (liveProps?.global?.gridLineStyle !== 'none') && (liveProps?.global?.gridYMajor),
          gridcolor: hexToRgba(modeColors.gridColor, gridOpacity),
          gridwidth: inchToPx(liveProps?.global?.gridThicknessInch || 0.01),
          griddash: gridDash,
          zeroline: false,
          minor: {
            showgrid: (liveProps?.global?.showGridLines ?? true) && (liveProps?.global?.gridLineStyle !== 'none') && (liveProps?.global?.gridYMinor),
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
          },
          layer: liveProps?.global?.gridLayering === 'gridFront' ? 'above traces' : 'below traces',
          tickprefix: liveProps?.global?.majorTickPrefix || undefined,
          ticksuffix: liveProps?.global?.majorTickSuffix || undefined,
          showticklabels: liveProps?.global?.majorTickShowLeft || liveProps?.global?.majorTickShowRight,
          tickformat: ((): any => {
            const mode = liveProps?.global?.majorTickPrecisionMode;
            const prec = liveProps?.global?.majorTickPrecision ?? 2;
            const numeric = liveProps?.global?.majorTickNumericType;
            if (numeric === 'percent') return mode === 'manual' ? `.${prec}%` : '.%';
            if (numeric === 'scientific') return mode === 'manual' ? `.${prec}e` : '.e';
            if (numeric === 'engineering') return mode === 'manual' ? `.${prec}s` : '.s';
            return mode === 'manual' ? `.${prec}f` : undefined;
          })(),
          exponentformat: liveProps?.global?.majorTickExponentFormat,
          tickformatstops: liveProps?.global?.majorTickFactor && liveProps.global.majorTickFactor !== '1' ? [{ enabled: true, dtickrange: [null, null], value: liveProps.global.majorTickFactor }] : undefined,
          // Tick marks properties
          ticklen: Math.max(1, Math.floor(inchToPx(liveProps?.global?.majorTickLength || 0.1))),
          tickwidth: Math.max(1, Math.floor(inchToPx(liveProps?.global?.majorTickThickness || 0.01))),
          tickcolor: hexToRgba(liveProps?.global?.majorTickColor || '#444444', Math.max(0, Math.min(1, 1 - ((liveProps?.global?.majorTickTransparency || 0) / 100)))),
          ticks: (() => {
            const direction = liveProps?.global?.majorTickDirection || 'outward';
            switch (direction) {
              case 'none': return '';
              case 'inward': return 'inside';
              case 'outward': return 'outside';
              case 'both': return 'outside';
              default: return 'outside';
            }
          })(),
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
        },
        // Mirror Y axis to requested side by adjusting side and overlaying the opposite if needed
        // For simplicity, move y-axis side only
        // Note: traces remain anchored to 'y' axis by default
        margin: { l: liveProps?.global?.marginSize ?? 20, r: 16, t: 64, b: liveProps?.global?.padding ?? 16 },
        automargin: true,
        paper_bgcolor: finalPaperBg,
        plot_bgcolor: finalPlotBg,
      };

      // Enable in-plot editing of title and axis titles
      // Plotly supports editing when config.edits.* is enabled; but we also capture double-clicks
      const applyInlineEditing = () => {
        const root = containerRef.current as HTMLElement | null;
        if (!root) return;
        const dispatchUpdate = (key: 'graphName' | 'axisXData' | 'axisYData' | 'axisZData', value: string) => {
          // Find React context updater if exposed via window or custom event
          // As a minimal approach, modify liveProps directly is not possible; edits will re-render via parent state changes.
          const event = new CustomEvent('statpro:updateGraphProperty', { detail: { key, value } });
          window.dispatchEvent(event);
        };
        // Title double-click
        const titleEl = root.querySelector('g.gtitle') as SVGGElement | null;
        if (titleEl) {
          titleEl.addEventListener('dblclick', () => {
            const next = prompt('Edit graph title', liveTitle || getTitleText(subType) || '') || '';
            if (next) dispatchUpdate('graphName', next);
          });
        }
        // Axis titles (2D)
        const xTitleEl = root.querySelector('g.xg .xtitle') as SVGGElement | null;
        if (xTitleEl) {
          xTitleEl.addEventListener('dblclick', () => {
            const current = (liveProps?.global?.axisXData) || 'X axis';
            const next = prompt('Edit X axis title', current) || '';
            if (next) dispatchUpdate('axisXData', next);
          });
        }
        const yTitleEl = root.querySelector('g.yg .ytitle') as SVGGElement | null;
        if (yTitleEl) {
          yTitleEl.addEventListener('dblclick', () => {
            const current = (liveProps?.global?.axisYData) || 'Y axis';
            const next = prompt('Edit Y axis title', current) || '';
            if (next) dispatchUpdate('axisYData', next);
          });
        }
        // Z axis title (3D) - for 3D graphs
        if (has3DMeshTraces) {
          const zTitleEl = root.querySelector('g.scene .ztitle') as SVGGElement | null;
          if (zTitleEl) {
            zTitleEl.addEventListener('dblclick', () => {
              const current = (liveProps?.global?.axisZData) || 'Z';
              const next = prompt('Edit Z axis title', current) || '';
              if (next) dispatchUpdate('axisZData', next);
            });
          }
        }
      };

      // For category plots, merge category-specific axis settings
      if (isCategoryPlot && isCategoryFormat && categoryPlotResult) {
        // Merge category-specific axis settings while preserving all the comprehensive settings
        if (categoryPlotResult.layout.xaxis) {
          layout.xaxis = { ...layout.xaxis, ...categoryPlotResult.layout.xaxis };
        }
        if (categoryPlotResult.layout.yaxis) {
          layout.yaxis = { ...layout.yaxis, ...categoryPlotResult.layout.yaxis };
        }
      }

      // Add 3D scene configuration for 3D mesh plots
      if (has3DMeshTraces) {
        // Get axis titles from properties or fall back to column names
        const scene3DXTitle = (liveProps?.global?.showAxisLabels && liveProps?.global?.axisXData) 
          ? liveProps.global.axisXData 
          : (xNames[0] || 'X');
        const scene3DYTitle = (liveProps?.global?.showAxisLabels && liveProps?.global?.axisYData) 
          ? liveProps.global.axisYData 
          : (yNames[0] || 'Y');
        const scene3DZTitle = (liveProps?.global?.showAxisLabels && liveProps?.global?.axisZData) 
          ? liveProps.global.axisZData 
          : 'Z';
        
        layout.scene = {
          xaxis: { 
            title: scene3DXTitle,
            // Ensure X-axis goes from low to high (left to right)
            autorange: true,
            showgrid: true,
            zeroline: false,
            // Ensure proper orientation: low values on left, high on right
            tickmode: 'auto',
            nticks: 12, // Extra scale - more tick marks
            // Professional canvas mode colors - 3D grid color based on mode
            gridcolor: canvasMode === 'dark' ? '#333333' : 'white',
            color: modeColors.axisTextColor,
            titlefont: { color: modeColors.axisTextColor },
            // Default Plotly 3D background - different for light/dark mode
            backgroundcolor: canvasMode === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(230, 230, 250)',
            showbackground: true
          },
          yaxis: { 
            title: scene3DYTitle,
            // Ensure Y-axis goes from low to high (front to back)
            autorange: true,
            showgrid: true,
            zeroline: false,
            // Ensure proper orientation: low values in front, high in back
            tickmode: 'auto',
            nticks: 12, // Extra scale - more tick marks
            // Professional canvas mode colors - 3D grid color based on mode
            gridcolor: canvasMode === 'dark' ? '#333333' : 'white',
            color: modeColors.axisTextColor,
            titlefont: { color: modeColors.axisTextColor },
            // Default Plotly 3D background - different for light/dark mode
            backgroundcolor: canvasMode === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(230, 230, 250)',
            showbackground: true
          },
          zaxis: { 
            title: scene3DZTitle,
            // Ensure Z-axis goes from low to high (bottom to top)
            autorange: true,
            showgrid: true,
            zeroline: false,
            // Ensure proper Z-axis scaling with single range
            tickmode: 'auto',
            nticks: 12, // Extra scale - more tick marks
            // Professional canvas mode colors - 3D grid color based on mode
            gridcolor: canvasMode === 'dark' ? '#333333' : 'white',
            color: modeColors.axisTextColor,
            titlefont: { color: modeColors.axisTextColor },
            // Default Plotly 3D background - different for light/dark mode
            backgroundcolor: canvasMode === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(230, 230, 250)',
            showbackground: true
          },
          camera: {
            // Front view with X-axis on right, Y-axis on left - positioned to show proper axis orientation
            // X: -1.2 (rotated left to show X-axis on right), Y: -2.0 (front view), Z: 0.8 (elevated for better axis visibility)
            eye: { x: -1.2, y: -2.0, z: 0.8 },
            center: { x: 0, y: 0, z: 0 },
            up: { x: 0, y: 0, z: 1 }
          },
          // Enable proper 3D interaction
          aspectmode: 'auto',
          bgcolor: finalPlotBg
        };
        // Remove 2D axes for 3D plots
        delete layout.xaxis;
        delete layout.yaxis;
      }

      // Apply category plot layout configuration for X Category and Y Category formats
      if (isCategoryPlot && isCategoryFormat && (normalizedFormat === 'X Category' || normalizedFormat === 'Y Category')) {
        console.log(`🔍 Applying category plot layout for format: ${normalizedFormat}`);
        
        // Use the imported category plot layout function
        
        const categoryConfig = {
          rows,
          xCol: xNames?.[0],
          yCol: yNames?.[0],
          categoryCol: categoryNames?.[0]
        };
        
        // Apply category plot layout
        layout = getCategoryPlotLayout(categoryConfig, layout);
        console.log(`✅ Applied category plot layout:`, {
          xAxisTitle: layout.xaxis?.title,
          yAxisTitle: layout.yaxis?.title,
          xAxisTickMode: layout.xaxis?.tickmode,
          yAxisTickMode: layout.yaxis?.tickmode
        });
      }

      // Add annotations if needed
      const annotations = getAnnotations(subType);
      if (annotations.length > 0) {
        layout.annotations = annotations;
      }

      const allowDragResize = (liveProps?.global?.legendAllowDragResize ?? true) && !(liveProps?.global?.legendLock);
      const config = { 
        responsive: true, 
        edits: { legendPosition: allowDragResize, titleText: true, axisTitleText: true },
        // Replace Plotly logo with Stat Pro logo
        displaylogo: false,  // Hide the default Plotly logo
        watermark: false,    // Disable Plotly watermark
        // Enable mode bar for 3D camera controls
        displayModeBar: true,
        modeBarButtonsToRemove: [], // Keep all default buttons including camera reset
        modeBarButtonsToAdd: [],    // No additional buttons needed
        // Add custom watermark/logo (optional - you can add your own logo here)
        // watermark: {
        //   text: 'Stat Pro',
        //   font: { color: 'rgba(0,0,0,0.3)', size: 12 },
        //   xref: 'paper', yref: 'paper',
        //   x: 0.02, y: 0.02, showarrow: false
        // }
      } as any;
      
      
      if (containerRef.current) {
        (plot as any).graph.current = containerRef.current;
        const payload = { data: traces, layout, config } as any;
        
        console.log(`🎨 Rendering plot with ${traces.length} traces:`, {
          subType: graphConfig?.subType,
          traceTypes: traces.map(t => ({ 
            type: t.type, 
            mode: t.mode, 
            name: t.name,
            hasLine: !!t.line,
            hasMarker: !!t.marker,
            dataLength: t.x?.length || 0,
            lineColor: t.line?.color,
            lineWidth: t.line?.width,
            // 3D Mesh specific debugging
            colorscale: t.colorscale,
            hasIntensity: !!t.intensity,
            intensityLength: t.intensity?.length,
            intensityMin: t.intensity ? Math.min(...t.intensity) : 'N/A',
            intensityMax: t.intensity ? Math.max(...t.intensity) : 'N/A',
            intensityRange: t.intensity ? `${Math.min(...t.intensity).toFixed(2)} to ${Math.max(...t.intensity).toFixed(2)}` : 'N/A',
            zMin: t.zmin,
            zMax: t.zmax,
            opacity: t.opacity,
            flatshading: t.flatshading,
            // Debug Z matrix structure
            zMatrixLength: t.z?.length,
            zMatrixFirstRowLength: t.z?.[0]?.length,
            // Debug color scale consistency
            hasColorscale: !!t.colorscale,
            colorscaleValue: t.colorscale
          }))
        });
        
        // Check specifically for regression traces
        const regressionTraces = traces.filter(t => t.name?.includes('fit') || t.name?.includes('Regression') || t.name?.includes('Test Line'));
        if (regressionTraces.length > 0) {
          console.log(`📈 Found ${regressionTraces.length} regression traces:`, regressionTraces.map(t => ({
            name: t.name,
            lineColor: t.line?.color,
            lineWidth: t.line?.width,
            dataPoints: t.x?.length || 0,
            mode: t.mode,
            type: t.type
          })));
        } else {
          console.log(`❌ No regression traces found in final traces array`);
          console.log(`🔍 All trace names:`, traces.map(t => t.name));
        }
        
        lastPlotRef.current = payload;
        plot.redraw(payload);
        
        
        // Attach inline editing listeners after initial draw
        try {
          applyInlineEditing();
          
          
          // Also wire canvas-level context menu to open properties via an option
          const root = containerRef.current as HTMLElement | null;
          if (root) {
            let menuEl: HTMLDivElement | null = null;
            const disposeMenu = () => {
              if (menuEl && menuEl.parentElement) menuEl.parentElement.removeChild(menuEl);
              menuEl = null;
              document.removeEventListener('click', onDocClick, true);
              document.removeEventListener('keydown', onKeyDown, true);
            };
            const onDocClick = () => disposeMenu();
            const onKeyDown = (ev: KeyboardEvent) => { if (ev.key === 'Escape') disposeMenu(); };
            const onContextMenu = (e: MouseEvent) => {
              e.preventDefault();
              // Block any other contextmenu listeners from auto-opening properties
              if (typeof (e as any).stopImmediatePropagation === 'function') {
                (e as any).stopImmediatePropagation();
              }
              disposeMenu();
              menuEl = document.createElement('div');
              menuEl.style.position = 'fixed';
              menuEl.style.left = `${e.clientX}px`;
              menuEl.style.top = `${e.clientY}px`;
              menuEl.style.zIndex = '9999';
              // Theme-aware styling based on actual app background luminance
              const getPageBg = (): string => {
                try {
                  const root = document.documentElement;
                  const csRoot = window.getComputedStyle(root);
                  const rootBg = csRoot.getPropertyValue('background-color');
                  if (rootBg && rootBg !== 'rgba(0, 0, 0, 0)' && rootBg !== 'transparent') return rootBg.trim();
                  const csBody = window.getComputedStyle(document.body);
                  const bodyBg = csBody.getPropertyValue('background-color');
                  if (bodyBg) return bodyBg.trim();
                } catch {}
                return '#ffffff';
              };
              const parseRgb = (c: string): { r: number; g: number; b: number } => {
                if (c.startsWith('#')) {
                  const h = c.replace('#','');
                  const r = parseInt(h.substring(0,2),16);
                  const g = parseInt(h.substring(2,4),16);
                  const b = parseInt(h.substring(4,6),16);
                  return { r,g,b };
                }
                const parts = c.replace(/rgba?\(|\)|\s/g,'').split(',');
                return { r: parseInt(parts[0]||'255',10), g: parseInt(parts[1]||'255',10), b: parseInt(parts[2]||'255',10) };
              };
              const bgCol = getPageBg();
              const { r:pr, g:pg, b:pb } = parseRgb(bgCol);
              const lum = (0.2126*pr + 0.7152*pg + 0.0722*pb) / 255;
              const isDark = lum < 0.5;
              const bgColor = isDark ? '#1f1f1f' : '#ffffff';
              const textColor = isDark ? '#f3f3f3' : '#111111';
              menuEl.style.background = bgColor;
              menuEl.style.color = textColor;
              menuEl.style.border = isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.15)';
              menuEl.style.boxShadow = isDark ? '0 6px 16px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.12)';
              menuEl.style.borderRadius = '6px';
              menuEl.style.minWidth = '180px';
              menuEl.style.padding = '4px';
              const item = document.createElement('div');
              item.textContent = 'Graph Properties';
              item.style.padding = '8px 12px';
              item.style.cursor = 'pointer';
              item.style.background = 'transparent';
              item.style.color = textColor;
              item.addEventListener('mouseenter', () => { item.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'; });
              item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
              item.addEventListener('click', () => {
                const ev = new CustomEvent('statpro:openGraphProperties');
                window.dispatchEvent(ev);
                disposeMenu();
              });
              menuEl.appendChild(item);
              document.body.appendChild(menuEl);
              setTimeout(() => {
                document.addEventListener('click', onDocClick, true);
                document.addEventListener('keydown', onKeyDown, true);
              }, 0);
            };
            // Remove any inline handler and add our handler in capture phase to override others
            (root as any).oncontextmenu = null;
            root.addEventListener('contextmenu', onContextMenu, true);
          }
        } catch {}
      } else {
        // Retry with exponential backoff
        let retryCount = 0;
        const maxRetries = 10;
        const retry = () => {
          if (retryCount < maxRetries && !containerRef.current) {
            retryCount++;
            setTimeout(() => {
              if (containerRef.current && lastPlotRef.current) {
                (plot as any).graph.current = containerRef.current;
                plot.redraw(lastPlotRef.current as any);
              } else {
                retry();
              }
            }, 100 * retryCount); // Exponential backoff
          }
        };
        retry();
      }

      // Save plot payload best-effort to filesystem (DB is the source of truth)
      const projectPath = workspacePath || '';
      await ensureGraphFolderAndSave(projectPath, { graphConfig, traces, layout });
    };
    
    run().catch((error) => {
      console.error('Graph generation error:', error);
    }).finally(() => {
      // Clear the loading timeout and hide loading state
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setIsLoading(false);
    });
  }, [graphConfig, workspacePath, liveProps]);

  // When the container becomes visible again or resizes, redraw using cached payload
  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    const tryRedraw = () => {
      if (!div || !lastPlotRef.current) return;
      (plot as any).graph.current = div;
      plot.redraw(lastPlotRef.current as any);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          tryRedraw();
        }
      });
    }, { threshold: 0.1 });
    io.observe(div);

    const ResizeObs: any = (window as any).ResizeObserver;
    const ro = ResizeObs ? new ResizeObs(() => tryRedraw()) : null;
    if (ro) { ro.observe(div); }

    const onFocus = () => tryRedraw();
    const onResize = () => tryRedraw();
    window.addEventListener('focus', onFocus);
    window.addEventListener('resize', onResize);

    return () => {
      io.disconnect();
      ro && ro.disconnect();
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('resize', onResize);
    };
  }, [plot]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400, position: 'relative' }} ref={containerRef}>
              <GraphLoader 
                isVisible={isLoading} 
              />
    </div>
  );
});
