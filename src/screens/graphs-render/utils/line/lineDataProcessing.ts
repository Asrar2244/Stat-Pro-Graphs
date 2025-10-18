/**
 * Line plot data processing utilities
 */

import { ProcessedSeries, DataProcessingConfig } from '../common/types';
import { LineDataConfig } from './types';

/**
 * Process data for line plots based on format and subType combination
 */
export const processLineData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames, categoryNames } = config;
  const series: ProcessedSeries[] = [];

  console.log(`🔍 Processing Line Data:`, {
    dataFormat: graphConfig.dataFormat,
    subType: graphConfig.subType,
    xNames,
    yNames,
    categoryNames,
    rowCount: rows.length,
    graphConfigKeys: Object.keys(graphConfig || {}),
    variablesKeys: Object.keys(graphConfig?.variables || {})
  });

  // Normalize data format based on subType and dataFormat combination
  let normalizedFormat = graphConfig?.dataFormat;
  const subType = graphConfig?.subType || '';
  
  // Handle specific subType and dataFormat combinations
  if (subType.includes('Multiple') && normalizedFormat === 'XY Category') {
    // For multiple series with category data, treat as XY Category but create multiple series
    console.log(`🔍 Multiple series detected with XY Category format`);
  }
  
  // Handle "Multiple" subTypes - they should create multiple series
  if (subType.includes('Multiple')) {
    console.log(`🔍 Multiple subType detected: ${subType}, dataFormat: ${normalizedFormat}`);
    
    // Special case: If we have equal numbers of X and Y variables, treat them as pairs (X1Y1, X2Y2, etc.)
    if (xNames && yNames && xNames.length === yNames.length && xNames.length > 1) {
      normalizedFormat = 'XY Pairs';
      console.log(`🔍 Converting to XY Pairs format for paired X and Y variables: ${xNames.length} pairs`);
    } else if (yNames && yNames.length > 1 && xNames && xNames.length >= 1) {
      // If we have multiple Y variables, ensure we use X Many Y format
      normalizedFormat = 'X Many Y';
      console.log(`🔍 Converting to X Many Y format for multiple Y variables: ${yNames.length} Y variables`);
    } else if (yNames && yNames.length === 1 && xNames && xNames.length > 1) {
      // If we have multiple X variables but only one Y, use Y Many X format
      normalizedFormat = 'Y Many X';
      console.log(`🔍 Converting to Y Many X format for multiple X variables: ${xNames.length} X variables`);
    } else if (yNames && yNames.length > 0 && xNames && xNames.length > 0) {
      // If we have both X and Y but only one of each, and it's a "Multiple" subType,
      // we might need to create multiple series based on the data itself
      console.log(`🔍 Multiple subType with single X and Y variables - checking for category-based multiple series`);
    }
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

  // Process different line plot formats
  switch (normalizedFormat) {
    case 'Single X':
      return processSingleXLineData(config);
    case 'Single Y':
      return processSingleYLineData(config);
    case 'X Many Y':
      return processXManyYLineData(config);
    case 'Y Many X':
      return processYManyXLineData(config);
    case 'XY Pairs':
    case 'XY Pair':  // Handle singular form
      return processXYPairsLineData(config);
    case 'XY Category':
      return processXYCategoryLineData(config);
    case 'X Category':
      return processXCategoryLineData(config);
    case 'Y Category':
      return processYCategoryLineData(config);
    case 'Many X':
      return processManyXLineData(config);
    case 'Many Y':
      return processManyYLineData(config);
    default:
      console.warn(`Unknown line data format: ${normalizedFormat}`);
      return [];
  }
};

/**
 * Process Single X line data format
 */
const processSingleXLineData = (config: DataProcessingConfig): ProcessedSeries[] => {
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
 * Process Single Y line data format
 */
const processSingleYLineData = (config: DataProcessingConfig): ProcessedSeries[] => {
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
 * Process X Many Y line data format
 */
const processXManyYLineData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames } = config;
  const series: ProcessedSeries[] = [];

  console.log(`🔍 Processing X Many Y Line Data:`, {
    xNames: xNames?.length,
    yNames: yNames?.length,
    xColumns: xNames,
    yColumns: yNames,
    rowCount: rows.length
  });

  if (xNames?.length >= 1 && yNames?.length >= 1) {
    const xCol = xNames[0];
    const xv = rows.map((r: any) => Number(r[xCol]));

    console.log(`🔍 Creating ${yNames.length} series for X Many Y format`);

    // Create a series for each Y variable
    yNames.forEach((yCol, index) => {
      const yv = rows.map((r: any) => Number(r[yCol]));
      const label = `${yCol} (Y) vs ${xCol} (X)`;
      console.log(`🔍 Creating series ${index + 1}: ${label} with ${yv.length} data points`);
      series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
    });
  } else {
    console.warn(`🔍 X Many Y format requires at least 1 X variable and 1 Y variable. Got X: ${xNames?.length}, Y: ${yNames?.length}`);
  }

  console.log(`🔍 X Many Y processing complete: ${series.length} series created`);
  return series;
};

/**
 * Process Y Many X line data format
 */
const processYManyXLineData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames } = config;
  const series: ProcessedSeries[] = [];

  if (xNames?.length >= 1 && yNames?.length >= 1) {
    const yCol = yNames[0];
    const yv = rows.map((r: any) => Number(r[yCol]));

    // Create a series for each X variable
    xNames.forEach((xCol, index) => {
      const xv = rows.map((r: any) => Number(r[xCol]));
      const label = `${yCol} (Y) vs ${xCol} (X)`;
      series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
    });
  }

  return series;
};

/**
 * Process XY Pairs line data format
 */
const processXYPairsLineData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames } = config;
  const series: ProcessedSeries[] = [];

  if (xNames?.length >= 1 && yNames?.length >= 1) {
    // Check if we have equal numbers of X and Y variables (paired format)
    if (xNames.length === yNames.length && xNames.length > 1) {
      // Multiple XY pairs (X1Y1, X2Y2, etc.)
      console.log(`🔍 Processing ${xNames.length} XY pairs for multiple straight lines`);
      
      for (let i = 0; i < xNames.length; i++) {
        const xCol = xNames[i];
        const yCol = yNames[i];
        
        const xv = rows.map((r: any) => Number(r[xCol]));
        const yv = rows.map((r: any) => Number(r[yCol]));
        
        const label = `${yCol} (Y) vs ${xCol} (X)`;
        console.log(`🔍 Creating series ${i + 1}: ${label} with ${xv.length} data points`);
        series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
      }
    } else {
      // Single XY pair (original behavior)
      const xCol = xNames[0];
      const yCol = yNames[0];
      
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => Number(r[yCol]));
      
      const label = `${yCol} (Y) vs ${xCol} (X)`;
      series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
    }
  }

  return series;
};

/**
 * Process XY Category line data format
 */
const processXYCategoryLineData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames, categoryNames } = config;
  const series: ProcessedSeries[] = [];
  const subType = graphConfig?.subType || '';

  if (xNames?.length >= 1 && yNames?.length >= 1) {
    // Check if this is a "Multiple" subType that should create multiple series
    if (subType.includes('Multiple') && categoryNames?.length > 0) {
      // For Multiple XY Category, create series for each category value
      const xCol = xNames[0];
      const yCol = yNames[0];
      const categoryCol = categoryNames[0];
      
      // Get unique category values
      const uniqueCategories = Array.from(new Set(rows.map((r: any) => r[categoryCol])));
      
      uniqueCategories.forEach((category) => {
        // Filter rows for this category
        const categoryRows = rows.filter((r: any) => r[categoryCol] === category);
        
        const xv = categoryRows.map((r: any) => Number(r[xCol]));
        const yv = categoryRows.map((r: any) => Number(r[yCol]));
        
        const label = `${yCol} (Y) vs ${xCol} (X) - ${category}`;
        series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
      });
    } else {
      // For single XY Category, create a single series with paired X and Y values
      const xCol = xNames[0];
      const yCol = yNames[0];
      
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => Number(r[yCol]));
      
      const label = `${yCol} (Y) vs ${xCol} (X)`;
      series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
    }
  }

  return series;
};

/**
 * Process X Category line data format
 */
const processXCategoryLineData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames } = config;
  const series: ProcessedSeries[] = [];

  if (xNames?.length >= 1) {
    // For X Category, create series for each X variable
    xNames.forEach((xCol, index) => {
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any, i: number) => i + 1); // Use row index as Y values (starting from 1)
      
      const label = `${xCol} (X) vs Index`;
      series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
    });
  }

  return series;
};

/**
 * Process Y Category line data format
 */
const processYCategoryLineData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, yNames } = config;
  const series: ProcessedSeries[] = [];

  if (yNames?.length >= 1) {
    // For Y Category, create series for each Y variable
    yNames.forEach((yCol, index) => {
      const xv = rows.map((r: any, i: number) => i + 1); // Use row index as X values (starting from 1)
      const yv = rows.map((r: any) => Number(r[yCol]));
      
      const label = `${yCol} (Y) vs Index`;
      series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
    });
  }

  return series;
};

/**
 * Process Many X line data format
 */
const processManyXLineData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames } = config;
  const series: ProcessedSeries[] = [];

  if (xNames?.length >= 1) {
    // For Many X, create series for each X variable
    xNames.forEach((xCol, index) => {
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any, i: number) => i + 1); // Use row index as Y values (starting from 1)
      
      const label = `${xCol} (X) vs Index`;
      series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
    });
  }

  return series;
};

/**
 * Process Many Y line data format
 */
const processManyYLineData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, yNames } = config;
  const series: ProcessedSeries[] = [];

  if (yNames?.length >= 1) {
    // For Many Y, create series for each Y variable
    yNames.forEach((yCol, index) => {
      const xv = rows.map((r: any, i: number) => i + 1); // Use row index as X values (starting from 1)
      const yv = rows.map((r: any) => Number(r[yCol]));
      
      const label = `${yCol} (Y) vs Index`;
      series.push({ xv, yv, label, errorBarVariable: graphConfig?.errorBarVariable });
    });
  }

  return series;
};
