import { ProcessedSeries, DataProcessingConfig } from '../common/types';

// Helper to parse values consistently - use parseFloat to be more permissible (like Box Plot)
const parseValue = (val: any): number | null => {
    if (val === null || val === undefined || val === '') return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
};

// Helper for categorical aggregation (like Pie Chart)
const aggregateCategoricalData = (rows: any[], colName: string) => {
    const counts = new Map<string, number>();
    rows.forEach(r => {
        const val = r[colName];
        if (val !== null && val !== undefined && val !== '') {
            const key = String(val);
            counts.set(key, (counts.get(key) || 0) + 1);
        }
    });
    return {
        labels: Array.from(counts.keys()),
        values: Array.from(counts.values())
    };
};

export const processBarData = (config: DataProcessingConfig): ProcessedSeries[] => {
    const { graphConfig, rows, xNames, yNames, categoryNames, errorBarNames } = config;
    let normalizedFormat = graphConfig?.dataFormat;

    // Detect if this is a horizontal bar plot
    const subType = graphConfig?.subType || '';
    const isHorizontal = subType.toLowerCase().includes('horizontal');

    // Normalize format logic (same as scatter)
    if (normalizedFormat === 'Single X' && xNames?.length > 0 && yNames?.length > 0) {
        normalizedFormat = 'X Many Y';
    } else if (normalizedFormat === 'Single Y' && xNames?.length > 0 && yNames?.length > 0) {
        normalizedFormat = 'Y Many X';
    }
    if (normalizedFormat === 'Single X' && (!xNames || xNames.length === 0) && (yNames && yNames.length > 0)) {
        normalizedFormat = 'Single Y';
    } else if (normalizedFormat === 'Single Y' && (!yNames || yNames.length === 0) && (xNames && xNames.length > 0)) {
        normalizedFormat = 'Single X';
    }

    const series: ProcessedSeries[] = [];

    // Helper to get error bar column for a given Y column index
    const getErrorBarCol = (index: number) => {
        if (errorBarNames && errorBarNames.length > index) {
            return errorBarNames[index];
        }
        return undefined;
    };

    // --- Standard Bar Processing ---

    switch (normalizedFormat) {
        case 'Single Y': // Plot Row Index vs Y Value
            if (yNames && yNames.length > 0) {
                const yCol = yNames[0];
                const errorBarCol = getErrorBarCol(0);

                const cleanX: number[] = [];
                const cleanY: number[] = [];
                const cleanError: number[] = [];

                rows.forEach((r, i) => {
                    const val = parseValue(r[yCol]);
                    if (val !== null) {
                        cleanX.push(i + 1);
                        cleanY.push(val);
                        if (errorBarCol) {
                            const errVal = parseValue(r[errorBarCol]);
                            cleanError.push(errVal !== null ? errVal : 0);
                        }
                    }
                });

                if (cleanY.length > 0) {
                    const s: any = {
                        // For horizontal bars, swap x and y so values are on x-axis
                        xv: isHorizontal ? cleanY : cleanX,
                        yv: isHorizontal ? cleanX : cleanY,
                        label: yCol,
                        subType: graphConfig.subType
                    };
                    if (errorBarCol && cleanError.length > 0) {
                        s.errorBarData = cleanError;
                        s.errorBarVariable = errorBarCol;
                    }
                    series.push(s);
                }
            }
            break;

        case 'Single X': // Plot X Value vs Row Index
            if (xNames && xNames.length > 0) {
                const xCol = xNames[0];
                const cleanX: number[] = [];
                const cleanY: number[] = [];
                rows.forEach((r, i) => {
                    const val = parseValue(r[xCol]);
                    if (val !== null) {
                        cleanX.push(val);
                        cleanY.push(i + 1);
                    }
                });

                if (cleanX.length > 0) {
                    series.push({
                        xv: cleanX,
                        yv: cleanY,
                        label: xCol,
                        subType: graphConfig.subType
                    });
                }
            }
            break;

        case 'Many X': // Multiple X columns vs Row Index
            if (xNames && xNames.length > 0) {
                xNames.forEach((xCol) => {
                    const cleanX: number[] = [];
                    const cleanY: number[] = [];
                    rows.forEach((r, i) => {
                        const val = parseValue(r[xCol]);
                        if (val !== null) {
                            cleanX.push(val);
                            cleanY.push(i + 1);
                        }
                    });

                    if (cleanX.length > 0) {
                        series.push({
                            // For horizontal bars, swap x and y so values are on x-axis
                            xv: isHorizontal ? cleanX : cleanX,
                            yv: isHorizontal ? cleanY : cleanY,
                            label: xCol,
                            subType: graphConfig.subType
                        });
                    }
                });
            }
            break;

        case 'X Many Y': // X column vs Multiple Y columns
            if (xNames && xNames.length > 0 && yNames && yNames.length > 0) {
                const xCol = xNames[0];
                yNames.forEach((yCol, i) => {
                    const errorBarCol = getErrorBarCol(i);
                    const cleanX: number[] = [];
                    const cleanY: number[] = [];
                    const cleanError: number[] = [];

                    rows.forEach(r => {
                        // For Bar charts, X is often categorical (string), but here we handle numeric/string
                        // If standard bar plot, X can be string.
                        // Let's assume X can be anything, Y must be numeric.
                        const yVal = parseValue(r[yCol]);
                        // Only filter if Y is invalid. X can be anything.
                        if (yVal !== null) {
                            cleanX.push(r[xCol]); // Keep raw X value (likely string or number)
                            cleanY.push(yVal);
                            if (errorBarCol) {
                                const errVal = parseValue(r[errorBarCol]);
                                cleanError.push(errVal !== null ? errVal : 0);
                            }
                        }
                    });

                    if (cleanY.length > 0) {
                        const s: any = {
                            // For horizontal bars, swap x and y so values are on x-axis
                            xv: isHorizontal ? cleanY : cleanX,
                            yv: isHorizontal ? cleanX : cleanY,
                            label: yCol,
                            subType: graphConfig.subType
                        };
                        if (errorBarCol && cleanError.length > 0) {
                            s.errorBarData = cleanError;
                            s.errorBarVariable = errorBarCol;
                        }
                        series.push(s);
                    }
                });
            }
            break;

        case 'XY Pair': // Paired X and Y columns (X1-Y1, X2-Y2, etc.)
            // Logic: Iterate over xNames and yNames in parallel
            // If lengths differ, use the shorter length
            if (xNames && yNames) {
                const count = Math.min(xNames.length, yNames.length);
                for (let i = 0; i < count; i++) {
                    const xCol = xNames[i];
                    const yCol = yNames[i];
                    const errorBarCol = getErrorBarCol(i);

                    const cleanX: any[] = [];
                    const cleanY: number[] = [];
                    const cleanError: number[] = [];

                    rows.forEach(r => {
                        const yVal = parseValue(r[yCol]);
                        // Only filter if Y is invalid. X can be anything (string/number) for Bar Plot labels/positions
                        if (yVal !== null) {
                            cleanX.push(r[xCol]); // Preserve raw X value
                            cleanY.push(yVal);
                            if (errorBarCol) {
                                const errVal = parseValue(r[errorBarCol]);
                                cleanError.push(errVal !== null ? errVal : 0);
                            }
                        }
                    });

                    if (cleanY.length > 0) {
                        const s: any = {
                            xv: cleanX,
                            yv: cleanY,
                            label: yCol, // Use Y column name as label by default, or maybe complex label?
                            subType: graphConfig.subType
                        };
                        if (errorBarCol && cleanError.length > 0) {
                            s.errorBarData = cleanError;
                            s.errorBarVariable = errorBarCol;
                        }
                        series.push(s);
                    }
                }
            }
            break;

        case 'Many Y': // Index vs Multiple Y columns
            if (yNames && yNames.length > 0) {
                yNames.forEach((yCol, i) => {
                    const errorBarCol = getErrorBarCol(i);
                    const cleanX: number[] = [];
                    const cleanY: number[] = [];
                    const cleanError: number[] = [];

                    rows.forEach((r, idx) => {
                        const yVal = parseValue(r[yCol]);
                        if (yVal !== null) {
                            cleanX.push(idx + 1);
                            cleanY.push(yVal);
                            if (errorBarCol) {
                                const errVal = parseValue(r[errorBarCol]);
                                cleanError.push(errVal !== null ? errVal : 0);
                            }
                        }
                    });

                    if (cleanY.length > 0) {
                        const s: any = {
                            // For horizontal bars, swap x and y so values are on x-axis
                            xv: isHorizontal ? cleanY : cleanX,
                            yv: isHorizontal ? cleanX : cleanY,
                            label: yCol,
                            subType: graphConfig.subType
                        };
                        if (errorBarCol && cleanError.length > 0) {
                            s.errorBarData = cleanError;
                            s.errorBarVariable = errorBarCol;
                        }
                        series.push(s);
                    }
                });
            }
            break;

        // Add other cases as needed, but Single Y is the critical one reported.
        default:
            // Fallback to empty or try Many Y if Y names exist
            if (yNames && yNames.length > 0) {
                // Try Many Y logic as fallback
                yNames.forEach((yCol, i) => {
                    const cleanX: number[] = [];
                    const cleanY: number[] = [];
                    rows.forEach((r, idx) => {
                        const yVal = parseValue(r[yCol]);
                        if (yVal !== null) {
                            cleanX.push(idx + 1);
                            cleanY.push(yVal);
                        }
                    });
                    if (cleanY.length > 0) {
                        series.push({
                            // For horizontal bars, swap x and y so values are on x-axis
                            xv: isHorizontal ? cleanY : cleanX,
                            yv: isHorizontal ? cleanX : cleanY,
                            label: yCol,
                            subType: graphConfig.subType
                        });
                    }
                });
            }
            break;
    }

    return series;
};
