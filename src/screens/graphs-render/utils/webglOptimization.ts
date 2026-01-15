/**
 * WebGL optimization utilities for big data rendering
 */

/**
 * Determine if WebGL should be used based on data size and graph type
 */
export const shouldUseWebGL = (dataSize: number, graphType: string): boolean => {
    const WEBGL_THRESHOLD_2D = 5000; // Use WebGL for 2D graphs with 5K+ points
    const WEBGL_THRESHOLD_3D = 1000; // Use WebGL for 3D graphs with 1K+ points (already uses WebGL)

    const is3D = graphType?.toLowerCase().includes('3d') ||
        graphType?.toLowerCase().includes('mesh');

    if (is3D) {
        // 3D graphs already use WebGL (scatter3d, mesh3d, surface)
        return dataSize > WEBGL_THRESHOLD_3D;
    }

    // For 2D graphs, use scattergl for large datasets
    return dataSize > WEBGL_THRESHOLD_2D;
};

/**
 * Get the appropriate trace type for optimal performance
 */
export const getOptimalTraceType = (
    baseType: string,
    dataSize: number,
    graphType: string
): string => {
    // 3D types already use WebGL
    if (baseType === 'scatter3d' || baseType === 'mesh3d' || baseType === 'surface') {
        return baseType;
    }

    // For 2D scatter plots, use scattergl for large datasets
    if (baseType === 'scatter' && shouldUseWebGL(dataSize, graphType)) {
        return 'scattergl';
    }

    return baseType;
};

/**
 * Convert trace to WebGL-compatible format
 */
export const optimizeTraceForWebGL = (trace: any, dataSize: number, graphType: string): any => {
    const optimalType = getOptimalTraceType(trace.type || 'scatter', dataSize, graphType);

    if (optimalType === 'scattergl') {
        return {
            ...trace,
            type: 'scattergl',
            // scattergl has some limitations - simplify marker config
            marker: {
                ...trace.marker,
                // Remove unsupported properties for scattergl
                gradient: undefined
            }
        };
    }

    return trace;
};
