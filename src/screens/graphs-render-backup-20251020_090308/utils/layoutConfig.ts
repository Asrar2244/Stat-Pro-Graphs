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
 * Dynamic legend configuration based on plot type and mode
 */
export const getLegendConfig = (subType: string, mode: 'light' | 'dark' = 'light'): LegendConfig => {
  const isErrorBar = subType.toLowerCase().includes('error bar');
  const isRegression = subType.toLowerCase().includes('regression');
  const isPointPlot = subType.toLowerCase().includes('point plot');
  const isDotPlot = subType.toLowerCase().includes('dot plot');
  
  // Mode-specific colors
  const isDark = mode === 'dark';
  const bgColor = isDark ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)';
  const borderColor = isDark ? 'rgba(224,224,224,0.3)' : 'rgba(0,0,0,0.3)';
  const fontColor = isDark ? 'rgba(224,224,224,0.9)' : 'rgba(0,0,0,0.8)';
  const shadowColor = isDark ? 'rgba(224,224,224,0.1)' : 'rgba(0,0,0,0.1)';

  // Base configuration
  const baseConfig: LegendConfig = {
    orientation: 'v',
    bgcolor: bgColor,
    bordercolor: borderColor,
    borderwidth: 1,
    font: {
      size: 12,
      color: fontColor,
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
      color: shadowColor,
      x: 2,
      y: 2,
      blur: 4
    }
  };

  if (isErrorBar) {
    const errorBarBgColor = isDark ? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)';
    const errorBarBorderColor = isDark ? 'rgba(224,224,224,0.2)' : 'rgba(0,0,0,0.2)';
    return {
      ...baseConfig,
      x: 1.02,
      y: 1,
      bgcolor: errorBarBgColor,
      bordercolor: errorBarBorderColor,
      borderwidth: 1,
      font: {
        ...baseConfig.font,
        size: 11
      }
    };
  } else if (isRegression) {
    const regressionBgColor = isDark ? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)';
    const regressionBorderColor = isDark ? 'rgba(224,224,224,0.2)' : 'rgba(0,0,0,0.2)';
    return {
      ...baseConfig,
      x: 1.02,
      y: 1,
      bgcolor: regressionBgColor,
      bordercolor: regressionBorderColor,
      borderwidth: 1,
      font: {
        ...baseConfig.font,
        size: 11
      }
    };
  } else if (isPointPlot || isDotPlot) {
    const pointPlotBgColor = isDark ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)';
    const pointPlotBorderColor = isDark ? 'rgba(224,224,224,0.3)' : 'rgba(0,0,0,0.3)';
    const pointPlotShadowColor = isDark ? 'rgba(224,224,224,0.15)' : 'rgba(0,0,0,0.15)';
    return {
      ...baseConfig,
      x: 1.02,
      y: 1,
      bgcolor: pointPlotBgColor, // More opaque for better readability
      bordercolor: pointPlotBorderColor,
      borderwidth: 1.5,
      font: {
        ...baseConfig.font,
        size: isPointPlot ? 13 : 12 // Larger font for point plots
      },
      // Enhanced shadow for SigmaPlot-style depth
      shadow: {
        enabled: true,
        color: pointPlotShadowColor,
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
 * Dynamic axis configuration based on plot type and mode
 */
export const getAxisConfig = (subType: string, axisType: 'x' | 'y', mode: 'light' | 'dark' = 'light'): any => {
  const isErrorBar = subType.toLowerCase().includes('error bar');
  const isRegression = subType.toLowerCase().includes('regression');
  const isPointPlot = subType.toLowerCase().includes('point plot');
  const isDotPlot = subType.toLowerCase().includes('dot plot');

  // Mode-specific colors
  const isDark = mode === 'dark';
  const titleColor = isDark ? 'rgba(224,224,224,0.9)' : 'rgba(0,0,0,0.8)';
  const gridColor = isDark ? 'rgba(224,224,224,0.15)' : 'rgba(0,0,0,0.1)';
  const tickColor = isDark ? 'rgba(224,224,224,0.9)' : 'rgba(0,0,0,0.9)';
  const tickFontColor = isDark ? 'rgba(224,224,224,0.9)' : 'rgba(0,0,0,0.9)';
  const lineColor = isDark ? 'rgba(224,224,224,0.8)' : 'rgba(0,0,0,0.8)';
  const zeroLineColor = isDark ? 'rgba(224,224,224,0.4)' : 'rgba(0,0,0,0.3)';

  if (isErrorBar) {
    return {
      title: {
        text: axisType === 'x' ? 'X Axis' : 'Y Axis',
        font: { size: 14, color: titleColor }
      },
      showgrid: true,
      gridcolor: gridColor,
      gridwidth: 1,
      rangemode: 'tozero'
    };
  } else if (isRegression) {
    return {
      title: {
        text: axisType === 'x' ? 'X Axis' : 'Y Axis',
        font: { size: 14, color: titleColor }
      },
      showgrid: true,
      gridcolor: gridColor,
      gridwidth: 1,
      rangemode: 'tozero'
    };
  } else if (isPointPlot) {
    // SigmaPlot-style point plot axis configuration
    const pointPlotGridColor = isDark ? 'rgba(224,224,224,0.12)' : 'rgba(0,0,0,0.08)';
    return {
      title: {
        text: axisType === 'x' ? 'X Axis' : 'Y Axis',
        font: {
          size: 16, // Larger, more prominent titles
          color: titleColor,
          family: 'Arial, sans-serif'
        },
        standoff: 25 // More spacing from plot area
      },
      showgrid: true,
      gridcolor: pointPlotGridColor, // Subtle grid lines
      gridwidth: 1,
      rangemode: 'tozero',
      showticklabels: true,
      ticklen: 6, // Longer tick marks
      tickwidth: 2, // Thicker tick marks
      tickcolor: tickColor,
      tickfont: {
        size: 13, // Larger tick labels
        color: tickFontColor,
        family: 'Arial, sans-serif'
      },
      zeroline: true,
      zerolinecolor: zeroLineColor,
      zerolinewidth: 1,
      // SigmaPlot-style axis styling
      linecolor: lineColor,
      linewidth: 2
    };
  } else if (isDotPlot) {
    // SigmaPlot-style dot plot axis configuration
    const dotPlotGridColor = isDark ? 'rgba(224,224,224,0.08)' : 'rgba(0,0,0,0.06)';
    const dotPlotZeroLineColor = isDark ? 'rgba(224,224,224,0.3)' : 'rgba(0,0,0,0.2)';
    const dotPlotLineColor = isDark ? 'rgba(224,224,224,0.7)' : 'rgba(0,0,0,0.7)';
    return {
      title: {
        text: axisType === 'x' ? 'X Axis' : 'Y Axis',
        font: {
          size: 15,
          color: titleColor,
          family: 'Arial, sans-serif'
        },
        standoff: 20
      },
      showgrid: true,
      gridcolor: dotPlotGridColor,
      gridwidth: 1,
      rangemode: 'tozero',
      showticklabels: true,
      ticklen: 5,
      tickwidth: 1.5,
      tickcolor: tickColor,
      tickfont: {
        size: 12,
        color: tickFontColor,
        family: 'Arial, sans-serif'
      },
      zeroline: true,
      zerolinecolor: dotPlotZeroLineColor,
      zerolinewidth: 1,
      linecolor: dotPlotLineColor,
      linewidth: 1.5
    };
  }

  // Default configuration
  return {
    title: {
      text: axisType === 'x' ? 'X Axis' : 'Y Axis',
      font: { size: 14, color: titleColor }
    },
    showgrid: true,
    gridcolor: gridColor,
    gridwidth: 1,
    rangemode: 'tozero'
  };
};

/**
 * Dynamic annotations based on plot type
 */
export const getAnnotations = (subType: string): any[] => {
  // Return empty array for all plot types - no informational text boxes
  return [];
};