import { useState, useEffect } from 'react';

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
  tabName: string;
  axisXData?: string;
  axisYData?: string;
  axisZData?: string; // For 3D graphs
  showTitle: boolean;
  canvasMode?: 'light' | 'dark';

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
  graphWidthInch: number;
  graphHeightInch: number;
  exportFormat: string;

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


  // Tick Marks - Major
  majorTickLength: number; // inches
  majorTickThickness: number; // inches
  majorTickColor: string;
  majorTickTransparency: number; // 0-100%
  majorTickDirection: 'none' | 'inward' | 'outward' | 'both';
  majorTickInterval: 'automatic' | 'manual' | 'column';
  majorTickManualInterval?: number;

  // Tick Marks - Minor
  minorTickLength: number; // inches
  minorTickThickness: number; // inches
  minorTickColor: string;
  minorTickTransparency: number; // 0-100%
  minorTickDirection: 'none' | 'inward' | 'outward' | 'both';
  minorTickInterval: number; // 2-20 per major tick interval

  // Break Range Properties
  showBreak: boolean;
  omitRangeStart?: number;
  omitRangeEnd?: number;
  breakPosition: number; // 0-99.9%
  gapWidth: number; // inches
  postBreakInterval?: number;

  // Break Properties
  breakSymbol: 'plain' | 'diagonal' | 'perpendicular' | 's-curve';
  breakLength: number; // inches
  breakThickness: number; // inches
  breakColor: string;
  breakTransparency: number; // 0-100%
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
    errorBarColor?: string;
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
  mesh3d?: {
    opacity: number;
    surfaceType: 'surface' | 'wireframe' | 'mesh';
    colorScale: string;
    showContours: boolean;
    contourOpacity: number;
    lighting: boolean;
    smoothShading: boolean;
    showGrid: boolean;
    gridOpacity: number;
  };
  area?: {
    lineWidth: number;
    fillOpacity: number;
    showPoints: boolean;
    pointSize: number;
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
  const [showRunHistory, setShowRunHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showGraphProperties, setShowGraphProperties] = useState(false);
  const [totalRuns, setTotalRuns] = useState(0);
  const [canvasMode, setCanvasMode] = useState<'light' | 'dark'>('light');

  // Graph properties state
  const [graphProperties, setGraphProperties] = useState<GraphProperties>({
    global: {
      backgroundColor: '', // Was #ffffff - changed to empty to allow theme fallback
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
      tabName: 'Graph Tab',
      axisXData: 'X axis',
      axisYData: 'Y axis',
      axisZData: 'Z axis', // For 3D graphs
      showTitle: true,
      canvasMode: 'light',
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
      graphWidthInch: 8,
      graphHeightInch: 6,
      exportFormat: 'PNG',

      // Grid Settings defaults
      gridPlane: 'xy2d',
      gridXMajor: true,
      gridYMajor: true,
      gridXMinor: false,
      gridYMinor: false,
      gridLineStyle: 'solid',
      gridThicknessInch: 0.01,
      gridColor: '', // Was #e5e5e5 - changed to empty to allow theme fallback
      gridGapColor: '#ffffff',
      gridTransparencyPct: 0,
      gridLayering: 'plotFront',

      // Axis Lines defaults
      yAxisSide: 'left',
      axisLineColor: '', // Was #444444 - changed to empty to allow theme fallback
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

      // Tick Marks defaults - Major
      majorTickLength: 0.1, // inches
      majorTickThickness: 0.01, // inches
      majorTickColor: '', // Was #444444 - changed to empty to allow theme fallback
      majorTickTransparency: 0, // 0%
      majorTickDirection: 'outward',
      majorTickInterval: 'automatic',
      majorTickManualInterval: 1,

      // Tick Marks defaults - Minor
      minorTickLength: 0.05, // inches
      minorTickThickness: 0.005, // inches
      minorTickColor: '', // Was #888888 - changed to empty to allow theme fallback
      minorTickTransparency: 0, // 0%
      minorTickDirection: 'outward',
      minorTickInterval: 5, // 5 per major tick interval

      // Break Range defaults
      showBreak: false,
      omitRangeStart: undefined,
      omitRangeEnd: undefined,
      breakPosition: 50, // 50%
      gapWidth: 0.1, // inches
      postBreakInterval: undefined,

      // Break Properties defaults
      breakSymbol: 'diagonal',
      breakLength: 0.15, // inches
      breakThickness: 0.01, // inches
      breakColor: '#000000',
      breakTransparency: 0, // 0%
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
        errorBarCapSize: 10,  // Increased from 3 to 10 for better visibility
        showErrorBars: true,
        errorBarColor: '#1f77b4',
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
      mesh3d: {
        opacity: 1.0,
        surfaceType: 'mesh',
        colorScale: 'viridis',
        showContours: true,
        contourOpacity: 0.6,
        lighting: true,
        smoothShading: true,
        showGrid: true,
        gridOpacity: 0.5,
      },
      area: {
        lineWidth: 2,
        fillOpacity: 0.4,
        showPoints: false,
        pointSize: 6,
      },
      contour: undefined,
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

  const toggleCanvasMode = () => {
    setCanvasMode(prev => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      return newMode;
    });
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
    if (!subType) {
      return null;
    }

    const subTypeLower = subType.toLowerCase();

    // Check for 3D mesh first - it's completely different from 2D plots
    if (subTypeLower.includes('3d mesh') || subTypeLower === '3d mesh plot') {
      return null; // 3D mesh has no plot-specific properties in the 2D property system
    }

    // Priority order: regression first, then others
    if (subTypeLower.includes('regression') || subTypeLower.includes('fit')) {
      return 'regression';
    }
    if (subTypeLower.includes('error') || subTypeLower.includes('bar')) {
      return 'errorBar';
    }
    if (subTypeLower.includes('point')) {
      return 'pointPlot';
    }
    if (subTypeLower.includes('dot')) {
      return 'dotPlot';
    }
    if (subTypeLower.includes('scatter') || subTypeLower.includes('xy') || subTypeLower.includes('area')) {
      return 'scatter';
    }

    // Default to scatter for most plot types
    return 'scatter';
  };

  // Get detected plot features from subType
  const getDetectedPlotFeatures = (subType?: string): {
    hasDotPlot: boolean;
    hasArea: boolean;
    is3DMesh: boolean;
    isContour: boolean;
  } => {
    if (!subType) {
      return { hasScatter: false, hasRegression: false, hasErrorBars: false, hasPointPlot: false, hasDotPlot: false, hasArea: false, is3DMesh: false, isContour: false };
    }

    const subTypeLower = subType.toLowerCase();

    // Check for Contour Plot specifically
    // Note: 'contour' usually implies 2D contour in Plotly, but might be grouped with 3D in some contexts
    const isContour = subTypeLower.includes('contour') || subTypeLower.includes('filled contour');

    // Check for any 3D graph types (mesh, surface, scatter3d, bar3d, line3d, contour3d, volume, etc.)
    // EXCLUDE generic 'contour' if it's handled as a specific 2D contour type, UNLESS it's explicitly 'contour3d'
    const is3DMesh = (subTypeLower.includes('3d') ||
      subTypeLower.includes('mesh') ||
      subTypeLower.includes('surface') ||
      subTypeLower.includes('scatter3d') ||
      subTypeLower.includes('volume') ||
      subTypeLower.includes('contour3d')) && !isContour; // Prioritize isContour for "Contour Plot"

    // If it's a 3D graph, don't show any 2D plot features
    if (is3DMesh) {
      return {
        hasScatter: false,
        hasRegression: false,
        hasErrorBars: false,
        hasPointPlot: false,
        hasDotPlot: false,
        hasArea: false,
        is3DMesh: true,
        isContour: false
      };
    }

    // If it's a Contour graph
    if (isContour) {
      return {
        hasScatter: false,
        hasRegression: false,
        hasErrorBars: false,
        hasPointPlot: false,
        hasDotPlot: false,
        hasArea: false,
        is3DMesh: false,
        isContour: true
      };
    }

    return {
      hasScatter: subTypeLower.includes('scatter') || subTypeLower.includes('xy'),
      hasRegression: subTypeLower.includes('regression') || subTypeLower.includes('fit'),
      hasErrorBars: subTypeLower.includes('error') || subTypeLower.includes('bar'),
      hasPointPlot: subTypeLower.includes('point'),
      hasDotPlot: subTypeLower.includes('dot'),
      hasArea: subTypeLower.includes('area'),
      is3DMesh: false,
      isContour: false
    };
  };

  return {
    fontBold,
    fontItalic,
    fontSize,
    fontColor,
    showRunHistory,
    showHistory,
    showGraphProperties,
    totalRuns,
    canvasMode,
    graphProperties,
    setFontBold,
    setFontItalic,
    setFontSize,
    setFontColor,
    toggleShowHistory,
    toggleGraphProperties,
    toggleCanvasMode,
    updateGraphProperty,
    updatePlotSpecificProperty,
    updateLegendTextEntry,
    updateLegendSeriesColor,
    getCurrentPlotType,
    getDetectedPlotFeatures,
    setTotalRuns,
  };
};


