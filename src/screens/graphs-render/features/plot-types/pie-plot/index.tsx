import React, { FC, useContext, useRef, useState, useEffect } from 'react';
import { GraphsRenderContext } from '../../../context';
import { GraphCanvas, GraphCanvasRef } from '../../../plotly-canvas';
import { GraphTools } from '@libs/graphs/tools';
import { useFullScreenHandle, FullScreen } from 'react-full-screen';
import { useGraphStyles } from '@libs/graphs/styles-hook/use-graph-style';
import { useStartProStore } from '@store/main-store';
import { EXCEL } from '@constants';

export const PiePlotGraph: FC = () => {
    const { selectedRun, graphProperties } = useContext(GraphsRenderContext);
    const handle = useFullScreenHandle();
    const plotlyRef = useRef<GraphCanvasRef>(null);
    const [isPlotlyReady, setIsPlotlyReady] = useState(false);
    const classes = useGraphStyles();
    const { projects } = useStartProStore();

    if (!selectedRun?.config?.graphConfig) {
        return <div>No graph configuration found</div>;
    }

    const { graphConfig, workspacePath } = selectedRun.config;

    // Fallback: if workspacePath missing (older runs), resolve from projects by selectedProject/tabName
    const resolvedWorkspacePath =
        workspacePath ||
        projects?.[graphConfig?.selectedProject || '']?.workspacePath ||
        projects?.[selectedRun?.tabName || '']?.workspacePath ||
        '';

    // Monitor when plotly ref becomes available
    useEffect(() => {
        const checkPlotlyReady = () => {
            if (plotlyRef.current?.current && plotlyRef.current?.plotly) {
                setIsPlotlyReady(true);
            }
        };

        // Check immediately
        checkPlotlyReady();

        // Set up interval to check periodically
        const interval = setInterval(checkPlotlyReady, 100);

        return () => clearInterval(interval);
    }, [selectedRun?.id]);

    // Create a proper graph object for the tools
    const graphObject = {
        name: graphConfig?.subType || 'Pie Chart',
        traces: {} as { [key: string]: any }, // Will be populated by the actual plot
        download: [
            { format: 'png', description: 'pngFormat' },
            { format: 'svg', description: 'svgFormat' },
            { format: 'jpeg', description: 'jpegFormat' }
        ]
    };

    return (
        <div className={classes.graph}>
            <FullScreen handle={handle} className={classes.graphCard}>
                <div className={classes.graphCanvas}>
                    <GraphCanvas
                        ref={plotlyRef}
                        key={`graph-${selectedRun?.id || 'new'}`}
                        graphConfig={graphConfig}
                        workspacePath={resolvedWorkspacePath}
                        liveProps={graphProperties}
                    />
                </div>
                <div className={classes.toolsWrapper}>
                    {isPlotlyReady && plotlyRef.current && (
                        <GraphTools
                            handle={handle}
                            plotly={plotlyRef.current}
                            graph={graphObject}
                            dbFileName={workspacePath || ''}
                            dbTableName={EXCEL}
                        />
                    )}
                </div>
            </FullScreen>
        </div>
    );
};

export default PiePlotGraph;
