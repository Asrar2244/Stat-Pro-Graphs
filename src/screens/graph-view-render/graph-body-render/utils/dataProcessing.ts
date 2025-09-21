/**
 * Data processing utilities for plotly graphs
 * Handles different data formats and variable processing
 */

export interface DataProcessingConfig {
  graphConfig: any;
  rows: any[];
  xNames: string[];
  yNames: string[];
  categoryNames?: string[];
}

export interface ProcessedSeries {
  xv: number[];
  yv: number[];
  label: string;
}

/**
 * Process data based on different data formats
 */
export const processDataByFormat = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames, categoryNames = [] } = config;
  const series: ProcessedSeries[] = [];
  
  // Handle different data formats
  if ((graphConfig.dataFormat === 'XY Pair') && xNames?.length && yNames?.length) {
    // XY Pair: plot Y vs X
    const xCol = xNames[0];
    yNames.forEach((y) => {
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => Number(r[y]));
      series.push({ xv, yv, label: `${y} vs ${xCol}` });
    });
  } else if ((graphConfig.dataFormat === 'XY Pairs') && xNames?.length && yNames?.length) {
    // XY Pairs: pair each X[i] with Y[i]
    const pairCount = Math.min(xNames.length, yNames.length);
    for (let i = 0; i < pairCount; i++) {
      const xCol = xNames[i];
      const yCol = yNames[i];
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => Number(r[yCol]));
      series.push({ xv, yv, label: `${yCol} vs ${xCol}` });
    }
  } else if ((graphConfig.dataFormat === 'X Many Y') && xNames?.length && yNames?.length) {
    // One X vs many Ys
    const xCol = xNames[0];
    const xv = rows.map((r: any) => Number(r[xCol]));
    yNames.forEach((y) => {
      const yv = rows.map((r: any) => Number(r[y]));
      series.push({ xv, yv, label: `${y} vs ${xCol}` });
    });
  } else if ((graphConfig.dataFormat === 'Y Many X') && xNames?.length && yNames?.length) {
    // Many X vs one Y (invert typical pairing): plot each X against the single Y
    const yCol = yNames[0];
    const yv = rows.map((r: any) => Number(r[yCol]));
    xNames.forEach((x) => {
      const xv = rows.map((r: any) => Number(r[x]));
      series.push({ xv, yv, label: `${yCol} vs ${x}` });
    });
  } else if (graphConfig.dataFormat === 'Many X' && xNames?.length) {
    // Many X vs index
    xNames.forEach((x) => {
      const xv = rows.map((_: any, i: number) => i + 1);
      const yv = rows.map((r: any) => Number(r[x]));
      series.push({ xv, yv, label: x });
    });
  } else if (graphConfig.dataFormat === 'Many Y' && yNames?.length) {
    // Many Y vs index
    yNames.forEach((y) => {
      const xv = rows.map((_: any, i: number) => i + 1);
      const yv = rows.map((r: any) => Number(r[y]));
      series.push({ xv, yv, label: y });
    });
  } else if (graphConfig.dataFormat === 'XY Category' && xNames?.length && yNames?.length) {
    // XY Category: plot Y vs X with category grouping
    if (categoryNames?.length > 0) {
      // Group by category
      const categoryCol = categoryNames[0];
      const categoryGroups = new Map<string, any[]>();
      
      rows.forEach((row) => {
        const category = row[categoryCol];
        if (!categoryGroups.has(category)) {
          categoryGroups.set(category, []);
        }
        categoryGroups.get(category)!.push(row);
      });
      
      // Create series for each category
      categoryGroups.forEach((groupRows, category) => {
        const xCol = xNames[0];
        groupRows.forEach((row) => {
          yNames.forEach((y) => {
            const xv = groupRows.map((r: any) => Number(r[xCol]));
            const yv = groupRows.map((r: any) => Number(r[y]));
            series.push({ xv, yv, label: `${y} vs ${xCol} (${category})` });
          });
        });
      });
    } else {
      // No category grouping
      const xCol = xNames[0];
      yNames.forEach((y) => {
        const xv = rows.map((r: any) => Number(r[xCol]));
        const yv = rows.map((r: any) => Number(r[y]));
        series.push({ xv, yv, label: `${y} vs ${xCol}` });
      });
    }
  } else if (graphConfig.dataFormat === 'X Category' && xNames?.length) {
    // X Category: plot X values with category grouping
    if (categoryNames?.length > 0) {
      // Group by category
      const categoryCol = categoryNames[0];
      const categoryGroups = new Map<string, any[]>();
      
      rows.forEach((row) => {
        const category = row[categoryCol];
        if (!categoryGroups.has(category)) {
          categoryGroups.set(category, []);
        }
        categoryGroups.get(category)!.push(row);
      });
      
      // Create series for each category
      categoryGroups.forEach((groupRows, category) => {
        xNames.forEach((x) => {
          const xv = groupRows.map((_: any, i: number) => i + 1);
          const yv = groupRows.map((r: any) => Number(r[x]));
          series.push({ xv, yv, label: `${x} (${category})` });
        });
      });
    } else {
      // No category grouping
      xNames.forEach((x) => {
        const xv = rows.map((_: any, i: number) => i + 1);
        const yv = rows.map((r: any) => Number(r[x]));
        series.push({ xv, yv, label: x });
      });
    }
  } else if (graphConfig.dataFormat === 'Y Category' && yNames?.length) {
    // Y Category: plot Y values with category grouping
    if (categoryNames?.length > 0) {
      // Group by category
      const categoryCol = categoryNames[0];
      const categoryGroups = new Map<string, any[]>();
      
      rows.forEach((row) => {
        const category = row[categoryCol];
        if (!categoryGroups.has(category)) {
          categoryGroups.set(category, []);
        }
        categoryGroups.get(category)!.push(row);
      });
      
      // Create series for each category
      categoryGroups.forEach((groupRows, category) => {
        yNames.forEach((y) => {
          const xv = groupRows.map((_: any, i: number) => i + 1);
          const yv = groupRows.map((r: any) => Number(r[y]));
          series.push({ xv, yv, label: `${y} (${category})` });
        });
      });
    } else {
      // No category grouping
      yNames.forEach((y) => {
        const xv = rows.map((_: any, i: number) => i + 1);
        const yv = rows.map((r: any) => Number(r[y]));
        series.push({ xv, yv, label: y });
      });
    }
  } else if (graphConfig.dataFormat === 'Single X' && xNames?.length) {
    // Single X: plot X values against row indices
    xNames.forEach((x) => {
      const xv = rows.map((_: any, i: number) => i + 1);
      const yv = rows.map((r: any) => Number(r[x]));
      series.push({ xv, yv, label: x });
    });
  } else if (graphConfig.dataFormat === 'Single Y' && yNames?.length) {
    // Single Y: plot Y values against row indices
    yNames.forEach((y) => {
      const xv = rows.map((_: any, i: number) => i + 1);
      const yv = rows.map((r: any) => Number(r[y]));
      series.push({ xv, yv, label: y });
    });
  } else if (graphConfig.dataFormat === 'XY Size' && xNames?.length && yNames?.length) {
    // XY Size: plot X vs Y with size encoding (requires size column - not implemented yet)
    const xCol = xNames[0];
    yNames.forEach((y) => {
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => Number(r[y]));
      series.push({ xv, yv, label: `${y} vs ${xCol}` });
    });
  } else if (graphConfig.dataFormat === 'X Size' && xNames?.length) {
    // X Size: plot X vs index with size encoding (requires size column - not implemented yet)
    xNames.forEach((x) => {
      const xv = rows.map((_: any, i: number) => i + 1);
      const yv = rows.map((r: any) => Number(r[x]));
      series.push({ xv, yv, label: x });
    });
  } else if (graphConfig.dataFormat === 'Y Size' && yNames?.length) {
    // Y Size: plot Y vs index with size encoding (requires size column - not implemented yet)
    yNames.forEach((y) => {
      const xv = rows.map((_: any, i: number) => i + 1);
      const yv = rows.map((r: any) => Number(r[y]));
      series.push({ xv, yv, label: y });
    });
  } else if (graphConfig.dataFormat === 'Matrix' && xNames?.length && yNames?.length) {
    // Matrix: plot matrix data (requires matrix structure - simplified implementation)
    const xCol = xNames[0];
    yNames.forEach((y) => {
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => Number(r[y]));
      series.push({ xv, yv, label: `${y} vs ${xCol}` });
    });
  } else if (graphConfig.dataFormat === 'Density' && xNames?.length && yNames?.length) {
    // Density: plot density scatter (requires density calculation - simplified implementation)
    const xCol = xNames[0];
    yNames.forEach((y) => {
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => Number(r[y]));
      series.push({ xv, yv, label: `${y} vs ${xCol}` });
    });
  } else if (graphConfig.dataFormat === 'Polar' && xNames?.length && yNames?.length) {
    // Polar: plot polar coordinates (requires polar conversion - simplified implementation)
    const xCol = xNames[0];
    yNames.forEach((y) => {
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => Number(r[y]));
      series.push({ xv, yv, label: `${y} vs ${xCol}` });
    });
  } else if (graphConfig.dataFormat === 'XYZ' && xNames?.length && yNames?.length) {
    // XYZ: plot 3D scatter (requires Z column - simplified implementation)
    const xCol = xNames[0];
    yNames.forEach((y) => {
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => Number(r[y]));
      series.push({ xv, yv, label: `${y} vs ${xCol}` });
    });
  } else {
    // Fallback to old logic for backward compatibility
    if (xNames?.length && yNames?.length) {
      const xCol = xNames[0];
      yNames.forEach((y) => {
        const xv = rows.map((r: any) => Number(r[xCol]));
        const yv = rows.map((r: any) => Number(r[y]));
        series.push({ xv, yv, label: `${y} vs ${xCol}` });
      });
    } else if (xNames?.length) {
      xNames.forEach((x) => {
        const xv = rows.map((_: any, i: number) => i + 1);
        const yv = rows.map((r: any) => Number(r[x]));
        series.push({ xv, yv, label: x });
      });
    } else if (yNames?.length) {
      yNames.forEach((y) => {
        const xv = rows.map((_: any, i: number) => i + 1);
        const yv = rows.map((r: any) => Number(r[y]));
        series.push({ xv, yv, label: y });
      });
    }
  }
  
  return series;
};
