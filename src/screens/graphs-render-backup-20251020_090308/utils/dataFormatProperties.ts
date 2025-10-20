/**
 * Data format-specific plot properties
 * Handles per-series styling based on data format
 */

export interface SeriesStyle {
  /** Series label/name */
  label: string;
  /** Series color */
  color: string;
  /** Series symbol */
  symbol: string;
  /** Point size */
  pointSize: number;
  /** Point opacity */
  pointOpacity: number;
  /** Border width */
  borderWidth: number;
  /** Border color */
  borderColor: string;
}

export interface DataFormatProperties {
  /** Data format type */
  dataFormat: string;
  /** Series-specific styles */
  seriesStyles: Record<string, SeriesStyle>;
  /** Global properties for this format */
  global: {
    /** Default point size */
    defaultPointSize: number;
    /** Default point opacity */
    defaultPointOpacity: number;
    /** Default border width */
    defaultBorderWidth: number;
    /** Default border color */
    defaultBorderColor: string;
    /** Use automatic color assignment */
    useAutoColors: boolean;
    /** Use automatic symbol assignment */
    useAutoSymbols: boolean;
  };
}

/**
 * Get default series style
 */
export const getDefaultSeriesStyle = (label: string, index: number): SeriesStyle => {
  const colors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
  ];
  
  const symbols = [
    'circle', 'square', 'diamond', 'triangle-up', 'triangle-down',
    'triangle-left', 'triangle-right', 'pentagon', 'hexagon', 'star'
  ];

  return {
    label,
    color: colors[index % colors.length],
    symbol: symbols[index % symbols.length],
    pointSize: 8,
    pointOpacity: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)'
  };
};

/**
 * Create data format properties based on data format and series
 */
export const createDataFormatProperties = (
  dataFormat: string,
  seriesLabels: string[]
): DataFormatProperties => {
  const seriesStyles: Record<string, SeriesStyle> = {};
  
  // Create series styles for each label
  seriesLabels.forEach((label, index) => {
    seriesStyles[label] = getDefaultSeriesStyle(label, index);
  });

  return {
    dataFormat,
    seriesStyles,
    global: {
      defaultPointSize: 8,
      defaultPointOpacity: 1,
      defaultBorderWidth: 1,
      defaultBorderColor: 'rgba(0,0,0,0.3)',
      useAutoColors: true,
      useAutoSymbols: true
    }
  };
};

/**
 * Get data format description for UI
 */
export const getDataFormatDescription = (dataFormat: string): string => {
  switch (dataFormat) {
    case 'XY Pair':
      return 'Single X-Y pair. Each pair gets its own color.';
    case 'XY Pairs':
      return 'Multiple X-Y pairs. Each pair (X1↔Y1, X2↔Y2) gets its own color.';
    case 'X Many Y':
      return 'One X column with multiple Y columns. Each Y column gets its own color.';
    case 'Y Many X':
      return 'One Y column with multiple X columns. Each X column gets its own color.';
    case 'Many X':
      return 'Multiple X columns plotted against index. Each X column gets its own color.';
    case 'Many Y':
      return 'Multiple Y columns plotted against index. Each Y column gets its own color.';
    case 'XY Category':
      return 'X-Y data grouped by category. Each category gets its own color.';
    case 'X Category':
      return 'X data grouped by category. Each category gets its own color.';
    case 'Y Category':
      return 'Y data grouped by category. Each category gets its own color.';
    default:
      return 'Custom data format with per-series styling.';
  }
};

/**
 * Get series labels based on data format and variables
 */
export const getSeriesLabels = (
  dataFormat: string,
  xNames: string[],
  yNames: string[],
  categoryNames: string[] = []
): string[] => {
  switch (dataFormat) {
    case 'XY Pair':
      return [`${yNames[0]} vs ${xNames[0]}`];
    
    case 'XY Pairs':
      return xNames.slice(0, yNames.length).map((x, i) => `${yNames[i]} vs ${x}`);
    
    case 'X Many Y':
      return yNames.map(y => `${y} vs ${xNames[0]}`);
    
    case 'Y Many X':
      return xNames.map(x => `${yNames[0]} vs ${x}`);
    
    case 'Many X':
      return xNames.map(x => `${x} vs index`);
    
    case 'Many Y':
      return yNames.map(y => `${y} vs index`);
    
    case 'XY Category':
      // This will be handled by category processing
      return categoryNames.length > 0 ? categoryNames : ['Category'];
    
    case 'X Category':
      // This will be handled by category processing
      return categoryNames.length > 0 ? categoryNames : ['Category'];
    
    case 'Y Category':
      // This will be handled by category processing
      return categoryNames.length > 0 ? categoryNames : ['Category'];
    
    default:
      return [...xNames, ...yNames].filter(Boolean);
  }
};

/**
 * Update series style
 */
export const updateSeriesStyle = (
  properties: DataFormatProperties,
  seriesLabel: string,
  updates: Partial<SeriesStyle>
): DataFormatProperties => {
  return {
    ...properties,
    seriesStyles: {
      ...properties.seriesStyles,
      [seriesLabel]: {
        ...properties.seriesStyles[seriesLabel],
        ...updates
      }
    }
  };
};

/**
 * Apply global defaults to all series
 */
export const applyGlobalDefaults = (
  properties: DataFormatProperties,
  updates: Partial<DataFormatProperties['global']>
): DataFormatProperties => {
  const newGlobal = { ...properties.global, ...updates };
  
  // Apply global changes to all series
  const updatedSeriesStyles: Record<string, SeriesStyle> = {};
  Object.entries(properties.seriesStyles).forEach(([label, style]) => {
    updatedSeriesStyles[label] = {
      ...style,
      pointSize: newGlobal.defaultPointSize,
      pointOpacity: newGlobal.defaultPointOpacity,
      borderWidth: newGlobal.defaultBorderWidth,
      borderColor: newGlobal.defaultBorderColor
    };
  });

  return {
    ...properties,
    global: newGlobal,
    seriesStyles: updatedSeriesStyles
  };
};
