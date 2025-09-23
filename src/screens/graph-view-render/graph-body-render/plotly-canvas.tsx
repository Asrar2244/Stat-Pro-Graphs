import { FC, useEffect, useRef } from 'react';
import { usePlotly } from '@hooks/plotly';
import { Database } from '@utils';
import { ensureGraphFolderAndSave } from './plotly-save';
import { insertGraphRun } from './graphs-store';
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
        
        const colorOverride = (liveProps?.plotSpecific?.scatter?.pointColor) || (liveProps?.global?.seriesColor);
        const color = colorOverride || getSeriesColor(seriesIndex);
        const symbol = getSeriesSymbol(seriesIndex);
        
        try {
          // Create scatter trace with optimized data
          const scatterTrace = createScatterTrace({
            xv: optimizedData.xv,
            yv: optimizedData.yv,
            label: optimizedData.optimizationMethod !== 'none' 
              ? `${label} (${optimizedData.optimizationMethod}, ${optimizedData.optimizedLength}/${optimizedData.originalLength})`
              : label,
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
          const fallbackTrace = {
            x: optimizedData.xv.slice(0, 1000), // Limit to 1000 points
            y: optimizedData.yv.slice(0, 1000),
            type: 'scatter',
            mode: 'markers',
            name: `${label} (fallback)`,
            marker: { color, size: 4, opacity: 0.6 },
            showlegend: true
          };
          traces.push(fallbackTrace);
        }
        
        // Add regression traces if needed (use optimized data for better performance)
        try {
          const regressionTraces = createRegressionTracesIfNeeded(
            optimizedData.xv, 
            optimizedData.yv, 
            label, 
            (liveProps?.plotSpecific?.regression?.lineColor) || color, 
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
      const paperBg = liveProps?.global?.backgroundColor || undefined;
      const plotBg = liveProps?.global?.plotColor || paperBg;
      // Axis labels: keep defaults, but allow override when provided
      const axisXTitle = liveProps?.global?.showAxisLabels && liveProps?.global?.axisXData
        ? { text: liveProps.global.axisXData }
        : undefined;
      const axisYTitle = liveProps?.global?.showAxisLabels && liveProps?.global?.axisYData
        ? { text: liveProps.global.axisYData }
        : undefined;
      
      let layout: any = {
        title: {
          text: liveTitle || getTitleText(subType),
          font: { size: 18, family: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif', color: '#111' },
          x: 0.5,
          xanchor: 'center',
          y: 0.98,
          yanchor: 'top',
          pad: { t: 8, b: 4, l: 0, r: 0 },
        },
        autosize: true,
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
        },
        xaxis: {
          ...getAxisConfig(subType, 'x'),
          title: axisXTitle ? { ...axisXTitle, standoff: 12 } : undefined,
          showgrid: liveProps?.global?.showGridLines ?? true,
          ticklen: 6,
          ticks: 'outside',
          automargin: true,
        },
        yaxis: {
          ...getAxisConfig(subType, 'y'),
          title: axisYTitle ? { ...axisYTitle, standoff: 12 } : undefined,
          showgrid: liveProps?.global?.showGridLines ?? true,
          ticklen: 6,
          ticks: 'outside',
          automargin: true,
        },
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
        try { applyInlineEditing(); } catch {}
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

      // Save config into project Graphs folder
      const projectPath = workspacePath || '';
      await ensureGraphFolderAndSave(projectPath, { graphConfig, traces, layout });
      await insertGraphRun(projectPath, {
        name: graphConfig?.subType || 'Scatter Plot',
        createdAt: new Date().toISOString(),
        config: { graphConfig, traces, layout },
        tabName: graphConfig?.selectedProject || '',
        graphType: graphConfig?.graphType || 'Scatter Plot',
      });
      
      // Set flag to auto-select the latest graph when Graphs tab opens
      setRenderLatestRun(true);
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
