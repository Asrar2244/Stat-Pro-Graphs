/**
 * Line-scatter plot data processing utilities
 * Combines both line and scatter plot functionality
 */

import { ProcessedSeries, DataProcessingConfig } from '../common/types';
import { LineScatterDataConfig } from './types';

/**
 * Process data for line-scatter plots based on format
 * Line-scatter plots combine both line and scatter elements
 */
export const processLineScatterData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames, categoryNames = [], errorBarNames = [] } = config;
  const series: ProcessedSeries[] = [];

  // Normalize data format
  let normalizedFormat = graphConfig?.dataFormat;
  
  // Special handling for bidirectional asymmetric error bars - use XY Pairs format
  const isBidirectionalAsymmetricErrorBar = graphConfig?.subType?.toLowerCase().includes('bidirectional') && 
                                           graphConfig?.subType?.toLowerCase().includes('asymmetric') &&
                                           graphConfig?.subType?.toLowerCase().includes('error bar');
  
  if (isBidirectionalAsymmetricErrorBar) {
    normalizedFormat = 'XY Pairs';
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

  // Process data based on normalized format
  switch (normalizedFormat) {
    case 'XY Pair':
      return processXYPair(rows, xNames, yNames, categoryNames, errorBarNames, graphConfig);
    
    case 'XY Pairs':
      return processXYPairs(rows, xNames, yNames, categoryNames, errorBarNames, graphConfig);
    
    case 'Single X':
      return processSingleX(rows, xNames, categoryNames, errorBarNames, graphConfig);
    
    case 'Single Y':
      return processSingleY(rows, yNames, categoryNames, errorBarNames, graphConfig);
    
    case 'X Many Y':
      return processXManyY(rows, xNames, yNames, categoryNames, errorBarNames, graphConfig);
    
    case 'Y Many X':
      return processYManyX(rows, xNames, yNames, categoryNames, errorBarNames, graphConfig);
    
    case 'Many X':
      return processManyX(rows, xNames, categoryNames, errorBarNames, graphConfig);
    
    case 'Many Y':
      return processManyY(rows, yNames, categoryNames, errorBarNames, graphConfig);
    
    case 'XY Category':
      return processXYCategory(rows, xNames, yNames, categoryNames, errorBarNames, graphConfig);
    
    case 'X Category':
      return processXCategory(rows, xNames, categoryNames, errorBarNames, graphConfig);
    
    case 'Y Category':
      return processYCategory(rows, yNames, categoryNames, errorBarNames, graphConfig);
    
    default:
      return processXYPair(rows, xNames, yNames, categoryNames, errorBarNames, graphConfig);
  }
};

/**
 * Process XY Pair format - single X and single Y variable
 */
function processXYPair(
  rows: any[],
  xNames: string[],
  yNames: string[],
  categoryNames: string[],
  errorBarNames: string[],
  graphConfig: any
): ProcessedSeries[] {
  const series: ProcessedSeries[] = [];
  
  if (!xNames?.length || !yNames?.length) {
    return series;
  }

  const xName = xNames[0];
  const yName = yNames[0];
  
  // Extract data
  const xv = rows.map(row => parseFloat(row[xName])).filter(val => !isNaN(val));
  const yv = rows.map(row => parseFloat(row[yName])).filter(val => !isNaN(val));
  
  // Extract error bar data if available
  let errorBarData: number[] | undefined;
  let errorBarDataX: number[] | undefined;
  let errorBarDataY: number[] | undefined;
  
  // Check if this is a bidirectional error bar subplot
  const isBidirectionalErrorBar = (graphConfig?.subType?.toLowerCase().includes('bidirectional') || 
                                  graphConfig?.subType?.toLowerCase().includes('bi-directional')) &&
                                 graphConfig?.subType?.toLowerCase().includes('error bar');
  
  if (isBidirectionalErrorBar && errorBarNames?.length >= 2) {
    // For bidirectional error bars, we need 2 error bar variables
    const errorBarNameX = errorBarNames[0]; // First error bar for X direction
    const errorBarNameY = errorBarNames[1]; // Second error bar for Y direction
    
    errorBarDataX = rows.map(row => parseFloat(row[errorBarNameX])).filter(val => !isNaN(val));
    errorBarDataY = rows.map(row => parseFloat(row[errorBarNameY])).filter(val => !isNaN(val));
    
    } else if (errorBarNames?.length > 0) {
    // For regular error bars, use single error bar variable
    const errorBarName = errorBarNames[0];
    errorBarData = rows.map(row => parseFloat(row[errorBarName])).filter(val => !isNaN(val));
  }
  
  // Extract category data if available
  let categoryData: string[] | undefined;
  if (categoryNames?.length > 0) {
    const categoryName = categoryNames[0];
    categoryData = rows.map(row => String(row[categoryName] || ''));
  }
  
  // Create series
  const processedSeries: ProcessedSeries = {
    x: xv,
    y: yv,
    label: `${xName} vs ${yName}`,
    color: '#1f77b4',
    symbol: 'circle',
    subType: graphConfig.subType || 'Simple Straight Line & Scatter Plots',
    dataFormat: 'XY Pair',
    errorBarData,
    categoryData,
    rows,
    isLinePlot: true,
    isScatterPlot: true,
    showMarkers: true,
    showLines: true,
    markerSize: 8,
    lineWidth: 2,
    // Add bidirectional error bar data if available
    ...(errorBarDataX && { errorBarDataX }),
    ...(errorBarDataY && { errorBarDataY })
  };
  
  series.push(processedSeries);
  
  return series;
}

/**
 * Process XY Pairs format - multiple paired X and Y variables
 */
function processXYPairs(
  rows: any[],
  xNames: string[],
  yNames: string[],
  categoryNames: string[],
  errorBarNames: string[],
  graphConfig: any
): ProcessedSeries[] {
  const series: ProcessedSeries[] = [];
  
  if (!xNames?.length || !yNames?.length) {
    return series;
  }

  // Create pairs - if we have equal numbers, pair them up
  const pairCount = Math.min(xNames.length, yNames.length);
  
  for (let i = 0; i < pairCount; i++) {
    const xName = xNames[i];
    const yName = yNames[i];
    
    // Extract data
    const xv = rows.map(row => parseFloat(row[xName])).filter(val => !isNaN(val));
    const yv = rows.map(row => parseFloat(row[yName])).filter(val => !isNaN(val));
    
     // Extract error bar data if available
     let errorBarData: number[] | undefined;
     let errorBarDataX: number[] | undefined;
     let errorBarDataY: number[] | undefined;
     
     // Check if this is a bidirectional error bar subplot
     const isBidirectionalErrorBar = graphConfig?.subType?.toLowerCase().includes('bidirectional') || 
                                    graphConfig?.subType?.toLowerCase().includes('bi-directional');
     
     if (isBidirectionalErrorBar && errorBarNames?.length >= (i * 2 + 2)) {
       // For bidirectional error bars, we need 2 error bar variables per XY pair
       const errorBarNameX = errorBarNames[i * 2]; // First error bar for X direction
       const errorBarNameY = errorBarNames[i * 2 + 1]; // Second error bar for Y direction
       
       errorBarDataX = rows.map(row => parseFloat(row[errorBarNameX])).filter(val => !isNaN(val));
       errorBarDataY = rows.map(row => parseFloat(row[errorBarNameY])).filter(val => !isNaN(val));
       
       } else if (errorBarNames?.length > i) {
       // For regular error bars, use single error bar variable
       const errorBarName = errorBarNames[i];
       errorBarData = rows.map(row => parseFloat(row[errorBarName])).filter(val => !isNaN(val));
       
       }
    
    // Extract category data if available
    let categoryData: string[] | undefined;
    if (categoryNames?.length > 0) {
      const categoryName = categoryNames[0];
      categoryData = rows.map(row => String(row[categoryName] || ''));
    }
    
    // Create series
    const processedSeries: ProcessedSeries = {
      x: xv,
      y: yv,
      label: `${xName} vs ${yName}`,
      color: getColorForIndex(i),
      symbol: getSymbolForIndex(i),
      subType: graphConfig.subType || 'Multiple Straight Lines & Scatter Plots',
      dataFormat: 'XY Pairs',
      errorBarData,
      categoryData,
      rows,
      isLinePlot: true,
      isScatterPlot: true,
      showMarkers: true,
      showLines: true,
      markerSize: 8,
      lineWidth: 2,
      // Add bidirectional error bar data if available
      ...(errorBarDataX && { errorBarDataX }),
      ...(errorBarDataY && { errorBarDataY })
    };
    
    series.push(processedSeries);
    
    }
  
  return series;
}

/**
 * Process Single X format - plot X variable against index
 */
function processSingleX(
  rows: any[],
  xNames: string[],
  categoryNames: string[],
  errorBarNames: string[],
  graphConfig: any
): ProcessedSeries[] {
  const series: ProcessedSeries[] = [];
  
  if (!xNames?.length) {
    return series;
  }

  for (let i = 0; i < xNames.length; i++) {
    const xName = xNames[i];
    
    // Create index for X values
    const xv = rows.map((_, index) => index);
    const yv = rows.map(row => parseFloat(row[xName])).filter(val => !isNaN(val));
    
    // Extract error bar data if available
    let errorBarData: number[] | undefined;
    if (errorBarNames?.length > i) {
      const errorBarName = errorBarNames[i];
      errorBarData = rows.map(row => parseFloat(row[errorBarName])).filter(val => !isNaN(val));
    }
    
    // Extract category data if available
    let categoryData: string[] | undefined;
    if (categoryNames?.length > 0) {
      const categoryName = categoryNames[0];
      categoryData = rows.map(row => String(row[categoryName] || ''));
    }
    
    // Create series
    const processedSeries: ProcessedSeries = {
      x: xv,
      y: yv,
      label: `${xName} vs Index`,
      color: getColorForIndex(i),
      symbol: getSymbolForIndex(i),
      subType: graphConfig.subType || 'Simple Straight Line & Scatter Plots',
      dataFormat: 'Single X',
      errorBarData,
      categoryData,
      rows,
      isLinePlot: true,
      isScatterPlot: true,
      showMarkers: true,
      showLines: true,
      markerSize: 8,
      lineWidth: 2
    };
    
    series.push(processedSeries);
    
    }
  
  return series;
}

/**
 * Process Single Y format - plot Y variable against index
 */
function processSingleY(
  rows: any[],
  yNames: string[],
  categoryNames: string[],
  errorBarNames: string[],
  graphConfig: any
): ProcessedSeries[] {
  const series: ProcessedSeries[] = [];
  
  if (!yNames?.length) {
    return series;
  }

  for (let i = 0; i < yNames.length; i++) {
    const yName = yNames[i];
    
    // Create index for Y values
    const xv = rows.map((_, index) => index);
    const yv = rows.map(row => parseFloat(row[yName])).filter(val => !isNaN(val));
    
    // Extract error bar data if available
    let errorBarData: number[] | undefined;
    if (errorBarNames?.length > i) {
      const errorBarName = errorBarNames[i];
      errorBarData = rows.map(row => parseFloat(row[errorBarName])).filter(val => !isNaN(val));
    }
    
    // Extract category data if available
    let categoryData: string[] | undefined;
    if (categoryNames?.length > 0) {
      const categoryName = categoryNames[0];
      categoryData = rows.map(row => String(row[categoryName] || ''));
    }
    
    // Create series
    const processedSeries: ProcessedSeries = {
      x: xv,
      y: yv,
      label: `${yName} vs Index`,
      color: getColorForIndex(i),
      symbol: getSymbolForIndex(i),
      subType: graphConfig.subType || 'Simple Straight Line & Scatter Plots',
      dataFormat: 'Single Y',
      errorBarData,
      categoryData,
      rows,
      isLinePlot: true,
      isScatterPlot: true,
      showMarkers: true,
      showLines: true,
      markerSize: 8,
      lineWidth: 2
    };
    
    series.push(processedSeries);
    
    }
  
  return series;
}

/**
 * Process X Many Y format - one X variable with multiple Y variables
 */
function processXManyY(
  rows: any[],
  xNames: string[],
  yNames: string[],
  categoryNames: string[],
  errorBarNames: string[],
  graphConfig: any
): ProcessedSeries[] {
  const series: ProcessedSeries[] = [];
  
  if (!xNames?.length || !yNames?.length) {
    return series;
  }

  const xName = xNames[0]; // Use first X variable
  
  for (let i = 0; i < yNames.length; i++) {
    const yName = yNames[i];
    
    // Extract data
    const xv = rows.map(row => parseFloat(row[xName])).filter(val => !isNaN(val));
    const yv = rows.map(row => parseFloat(row[yName])).filter(val => !isNaN(val));
    
    // Extract error bar data if available
    let errorBarData: number[] | undefined;
    if (errorBarNames?.length > i) {
      const errorBarName = errorBarNames[i];
      errorBarData = rows.map(row => parseFloat(row[errorBarName])).filter(val => !isNaN(val));
    }
    
    // Extract category data if available
    let categoryData: string[] | undefined;
    if (categoryNames?.length > 0) {
      const categoryName = categoryNames[0];
      categoryData = rows.map(row => String(row[categoryName] || ''));
    }
    
    // Create series
    const processedSeries: ProcessedSeries = {
      x: xv,
      y: yv,
      label: `${xName} vs ${yName}`,
      color: getColorForIndex(i),
      symbol: getSymbolForIndex(i),
      subType: graphConfig.subType || 'Multiple Straight Lines & Scatter Plots',
      dataFormat: 'X Many Y',
      errorBarData,
      categoryData,
      rows,
      isLinePlot: true,
      isScatterPlot: true,
      showMarkers: true,
      showLines: true,
      markerSize: 8,
      lineWidth: 2
    };
    
    series.push(processedSeries);
    
    }
  
  return series;
}

/**
 * Process Y Many X format - one Y variable with multiple X variables
 */
function processYManyX(
  rows: any[],
  xNames: string[],
  yNames: string[],
  categoryNames: string[],
  errorBarNames: string[],
  graphConfig: any
): ProcessedSeries[] {
  const series: ProcessedSeries[] = [];
  
  if (!xNames?.length || !yNames?.length) {
    return series;
  }

  const yName = yNames[0]; // Use first Y variable
  
  for (let i = 0; i < xNames.length; i++) {
    const xName = xNames[i];
    
    // Extract data
    const xv = rows.map(row => parseFloat(row[xName])).filter(val => !isNaN(val));
    const yv = rows.map(row => parseFloat(row[yName])).filter(val => !isNaN(val));
    
    // Extract error bar data if available
    let errorBarData: number[] | undefined;
    if (errorBarNames?.length > i) {
      const errorBarName = errorBarNames[i];
      errorBarData = rows.map(row => parseFloat(row[errorBarName])).filter(val => !isNaN(val));
    }
    
    // Extract category data if available
    let categoryData: string[] | undefined;
    if (categoryNames?.length > 0) {
      const categoryName = categoryNames[0];
      categoryData = rows.map(row => String(row[categoryName] || ''));
    }
    
    // Create series
    const processedSeries: ProcessedSeries = {
      x: xv,
      y: yv,
      label: `${xName} vs ${yName}`,
      color: getColorForIndex(i),
      symbol: getSymbolForIndex(i),
      subType: graphConfig.subType || 'Multiple Straight Lines & Scatter Plots',
      dataFormat: 'Y Many X',
      errorBarData,
      categoryData,
      rows,
      isLinePlot: true,
      isScatterPlot: true,
      showMarkers: true,
      showLines: true,
      markerSize: 8,
      lineWidth: 2
    };
    
    series.push(processedSeries);
    
    }
  
  return series;
}

/**
 * Process Many X format - multiple X variables plotted against index
 */
function processManyX(
  rows: any[],
  xNames: string[],
  categoryNames: string[],
  errorBarNames: string[],
  graphConfig: any
): ProcessedSeries[] {
  const series: ProcessedSeries[] = [];
  
  if (!xNames?.length) {
    return series;
  }

  for (let i = 0; i < xNames.length; i++) {
    const xName = xNames[i];
    
    // Create index for X values
    const xv = rows.map((_, index) => index);
    const yv = rows.map(row => parseFloat(row[xName])).filter(val => !isNaN(val));
    
    // Extract error bar data if available
    let errorBarData: number[] | undefined;
    if (errorBarNames?.length > i) {
      const errorBarName = errorBarNames[i];
      errorBarData = rows.map(row => parseFloat(row[errorBarName])).filter(val => !isNaN(val));
    }
    
    // Extract category data if available
    let categoryData: string[] | undefined;
    if (categoryNames?.length > 0) {
      const categoryName = categoryNames[0];
      categoryData = rows.map(row => String(row[categoryName] || ''));
    }
    
    // Create series
    const processedSeries: ProcessedSeries = {
      x: xv,
      y: yv,
      label: `${xName} vs Index`,
      color: getColorForIndex(i),
      symbol: getSymbolForIndex(i),
      subType: graphConfig.subType || 'Multiple Straight Lines & Scatter Plots',
      dataFormat: 'Many X',
      errorBarData,
      categoryData,
      rows,
      isLinePlot: true,
      isScatterPlot: true,
      showMarkers: true,
      showLines: true,
      markerSize: 8,
      lineWidth: 2
    };
    
    series.push(processedSeries);
    
    }
  
  return series;
}

/**
 * Process Many Y format - multiple Y variables plotted against index
 */
function processManyY(
  rows: any[],
  yNames: string[],
  categoryNames: string[],
  errorBarNames: string[],
  graphConfig: any
): ProcessedSeries[] {
  const series: ProcessedSeries[] = [];
  
  if (!yNames?.length) {
    return series;
  }

  for (let i = 0; i < yNames.length; i++) {
    const yName = yNames[i];
    
    // Create index for Y values
    const xv = rows.map((_, index) => index);
    const yv = rows.map(row => parseFloat(row[yName])).filter(val => !isNaN(val));
    
    // Extract error bar data if available
    let errorBarData: number[] | undefined;
    if (errorBarNames?.length > i) {
      const errorBarName = errorBarNames[i];
      errorBarData = rows.map(row => parseFloat(row[errorBarName])).filter(val => !isNaN(val));
    }
    
    // Extract category data if available
    let categoryData: string[] | undefined;
    if (categoryNames?.length > 0) {
      const categoryName = categoryNames[0];
      categoryData = rows.map(row => String(row[categoryName] || ''));
    }
    
    // Create series
    const processedSeries: ProcessedSeries = {
      x: xv,
      y: yv,
      label: `${yName} vs Index`,
      color: getColorForIndex(i),
      symbol: getSymbolForIndex(i),
      subType: graphConfig.subType || 'Multiple Straight Lines & Scatter Plots',
      dataFormat: 'Many Y',
      errorBarData,
      categoryData,
      rows,
      isLinePlot: true,
      isScatterPlot: true,
      showMarkers: true,
      showLines: true,
      markerSize: 8,
      lineWidth: 2
    };
    
    series.push(processedSeries);
    
    }
  
  return series;
}

/**
 * Process XY Category format - X and Y variables with category grouping
 */
function processXYCategory(
  rows: any[],
  xNames: string[],
  yNames: string[],
  categoryNames: string[],
  errorBarNames: string[],
  graphConfig: any
): ProcessedSeries[] {
  const series: ProcessedSeries[] = [];
  
  if (!xNames?.length || !yNames?.length || !categoryNames?.length) {
    return series;
  }

  const xName = xNames[0];
  const yName = yNames[0];
  const categoryName = categoryNames[0];
  
  // Group data by category
  const categoryGroups = new Map<string, { x: number[], y: number[], indices: number[] }>();
  
  rows.forEach((row, index) => {
    const category = String(row[categoryName] || '');
    const xValue = parseFloat(row[xName]);
    const yValue = parseFloat(row[yName]);
    
    if (!isNaN(xValue) && !isNaN(yValue)) {
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, { x: [], y: [], indices: [] });
      }
      
      const group = categoryGroups.get(category)!;
      group.x.push(xValue);
      group.y.push(yValue);
      group.indices.push(index);
    }
  });
  
  // Create series for each category
  let categoryIndex = 0;
  categoryGroups.forEach((group, category) => {
    // Extract error bar data if available
    let errorBarData: number[] | undefined;
    if (errorBarNames?.length > 0) {
      const errorBarName = errorBarNames[0];
      errorBarData = group.indices.map(index => parseFloat(rows[index][errorBarName])).filter(val => !isNaN(val));
    }
    
    // Create series
    const processedSeries: ProcessedSeries = {
      x: group.x,
      y: group.y,
      label: `${category}: ${xName} vs ${yName}`,
      color: getColorForIndex(categoryIndex),
      symbol: getSymbolForIndex(categoryIndex),
      subType: graphConfig.subType || 'Multiple Straight Lines & Scatter Plots',
      dataFormat: 'XY Category',
      errorBarData,
      categoryData: group.indices.map(index => String(rows[index][categoryName] || '')),
      rows,
      isLinePlot: true,
      isScatterPlot: true,
      showMarkers: true,
      showLines: true,
      markerSize: 8,
      lineWidth: 2
    };
    
    series.push(processedSeries);
    categoryIndex++;
    
    });
  
  return series;
}

/**
 * Process X Category format - X variables with category grouping
 */
function processXCategory(
  rows: any[],
  xNames: string[],
  categoryNames: string[],
  errorBarNames: string[],
  graphConfig: any
): ProcessedSeries[] {
  const series: ProcessedSeries[] = [];
  
  if (!xNames?.length || !categoryNames?.length) {
    return series;
  }

  const xName = xNames[0];
  const categoryName = categoryNames[0];
  
  // Group data by category
  const categoryGroups = new Map<string, { x: number[], y: number[], indices: number[] }>();
  
  rows.forEach((row, index) => {
    const category = String(row[categoryName] || '');
    const xValue = index; // Use index as X
    const yValue = parseFloat(row[xName]);
    
    if (!isNaN(yValue)) {
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, { x: [], y: [], indices: [] });
      }
      
      const group = categoryGroups.get(category)!;
      group.x.push(xValue);
      group.y.push(yValue);
      group.indices.push(index);
    }
  });
  
  // Create series for each category
  let categoryIndex = 0;
  categoryGroups.forEach((group, category) => {
    // Extract error bar data if available
    let errorBarData: number[] | undefined;
    if (errorBarNames?.length > 0) {
      const errorBarName = errorBarNames[0];
      errorBarData = group.indices.map(index => parseFloat(rows[index][errorBarName])).filter(val => !isNaN(val));
    }
    
    // Create series
    const processedSeries: ProcessedSeries = {
      x: group.x,
      y: group.y,
      label: `${category}: ${xName} vs Index`,
      color: getColorForIndex(categoryIndex),
      symbol: getSymbolForIndex(categoryIndex),
      subType: graphConfig.subType || 'Multiple Straight Lines & Scatter Plots',
      dataFormat: 'X Category',
      errorBarData,
      categoryData: group.indices.map(index => String(rows[index][categoryName] || '')),
      rows,
      isLinePlot: true,
      isScatterPlot: true,
      showMarkers: true,
      showLines: true,
      markerSize: 8,
      lineWidth: 2
    };
    
    series.push(processedSeries);
    categoryIndex++;
    
    });
  
  return series;
}

/**
 * Process Y Category format - Y variables with category grouping
 */
function processYCategory(
  rows: any[],
  yNames: string[],
  categoryNames: string[],
  errorBarNames: string[],
  graphConfig: any
): ProcessedSeries[] {
  const series: ProcessedSeries[] = [];
  
  if (!yNames?.length || !categoryNames?.length) {
    return series;
  }

  const yName = yNames[0];
  const categoryName = categoryNames[0];
  
  // Group data by category
  const categoryGroups = new Map<string, { x: number[], y: number[], indices: number[] }>();
  
  rows.forEach((row, index) => {
    const category = String(row[categoryName] || '');
    const xValue = index; // Use index as X
    const yValue = parseFloat(row[yName]);
    
    if (!isNaN(yValue)) {
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, { x: [], y: [], indices: [] });
      }
      
      const group = categoryGroups.get(category)!;
      group.x.push(xValue);
      group.y.push(yValue);
      group.indices.push(index);
    }
  });
  
  // Create series for each category
  let categoryIndex = 0;
  categoryGroups.forEach((group, category) => {
    // Extract error bar data if available
    let errorBarData: number[] | undefined;
    if (errorBarNames?.length > 0) {
      const errorBarName = errorBarNames[0];
      errorBarData = group.indices.map(index => parseFloat(rows[index][errorBarName])).filter(val => !isNaN(val));
    }
    
    // Create series
    const processedSeries: ProcessedSeries = {
      x: group.x,
      y: group.y,
      label: `${category}: ${yName} vs Index`,
      color: getColorForIndex(categoryIndex),
      symbol: getSymbolForIndex(categoryIndex),
      subType: graphConfig.subType || 'Multiple Straight Lines & Scatter Plots',
      dataFormat: 'Y Category',
      errorBarData,
      categoryData: group.indices.map(index => String(rows[index][categoryName] || '')),
      rows,
      isLinePlot: true,
      isScatterPlot: true,
      showMarkers: true,
      showLines: true,
      markerSize: 8,
      lineWidth: 2
    };
    
    series.push(processedSeries);
    categoryIndex++;
    
    });
  
  return series;
}

/**
 * Get color for series index
 */
function getColorForIndex(index: number): string {
  const colors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
  ];
  return colors[index % colors.length];
}

/**
 * Get symbol for series index
 */
function getSymbolForIndex(index: number): string {
  const symbols = [
    'circle', 'square', 'diamond', 'triangle-up', 'triangle-down',
    'triangle-left', 'triangle-right', 'pentagon', 'hexagon', 'star'
  ];
  return symbols[index % symbols.length];
}
