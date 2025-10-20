/**
 * Line plot specific properties and configurations
 * Defines line plot styling, symbols, and formatting options
 */

export interface LinePlotStyle {
  lineWidth: number;
  lineStyle: string;
  markerSize: number;
  markerSymbol: string;
  showMarkers: boolean;
  showLines: boolean;
  fillArea: boolean;
  fillOpacity: number;
}

export interface LinePlotConfig {
  colors: string[];
  symbols: string[];
  lineStyles: string[];
  defaultLineWidth: number;
  defaultMarkerSize: number;
  defaultFillOpacity: number;
}

/**
 * Get line plot configuration with SigmaPlot-style professional settings
 */
export const getLinePlotConfig = (): LinePlotConfig => {
  // SigmaPlot-style professional color palette for line plots
  const LINE_COLORS = [
    '#1f77b4', // Professional blue
    '#ff7f0e', // Professional orange  
    '#2ca02c', // Professional green
    '#d62728', // Professional red
    '#9467bd', // Professional purple
    '#8c564b', // Professional brown
    '#e377c2', // Professional pink
    '#7f7f7f', // Professional gray
    '#bcbd22', // Professional olive
    '#17becf', // Professional cyan
    '#ff9896', // Light red
    '#98df8a', // Light green
    '#ffbb78', // Light orange
    '#c5b0d5', // Light purple
    '#c49c94', // Light brown
    '#f7b6d3', // Light pink
    '#c7c7c7', // Light gray
    '#dbdb8d', // Light olive
    '#9edae5', // Light cyan
    '#aec7e8'  // Light blue
  ];
  
  // SigmaPlot-style marker symbols optimized for line plots
  const LINE_SYMBOLS = [
    'circle',      // Standard circle
    'square',      // Square
    'diamond',     // Diamond
    'triangle-up', // Triangle up
    'triangle-down', // Triangle down
    'triangle-left', // Triangle left
    'triangle-right', // Triangle right
    'pentagon',    // Pentagon
    'hexagon',     // Hexagon
    'star',        // Star
    'cross',       // Cross
    'x',           // X mark
    'asterisk',    // Asterisk
    'hash'         // Hash
  ];
  
  // Professional line styles
  const LINE_STYLES = [
    'solid',       // Solid line
    'dashed',      // Dashed line
    'dotted',      // Dotted line
    'dashdot',     // Dash-dot line
    'longdash',    // Long dash line
    'longdashdot'  // Long dash-dot line
  ];
  
  return {
    colors: LINE_COLORS,
    symbols: LINE_SYMBOLS,
    lineStyles: LINE_STYLES,
    defaultLineWidth: 2,
    defaultMarkerSize: 8,
    defaultFillOpacity: 0.2
  };
};

/**
 * Get default line plot style configuration
 */
export const getDefaultLinePlotStyle = (): LinePlotStyle => {
  return {
    lineWidth: 2,
    lineStyle: 'solid',
    markerSize: 8,
    markerSymbol: 'circle',
    showMarkers: false, // Default to no markers for clean line plots
    showLines: true,
    fillArea: false,
    fillOpacity: 0.2
  };
};

/**
 * Parse line plot subType to extract configuration
 */
export const parseLinePlotSubType = (subType: string): Partial<LinePlotStyle> => {
  const lowerSubType = subType.toLowerCase();
  
  const style: Partial<LinePlotStyle> = {};
  
  // Determine if markers should be shown
  if (lowerSubType.includes('markers only') || lowerSubType.includes('markers-only')) {
    style.showMarkers = true;
    style.showLines = false;
  } else if (lowerSubType.includes('line+markers') || lowerSubType.includes('line with markers')) {
    style.showMarkers = true;
    style.showLines = true;
  } else if (lowerSubType.includes('line only') || lowerSubType.includes('line-only')) {
    style.showMarkers = false;
    style.showLines = true;
  } else {
    // Default for ALL line plots: show lines only, no markers (clean line plots)
    // This includes step plots, spline curves, straight lines, etc.
    style.showMarkers = false;
    style.showLines = true;
  }
  
  // Determine line style - default to solid for line plots
  if (lowerSubType.includes('dashed')) {
    style.lineStyle = 'dashed';
  } else if (lowerSubType.includes('dotted')) {
    style.lineStyle = 'dotted';
  } else if (lowerSubType.includes('dashdot') || lowerSubType.includes('dash-dot')) {
    style.lineStyle = 'dashdot';
  } else if (lowerSubType.includes('longdash')) {
    style.lineStyle = 'longdash';
  } else {
    // Default to solid for all line plot types
    style.lineStyle = 'solid';
  }
  
  // Determine if area fill should be applied
  if (lowerSubType.includes('area') || lowerSubType.includes('filled')) {
    style.fillArea = true;
  }
  
  // Determine marker size based on plot type
  if (lowerSubType.includes('thick') || lowerSubType.includes('bold')) {
    style.markerSize = 12;
    style.lineWidth = 3;
  } else if (lowerSubType.includes('thin') || lowerSubType.includes('light')) {
    style.markerSize = 6;
    style.lineWidth = 1;
  } else {
    style.markerSize = 8;
    style.lineWidth = 2;
  }
  
  return style;
};

/**
 * Get line plot mode based on subType and configuration
 */
export const getLinePlotMode = (subType: string, style: Partial<LinePlotStyle>): string => {
  const lowerSubType = subType.toLowerCase();
  
  // Determine mode based on style configuration first
  if (style.showMarkers && style.showLines) {
    return 'lines+markers';
  } else if (style.showMarkers && !style.showLines) {
    return 'markers';
  } else if (!style.showMarkers && style.showLines) {
    return 'lines';  // This is the default for clean line plots
  }
  
  // Fallback based on subType if style is not clear
  if (lowerSubType.includes('markers only') || lowerSubType.includes('markers-only')) {
    return 'markers';
  } else if (lowerSubType.includes('line+markers') || lowerSubType.includes('line with markers')) {
    return 'lines+markers';
  } else {
    // Default for all line plots: lines only (no markers)
    return 'lines';
  }
};

/**
 * Get line shape based on subType
 */
export const getLineShape = (subType: string): string => {
  const lowerSubType = subType.toLowerCase();
  
  if (lowerSubType.includes('spline curve') || lowerSubType.includes('spline')) {
    return 'spline';
  } else if (lowerSubType.includes('vertical step')) {
    return 'vh'; // Vertical then horizontal steps (correct for vertical step plots)
  } else if (lowerSubType.includes('horizontal step')) {
    return 'hv'; // Horizontal then vertical steps (correct for horizontal step plots)
  } else if (lowerSubType.includes('vertical mid point') || lowerSubType.includes('vertical midpoint')) {
    return 'vhv'; // Vertical-horizontal-vertical steps for vertical mid-point
  } else if (lowerSubType.includes('horizontal mid point') || lowerSubType.includes('horizontal midpoint')) {
    return 'hvh'; // Horizontal-vertical-horizontal steps for horizontal mid-point
  } else if (lowerSubType.includes('mid point')) {
    return 'hvh'; // Default mid-point behavior (horizontal-vertical-horizontal)
  } else if (lowerSubType.includes('step')) {
    return 'hv'; // Default step behavior
  } else {
    return 'linear'; // Standard linear interpolation for straight lines
  }
};

/**
 * Validate line plot configuration
 */
export const validateLinePlotConfig = (config: Partial<LinePlotStyle>): LinePlotStyle => {
  const defaultStyle = getDefaultLinePlotStyle();
  
  return {
    lineWidth: Math.max(0.5, Math.min(10, config.lineWidth || defaultStyle.lineWidth)),
    lineStyle: config.lineStyle || defaultStyle.lineStyle,
    markerSize: Math.max(2, Math.min(20, config.markerSize || defaultStyle.markerSize)),
    markerSymbol: config.markerSymbol || defaultStyle.markerSymbol,
    showMarkers: config.showMarkers !== undefined ? config.showMarkers : defaultStyle.showMarkers,
    showLines: config.showLines !== undefined ? config.showLines : defaultStyle.showLines,
    fillArea: config.fillArea !== undefined ? config.fillArea : defaultStyle.fillArea,
    fillOpacity: Math.max(0, Math.min(1, config.fillOpacity || defaultStyle.fillOpacity))
  };
};
