/**
 * 3D Scatter trace generation utilities
 */

import { TraceConfig } from '../common/types';

/**
 * Get properly formatted colorscale for Plotly (Reused from Mesh)
 */
const getPlotlyColorScale = (colorScaleName: string): any => {
    // Basic mapping, in production we should reuse the shared utility or import it
    return colorScaleName;
};

/**
 * Create 3D scatter plot trace
 */
export const create3DScatterTrace = (config: TraceConfig): any => {
    const { xv, yv, zv, label, color, graphConfig, rows } = config;

    console.log('3D Scatter Debug - Trace Config:', {
        xvLength: xv?.length,
        yvLength: yv?.length,
        zvLength: zv?.length,
        rowsLength: rows?.length,
        graphConfigVariables: graphConfig?.variables
    });

    // Check if we have valid data
    if (!xv || xv.length === 0 || !yv || yv.length === 0) {
        console.warn('3D Scatter Debug - Missing X or Y data');
        return null;
    }

    // Use provided Z values or extract from rows
    let zValues = zv;
    if (!zValues || zValues.length === 0) {
        // Try to find Z variable in graphConfig
        const zVars = graphConfig?.variables?.z;
        if (zVars && zVars.length > 0 && rows) {
            zValues = rows.map((r: any) => Number(r[zVars[0]]));
        } else {
            // Fallback to 0 if z is missing (should be handled by validation though)
            zValues = new Array(xv.length).fill(0);
        }
    }

    const scatterConfig = graphConfig?.scatterConfig || {};

    const trace = {
        x: xv,
        y: yv,
        z: zValues,
        type: 'scatter3d',
        mode: 'markers',
        name: label,
        marker: {
            size: scatterConfig.markerSize || 5,
            color: color, // Use series color (solid) instead of Z values
            // colorscale: removed to allow solid color
            opacity: scatterConfig.opacity || 0.8,
            showscale: false,
        },
        hoverinfo: 'x+y+z+text',
        text: rows.map((_, i) => `(${xv[i]}, ${yv[i]}, ${zValues?.[i]})`),
    };

    // Apply grid config if needed (handled by layout usually, but some trace props might affect it)
    // 3D scatter grid is mostly layout.

    return trace;
};
