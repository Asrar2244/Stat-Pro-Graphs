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
  errorBarVariable?: string;
}

/**
 * Process data based on different data formats
 */
export const processDataByFormat = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames, categoryNames = [] } = config;
  const series: ProcessedSeries[] = [];
  const errorBarVars = graphConfig.variables?.errorBar || [];
  
  
  
  // Handle different data formats
  if ((graphConfig.dataFormat === 'XY Pair') && xNames?.length && yNames?.length) {
    // XY Pair: pair each X[i] with Y[i] (X1↔Y1, X2↔Y2, etc.)
    const pairCount = Math.min(xNames.length, yNames.length);
    for (let i = 0; i < pairCount; i++) {
      const xCol = xNames[i];
      const yCol = yNames[i];
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => Number(r[yCol]));
      const errorBarVar = errorBarVars[i] || errorBarVars[0]; // Use i-th error bar or fallback to first
      const label = `${yCol} vs ${xCol}`;
      series.push({ xv, yv, label, errorBarVariable: errorBarVar });
    }
  } else if ((graphConfig.dataFormat === 'XY Pairs') && xNames?.length && yNames?.length) {
    // XY Pairs: pair each X[i] with Y[i]
    const pairCount = Math.min(xNames.length, yNames.length);
    for (let i = 0; i < pairCount; i++) {
      const xCol = xNames[i];
      const yCol = yNames[i];
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => Number(r[yCol]));
      const errorBarVar = errorBarVars[i] || errorBarVars[0]; // Use i-th error bar or fallback to first
      const label = `${yCol} vs ${xCol}`;
      series.push({ xv, yv, label, errorBarVariable: errorBarVar });
    }
  } else if ((graphConfig.dataFormat === 'X Many Y') && xNames?.length && yNames?.length) {
    // One X vs many Ys (uses first X variable with all Y variables)
    const xCol = xNames[0];
    const xv = rows.map((r: any) => Number(r[xCol]));
    yNames.forEach((y, index) => {
      const yv = rows.map((r: any) => Number(r[y]));
      const errorBarVar = errorBarVars[index] || errorBarVars[0]; // Use index-th error bar or fallback to first
      const label = `${y} vs ${xCol}`;
      series.push({ xv, yv, label, errorBarVariable: errorBarVar });
    });
  } else if ((graphConfig.dataFormat === 'Y Many X') && xNames?.length && yNames?.length) {
    // Many X vs one Y (invert typical pairing): plot each X against the single Y
    const yCol = yNames[0];
    const yv = rows.map((r: any) => Number(r[yCol]));
    xNames.forEach((x, index) => {
      const xv = rows.map((r: any) => Number(r[x]));
      const errorBarVar = errorBarVars[index] || errorBarVars[0]; // Use index-th error bar or fallback to first
      series.push({ xv, yv, label: `${yCol} vs ${x}`, errorBarVariable: errorBarVar });
    });
  } else if (graphConfig.dataFormat === 'Many X' && xNames?.length) {
    // Many X only: keep X on horizontal axis, index on vertical axis
    xNames.forEach((x, index) => {
      const xv = rows.map((r: any) => Number(r[x]));
      const yv = rows.map((_: any, i: number) => i + 1);
      const errorBarVar = errorBarVars[index] || errorBarVars[0]; // Use index-th error bar or fallback to first
      series.push({ xv, yv, label: `${x} vs index`, errorBarVariable: errorBarVar });
    });
  } else if (graphConfig.dataFormat === 'Many Y' && yNames?.length) {
    // Many Y vs index
    yNames.forEach((y, index) => {
      const xv = rows.map((_: any, i: number) => i + 1);
      const yv = rows.map((r: any) => Number(r[y]));
      const errorBarVar = errorBarVars[index] || errorBarVars[0]; // Use index-th error bar or fallback to first
      series.push({ xv, yv, label: y, errorBarVariable: errorBarVar });
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
    // X Category: plot X values vs index with category-based color/shape styling
    if (categoryNames?.length > 0) {
      // Group by category for color/shape differentiation
      const categoryCol = categoryNames[0];
      const categoryGroups = new Map<string, any[]>();
      
      rows.forEach((row) => {
        const category = row[categoryCol];
        if (!categoryGroups.has(category)) {
          categoryGroups.set(category, []);
        }
        categoryGroups.get(category)!.push(row);
      });
      
      // Create series for each category with proper X vs index plotting
      categoryGroups.forEach((groupRows, category) => {
        xNames.forEach((x) => {
          const xv = groupRows.map((r: any) => Number(r[x]));
          const yv = groupRows.map((_: any, i: number) => i + 1); // Index-based Y values
          const errorBarVar = errorBarVars[0]; // Use first error bar if available
          
          console.log(`📊 X Category series data for "${x} (${category})":`, {
            xvSample: xv.slice(0, 5),
            yvSample: yv.slice(0, 5),
            dataLength: xv.length,
            hasValidData: xv.length > 0 && yv.length > 0
          });
          
          series.push({ xv, yv, label: `${x} (${category})`, errorBarVariable: errorBarVar });
        });
      });
    } else {
      // No category grouping - plot X vs index
      xNames.forEach((x) => {
        const xv = rows.map((r: any) => Number(r[x]));
        const yv = rows.map((_: any, i: number) => i + 1);
        const errorBarVar = errorBarVars[0]; // Use first error bar if available
        series.push({ xv, yv, label: `${x} vs index`, errorBarVariable: errorBarVar });
      });
    }
  } else if (graphConfig.dataFormat === 'Y Category' && yNames?.length) {
    // Y Category: plot Y values vs index with category-based color/shape styling
    if (categoryNames?.length > 0) {
      // Group by category for color/shape differentiation
      const categoryCol = categoryNames[0];
      const categoryGroups = new Map<string, any[]>();
      
      rows.forEach((row) => {
        const category = row[categoryCol];
        if (!categoryGroups.has(category)) {
          categoryGroups.set(category, []);
        }
        categoryGroups.get(category)!.push(row);
      });
      
      // Create series for each category with proper Y vs index plotting
      categoryGroups.forEach((groupRows, category) => {
        yNames.forEach((y) => {
          const xv = groupRows.map((_: any, i: number) => i + 1); // Index-based X values
          const yv = groupRows.map((r: any) => Number(r[y]));
          const errorBarVar = errorBarVars[0]; // Use first error bar if available
          
          console.log(`📊 Y Category series data for "${y} (${category})":`, {
            xvSample: xv.slice(0, 5),
            yvSample: yv.slice(0, 5),
            dataLength: xv.length,
            hasValidData: xv.length > 0 && yv.length > 0
          });
          
          series.push({ xv, yv, label: `${y} (${category})`, errorBarVariable: errorBarVar });
        });
      });
    } else {
      // No category grouping - plot Y vs index
      yNames.forEach((y) => {
        const xv = rows.map((_: any, i: number) => i + 1);
        const yv = rows.map((r: any) => Number(r[y]));
        const errorBarVar = errorBarVars[0]; // Use first error bar if available
        series.push({ xv, yv, label: y, errorBarVariable: errorBarVar });
      });
    }
  } else if (graphConfig.dataFormat === 'Single X' && xNames?.length) {
    // Single X: require at least one Y for proper X-axis anchoring;
    // if no Y provided, plot X on the X-axis vs index on the Y-axis so X remains the horizontal axis.
    const xCol = xNames[0];
    if (yNames?.length) {
      const xv = rows.map((r: any) => Number(r[xCol]));
      yNames.forEach((y) => {
        const yv = rows.map((r: any) => Number(r[y]));
        series.push({ xv, yv, label: `${y} vs ${xCol}` });
      });
    } else {
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((_: any, i: number) => i + 1);
      series.push({ xv, yv, label: `${xCol} vs index` });
    }
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
    // X Size: plot X on horizontal axis vs index on vertical (size encoding TBD)
    xNames.forEach((x) => {
      const xv = rows.map((r: any) => Number(r[x]));
      const yv = rows.map((_: any, i: number) => i + 1);
      series.push({ xv, yv, label: `${x} vs index` });
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
