/**
 * Trace Orchestrator
 * Handles the complete trace generation pipeline including optimization, 
 * transformation, and regression traces
 */

import {
  getSeriesConfig,
  createTrace,
  createRegressionTracesIfNeeded
} from '../traceGeneration';
import { createDotPlotDottedLines } from '../scatter';
import {
  assessDataQuality,
  optimizeDataForPerformance,
  measurePerformance,
  optimizeTraceForLargeData,
  getPlotProperties,
  applyScatterProperties,
  applyRegressionProperties,
  applyErrorBarProperties
} from '../common';
import { applyMesh3DProperties } from '../mesh3DProperties';
import { transformArrayForScale } from '../axisTransforms';
import { is3DMeshTrace } from '../common/plotlyCommon';
import { plotWithCategory } from '../categoryScatterPlot';
import { optimizeTraceForWebGL } from '../webglOptimization';

export interface OrchestrateTracesConfig {
  graphConfig: any;
  processedSeries: any[];
  rows: any[];
  xNames: string[];
  yNames: string[];
  categoryNames: string[];
  normalizedFormat: string;
  liveProps?: any;
}

export interface OrchestrationResult {
  traces: any[];
  legendLabels: string[];
  categoryPlotResult: any;
}

/**
 * Orchestrate complete trace generation for all series
 */
export const orchestrateTraceGeneration = async (
  config: OrchestrateTracesConfig
): Promise<OrchestrationResult> => {
  const {
    graphConfig,
    processedSeries,
    rows,
    xNames,
    yNames,
    categoryNames,
    normalizedFormat,
    liveProps
  } = config;

  const traces: any[] = [];
  const legendLabels = processedSeries.map(s => s.label);

  // Get series configuration
  const seriesConfig = getSeriesConfig();
  const getSeriesColor = (i: number) => seriesConfig.colors[i % seriesConfig.colors.length];
  const getSeriesSymbol = (i: number) => seriesConfig.symbols[i % seriesConfig.symbols.length];

  // Get plot properties for live customization
  const plotProperties = getPlotProperties(liveProps, graphConfig);

  // Store legend labels in graph config
  if (legendLabels.length > 0) {
    graphConfig.legendLabels = legendLabels;

    // Save legend labels back to the database
    try {
      const { updateGraphRunConfig } = await import('@backend/graphs');
      const currentRunId = graphConfig.runId || graphConfig.id;
      if (currentRunId) {
        await updateGraphRunConfig(graphConfig.selectedProject, currentRunId, {
          graphConfig: { ...graphConfig, legendLabels }
        });
      }
    } catch (error) {
      // Silently handle error
    }
  }

  // Assess data quality for all series
  processedSeries.forEach((series) => {
    const xv = series.xv || (series as any).x;
    const yv = series.yv || (series as any).y;

    const qualityReport = assessDataQuality(xv, yv, {
      outlierMethod: 'iqr',
      outlierThreshold: 1.5,
      missingValueThreshold: 0.1,
      minSampleSize: 3
    });

    if (!qualityReport.isValid) {
      // Data quality issues detected - handled silently
    }
  });

  // Check if this is a category-based plot
  const isCategoryPlot = categoryNames && categoryNames.length > 0;
  const isCategoryFormat = normalizedFormat?.toLowerCase().includes('category');
  const isPointPlot = graphConfig?.subType?.toLowerCase().includes('point plot');
  const isDotPlot = graphConfig?.subType?.toLowerCase().includes('dot plot');
  let categoryPlotResult: any = null;

  // Handle category plots
  if (isCategoryPlot && isCategoryFormat) {
    if (normalizedFormat === 'XY Category') {
      categoryPlotResult = plotWithCategory({
        rows,
        xCol: xNames?.[0],
        yCol: yNames?.[0],
        categoryCol: categoryNames?.[0],
        subType: graphConfig?.subType || 'Scatter Plot',
        liveProps
      });
      traces.push(...categoryPlotResult.traces);
    }
  }

  // Create traces for each series (skip if already handled by XY Category)
  if (!(isCategoryPlot && isCategoryFormat && normalizedFormat === 'XY Category')) {
    processedSeries.forEach((series, seriesIndex) => {
      const xv = series.xv || (series as any).x;
      const yv = series.yv || (series as any).y;
      const label = series.label;
      const errorBarVariable = series.errorBarVariable;
      const startTime = performance.now();

      // Optimize data for large datasets
      const optimizedData = optimizeDataForPerformance(
        xv,
        yv,
        {
          maxPointsPerTrace: 15000,
          enableSampling: true,
          enableDecimation: true,
          enableProgressiveRendering: true,
          samplingThreshold: 5000,
          decimationFactor: 2,
          performanceWarningThreshold: 50000
        },
        errorBarVariable
      );

      const processingTime = performance.now() - startTime;
      const performanceMetrics = measurePerformance(optimizedData.originalLength, processingTime);

      // Get color for this series
      const perSeriesColor = liveProps?.global?.legendSeriesColors?.[label];
      const plotSpecificColor = liveProps?.plotSpecific?.scatter?.pointColor;
      const globalSeriesColor = liveProps?.global?.seriesColor;

      const baseColor = getSeriesColor(seriesIndex);
      const color = perSeriesColor || plotSpecificColor || globalSeriesColor || baseColor;
      const symbol = getSeriesSymbol(seriesIndex);

      // Apply axis transforms for special scales
      const xScale = liveProps?.global?.xScaleType;
      const yScale = liveProps?.global?.yScaleType;
      const tx = transformArrayForScale({ array: optimizedData.xv as any, scale: xScale });
      const ty = transformArrayForScale({ array: optimizedData.yv as any, scale: yScale });

      try {
        const customLabel = liveProps?.global?.legendTextEntries?.[label] || label;
        const isBidirectionalErrorBar =
          graphConfig?.subType?.toLowerCase().includes('bidirectional') &&
          graphConfig?.subType?.toLowerCase().includes('error bar');

        const errorBarVars = graphConfig.variables?.errorBar || [];

        // Create trace
        const trace = createTrace({
          xv: tx,
          yv: ty,
          label: customLabel,
          color,
          symbol,
          subType: graphConfig?.subType,
          symbolValue: graphConfig?.symbolValue,
          errorCalculationUpper: graphConfig?.errorCalculationUpper,
          errorCalculationLower: graphConfig?.errorCalculationLower,
          errorBarVariable: optimizedData.errorBarVariable,
          errorBarData: series.errorBarData,
          errorBarVariableX: graphConfig?.errorBarVariableX,
          errorBarVariableY: graphConfig?.errorBarVariableY,
          errorBarDataX: series.errorBarDataX,
          errorBarDataY: series.errorBarDataY,
          errorBarColor:
            processedSeries.length > 1 ? undefined : plotProperties.errorBar?.errorBarColor,
          rows,
          zv: series.zv,
          graphConfig: graphConfig
        });

        // Optimize trace for large datasets (skip for 3D mesh traces)
        const isCurrentTrace3D = is3DMeshTrace(trace);
        const optimizedTrace = isCurrentTrace3D
          ? trace
          : optimizeTraceForLargeData(trace, optimizedData.originalLength);

        // Apply plot-specific scatter properties
        let finalTrace =
          plotProperties.scatter && !isPointPlot && !isDotPlot && !isCurrentTrace3D
            ? applyScatterProperties(optimizedTrace, plotProperties.scatter!)
            : optimizedTrace;

        // Apply error bar properties if trace has error bars
        // TEMPORARILY DISABLED: Error bar property application is breaking caps
        // TODO: Fix the applyErrorBarProperties function to properly preserve all cap properties
        if (false && (finalTrace.error_y || finalTrace.error_x) && plotProperties.errorBar) {
          finalTrace = applyErrorBarProperties(finalTrace, plotProperties.errorBar);

        } else {
        }

        // Apply 3D mesh properties if trace is a 3D mesh
        if (isCurrentTrace3D && plotProperties.mesh3d) {
          finalTrace = applyMesh3DProperties(finalTrace, plotProperties.mesh3d);
        }

        traces.push(finalTrace);
      } catch (error) {
        const customLabel = liveProps?.global?.legendTextEntries?.[label] || label;
        const fallbackTrace = {
          x: tx || xv,
          y: ty || yv,
          type: 'scatter',
          mode: 'markers',
          name: customLabel,
          marker: { color, size: 6 }
        };
        traces.push(fallbackTrace);
      }

      // Add regression traces if subType includes "regression"
      const subType = graphConfig?.subType || '';
      const isRegressionSubType = subType.toLowerCase().includes('regression');

      if (isRegressionSubType || graphConfig?.showRegression) {
        try {
          const customLabel = liveProps?.global?.legendTextEntries?.[label] || label;

          // Get user's confidence interval preferences from plot properties
          const showCI = plotProperties.regression?.showConfidenceInterval ?? true;
          const ciOpacity = plotProperties.regression?.confidenceIntervalOpacity ?? 0.2;

          const regressionTraces = createRegressionTracesIfNeeded(
            tx,
            ty,
            customLabel,
            color,
            subType,
            showCI,
            ciOpacity
          );

          if (regressionTraces && regressionTraces.length > 0) {
            const finalRegressionTraces = plotProperties.regression
              ? regressionTraces.map(trace =>
                applyRegressionProperties(trace, plotProperties.regression!)
              )
              : regressionTraces;

            traces.push(...finalRegressionTraces);
          } else {
          }
        } catch (error) {
        }
      }

      // Add dotted lines for dot plots
      try {
        const dottedLines =
          optimizedData.originalLength > 10000
            ? []
            : createDotPlotDottedLines(
              optimizedData.xv,
              optimizedData.yv,
              color,
              graphConfig?.subType || '',
              processedSeries.length > 1
                ? undefined
                : plotProperties.errorBar?.errorBarColor
            );
        traces.push(...dottedLines);
      } catch (error) {
        // Silently handle error
      }
    });
  }

  return {
    traces,
    legendLabels,
    categoryPlotResult
  };
};

