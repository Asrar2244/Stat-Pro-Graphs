import { TraceConfig } from '../common/types';

export const createBoxTrace = (config: TraceConfig, traceIndex: number = 0): any => {
    const { xv, yv, label, color, graphConfig } = config;

    const orientation = graphConfig?.orientation || 'vertical';
    const boxWidth = graphConfig?.boxWidth || 0.5;
    const showMean = graphConfig?.showMean ?? true;
    const showOutliers = graphConfig?.showOutliers ?? true;
    const showAllPoints = graphConfig?.showAllPoints ?? false;

    const trace: any = {
        name: label,
        type: 'box',
        boxpoints: showAllPoints ? 'all' : (showOutliers ? 'outliers' : false),
        jitter: 0.3,
        pointpos: 0, // Center points (outliers) inline with whiskers, SigmaPlot style
        marker: {
            color: color,
            symbol: 'circle',
            size: 4
        },
        line: {
            width: 1.5
        },
        fillcolor: color, // Usually lighter manually, but Plotly handles opacity
        boxmean: showMean ? 'sd' : false, // 'sd' shows mean and std dev, 'true' shows mean
        width: boxWidth
    };

    const dataFormat = graphConfig?.dataFormat || 'Many Y';

    // Determine Value vs Category data based on format
    // X Many Y / Many Y: Y is Value, X is Category
    // Y Many X / Many X: X is Value, Y is Category
    const isYValue = dataFormat === 'Many Y' || dataFormat === 'X Many Y';

    // Value Data: The numerical data to compute stats on
    // Category Data: The grouping variable
    const valueData = isYValue ? yv : xv;
    let categoryData = isYValue ? xv : yv;

    // Logic Update:
    // 1. For "Many X" and "Many Y" (no grouping var): Position at 1, 2, 3, etc. (Index + 1)
    if (dataFormat === 'Many Y' || dataFormat === 'Many X') {
        const position = traceIndex + 1;
        categoryData = Array(valueData?.length || 0).fill(position);
    }
    // 2. For "X Many Y" and "Y Many X":
    //    User Requirement: Map Y1 to X[0], Y2 to X[1], etc.
    //    This treats the Grouping Column (X for Vert, Y for Horiz) as a list of positions for the Series.
    //    We use the value at 'traceIndex' from the grouping column.
    else if (dataFormat === 'X Many Y' || dataFormat === 'Y Many X') {
        // Grouping column is xv for Vertical (X Many Y), yv for Horizontal (Y Many X)
        // Note: For Y Many X, yv is the grouping/category column
        const groupingColumn = isYValue ? xv : yv;

        let positionVal = traceIndex + 1; // Fallback

        if (groupingColumn && groupingColumn.length > traceIndex) {
            positionVal = groupingColumn[traceIndex];
        }

        categoryData = Array(valueData?.length || 0).fill(positionVal);
    }

    if (orientation === 'vertical') {
        // Vertical: Y axis is Value, X axis is Category
        trace.y = valueData;
        if (categoryData && categoryData.length > 0) {
            trace.x = categoryData;
        }
        trace.orientation = 'v';
    } else {
        // Horizontal: X axis is Value, Y axis is Category
        trace.x = valueData;
        if (categoryData && categoryData.length > 0) {
            trace.y = categoryData;
        }
        trace.orientation = 'h';
    }

    return trace;
};
