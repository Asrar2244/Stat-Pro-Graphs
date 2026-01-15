/**
 * 3D Mesh properties utilities
 */

import { Mesh3DProperties } from './plotProperties';

/**
 * Available color scales for 3D plots
 */
export const COLOR_SCALE_DEFINITIONS: { [key: string]: any } = {
  // Original scientific scales
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
    [0, 'rgb(0,32,76)'], [0.1, 'rgb(0,42,85)'], [0.2, 'rgb(0,52,94)'],
    [0.3, 'rgb(0,62,103)'], [0.4, 'rgb(0,72,112)'], [0.5, 'rgb(0,82,121)'],
    [0.6, 'rgb(0,92,130)'], [0.7, 'rgb(0,102,139)'], [0.8, 'rgb(0,112,148)'],
    [0.9, 'rgb(0,122,157)'], [1, 'rgb(0,132,166)']
  ],
  'turbo': [
    [0, 'rgb(35,23,27)'], [0.1, 'rgb(60,9,18)'], [0.2, 'rgb(89,1,27)'],
    [0.3, 'rgb(120,1,33)'], [0.4, 'rgb(150,1,38)'], [0.5, 'rgb(180,1,43)'],
    [0.6, 'rgb(210,1,48)'], [0.7, 'rgb(240,1,53)'], [0.8, 'rgb(255,1,58)'],
    [0.9, 'rgb(255,1,63)'], [1, 'rgb(255,1,68)']
  ],
  'jet': [
    [0, 'rgb(0,0,131)'], [0.125, 'rgb(0,60,170)'], [0.25, 'rgb(5,255,255)'],
    [0.375, 'rgb(255,255,0)'], [0.5, 'rgb(255,0,0)'], [0.625, 'rgb(200,0,0)'],
    [0.75, 'rgb(180,0,0)'], [0.875, 'rgb(160,0,0)'], [1, 'rgb(139,0,0)']
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
    [0, 'rgb(49,54,149)'], [0.1, 'rgb(69,117,180)'], [0.2, 'rgb(116,173,209)'],
    [0.3, 'rgb(171,217,233)'], [0.4, 'rgb(224,243,248)'], [0.5, 'rgb(255,255,191)'],
    [0.6, 'rgb(254,224,144)'], [0.7, 'rgb(253,174,97)'], [0.8, 'rgb(244,109,67)'],
    [0.9, 'rgb(215,48,39)'], [1, 'rgb(165,0,38)']
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
    [0.6, 'rgb(217,239,139)'], [0.7, 'rgb(166,217,106)'], [0.8, 'rgb(102,194,165)'],
    [0.9, 'rgb(26,152,80)'], [1, 'rgb(0,104,55)']
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
    [0, 'rgb(0,0,0)'], [0.25, 'rgb(64,64,64)'], [0.5, 'rgb(128,128,128)'],
    [0.75, 'rgb(192,192,192)'], [1, 'rgb(255,255,255)']
  ],
  'copper': [
    [0, 'rgb(0,0,0)'], [0.25, 'rgb(64,32,0)'], [0.5, 'rgb(128,64,0)'],
    [0.75, 'rgb(192,96,0)'], [1, 'rgb(255,128,0)']
  ],
  'pink': [
    [0, 'rgb(30,0,0)'], [0.25, 'rgb(75,0,0)'], [0.5, 'rgb(120,0,0)'],
    [0.75, 'rgb(165,0,0)'], [1, 'rgb(210,0,0)']
  ],

  // Seasonal scales
  'spring': [
    [0, 'rgb(255,0,255)'], [0.25, 'rgb(255,64,191)'], [0.5, 'rgb(255,128,128)'],
    [0.75, 'rgb(255,191,64)'], [1, 'rgb(255,255,0)']
  ],
  'summer': [
    [0, 'rgb(0,128,102)'], [0.25, 'rgb(32,160,102)'], [0.5, 'rgb(64,192,102)'],
    [0.75, 'rgb(128,224,102)'], [1, 'rgb(255,255,102)']
  ],
  'autumn': [
    [0, 'rgb(255,0,0)'], [0.25, 'rgb(255,64,0)'], [0.5, 'rgb(255,128,0)'],
    [0.75, 'rgb(255,191,0)'], [1, 'rgb(255,255,0)']
  ],
  'winter': [
    [0, 'rgb(0,0,255)'], [0.25, 'rgb(0,64,255)'], [0.5, 'rgb(0,128,255)'],
    [0.75, 'rgb(0,191,255)'], [1, 'rgb(0,255,255)']
  ]
};

/**
 * Helper to generate CSS linear gradient from colorscale name
 */
export const getColorScaleCSS = (scaleName: string): string => {
  const normalized = scaleName.toLowerCase();
  const scale = COLOR_SCALE_DEFINITIONS[normalized] || COLOR_SCALE_DEFINITIONS['viridis'];

  if (!scale || !Array.isArray(scale)) return 'linear-gradient(90deg, #440154 0%, #FDE725 100%)';

  const stops = scale.map((item: any[]) => {
    const pos = item[0] * 100;
    const color = item[1];
    return `${color} ${pos}%`;
  });

  return `linear-gradient(90deg, ${stops.join(', ')})`;
};

/**
 * Apply 3D mesh properties to a trace
 */
export const applyMesh3DProperties = (trace: any, properties: Mesh3DProperties): any => {
  if (!properties) return trace;

  const updatedTrace = { ...trace };

  // Apply surface type
  if (properties.surfaceType !== undefined) {
    if (properties.surfaceType === 'wireframe') {
      updatedTrace.type = 'surface';
      updatedTrace.hidesurface = true;
    } else if (properties.surfaceType === 'mesh') {
      updatedTrace.type = 'surface';
      updatedTrace.hidesurface = false;
    } else {
      updatedTrace.type = 'surface'; // default
      updatedTrace.hidesurface = false;
    }
  }

  // Apply opacity
  if (properties.opacity !== undefined) {
    updatedTrace.opacity = properties.opacity;
  }

  // Apply color scale
  if (properties.colorScale !== undefined) {
    // Get the proper colorscale format
    const getPlotlyColorScale = (colorScaleName: string): any => {
      const normalizedName = colorScaleName.toLowerCase();
      return COLOR_SCALE_DEFINITIONS[normalizedName] || COLOR_SCALE_DEFINITIONS['viridis'];
    };

    updatedTrace.colorscale = getPlotlyColorScale(properties.colorScale);
  }

  // Construct contours object
  const contours: any = {};

  // Z-contours (Elevation)
  if (properties.showContours) {
    contours.z = {
      show: true,
      start: 0,
      end: 0,
      width: 2,
      usecolormap: true,
      project: { z: true }
    };
  }

  // Grid (X/Y Contours)
  if (properties.showGrid) {
    const gridOpacity = properties.gridOpacity !== undefined ? properties.gridOpacity : 0.6;
    const gridColor = `rgba(255,255,255,${gridOpacity})`; // White grid with opacity

    contours.x = { show: true, color: gridColor, width: 1 };
    contours.y = { show: true, color: gridColor, width: 1 };
  }

  if (Object.keys(contours).length > 0) {
    updatedTrace.contours = contours;
  } else {
    updatedTrace.contours = { x: { show: false }, y: { show: false }, z: { show: false } };
  }

  // Apply lighting
  if (properties.lighting !== undefined) {
    if (properties.lighting) {
      updatedTrace.lighting = {
        ambient: 0.3,
        diffuse: 0.8,
        specular: 0.15,
        roughness: 0.1,
        fresnel: 0.1
      };
    } else {
      updatedTrace.lighting = {
        ambient: 1.0,
        diffuse: 0.0,
        specular: 0.0,
        roughness: 0.0,
        fresnel: 0.0
      };
    }
  }

  // Apply smooth shading (flatshading)
  if (properties.smoothShading !== undefined) {
    updatedTrace.flatshading = !properties.smoothShading;
  }

  // Clean up invalid wireframe property
  delete updatedTrace.wireframe;

  return updatedTrace;
};
