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

export const GraphCanvas: FC<any> = ({ graphConfig, workspacePath }) => {
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
      
      // Process data based on format
      const processedSeries = processDataByFormat({
        graphConfig,
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
        
        const color = getSeriesColor(seriesIndex);
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
            color, 
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
      
      let layout: any = {
        title: {
          text: getTitleText(subType),
          font: { size: 16 }
        },
        autosize: true,
        showlegend: true,
        legend: getLegendConfig(subType),
        xaxis: getAxisConfig(subType, 'x'),
        yaxis: getAxisConfig(subType, 'y')
      };

      // Add annotations if needed
      const annotations = getAnnotations(subType);
      if (annotations.length > 0) {
        layout.annotations = annotations;
      }

      const config = { responsive: true } as any;
      
      console.log('🎯 Final plotting data:');
      console.log('Traces count:', traces.length);
      console.log('Traces:', traces);
      console.log('Layout:', layout);
      
      if (containerRef.current) {
        (plot as any).graph.current = containerRef.current;
        const payload = { data: traces, layout, config } as any;
        lastPlotRef.current = payload;
        plot.redraw(payload);
        console.log('✅ Plot redraw completed');
      } else {
        console.log('❌ Container ref not available');
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
  }, [graphConfig, workspacePath]);

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
