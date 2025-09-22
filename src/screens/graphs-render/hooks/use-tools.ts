import { useState } from 'react';

// Global properties that apply to all graphs
export interface GlobalGraphProperties {
  // Appearance
  backgroundColor: string;
  plotColor?: string;
  seriesColor?: string;
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

  // Export
  imageQuality: number;
  imageFormat: string;
  dpi: number;
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
      // Export defaults
      imageQuality: 150,
      imageFormat: 'PNG',
      dpi: 300,
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
    getCurrentPlotType,
    setTotalRuns,
  };
};


