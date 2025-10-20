/**
 * 3D Mesh trace generation utilities
 */

import { TraceConfig } from '../common/types';
import { akimaInterpolation, rawDataInterpolation } from './meshInterpolation';

/**
 * Get properly formatted colorscale for Plotly
 */
const getPlotlyColorScale = (colorScaleName: string): any => {
  // Plotly colorscale definitions - comprehensive support for all UI color scales
  const colorscaleDefinitions: { [key: string]: any } = {
    // Original scientific scales
    'jet': [
      [0, 'rgb(0,0,131)'], [0.125, 'rgb(0,60,170)'], [0.25, 'rgb(5,255,255)'],
      [0.375, 'rgb(255,255,0)'], [0.5, 'rgb(255,0,0)'], [0.625, 'rgb(200,0,0)'],
      [0.75, 'rgb(180,0,0)'], [0.875, 'rgb(160,0,0)'], [1, 'rgb(139,0,0)']
    ],
    'viridis': [
      [0, 'rgb(68,1,84)'], [0.111, 'rgb(72,40,120)'], [0.222, 'rgb(62,74,137)'],
      [0.333, 'rgb(49,104,142)'], [0.444, 'rgb(38,130,142)'], [0.556, 'rgb(31,158,137)'],
      [0.667, 'rgb(53,183,121)'], [0.778, 'rgb(109,205,89)'], [0.889, 'rgb(180,222,44)'],
      [1, 'rgb(253,231,37)']
    ],
    'plasma': [
      [0, 'rgb(13,8,135)'], [0.111, 'rgb(75,3,161)'], [0.222, 'rgb(125,3,168)'],
      [0.333, 'rgb(168,34,150)'], [0.444, 'rgb(203,70,121)'], [0.556, 'rgb(225,97,97)'],
      [0.667, 'rgb(243,131,77)'], [0.778, 'rgb(252,164,69)'], [0.889, 'rgb(254,202,99)'],
      [1, 'rgb(240,249,33)']
    ],
    'inferno': [
      [0, 'rgb(0,0,4)'], [0.111, 'rgb(31,12,72)'], [0.222, 'rgb(85,15,109)'],
      [0.333, 'rgb(136,34,106)'], [0.444, 'rgb(186,54,85)'], [0.556, 'rgb(227,89,51)'],
      [0.667, 'rgb(249,140,10)'], [0.778, 'rgb(254,201,41)'], [0.889, 'rgb(254,255,65)'],
      [1, 'rgb(255,255,255)']
    ],
    'magma': [
      [0, 'rgb(0,0,4)'], [0.111, 'rgb(28,16,68)'], [0.222, 'rgb(79,18,123)'],
      [0.333, 'rgb(129,37,129)'], [0.444, 'rgb(181,54,122)'], [0.556, 'rgb(229,80,100)'],
      [0.667, 'rgb(251,135,97)'], [0.778, 'rgb(254,194,135)'], [0.889, 'rgb(255,253,164)'],
      [1, 'rgb(252,255,164)']
    ],
    'cividis': [
      [0, 'rgb(0,32,76)'], [0.111, 'rgb(0,42,102)'], [0.222, 'rgb(0,52,110)'],
      [0.333, 'rgb(39,63,108)'], [0.444, 'rgb(72,73,103)'], [0.556, 'rgb(99,86,99)'],
      [0.667, 'rgb(125,96,95)'], [0.778, 'rgb(151,108,95)'], [0.889, 'rgb(177,119,96)'],
      [1, 'rgb(255,233,69)']
    ],
    'turbo': [
      [0, 'rgb(35,23,27)'], [0.111, 'rgb(25,29,81)'], [0.222, 'rgb(25,105,156)'],
      [0.333, 'rgb(34,161,152)'], [0.444, 'rgb(124,180,87)'], [0.556, 'rgb(202,214,19)'],
      [0.667, 'rgb(255,232,69)'], [0.778, 'rgb(255,163,67)'], [0.889, 'rgb(230,97,1)'],
      [1, 'rgb(230,97,1)']
    ],
    'hot': [
      [0, 'rgb(0,0,0)'], [0.167, 'rgb(128,0,0)'], [0.333, 'rgb(255,0,0)'],
      [0.5, 'rgb(255,128,0)'], [0.667, 'rgb(255,255,0)'], [0.833, 'rgb(255,255,128)'],
      [1, 'rgb(255,255,255)']
    ],
    'cool': [
      [0, 'rgb(0,255,255)'], [0.167, 'rgb(0,191,255)'], [0.333, 'rgb(0,128,255)'],
      [0.5, 'rgb(0,64,255)'], [0.667, 'rgb(0,0,255)'], [0.833, 'rgb(64,0,255)'],
      [1, 'rgb(128,0,255)']
    ],
    'rainbow': [
      [0, 'rgb(255,0,0)'], [0.091, 'rgb(255,128,0)'], [0.182, 'rgb(255,255,0)'],
      [0.273, 'rgb(128,255,0)'], [0.364, 'rgb(0,255,0)'], [0.455, 'rgb(0,255,128)'],
      [0.545, 'rgb(0,255,255)'], [0.636, 'rgb(0,128,255)'], [0.727, 'rgb(0,0,255)'],
      [0.818, 'rgb(128,0,255)'], [1, 'rgb(255,0,255)']
    ],
    
    // Scientific sequential scales
    'blues': [
      [0, 'rgb(247,251,255)'], [0.125, 'rgb(222,235,247)'], [0.25, 'rgb(198,219,239)'],
      [0.375, 'rgb(158,202,225)'], [0.5, 'rgb(107,174,214)'], [0.625, 'rgb(66,146,198)'],
      [0.75, 'rgb(33,113,181)'], [0.875, 'rgb(8,81,156)'], [1, 'rgb(8,48,107)']
    ],
    'greens': [
      [0, 'rgb(247,252,245)'], [0.125, 'rgb(229,245,224)'], [0.25, 'rgb(199,233,192)'],
      [0.375, 'rgb(161,217,155)'], [0.5, 'rgb(116,196,118)'], [0.625, 'rgb(65,171,93)'],
      [0.75, 'rgb(35,139,69)'], [0.875, 'rgb(0,109,44)'], [1, 'rgb(0,68,27)']
    ],
    'reds': [
      [0, 'rgb(255,245,240)'], [0.125, 'rgb(254,224,210)'], [0.25, 'rgb(252,187,161)'],
      [0.375, 'rgb(252,146,114)'], [0.5, 'rgb(251,106,74)'], [0.625, 'rgb(239,59,44)'],
      [0.75, 'rgb(203,24,29)'], [0.875, 'rgb(165,15,21)'], [1, 'rgb(103,0,13)']
    ],
    'oranges': [
      [0, 'rgb(255,247,236)'], [0.125, 'rgb(254,230,206)'], [0.25, 'rgb(253,208,162)'],
      [0.375, 'rgb(253,174,107)'], [0.5, 'rgb(253,141,60)'], [0.625, 'rgb(241,105,19)'],
      [0.75, 'rgb(217,72,1)'], [0.875, 'rgb(166,54,3)'], [1, 'rgb(127,39,4)']
    ],
    'purples': [
      [0, 'rgb(252,251,253)'], [0.125, 'rgb(239,237,245)'], [0.25, 'rgb(218,218,235)'],
      [0.375, 'rgb(188,189,220)'], [0.5, 'rgb(158,154,200)'], [0.625, 'rgb(128,125,186)'],
      [0.75, 'rgb(106,81,163)'], [0.875, 'rgb(84,39,143)'], [1, 'rgb(63,0,125)']
    ],
    'greys': [
      [0, 'rgb(255,255,255)'], [0.167, 'rgb(240,240,240)'], [0.333, 'rgb(204,204,204)'],
      [0.5, 'rgb(150,150,150)'], [0.667, 'rgb(99,99,99)'], [0.833, 'rgb(37,37,37)'],
      [1, 'rgb(0,0,0)']
    ],
    
    // Diverging scales
    'rdbu': [
      [0, 'rgb(5,10,172)'], [0.125, 'rgb(106,137,247)'], [0.25, 'rgb(190,190,190)'],
      [0.375, 'rgb(220,220,220)'], [0.5, 'rgb(255,255,255)'], [0.625, 'rgb(255,255,255)'],
      [0.75, 'rgb(255,255,255)'], [0.875, 'rgb(250,95,60)'], [1, 'rgb(103,0,31)']
    ],
    'rdylbu': [
      [0, 'rgb(165,0,38)'], [0.1, 'rgb(215,48,39)'], [0.2, 'rgb(244,109,67)'],
      [0.3, 'rgb(253,174,97)'], [0.4, 'rgb(254,224,144)'], [0.5, 'rgb(255,255,191)'],
      [0.6, 'rgb(224,243,248)'], [0.7, 'rgb(171,217,233)'], [0.8, 'rgb(116,173,209)'],
      [0.9, 'rgb(69,117,180)'], [1, 'rgb(49,54,149)']
    ],
    'spectral': [
      [0, 'rgb(158,1,66)'], [0.1, 'rgb(213,62,79)'], [0.2, 'rgb(244,109,67)'],
      [0.3, 'rgb(253,174,97)'], [0.4, 'rgb(254,224,139)'], [0.5, 'rgb(255,255,191)'],
      [0.6, 'rgb(230,245,152)'], [0.7, 'rgb(171,221,164)'], [0.8, 'rgb(102,194,165)'],
      [0.9, 'rgb(50,136,189)'], [1, 'rgb(94,79,162)']
    ],
    'rdylgn': [
      [0, 'rgb(165,0,38)'], [0.1, 'rgb(215,48,39)'], [0.2, 'rgb(244,109,67)'],
      [0.3, 'rgb(253,174,97)'], [0.4, 'rgb(254,224,144)'], [0.5, 'rgb(255,255,191)'],
      [0.6, 'rgb(217,240,163)'], [0.7, 'rgb(173,221,142)'], [0.8, 'rgb(120,198,121)'],
      [0.9, 'rgb(49,163,84)'], [1, 'rgb(0,104,55)']
    ],
    
    // Professional scales
    'piyg': [
      [0, 'rgb(142,1,82)'], [0.1, 'rgb(197,27,125)'], [0.2, 'rgb(222,119,174)'],
      [0.3, 'rgb(241,182,218)'], [0.4, 'rgb(253,224,239)'], [0.5, 'rgb(247,247,247)'],
      [0.6, 'rgb(230,245,208)'], [0.7, 'rgb(184,225,134)'], [0.8, 'rgb(127,188,65)'],
      [0.9, 'rgb(77,146,33)'], [1, 'rgb(39,100,25)']
    ],
    'prgn': [
      [0, 'rgb(64,0,75)'], [0.1, 'rgb(118,42,131)'], [0.2, 'rgb(153,112,171)'],
      [0.3, 'rgb(194,165,207)'], [0.4, 'rgb(231,212,232)'], [0.5, 'rgb(247,247,247)'],
      [0.6, 'rgb(217,240,211)'], [0.7, 'rgb(166,219,160)'], [0.8, 'rgb(90,174,97)'],
      [0.9, 'rgb(27,120,55)'], [1, 'rgb(0,68,27)']
    ],
    'brbg': [
      [0, 'rgb(84,48,5)'], [0.1, 'rgb(140,81,10)'], [0.2, 'rgb(191,129,45)'],
      [0.3, 'rgb(223,194,125)'], [0.4, 'rgb(246,232,195)'], [0.5, 'rgb(245,245,245)'],
      [0.6, 'rgb(199,234,229)'], [0.7, 'rgb(128,205,193)'], [0.8, 'rgb(53,151,143)'],
      [0.9, 'rgb(1,102,94)'], [1, 'rgb(0,60,48)']
    ],
    
    // Medical/Scientific scales
    'bone': [
      [0, 'rgb(0,0,0)'], [0.111, 'rgb(21,21,30)'], [0.222, 'rgb(42,42,60)'],
      [0.333, 'rgb(64,64,90)'], [0.444, 'rgb(85,85,120)'], [0.556, 'rgb(106,106,150)'],
      [0.667, 'rgb(128,128,180)'], [0.778, 'rgb(149,149,210)'], [0.889, 'rgb(170,170,240)'],
      [1, 'rgb(255,255,255)']
    ],
    'copper': [
      [0, 'rgb(0,0,0)'], [0.111, 'rgb(30,17,0)'], [0.222, 'rgb(60,34,0)'],
      [0.333, 'rgb(90,51,0)'], [0.444, 'rgb(120,68,0)'], [0.556, 'rgb(150,85,0)'],
      [0.667, 'rgb(180,102,0)'], [0.778, 'rgb(210,119,0)'], [0.889, 'rgb(240,136,0)'],
      [1, 'rgb(255,153,0)']
    ],
    'pink': [
      [0, 'rgb(30,0,0)'], [0.111, 'rgb(60,0,0)'], [0.222, 'rgb(90,0,0)'],
      [0.333, 'rgb(120,0,0)'], [0.444, 'rgb(150,0,0)'], [0.556, 'rgb(180,0,0)'],
      [0.667, 'rgb(210,0,0)'], [0.778, 'rgb(240,0,0)'], [0.889, 'rgb(255,0,0)'],
      [1, 'rgb(255,255,255)']
    ],
    
    // Seasonal scales
    'spring': [
      [0, 'rgb(255,0,255)'], [0.2, 'rgb(255,51,204)'], [0.4, 'rgb(255,102,153)'],
      [0.6, 'rgb(255,153,102)'], [0.8, 'rgb(255,204,51)'], [1, 'rgb(255,255,0)']
    ],
    'summer': [
      [0, 'rgb(0,128,102)'], [0.2, 'rgb(0,153,102)'], [0.4, 'rgb(0,178,102)'],
      [0.6, 'rgb(0,203,102)'], [0.8, 'rgb(0,228,102)'], [1, 'rgb(0,255,102)']
    ],
    'autumn': [
      [0, 'rgb(255,0,0)'], [0.25, 'rgb(255,64,0)'], [0.5, 'rgb(255,128,0)'],
      [0.75, 'rgb(255,192,0)'], [1, 'rgb(255,255,0)']
    ],
    'winter': [
      [0, 'rgb(0,0,255)'], [0.25, 'rgb(0,64,255)'], [0.5, 'rgb(0,128,255)'],
      [0.75, 'rgb(0,192,255)'], [1, 'rgb(0,255,255)']
    ],
    
    // Professional data visualization scales
    'tab10': [
      [0, 'rgb(31,119,180)'], [0.1, 'rgb(255,127,14)'], [0.2, 'rgb(44,160,44)'],
      [0.3, 'rgb(214,39,40)'], [0.4, 'rgb(148,103,189)'], [0.5, 'rgb(140,86,75)'],
      [0.6, 'rgb(227,119,194)'], [0.7, 'rgb(127,127,127)'], [0.8, 'rgb(188,189,34)'],
      [0.9, 'rgb(23,190,207)'], [1, 'rgb(23,190,207)']
    ],
    'set1': [
      [0, 'rgb(228,26,28)'], [0.111, 'rgb(55,126,184)'], [0.222, 'rgb(77,175,74)'],
      [0.333, 'rgb(152,78,163)'], [0.444, 'rgb(255,127,0)'], [0.556, 'rgb(255,255,51)'],
      [0.667, 'rgb(166,86,40)'], [0.778, 'rgb(247,129,191)'], [0.889, 'rgb(153,153,153)'],
      [1, 'rgb(153,153,153)']
    ],
    'set2': [
      [0, 'rgb(102,194,165)'], [0.125, 'rgb(252,141,98)'], [0.25, 'rgb(141,160,203)'],
      [0.375, 'rgb(231,138,195)'], [0.5, 'rgb(166,216,84)'], [0.625, 'rgb(255,217,47)'],
      [0.75, 'rgb(229,196,148)'], [0.875, 'rgb(179,179,179)'], [1, 'rgb(179,179,179)']
    ],
    'set3': [
      [0, 'rgb(141,211,199)'], [0.083, 'rgb(255,255,179)'], [0.167, 'rgb(190,186,218)'],
      [0.25, 'rgb(251,128,114)'], [0.333, 'rgb(128,177,211)'], [0.417, 'rgb(253,180,98)'],
      [0.5, 'rgb(179,222,105)'], [0.583, 'rgb(252,205,229)'], [0.667, 'rgb(217,217,217)'],
      [0.75, 'rgb(188,128,189)'], [0.833, 'rgb(204,235,197)'], [1, 'rgb(255,237,111)']
    ]
  };
  
  // Ensure the colorscale name is valid
  const normalizedName = colorScaleName.toLowerCase();
  const colorscale = colorscaleDefinitions[normalizedName];
  
  console.log(`🎨 Colorscale Formatting:`, {
    originalName: colorScaleName,
    normalizedName,
    hasDefinition: !!colorscale,
    finalScale: colorscale ? 'custom definition' : 'viridis fallback',
    supportedScales: Object.keys(colorscaleDefinitions).length
  });
  
  return colorscale || colorscaleDefinitions['viridis'];
};

/**
 * Check if data is already on a regular grid
 */
const isRegularGrid = (x: number[], y: number[], tolerance: number = 1e-10): boolean => {
  try {
    const xUnique = [...new Set(x)].sort((a, b) => a - b);
    const yUnique = [...new Set(y)].sort((a, b) => a - b);
    
    // Check if we have a rectangular grid
    if (xUnique.length * yUnique.length !== x.length) {
      return false;
    }
    
    // Check if x values are evenly spaced
    if (xUnique.length > 1) {
      const xSpacing = xUnique.slice(1).map((val, i) => val - xUnique[i]);
      const firstSpacing = xSpacing[0];
      if (!xSpacing.every(spacing => Math.abs(spacing - firstSpacing) < tolerance)) {
        return false;
      }
    }
    
    // Check if y values are evenly spaced
    if (yUnique.length > 1) {
      const ySpacing = yUnique.slice(1).map((val, i) => val - yUnique[i]);
      const firstSpacing = ySpacing[0];
      if (!ySpacing.every(spacing => Math.abs(spacing - firstSpacing) < tolerance)) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Create smooth surface interpolation for scattered data
 */
const createSmoothSurface = (
  x: number[], 
  y: number[], 
  z: number[], 
  gridResolution: number = 50,
  interpolationMethod: 'linear' | 'cubic' | 'nearest' = 'cubic'
): { xGrid: number[][], yGrid: number[][], zGrid: number[][] } => {
  
  console.log(`🔄 Creating smooth surface with ${interpolationMethod} interpolation`);
  
  // Remove NaN values
  const validIndices = x.map((_, i) => 
    !isNaN(x[i]) && !isNaN(y[i]) && !isNaN(z[i])
  );
  
  const xClean = x.filter((_, i) => validIndices[i]);
  const yClean = y.filter((_, i) => validIndices[i]);
  const zClean = z.filter((_, i) => validIndices[i]);
  
  if (xClean.length === 0) {
    throw new Error('No valid data points after removing NaN values');
  }
  
  // Create regular grid
  const xMin = Math.min(...xClean);
  const xMax = Math.max(...xClean);
  const yMin = Math.min(...yClean);
  const yMax = Math.max(...yClean);
  
  // Add small buffer to avoid edge issues
  const xBuffer = (xMax - xMin) * 0.01;
  const yBuffer = (yMax - yMin) * 0.01;
  
  const xi = Array.from({ length: gridResolution }, (_, i) => 
    xMin - xBuffer + (xMax + xBuffer - (xMin - xBuffer)) * i / (gridResolution - 1)
  );
  const yi = Array.from({ length: gridResolution }, (_, i) => 
    yMin - yBuffer + (yMax + yBuffer - (yMin - yBuffer)) * i / (gridResolution - 1)
  );
  
  // Create meshgrid
  const xGrid: number[][] = [];
  const yGrid: number[][] = [];
  const zGrid: number[][] = [];
  
  for (let i = 0; i < gridResolution; i++) {
    xGrid[i] = [];
    yGrid[i] = [];
    zGrid[i] = [];
    
    for (let j = 0; j < gridResolution; j++) {
      xGrid[i][j] = xi[j];
      yGrid[i][j] = yi[i];
      
      // Use existing interpolation function
      zGrid[i][j] = akimaInterpolation({
        xv: xClean,
        yv: yClean,
        zv: zClean,
        targetX: xi[j],
        targetY: yi[i]
      });
    }
  }
  
  console.log(`✅ Smooth surface created: ${gridResolution}x${gridResolution} grid`);
  return { xGrid, yGrid, zGrid };
};

/**
 * Create 3D mesh plot trace
 */
export const create3DMeshTrace = (config: TraceConfig): any => {
  const { xv, yv, zv, label, color, graphConfig, rows } = config;
  
  console.log(`🚀 MESH TRACE CREATION STARTED - ${new Date().toISOString()}`);
  console.log(`🔥 FORCE REFRESH TEST - ${Math.random()}`);
  
  console.log(`🌐 Creating 3D Mesh Trace: ${label}`, {
    dataFormat: graphConfig?.dataFormat,
    xLength: xv.length,
    yLength: yv.length,
    zLength: zv?.length || 0,
    hasZData: !!graphConfig?.variables?.z,
    hasRows: !!rows,
    sampleX: xv.slice(0, 3),
    sampleY: yv.slice(0, 3),
    sampleZ: zv?.slice(0, 3) || [],
    meshConfig: graphConfig?.meshConfig,
    colorScale: graphConfig?.meshConfig?.colorScale,
    meshConfigKeys: graphConfig?.meshConfig ? Object.keys(graphConfig.meshConfig) : 'undefined',
    meshConfigValues: graphConfig?.meshConfig,
    // Debug: Check if meshConfig properties are at root level
    rootLevelProperties: {
      surfaceType: graphConfig?.surfaceType,
      colorScale: graphConfig?.colorScale,
      opacity: graphConfig?.opacity,
      showContours: graphConfig?.showContours,
      contourOpacity: graphConfig?.contourOpacity,
      lighting: graphConfig?.lighting,
      smoothShading: graphConfig?.smoothShading,
      showGrid: graphConfig?.showGrid,
      gridOpacity: graphConfig?.gridOpacity
    },
    // Debug: Show the full graphConfig structure
    fullGraphConfig: graphConfig,
    graphConfigKeys: graphConfig ? Object.keys(graphConfig) : 'undefined'
  });
  
  // Check if we have valid data
  if (!xv || xv.length === 0 || !yv || yv.length === 0) {
    console.warn(`❌ Invalid 3D mesh data: xv=${xv?.length || 0}, yv=${yv?.length || 0}`);
    return createFallbackScatter(xv || [], yv || [], label, color);
  }
  
  const dataFormat = graphConfig?.dataFormat;
  // Extract mesh configuration from both nested meshConfig and root level properties
  // Prioritize meshConfig properties over root level properties
  const meshConfig = {
    // Start with root level properties as base
    surfaceType: graphConfig?.surfaceType,
    colorScale: graphConfig?.colorScale,
    opacity: graphConfig?.opacity,
    showContours: graphConfig?.showContours,
    contourOpacity: graphConfig?.contourOpacity,
    lighting: graphConfig?.lighting,
    smoothShading: graphConfig?.smoothShading,
    showGrid: graphConfig?.showGrid,
    gridOpacity: graphConfig?.gridOpacity,
    showSurface: graphConfig?.showSurface,
    interpolation: graphConfig?.interpolation,
    // Override with nested meshConfig properties if they exist (higher priority)
    ...(graphConfig?.meshConfig || {}),
    // Final override with root level properties if they exist (highest priority)
    ...(graphConfig?.surfaceType !== undefined && { surfaceType: graphConfig.surfaceType }),
    ...(graphConfig?.colorScale !== undefined && { colorScale: graphConfig.colorScale }),
    ...(graphConfig?.opacity !== undefined && { opacity: graphConfig.opacity }),
    ...(graphConfig?.showContours !== undefined && { showContours: graphConfig.showContours }),
    ...(graphConfig?.contourOpacity !== undefined && { contourOpacity: graphConfig.contourOpacity }),
    ...(graphConfig?.lighting !== undefined && { lighting: graphConfig.lighting }),
    ...(graphConfig?.smoothShading !== undefined && { smoothShading: graphConfig.smoothShading }),
    ...(graphConfig?.showGrid !== undefined && { showGrid: graphConfig.showGrid }),
    ...(graphConfig?.gridOpacity !== undefined && { gridOpacity: graphConfig.gridOpacity }),
    ...(graphConfig?.showSurface !== undefined && { showSurface: graphConfig.showSurface }),
    ...(graphConfig?.interpolation !== undefined && { interpolation: graphConfig.interpolation })
  };
  const selectedColorScale = meshConfig.colorScale || 'viridis';
  
  console.log(`🎨 Color Scale Debug:`, {
    meshConfigColorScale: meshConfig.colorScale,
    selectedColorScale,
    meshConfigKeys: Object.keys(meshConfig),
    fullMeshConfig: meshConfig,
    originalColorScale: meshConfig.colorScale,
    colorScaleType: typeof meshConfig.colorScale,
    colorScaleLength: meshConfig.colorScale?.length,
    // Debug the extraction process
    rootLevelColorScale: graphConfig?.colorScale,
    nestedColorScale: graphConfig?.meshConfig?.colorScale,
    hasRootLevel: graphConfig?.colorScale !== undefined,
    hasNestedLevel: graphConfig?.meshConfig?.colorScale !== undefined,
    finalExtractedColorScale: meshConfig.colorScale
  });
  
  // Validate color scale name - comprehensive list of all supported scales
  const validColorScales = [
    // Original scientific scales
    'viridis', 'plasma', 'inferno', 'magma', 'cividis', 'turbo', 'jet',
    'hot', 'cool', 'rainbow',
    
    // Scientific sequential scales
    'blues', 'greens', 'reds', 'oranges', 'purples', 'greys',
    
    // Diverging scales
    'rdbu', 'rdylbu', 'spectral', 'rdylgn',
    
    // Professional scales
    'piyg', 'prgn', 'brbg',
    
    // Medical/Scientific scales
    'bone', 'copper', 'pink',
    
    // Seasonal scales
    'spring', 'summer', 'autumn', 'winter',
    
    // Professional data visualization scales
    'tab10', 'set1', 'set2', 'set3'
  ];
  
  const isValidColorScale = validColorScales.includes(selectedColorScale.toLowerCase());
  const finalColorScale = isValidColorScale ? selectedColorScale : 'viridis';
  
  // Use the validated colorscale
  const validatedColorScale = finalColorScale;
  
  console.log(`🎨 Color Scale Validation:`, {
    selectedColorScale,
    isValidColorScale,
    finalColorScale,
    willUseFallback: !isValidColorScale
  });
  
  console.log(`🎨 3D Mesh Configuration Applied:`, {
    meshConfig,
    surfaceType: meshConfig.surfaceType || 'surface',
    colorScale: selectedColorScale,
    interpolation: meshConfig.interpolation,
    opacity: meshConfig.opacity || 0.8,
    showContours: meshConfig.showContours !== false,
    showSurface: meshConfig.showSurface !== false,
    lighting: meshConfig.lighting !== false,
    contourOpacity: meshConfig.contourOpacity || 0.5,
    smoothShading: meshConfig.smoothShading !== false,
    showGrid: meshConfig.showGrid !== false,
    gridOpacity: meshConfig.gridOpacity || 0.3,
    fullGraphConfig: graphConfig,
    meshConfigKeys: Object.keys(meshConfig),
    meshConfigValues: meshConfig,
    // CRITICAL DEBUG: Show what properties will be applied to the trace
    willApplyProperties: {
      surfaceType: meshConfig.surfaceType,
      colorScale: selectedColorScale,
      opacity: meshConfig.opacity,
      showContours: meshConfig.showContours,
      contourOpacity: meshConfig.contourOpacity,
      lighting: meshConfig.lighting,
      smoothShading: meshConfig.smoothShading,
      showGrid: meshConfig.showGrid,
      gridOpacity: meshConfig.gridOpacity,
      showSurface: meshConfig.showSurface,
      interpolation: meshConfig.interpolation
    },
    // Debug: Show final values that will be used
    finalValues: {
      surfaceType: meshConfig.surfaceType,
      colorScale: selectedColorScale,
      opacity: meshConfig.opacity,
      showContours: meshConfig.showContours,
      contourOpacity: meshConfig.contourOpacity,
      lighting: meshConfig.lighting,
      smoothShading: meshConfig.smoothShading,
      showGrid: meshConfig.showGrid,
      gridOpacity: meshConfig.gridOpacity,
      showSurface: meshConfig.showSurface,
      interpolation: meshConfig.interpolation
    },
    // Debug: Show what was extracted from root level
    extractedFromRoot: {
      surfaceType: graphConfig?.surfaceType,
      colorScale: graphConfig?.colorScale,
      opacity: graphConfig?.opacity,
      showContours: graphConfig?.showContours,
      contourOpacity: graphConfig?.contourOpacity,
      lighting: graphConfig?.lighting,
      smoothShading: graphConfig?.smoothShading,
      showGrid: graphConfig?.showGrid,
      gridOpacity: graphConfig?.gridOpacity,
      showSurface: graphConfig?.showSurface,
      interpolation: graphConfig?.interpolation
    }
  });
  
  console.log(`🔍 Processing 3D Mesh with format: ${dataFormat}`, {
    hasZv: !!zv && zv.length > 0,
    zvLength: zv?.length || 0,
    xvLength: xv.length,
    yvLength: yv.length,
    graphType: graphConfig?.graphType,
    subType: graphConfig?.subType,
    fullGraphConfig: graphConfig
  });
  
  // Check if data needs smooth surface interpolation
  const needsSmoothing = !isRegularGrid(xv, yv);
  console.log(`🎯 Data analysis: ${needsSmoothing ? 'Scattered data - will apply smooth interpolation' : 'Regular grid - using direct plotting'}`);
  
  if (dataFormat === 'XYZ Triplets' || dataFormat === 'xyz-columns') {
    // XY Z triplet: Create natural mesh surface with preserved topology
    return createNaturalXYZMesh(xv, yv, rows, graphConfig, color, label, zv, finalColorScale, meshConfig, needsSmoothing);
  } else if (dataFormat === 'Many Z' || dataFormat === 'z-matrix') {
    // Many Z: Create mesh surface from Z matrix data
    return createZMatrixMesh(xv, yv, rows, graphConfig, color, label, zv, finalColorScale, meshConfig, needsSmoothing);
  } else if (dataFormat === 'XY Many Z' || dataFormat === 'xy-z-columns') {
    // XY Many Z: Create mesh surface from XY + multiple Z columns
    return createXYManyZMesh(xv, yv, rows, graphConfig, color, label, zv, finalColorScale, meshConfig, needsSmoothing);
  } else {
    console.warn(`❌ Unknown 3D mesh data format: ${dataFormat}, using fallback`);
    return createFallbackScatter(xv, yv, label, color);
  }
  
  // This should never be reached, but just in case
  console.warn(`❌ No 3D mesh format matched, using fallback`);
  return createFallbackScatter(xv, yv, label, color);
};

/**
 * Create SigmaPlot-style 3D mesh surface using proper grid-based interpolation
 */
const createNaturalXYZMesh = (xv: number[], yv: number[], rows: any[], graphConfig: any, color: string, label: string, zv?: number[], selectedColorScale: string = 'viridis', meshConfig: any = {}, needsSmoothing: boolean = false) => {
  console.log('🎨 createNaturalXYZMesh - selectedColorScale:', selectedColorScale);
  console.log('🎨 createNaturalXYZMesh - meshConfig:', meshConfig);
  console.log('🎨 createNaturalXYZMesh - graphConfig:', graphConfig);
  
  // Apply showSurface configuration - default to true if not specified
  const shouldShowSurface = meshConfig.showSurface !== false;
  
  console.log(`🔍 Surface Visibility Debug:`, {
    meshConfigShowSurface: meshConfig.showSurface,
    shouldShowSurface,
    meshConfig,
    willShowSurface: shouldShowSurface
  });
  
  try {
  // Use the provided Z values if available, otherwise extract from data
  let zValues: number[] = [];
  
  if (zv && zv.length > 0) {
    zValues = zv;
  } else {
    // Fallback: Get the actual Z values from the data
    const zColumn = graphConfig?.variables?.z?.[0];
    if (!zColumn || !rows) {
      return createFallbackScatter(xv, yv, label, color);
    }
    zValues = rows.map((row: any) => Number(row[zColumn]));
  }
  
  // SigmaPlot approach: Create structured rectangular grid from data bounds
  // For very large datasets, use smart sampling for performance
  let processedXv = xv;
  let processedYv = yv;
  let processedZv = zValues;
  
  if (xv.length > 1000) {
    // Aggressive sampling for faster 3D mesh generation
    const sampleRate = Math.max(0.2, 1000 / xv.length); // Sample 20% or enough to get ~1000 points
    const step = Math.floor(1 / sampleRate);
    
    processedXv = xv.filter((_, i) => i % step === 0);
    processedYv = yv.filter((_, i) => i % step === 0);
    processedZv = zValues.filter((_, i) => i % step === 0);
    
    console.log(`🔧 Fast 3D mesh optimization: sampled ${processedXv.length} points from ${xv.length}`);
  }
  
  const xMin = Math.min(...processedXv);
  const xMax = Math.max(...processedXv);
  const yMin = Math.min(...processedYv);
  const yMax = Math.max(...processedYv);
  
  // Optimized grid sizing for faster 3D mesh generation
  // Reduced resolution for better performance while maintaining quality
  const dataDensity = Math.sqrt(xv.length);
  let gridSize = Math.min(Math.max(Math.floor(dataDensity * 0.8), 15), 30);
  
  // For very large datasets (>1000 points), further optimize for performance
  if (xv.length > 1000) {
    gridSize = Math.min(gridSize, 25); // Much smaller grid to preserve natural variations
  }
  
  // Create uniform rectangular grid (SigmaPlot's approach)
  // Ensure proper ordering: low to high values
  const xGrid = Array.from({ length: gridSize }, (_, i) => 
    xMin + (xMax - xMin) * i / (gridSize - 1)
  );
  const yGrid = Array.from({ length: gridSize }, (_, i) => 
    yMin + (yMax - yMin) * i / (gridSize - 1)
  );
  
  console.log(`🔧 Grid Creation Debug:`, {
    gridSize,
    xMin, xMax, yMin, yMax,
    xGridLength: xGrid.length,
    yGridLength: yGrid.length,
    sampleXGrid: xGrid.slice(0, 3),
    sampleYGrid: yGrid.slice(0, 3)
  });
  
  // Ensure grids are properly sorted (low to high)
  xGrid.sort((a, b) => a - b);
  yGrid.sort((a, b) => a - b);
  
  // Natural surface interpolation that preserves data variations
  let zMatrix: number[][] = [];
  let finalXGrid = xGrid;
  let finalYGrid = yGrid;
  
  if (needsSmoothing) {
    console.log(`🔄 Applying smooth surface interpolation for scattered XYZ data`);
    try {
      const smoothResult = createSmoothSurface(processedXv, processedYv, processedZv, gridSize, 'cubic');
      zMatrix = smoothResult.zGrid;
      finalXGrid = smoothResult.xGrid[0]; // Take first row for X grid
      finalYGrid = smoothResult.yGrid.map(row => row[0]); // Take first column for Y grid
      console.log(`✅ Smooth surface interpolation completed for XYZ data`);
    } catch (error) {
      console.warn(`⚠️ Smooth interpolation failed for XYZ, falling back to regular grid:`, error);
      // Fallback to regular grid
      console.log(`🔧 Starting interpolation for ${gridSize}x${gridSize} grid`);
      for (let i = 0; i < gridSize; i++) {
        zMatrix[i] = [];
        for (let j = 0; j < gridSize; j++) {
          const gridX = xGrid[j];
          const gridY = yGrid[i];
          const interpolatedZ = rawDataInterpolation({ xv: processedXv, yv: processedYv, zv: processedZv, targetX: gridX, targetY: gridY });
          zMatrix[i][j] = interpolatedZ;
        }
      }
    }
  } else {
    console.log(`📊 Using regular grid for gridded XYZ data`);
    console.log(`🔧 Starting interpolation for ${gridSize}x${gridSize} grid`);
    for (let i = 0; i < gridSize; i++) {
      zMatrix[i] = [];
      for (let j = 0; j < gridSize; j++) {
        const gridX = xGrid[j];
        const gridY = yGrid[i];
        
        // Use raw data point interpolation to preserve natural variations
        const interpolatedZ = rawDataInterpolation({ xv: processedXv, yv: processedYv, zv: processedZv, targetX: gridX, targetY: gridY });
        zMatrix[i][j] = interpolatedZ;
        
        // Debug first few interpolations
        if (i < 2 && j < 2) {
          console.log(`🔧 Interpolation [${i},${j}]:`, {
            gridX, gridY, interpolatedZ,
            processedDataLength: processedXv.length
          });
        }
      }
    }
  }
  
  console.log(`🔧 Interpolation completed. Z matrix dimensions: ${zMatrix.length}x${zMatrix[0]?.length || 0}`);
  
  // Skip heavy contrast processing for faster 3D mesh generation
  const enhancedMatrix = zMatrix;
  
  // Use surface type from configuration
  const surfaceType = meshConfig.surfaceType || 'surface';
  // For mesh and surface types, use 'surface' trace type
  // Only use 'scatter3d' for wireframe
  const traceType = surfaceType === 'wireframe' ? 'scatter3d' : 'surface';
  
  // Apply showSurface configuration - if false, don't show the surface
  const shouldShowSurface = meshConfig.showSurface !== false;
  
  console.log(`🎨 Surface Type Logic:`, {
    meshConfigSurfaceType: meshConfig.surfaceType,
    surfaceType,
    traceType,
    isWireframe: surfaceType === 'wireframe',
    isMesh: surfaceType === 'mesh',
    isSurface: surfaceType === 'surface'
  });
  
  console.log(`🎨 Surface Type Configuration:`, {
    surfaceType,
    traceType,
    meshConfigSurfaceType: meshConfig.surfaceType,
    willUseSurface: traceType === 'surface',
    willUseWireframe: traceType === 'scatter3d'
  });
  
  console.log(`🔧 Z Matrix Structure Debug:`, {
    xGridLength: xGrid.length,
    yGridLength: yGrid.length,
    zMatrixLength: enhancedMatrix.length,
    zMatrixFirstRowLength: enhancedMatrix[0]?.length || 0,
    sampleXGrid: xGrid.slice(0, 3),
    sampleYGrid: yGrid.slice(0, 3),
    sampleZMatrix: enhancedMatrix.slice(0, 2).map(row => row.slice(0, 3)),
    isProperMatrix: enhancedMatrix.length === yGrid.length && enhancedMatrix[0]?.length === xGrid.length
  });

  const trace = {
    x: finalXGrid,
    y: finalYGrid,
    z: enhancedMatrix,
    type: traceType,
    name: label,
    colorscale: getPlotlyColorScale(selectedColorScale),
    // Remove intensity - not needed for surface plots and causes white rendering
    // Apply interpolation from database configuration
    smoothing: meshConfig.interpolation === 'linear' ? true : false,
    // Apply showSurface configuration
    visible: shouldShowSurface,
    // Apply smooth shading configuration
    flatshading: meshConfig.smoothShading === false ? true : false, // Use smooth shading unless explicitly disabled
    zmin: Math.min(...enhancedMatrix.flat()),
    zmax: Math.max(...enhancedMatrix.flat()),
    opacity: meshConfig.opacity || 0.8,
    showlegend: true,
    // Apply lighting configuration properly
    ...(meshConfig.lighting !== false ? {
      lighting: {
        ambient: 0.3,
        diffuse: 0.8,
        specular: 0.15,
        roughness: 0.1,
        fresnel: 0.1
      }
    } : {
      lighting: {
        ambient: 1.0,
        diffuse: 0.0,
        specular: 0.0,
        roughness: 0.0,
        fresnel: 0.0
      }
    }),
    lightposition: {
      x: 100,
      y: 200,
      z: 0
    },
    // Apply contour configuration for 3D surface plots
    ...(meshConfig.showContours && {
      contours: {
        x: { show: true, opacity: meshConfig.contourOpacity || 0.5 },
        y: { show: true, opacity: meshConfig.contourOpacity || 0.5 },
        z: { show: true, opacity: meshConfig.contourOpacity || 0.5 }
      }
    }),
    // Apply grid configuration
    ...(meshConfig.showGrid && {
      wireframe: {
        show: true,
        opacity: meshConfig.gridOpacity || 0.3
      }
    }),
    // Position colorbar on the left side
    colorbar: {
      x: -0.1,  // Position on the left side
      y: 0.5,   // Center vertically
      len: 0.8, // Length of colorbar
      thickness: 20, // Width of colorbar
      title: {
        text: 'Z',
        side: 'right'
      }
    }
  };
  
  console.log(`🎨 Final trace configuration:`, {
    surfaceType: surfaceType,
    traceType: traceType,
    colorscale: getPlotlyColorScale(selectedColorScale),
    traceColorscale: trace.colorscale,
    selectedColorScale,
    smoothing: trace.smoothing,
    flatshading: trace.flatshading,
    smoothShading: graphConfig?.meshConfig?.smoothShading,
    meshConfig: graphConfig?.meshConfig,
    opacity: trace.opacity,
    lighting: trace.lighting,
    contours: trace.contours,
    colorbar: trace.colorbar,
    // CRITICAL DEBUG: Show the actual trace properties being returned
    actualTraceProperties: {
      type: trace.type,
      colorscale: trace.colorscale,
      opacity: trace.opacity,
      smoothing: trace.smoothing,
      visible: trace.visible,
      flatshading: trace.flatshading,
      lighting: trace.lighting,
      contours: trace.contours,
      wireframe: trace.wireframe
    },
    // CONTOUR AND GRID DEBUG: Show what's being applied
    contourGridDebug: {
      showContours: meshConfig.showContours,
      contourOpacity: meshConfig.contourOpacity,
      showGrid: meshConfig.showGrid,
      gridOpacity: meshConfig.gridOpacity,
      hasContours: !!trace.contours,
      hasWireframe: !!trace.wireframe,
      contoursValue: trace.contours,
      wireframeValue: trace.wireframe
    },
    actualTraceType: trace.type,
    hasZMatrix: Array.isArray(trace.z) && trace.z.length > 0,
    zMatrixDimensions: Array.isArray(trace.z) ? `${trace.z.length}x${trace.z[0]?.length || 0}` : 'not array',
    // Debug: Show the actual trace properties being applied
    traceProperties: {
      type: trace.type,
      colorscale: trace.colorscale,
      opacity: trace.opacity,
      flatshading: trace.flatshading,
      lighting: trace.lighting,
      contours: trace.contours,
      wireframe: trace.wireframe
    }
  });
  
  console.log(`🔍 FINAL TRACE DEBUG:`, {
    type: trace.type,
    colorscale: trace.colorscale,
    zMatrixShape: trace.z ? `${trace.z.length}x${trace.z[0]?.length}` : 'undefined',
    zRange: trace.z ? `[${Math.min(...trace.z.flat()).toFixed(2)}, ${Math.max(...trace.z.flat()).toFixed(2)}]` : 'undefined',
    opacity: trace.opacity,
    flatshading: trace.flatshading,
    lighting: trace.lighting,
    contours: trace.contours,
    wireframe: trace.wireframe,
    surfaceType: meshConfig.surfaceType,
    showContours: meshConfig.showContours,
    showGrid: meshConfig.showGrid,
    smoothShading: meshConfig.smoothShading,
    // Color scale debugging
    selectedColorScale,
    meshConfigColorScale: meshConfig.colorScale,
    finalTraceColorScale: trace.colorscale
  });
  
  console.log(`✅ MESH TRACE COMPLETED - ${new Date().toISOString()}`);
  console.log(`🎨 Z MATRIX CHECK:`, {
    hasZMatrix: !!trace.z,
    zMatrixShape: trace.z ? `${trace.z.length}x${trace.z[0]?.length}` : 'undefined',
    colorscale: trace.colorscale
  });
  return trace;
  
  } catch (error) {
    console.error('❌ Error in createNaturalXYZMesh:', error);
    console.warn('🔄 Falling back to scatter plot due to error');
    return createFallbackScatter(xv, yv, label, color);
  }
};

/**
 * Create Z Matrix mesh surface with professional interpolation
 */
const createZMatrixMesh = (xv: number[], yv: number[], rows: any[], graphConfig: any, color: string, label: string, zv?: number[], selectedColorScale: string = 'viridis', meshConfig: any = {}, needsSmoothing: boolean = false) => {
  console.log('🎨 createZMatrixMesh - selectedColorScale:', selectedColorScale);
  console.log('🎨 createZMatrixMesh - meshConfig:', meshConfig);
  console.log('🎨 createZMatrixMesh - graphConfig:', graphConfig);
  
  // Apply showSurface configuration - if false, don't show the surface
  const shouldShowSurface = meshConfig.showSurface !== false;
  
  // For Z matrix format, create a professional grid surface using SigmaPlot approach
  const zColumns = graphConfig?.variables?.z || [];
  
  if (!zColumns.length || !rows) {
    console.warn('No Z columns provided for Z matrix mesh');
    return createFallbackScatter(xv, yv, label, color);
  }
  
  // SigmaPlot approach: Use first and last Z columns to create surface between them
  let zValues: number[] = [];
  
  if (zColumns.length >= 2) {
    // SigmaPlot style: Use first and last Z columns
    const firstZColumn = zColumns[0];
    const lastZColumn = zColumns[zColumns.length - 1];
    
    // Create surface between first and last Z values
    zValues = rows.map((row: any) => {
      const firstZ = Number(row[firstZColumn]);
      const lastZ = Number(row[lastZColumn]);
      return (firstZ + lastZ) / 2; // Average of first and last Z
    });
    
    console.log(`🎯 Z-Matrix SigmaPlot approach: Using ${firstZColumn} and ${lastZColumn}`, {
      firstZColumn,
      lastZColumn,
      zColumns,
      sampleValues: zValues.slice(0, 3)
    });
  } else {
    // Fallback: Use the first Z column for the surface
    const zColumn = zColumns[0];
    zValues = rows.map((row: any) => Number(row[zColumn]));
  }
  
  // Check if we have default scales (10,20,30... for X and 1,2,3... for Y)
  const isDefaultXScale = xv.length > 0 && xv[0] === 10 && xv[1] === 20;
  const isDefaultYScale = yv.length > 0 && yv[0] === 1 && yv[1] === 2;
  
  let xGrid, yGrid;
  
  if (isDefaultXScale && isDefaultYScale) {
    // Use the original default scales directly - don't create new grids
    console.log(`🎯 Using default scales: X=[10,20,30...], Y=[1,2,3...]`);
    xGrid = [...xv];  // Preserve original X scale: 10, 20, 30, ...
    yGrid = [...yv];  // Preserve original Y scale: 1, 2, 3, ...
  } else {
    // Create optimized grid for non-default scales
    const dataDensity = Math.sqrt(xv.length);
    const gridSize = Math.min(Math.max(Math.floor(dataDensity * 1.0), 30), 80);
    
    const xMin = Math.min(...xv);
    const xMax = Math.max(...xv);
    const yMin = Math.min(...yv);
    const yMax = Math.max(...yv);
    
    // Ensure proper ordering: low to high values
    xGrid = Array.from({ length: gridSize }, (_, i) => 
      xMin + (xMax - xMin) * i / (gridSize - 1)
    );
    yGrid = Array.from({ length: gridSize }, (_, i) => 
      yMin + (yMax - yMin) * i / (gridSize - 1)
    );
    
    // Sort grids to ensure low-to-high ordering
    xGrid.sort((a, b) => a - b);
    yGrid.sort((a, b) => a - b);
  }
  
  // Create Z matrix using professional interpolation
  let zMatrix: number[][] = [];
  let finalXGrid = xGrid;
  let finalYGrid = yGrid;
  
  if (needsSmoothing) {
    console.log(`🔄 Applying smooth surface interpolation for scattered data`);
    try {
      const smoothResult = createSmoothSurface(xv, yv, zValues, 50, 'cubic');
      zMatrix = smoothResult.zGrid;
      finalXGrid = smoothResult.xGrid[0]; // Take first row for X grid
      finalYGrid = smoothResult.yGrid.map(row => row[0]); // Take first column for Y grid
      console.log(`✅ Smooth surface interpolation completed`);
    } catch (error) {
      console.warn(`⚠️ Smooth interpolation failed, falling back to regular grid:`, error);
      // Fallback to regular grid
      const actualGridSize = xGrid.length;
      for (let i = 0; i < actualGridSize; i++) {
        zMatrix[i] = [];
        for (let j = 0; j < actualGridSize; j++) {
          const gridX = xGrid[j];
          const gridY = yGrid[i];
          zMatrix[i][j] = akimaInterpolation({ xv, yv, zv: zValues, targetX: gridX, targetY: gridY });
        }
      }
    }
  } else {
    console.log(`📊 Using regular grid for gridded data`);
    const actualGridSize = xGrid.length;
    for (let i = 0; i < actualGridSize; i++) {
      zMatrix[i] = [];
      for (let j = 0; j < actualGridSize; j++) {
        const gridX = xGrid[j];
        const gridY = yGrid[i];
        zMatrix[i][j] = akimaInterpolation({ xv, yv, zv: zValues, targetX: gridX, targetY: gridY });
      }
    }
  }
  
  // Apply light contrast enhancement for faster processing
  const enhancedMatrix = zMatrix;
  
  // Use surface type from configuration
  const surfaceType = meshConfig.surfaceType || 'surface';
  const traceType = surfaceType === 'wireframe' ? 'scatter3d' : 'surface';
  
  // Debug color scale application BEFORE returning
  console.log(`🎨 Z MATRIX - FINAL TRACE DEBUG:`, {
    selectedColorScale,
    traceType,
    meshConfigColorScale: meshConfig.colorScale,
    willApplyColorScale: selectedColorScale
  });
  
  // Test Z values for color scale effectiveness
  const flatMatrix = enhancedMatrix.flat();
  const zMin = Math.min(...flatMatrix);
  const zMax = Math.max(...flatMatrix);
  const zRange = zMax - zMin;
  const zVariation = zRange / zMax;
  
  console.log(`🎨 Z VALUE ANALYSIS:`, {
    zMin: zMin.toFixed(3),
    zMax: zMax.toFixed(3),
    zRange: zRange.toFixed(3),
    zVariation: (zVariation * 100).toFixed(1) + '%',
    sampleValues: flatMatrix.slice(0, 10).map(v => v.toFixed(3)),
    willShowColorVariation: zVariation > 0.1 ? 'YES' : 'NO - TOO SIMILAR'
  });
  
  const finalTrace = {
    x: finalXGrid,
    y: finalYGrid,
    z: enhancedMatrix,
    type: 'surface', // Force surface type for color scale support
    name: label,
    colorscale: getPlotlyColorScale(selectedColorScale), // Use the actual meshConfig colorscale with proper format
    // Remove intensity - not needed for surface plots and causes white rendering
    // Apply interpolation from database configuration
    smoothing: meshConfig.interpolation === 'linear' ? true : false,
    // Apply showSurface configuration
    visible: shouldShowSurface,
    // Apply smooth shading configuration
    flatshading: meshConfig.smoothShading === false ? true : false, // Use smooth shading unless explicitly disabled
    zmin: Math.min(...enhancedMatrix.flat()),
    zmax: Math.max(...enhancedMatrix.flat()),
    opacity: meshConfig.opacity || 0.8,
    showlegend: true,
    // Apply lighting configuration properly
    ...(meshConfig.lighting !== false ? {
      lighting: {
        ambient: 0.3,
        diffuse: 0.8,
        specular: 0.15,
        roughness: 0.1,
        fresnel: 0.1
      }
    } : {
      lighting: {
        ambient: 1.0,
        diffuse: 0.0,
        specular: 0.0,
        roughness: 0.0,
        fresnel: 0.0
      }
    }),
    lightposition: {
      x: 100,
      y: 200,
      z: 0
    },
    // Apply contour configuration for 3D surface plots
    ...(meshConfig.showContours && {
      contours: {
        x: { show: true, opacity: meshConfig.contourOpacity || 0.5 },
        y: { show: true, opacity: meshConfig.contourOpacity || 0.5 },
        z: { show: true, opacity: meshConfig.contourOpacity || 0.5 }
      }
    }),
    // Apply grid configuration
    ...(meshConfig.showGrid && {
      wireframe: {
        show: true,
        opacity: meshConfig.gridOpacity || 0.3
      }
    }),
    // Position colorbar on the left side
    colorbar: {
      x: -0.1,  // Position on the left side
      y: 0.5,   // Center vertically
      len: 0.8, // Length of colorbar
      thickness: 20, // Width of colorbar
      title: {
        text: 'Z',
        side: 'right'
      }
    }
  };
  
  console.log(`🎯 Z MATRIX - RETURNING TRACE:`, {
    type: finalTrace.type,
    colorscale: finalTrace.colorscale,
    hasZMatrix: !!finalTrace.z,
    zMatrixShape: finalTrace.z ? `${finalTrace.z.length}x${finalTrace.z[0]?.length}` : 'undefined',
    opacity: finalTrace.opacity,
    flatshading: finalTrace.flatshading,
    meshConfigColorScale: meshConfig.colorScale,
    selectedColorScale,
    // Debug Z values
    zMin: finalTrace.zmin,
    zMax: finalTrace.zmax,
    zRange: finalTrace.z ? `${Math.min(...finalTrace.z.flat()).toFixed(2)} to ${Math.max(...finalTrace.z.flat()).toFixed(2)}` : 'N/A',
    // Debug colorscale application
    colorscaleType: typeof finalTrace.colorscale,
    colorscaleLength: finalTrace.colorscale?.length,
    fullTraceColorscale: finalTrace.colorscale,
    // Debug Z matrix for colorscale
    zMatrixSample: finalTrace.z ? finalTrace.z.slice(0, 3).map(row => row.slice(0, 3)) : 'N/A',
    // Debug colorscale structure
    colorscaleIsArray: Array.isArray(finalTrace.colorscale),
    colorscaleFirstElement: finalTrace.colorscale?.[0],
    colorscaleLastElement: finalTrace.colorscale?.[finalTrace.colorscale?.length - 1],
    // Debug Z matrix
    zMatrixLength: finalTrace.z?.length,
    zMatrixFirstRowLength: finalTrace.z?.[0]?.length,
    sampleZValues: finalTrace.z?.slice(0, 2).map(row => row.slice(0, 3)),
    // Debug color scale application
    hasColorscale: !!finalTrace.colorscale,
    colorscaleValue: finalTrace.colorscale
  });
  
  return finalTrace;
};

/**
 * Create XY Many Z mesh surface with professional interpolation
 */
const createXYManyZMesh = (xv: number[], yv: number[], rows: any[], graphConfig: any, color: string, label: string, zv?: number[], selectedColorScale: string = 'viridis', meshConfig: any = {}, needsSmoothing: boolean = false) => {
  console.log('🎨 createXYManyZMesh - selectedColorScale:', selectedColorScale);
  console.log('🎨 createXYManyZMesh - meshConfig:', meshConfig);
  console.log('🎨 createXYManyZMesh - graphConfig:', graphConfig);
  
  // Apply showSurface configuration - if false, don't show the surface
  const shouldShowSurface = meshConfig.showSurface !== false;
  
  // For XY Many Z format, create professional surface with multiple Z columns
  const zColumns = graphConfig?.variables?.z || [];
  
  if (!zColumns.length || !rows) {
    return createFallbackScatter(xv, yv, label, color);
  }
  
  // SigmaPlot approach: Use first and last Z columns to create surface between them
  let zValues: number[] = [];
  
  if (zv && zv.length > 0) {
    zValues = zv;
  } else if (zColumns.length >= 2) {
    // SigmaPlot style: Use first and last Z columns
    const firstZColumn = zColumns[0];
    const lastZColumn = zColumns[zColumns.length - 1];
    
    // Create surface between first and last Z values
    zValues = rows.map((row: any) => {
      const firstZ = Number(row[firstZColumn]);
      const lastZ = Number(row[lastZColumn]);
      return (firstZ + lastZ) / 2; // Average of first and last Z
    });
    
    console.log(`🎯 XY-Many-Z SigmaPlot approach: Using ${firstZColumn} and ${lastZColumn}`, {
      firstZColumn,
      lastZColumn,
      zColumns,
      sampleValues: zValues.slice(0, 3)
    });
  } else {
    // Fallback: Use the first Z column for the surface
    const zColumn = zColumns[0];
    zValues = rows.map((row: any) => Number(row[zColumn]));
  }
  
  // SigmaPlot approach for XY Many Z: Use actual X and Y data directly (like Many Z uses default scales)
  // This is the key difference - XY Many Z should use the actual selected X,Y variables as-is
  let xGrid, yGrid;
  
  // For XY Many Z format, use the actual X and Y data directly (SigmaPlot approach)
  // This is equivalent to how Many Z format preserves default scales (10,20,30... and 1,2,3...)
  console.log(`🎯 XY Many Z SigmaPlot approach: Using actual X and Y variables directly`);
  xGrid = [...xv];  // Use actual X data directly
  yGrid = [...yv];  // Use actual Y data directly
  
  // Create professional mesh surface from XYZ data
  const dataPoints = xv.map((x, i) => ({ x, y: yv[i], z: zValues[i] }));
  
  // Create Z matrix using the actual data points (SigmaPlot approach)
  let zMatrix: number[][] = [];
  let finalXGrid = xGrid;
  let finalYGrid = yGrid;
  
  if (needsSmoothing) {
    console.log(`🔄 Applying smooth surface interpolation for XY Many Z data using actual X,Y points`);
    try {
      // Use the actual data length as grid size for better resolution
      const actualGridSize = Math.min(xv.length, 50); // Limit to 50 for performance
      const smoothResult = createSmoothSurface(xv, yv, zValues, actualGridSize, 'cubic');
      zMatrix = smoothResult.zGrid;
      finalXGrid = smoothResult.xGrid[0]; // Take first row for X grid
      finalYGrid = smoothResult.yGrid.map(row => row[0]); // Take first column for Y grid
      console.log(`✅ Smooth surface interpolation completed for XY Many Z data`);
    } catch (error) {
      console.warn(`⚠️ Smooth interpolation failed for XY Many Z, using direct data mapping:`, error);
      // Fallback: Create Z matrix directly from actual data points
      const uniqueX = [...new Set(xv)].sort((a, b) => a - b);
      const uniqueY = [...new Set(yv)].sort((a, b) => a - b);
      
      zMatrix = uniqueY.map(y => 
        uniqueX.map(x => {
          const index = xv.findIndex((val, i) => val === x && yv[i] === y);
          return index >= 0 ? zValues[index] : 0;
        })
      );
      
      finalXGrid = uniqueX;
      finalYGrid = uniqueY;
    }
  } else {
    console.log(`📊 Using direct data mapping for XY Many Z (SigmaPlot approach)`);
    // Create Z matrix directly from actual data points
    const uniqueX = [...new Set(xv)].sort((a, b) => a - b);
    const uniqueY = [...new Set(yv)].sort((a, b) => a - b);
    
    zMatrix = uniqueY.map(y => 
      uniqueX.map(x => {
        const index = xv.findIndex((val, i) => val === x && yv[i] === y);
        return index >= 0 ? zValues[index] : 0;
      })
    );
    
    finalXGrid = uniqueX;
    finalYGrid = uniqueY;
  }
  
  // No smoothing - preserve all sharp features and natural variations
  const smoothedMatrix = zMatrix;
  
  // Use surface type from configuration
  const surfaceType = meshConfig.surfaceType || 'surface';
  const traceType = surfaceType === 'wireframe' ? 'scatter3d' : 'surface';
  
  const finalTrace = {
    x: finalXGrid,
    y: finalYGrid,
    z: smoothedMatrix,
    type: traceType,
    name: label,
    colorscale: getPlotlyColorScale(selectedColorScale),
    // Apply interpolation from database configuration
    smoothing: meshConfig.interpolation === 'linear' ? true : false,
    // Apply showSurface configuration
    visible: shouldShowSurface,
    // Apply smooth shading configuration
    flatshading: meshConfig.smoothShading === false ? true : false, // Use smooth shading unless explicitly disabled
    zmin: Math.min(...smoothedMatrix.flat()),
    zmax: Math.max(...smoothedMatrix.flat()),
    opacity: meshConfig.opacity || 0.8,
    showlegend: true,
    // Apply lighting configuration properly
    ...(meshConfig.lighting !== false ? {
      lighting: {
        ambient: 0.3,
        diffuse: 0.8,
        specular: 0.15,
        roughness: 0.1,
        fresnel: 0.1
      }
    } : {
      lighting: {
        ambient: 1.0,
        diffuse: 0.0,
        specular: 0.0,
        roughness: 0.0,
        fresnel: 0.0
      }
    }),
    lightposition: {
      x: 100,
      y: 200,
      z: 0
    },
    // Apply contour configuration for 3D surface plots
    ...(meshConfig.showContours && {
      contours: {
        x: { show: true, opacity: meshConfig.contourOpacity || 0.5 },
        y: { show: true, opacity: meshConfig.contourOpacity || 0.5 },
        z: { show: true, opacity: meshConfig.contourOpacity || 0.5 }
      }
    }),
    // Apply grid configuration
    ...(meshConfig.showGrid && {
      wireframe: {
        show: true,
        opacity: meshConfig.gridOpacity || 0.3
      }
    }),
    // Position colorbar on the left side
    colorbar: {
      x: -0.1,  // Position on the left side
      y: 0.5,   // Center vertically
      len: 0.8, // Length of colorbar
      thickness: 20, // Width of colorbar
      title: {
        text: 'Z',
        side: 'right'
      }
    }
  };
  
  console.log(`🎯 FINAL 3D MESH TRACE DEBUG:`, {
    traceType: finalTrace.type,
    visible: finalTrace.visible,
    shouldShowSurface,
    xLength: finalTrace.x.length,
    yLength: finalTrace.y.length,
    zMatrixShape: finalTrace.z.length + 'x' + (finalTrace.z[0]?.length || 0),
    colorscale: finalTrace.colorscale,
    opacity: finalTrace.opacity,
    zmin: finalTrace.zmin,
    zmax: finalTrace.zmax,
    sampleX: finalTrace.x.slice(0, 3),
    sampleY: finalTrace.y.slice(0, 3),
    sampleZ: finalTrace.z.slice(0, 2).map(row => row.slice(0, 3)),
    fullTrace: finalTrace
  });
  
  return finalTrace;
};

/**
 * Create fallback 3D scatter plot
 */
const createFallbackScatter = (xv: number[], yv: number[], label: string, color: string) => {
  return {
    x: xv,
    y: yv,
    z: xv.map((x, i) => Math.sin(x * 0.1) * Math.cos(yv[i] * 0.1)),
    type: 'scatter3d',
    mode: 'markers',
    name: label,
    marker: {
      color: color || '#1f77b4',
      size: 4,
      opacity: 0.8
    },
    showlegend: true
  };
};
