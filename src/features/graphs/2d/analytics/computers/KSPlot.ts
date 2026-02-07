import { AnalyticsComputer, AnalyticsPlotConfig } from './types';

export const KSPlotComputer: AnalyticsComputer = {
    type: 'KS_PLOT',
    displayName: 'KS Plot',
    description: 'Kolmogorov-Smirnov plot used to measure the separation between positive and negative class distributions.',

    variableRequirements: [
        {
            id: 'target',
            label: 'Value Variable (X-axis)',
            description: 'Column containing the values/thresholds',
            type: 'numeric',
            minCount: 1,
            maxCount: 1
        },
        {
            id: 'predictor',
            label: 'Cumulative Probabilities (Y-axis)',
            description: 'Select one or two columns representing the cumulative distributions',
            type: 'numeric',
            minCount: 1,
            maxCount: 2
        }
    ],

    validate(variables: Record<string, string[]>) {
        const target = variables['target'];
        const predictor = variables['predictor'];

        if (!target || target.length !== 1) return { isValid: false, error: 'Please select exactly one Target variable' };
        if (!predictor || predictor.length < 1) return { isValid: false, error: 'Please select at least one Predictor variable' };

        return { isValid: true };
    },

    compute(data: any[], variables: Record<string, string[]>, options?: any): AnalyticsPlotConfig {
        const targetCol = variables['target'][0];
        const predictorCols = variables['predictor'];

        const traces: any[] = [];
        let ksDistance = 0;
        let ksThreshold = 0;
        let ksY0 = 0;
        let ksY1 = 0;

        if (!data || data.length === 0) {
            return {
                plotType: 'line',
                subType: 'KS Plot',
                data: [],
                layout: { xaxis: { title: 'Value' }, yaxis: { title: 'Cumulative Probability' } }
            };
        }

        // Mode: Pre-computed CDFs
        // If 2 predictors: [Value (Target), CDF1 (Pred[0]), CDF2 (Pred[1])]
        // If 1 predictor:  [FPR/CDF1 (Target), TPR/CDF2 (Pred[0])] -> uses Target as baseline
        const hasTwoPreds = predictorCols.length >= 2;
        const y1Col = predictorCols[0];
        const y2Col = hasTwoPreds ? predictorCols[1] : targetCol;

        let points = data.map(row => ({
            x: Number(row[targetCol]),
            y1: Number(row[y1Col]),
            y2: Number(row[y2Col])
        })).filter(pt => !isNaN(pt.x) && !isNaN(pt.y1) && !isNaN(pt.y2));

        if (points.length === 0) return { plotType: 'line', data: [], layout: {} };

        points.sort((a, b) => a.x - b.x);

        const xPoints = points.map(p => p.x);
        const y1Points = points.map(p => p.y1);
        const y2Points = points.map(p => p.y2);

        // Find KS Distance
        for (let i = 0; i < points.length; i++) {
            const dist = Math.abs(points[i].y1 - points[i].y2);
            if (dist > ksDistance) {
                ksDistance = dist;
                ksThreshold = points[i].x;
                ksY0 = points[i].y2;
                ksY1 = points[i].y1;
            }
        }

        traces.push({
            x: xPoints,
            y: y1Points,
            name: predictorCols[0],
            line: { color: '#1f77b4' }
        });
        traces.push({
            x: xPoints,
            y: y2Points,
            name: hasTwoPreds ? predictorCols[1] : `Baseline (${targetCol})`,
            line: { color: '#ff7f0e', dash: hasTwoPreds ? 'solid' : 'dash' }
        });

        // Only show KS Distance arrow/annotation if there's data
        if (ksDistance > 0) {
            // 1. Vertical Guide Line (from 0 to max CDF)
            traces.push({
                x: [ksThreshold, ksThreshold],
                y: [0, Math.max(ksY0, ksY1)],
                mode: 'lines',
                line: { color: 'rgba(128, 128, 128, 0.4)', width: 1, dash: 'dot' },
                showlegend: false,
                hoverinfo: 'none'
            });

            // 2. Highlighting markers on the curves
            traces.push({
                x: [ksThreshold, ksThreshold],
                y: [ksY0, ksY1],
                mode: 'markers',
                marker: {
                    color: ['#ff7f0e', '#1f77b4'],
                    size: 8,
                    symbol: 'circle',
                    line: { color: 'white', width: 1 }
                },
                showlegend: false,
                hoverinfo: 'skip'
            });

            // 3. Render KS Distance as a Double-Headed Arrow (Dimension Line)
            traces.push({
                x: [ksThreshold, ksThreshold],
                y: [ksY0, ksY1],
                name: `K-S Distance = ${ksDistance.toFixed(3)}`,
                mode: 'lines+markers',
                line: { color: '#d62728', width: 2.5, dash: 'dash' },
                marker: {
                    symbol: ['triangle-up', 'triangle-down'],
                    size: 12,
                    color: '#d62728'
                },
                showlegend: true,
                hoverinfo: 'none'
            });
        }

        return {
            plotType: 'line',
            subType: 'KS Plot',
            data: traces,
            layout: {
                xaxis: { title: 'Value' },
                yaxis: { title: 'Cumulative Probability', range: [0, 1.05] }
            },
            annotations: ksDistance > 0 ? [
                {
                    x: ksThreshold,
                    y: (ksY0 + ksY1) / 2,
                    text: `<b>D<sub>KS</sub> = ${ksDistance.toFixed(3)}</b>`,
                    showarrow: true,
                    arrowhead: 0,
                    ax: 40,
                    ay: 0,
                    font: { size: 13, color: '#d62728' },
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    bordercolor: '#d62728',
                    borderwidth: 1.5,
                    borderpad: 5,
                    xanchor: 'left'
                }
            ] : []
        };
    }
};
