/**
 * Layout configuration utilities for plotly graphs
 * Handles dynamic layout configuration based on plot type
 */

export interface LegendConfig {
  orientation: 'v' | 'h';
  bgcolor: string;
  bordercolor: string;
  borderwidth: number;
  font: {
    size: number;
    color: string;
    family: string;
  };
  itemwidth: number;
  traceorder: 'normal' | 'reversed' | 'grouped' | 'reversed+grouped';
  xanchor: 'left' | 'center' | 'right';
  yanchor: 'top' | 'middle' | 'bottom';
  borderpad: number;
  itemclick: 'toggle' | 'toggleothers' | 'toggleall';
  itemdoubleclick: 'toggle' | 'toggleothers' | 'toggleall';
  x: number;
  y: number;
  shadow: {
    enabled: boolean;
    color: string;
    x: number;
    y: number;
    blur: number;
  };
}

/**
 * Dynamic legend configuration based on plot type
 */
export const getLegendConfig = (subType: string): LegendConfig => {
  const isErrorBar = subType.toLowerCase().includes('error bar');
  const isRegression = subType.toLowerCase().includes('regression');
  const isPointPlot = subType.toLowerCase().includes('point plot');
  const isDotPlot = subType.toLowerCase().includes('dot plot');
  
  // Base configuration
  const baseConfig: LegendConfig = {
    orientation: 'v',
    bgcolor: 'rgba(255,255,255,0.95)',
    bordercolor: 'rgba(0,0,0,0.3)',
    borderwidth: 1,
    font: {
      size: 12,
      color: 'rgba(0,0,0,0.8)',
      family: 'Arial, sans-serif'
    },
    itemwidth: 30,
    traceorder: 'normal',
    xanchor: 'left',
    yanchor: 'top',
    borderpad: 4,
    itemclick: 'toggleothers',
    itemdoubleclick: 'toggle',
    x: 1.02,
    y: 1,
    shadow: {
      enabled: true,
      color: 'rgba(0,0,0,0.1)',
      x: 2,
      y: 2,
      blur: 4
    }
  };

  if (isErrorBar) {
    return {
      ...baseConfig,
      x: 1.02,
      y: 1,
      bgcolor: 'rgba(255,255,255,0.9)',
      bordercolor: 'rgba(0,0,0,0.2)',
      borderwidth: 1,
      font: {
        ...baseConfig.font,
        size: 11
      }
    };
  } else if (isRegression) {
    return {
      ...baseConfig,
      x: 1.02,
      y: 1,
      bgcolor: 'rgba(255,255,255,0.9)',
      bordercolor: 'rgba(0,0,0,0.2)',
      borderwidth: 1,
      font: {
        ...baseConfig.font,
        size: 11
      }
    };
  } else if (isPointPlot || isDotPlot) {
    return {
      ...baseConfig,
      x: 1.02,
      y: 1,
      bgcolor: 'rgba(255,255,255,0.95)', // More opaque for better readability
      bordercolor: 'rgba(0,0,0,0.3)',
      borderwidth: 1.5,
      font: {
        ...baseConfig.font,
        size: isPointPlot ? 13 : 12 // Larger font for point plots
      },
      // Enhanced shadow for SigmaPlot-style depth
      shadow: {
        enabled: true,
        color: 'rgba(0,0,0,0.15)',
        x: 3,
        y: 3,
        blur: 6
      }
    };
  }

  return baseConfig;
};

/**
 * Get filtered title text, removing unwanted titles
 */
export const getTitleText = (subType?: string): string => {
  if (!subType) return 'Scatter Plot';
  
  // Filter out unwanted titles
  const unwantedTitles = ['test', 'Test', 'TEST'];
  if (unwantedTitles.includes(subType) || subType.length < 3) {
    return 'Scatter Plot';
  }
  
  return subType;
};

/**
 * Dynamic axis configuration based on plot type
 */
export const getAxisConfig = (subType: string, axisType: 'x' | 'y'): any => {
  const isErrorBar = subType.toLowerCase().includes('error bar');
  const isRegression = subType.toLowerCase().includes('regression');
  const isPointPlot = subType.toLowerCase().includes('point plot');
  const isDotPlot = subType.toLowerCase().includes('dot plot');

  if (isErrorBar) {
    return {
      title: {
        text: axisType === 'x' ? 'X Axis' : 'Y Axis',
        font: { size: 14, color: 'rgba(0,0,0,0.8)' }
      },
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)',
      gridwidth: 1,
      rangemode: 'tozero'
    };
  } else if (isRegression) {
    return {
      title: {
        text: axisType === 'x' ? 'X Axis' : 'Y Axis',
        font: { size: 14, color: 'rgba(0,0,0,0.8)' }
      },
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)',
      gridwidth: 1,
      rangemode: 'tozero'
    };
  } else if (isPointPlot) {
    // SigmaPlot-style point plot axis configuration
    return {
      title: {
        text: axisType === 'x' ? 'X Axis' : 'Y Axis',
        font: {
          size: 16, // Larger, more prominent titles
          color: 'rgba(0,0,0,0.9)',
          family: 'Arial, sans-serif'
        },
        standoff: 25 // More spacing from plot area
      },
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.08)', // Subtle grid lines
      gridwidth: 1,
      rangemode: 'tozero',
      showticklabels: true,
      ticklen: 6, // Longer tick marks
      tickwidth: 2, // Thicker tick marks
      tickcolor: 'rgba(0,0,0,0.9)',
      tickfont: {
        size: 13, // Larger tick labels
        color: 'rgba(0,0,0,0.9)',
        family: 'Arial, sans-serif'
      },
      zeroline: true,
      zerolinecolor: 'rgba(0,0,0,0.3)',
      zerolinewidth: 1,
      // SigmaPlot-style axis styling
      linecolor: 'rgba(0,0,0,0.8)',
      linewidth: 2
    };
  } else if (isDotPlot) {
    // SigmaPlot-style dot plot axis configuration
    return {
      title: {
        text: axisType === 'x' ? 'X Axis' : 'Y Axis',
        font: {
          size: 15,
          color: 'rgba(0,0,0,0.9)',
          family: 'Arial, sans-serif'
        },
        standoff: 20
      },
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.06)',
      gridwidth: 1,
      rangemode: 'tozero',
      showticklabels: true,
      ticklen: 5,
      tickwidth: 1.5,
      tickcolor: 'rgba(0,0,0,0.8)',
      tickfont: {
        size: 12,
        color: 'rgba(0,0,0,0.8)',
        family: 'Arial, sans-serif'
      },
      zeroline: true,
      zerolinecolor: 'rgba(0,0,0,0.2)',
      zerolinewidth: 1,
      linecolor: 'rgba(0,0,0,0.7)',
      linewidth: 1.5
    };
  }

  // Default configuration
  return {
    title: {
      text: axisType === 'x' ? 'X Axis' : 'Y Axis',
      font: { size: 14, color: 'rgba(0,0,0,0.8)' }
    },
    showgrid: true,
    gridcolor: 'rgba(0,0,0,0.1)',
    gridwidth: 1,
    rangemode: 'tozero'
  };
};

/**
 * Dynamic annotations based on plot type
 */
export const getAnnotations = (subType: string): any[] => {
  const isErrorBar = subType.toLowerCase().includes('error bar');
  const isRegression = subType.toLowerCase().includes('regression');
  const isPointPlot = subType.toLowerCase().includes('point plot');
  const isDotPlot = subType.toLowerCase().includes('dot plot');

  if (isErrorBar) {
    return [
      {
        text: 'Error bars show data uncertainty',
        xref: 'paper',
        yref: 'paper',
        x: 0.5,
        y: -0.12,
        showarrow: false,
        font: { 
          size: 12, 
          color: 'rgba(0,0,0,0.8)',
          family: 'Arial, sans-serif'
        },
        align: 'center',
        bgcolor: 'rgba(255,255,255,0.9)',
        bordercolor: 'rgba(0,0,0,0.25)',
        borderwidth: 1,
        borderpad: 8
      }
    ];
  } else if (isRegression) {
    return [
      {
        text: 'Regression lines show linear fit',
        xref: 'paper',
        yref: 'paper',
        x: 0.5,
        y: -0.12,
        showarrow: false,
        font: { 
          size: 12, 
          color: 'rgba(0,0,0,0.8)',
          family: 'Arial, sans-serif'
        },
        align: 'center',
        bgcolor: 'rgba(255,255,255,0.9)',
        bordercolor: 'rgba(0,0,0,0.25)',
        borderwidth: 1,
        borderpad: 8
      }
    ];
  } else if (isPointPlot) {
    return [
      {
        text: 'Point plot displays individual data points',
        xref: 'paper',
        yref: 'paper',
        x: 0.5,
        y: -0.12,
        showarrow: false,
        font: { 
          size: 12, 
          color: 'rgba(0,0,0,0.8)',
          family: 'Arial, sans-serif'
        },
        align: 'center',
        bgcolor: 'rgba(255,255,255,0.9)',
        bordercolor: 'rgba(0,0,0,0.25)',
        borderwidth: 1,
        borderpad: 8
      }
    ];
  } else if (isDotPlot) {
    return [
      {
        text: 'Dot plot displays data distribution with dotted lines to axis',
        xref: 'paper',
        yref: 'paper',
        x: 0.5,
        y: -0.12,
        showarrow: false,
        font: { 
          size: 12, 
          color: 'rgba(0,0,0,0.8)',
          family: 'Arial, sans-serif'
        },
        align: 'center',
        bgcolor: 'rgba(255,255,255,0.9)',
        bordercolor: 'rgba(0,0,0,0.25)',
        borderwidth: 1,
        borderpad: 8
      }
    ];
  }

  return [];
};