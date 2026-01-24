import { DataProcessingConfig, ProcessedSeries } from '../common/types';

export const processPieData = (config: DataProcessingConfig): ProcessedSeries[] => {
    const { rows, xNames, yNames, graphConfig } = config;

    const series: ProcessedSeries[] = [];

    // yNames contains the Value variable(s)
    // xNames contains the Label variable(s)

    yNames.forEach((valueCol, index) => {
        const labelCol = xNames[index] || xNames[0];

        // Extract raw values first
        const rawY = rows.map(r => r[valueCol]);

        // Detect if column is numeric
        // Check a sample of non-null values
        const validSamples = rawY.filter(v => v !== null && v !== undefined && v !== '');
        if (validSamples.length === 0) return; // Empty column

        const numericCount = validSamples.filter(v => !isNaN(Number(v))).length;
        const isNumeric = (numericCount / validSamples.length) > 0.8; // 80% numeric threshold

        let finalY: number[] = [];
        let finalX: (string | number)[] = [];

        if (isNumeric) {
            // Standard Mode: Values are numbers, Labels are provided or generated
            const rawX = labelCol ? rows.map(r => r[labelCol]) : [];

            // Filter pairs where Y is valid number
            for (let i = 0; i < rawY.length; i++) {
                const val = Number(rawY[i]);
                if (!isNaN(val)) {
                    finalY.push(val);
                    if (labelCol) {
                        finalX.push(rawX[i]);
                    }
                }
            }

            // If no labels provided, leave finalX empty (Plotly handles it or we can generate)
            // If no labels provided, generate them (ColumnName Index: Value)
            if (finalX.length === 0 && finalY.length > 0) {
                finalX = finalY.map((val, i) => `${valueCol} ${i + 1}: ${val}`);
            }
        } else {
            // Categorical Mode: Auto-aggregate (Count occurrences)
            // Ignore provided Labels (xNames) because we are aggregating the Value column itself

            const counts = new Map<string, number>();
            rawY.forEach(val => {
                if (val === null || val === undefined) return;
                const key = String(val);
                counts.set(key, (counts.get(key) || 0) + 1);
            });

            finalX = Array.from(counts.keys()); // Labels (Categories)
            finalY = Array.from(counts.values()); // Values (Counts)
        }

        // AGGREGATION LOGIC: If too many slices, aggregate into "Other"
        // This prevents the "vertical strip of labels" issue
        const MAX_SLICES = 20;
        if (finalY.length > MAX_SLICES) {
            // Create array of objects to sort
            const combined = finalY.map((y, i) => ({ x: finalX[i], y })).sort((a, b) => b.y - a.y);

            const topN = combined.slice(0, MAX_SLICES);
            const others = combined.slice(MAX_SLICES);

            const otherSum = others.reduce((sum, item) => sum + item.y, 0);

            finalX = topN.map(item => item.x);
            finalY = topN.map(item => item.y);

            if (otherSum > 0) {
                finalX.push('Other');
                finalY.push(otherSum);
            }

            console.log(`[PieDebug] Aggregated ${combined.length} slices into ${MAX_SLICES} + Other`);
        }

        console.log('[PieDebug] Processed Series:', {
            valueCol,
            isNumeric,
            finalYLength: finalY.length,
            finalXLength: finalX.length,
            sampleY: finalY.slice(0, 5)
        });

        series.push({
            xv: finalX,
            yv: finalY,
            label: valueCol,
            subType: graphConfig.subType
        });
    });

    return series;
};
