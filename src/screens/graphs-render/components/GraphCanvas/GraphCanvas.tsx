/**
 * Simplified GraphCanvas component
 * Orchestrates data processing, layout configuration, and rendering
 */

import React, { FC, useEffect, useRef, forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import { usePlotly } from '@hooks/plotly';
import { useGraphData } from '../../hooks/useGraphData';
import { useGraphLayout } from '../../hooks/useGraphLayout';
import { useGraphInteractions } from '../../hooks/useGraphInteractions';
import { GraphRenderingService } from '../../services/graphRenderingService';
import { createTrace, createRegressionTracesIfNeeded } from '../../utils/traceGeneration';
import { optimizeDataForPerformance, measurePerformance, optimizeTraceForLargeData } from '../../utils/common';
import { GraphLoader } from '../GraphLoader';

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

export const GraphCanvas: FC<GraphCanvasProps> = forwardRef<GraphCanvasRef, GraphCanvasProps>(
  ({ graphConfig, workspacePath, liveProps, className, style }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPlotRef = useRef<{ data: any[]; layout: any; config: any } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use Plotly hook
    const plot = usePlotly();

    // Use custom hooks for different concerns
    const {
      processedSeries,
      legendLabels,
      categoryPlotResult,
      rows,
      xNames,
      yNames,
      zNames,
      categoryNames,
      isLoading: dataLoading,
      error: dataError
    } = useGraphData({ graphConfig, workspacePath, liveProps });

    // Determine plot characteristics
    const normalizedFormat = useMemo(() => {
      let format = graphConfig?.dataFormat;
      
      // Special handling for bidirectional asymmetric error bars
      const isBidirectionalAsymmetricErrorBar = graphConfig?.subType?.toLowerCase().includes('bidirectional') && 
                                               graphConfig?.subType?.toLowerCase().includes('asymmetric') &&
                                               graphConfig?.subType?.toLowerCase().includes('error bar');
      
      if (isBidirectionalAsymmetricErrorBar) {
        format = 'XY Pairs';
      }
      
      // Normalize Single X/Y formats
      if (format === 'Single X' && xNames?.length > 0 && yNames?.length > 0) {
        format = 'X Many Y';
      } else if (format === 'Single Y' && xNames?.length > 0 && yNames?.length > 0) {
        format = 'Y Many X';
      }
      
      if (format === 'Single X' && (!xNames || xNames.length === 0) && (yNames && yNames.length > 0)) {
        format = 'Single Y';
      } else if (format === 'Single Y' && (!yNames || yNames.length === 0) && (xNames && xNames.length > 0)) {
        format = 'Single X';
      }

      return format;
    }, [graphConfig?.dataFormat, graphConfig?.subType, xNames, yNames]);

    const isPointPlot = useMemo(() => {
      return graphConfig?.subType?.toLowerCase().includes('point plot') || 
             graphConfig?.subType?.toLowerCase().includes('point') ||
             graphConfig?.subType?.toLowerCase().includes('dot plot');
    }, [graphConfig?.subType]);

    const isCategoryPlot = useMemo(() => {
      return categoryNames && categoryNames.length > 0;
    }, [categoryNames]);

    const isCategoryFormat = useMemo(() => {
      return normalizedFormat?.toLowerCase().includes('category');
    }, [normalizedFormat]);

    const has3DMeshTraces = useMemo(() => {
      return graphConfig?.graphType === '3D Mesh Plot' || 
             graphConfig?.subType === '3D Mesh Plot' ||
             normalizedFormat === 'xyz-columns' ||
             normalizedFormat === 'z-matrix' ||
             normalizedFormat === 'xy-z-columns';
    }, [graphConfig?.graphType, graphConfig?.subType, normalizedFormat]);

    // Use layout hook
    const { layout, config } = useGraphLayout({
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
    });

    // Use interactions hook
    const { applyInlineEditing, setupContextMenu } = useGraphInteractions({
      containerRef,
      liveProps,
      graphConfig,
      subType: graphConfig?.subType,
      liveTitle: liveProps?.global?.graphName || graphConfig?.graphName
    });

    // Generate traces
    const traces = useMemo(() => {
      if (processedSeries.length === 0) {
        return [];
      }

      console.log(`🔍 Processing ${processedSeries.length} series for graph type: ${graphConfig?.graphType}`);

      const generatedTraces: any[] = [];

      // For category plots, use the specialized result
      if (isCategoryPlot && isCategoryFormat && categoryPlotResult) {
        generatedTraces.push(...categoryPlotResult.traces);
      } else {
        // Generate traces for each series
        processedSeries.forEach((series, index) => {
          console.log(`📊 Series ${index}: ${series.label}`, {
            subType: graphConfig?.subType,
            dataLength: series.xv.length,
            sampleData: {
              x: series.xv.slice(0, 3),
              y: series.yv.slice(0, 3),
              z: series.zv?.slice(0, 3)
            }
          });

          // Create main trace
          const traceConfig = {
            graphConfig: { ...graphConfig, dataFormat: normalizedFormat },
            series,
            index,
            liveProps,
            workspacePath,
            legendLabels,
            isPointPlot,
            isCategoryPlot,
            isCategoryFormat
          };

          const mainTrace = createTrace(traceConfig);
          if (mainTrace) {
            generatedTraces.push(mainTrace);
          }

          // Create regression traces if needed
          const regressionTraces = createRegressionTracesIfNeeded({
            graphConfig: { ...graphConfig, dataFormat: normalizedFormat },
            series,
            index,
            liveProps,
            workspacePath,
            legendLabels,
            isPointPlot,
            isCategoryPlot,
            isCategoryFormat
          });

          if (regressionTraces && regressionTraces.length > 0) {
            generatedTraces.push(...regressionTraces);
          }
        });
      }

      // Performance optimization for large datasets
      const metrics = measurePerformance(generatedTraces);
      if (metrics.hasLargeDataset) {
        console.log(`⚡ Large dataset detected (${metrics.totalDataPoints} points). Applying optimizations...`);
        const optimizedTraces = generatedTraces.map(trace => 
          optimizeTraceForLargeData(trace, metrics.recommendedOptimization)
        );
        return optimizedTraces;
      }

      return generatedTraces;
    }, [
      processedSeries,
      graphConfig,
      normalizedFormat,
      liveProps,
      workspacePath,
      legendLabels,
      isPointPlot,
      isCategoryPlot,
      isCategoryFormat,
      categoryPlotResult
    ]);

    // Handle rendering
    useEffect(() => {
      if (traces.length === 0 || !plot) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        GraphRenderingService.handleRenderingWithRetry({
          containerRef,
          plot,
          traces,
          layout,
          config,
          graphConfig,
          workspacePath,
          lastPlotRef
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error rendering graph:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsLoading(false);
      }
    }, [traces, layout, config, plot, graphConfig, workspacePath]);

    // Setup lifecycle management
    useEffect(() => {
      if (!plot) return;

      const cleanup = GraphRenderingService.setupLifecycleManagement({
        containerRef,
        plot,
        lastPlotRef
      });

      return cleanup;
    }, [plot]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      redraw: () => {
        if (lastPlotRef.current && containerRef.current) {
          plot.redraw(lastPlotRef.current as any);
        }
      },
      getCurrentPlot: () => lastPlotRef.current,
      exportImage: async (format: 'png' | 'jpeg' | 'svg' | 'pdf') => {
        if (!plot || !containerRef.current) {
          throw new Error('Plot not ready for export');
        }
        
        return new Promise((resolve, reject) => {
          plot.toImage(containerRef.current, { format, width: 800, height: 600 })
            .then((dataUrl: string) => resolve(dataUrl))
            .catch((err: Error) => reject(err));
        });
      }
    }), [plot]);

    // Loading state
    if (dataLoading || isLoading) {
      return <GraphLoader />;
    }

    // Error state
    if (dataError || error) {
      return (
        <div className="error-container" style={{ padding: '20px', textAlign: 'center' }}>
          <h3>Error loading graph</h3>
          <p>{dataError || error}</p>
        </div>
      );
    }

    // No data state
    if (processedSeries.length === 0) {
      return (
        <div className="no-data-container" style={{ padding: '20px', textAlign: 'center' }}>
          <h3>No data available</h3>
          <p>Please select data variables to create a graph.</p>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          ...style
        }}
      />
    );
  }
);

GraphCanvas.displayName = 'GraphCanvas';
