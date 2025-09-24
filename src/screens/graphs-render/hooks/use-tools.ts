import { useState } from 'react';

// Global properties that apply to all graphs
export interface GlobalGraphProperties {
  // Appearance
  backgroundColor: string;
  plotColor?: string;
  seriesColor?: string;
  backgroundTransparencyPct?: number; // 0-100
  plotTransparencyPct?: number; // 0-100
  showGridLines: boolean;
  showAxisLabels: boolean;
  marginSize: number;
  padding: number;

  // General Graph Settings
  graphName: string;
  axisXData?: string;
  axisYData?: string;
  showTitle: boolean;

  // Legends
  showLegend: boolean;
  legendTitle: string;
  legendColumns: number;
  legendBoxSpacingInch: number;
  legendPosition: 'front' | 'legendBox';
  legendLock: boolean;
  legendAllowDragResize: boolean;
  legendFramedInBox: boolean;
  legendDirectLabeling: boolean;
  legendUseYOnly: boolean;

  // Legend Items
  editableLegendText: boolean;
  symbolPlacement: 'before' | 'after';
  legendStyle: 'rectangle';
  legendWidth: number;
  legendHeight: number;
  legendTextEntries: Record<string, string>; // Store custom legend text entries
  legendSeriesColors: Record<string, string>; // Per-series color overrides keyed by legend label

  // Export
  imageQuality: number;
  imageFormat: string;
  dpi: number;

  // Grid Settings
  gridPlane: 'xy2d';
  gridXMajor: boolean;
  gridYMajor: boolean;
  gridXMinor: boolean;
  gridYMinor: boolean;
  gridLineStyle: 'none' | 'solid' | 'dashed' | 'dotted';
  gridThicknessInch: number; // will be mapped to px heuristically
  gridColor: string;
  gridGapColor: string;
  gridTransparencyPct: number; // 0-100
  gridLayering: 'gridFront' | 'plotFront';

  // Axis Lines
  yAxisSide: 'left' | 'right';
  axisLineColor: string;
  axisLineThicknessInch: number;
  axisLineTransparencyPct: number; // 0-100

  // Scaling Options (per-axis)
  xScaleType: 'linear' | 'log10' | 'loge' | 'probability' | 'probit' | 'logit' | 'category' | 'datetime' | 'weibull' | 'reciprocal';
  yScaleType: 'linear' | 'log10' | 'loge' | 'probability' | 'probit' | 'logit' | 'category' | 'datetime' | 'weibull' | 'reciprocal';
  xRangeStartMode: 'constant' | 'data';
  xRangeStart?: number;
  xRangeEndMode: 'constant' | 'data';
  xRangeEnd?: number;
  xPad5: boolean;
  xNearestTick: boolean;
  yRangeStartMode: 'constant' | 'data';
  yRangeStart?: number;
  yRangeEndMode: 'constant' | 'data';
  yRangeEnd?: number;
  yPad5: boolean;
  yNearestTick: boolean;

  // Tick Labels - Major
  majorTickShowLeft: boolean;
  majorTickShowRight: boolean;
  majorTickPrefix: string;
  majorTickSuffix: string;
  majorTickNumericType: 'number' | 'percent' | 'scientific' | 'engineering';
  majorTickPrecisionMode: 'auto' | 'manual';
  majorTickPrecision: number; // 0-15
  majorTickExponentFormat: 'e' | 'SI' | 'power';
  majorTickFactor: '1e-4' | '1e-3' | '0.1' | '1' | '10';

  // Tick Labels - Minor
  minorTickShowLeft: boolean;
  minorTickShowRight: boolean;
  minorTickPrefix: string;
  minorTickSuffix: string;
  minorTickNumericType: 'number' | 'percent' | 'scientific' | 'engineering';
  minorTickPrecisionMode: 'auto' | 'manual';
  minorTickPrecision: number; // 0-15
  minorTickExponentFormat: 'e' | 'SI' | 'power';
  minorTickFactor: '1e-4' | '1e-3' | '0.1' | '1' | '10';
}

// Plot-specific properties for different graph types
export interface PlotSpecificProperties {
  scatter?: {
    pointSize: number;
    showDataPoints: boolean;
    pointOpacity: number;
    pointBorderWidth: number;
    pointColor?: string;
  };
  errorBar?: {
    errorBarThickness: number;
    errorBarWidth: number;
    errorBarOpacity: number;
    errorBarCapSize: number;
    showErrorBars: boolean;
  };
  pointPlot?: {
    pointSize: number;
    pointOpacity: number;
    pointBorderWidth: number;
    pointBorderColor: string;
    showDataPoints: boolean;
  };
  dotPlot?: {
    dotSize: number;
    dotOpacity: number;
    dotSpacing: number;
    showDottedLines: boolean;
    dottedLineOpacity: number;
    dottedLineColor?: string;
  };
  regression?: {
    lineWidth: number;
    lineOpacity: number;
    lineColor: string;
    showConfidenceInterval: boolean;
    confidenceIntervalOpacity: number;
  };
}

export interface GraphProperties {
  global: GlobalGraphProperties;
  plotSpecific: PlotSpecificProperties;
}

export const useTools = () => {
  const [fontBold, setFontBold] = useState(false);
  const [fontItalic, setFontItalic] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [fontColor, setFontColor] = useState('#000000');
  const [showRunHistory, setShowRunHistory] = useState(false);
  const [showGraphProperties, setShowGraphProperties] = useState(false);
  const [totalRuns, setTotalRuns] = useState(0);
  
  // Graph properties state
  const [graphProperties, setGraphProperties] = useState<GraphProperties>({
    global: {
      backgroundColor: '#ffffff',
      plotColor: '',
      seriesColor: '',
      backgroundTransparencyPct: 0,
      plotTransparencyPct: 0,
      showGridLines: true,
      showAxisLabels: true,
      marginSize: 20,
      padding: 10,
      // General Graph Settings defaults
      graphName: 'Untitled Graph',
      axisXData: 'X axis',
      axisYData: 'Y axis',
      showTitle: true,
      // Legends defaults
      showLegend: true,
      legendTitle: '',
      legendColumns: 1,
      legendBoxSpacingInch: 0.25,
      legendPosition: 'legendBox',
      legendLock: false,
      legendAllowDragResize: true,
      legendFramedInBox: true,
      legendDirectLabeling: false,
      legendUseYOnly: false,
      // Legend Items defaults
      editableLegendText: true,
      symbolPlacement: 'before',
      legendStyle: 'rectangle',
      legendWidth: 200,
      legendHeight: 100,
      legendTextEntries: {}, // Empty object to store custom legend text
      legendSeriesColors: {},
      // Export defaults
      imageQuality: 150,
      imageFormat: 'PNG',
      dpi: 300,

      // Grid Settings defaults
      gridPlane: 'xy2d',
      gridXMajor: true,
      gridYMajor: true,
      gridXMinor: false,
      gridYMinor: false,
      gridLineStyle: 'solid',
      gridThicknessInch: 0.01,
      gridColor: '#e5e5e5',
      gridGapColor: '#ffffff',
      gridTransparencyPct: 0,
      gridLayering: 'plotFront',

      // Axis Lines defaults
      yAxisSide: 'left',
      axisLineColor: '#444444',
      axisLineThicknessInch: 0.0104, // ~1px
      axisLineTransparencyPct: 0,

      // Scaling Options defaults
      xScaleType: 'linear',
      yScaleType: 'linear',
      xRangeStartMode: 'data',
      xRangeEndMode: 'data',
      xPad5: false,
      xNearestTick: false,
      yRangeStartMode: 'data',
      yRangeEndMode: 'data',
      yPad5: false,
      yNearestTick: false,

      // Tick Labels defaults - Major
      majorTickShowLeft: true,
      majorTickShowRight: true,
      majorTickPrefix: '',
      majorTickSuffix: '',
      majorTickNumericType: 'number',
      majorTickPrecisionMode: 'auto',
      majorTickPrecision: 2,
      majorTickExponentFormat: 'e',
      majorTickFactor: '1',

      // Tick Labels defaults - Minor
      minorTickShowLeft: true,
      minorTickShowRight: true,
      minorTickPrefix: '',
      minorTickSuffix: '',
      minorTickNumericType: 'number',
      minorTickPrecisionMode: 'auto',
      minorTickPrecision: 1,
      minorTickExponentFormat: 'e',
      minorTickFactor: '1',
    },
    plotSpecific: {
      scatter: {
        pointSize: 8,
        showDataPoints: true,
        pointOpacity: 0.8,
        pointBorderWidth: 1,
        pointColor: '',
      },
      errorBar: {
        errorBarThickness: 2,
        errorBarWidth: 0.5,
        errorBarOpacity: 0.7,
        errorBarCapSize: 3,
        showErrorBars: true,
      },
      pointPlot: {
        pointSize: 12,
        pointOpacity: 0.85,
        pointBorderWidth: 2,
        pointBorderColor: '#000000',
        showDataPoints: true,
      },
      dotPlot: {
        dotSize: 6,
        dotOpacity: 0.8,
        dotSpacing: 0.02,
        showDottedLines: true,
        dottedLineOpacity: 0.3,
        dottedLineColor: '',
      },
      regression: {
        lineWidth: 2,
        lineOpacity: 0.9,
        lineColor: '#ff0000',
        showConfidenceInterval: true,
        confidenceIntervalOpacity: 0.2,
      },
    },
  });

  const toggleShowHistory = () => {
    setShowRunHistory(!showRunHistory);
    // Close graph properties when opening history
    if (!showRunHistory) {
      setShowGraphProperties(false);
    }
  };

  const toggleGraphProperties = () => {
    setShowGraphProperties(!showGraphProperties);
    // Close history when opening graph properties
    if (!showGraphProperties) {
      setShowRunHistory(false);
    }
  };

  // Update global graph properties
  const updateGraphProperty = <K extends keyof GlobalGraphProperties>(
    key: K,
    value: GlobalGraphProperties[K]
  ) => {
    setGraphProperties(prev => ({
      ...prev,
      global: {
        ...prev.global,
        [key]: value,
      },
    }));
  };

  // Update plot-specific properties
  const updatePlotSpecificProperty = <T extends keyof PlotSpecificProperties>(
    plotType: T,
    key: keyof NonNullable<PlotSpecificProperties[T]>,
    value: any
  ) => {
    setGraphProperties(prev => ({
      ...prev,
      plotSpecific: {
        ...prev.plotSpecific,
        [plotType]: {
          ...prev.plotSpecific[plotType],
          [key]: value,
        },
      },
    }));
  };

  // Update legend text entry
  const updateLegendTextEntry = (originalLabel: string, newText: string) => {
    setGraphProperties(prev => ({
      ...prev,
      global: {
        ...prev.global,
        legendTextEntries: {
          ...prev.global.legendTextEntries,
          [originalLabel]: newText,
        },
      },
    }));
  };

  // Update per-series color override
  const updateLegendSeriesColor = (label: string, color: string) => {
    setGraphProperties(prev => ({
      ...prev,
      global: {
        ...prev.global,
        legendSeriesColors: {
          ...prev.global.legendSeriesColors,
          [label]: color,
        },
      },
    }));
  };

  // Get current plot type based on subType
  const getCurrentPlotType = (subType?: string): keyof PlotSpecificProperties | null => {
    if (!subType) return null;
    
    const subTypeLower = subType.toLowerCase();
    
    if (subTypeLower.includes('scatter')) return 'scatter';
    if (subTypeLower.includes('error bar')) return 'errorBar';
    if (subTypeLower.includes('point plot')) return 'pointPlot';
    if (subTypeLower.includes('dot plot')) return 'dotPlot';
    if (subTypeLower.includes('regression')) return 'regression';
    
    return null;
  };

  return {
    fontBold,
    fontItalic,
    fontSize,
    fontColor,
    showRunHistory,
    showGraphProperties,
    totalRuns,
    graphProperties,
    setFontBold,
    setFontItalic,
    setFontSize,
    setFontColor,
    toggleShowHistory,
    toggleGraphProperties,
    updateGraphProperty,
    updatePlotSpecificProperty,
    updateLegendTextEntry,
    updateLegendSeriesColor,
    getCurrentPlotType,
    setTotalRuns,
  };
};


