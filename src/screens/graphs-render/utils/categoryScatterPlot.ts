/**
 * Category-based scatter plot utilities
 * Handles multiple data formats with category columns
 */

import { getSeriesConfig } from './traceGeneration';
import { computeLinearRegression, createRegressionTraces } from './regressionAnalysis';
import { getPlotProperties, applyScatterProperties, applyRegressionProperties } from './plotProperties';

export interface CategoryPlotConfig {
  rows: any[];
  xCol?: string;
  yCol?: string;
  categoryCol?: string;
  subType?: string;
  liveProps?: any;
}

export interface CategoryTrace {
  x: number[];
  y: number[];
  type: string;
  mode: string;
  name: string;
  marker: {
    color: string;
    symbol: string;
    size?: number;
    line?: any;
  };
  showlegend: boolean;
}

/**
 * Create scatter plot traces with category grouping
 * Automatically handles three formats:
 * 1. X, Y, Category → standard scatter with colors per category
 * 2. X, Category → strip plot with categories on Y-axis
 * 3. Y, Category → strip plot with categories on X-axis
 */
export const createCategoryScatterTraces = (config: CategoryPlotConfig): CategoryTrace[] => {
  const { rows, xCol, yCol, categoryCol, subType = 'Scatter Plot' } = config;
  
  if (!rows || rows.length === 0) {
    console.warn('No data rows provided');
    return [];
  }

  // Get color and symbol configuration
  const { colors, symbols } = getSeriesConfig();
  const traces: CategoryTrace[] = [];

  // Determine plot format and create appropriate traces
  if (xCol && yCol && categoryCol) {
    // Format 1: X, Y, Category → Standard scatter with category coloring
    traces.push(...createXYCategoryTraces(rows, xCol, yCol, categoryCol, colors, symbols, subType));
  } else if (xCol && categoryCol && !yCol) {
    // Format 2: X, Category → Strip plot with categories on Y-axis
    traces.push(...createXCategoryTraces(rows, xCol, categoryCol, colors, symbols, subType));
  } else if (yCol && categoryCol && !xCol) {
    // Format 3: Y, Category → Strip plot with categories on X-axis
    traces.push(...createYCategoryTraces(rows, yCol, categoryCol, colors, symbols, subType));
  } else {
    console.warn('Invalid combination of columns for category plot');
    return [];
  }

  return traces;
};

/**
 * Format 1: X vs Y with Category coloring
 * Creates standard scatter plot with different colors/markers per category
 */
const createXYCategoryTraces = (
  rows: any[],
  xCol: string,
  yCol: string,
  categoryCol: string,
  colors: string[],
  symbols: string[],
  _subType: string // Prefix with underscore to indicate intentionally unused
): CategoryTrace[] => {
  // Group data by category
  const categoryData = groupByCategory(rows, categoryCol);
  const traces: CategoryTrace[] = [];
  
  let colorIndex = 0;
  let symbolIndex = 0;

  // Create a trace for each category
  Object.entries(categoryData).forEach(([category, categoryRows]) => {
    const xValues: number[] = [];
    const yValues: number[] = [];

    categoryRows.forEach(row => {
      const xVal = parseValue(row[xCol]);
      const yVal = parseValue(row[yCol]);
      
      if (xVal !== null && yVal !== null) {
        xValues.push(xVal);
        yValues.push(yVal);
      }
    });

    if (xValues.length > 0) {
      traces.push({
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'markers',
        name: String(category),
        marker: {
          color: colors[colorIndex % colors.length],
          symbol: symbols[symbolIndex % symbols.length],
          size: 8,
          line: {
            width: 1,
            color: 'rgba(0,0,0,0.3)'
          }
        },
        showlegend: true
      });

      colorIndex++;
      symbolIndex++;
    }
  });

  return traces;
};

/**
 * Format 2: X with Category on Y-axis (Strip plot style)
 * Plots X values on X-axis, categories as positions on Y-axis
 */
const createXCategoryTraces = (
  rows: any[],
  xCol: string,
  categoryCol: string,
  colors: string[],
  symbols: string[],
  _subType: string // Prefix with underscore to indicate intentionally unused
): CategoryTrace[] => {
  // Group data by category
  const categoryData = groupByCategory(rows, categoryCol);
  const traces: CategoryTrace[] = [];
  const categories = Object.keys(categoryData);
  
  let colorIndex = 0;
  let symbolIndex = 0;

  // Create a trace for each category
  categories.forEach((category, categoryIndex) => {
    const categoryRows = categoryData[category];
    const xValues: number[] = [];
    const yValues: number[] = []; // Will be category positions

    categoryRows.forEach(row => {
      const xVal = parseValue(row[xCol]);
      
      if (xVal !== null) {
        xValues.push(xVal);
        // Use category index as Y position (with small jitter to avoid overlapping)
        const jitter = (Math.random() - 0.5) * 0.2; // ±0.1 jitter
        yValues.push(categoryIndex + jitter);
      }
    });

    if (xValues.length > 0) {
      traces.push({
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'markers',
        name: String(category),
        marker: {
          color: colors[colorIndex % colors.length],
          symbol: symbols[symbolIndex % symbols.length],
          size: 8,
          line: {
            width: 1,
            color: 'rgba(0,0,0,0.3)'
          }
        },
        showlegend: true
      });

      colorIndex++;
      symbolIndex++;
    }
  });

  return traces;
};

/**
 * Format 3: Y with Category on X-axis (Strip plot style)
 * Plots Y values on Y-axis, categories as positions on X-axis
 */
const createYCategoryTraces = (
  rows: any[],
  yCol: string,
  categoryCol: string,
  colors: string[],
  symbols: string[],
  _subType: string // Prefix with underscore to indicate intentionally unused
): CategoryTrace[] => {
  // Group data by category
  const categoryData = groupByCategory(rows, categoryCol);
  const traces: CategoryTrace[] = [];
  const categories = Object.keys(categoryData);
  
  let colorIndex = 0;
  let symbolIndex = 0;

  // Create a trace for each category
  categories.forEach((category, categoryIndex) => {
    const categoryRows = categoryData[category];
    const xValues: number[] = []; // Will be category positions
    const yValues: number[] = [];

    categoryRows.forEach(row => {
      const yVal = parseValue(row[yCol]);
      
      if (yVal !== null) {
        // Use category index as X position (with small jitter to avoid overlapping)
        const jitter = (Math.random() - 0.5) * 0.2; // ±0.1 jitter
        xValues.push(categoryIndex + jitter);
        yValues.push(yVal);
      }
    });

    if (yValues.length > 0) {
      traces.push({
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'markers',
        name: String(category),
        marker: {
          color: colors[colorIndex % colors.length],
          symbol: symbols[symbolIndex % symbols.length],
          size: 8,
          line: {
            width: 1,
            color: 'rgba(0,0,0,0.3)'
          }
        },
        showlegend: true
      });

      colorIndex++;
      symbolIndex++;
    }
  });

  return traces;
};

/**
 * Get custom layout for category-based plots
 */
export const getCategoryPlotLayout = (
  config: CategoryPlotConfig,
  baseLayout: any
): any => {
  const { rows, xCol, yCol, categoryCol } = config;
  
  if (!categoryCol) {
    return baseLayout;
  }

  const categoryData = groupByCategory(rows, categoryCol);
  const categories = Object.keys(categoryData);
  const layout = { ...baseLayout };

  // Format 2: X + Category (categories on Y-axis)
  if (xCol && !yCol && categoryCol) {
    layout.yaxis = {
      ...layout.yaxis,
      tickmode: 'array',
      tickvals: categories.map((_, index) => index),
      ticktext: categories,
      title: categoryCol
    };
    layout.xaxis = {
      ...layout.xaxis,
      title: xCol
    };
  }
  
  // Format 3: Y + Category (categories on X-axis)
  else if (yCol && !xCol && categoryCol) {
    layout.xaxis = {
      ...layout.xaxis,
      tickmode: 'array',
      tickvals: categories.map((_, index) => index),
      ticktext: categories,
      title: categoryCol
    };
    layout.yaxis = {
      ...layout.yaxis,
      title: yCol
    };
  }
  
  // Format 1: X + Y + Category (standard axes)
  else if (xCol && yCol && categoryCol) {
    layout.xaxis = {
      ...layout.xaxis,
      title: xCol
    };
    layout.yaxis = {
      ...layout.yaxis,
      title: yCol
    };
  }

  return layout;
};

/**
 * Helper: Group rows by category value
 */
const groupByCategory = (rows: any[], categoryCol: string): Record<string, any[]> => {
  const grouped: Record<string, any[]> = {};

  rows.forEach(row => {
    const categoryValue = String(row[categoryCol] || 'Unknown');
    
    if (!grouped[categoryValue]) {
      grouped[categoryValue] = [];
    }
    
    grouped[categoryValue].push(row);
  });

  return grouped;
};

/**
 * Helper: Parse value to number, handling strings and nulls
 */
const parseValue = (value: any): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  
  return null;
};

/**
 * Main function to create category-based scatter plot
 * Automatically detects format and creates appropriate visualization
 */
export const plotWithCategory = (config: CategoryPlotConfig): {
  traces: CategoryTrace[];
  layout: any;
} => {
  const traces = createCategoryScatterTraces(config);
  
  // Get plot properties for live customization
  const plotProperties = getPlotProperties(config.liveProps);
  console.log('🎨 Category plot properties loaded:', plotProperties);
  
  // Apply scatter properties to all traces
  const finalTraces = plotProperties.scatter ? traces.map(trace => 
    applyScatterProperties(trace, plotProperties.scatter!)
  ) : traces;
  
  // Add regression traces if this is a regression subType
  const isRegression = config.subType?.toLowerCase().includes('regression');
  if (isRegression) {
    console.log(`🔍 Adding regression traces for category plot with subType: ${config.subType}`);
    
    const { colors } = getSeriesConfig();
    
    // Add regression traces for each category trace
    finalTraces.forEach((trace, index) => {
      if (trace.x && trace.y && trace.x.length > 1 && trace.y.length > 1) {
        console.log(`📊 Computing regression for category trace: ${trace.name}`);
        
        const regressionResult = computeLinearRegression(trace.x, trace.y);
        if (regressionResult) {
          console.log(`✅ Regression computed for ${trace.name}:`, {
            slope: regressionResult.m,
            intercept: regressionResult.b,
            rSquared: regressionResult.rSquared
          });
          
          const regressionTraces = createRegressionTraces(
            trace.x,
            trace.y,
            trace.name,
            colors[index % colors.length],
            config.subType || '',
            regressionResult
          );
          
          // Apply regression properties
          const finalRegressionTraces = plotProperties.regression ? regressionTraces.map(regTrace => 
            applyRegressionProperties(regTrace, plotProperties.regression!)
          ) : regressionTraces;
          
          console.log(`📈 Adding ${finalRegressionTraces.length} regression traces for ${trace.name}`);
          finalTraces.push(...finalRegressionTraces);
        } else {
          console.log(`❌ No regression result for ${trace.name}`);
        }
      }
    });
  }
  
  const baseLayout = {
    title: config.subType || 'Scatter Plot with Categories',
    showlegend: true,
    legend: {
      orientation: 'v',
      x: 1.02,
      y: 1,
      xanchor: 'left',
      yanchor: 'top'
    },
    hovermode: 'closest',
    autosize: true
  };
  
  const layout = getCategoryPlotLayout(config, baseLayout);
  
  return { traces: finalTraces, layout };
};

