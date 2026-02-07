import { AnalyticsComputer, AnalyticsPlotConfig, AnalyticsVariableRequirement } from './types';

export const ROCCurveComputer: AnalyticsComputer = {
    type: 'ROC_CURVE',
    displayName: 'ROC Curve',
    description: 'Receiver Operating Characteristic curve illustrating the diagnostic ability of a binary classifier system.',
    variableRequirements: (config: Record<string, any>) => {
        const isXYPairs = config.dataFormat === 'XY Pairs';
        return [
            {
                id: 'target',
                label: isXYPairs ? 'FPR Variable (X-axis)' : 'Target Variable (Actual)',
                description: isXYPairs ? 'Column containing pre-computed False Positive Rate values (0-1)' : 'Binary variable reflecting the ground truth (0/1 or True/False)',
                type: isXYPairs ? 'numeric' : 'categorical',
                minCount: 1,
                maxCount: 1
            },
            {
                id: 'predictor',
                label: isXYPairs ? 'TPR Variable (Y-axis)' : 'Predictor Variable (Probability)',
                description: isXYPairs ? 'Column containing pre-computed True Positive Rate values (0-1)' : 'Numerical probability score or confidence level (must be between 0 and 1)',
                type: 'numeric',
                minCount: 1,
                maxCount: undefined // Allow multiple predictors for comparison in both modes
            }
        ];
    },

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

        if (!data || data.length === 0) {
            return {
                plotType: 'line',
                subType: 'ROC Curve',
                data: [],
                layout: { xaxis: { title: 'False Positive Rate' }, yaxis: { title: 'True Positive Rate' } }
            };
        }

        const traces: any[] = [];

        predictorCols.forEach(predictorCol => {
            // Step 0: Extract and validate data
            let points = data.map(row => ({
                t: Number(row[targetCol]),
                p: Number(row[predictorCol])
            })).filter(pt => !isNaN(pt.t) && !isNaN(pt.p));

            if (points.length === 0) return;

            // Determine Mode: Pre-computed (XY Pairs) vs Raw Classification
            const uniqueTargets = Array.from(new Set(points.map(pt => pt.t))).sort((a, b) => a - b);
            const isPreComputed = options?.dataFormat === 'XY Pairs' || (options?.dataFormat === undefined && uniqueTargets.length > 2);

            let fprPoints: number[] = [];
            let tprPoints: number[] = [];
            let auc = 0;

            if (isPreComputed) {
                // Mode A: Pre-computed FPR/TPR (Target=FPR, Predictor=TPR)
                // Just sort by FPR and plot
                points.sort((a, b) => a.t - b.t); // Sort by FPR (X)

                fprPoints = points.map(pt => pt.t);
                tprPoints = points.map(pt => pt.p);

                // Compute AUC
                for (let i = 1; i < fprPoints.length; i++) {
                    const x0 = fprPoints[i - 1];
                    const x1 = fprPoints[i];
                    const y0 = tprPoints[i - 1];
                    const y1 = tprPoints[i];
                    auc += (x1 - x0) * (y1 + y0) / 2;
                }
            } else {
                // Mode B: Raw Classification (Target=Label, Predictor=Probability)

                // Binarize Logic (Strict 0/1)
                if (uniqueTargets.length === 2) {
                    const high = uniqueTargets[1];
                    points = points.map(pt => ({ t: pt.t === high ? 1 : 0, p: pt.p }));
                } else if (uniqueTargets.length === 1) {
                    return; // Invalid single class
                }
                // (Note: >2 case is handled by isPreComputed block now, effectively disabling continuous target thresholding for ROC)
                // If user really wants continuous-target-thresholding, they are out of luck, but ROC usually implies discrete labels.

                // Step 1: Sort by Predicted Probability Descending
                points.sort((a, b) => b.p - a.p);

                const totalPositive = points.filter(pt => pt.t === 1).length;
                const totalNegative = points.length - totalPositive;

                fprPoints = [0];
                tprPoints = [0];
                let tp = 0;
                let fp = 0;

                // Step 2 & 3: Iterate Thresholds
                for (let i = 0; i < points.length; i++) {
                    if (points[i].t === 1) tp++;
                    else fp++;

                    if (i === points.length - 1 || points[i].p !== points[i + 1].p) {
                        tprPoints.push(totalPositive > 0 ? tp / totalPositive : 0);
                        fprPoints.push(totalNegative > 0 ? fp / totalNegative : 0);
                    }
                }

                // Step 4: Ensure (1,1)
                if (tprPoints[tprPoints.length - 1] !== 1 || fprPoints[fprPoints.length - 1] !== 1) {
                    tprPoints.push(1);
                    fprPoints.push(1);
                }

                // Step 6: Compute AUC using the trapezoidal rule
                for (let i = 1; i < fprPoints.length; i++) {
                    auc += (fprPoints[i] - fprPoints[i - 1]) * (tprPoints[i] + tprPoints[i - 1]) / 2;
                }
            }

            const getAUCInterpretation = (auc: number): string => {
                if (auc >= 0.9) return 'Outstanding';
                if (auc >= 0.8) return 'Excellent';
                if (auc >= 0.7) return 'Acceptable';
                if (auc >= 0.6) return 'Poor';
                return 'Low Discrimination';
            };

            const interpretation = getAUCInterpretation(auc);

            traces.push({
                x: fprPoints,
                y: tprPoints,
                name: `${predictorCol} (AUC = ${auc.toFixed(3)} - ${interpretation})`,
                auc: auc,
                interpretation
            });
        });

        return {
            plotType: 'line',
            subType: 'ROC Curve',
            data: traces,
            layout: {
                xaxis: { title: 'False Positive Rate', range: [0, 1] },
                yaxis: { title: 'True Positive Rate', range: [0, 1] }
            },
            referenceLines: [
                {
                    type: 'diagonal',
                    from: [0, 0],
                    to: [1, 1],
                    label: 'Random Model',
                    dash: 'dash'
                }
            ],
            annotations: traces.length === 1 ? [
                {
                    x: 0.95,
                    y: 0.05,
                    xref: 'paper',
                    yref: 'paper',
                    text: `AUC = ${traces[0].auc.toFixed(3)}<br><b>${traces[0].interpretation}</b>`,
                    showarrow: false,
                    xanchor: 'right',
                    yanchor: 'bottom',
                    font: { size: 14 },
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    bordercolor: 'rgba(0, 0, 0, 0.1)',
                    borderwidth: 1,
                    borderpad: 4
                }
            ] : []
        };
    }
};
