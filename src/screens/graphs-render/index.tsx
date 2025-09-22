import { FC, lazy, useEffect, useState } from 'react';
import { SuspenseLoad } from '@libs';
import { useGraphsRender } from './styles-hook/use-graphs-render-style';
import { useActiveNode } from '@hooks';
import { useFetchGraphs } from './hooks/use-fetch-graphs';
import { friendlyTitleForGraph } from './utils/title';
import { useStartProStore } from '@store/main-store';

const GraphSelection = lazy(() =>
  import('./graph-selection').then((modules) => ({ default: modules.GraphSelection })),
);
const RunHistory = lazy(() =>
  import('./run-history/run-history').then((modules) => ({ default: modules.RunHistory })),
);
const GraphProperties = lazy(() =>
  import('./graph-properties/graph-properties').then((modules) => ({ default: modules.GraphProperties })),
);
const ToolBar = lazy(() => import('./tool-bar').then((modules) => ({ default: modules.ToolBar })));

import { useTools } from './hooks/use-tools';
import { updateGraphRunConfig } from '@backend/graphs';

export const GraphsRender: FC = () => {
  const classes = useGraphsRender();
  const tools = useTools();
  const [propertiesByRun, setPropertiesByRun] = useState<Record<number, typeof tools.graphProperties>>({});
  
  const { config } = useActiveNode([]);
  const { data } = useFetchGraphs(config.tabName);
  const { setRenderLatestRun, renderLatestRun, selectedGraphRun, setSelectedGraphRun } = useStartProStore();
  
  // Auto-select latest run when renderLatestRun flag is set
  useEffect(() => {
    console.log('🔍 Auto-selection check:', { 
      dataLength: data?.length, 
      renderLatestRun, 
      selectedRunId: selectedGraphRun.id 
    });
    
    if (Array.isArray(data) && data.length > 0 && renderLatestRun) {
      const nice = friendlyTitleForGraph(data[0]?.graphType, data[0]?.config?.graphConfig?.subType);
      setSelectedGraphRun(data[0]?.id, nice);
      setRenderLatestRun(false);
      console.log('🎯 Auto-selected latest graph:', data[0]?.id, nice);
    }
  }, [data, renderLatestRun, selectedGraphRun.id, setSelectedGraphRun, setRenderLatestRun]);
  
  // Ensure default Graph Name starts as the plotted graph name, without changing existing default behavior
  // Only set when our current name is empty or the initial placeholder
  useEffect(() => {
    const currentProps = propertiesByRun[selectedGraphRun.id] || tools.graphProperties;
    const currentName = currentProps.global.graphName;
    const defaultLike = !currentName || currentName === 'Untitled Graph';
    const plottedName = selectedGraphRun?.title;
    if (defaultLike && plottedName) {
      setPropertiesByRun((prev) => {
        const existing = prev[selectedGraphRun.id] || tools.graphProperties;
        return {
          ...prev,
          [selectedGraphRun.id]: {
            ...existing,
            global: { ...existing.global, graphName: plottedName },
          },
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGraphRun.id]);

  // Accessors for per-run properties
  const currentProps = propertiesByRun[selectedGraphRun.id] || tools.graphProperties;

  const updateGraphPropertyPerRun = <K extends keyof typeof tools.graphProperties.global>(
    key: K,
    value: (typeof tools.graphProperties.global)[K],
  ) => {
    setPropertiesByRun((prev) => {
      const base = prev[selectedGraphRun.id] || tools.graphProperties;
      return {
        ...prev,
        [selectedGraphRun.id]: {
          ...base,
          global: { ...base.global, [key]: value },
        },
      };
    });
    // Track changed run name for app-wide save dialog display
    try {
      const w: any = window as any;
      w.statproChangedRuns = w.statproChangedRuns || {};
      w.statproChangedRuns[selectedGraphRun.id] = selectedGraphRun.title || `Graph ${selectedGraphRun.id}`;
    } catch {}
    // Persist immediately
    try {
      const dbName = (propertiesByRun[selectedGraphRun.id]?.global.tabName as any) || config.tabName;
      const selectedId = selectedGraphRun.id;
      const next = {
        ...(propertiesByRun[selectedGraphRun.id] || tools.graphProperties),
        global: {
          ...((propertiesByRun[selectedGraphRun.id] || tools.graphProperties).global as any),
          [key]: value,
        },
      };
      updateGraphRunConfig(dbName, selectedId, { graphConfig: next });
    } catch {}
  };

  // Wire window-level custom event so canvas double-click edits can update state
  useEffect(() => {
    const handler = (e: any) => {
      const { key, value } = e.detail || {};
      if (!key) return;
      updateGraphPropertyPerRun(key as any, value);
    };
    window.addEventListener('statpro:updateGraphProperty', handler as any);
    return () => window.removeEventListener('statpro:updateGraphProperty', handler as any);
  }, [selectedGraphRun.id]);

  // Handle Save selected groups request from close dialog
  useEffect(() => {
    const handler = (e: any) => {
      const { runId, groups } = e.detail || {};
      if (!runId) return;
      const dbName = config.tabName;
      const base = propertiesByRun[runId] || tools.graphProperties;
      const next = { ...base, global: { ...base.global } } as any;
      if (!groups?.title) {
        delete next.global.graphName;
        delete next.global.showTitle;
      }
      if (!groups?.axis) {
        delete next.global.axisXData;
        delete next.global.axisYData;
        delete next.global.showAxisLabels;
      }
      if (!groups?.legend) {
        delete next.global.showLegend;
        delete next.global.legendTitle;
        delete next.global.legendColumns;
        delete next.global.legendBoxSpacingInch;
        delete next.global.legendPosition;
        delete next.global.legendLock;
        delete next.global.legendAllowDragResize;
        delete next.global.legendFramedInBox;
        delete next.global.legendDirectLabeling;
        delete next.global.legendUseYOnly;
      }
      if (!groups?.appearance) {
        delete next.global.backgroundColor;
        delete next.global.plotColor;
        delete next.global.showGridLines;
        delete next.global.marginSize;
        delete next.global.padding;
      }
      if (!groups?.series) {
        delete next.global.seriesColor;
      }
      try {
        updateGraphRunConfig(dbName, runId, { graphConfig: next });
      } catch {}
    };
    window.addEventListener('statpro:saveGraphProperties', handler as any);
    return () => window.removeEventListener('statpro:saveGraphProperties', handler as any);
  }, [propertiesByRun, selectedGraphRun.id]);

  const updatePlotSpecificPropertyPerRun = <T extends keyof typeof tools.graphProperties.plotSpecific>(
    plotType: T,
    key: keyof NonNullable<typeof tools.graphProperties.plotSpecific[T]>,
    value: any,
  ) => {
    setPropertiesByRun((prev) => {
      const base = prev[selectedGraphRun.id] || tools.graphProperties;
      return {
        ...prev,
        [selectedGraphRun.id]: {
          ...base,
          plotSpecific: {
            ...base.plotSpecific,
            [plotType]: {
              ...(base.plotSpecific as any)[plotType],
              [key]: value,
            },
          },
        },
      };
    });
  };

  return (
    <SuspenseLoad>
      <div className={classes.graphsLayout} data-graphs-root="true">
        <ToolBar tools={tools} title={selectedGraphRun.title} subTitle={selectedGraphRun.subTitle} />
        <div className={classes['graphs-area']}>
          <GraphSelection
            id={selectedGraphRun.id}
            fontBold={tools.fontBold}
            fontItalic={tools.fontItalic}
            fontSize={tools.fontSize}
            fontColor={tools.fontColor}
            showHistory={tools.showRunHistory}
            graphProperties={currentProps}
            onUpdateGraphProperty={updateGraphPropertyPerRun}
          />
          <RunHistory
            selectedID={selectedGraphRun.id}
            history={{
              showHistory: tools.showRunHistory,
              toggleShowHistory: tools.toggleShowHistory,
              setTotalRuns: tools.setTotalRuns,
              selectedRun: setSelectedGraphRun,
            }}
          />
          <GraphProperties
            properties={{
              showGraphProperties: tools.showGraphProperties,
              toggleGraphProperties: tools.toggleGraphProperties,
              graphProperties: currentProps,
              updateGraphProperty: updateGraphPropertyPerRun,
              updatePlotSpecificProperty: updatePlotSpecificPropertyPerRun,
              getCurrentPlotType: tools.getCurrentPlotType,
              currentSubType: selectedGraphRun.subTitle,
            }}
          />
        </div>
      </div>
    </SuspenseLoad>
  );
};
