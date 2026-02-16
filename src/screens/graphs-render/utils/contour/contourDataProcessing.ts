/**
 * Contour Plot data processing utilities
 */

import { ProcessedSeries, DataProcessingConfig } from '../common/types';

/**
 * Process data for Contour plots based on format
 */
export const processContourData = (config: DataProcessingConfig): ProcessedSeries[] => {
    const { graphConfig, rows, xNames, yNames, zNames = [] } = config;
    const series: ProcessedSeries[] = [];

    const dataFormat = graphConfig.dataFormat;

    if (dataFormat === 'XYZ Triplets' || dataFormat === 'xyz-columns') {
        // Format 1: XYZ Triplets - 1 X, 1 Y, 1 Z column
        if (xNames?.length >= 1 && yNames?.length >= 1 && zNames?.length >= 1) {
            const xCol = xNames[0];
            const yCol = yNames[0];
            const zCol = zNames[0];

            const xv = rows.map((r: any) => Number(r[xCol]));
            const yv = rows.map((r: any) => Number(r[yCol]));
            const zv = rows.map((r: any) => Number(r[zCol]));

            // Filter invalid data points (NaN, Infinity)
            const validIndices = xv.map((_, i) => i).filter(i =>
                isFinite(xv[i]) && isFinite(yv[i]) && isFinite(zv[i])
            );

            if (validIndices.length > 0) {
                const cleanX = validIndices.map(i => xv[i]);
                const cleanY = validIndices.map(i => yv[i]);
                const cleanZ = validIndices.map(i => zv[i]);

                const label = `${zCol} (Z) vs ${xCol} (X), ${yCol} (Y)`;
                series.push({
                    xv: cleanX,
                    yv: cleanY,
                    zv: cleanZ,
                    label,
                    // Pass the original column names for reference if needed
                    xCol,
                    yCol,
                    zCol
                } as any);
            }
        }
    } else if (dataFormat === 'Many Z' || dataFormat === 'z-matrix') {
        // Format 2: Many Z - First Z and Last Z columns define the range, X and Y are often implied or separate
        // For simplicity, we'll assume X is rows (1..N) and Y is columns (1..M) if not provided, or handle as matrix

        if (zNames?.length >= 1) {
            // Treat each row as a Y value, and each Z column as an X value (or vice-versa depending on convention)
            // Usually: Z values are in a grid.
            // We need to flatten this into X, Y, Z triplets for general contour processing, OR keep it as a 2D Z-array if the grid is regular.
            // Plotly contour traces accept 2D z arrays nicely.

            // Let's create a 2D Z array
            // z[y][x]
            const zMatrix: number[][] = [];

            // Rows are Y dimension
            // Columns (zNames) are X dimension

            rows.forEach(row => {
                const zRow: number[] = [];
                zNames.forEach(col => {
                    zRow.push(Number(row[col]));
                });
                zMatrix.push(zRow);
            });

            // Generate X and Y coordinates if not provided
            // X coordinates correspond to the columns
            // Y coordinates correspond to the rows
            const xCoords = zNames.map((_, i) => i);
            const yCoords = rows.map((_, i) => i);

            // But wait, `ProcessedSeries` expects flat arrays usually (xv, yv).
            // However, for contour plots, it's often better to pass the 2D Z array directly if possible.
            // Let's stick to the `ProcessedSeries` interface which usually has `xv`, `yv` as arrays.
            // If we want to use `type: 'contour'`, we can pass `z` as a 2D array, and `x` and `y` as 1D arrays matching dimensions.

            // Let's pass the 2D array as `zMatrix` in the series object (custom property)
            // and also populate `xv` and `yv` with the 1D coordinate arrays.

            const label = `Contour (${zNames.length} columns x ${rows.length} rows)`;
            series.push({
                label,
                // Custom properties for contour items
                x: xCoords, // 1D array of X coordinates
                y: yCoords, // 1D array of Y coordinates
                z: zMatrix, // 2D array of Z values
                isMatrix: true
            } as any);
        }
    } else if (dataFormat === 'XY Many Z' || dataFormat === 'xy-z-columns') {
        // Format 3: XY Many Z - 1 X column, 1 Y column, but wait... usually XY columns are for scatter.
        // "XY Many Z" usually means X column, Y column, and Z columns.
        // If it's a grid, specific structure is needed.
        // Let's assume consistent with `meshDataProcessing.ts`:
        // It creates a mesh surface from XY + multiple Z columns.

        // We will follow the same pattern as Many Z but use the X/Y columns if they define the grid.
        // Actually, "XY Many Z" in `meshDataProcessing` seemed to average first and last Z? That was weird logic for a mesh.

        // Let's assume standard behavior:
        // If we have X and Y columns, they might define the coordinates for the rows.
        // And Z columns...

        // For now, let's stick to the most robust "XYZ Triplets" and "Many Z" (Matrix) support.
        // If the User picks "XY Many Z", we'll try to treat it like XYZ Triplets if possible or Matrix.

        // Fallback to XYZ Triplets logic if we have 1X, 1Y, 1Z.
        if (xNames?.length >= 1 && yNames?.length >= 1 && zNames?.length >= 1) {
            // Same as XYZ Triplets logic
            const xCol = xNames[0];
            const yCol = yNames[0];
            const zCol = zNames[0]; // Just take first Z for now

            const xv = rows.map((r: any) => Number(r[xCol]));
            const yv = rows.map((r: any) => Number(r[yCol]));
            const zv = rows.map((r: any) => Number(r[zCol]));

            // Filter invalid
            const validIndices = xv.map((_, i) => i).filter(i =>
                isFinite(xv[i]) && isFinite(yv[i]) && isFinite(zv[i])
            );

            if (validIndices.length > 0) {
                series.push({
                    xv: validIndices.map(i => xv[i]),
                    yv: validIndices.map(i => yv[i]),
                    zv: validIndices.map(i => zv[i]),
                    label: `${zCol} vs ${xCol}, ${yCol}`,
                    xCol, yCol, zCol
                } as any);
            }
        }
    }

    return series;
};
