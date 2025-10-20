/**
 * Graph rendering service
 * Handles Plotly rendering logic and lifecycle management
 */

import { ensureGraphFolderAndSave } from './plotly-save';

export interface GraphRenderingConfig {
  containerRef: React.RefObject<HTMLDivElement>;
  plot: any;
  traces: any[];
  layout: any;
  config: any;
  graphConfig: any;
  workspacePath?: string;
}

export interface LifecycleConfig {
  containerRef: React.RefObject<HTMLDivElement>;
  plot: any;
  lastPlotRef: React.MutableRefObject<{ data: any[]; layout: any; config: any } | null>;
}

export class GraphRenderingService {
  /**
   * Render plot with Plotly
   */
  static async renderPlot({
    containerRef,
    plot,
    traces,
    layout,
    config,
    graphConfig,
    workspacePath
  }: GraphRenderingConfig): Promise<void> {
    if (!containerRef.current) {
      return;
    }

    try {
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
          dataLength: t.x?.length || 0
        }))
      });
      
      plot.redraw(payload);

      // Save plot payload best-effort to filesystem (DB is the source of truth)
      const projectPath = workspacePath || '';
      await ensureGraphFolderAndSave(projectPath, { graphConfig, traces, layout });

    } catch (error) {
      console.error('Error rendering plot:', error);
      throw error;
    }
  }

  /**
   * Setup lifecycle management for the plot
   */
  static setupLifecycleManagement({
    containerRef,
    plot,
    lastPlotRef
  }: LifecycleConfig): () => void {
    const div = containerRef.current;
    if (!div) {
      return () => {};
    }

    const tryRedraw = () => {
      if (!div || !lastPlotRef.current) return;
      (plot as any).graph.current = div;
      plot.redraw(lastPlotRef.current as any);
    };

    // Intersection Observer for visibility handling
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          tryRedraw();
        }
      });
    }, { threshold: 0.1 });
    io.observe(div);

    // ResizeObserver for responsive updates
    const ResizeObs: any = (window as any).ResizeObserver;
    const ro = ResizeObs ? new ResizeObs(() => tryRedraw()) : null;
    if (ro) { 
      ro.observe(div); 
    }

    // Window event handlers
    const onFocus = () => tryRedraw();
    const onResize = () => tryRedraw();
    window.addEventListener('focus', onFocus);
    window.addEventListener('resize', onResize);

    // Cleanup function
    return () => {
      io.disconnect();
      ro && ro.disconnect();
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('resize', onResize);
    };
  }

  /**
   * Handle rendering with retry logic
   */
  static handleRenderingWithRetry({
    containerRef,
    plot,
    traces,
    layout,
    config,
    graphConfig,
    workspacePath,
    lastPlotRef
  }: GraphRenderingConfig & { lastPlotRef: React.MutableRefObject<{ data: any[]; layout: any; config: any } | null> }): void {
    if (containerRef.current) {
      // Store payload for retry logic
      lastPlotRef.current = { data: traces, layout, config };
      
      // Attempt immediate rendering
      this.renderPlot({
        containerRef,
        plot,
        traces,
        layout,
        config,
        graphConfig,
        workspacePath
      }).catch((error) => {
        console.error('Graph generation error:', error);
      });
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
  }

  /**
   * Create fallback trace for error handling
   */
  static createFallbackTrace(xv: number[], yv: number[], label: string, color: string): any {
    return {
      x: xv.slice(0, 1000), // Limit to 1000 points
      y: yv.slice(0, 1000),
      type: 'scatter',
      mode: 'markers',
      name: `${label} (fallback)`,
      marker: { color, size: 4, opacity: 0.6 },
      showlegend: true
    };
  }

  /**
   * Check if traces are valid for rendering
   */
  static validateTraces(traces: any[]): boolean {
    if (traces.length === 0) {
      return false;
    }

    // Check if all traces have valid data
    return traces.every(trace => {
      return trace.x && trace.y && trace.x.length > 0 && trace.y.length > 0;
    });
  }

  /**
   * Get rendering performance metrics
   */
  static getRenderingMetrics(traces: any[]): {
    totalDataPoints: number;
    traceCount: number;
    hasLargeDataset: boolean;
    recommendedOptimization: string;
  } {
    const totalDataPoints = traces.reduce((sum, trace) => sum + (trace.x?.length || 0), 0);
    const traceCount = traces.length;
    const hasLargeDataset = totalDataPoints > 10000;
    
    let recommendedOptimization = 'none';
    if (totalDataPoints > 50000) {
      recommendedOptimization = 'aggressive_sampling';
    } else if (totalDataPoints > 20000) {
      recommendedOptimization = 'moderate_sampling';
    } else if (totalDataPoints > 10000) {
      recommendedOptimization = 'light_sampling';
    }

    return {
      totalDataPoints,
      traceCount,
      hasLargeDataset,
      recommendedOptimization
    };
  }
}
