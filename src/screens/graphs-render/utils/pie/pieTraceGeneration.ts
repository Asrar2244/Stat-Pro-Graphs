import { TraceConfig } from '../common/types';

export const createPieTrace = (config: TraceConfig): any => {
    const { xv, yv, label, graphConfig } = config;

    // Check if X data appears to be auto-generated indices (1, 2, 3...)
    // If so, and we haven't explicitly asked for labels, we might prefer no labels or row numbers.
    // But plotly handles array of labels fine.

    // Consolidate usage:
    // yv is the "Values" (Numeric)
    // xv is the "Labels" (Categorical/Text)

    // If the dataFormat was "Single Y", xv might be indices.

    const trace: any = {
        type: 'pie',
        values: yv,
        labels: xv,
        name: label,

        // Visuals
        textinfo: 'percent', // Show percentage on the slice
        hoverinfo: 'label+value+percent',
        automargin: true, // Handle long labels

        marker: {
            colors: undefined, // Let Plotly assign colors or use SigmaPlot palette if needed
            line: {
                color: '#fff',
                width: 1
            }
        },

        // Layout options (can be overridden by graphConfig)
        pull: 0, // Pull out slices
        hole: 0, // 0 for Pie, >0 for Donut
        direction: 'clockwise',
        sort: false, // Keep data order? Or sort? Standard is usually largest to smallest or data order.
    };

    return trace;
};
