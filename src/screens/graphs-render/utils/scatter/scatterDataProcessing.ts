/**
 * Scatter plot data processing utilities
 */

import { ProcessedSeries, DataProcessingConfig } from '../common/types';
import { ScatterDataConfig } from './types';

/**
 * Process data for scatter plots based on format
 */
export const processScatterData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames, categoryNames = [] } = config;
  const series: ProcessedSeries[] = [];

  console.log(`🔍 Processing Scatter Data:`, {
    dataFormat: graphConfig.dataFormat,
    xNames,
    yNames,
    categoryNames,
    rowCount: rows.length
  });

  // Normalize data format
  let normalizedFormat = graphConfig?.dataFormat;
  
  // Special handling for bidirectional asymmetric error bars - use XY Pairs format
  const isBidirectionalAsymmetricErrorBar = graphConfig?.subType?.toLowerCase().includes('bidirectional') && 
                                           graphConfig?.subType?.toLowerCase().includes('asymmetric') &&
                                           graphConfig?.subType?.toLowerCase().includes('error bar');
  
  if (isBidirectionalAsymmetricErrorBar) {
    normalizedFormat = 'XY Pairs';
    console.log('🔍 Bidirectional Asymmetric Error Bar detected - using XY Pairs format');
  }
  
  // If Single X with both X and Y present → behave as X Many Y
  if (normalizedFormat === 'Single X' && xNames?.length > 0 && yNames?.length > 0) {
    normalizedFormat = 'X Many Y';
  } else if (normalizedFormat === 'Single Y' && xNames?.length > 0 && yNames?.length > 0) {
    normalizedFormat = 'Y Many X';
  }
  
  // Respect whichever variables the user passed:
  // - If Single X but only Y provided → treat as Single Y (plot Y vs index)
  // - If Single Y but only X provided → treat as Single X (plot X vs index)
  if (normalizedFormat === 'Single X' && (!xNames || xNames.length === 0) && (yNames && yNames.length > 0)) {
    normalizedFormat = 'Single Y';
  } else if (normalizedFormat === 'Single Y' && (!yNames || yNames.length === 0) && (xNames && xNames.length > 0)) {
    normalizedFormat = 'Single X';
  }

  // Check if this is a category-based plot
  const isCategoryPlot = categoryNames && categoryNames.length > 0;
  const isCategoryFormat = normalizedFormat?.toLowerCase().includes('category');

  if (isCategoryPlot && isCategoryFormat) {
    return processCategoryScatterData(config, normalizedFormat);
  }

  // Process different scatter plot formats
  switch (normalizedFormat) {
    case 'Single X':
      return processSingleXData(config);
    case 'Single Y':
      return processSingleYData(config);
    case 'X Many Y':
      return processXManyYData(config);
    case 'Y Many X':
      return processYManyXData(config);
    case 'Many X':
      return processManyXData(config);
    case 'Many Y':
      return processManyYData(config);
    case 'XY Pairs':
    case 'XY Pair':  // Handle singular form
      return processXYPairsData(config);
    case 'YX Pairs':
      return processYXPairsData(config);
    // Replicate formats
    case 'X Single Y Replicate':
      return processXSingleYReplicateData(config);
    case 'Y Replicate':
      return processYReplicateData(config);
    case 'X Many Y Replicates':
      return processXManyYReplicatesData(config);
    case 'Many Y Replicates':
      return processManyYReplicatesData(config);
    case 'Y Many X Replicates':
      return processYManyXReplicatesData(config);
    case 'Many X Replicates':
      return processManyXReplicatesData(config);
    case 'X Replicates':
      return processXReplicatesData(config);
    case 'Y Single X Replicates':
      return processYSingleXReplicatesData(config);
    case 'Y Many X Replicates':
      return processYManyXReplicatesData(config);
    // Category-Many formats
    case 'Category Many Y':
      return processCategoryManyYData(config);
    case 'Category Many X':
      return processCategoryManyXData(config);
    default:
      console.warn(`Unknown scatter data format: ${normalizedFormat}`);
      return [];
  }
};

/**
 * Process Single X data format
 */
const processSingleXData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames } = config;
  const series: ProcessedSeries[] = [];

  if (xNames?.length >= 1) {
    const xCol = xNames[0];
    const xv = rows.map((r: any) => Number(r[xCol]));
    const yv = rows.map((_, index) => index + 1); // Row indices as Y values
    
    const label = `${xCol} (X) vs Row Index (Y)`;
    series.push({ xv, yv, label });
  }

  return series;
};

/**
 * Process Single Y data format
 */
const processSingleYData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, yNames } = config;
  const series: ProcessedSeries[] = [];

  if (yNames?.length >= 1) {
    const yCol = yNames[0];
    const xv = rows.map((_, index) => index + 1); // Row indices as X values
    const yv = rows.map((r: any) => Number(r[yCol]));
    
    const label = `Row Index (X) vs ${yCol} (Y)`;
    series.push({ xv, yv, label });
  }

  return series;
};

/**
 * Process X Many Y data format
 * For point plots: X becomes index, each Y variable gets plotted at corresponding X position
 * Example: X=[1,2,3,4,5,6,7,8,9,10], Y=[Y1,Y2,Y3,Y4] → Y1 at X=1, Y2 at X=2, Y3 at X=3, Y4 at X=4
 */
const processXManyYData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames } = config;
  const series: ProcessedSeries[] = [];

  if (xNames?.length >= 1 && yNames?.length >= 1) {
    const xCol = xNames[0];
    const isPointPlot = graphConfig?.subType?.toLowerCase().includes('point plot');
    
    if (isPointPlot) {
      // For point plots: X becomes index, each Y variable gets plotted at corresponding X position
      console.log(`🔍 Processing X Many Y Point Plot:`, {
        xCol,
        yNames,
        yCount: yNames.length,
        rowCount: rows.length
      });
      
      // Get unique X values and sort them
      const xValues = [...new Set(rows.map((r: any) => Number(r[xCol])))].sort((a, b) => a - b);
      console.log(`📊 Unique X values:`, xValues);
      
      // For X Many Y point plots: Create one series per Y variable
      // Each Y variable gets plotted at a SINGLE specific X position
      yNames.forEach((yCol, yIndex) => {
        const xv: number[] = [];
        const yv: number[] = [];
        
        // Use the X value at the same index as the Y variable
        const targetXValue = xValues[yIndex] || (yIndex + 1); // Y1 at X[0], Y2 at X[1], etc.
        
        // Get ALL Y values for this Y column (don't filter by X)
        rows.forEach(row => {
          const yValue = parseValue(row[yCol]);
          if (yValue !== null) {
            xv.push(targetXValue); // Same X value for all points
            yv.push(yValue);
          }
        });
        
        const label = `${yCol} (Y) at X=${targetXValue}`;
        series.push({ 
          xv, // All points at the same X position
          yv, // All Y values for this Y variable
          label, 
          errorBarVariable: graphConfig?.errorBarVariable 
        });
        
        console.log(`✅ Created point plot series ${yIndex + 1}: ${label} (${xv.length} points at X=${targetXValue})`);
      });
    } else {
      // Standard X Many Y processing for non-point plots
      const xv = rows.map((r: any) => Number(r[xCol]));

      // Create a series for each Y variable
      yNames.forEach((yCol, index) => {
        const yv = rows.map((r: any) => Number(r[yCol]));
        const label = `${yCol} (Y) vs ${xCol} (X)`;
        series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
      });
    }
  }

  return series;
};

/**
 * Process Y Many X data format
 * For point plots: Y becomes index, each X variable gets plotted at corresponding Y position
 * Example: Y=[1,2,3,4,5,6,7,8,9,10], X=[X1,X2,X3,X4] → X1 at Y=1, X2 at Y=2, X3 at Y=3, X4 at Y=4
 */
const processYManyXData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames } = config;
  const series: ProcessedSeries[] = [];

  if (xNames?.length >= 1 && yNames?.length >= 1) {
    const yCol = yNames[0];
    const isPointPlot = graphConfig?.subType?.toLowerCase().includes('point plot');
    
    if (isPointPlot) {
      // For point plots: Y becomes index, each X variable gets plotted at corresponding Y position
      console.log(`🔍 Processing Y Many X Point Plot:`, {
        yCol,
        xNames,
        xCount: xNames.length,
        rowCount: rows.length
      });
      
      // Get unique Y values and sort them
      const yValues = [...new Set(rows.map((r: any) => Number(r[yCol])))].sort((a, b) => a - b);
      console.log(`📊 Unique Y values:`, yValues);
      
      // For Y Many X point plots: Create one series per X variable
      // Each X variable gets plotted at a SINGLE specific Y position
      xNames.forEach((xCol, xIndex) => {
        const xv: number[] = [];
        const yv: number[] = [];
        
        // Use the Y value at the same index as the X variable
        const targetYValue = yValues[xIndex] || (xIndex + 1); // X1 at Y[0], X2 at Y[1], etc.
        
        // Get ALL X values for this X column (don't filter by Y)
        rows.forEach(row => {
          const xValue = parseValue(row[xCol]);
          if (xValue !== null) {
            xv.push(xValue);
            yv.push(targetYValue); // Same Y value for all points
          }
        });
        
        const label = `${xCol} (X) at Y=${targetYValue}`;
        series.push({ 
          xv, // All X values for this X variable
          yv, // All points at the same Y position
          label, 
          errorBarVariable: graphConfig?.errorBarVariable 
        });
        
        console.log(`✅ Created point plot series ${xIndex + 1}: ${label} (${xv.length} points at Y=${targetYValue})`);
      });
    } else {
      // Standard Y Many X processing for non-point plots
      const yv = rows.map((r: any) => Number(r[yCol]));

      // Create a series for each X variable
      xNames.forEach((xCol, index) => {
        const xv = rows.map((r: any) => Number(r[xCol]));
        const label = `${yCol} (Y) vs ${xCol} (X)`;
        series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
      });
    }
  }

  return series;
};

/**
 * Process XY Pairs data format
 */
const processXYPairsData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames } = config;
  const series: ProcessedSeries[] = [];

  console.log(`🔍 Processing XY Pairs Data:`, {
    xNames,
    yNames,
    xNamesLength: xNames?.length || 0,
    yNamesLength: yNames?.length || 0
  });

  if (xNames?.length >= 1 && yNames?.length >= 1) {
    // For XY Pairs, create multiple series when we have multiple X and Y pairs
    if (xNames.length === yNames.length && xNames.length > 1) {
      // Multiple XY pairs - create a series for each pair
      console.log(`📊 Creating ${xNames.length} XY pairs for multiple scatter plot`);
      for (let i = 0; i < xNames.length; i++) {
        const xCol = xNames[i];
        const yCol = yNames[i];
        
        const xv = rows.map((r: any) => Number(r[xCol]));
        const yv = rows.map((r: any) => Number(r[yCol]));
        
        const label = `${yCol} (Y) vs ${xCol} (X)`;
        series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
        console.log(`✅ Created series ${i + 1}: ${label}`);
      }
    } else {
      // Single XY pair - create one series
      console.log(`📊 Creating single XY pair`);
      const xCol = xNames[0];
      const yCol = yNames[0];
      
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => Number(r[yCol]));
      
      const label = `${yCol} (Y) vs ${xCol} (X)`;
      series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
      console.log(`✅ Created single series: ${label}`);
    }
  }

  console.log(`📊 XY Pairs processing complete: ${series.length} series created`);
  return series;
};

/**
 * Process category-based scatter data
 */
const processCategoryScatterData = (config: DataProcessingConfig, normalizedFormat: string): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames, categoryNames = [] } = config;
  const series: ProcessedSeries[] = [];

  console.log(`🔍 Processing Category Scatter Data:`, {
    normalizedFormat,
    xNames,
    yNames,
    categoryNames,
    rowCount: rows.length
  });

  if (normalizedFormat === 'XY Category') {
    // XY Category format - single X, single Y, category for grouping
    if (xNames?.length >= 1 && yNames?.length >= 1 && categoryNames?.length >= 1) {
      const xCol = xNames[0];
      const yCol = yNames[0];
      const categoryCol = categoryNames[0];
      
      // Group data by category
      const categoryData = groupByCategory(rows, categoryCol);
      const categories = Object.keys(categoryData);
      
      console.log(`📊 XY Category: Found ${categories.length} categories:`, categories);
      
      // Create a series for each category
      categories.forEach((category, categoryIndex) => {
        const categoryRows = categoryData[category];
        const xv: number[] = [];
        const yv: number[] = [];
        
        categoryRows.forEach(row => {
          const xVal = parseValue(row[xCol]);
          const yVal = parseValue(row[yCol]);
          
          if (xVal !== null && yVal !== null) {
            xv.push(xVal);
            yv.push(yVal);
          }
        });
        
        if (xv.length > 0) {
          const label = `${category} (${yCol} vs ${xCol})`;
          series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
          console.log(`✅ Created XY Category series ${categoryIndex + 1}: ${label} (${xv.length} points)`);
        }
      });
    }
  } else if (normalizedFormat === 'X Category') {
    // X Category format - single X, category for Y axis (strip plot)
    if (xNames?.length >= 1 && categoryNames?.length >= 1) {
      const xCol = xNames[0];
      const categoryCol = categoryNames[0];
      const isPointPlot = graphConfig?.subType?.toLowerCase().includes('point plot');
      
      // Group data by category
      const categoryData = groupByCategory(rows, categoryCol);
      const categories = Object.keys(categoryData);
      
      console.log(`📊 X Category: Found ${categories.length} categories:`, categories);
      
      if (isPointPlot) {
        // For point plots: Group X values by category and plot each category at different Y positions
        console.log(`🔍 Processing X Category Point Plot:`, {
          xCol,
          categoryCol,
          categories,
          isPointPlot
        });
        
        // Create a series for each category
        categories.forEach((category, categoryIndex) => {
          const categoryRows = categoryData[category];
          const xv: number[] = [];
          const yv: number[] = [];
          
          categoryRows.forEach(row => {
            const xVal = parseValue(row[xCol]);
            
            if (xVal !== null) {
              xv.push(xVal);
              yv.push(categoryIndex); // Use category index as Y position
            }
          });
          
          if (xv.length > 0) {
            const label = `${category} (${xCol})`;
            series.push({ 
              xv, 
              yv, 
              label, 
              errorBarVariable: graphConfig?.errorBarVariable
            });
            console.log(`✅ Created X Category point plot series ${categoryIndex + 1}: ${label} (${xv.length} points at Y=${categoryIndex})`);
          }
        });
      } else {
        // Standard X Category processing for non-point plots
        // Create a series for each category
        categories.forEach((category, categoryIndex) => {
          const categoryRows = categoryData[category];
          const xv: number[] = [];
          const yv: number[] = [];
          
          categoryRows.forEach(row => {
            const xVal = parseValue(row[xCol]);
            
            if (xVal !== null) {
              xv.push(xVal);
              // Use category index as Y position (with small jitter to avoid overlapping)
              const jitter = (Math.random() - 0.5) * 0.2; // ±0.1 jitter
              yv.push(categoryIndex + jitter);
            }
          });
          
          if (xv.length > 0) {
            const label = `${category} (${xCol})`;
            series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
            console.log(`✅ Created X Category series ${categoryIndex + 1}: ${label} (${xv.length} points)`);
          }
        });
      }
    }
  } else if (normalizedFormat === 'Y Category') {
    // Y Category format - single Y, category for X axis (strip plot)
    if (yNames?.length >= 1 && categoryNames?.length >= 1) {
      const yCol = yNames[0];
      const categoryCol = categoryNames[0];
      const isPointPlot = graphConfig?.subType?.toLowerCase().includes('point plot');
      
      // Group data by category
      const categoryData = groupByCategory(rows, categoryCol);
      const categories = Object.keys(categoryData);
      
      console.log(`📊 Y Category: Found ${categories.length} categories:`, categories);
      
      if (isPointPlot) {
        // For point plots: Group Y values by category and plot each category at different X positions
        console.log(`🔍 Processing Y Category Point Plot:`, {
          yCol,
          categoryCol,
          categories,
          isPointPlot
        });
        
        // Create a series for each category
        categories.forEach((category, categoryIndex) => {
          const categoryRows = categoryData[category];
          const xv: number[] = [];
          const yv: number[] = [];
          
          categoryRows.forEach(row => {
            const yVal = parseValue(row[yCol]);
            
            if (yVal !== null) {
              xv.push(categoryIndex); // Use category index as X position
              yv.push(yVal);
            }
          });
          
          if (yv.length > 0) {
            const label = `${category} (${yCol})`;
            series.push({ 
              xv, 
              yv, 
              label, 
              errorBarVariable: graphConfig?.errorBarVariable
            });
            console.log(`✅ Created Y Category point plot series ${categoryIndex + 1}: ${label} (${yv.length} points at X=${categoryIndex})`);
          }
        });
      } else {
        // Standard Y Category processing for non-point plots
        // Create a series for each category
        categories.forEach((category, categoryIndex) => {
          const categoryRows = categoryData[category];
          const xv: number[] = [];
          const yv: number[] = [];
          
          categoryRows.forEach(row => {
            const yVal = parseValue(row[yCol]);
            
            if (yVal !== null) {
              // Use category index as X position (with small jitter to avoid overlapping)
              const jitter = (Math.random() - 0.5) * 0.2; // ±0.1 jitter
              xv.push(categoryIndex + jitter);
              yv.push(yVal);
            }
          });
          
          if (yv.length > 0) {
            const label = `${category} (${yCol})`;
            series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
            console.log(`✅ Created Y Category series ${categoryIndex + 1}: ${label} (${yv.length} points)`);
          }
        });
      }
    }
  }

  console.log(`📊 Category processing complete: ${series.length} series created`);
  return series;
};

/**
 * Process Many X data format
 * For point plots: Each X variable gets plotted at a specific Y position (index-based)
 * Example: X=[X1,X2,X3,X4] → X1 at Y=1, X2 at Y=2, X3 at Y=3, X4 at Y=4
 */
const processManyXData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames } = config;
  const series: ProcessedSeries[] = [];

  if (xNames?.length >= 1) {
    const isPointPlot = graphConfig?.subType?.toLowerCase().includes('point plot');
    
    if (isPointPlot) {
      // For point plots: Each X variable gets plotted at a specific Y position
      console.log(`🔍 Processing Many X Point Plot:`, {
        xNames,
        xCount: xNames.length,
        rowCount: rows.length
      });
      
      xNames.forEach((xCol, xIndex) => {
        const xv: number[] = [];
        const yv: number[] = [];
        
        // Use the X variable index as the Y position
        const targetYValue = xIndex + 1; // X1 at Y=1, X2 at Y=2, etc.
        
        // Get ALL X values for this X column (don't filter by anything)
        rows.forEach(row => {
          const xValue = parseValue(row[xCol]);
          if (xValue !== null) {
            xv.push(xValue);
            yv.push(targetYValue); // Same Y value for all points
          }
        });
        
        const label = `${xCol} (X) at Y=${targetYValue}`;
        series.push({ 
          xv, // All X values for this X variable
          yv, // All points at the same Y position
          label, 
          errorBarVariable: graphConfig?.errorBarVariable 
        });
        
        console.log(`✅ Created Many X point plot series ${xIndex + 1}: ${label} (${xv.length} points at Y=${targetYValue})`);
      });
    } else {
      // Standard Many X processing for non-point plots
      xNames.forEach((xCol, index) => {
        const xv = rows.map((r: any) => Number(r[xCol]));
        const yv = rows.map((r: any, i: number) => i + 1); // Use row index as Y values (starting from 1)
        
        const label = `Row Index (Y) vs ${xCol} (X)`;
        series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
      });
    }
  }

  return series;
};

/**
 * Process Many Y data format
 * For point plots: Each Y variable gets plotted at a specific X position (index-based)
 * Example: Y=[Y1,Y2,Y3,Y4] → Y1 at X=1, Y2 at X=2, Y3 at X=3, Y4 at X=4
 */
const processManyYData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, yNames } = config;
  const series: ProcessedSeries[] = [];

  if (yNames?.length >= 1) {
    const isPointPlot = graphConfig?.subType?.toLowerCase().includes('point plot');
    
    if (isPointPlot) {
      // For point plots: Each Y variable gets plotted at a specific X position
      console.log(`🔍 Processing Many Y Point Plot:`, {
        yNames,
        yCount: yNames.length,
        rowCount: rows.length
      });
      
      yNames.forEach((yCol, yIndex) => {
        const xv: number[] = [];
        const yv: number[] = [];
        
        // Use the Y variable index as the X position
        const targetXValue = yIndex + 1; // Y1 at X=1, Y2 at X=2, etc.
        
        // Get ALL Y values for this Y column (don't filter by anything)
        rows.forEach(row => {
          const yValue = parseValue(row[yCol]);
          if (yValue !== null) {
            xv.push(targetXValue); // Same X value for all points
            yv.push(yValue);
          }
        });
        
        const label = `${yCol} (Y) at X=${targetXValue}`;
        series.push({ 
          xv, // All points at the same X position
          yv, // All Y values for this Y variable
          label, 
          errorBarVariable: graphConfig?.errorBarVariable 
        });
        
        console.log(`✅ Created Many Y point plot series ${yIndex + 1}: ${label} (${xv.length} points at X=${targetXValue})`);
      });
    } else {
      // Standard Many Y processing for non-point plots
      yNames.forEach((yCol, index) => {
        const xv = rows.map((r: any, i: number) => i + 1); // Use row index as X values (starting from 1)
        const yv = rows.map((r: any) => Number(r[yCol]));
        
        const label = `${yCol} (Y) vs Row Index (X)`;
        series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
      });
    }
  }

  return series;
};

/**
 * Process YX Pairs data format (Y vs X pairs)
 */
const processYXPairsData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames } = config;
  const series: ProcessedSeries[] = [];

  console.log(`🔍 Processing YX Pairs Data:`, {
    xNames,
    yNames,
    xNamesLength: xNames?.length || 0,
    yNamesLength: yNames?.length || 0
  });

  if (xNames?.length >= 1 && yNames?.length >= 1) {
    // For YX Pairs, create multiple series when we have multiple Y and X pairs
    if (xNames.length === yNames.length && xNames.length > 1) {
      // Multiple YX pairs - create a series for each pair
      console.log(`📊 Creating ${xNames.length} YX pairs for multiple scatter plot`);
      for (let i = 0; i < xNames.length; i++) {
        const xCol = xNames[i];
        const yCol = yNames[i];
        
        const xv = rows.map((r: any) => Number(r[xCol]));
        const yv = rows.map((r: any) => Number(r[yCol]));
        
        const label = `${yCol} (Y) vs ${xCol} (X)`;
        series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
        console.log(`✅ Created series ${i + 1}: ${label}`);
      }
    } else {
      // Single YX pair - create one series
      console.log(`📊 Creating single YX pair`);
      const xCol = xNames[0];
      const yCol = yNames[0];
      
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => Number(r[yCol]));
      
      const label = `${yCol} (Y) vs ${xCol} (X)`;
      series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
      console.log(`✅ Created single series: ${label}`);
    }
  }

  console.log(`📊 YX Pairs processing complete: ${series.length} series created`);
  return series;
};

/**
 * Process X Single Y Replicate data format
 */
const processXSingleYReplicateData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames } = config;
  const series: ProcessedSeries[] = [];

  if (xNames?.length >= 1 && yNames?.length >= 1) {
    const xCol = xNames[0];
    const yCol = yNames[0];
    
    const xv = rows.map((r: any) => Number(r[xCol]));
    const yv = rows.map((r: any) => Number(r[yCol]));
    
    const label = `${yCol} (Y) vs ${xCol} (X) - Replicates`;
    series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
  }

  return series;
};

/**
 * Process Y Replicate data format
 */
const processYReplicateData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, yNames } = config;
  const series: ProcessedSeries[] = [];

  if (yNames?.length >= 1) {
    const yCol = yNames[0];
    const xv = rows.map((r: any, i: number) => i + 1); // Use row index as X values
    const yv = rows.map((r: any) => Number(r[yCol]));
    
    const label = `${yCol} (Y) vs Row Index (X) - Replicates`;
    series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
  }

  return series;
};

/**
 * Process X Many Y Replicates data format
 */
const processXManyYReplicatesData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames } = config;
  const series: ProcessedSeries[] = [];

  if (xNames?.length >= 1 && yNames?.length >= 1) {
    const xCol = xNames[0];
    const xv = rows.map((r: any) => Number(r[xCol]));

    // Create a series for each Y variable with replicates
    yNames.forEach((yCol, index) => {
      const yv = rows.map((r: any) => Number(r[yCol]));
      const label = `${yCol} (Y) vs ${xCol} (X) - Replicates`;
      series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
    });
  }

  return series;
};

/**
 * Process Many Y Replicates data format
 */
const processManyYReplicatesData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, yNames } = config;
  const series: ProcessedSeries[] = [];

  if (yNames?.length >= 1) {
    // Create a series for each Y variable with replicates
    yNames.forEach((yCol, index) => {
      const xv = rows.map((r: any, i: number) => i + 1); // Use row index as X values
      const yv = rows.map((r: any) => Number(r[yCol]));
      
      const label = `${yCol} (Y) vs Row Index (X) - Replicates`;
      series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
    });
  }

  return series;
};

/**
 * Process Y Many X Replicates data format
 */
const processYManyXReplicatesData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames } = config;
  const series: ProcessedSeries[] = [];

  if (xNames?.length >= 1 && yNames?.length >= 1) {
    const yCol = yNames[0];
    const yv = rows.map((r: any) => Number(r[yCol]));

    // Create a series for each X variable with replicates
    xNames.forEach((xCol, index) => {
      const xv = rows.map((r: any) => Number(r[xCol]));
      const label = `${yCol} (Y) vs ${xCol} (X) - Replicates`;
      series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
    });
  }

  return series;
};

/**
 * Process Many X Replicates data format
 */
const processManyXReplicatesData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames } = config;
  const series: ProcessedSeries[] = [];

  if (xNames?.length >= 1) {
    // Create a series for each X variable with replicates
    xNames.forEach((xCol, index) => {
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any, i: number) => i + 1); // Use row index as Y values
      
      const label = `Row Index (Y) vs ${xCol} (X) - Replicates`;
      series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
    });
  }

  return series;
};

/**
 * Process X Replicates data format
 */
const processXReplicatesData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames } = config;
  const series: ProcessedSeries[] = [];

  if (xNames?.length >= 1) {
    const xCol = xNames[0];
    const xv = rows.map((r: any) => Number(r[xCol]));
    const yv = rows.map((r: any, i: number) => i + 1); // Use row index as Y values
    
    const label = `Row Index (Y) vs ${xCol} (X) - Replicates`;
    series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
  }

  return series;
};

/**
 * Process Y Single X Replicates data format
 */
const processYSingleXReplicatesData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames } = config;
  const series: ProcessedSeries[] = [];

  if (xNames?.length >= 1 && yNames?.length >= 1) {
    const xCol = xNames[0];
    const yCol = yNames[0];
    
    const xv = rows.map((r: any) => Number(r[xCol]));
    const yv = rows.map((r: any) => Number(r[yCol]));
    
    const label = `${yCol} (Y) vs ${xCol} (X) - Replicates`;
    series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
  }

  return series;
};

/**
 * Process Category Many Y data format
 */
const processCategoryManyYData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, yNames, categoryNames = [] } = config;
  const series: ProcessedSeries[] = [];

  if (yNames?.length >= 1 && categoryNames?.length >= 1) {
    const categoryCol = categoryNames[0];
    
    // Create a series for each Y variable grouped by category
    yNames.forEach((yCol, index) => {
      const xv = rows.map((r: any) => String(r[categoryCol]));
      const yv = rows.map((r: any) => Number(r[yCol]));
      
      const label = `${yCol} (Y) vs ${categoryCol} (Category)`;
      series.push({ xv: xv.map((_, i) => i + 1), yv, label, errorBarVariable: graphConfig?.errorBarVariable });
    });
  }

  return series;
};

/**
 * Process Category Many X data format
 */
const processCategoryManyXData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, categoryNames = [] } = config;
  const series: ProcessedSeries[] = [];

  if (xNames?.length >= 1 && categoryNames?.length >= 1) {
    const categoryCol = categoryNames[0];
    
    // Create a series for each X variable grouped by category
    xNames.forEach((xCol, index) => {
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => String(r[categoryCol]));
      
      const label = `${categoryCol} (Category) vs ${xCol} (X)`;
      series.push({ xv, yv: xv.map((_, i) => i + 1), label, errorBarVariable: graphConfig?.errorBarVariable });
    });
  }

  return series;
};

/**
 * Helper function to group data by category
 */
const groupByCategory = (rows: any[], categoryCol: string): Record<string, any[]> => {
  const grouped: Record<string, any[]> = {};
  
  rows.forEach(row => {
    const category = String(row[categoryCol] || 'Unknown');
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(row);
  });
  
  return grouped;
};

/**
 * Helper function to parse numeric values safely
 */
const parseValue = (value: any): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const num = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(num) ? num : null;
};
