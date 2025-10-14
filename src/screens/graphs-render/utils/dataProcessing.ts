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
    // X Many Y: One X column with multiple Y columns representing replicates
    // Each Y column represents replicates at a specific X position
    const xCol = xNames[0];
    const xv = rows.map((r: any) => Number(r[xCol]));
    
    // Check if this is a line plot
    const isLinePlot = graphConfig.subType?.toLowerCase().includes('straight line') || 
                       graphConfig.subType?.toLowerCase().includes('spline curve') || 
                       graphConfig.subType?.toLowerCase().includes('step plot') || 
                       graphConfig.subType?.toLowerCase().includes('vertical step') ||
                       graphConfig.subType?.toLowerCase().includes('horizontal step') ||
                       graphConfig.subType?.toLowerCase().includes('multiple straight') ||
                       graphConfig.subType?.toLowerCase().includes('multiple spline') ||
                       graphConfig.subType?.toLowerCase().includes('multiple vertical') ||
                       graphConfig.subType?.toLowerCase().includes('multiple horizontal') ||
                       graphConfig.subType?.toLowerCase().includes('area');
    
    if (isLinePlot) {
      // For line plots: create one series per Y column, connecting values across X positions
      yNames.forEach((y, yIndex) => {
        const yv = rows.map((r: any) => Number(r[y]));
        const errorBarVar = errorBarVars[yIndex] || errorBarVars[0];
        series.push({ xv, yv, label: `${y}`, errorBarVariable: errorBarVar });
      });
    } else {
      // For scatter plots: create replicate points at each X position
      yNames.forEach((y, yIndex) => {
        // Get the X value for this Y column (each Y column corresponds to one X position)
        const xValueForThisY = xv[yIndex]; // Use the Y column index to get corresponding X value
        
        // Get all replicate values from this Y column
        const yv = rows.map((r: any) => Number(r[y]));
        
        // Create points: (xValueForThisY, y1), (xValueForThisY, y2), (xValueForThisY, y3), ...
        const replicateXv = yv.map(() => xValueForThisY);
        
        const errorBarVar = errorBarVars[yIndex] || errorBarVars[0];
        series.push({ xv: replicateXv, yv, label: `${y} at X=${xValueForThisY}`, errorBarVariable: errorBarVar });
      });
    }
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
    // Many Y: Multiple Y columns representing replicates at sequential X positions
    // Check if this is a line plot
    const isLinePlot = graphConfig.subType?.toLowerCase().includes('straight line') || 
                       graphConfig.subType?.toLowerCase().includes('spline curve') || 
                       graphConfig.subType?.toLowerCase().includes('step plot') || 
                       graphConfig.subType?.toLowerCase().includes('vertical step') ||
                       graphConfig.subType?.toLowerCase().includes('horizontal step') ||
                       graphConfig.subType?.toLowerCase().includes('multiple straight') ||
                       graphConfig.subType?.toLowerCase().includes('multiple spline') ||
                       graphConfig.subType?.toLowerCase().includes('multiple vertical') ||
                       graphConfig.subType?.toLowerCase().includes('multiple horizontal') ||
                       graphConfig.subType?.toLowerCase().includes('area');
    
    if (isLinePlot) {
      // For line plots: create one series per Y column with sequential X positions (like Many X but for Y)
      yNames.forEach((y, yIndex) => {
        const yv = rows.map((r: any) => Number(r[y]));
        const xv = rows.map((_: any, i: number) => i + 1); // Sequential X positions: 1, 2, 3, ...
        
        const errorBarVar = errorBarVars[yIndex] || errorBarVars[0];
        series.push({ xv, yv, label: `${y}`, errorBarVariable: errorBarVar });
      });
    } else {
      // For scatter plots: create replicate points at each X position
      yNames.forEach((y, yIndex) => {
        const xValueForThisY = yIndex + 1; // Sequential X positions: 1, 2, 3, ...
        
        // Get all replicate values from this Y column
        const yv = rows.map((r: any) => Number(r[y]));
        
        // Create points: (xValueForThisY, y1), (xValueForThisY, y2), (xValueForThisY, y3), ...
        const replicateXv = yv.map(() => xValueForThisY);
        
        const errorBarVar = errorBarVars[yIndex] || errorBarVars[0];
        series.push({ xv: replicateXv, yv, label: `${y} at X=${xValueForThisY}`, errorBarVariable: errorBarVar });
      });
    }
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
      // Check if this is a point plot
      const isPointPlot = graphConfig.subType?.toLowerCase().includes('point plot');
      
      if (isPointPlot && xNames.length === 1 && categoryNames.length === 1) {
        // Special handling for point plots: X Category format
        // Y-axis: Category names, X-axis: X values stacked at each category
        const xCol = xNames[0];
        const categoryCol = categoryNames[0];
        const categoryGroups = new Map<string, number[]>();
        
        // Group X values by category
        rows.forEach((row) => {
          const category = row[categoryCol];
          const xValue = Number(row[xCol]);
          if (!isNaN(xValue)) {
            if (!categoryGroups.has(category)) {
              categoryGroups.set(category, []);
            }
            categoryGroups.get(category)!.push(xValue);
          }
        });
        
        // Create series for each category with stacked X values
        const categories = Array.from(categoryGroups.keys());
        categories.forEach((category, categoryIndex) => {
          const xValues = categoryGroups.get(category)!;
          // For point plots, use category index as Y position and stack X values
          const xv = xValues; // All X values for this category
          const yv = xValues.map(() => categoryIndex + 1); // Fixed Y position for this category
          const errorBarVar = errorBarVars[0]; // Use first error bar if available
          
          console.log(`📊 X Category Point Plot for "${category}":`, {
            category,
            categoryIndex,
            xvSample: xv.slice(0, 5),
            yvSample: yv.slice(0, 5),
            dataLength: xv.length,
            hasValidData: xv.length > 0 && yv.length > 0
          });
          
          series.push({ xv, yv, label: category, errorBarVariable: errorBarVar });
        });
      } else {
        // Standard X Category processing for non-point plots
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
      }
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
      // Check if this is a point plot
      const isPointPlot = graphConfig.subType?.toLowerCase().includes('point plot');
      
      if (isPointPlot && yNames.length === 1 && categoryNames.length === 1) {
        // Special handling for point plots: Y Category format
        // X-axis: Category names, Y-axis: Y values stacked at each category
        const yCol = yNames[0];
        const categoryCol = categoryNames[0];
        const categoryGroups = new Map<string, number[]>();
        
        // Group Y values by category
        rows.forEach((row) => {
          const category = row[categoryCol];
          const yValue = Number(row[yCol]);
          if (!isNaN(yValue)) {
            if (!categoryGroups.has(category)) {
              categoryGroups.set(category, []);
            }
            categoryGroups.get(category)!.push(yValue);
          }
        });
        
        // Create series for each category with stacked Y values
        const categories = Array.from(categoryGroups.keys());
        categories.forEach((category, categoryIndex) => {
          const yValues = categoryGroups.get(category)!;
          // For point plots, use category index as X position and stack Y values
          const xv = yValues.map(() => categoryIndex + 1); // Fixed X position for this category
          const yv = yValues; // All Y values for this category
          const errorBarVar = errorBarVars[0]; // Use first error bar if available
          
          console.log(`📊 Y Category Point Plot for "${category}":`, {
            category,
            categoryIndex,
            xvSample: xv.slice(0, 5),
            yvSample: yv.slice(0, 5),
            dataLength: xv.length,
            hasValidData: xv.length > 0 && yv.length > 0
          });
          
          series.push({ xv, yv, label: category, errorBarVariable: errorBarVar });
        });
      } else {
        // Standard Y Category processing for non-point plots
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
      }
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
  } else if (['X Many Y Replicates', 'Many Y Replicates', 'Y Many X Replicates'].includes(graphConfig.dataFormat || '') && xNames?.length && yNames?.length) {
    // X Many Y Replicates: Each X variable has multiple Y replicates
    // For point plots: group Y replicates by X position
    const isPointPlot = graphConfig.subType?.toLowerCase().includes('point plot');
    
    if (isPointPlot) {
      if (graphConfig.dataFormat === 'Y Many X Replicates') {
        // Special handling for Y Many X Replicates (horizontal point plots)
        // Y variables are the main variables, X variables are replicates
        yNames.forEach((yCol, yIndex) => {
          // const yv = rows.map((r: any) => Number(r[yCol])); // Not used in this logic
          
          // Calculate how many X variables belong to this Y variable
          // Assuming X variables are grouped: X1,X2 for Y1, X3,X4 for Y2, etc.
          const xVarsPerY = Math.floor(xNames.length / yNames.length);
          const startXIndex = yIndex * xVarsPerY;
          const endXIndex = Math.min(startXIndex + xVarsPerY, xNames.length);
          
          // Get X variables for this Y variable
          const xVarsForThisY = xNames.slice(startXIndex, endXIndex);
          
          console.log(`📊 Y Many X Replicates Point Plot - Y${yIndex + 1} (${yCol}):`, {
            yCol,
            yIndex,
            xVarsForThisY,
            xVarsPerY,
            startXIndex,
            endXIndex
          });
          
          // Collect all X replicate values for this Y variable
          const xvForThisY: number[] = [];
          const yvForThisY: number[] = [];
          
          // For each X variable belonging to this Y variable
          xVarsForThisY.forEach((xCol) => {
            rows.forEach((row) => {
              const xValue = Number(row[xCol]);
              const yValue = Number(row[yCol]);
              
              if (!isNaN(xValue) && !isNaN(yValue)) {
                xvForThisY.push(xValue);
                yvForThisY.push(yValue);
              }
            });
          });
          
          console.log(`📊 Y Many X Replicates Point Plot - Y${yIndex + 1} (${yCol}):`, {
            yCol,
            xvForThisY: xvForThisY.slice(0, 10),
            yvForThisY: yvForThisY.slice(0, 10),
            dataLength: xvForThisY.length,
            xVarsForThisY
          });
          
          if (xvForThisY.length > 0) {
            const errorBarVar = errorBarVars[yIndex] || errorBarVars[0];
            series.push({ 
              xv: xvForThisY, 
              yv: yvForThisY, 
              label: `${yCol}`, 
              errorBarVariable: errorBarVar 
            });
          }
        });
      } else {
        // Special handling for X Many Y Replicates and Many Y Replicates (vertical point plots)
        // Group Y replicates by X position
        xNames.forEach((xCol, xIndex) => {
          // const xv = rows.map((r: any) => Number(r[xCol])); // Not used in this logic
          
          // Calculate how many Y variables belong to this X variable
          // Assuming Y variables are grouped: Y1,Y2 for X1, Y3,Y4 for X2, etc.
          const yVarsPerX = Math.floor(yNames.length / xNames.length);
          const startYIndex = xIndex * yVarsPerX;
          const endYIndex = Math.min(startYIndex + yVarsPerX, yNames.length);
          
          // Get Y variables for this X variable
          const yVarsForThisX = yNames.slice(startYIndex, endYIndex);
          
          console.log(`📊 X Many Y Replicates Point Plot - X${xIndex + 1} (${xCol}):`, {
            xCol,
            xIndex,
            yVarsForThisX,
            yVarsPerX,
            startYIndex,
            endYIndex
          });
          
          // Collect all Y replicate values for this X variable at each X position
          const xvForThisX: number[] = [];
          const yvForThisX: number[] = [];
          
          // For each Y variable belonging to this X variable
          yVarsForThisX.forEach((yCol) => {
            rows.forEach((row) => {
              const xValue = Number(row[xCol]);
              const yValue = Number(row[yCol]);
              
              if (!isNaN(xValue) && !isNaN(yValue)) {
                xvForThisX.push(xValue);
                yvForThisX.push(yValue);
              }
            });
          });
          
          console.log(`📊 X Many Y Replicates Point Plot - X${xIndex + 1} (${xCol}):`, {
            xCol,
            xvForThisX: xvForThisX.slice(0, 10),
            yvForThisX: yvForThisX.slice(0, 10),
            dataLength: xvForThisX.length,
            yVarsForThisX
          });
          
          if (xvForThisX.length > 0) {
            const errorBarVar = errorBarVars[xIndex] || errorBarVars[0];
            series.push({ 
              xv: xvForThisX, 
              yv: yvForThisX, 
              label: `${xCol}`, 
              errorBarVariable: errorBarVar 
            });
          }
        });
      }
    } else {
      // Standard processing for non-point plots
      xNames.forEach((xCol, xIndex) => {
        const xv = rows.map((r: any) => Number(r[xCol]));
        
        // Calculate how many Y variables belong to this X variable
        const yVarsPerX = Math.floor(yNames.length / xNames.length);
        const startYIndex = xIndex * yVarsPerX;
        const endYIndex = Math.min(startYIndex + yVarsPerX, yNames.length);
        
        // Get Y variables for this X variable
        const yVarsForThisX = yNames.slice(startYIndex, endYIndex);
        
        yVarsForThisX.forEach((yCol) => {
          const yv = rows.map((r: any) => Number(r[yCol]));
          const errorBarVar = errorBarVars[xIndex] || errorBarVars[0];
          series.push({ xv, yv, label: `${yCol} vs ${xCol}`, errorBarVariable: errorBarVar });
        });
      });
    }
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
