import { FC, lazy, useEffect, useState, useMemo } from 'react';
import { SuspenseLoad } from '@libs';
import { useGraphsRender } from './styles/use-graphs-render-style';
import { useActiveNode } from '@hooks';
import { useFetchGraphs } from './hooks/use-fetch-graphs';
import { friendlyTitleForGraph } from './utils/title';
import { useStartProStore } from '@store/main-store';

const GraphSelection = lazy(() =>
  import('./features/graph-selection/graph-selection').then((modules) => ({ default: modules.GraphSelection })),
);
const RunHistory = lazy(() =>
  import('./features/run-history/run-history').then((modules) => ({ default: modules.RunHistory })),
);
const GraphProperties = lazy(() =>
  import('./features/graph-properties/graph-properties').then((modules) => ({ default: modules.GraphProperties })),
);
const ToolBar = lazy(() => import('./tool-bar').then((modules) => ({ default: modules.ToolBar })));

import { useTools } from './hooks/use-tools';
import { updateGraphRunConfig, updateGraphRunProperties } from '@backend/graphs';

export const GraphsRender: FC = () => {
  const classes = useGraphsRender();
  const tools = useTools();
  const [propertiesByRun, setPropertiesByRun] = useState<Record<number, typeof tools.graphProperties>>({});
  
  const { config } = useActiveNode([]);
  const { data } = useFetchGraphs(config.tabName);
  const { setRenderLatestRun, renderLatestRun, selectedGraphRun, setSelectedGraphRun } = useStartProStore();
  
  // Auto-select latest run when renderLatestRun flag is set
  useEffect(() => {
    
    if (Array.isArray(data) && data.length > 0 && renderLatestRun) {
      const nice = friendlyTitleForGraph(data[0]?.graphType, data[0]?.config?.graphConfig?.subType);
      const subTitle = data[0]?.config?.graphConfig?.subType || data[0]?.config?.graphConfig?.dataFormat;
      setSelectedGraphRun(data[0]?.id, nice, subTitle);
      setRenderLatestRun(false);
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

  // On run change, hydrate from DB-stored properties if available
  useEffect(() => {
    (async () => {
      try {
        const dbName = config.tabName;
        const runId = selectedGraphRun.id;
        if (!runId) return;
        const { fetchSingleGraph } = await import('@backend/graphs');
        const row = await fetchSingleGraph(dbName, runId);
        // Update selectedGraphRun with config from database
        if (row?.config) {
          setSelectedGraphRun(selectedGraphRun.id, selectedGraphRun.title, selectedGraphRun.subTitle, row.config);
        }
        
        const saved = row?.properties;
        if (saved && Object.keys(saved).length > 0) {
          setPropertiesByRun(prev => ({ ...prev, [runId]: saved }));
        }
      } catch {}
    })();
  }, [selectedGraphRun.id, config.tabName]);

  // Accessors for per-run properties
  const currentProps = useMemo(() => {
    const baseProps = propertiesByRun[selectedGraphRun.id] || tools.graphProperties;
    const result = {
      ...baseProps,
      global: {
        ...baseProps.global,
        canvasMode: tools.canvasMode
      },
      plotSpecific: {
        ...baseProps.plotSpecific,
        mesh3d: {
          ...(tools.graphProperties.plotSpecific.mesh3d),
          ...(baseProps.plotSpecific?.mesh3d),
          // Preserve original color scale from baseProps if it exists
          originalColorScale: baseProps.plotSpecific?.mesh3d?.originalColorScale || tools.graphProperties.plotSpecific.mesh3d?.originalColorScale
        }
      }
    };
    return result;
  }, [propertiesByRun, selectedGraphRun.id, tools.canvasMode, tools.graphProperties]);
  

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
    // Persist immediately to properties only
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
      updateGraphRunProperties(dbName, selectedId, next);
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

  // Listen for open properties request from canvas (dblclick/right-click)
  useEffect(() => {
    const openHandler = () => {
      // Ensure the drawer is visible
      if (!tools.showGraphProperties) tools.toggleGraphProperties();
    };
    window.addEventListener('statpro:openGraphProperties', openHandler);
    return () => window.removeEventListener('statpro:openGraphProperties', openHandler);
  }, [tools.showGraphProperties]);

  // Handle delete run requests from history list
  useEffect(() => {
    const handler = async (e: any) => {
      try {
        const runId = e?.detail?.id;
        if (!runId) return;
        const dbName = config.tabName;
        const { Database } = await import('@utils');
        const db: any = new (Database as any)(dbName);
        await db.executeQuery('DELETE FROM GRAPHS WHERE id = ?', [runId]);
        // Refresh UI by toggling show history or re-fetch. The useFetchGraphs is keyed by tabName, so re-render triggers fetch.
        // Quick refresh: set render latest run so the UI updates selection.
        setRenderLatestRun(true);
      } catch (err) {
      }
    };
    window.addEventListener('statpro:deleteGraphRun', handler as any);
    return () => window.removeEventListener('statpro:deleteGraphRun', handler as any);
  }, [config.tabName, setRenderLatestRun]);

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
        delete next.global.seriesColor;
        delete next.global.showGridLines;
        delete next.global.marginSize;
        delete next.global.padding;
      }
      if (!groups?.series) {
      }
      try {
        updateGraphRunConfig(dbName, runId, { graphConfig: next });
        updateGraphRunProperties(dbName, runId, next);
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
      const updated = {
        ...prev,
        [selectedGraphRun.id]: {
          ...base,
          plotSpecific: {
            ...base.plotSpecific,
            [plotType]: {
              ...(base.plotSpecific as any)[plotType],
              [key]: value,
              // Preserve originalColorScale for mesh3d properties
              ...(plotType === 'mesh3d' && {
                originalColorScale: (base.plotSpecific as any)[plotType]?.originalColorScale
              })
            },
          },
        },
      };
      
      
      return updated;
    });
    // Persist immediately
    try {
      const dbName = config.tabName;
      const selectedId = selectedGraphRun.id;
      const base = propertiesByRun[selectedId] || tools.graphProperties;
      const next = {
        ...base,
        plotSpecific: {
          ...base.plotSpecific,
          [plotType]: {
            ...(base.plotSpecific as any)[plotType],
            [key]: value,
            // Preserve originalColorScale for mesh3d properties
            ...(plotType === 'mesh3d' && {
              originalColorScale: (base.plotSpecific as any)[plotType]?.originalColorScale
            })
          },
        },
      } as any;
      updateGraphRunProperties(dbName, selectedId, next);
    } catch {}
  };

  const resetAllPropertiesPerRun = () => {
    try {
      const dbName = config.tabName;
      const selectedId = selectedGraphRun.id;
      const defaults = tools.graphProperties;
      const current = propertiesByRun[selectedId] || tools.graphProperties;
      const preservedGraphName = current.global.graphName;
      const next = {
        ...defaults,
        global: {
          ...defaults.global,
          graphName: preservedGraphName,
        },
      };
      setPropertiesByRun((prev) => ({ ...prev, [selectedId]: next }));
      updateGraphRunProperties(dbName, selectedId, next);
    } catch {}
  };

  const updateLegendTextEntryPerRun = (originalLabel: string, newText: string) => {
    setPropertiesByRun((prev) => {
      const base = prev[selectedGraphRun.id] || tools.graphProperties;
      return {
        ...prev,
        [selectedGraphRun.id]: {
          ...base,
          global: {
            ...base.global,
            legendTextEntries: {
              ...base.global.legendTextEntries,
              [originalLabel]: newText,
            },
          },
        },
      };
    });
    // Persist immediately
    try {
      const dbName = config.tabName;
      const selectedId = selectedGraphRun.id;
      const base = propertiesByRun[selectedId] || tools.graphProperties;
      const next = {
        ...base,
        global: {
          ...base.global,
          legendTextEntries: {
            ...base.global.legendTextEntries,
            [originalLabel]: newText,
          },
        },
      } as any;
      updateGraphRunProperties(dbName, selectedId, next);
    } catch {}
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
              selectedRun: (id: number, title: string, subTitle?: string) => setSelectedGraphRun(id, title, subTitle),
            }}
          />
          <GraphProperties
            properties={{
              showGraphProperties: tools.showGraphProperties,
              toggleGraphProperties: tools.toggleGraphProperties,
              graphProperties: currentProps,
              resetAllProperties: resetAllPropertiesPerRun,
              updateGraphProperty: updateGraphPropertyPerRun,
              updatePlotSpecificProperty: updatePlotSpecificPropertyPerRun,
              updateLegendSeriesColor: (label: string, color: string) => {
                // Persist per-run legend series color
                try {
                  const dbName = config.tabName;
                  const selectedId = selectedGraphRun.id;
                  const base = propertiesByRun[selectedId] || tools.graphProperties;
                  const next = {
                    ...base,
                    global: {
                      ...base.global,
                      legendSeriesColors: {
                        ...base.global.legendSeriesColors,
                        [label]: color,
                      },
                    },
                  } as any;
                  setPropertiesByRun(prev => ({ ...prev, [selectedId]: next }));
                  updateGraphRunProperties(dbName, selectedId, next);
                } catch {}
              },
              updateLegendTextEntry: updateLegendTextEntryPerRun,
              getCurrentPlotType: tools.getCurrentPlotType,
              getDetectedPlotFeatures: tools.getDetectedPlotFeatures,
              currentSubType: selectedGraphRun.subTitle,
              currentLegendLabels: selectedGraphRun.config?.graphConfig?.legendLabels || [],
              currentDataFormat: selectedGraphRun.config?.graphConfig?.dataFormat,
              currentVariables: {
                xNames: selectedGraphRun.config?.graphConfig?.variables?.x || [],
                yNames: selectedGraphRun.config?.graphConfig?.variables?.y || [],
                categoryNames: selectedGraphRun.config?.graphConfig?.variables?.category || []
              },
              // Pass the graph config for 3D mesh properties synchronization
              graphConfig: selectedGraphRun.config?.graphConfig,
            }}
          />
        </div>
      </div>
    </SuspenseLoad>
  );
};
