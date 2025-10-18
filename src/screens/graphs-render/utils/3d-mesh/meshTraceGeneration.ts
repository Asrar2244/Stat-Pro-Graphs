/**
 * 3D Mesh trace generation utilities
 */

import { TraceConfig } from '../common/types';
import { akimaInterpolation, rawDataInterpolation } from './meshInterpolation';

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
  
  // Validate color scale name
  const validColorScales = [
    'viridis', 'plasma', 'inferno', 'magma', 'cividis', 'hot', 'cool', 'rainbow', 
    'jet', 'turbo', 'blues', 'greens', 'reds', 'oranges', 'purples', 'pinks',
    'greys', 'gray', 'grey', 'blackbody', 'earth', 'electric', 'thermal',
    'haline', 'ice', 'dense', 'algae', 'matter', 'turbid', 'speed', 'amp',
    'tempo', 'deep', 'balance', 'delta', 'curl', 'edge', 'phase', 'picnic',
    'portland', 'rdylbu', 'rdylgn', 'spectral', 'tealrose', 'ylgnbu', 'ylorbr',
    'ylorrd', 'geyser', 'prgn', 'pubu', 'pubugn', 'puor', 'purd', 'purples',
    'rdbu', 'rdgy', 'rdylbu', 'rdylgn', 'spectral', 'tealrose', 'ylgnbu',
    'ylorbr', 'ylorrd'
  ];
  
  const isValidColorScale = validColorScales.includes(selectedColorScale.toLowerCase());
  const finalColorScale = isValidColorScale ? selectedColorScale : 'viridis';
  
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
    return createNaturalXYZMesh(xv, yv, rows, graphConfig, color, label, zv, selectedColorScale, meshConfig, needsSmoothing);
  } else if (dataFormat === 'Many Z' || dataFormat === 'z-matrix') {
    // Many Z: Create mesh surface from Z matrix data
    return createZMatrixMesh(xv, yv, rows, graphConfig, color, label, zv, selectedColorScale, meshConfig, needsSmoothing);
  } else if (dataFormat === 'XY Many Z' || dataFormat === 'xy-z-columns') {
    // XY Many Z: Create mesh surface from XY + multiple Z columns
    return createXYManyZMesh(xv, yv, rows, graphConfig, color, label, zv, selectedColorScale, meshConfig, needsSmoothing);
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
  
  // Apply showSurface configuration - if false, don't show the surface
  const shouldShowSurface = meshConfig.showSurface !== false;
  
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
    colorscale: selectedColorScale,
    // Add intensity for colorscale to work properly
    intensity: enhancedMatrix.flat(),
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
    colorscale: selectedColorScale,
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
    intensity: trace.intensity ? `${trace.intensity.length} values` : 'undefined',
    intensityRange: trace.intensity ? `[${Math.min(...trace.intensity).toFixed(2)}, ${Math.max(...trace.intensity).toFixed(2)}]` : 'undefined',
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
  console.log(`🎨 INTENSITY CHECK:`, {
    hasIntensity: !!trace.intensity,
    intensityLength: trace.intensity?.length,
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
  
  // Test intensity values for color scale effectiveness
  const flatMatrix = enhancedMatrix.flat();
  const intensityMin = Math.min(...flatMatrix);
  const intensityMax = Math.max(...flatMatrix);
  const intensityRange = intensityMax - intensityMin;
  const intensityVariation = intensityRange / intensityMax;
  
  console.log(`🎨 INTENSITY ANALYSIS:`, {
    intensityMin: intensityMin.toFixed(3),
    intensityMax: intensityMax.toFixed(3),
    intensityRange: intensityRange.toFixed(3),
    intensityVariation: (intensityVariation * 100).toFixed(1) + '%',
    sampleValues: flatMatrix.slice(0, 10).map(v => v.toFixed(3)),
    willShowColorVariation: intensityVariation > 0.1 ? 'YES' : 'NO - TOO SIMILAR'
  });
  
  // Test with a very obvious color scale to verify it's working
  const testColorScale = selectedColorScale === 'turbo' ? 'rainbow' : 'turbo';
  console.log(`🧪 COLOR SCALE TEST: Using ${testColorScale} instead of ${selectedColorScale} for testing`);
  
  const finalTrace = {
    x: finalXGrid,
    y: finalYGrid,
    z: enhancedMatrix,
    type: 'surface', // Force surface type for color scale support
    name: label,
    colorscale: testColorScale, // Use test color scale for debugging
    // Add intensity for colorscale to work properly
    intensity: enhancedMatrix.flat(),
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
    hasIntensity: !!finalTrace.intensity,
    intensityLength: finalTrace.intensity?.length,
    opacity: finalTrace.opacity,
    flatshading: finalTrace.flatshading,
    meshConfigColorScale: meshConfig.colorScale,
    selectedColorScale,
    // Debug intensity values
    intensityMin: finalTrace.intensity ? Math.min(...finalTrace.intensity) : 'N/A',
    intensityMax: finalTrace.intensity ? Math.max(...finalTrace.intensity) : 'N/A',
    intensityRange: finalTrace.intensity ? `${Math.min(...finalTrace.intensity).toFixed(2)} to ${Math.max(...finalTrace.intensity).toFixed(2)}` : 'N/A',
    zMin: finalTrace.zmin,
    zMax: finalTrace.zmax,
    // Debug Z matrix
    zMatrixLength: finalTrace.z?.length,
    zMatrixFirstRowLength: finalTrace.z?.[0]?.length,
    sampleZValues: finalTrace.z?.slice(0, 2).map(row => row.slice(0, 3)),
    // Debug color scale application
    hasColorscale: !!finalTrace.colorscale,
    colorscaleValue: finalTrace.colorscale,
    // Debug if intensity and Z values are consistent
    intensityZConsistency: finalTrace.intensity && finalTrace.z ? 
      `Intensity: ${finalTrace.intensity.length} values, Z: ${finalTrace.z.length}x${finalTrace.z[0]?.length} matrix` : 'N/A'
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
  
  // For xy-z-columns format, always create optimized grid from the selected X/Y variables
  // This format should never use default scales - it always uses explicitly selected variables
  const dataDensity = Math.sqrt(xv.length);
  const gridSize = Math.min(Math.max(Math.floor(dataDensity * 0.8), 15), 30);
  
  const xMin = Math.min(...xv);
  const xMax = Math.max(...xv);
  const yMin = Math.min(...yv);
  const yMax = Math.max(...yv);
  
  // Create regular grid from the actual X and Y data ranges
  const xGrid = Array.from({ length: gridSize }, (_, i) => 
    xMin + (xMax - xMin) * i / (gridSize - 1)
  );
  const yGrid = Array.from({ length: gridSize }, (_, i) => 
    yMin + (yMax - yMin) * i / (gridSize - 1)
  );
  
  // Sort grids to ensure low-to-high ordering
  xGrid.sort((a, b) => a - b);
  yGrid.sort((a, b) => a - b);
  
  // Create professional mesh surface from XYZ data
  const dataPoints = xv.map((x, i) => ({ x, y: yv[i], z: zValues[i] }));
  
  // Create Z matrix using professional interpolation
  let zMatrix: number[][] = [];
  let finalXGrid = xGrid;
  let finalYGrid = yGrid;
  
  if (needsSmoothing) {
    console.log(`🔄 Applying smooth surface interpolation for scattered XY Many Z data`);
    try {
      const smoothResult = createSmoothSurface(xv, yv, zValues, gridSize, 'cubic');
      zMatrix = smoothResult.zGrid;
      finalXGrid = smoothResult.xGrid[0]; // Take first row for X grid
      finalYGrid = smoothResult.yGrid.map(row => row[0]); // Take first column for Y grid
      console.log(`✅ Smooth surface interpolation completed for XY Many Z data`);
    } catch (error) {
      console.warn(`⚠️ Smooth interpolation failed for XY Many Z, falling back to regular grid:`, error);
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
    console.log(`📊 Using regular grid for gridded XY Many Z data`);
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
  
  // No smoothing - preserve all sharp features and natural variations
  const smoothedMatrix = zMatrix;
  
  // Use surface type from configuration
  const surfaceType = meshConfig.surfaceType || 'surface';
  const traceType = surfaceType === 'wireframe' ? 'scatter3d' : 'surface';
  
  return {
    x: finalXGrid,
    y: finalYGrid,
    z: smoothedMatrix,
    type: traceType,
    name: label,
    colorscale: selectedColorScale,
    // Add intensity for colorscale to work properly
    intensity: smoothedMatrix.flat(),
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
