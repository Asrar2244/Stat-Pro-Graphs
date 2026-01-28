import { TraceConfig } from '../traceGeneration';
import { calculateErrorValues } from '../errorCalculations';

export const createBarTrace = (config: TraceConfig): any => {
    const {
        xv, yv, label, color, subType, symbolValue,
        errorCalculationUpper, errorCalculationLower,
        errorBarVariable, errorBarData, rows
    } = config;

    console.log('[PieDebug] createBarTrace Input:', {
        xvLength: xv?.length,
        yvLength: yv?.length,
        xvSample: xv?.slice(0, 5),
        yvSample: yv?.slice(0, 5),
        label,
        subType
    });

    const lowerSubType = subType.toLowerCase();
    const isHorizontal = lowerSubType.includes('horizontal');
    const isStacked = lowerSubType.includes('stacked');
    const isGrouped = lowerSubType.includes('grouped') || (!isStacked && !lowerSubType.includes('simple')); // Default to grouped if multiple traces?

    // Basic trace config
    const trace: any = {
        type: 'bar',
        name: label,
        marker: {
            color: color,
            line: {
                color: 'rgba(0,0,0,0)', // No border by default for cleaner look, or maybe black?
                width: 1
            }
        },
        // Orientation defaults to 'v' unless horizontal
        orientation: isHorizontal ? 'h' : 'v'
    };

    // Assign data to trace
    // Note: Plotly's orientation parameter handles the axis interpretation
    // orientation: 'v' (vertical) - x is category axis, y is value axis
    // orientation: 'h' (horizontal) - x is value axis, y is category axis
    trace.x = xv;
    trace.y = yv;

    console.log('[BarTrace] Orientation:', trace.orientation, 'xLength:', xv?.length, 'yLength:', yv?.length, 'xSample:', xv?.slice(0, 3), 'ySample:', yv?.slice(0, 3));

    // Error Bars
    const isErrorBar = lowerSubType.includes('error bar');
    const isAsymmetricErrorBar = (lowerSubType.includes('asymmetric') || symbolValue === 'Asymmetric Error Bar') && isErrorBar;

    if (isErrorBar) {
        let errorBarDataForCalculation: number[] | undefined;

        // Prioritize pre-extracted errorBarData from barDataProcessing (already filtered and aligned)
        if (errorBarData && Array.isArray(errorBarData) && errorBarData.length > 0) {
            errorBarDataForCalculation = errorBarData;
        } else if (errorBarVariable && rows) {
            // Fallback: map from rows (may not align with filtered xv/yv)
            errorBarDataForCalculation = rows.map((row: any) => {
                const value = row[errorBarVariable];
                return typeof value === 'number' ? value : parseFloat(value) || 0;
            });
        }

        const errorValues = calculateErrorValues({
            xv, yv, symbolValue: symbolValue || '',
            subType: subType || '',
            errorCalculationUpper, errorCalculationLower,
            errorBarData: errorBarDataForCalculation,
        });

        const errorBarStyle = {
            thickness: 1.5,
            width: 3,
            opacity: 0.9,
            color: 'rgba(0,0,0,0.8)'
        };

        if (isHorizontal) {
            // Horizontal bars have error bars on X axis
            if (isAsymmetricErrorBar) {
                trace.error_x = {
                    type: 'data',
                    symmetric: false,
                    array: errorValues.xUpper,
                    arrayminus: errorValues.xLower,
                    visible: true,
                    color: errorBarStyle.color,
                    thickness: errorBarStyle.thickness,
                    width: errorBarStyle.width
                };
            } else {
                trace.error_x = {
                    type: 'data',
                    symmetric: true,
                    array: errorValues.xSymmetric, // Usually mean/std dev are calculated on VALUES (X for horizontal?)
                    // Wait, calculateErrorValues assumes Y is the value axis unless specified?
                    // I need to check calculateErrorValues to see if it handles orientation.
                    // Assuming it returns objects with 'xSymmetric' etc.
                    // If the Values are in X (horizontal bar), we usually want error on X.
                    visible: true,
                    color: errorBarStyle.color,
                    thickness: errorBarStyle.thickness,
                    width: errorBarStyle.width
                };

                // If generic calculation used Y, but we need X?
                // This depends on how calculateErrorValues works.
                // Let's assume for now it returns both or we map correctly.
                // If errorValues has 'xSymmetric' populated correctly for horizontal case.
                if (!errorValues.xSymmetric && errorValues.ySymmetric) {
                    // Swap if needed?
                    trace.error_x.array = errorValues.ySymmetric;
                } else {
                    trace.error_x.array = errorValues.xSymmetric;
                }
            }
        } else {
            // Vertical bars have error bars on Y axis
            if (isAsymmetricErrorBar) {
                trace.error_y = {
                    type: 'data',
                    symmetric: false,
                    array: errorValues.yUpper,
                    arrayminus: errorValues.yLower,
                    visible: true,
                    color: errorBarStyle.color,
                    thickness: errorBarStyle.thickness,
                    width: errorBarStyle.width
                };
            } else {
                trace.error_y = {
                    type: 'data',
                    symmetric: true,
                    array: errorValues.ySymmetric,
                    visible: true,
                    color: errorBarStyle.color,
                    thickness: errorBarStyle.thickness,
                    width: errorBarStyle.width
                };
            }
        }
    }

    return trace;
};
