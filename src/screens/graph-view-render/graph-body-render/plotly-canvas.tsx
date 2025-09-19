import { FC, useEffect, useRef } from 'react';
import { usePlotly } from '@hooks/plotly';
import { Database } from '@utils';
import { ensureGraphFolderAndSave } from './plotly-save';
import { insertGraphRun } from './graphs-store';
import { EXCEL } from '@constants';
import { useStartProStore } from '@store/main-store';

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
      const cols = [...(graphConfig.variables?.x || []), ...(graphConfig.variables?.y || [])];
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

      // Selected columns by role
      const xNames = (graphConfig.variables?.x as string[]) || [];
      const yNames = (graphConfig.variables?.y as string[]) || [];
      console.log('xNames:', xNames);
      console.log('yNames:', yNames);

      // Plotly traces accumulator
      const traces: any[] = [];
      
      // Utility: simple linear regression y = m x + b
      // Visual encodings for series
      const SERIES_COLORS = [
        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
        '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
      ];
      const SERIES_SYMBOLS = [
        'circle', 'square', 'diamond', 'cross', 'x',
        'triangle-up', 'triangle-down', 'star', 'hexagon', 'triangle-ne'
      ];
      const getSeriesColor = (i: number) => SERIES_COLORS[i % SERIES_COLORS.length];
      const getSeriesSymbol = (i: number) => SERIES_SYMBOLS[i % SERIES_SYMBOLS.length];

      const computeLinearRegression = (xs: number[], ys: number[]) => {
        const pairs = xs
          .map((x, i) => [x, ys[i]] as [number, number])
          .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
        const n = pairs.length;
        if (n < 2) return null;
        let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;
        for (let i = 0; i < n; i++) {
          const x = pairs[i][0];
          const y = pairs[i][1];
          sumX += x; sumY += y; sumXX += x * x; sumXY += x * y;
        }
        const denom = n * sumXX - sumX * sumX;
        if (denom === 0) return null;
        const m = (n * sumXY - sumX * sumY) / denom;
        const b = (sumY - m * sumX) / n;
        return { m, b };
      };

      const addRegressionLineIfNeeded = (xVals: number[], yVals: number[], label: string, color?: string) => {
        if (!graphConfig?.subType || !String(graphConfig.subType).toLowerCase().includes('regression')) return;
        if (!xVals.length || !yVals.length) return;
        const lr = computeLinearRegression(xVals, yVals);
        if (!lr) return;
        const { m, b } = lr;
        // Determine domain from finite x values
        const finiteX = xVals.filter((x) => Number.isFinite(x));
        if (finiteX.length < 2) return;
        const xMin = Math.min(...finiteX);
        const xMax = Math.max(...finiteX);
        const lineX = [xMin, xMax];
        const lineY = [m * xMin + b, m * xMax + b];
        traces.push({
          x: lineX,
          y: lineY,
          type: 'scatter',
          mode: 'lines',
          name: `${label} (fit)`,
          line: { color: color || 'rgba(200,0,0,0.85)', width: 2 },
          hoverinfo: 'skip',
        });
      };

      let seriesIndex = 0;
      const addScatterSeries = (xv: number[], yv: number[], label: string) => {
        const color = getSeriesColor(seriesIndex);
        const symbol = getSeriesSymbol(seriesIndex);
        traces.push({
          x: xv,
          y: yv,
          type: 'scatter',
          mode: 'markers',
          name: label,
          marker: { color, symbol }
        });
        addRegressionLineIfNeeded(xv, yv, label, color);
        seriesIndex += 1;
      };
      
      // Handle different data formats
      if ((graphConfig.dataFormat === 'XY Pair') && xNames?.length && yNames?.length) {
        // XY Pair: plot Y vs X
        const xCol = xNames[0];
        yNames.forEach((y) => {
          const xv = rows.map((r: any) => Number(r[xCol]));
          const yv = rows.map((r: any) => Number(r[y]));
          addScatterSeries(xv, yv, `${y} vs ${xCol}`);
        });
      } else if ((graphConfig.dataFormat === 'XY Pairs') && xNames?.length && yNames?.length) {
        // XY Pairs: pair each X[i] with Y[i]
        const pairCount = Math.min(xNames.length, yNames.length);
        for (let i = 0; i < pairCount; i++) {
          const xCol = xNames[i];
          const yCol = yNames[i];
          const xv = rows.map((r: any) => Number(r[xCol]));
          const yv = rows.map((r: any) => Number(r[yCol]));
          addScatterSeries(xv, yv, `${yCol} vs ${xCol}`);
        }
      } else if ((graphConfig.dataFormat === 'X Many Y') && xNames?.length && yNames?.length) {
        // One X vs many Ys
        const xCol = xNames[0];
        const xv = rows.map((r: any) => Number(r[xCol]));
        yNames.forEach((y) => {
          const yv = rows.map((r: any) => Number(r[y]));
          addScatterSeries(xv, yv, `${y} vs ${xCol}`);
        });
      } else if ((graphConfig.dataFormat === 'Y Many X') && xNames?.length && yNames?.length) {
        // Many X vs one Y (invert typical pairing): plot each X against the single Y
        const yCol = yNames[0];
        const yv = rows.map((r: any) => Number(r[yCol]));
        xNames.forEach((x) => {
          const xv = rows.map((r: any) => Number(r[x]));
          addScatterSeries(xv, yv, `${yCol} vs ${x}`);
        });
      } else if (graphConfig.dataFormat === 'Many X' && xNames?.length) {
        // Many X vs index
        xNames.forEach((x) => {
          const xv = rows.map((_: any, i: number) => i + 1);
          const yv = rows.map((r: any) => Number(r[x]));
          addScatterSeries(xv as number[], yv as number[], x);
        });
      } else if (graphConfig.dataFormat === 'Many Y' && yNames?.length) {
        // Many Y vs index
        yNames.forEach((y) => {
          const xv = rows.map((_: any, i: number) => i + 1);
          const yv = rows.map((r: any) => Number(r[y]));
          addScatterSeries(xv as number[], yv as number[], y);
        });
      } else if (graphConfig.dataFormat === 'XY Category' && xNames?.length && yNames?.length) {
        // Treat X as numeric, Y as numeric; categories may be encoded externally; fallback to markers
        const xCol = xNames[0];
        yNames.forEach((y) => {
          const xv = rows.map((r: any) => Number(r[xCol]));
          const yv = rows.map((r: any) => Number(r[y]));
          addScatterSeries(xv, yv, `${y} vs ${xCol}`);
        });
      } else if (graphConfig.dataFormat === 'X Category' && xNames?.length) {
        // X is single categorical series; plot as index vs value of each selected X
        xNames.forEach((x) => {
          const xv = rows.map((_: any, i: number) => i + 1);
          const yv = rows.map((r: any) => Number(r[x]));
          addScatterSeries(xv as number[], yv as number[], x);
        });
      } else if (graphConfig.dataFormat === 'Y Category' && yNames?.length) {
        // Y is single categorical series; plot as index vs value of each selected Y
        yNames.forEach((y) => {
          const xv = rows.map((_: any, i: number) => i + 1);
          const yv = rows.map((r: any) => Number(r[y]));
          addScatterSeries(xv as number[], yv as number[], y);
        });
      } else if (graphConfig.dataFormat === 'Single X' && xNames?.length) {
        // Single X: plot X values against row indices
        xNames.forEach((x) => {
          const xv = rows.map((_: any, i: number) => i + 1);
          const yv = rows.map((r: any) => Number(r[x]));
          addScatterSeries(xv as number[], yv as number[], x);
        });
      } else if (graphConfig.dataFormat === 'Single Y' && yNames?.length) {
        // Single Y: plot Y values against row indices
        yNames.forEach((y) => {
          const xv = rows.map((_: any, i: number) => i + 1);
          const yv = rows.map((r: any) => Number(r[y]));
          addScatterSeries(xv as number[], yv as number[], y);
        });
      } else {
        // Fallback to old logic for backward compatibility
        if (xNames?.length && yNames?.length) {
          const xCol = xNames[0];
          yNames.forEach((y) => {
            const xv = rows.map((r: any) => Number(r[xCol]));
            const yv = rows.map((r: any) => Number(r[y]));
            addScatterSeries(xv, yv, `${y} vs ${xCol}`);
          });
        } else if (xNames?.length) {
          xNames.forEach((x) => {
            const xv = rows.map((_: any, i: number) => i + 1);
            const yv = rows.map((r: any) => Number(r[x]));
            addScatterSeries(xv, yv, x);
          });
        } else if (yNames?.length) {
          yNames.forEach((y) => {
            const xv = rows.map((_: any, i: number) => i + 1);
            const yv = rows.map((r: any) => Number(r[y]));
            addScatterSeries(xv, yv, y);
          });
        }
      }

      const layout = { title: graphConfig?.subType || 'Scatter Plot', autosize: true } as any;
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


