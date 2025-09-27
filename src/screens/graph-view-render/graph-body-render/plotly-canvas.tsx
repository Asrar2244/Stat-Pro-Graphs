import { FC, useEffect, useRef } from 'react';
import { usePlotly } from '@hooks/plotly';
import { Database } from '@utils';
import { ensureGraphFolderAndSave } from './plotly-save';
import { EXCEL } from '@constants';
import { useStartProStore } from '@store/main-store';

// Import utility modules
import { getLegendConfig, getTitleText, getAxisConfig, getAnnotations } from './utils/layoutConfig';
import { getSeriesConfig } from './utils/traceGeneration';
import { createScatterTrace, createRegressionTracesIfNeeded, createDotPlotDottedLines } from './utils/traceGeneration';
import { processDataByFormat } from './utils/dataProcessing';
import { assessDataQuality } from './utils/dataValidation';
import { optimizeDataForPerformance, measurePerformance, optimizeTraceForLargeData, getPerformanceRecommendations } from './utils/performanceOptimization';

export const GraphCanvas: FC<any> = ({ graphConfig, workspacePath, liveProps }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plot = usePlotly({ data: [], layout: { title: graphConfig?.subType || 'Scatter Plot', autosize: true } as any, config: { responsive: true } } as any);
  // Keep last successful plot payload to restore on visibility/resize
  const lastPlotRef = useRef<{ data: any[]; layout: any; config: any } | null>(null);
  const { setRenderLatestRun } = useStartProStore();

  // Build data arrays from project DB based on selected variables
  useEffect(() => {
    const run = async () => {
      console.log('🔍 GraphCanvas useEffect triggered');
      console.log('graphConfig:', graphConfig);
      console.log('workspacePath:', workspacePath);
      
      if (!graphConfig?.selectedProject || !graphConfig?.variables) {
        console.log('❌ Missing graphConfig.selectedProject or graphConfig.variables');
        return;
      }
      
      console.log('✅ Graph config validation passed');
      console.log('selectedProject:', graphConfig.selectedProject);
      console.log('variables:', graphConfig.variables);
      
      const db = new Database(workspacePath || graphConfig.selectedProject);
      const cols = [...(graphConfig.variables?.x || []), ...(graphConfig.variables?.y || []), ...(graphConfig.variables?.category || [])];
      
      // Add error bar variable if needed
      if (graphConfig?.errorBarVariable && !cols.includes(graphConfig.errorBarVariable)) {
        cols.push(graphConfig.errorBarVariable);
        console.log('🔍 Added error bar variable to columns:', graphConfig.errorBarVariable);
      }
      
      if (cols.length === 0) {
        console.log('❌ No columns selected');
        return;
      }
      
      console.log('✅ Columns to fetch:', cols);
      const colList = cols.map((c: string) => `"${c}"`).join(',');
      const rows = await db.selectQuery(`SELECT ${colList} FROM ${EXCEL};`);

      console.log('✅ Database query completed');
      console.log('Rows count:', rows.length);
      console.log('First few rows:', rows.slice(0, 3));
      console.log('🔍 Error bar variable in data:', graphConfig?.errorBarVariable, 'Sample values:', rows.slice(0, 3).map((row: any) => row[graphConfig?.errorBarVariable || '']));

      // Selected columns by role
      const xNames = (graphConfig.variables?.x as string[]) || [];
      const yNames = (graphConfig.variables?.y as string[]) || [];
      const categoryNames = (graphConfig.variables?.category as string[]) || [];
      console.log('xNames:', xNames);
      console.log('yNames:', yNames);
      console.log('categoryNames:', categoryNames);

      // Plotly traces accumulator
      const traces: any[] = [];
      
      // Get series configuration
      const seriesConfig = getSeriesConfig();
      const getSeriesColor = (i: number) => seriesConfig.colors[i % seriesConfig.colors.length];
      const getSeriesSymbol = (i: number) => seriesConfig.symbols[i % seriesConfig.symbols.length];

      let seriesIndex = 0;
      
      // Process data based on format (normalize Single X/Y to axis-anchored formats when both sides are provided)
      let normalizedFormat = graphConfig?.dataFormat;
      // If Single X with both X and Y present → behave as X Many Y
      if (normalizedFormat === 'Single X' && xNames?.length > 0 && yNames?.length > 0) {
        normalizedFormat = 'X Many Y';
      } else if (normalizedFormat === 'Single Y' && xNames?.length > 0 && yNames?.length > 0) {
        normalizedFormat = 'Y Many X';
      }
      // Respect whichever variables the user passed:
      // - If Single X but only Y provided → treat as Single Y (plot Y vs index)
      // - If Single Y but only X provided → treat as Single X (plot X vs index)
      if (normalizedFormat === 'Single X' && (!xNames || xNames.length === 0) && (yNames && yNames.length > 0)) {
        normalizedFormat = 'Single Y';
      } else if (normalizedFormat === 'Single Y' && (!yNames || yNames.length === 0) && (xNames && xNames.length > 0)) {
        normalizedFormat = 'Single X';
      }

      const processedSeries = processDataByFormat({
        graphConfig: { ...graphConfig, dataFormat: normalizedFormat },
        rows,
        xNames,
        yNames,
        categoryNames
      });

      // Collect legend labels for editing
      const legendLabels = processedSeries.map(s => s.label);
      
      // Store legend labels in the graph config for the properties panel
      if (legendLabels.length > 0) {
        graphConfig.legendLabels = legendLabels;
        
        // Save legend labels back to the database
        try {
          const { updateGraphRunConfig } = await import('@backend/graphs');
          const currentRunId = graphConfig.runId || graphConfig.id;
          if (currentRunId) {
            await updateGraphRunConfig(workspacePath, currentRunId, { 
              graphConfig: { ...graphConfig, legendLabels } 
            });
            console.log('💾 Saved legend labels to database:', legendLabels);
          }
        } catch (error) {
          console.warn('⚠️ Failed to save legend labels to database:', error);
        }
      }

      // Assess data quality and provide recommendations
      processedSeries.forEach(({ xv, yv, label }) => {
        const qualityReport = assessDataQuality(xv, yv, {
          outlierMethod: 'iqr',
          outlierThreshold: 1.5,
          missingValueThreshold: 0.1,
          minSampleSize: 3
        });
        
        if (!qualityReport.isValid) {
          console.warn(`⚠️ Data quality issues for series "${label}":`, qualityReport.warnings);
          console.info(`💡 Recommendations:`, qualityReport.recommendations);
        }
        
        // Log data quality summary
        console.log(`📊 Data Quality Report for "${label}":`, {
          sampleSize: xv.length,
          outliers: qualityReport.outliers.length,
          missingValues: qualityReport.missingValues.length,
          isValid: qualityReport.isValid
        });
      });

      // Helper: axis transforms for special scales
      const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
      const probEps = 1e-12;
      const invNormApprox = (p: number) => {
        // Acklam's approximation for inverse normal CDF (probit)
        // Reference: https://web.archive.org/web/20150910044740/http://home.online.no/~pjacklam/notes/invnorm/
        const a1 = -3.969683028665376e+01;
        const a2 =  2.209460984245205e+02;
        const a3 = -2.759285104469687e+02;
        const a4 =  1.383577518672690e+02;
        const a5 = -3.066479806614716e+01;
        const a6 =  2.506628277459239e+00;
        const b1 = -5.447609879822406e+01;
        const b2 =  1.615858368580409e+02;
        const b3 = -1.556989798598866e+02;
        const b4 =  6.680131188771972e+01;
        const b5 = -1.328068155288572e+01;
        const c1 = -7.784894002430293e-03;
        const c2 = -3.223964580411365e-01;
        const c3 = -2.400758277161838e+00;
        const c4 = -2.549732539343734e+00;
        const c5 =  4.374664141464968e+00;
        const c6 =  2.938163982698783e+00;
        const d1 =  7.784695709041462e-03;
        const d2 =  3.224671290700398e-01;
        const d3 =  2.445134137142996e+00;
        const d4 =  3.754408661907416e+00;
        const plow  = 0.02425;
        const phigh = 1 - plow;
        let q: number, r: number;
        if (p < plow) {
          q = Math.sqrt(-2 * Math.log(p));
          return (((((c1*q + c2)*q + c3)*q + c4)*q + c5)*q + c6)/((((d1*q + d2)*q + d3)*q + d4)*q + 1);
        }
        if (phigh < p) {
          q = Math.sqrt(-2 * Math.log(1 - p));
          return -(((((c1*q + c2)*q + c3)*q + c4)*q + c5)*q + c6)/((((d1*q + d2)*q + d3)*q + d4)*q + 1);
        }
        q = p - 0.5;
        r = q * q;
        return (((((a1*r + a2)*r + a3)*r + a4)*r + a5)*r + a6)*q/(((((b1*r + b2)*r + b3)*r + b4)*r + b5)*r + 1);
      };
      const transformAxisValue = (v: number, scale?: string): number => {
        if (v == null || Number.isNaN(v)) return v as any;
        switch (scale) {
          case 'reciprocal': {
            return v === 0 ? NaN : 1 / v;
          }
          case 'logit': {
            const p = clamp(v, probEps, 1 - probEps);
            return Math.log(p / (1 - p));
          }
          case 'probit': {
            const p = clamp(v, probEps, 1 - probEps);
            return invNormApprox(p);
          }
          case 'weibull': {
            // y = ln(-ln(1 - p)) on a Weibull probability plot
            const p = clamp(v, probEps, 1 - probEps);
            return Math.log(-Math.log(1 - p));
          }
          case 'probability':
          default:
            return v;
        }
      };
      const transformArrayForScale = (arr: number[], scale?: string) => (Array.isArray(arr) ? arr.map((v) => transformAxisValue(v as any, scale)) : arr);

      // Create traces for each series with performance optimization
      processedSeries.forEach(({ xv, yv, label }) => {
        const startTime = performance.now();
        
        console.log(`🔍 Processing series "${label}" with ${xv.length} points`);
        
        // Optimize data for large datasets with better configuration for very large datasets
        const optimizedData = optimizeDataForPerformance(xv, yv, {
          maxPointsPerTrace: 15000, // Increased for better visualization
          enableSampling: true,
          enableDecimation: true,
          enableProgressiveRendering: true,
          samplingThreshold: 5000,
          decimationFactor: 2,
          performanceWarningThreshold: 50000
        });
        
        console.log(`✅ Optimization result for "${label}":`, {
          original: optimizedData.originalLength,
          optimized: optimizedData.optimizedLength,
          method: optimizedData.optimizationMethod,
          reduction: `${((1 - optimizedData.optimizedLength / optimizedData.originalLength) * 100).toFixed(1)}%`
        });
        
        // Log performance metrics
        const processingTime = performance.now() - startTime;
        const performanceMetrics = measurePerformance(optimizedData.originalLength, processingTime);
        
        console.log(`📊 Performance Metrics for "${label}":`, {
          originalSize: optimizedData.originalLength,
          optimizedSize: optimizedData.optimizedLength,
          optimizationMethod: optimizedData.optimizationMethod,
          processingTime: `${processingTime.toFixed(2)}ms`,
          performanceScore: performanceMetrics.performanceScore,
          optimizationApplied: performanceMetrics.optimizationApplied
        });
        
        // Show performance warnings
        if (optimizedData.performanceWarning) {
          console.warn(`⚠️ Performance Warning for "${label}":`, optimizedData.performanceWarning);
        }
        
        // Show performance recommendations
        const recommendations = getPerformanceRecommendations(optimizedData.originalLength);
        if (recommendations.length > 0) {
          console.info(`💡 Performance Recommendations for "${label}":`, recommendations);
        }
        
        // Per-series color override: legendSeriesColors[label] > plot-specific color > global seriesColor
        const perSeriesColor = liveProps?.global?.legendSeriesColors?.[label];
        const colorOverride = perSeriesColor || (liveProps?.plotSpecific?.scatter?.pointColor) || (liveProps?.global?.seriesColor);
        const color = colorOverride || getSeriesColor(seriesIndex);
        const symbol = getSeriesSymbol(seriesIndex);
        
        // Apply axis transforms for special scales (keep axes type linear; data transformed)
        const xScale = liveProps?.global?.xScaleType;
        const yScale = liveProps?.global?.yScaleType;
        const tx = transformArrayForScale(optimizedData.xv as any, xScale);
        const ty = transformArrayForScale(optimizedData.yv as any, yScale);
        try {
          // Create scatter trace with optimized data
          const customLabel = liveProps?.global?.legendTextEntries?.[label] || label;
          const scatterTrace = createScatterTrace({
            xv: tx as any,
            yv: ty as any,
            label: optimizedData.optimizationMethod !== 'none' 
              ? `${customLabel} (${optimizedData.optimizationMethod}, ${optimizedData.optimizedLength}/${optimizedData.originalLength})`
              : customLabel,
            color,
            symbol,
            subType: graphConfig?.subType || '',
            symbolValue: graphConfig?.symbolValue,
            errorCalculationUpper: graphConfig?.errorCalculationUpper,
            errorCalculationLower: graphConfig?.errorCalculationLower,
            errorBarVariable: graphConfig?.errorBarVariable,
            errorBarData: undefined, // Will be calculated in createScatterTrace
            rows
          });
          
          // Optimize trace for large datasets
          const optimizedTrace = optimizeTraceForLargeData(scatterTrace, optimizedData.originalLength);
          traces.push(optimizedTrace);
          
          console.log(`✅ Successfully created trace for "${label}" with ${optimizedTrace.x?.length || optimizedTrace.xv?.length || 0} points`);
        } catch (error) {
          console.error(`❌ Error creating trace for "${label}":`, error);
          // Create a fallback trace with minimal data
          const customLabel = liveProps?.global?.legendTextEntries?.[label] || label;
          const fallbackTrace = {
            x: optimizedData.xv.slice(0, 1000), // Limit to 1000 points
            y: optimizedData.yv.slice(0, 1000),
            type: 'scatter',
            mode: 'markers',
            name: `${customLabel} (fallback)`,
            marker: { color, size: 4, opacity: 0.6 },
            showlegend: true
          };
          traces.push(fallbackTrace);
        }
        
        // Add regression traces if needed (use optimized data for better performance)
        try {
          const customLabel = liveProps?.global?.legendTextEntries?.[label] || label;
          const regressionTraces = createRegressionTracesIfNeeded(
            tx as any,
            ty as any,
            customLabel, 
            // Use same per-series override for regression line if not explicitly set
            (liveProps?.plotSpecific?.regression?.lineColor) || perSeriesColor || color, 
            graphConfig?.subType || ''
          );
          traces.push(...regressionTraces);
        } catch (error) {
          console.warn(`⚠️ Error creating regression traces for "${label}":`, error);
        }
        
        // Add dotted lines for dot plots (limit for large datasets)
        try {
          const dottedLines = optimizedData.originalLength > 10000 
            ? [] // Skip dotted lines for very large datasets
            : createDotPlotDottedLines(
                optimizedData.xv,
                optimizedData.yv,
                color,
                graphConfig?.subType || ''
              );
          traces.push(...dottedLines);
        } catch (error) {
          console.warn(`⚠️ Error creating dotted lines for "${label}":`, error);
        }
        
        seriesIndex += 1;
      });

      // Check if we have any traces to plot
      if (traces.length === 0) {
        console.error('❌ No traces created - cannot plot graph');
        return;
      }
      
      console.log(`📊 Total traces created: ${traces.length}`);
      traces.forEach((trace, index) => {
        console.log(`  Trace ${index + 1}: ${trace.name || 'Unnamed'} - ${trace.x?.length || trace.xv?.length || 0} points`);
      });

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
      
      // Debug break properties
      console.log('🔍 Break Properties Debug:', {
        showBreak: liveProps?.global?.showBreak,
        omitRangeStart: liveProps?.global?.omitRangeStart,
        omitRangeEnd: liveProps?.global?.omitRangeEnd,
        breakPosition: liveProps?.global?.breakPosition,
        gapWidth: liveProps?.global?.gapWidth,
        breakSymbol: liveProps?.global?.breakSymbol,
        breakLength: liveProps?.global?.breakLength,
        breakThickness: liveProps?.global?.breakThickness,
        breakColor: liveProps?.global?.breakColor,
        breakTransparency: liveProps?.global?.breakTransparency
      });
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
      let layout: any = {
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
        xaxis: {
          ...getAxisConfig(subType, 'x'),
          title: axisXTitle ? { ...axisXTitle, standoff: 12 } : undefined,
          showline: true,
          linecolor: axisLineColor,
          linewidth: axisLineWidthPx,
          type: ((): any => {
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
          showgrid: (liveProps?.global?.showGridLines ?? true) && (liveProps?.global?.gridLineStyle !== 'none') && (liveProps?.global?.gridXMajor),
          gridcolor: hexToRgba(liveProps?.global?.gridColor, gridOpacity),
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
                console.log('🔍 Applying X-axis break:', {
                  showBreak: liveProps?.global?.showBreak,
                  omitRangeStart: liveProps?.global?.omitRangeStart,
                  omitRangeEnd: liveProps?.global?.omitRangeEnd
                });
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
          ...getAxisConfig(subType, 'y'),
          title: axisYTitle ? { ...axisYTitle, standoff: 12 } : undefined,
          showline: true,
          linecolor: axisLineColor,
          linewidth: axisLineWidthPx,
          side: (liveProps?.global?.yAxisSide === 'right') ? 'right' : 'left',
          type: ((): any => {
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
          showgrid: (liveProps?.global?.showGridLines ?? true) && (liveProps?.global?.gridLineStyle !== 'none') && (liveProps?.global?.gridYMajor),
          gridcolor: hexToRgba(liveProps?.global?.gridColor, gridOpacity),
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
                console.log('🔍 Applying Y-axis break:', {
                  showBreak: liveProps?.global?.showBreak,
                  omitRangeStart: liveProps?.global?.omitRangeStart,
                  omitRangeEnd: liveProps?.global?.omitRangeEnd
                });
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
        paper_bgcolor: paperBg,
        plot_bgcolor: plotBg,
      };

      // Enable in-plot editing of title and axis titles
      // Plotly supports editing when config.edits.* is enabled; but we also capture double-clicks
      const applyInlineEditing = () => {
        const root = containerRef.current as HTMLElement | null;
        if (!root) return;
        const dispatchUpdate = (key: 'graphName' | 'axisXData' | 'axisYData', value: string) => {
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
        // Axis titles
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
      };

      // Add annotations if needed
      const annotations = getAnnotations(subType);
      if (annotations.length > 0) {
        layout.annotations = annotations;
      }

      const allowDragResize = (liveProps?.global?.legendAllowDragResize ?? true) && !(liveProps?.global?.legendLock);
      const config = { responsive: true, edits: { legendPosition: allowDragResize, titleText: true, axisTitleText: true } } as any;
      
      console.log('🎯 Final plotting data:');
      console.log('Traces count:', traces.length);
      console.log('Traces:', traces);
      console.log('Layout:', layout);
      
      if (containerRef.current) {
        (plot as any).graph.current = containerRef.current;
        const payload = { data: traces, layout, config } as any;
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
        console.log('✅ Plot redraw completed');
      } else {
        console.log('❌ Container ref not available');
        // Retry shortly if ref isn't attached yet (e.g., first paint race)
        setTimeout(() => {
          const div = containerRef.current;
          if (div && lastPlotRef.current) {
            (plot as any).graph.current = div;
            plot.redraw(lastPlotRef.current as any);
          }
        }, 50);
      }

      // Save plot payload best-effort to filesystem (DB is the source of truth)
      const projectPath = workspacePath || '';
      await ensureGraphFolderAndSave(projectPath, { graphConfig, traces, layout });
    };
    run();
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

  return <div style={{ width: '100%', height: '100%', minHeight: 400 }} ref={containerRef} />;
};
