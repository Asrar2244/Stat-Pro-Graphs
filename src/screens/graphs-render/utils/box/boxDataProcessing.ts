import { ProcessedSeries, DataProcessingConfig } from '../common/types';

export const processBoxData = (config: DataProcessingConfig): ProcessedSeries[] => {
    const { graphConfig, rows, xNames, yNames } = config;
    const series: ProcessedSeries[] = [];
    let normalizedFormat = graphConfig?.dataFormat;

    switch (normalizedFormat) {
        case 'Many Y':
            // Vertical Box Plots for each Y variable
            // No X variable, or index
            if (yNames && yNames.length > 0) {
                yNames.forEach(yCol => {
                    const yv: number[] = [];
                    rows.forEach(r => {
                        const val = parseFloat(r[yCol]);
                        if (!isNaN(val)) yv.push(val);
                    });

                    if (yv.length > 0) {
                        series.push({
                            xv: [], // Plotly handles X if omitted, or we can pass name "yCol"
                            yv: yv, // Data
                            label: yCol,
                            subType: 'box'
                        });
                    }
                });
            }
            break;

        case 'X Many Y':
            // Grouped Vertical Box Plots
            // X is the grouping variable.
            if (xNames && xNames.length === 1 && yNames && yNames.length > 0) {
                const xCol = xNames[0];
                yNames.forEach(yCol => {
                    const xv: (string | number)[] = [];
                    const yv: (number)[] = [];

                    rows.forEach(r => {
                        const xVal = r[xCol];
                        const yVal = parseFloat(r[yCol]);
                        if (xVal !== undefined && xVal !== null && !isNaN(yVal)) {
                            xv.push(xVal); // Maintain original type if possible, or string
                            yv.push(yVal);
                        }
                    });

                    if (yv.length > 0) {
                        series.push({
                            xv,
                            yv,
                            label: yCol,
                            subType: 'box'
                        });
                    }
                });
            }
            break;

        case 'Many X':
            // Horizontal Box Plots
            if (xNames && xNames.length > 0) {
                xNames.forEach(xCol => {
                    const xv: number[] = [];
                    rows.forEach(r => {
                        const val = parseFloat(r[xCol]);
                        if (!isNaN(val)) xv.push(val);
                    });

                    if (xv.length > 0) {
                        series.push({
                            xv: xv,
                            yv: [],
                            label: xCol,
                            subType: 'box'
                        });
                    }
                });
            }
            break;

        case 'Y Many X':
            // Grouped Horizontal Box Plots
            if (yNames && yNames.length === 1 && xNames && xNames.length > 0) {
                const yCol = yNames[0];
                xNames.forEach(xCol => {
                    const yv: (string | number)[] = [];
                    const xv: (number)[] = [];

                    rows.forEach(r => {
                        const yVal = r[yCol];
                        const xVal = parseFloat(r[xCol]);
                        if (yVal !== undefined && yVal !== null && !isNaN(xVal)) {
                            yv.push(yVal);
                            xv.push(xVal);
                        }
                    });

                    if (xv.length > 0) {
                        series.push({
                            xv,
                            yv,
                            label: xCol,
                            subType: 'box'
                        });
                    }
                });
            }
            break;
    }

    return series;
};
