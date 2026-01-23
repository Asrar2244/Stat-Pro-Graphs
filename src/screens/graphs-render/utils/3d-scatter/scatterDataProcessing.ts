import { DataProcessingConfig, ProcessedSeries } from '../common/types';

/**
 * Process data for 3D Scatter plots
 */
export const process3DScatterData = (config: DataProcessingConfig): ProcessedSeries[] => {
    const { graphConfig, rows, xNames, yNames, zNames } = config;
    const dataFormat = graphConfig.dataFormat || 'XYZ Triplets';
    const series: ProcessedSeries[] = [];

    if (!rows || rows.length === 0) return [];

    // Similar logic to Mesh but producing Series for Scatter

    if (dataFormat === 'XYZ Triplets') {
        // Support multiple XYZ Triplets
        // Iterate through the minimum length of available variable arrays
        const count = Math.min(
            xNames?.length || 0,
            yNames?.length || 0,
            zNames?.length || 0
        );

        for (let i = 0; i < count; i++) {
            const xName = xNames[i];
            const yName = yNames[i];
            const zName = zNames[i];

            if (xName && yName && zName) {
                series.push({
                    xv: rows.map(r => Number(r[xName])),
                    yv: rows.map(r => Number(r[yName])),
                    zv: rows.map(r => Number(r[zName])),
                    label: `${zName} vs ${xName}, ${yName}`,
                    rows: rows
                });
            }
        }
    } else if (dataFormat === 'Many Z') {
        // Generated X, Generated Y, Multiple Z
        // For Scatter, "Many Z" usually implies multiple series sharing the same X/Y grid?
        // Or maybe it implies index-based X/Y?
        // In formatRequirements.ts: "Multiple Z variables with default X and Y scales (10,20,30... and 1,2,3...)"

        // So we generate X and Y based on Z column length?
        // Wait, Z variables are columns. So we have N Z-columns.
        // Do we plot N series? Or one series with multiple Zs? 
        // Usually "Many Z" in Mesh means one surface. In Scatter, it probably means one single cloud or multiple series?
        // Given 3D scatter, multiple Zs usually means multiple clusters if they share X/Y?
        // But here X/Y are generated indices.
        // So row 0: x=10, y=1, z=Z_val.
        // Actually mesh "Many Z" treats columns as Y and rows as X (or vice versa) to form a grid.
        // For scatter, we might just flatten it? 
        // Let's assume we create one series per Z column, or flatten all into one?
        // Let's flatten all into one "manifold" or keep separate. 
        // Standard practice: Multiple Series.

        // However, Mesh defaults X/Y scales.
        // Rows are X (10, 20...), Columns are Y (1, 2...).

        const xValues = rows.map((_, i) => (i + 1) * 10); // 10, 20, 30...

        if (zNames) {
            zNames.forEach((zName, colIndex) => {
                // For each Z column, we have a series of points (x=row_idx, y=col_idx, z=val)
                // Y value is constant for the whole column? Or 1, 2, 3... corresponding to column index?
                // "Y scale (1,2,3...)" refers to columns.
                const yVal = colIndex + 1;

                series.push({
                    xv: xValues,
                    yv: new Array(rows.length).fill(yVal),
                    zv: rows.map(r => Number(r[zName])),
                    label: zName,
                    rows: rows
                });
            });
        }
    } else if (dataFormat === 'XY Many Z') {
        // 1 X, 1 Y, Multiple Z
        // Each Z column creates a series using the same X/Y coordinates.
        const xName = xNames[0];
        const yName = yNames[0];

        if (xName && yName && zNames) {
            const xv = rows.map(r => Number(r[xName]));
            const yv = rows.map(r => Number(r[yName]));

            zNames.forEach(zName => {
                series.push({
                    xv: xv,
                    yv: yv,
                    zv: rows.map(r => Number(r[zName])),
                    label: zName,
                    rows: rows
                });
            });
        }
    }

    return series;
};
