/**
 * Common utilities and helpers shared between 2D and 3D canvas
 */

/**
 * Function to determine text color based on background color
 */
export const getTextColorForBackground = (bgColor: string): string => {
  if (!bgColor) return '#111111'; // Default dark text
  
  // Parse background color to RGB values
  let r, g, b;
  
  if (bgColor.startsWith('#')) {
    // Hex color
    const hex = bgColor.replace('#', '');
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (bgColor.startsWith('rgb')) {
    // RGB/RGBA color
    const values = bgColor.match(/\d+/g);
    if (values && values.length >= 3) {
      r = parseInt(values[0]);
      g = parseInt(values[1]);
      b = parseInt(values[2]);
    } else {
      return '#111111'; // Default if parsing fails
    }
  } else {
    return '#111111'; // Default for unknown formats
  }
  
  // Calculate luminance using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return dark text for light backgrounds, light text for dark backgrounds
  return luminance > 0.5 ? '#111111' : '#FFFFFF';
};

/**
 * Convert hex color to RGBA
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substr(0, 2), 16);
  const g = parseInt(h.substr(2, 2), 16);
  const b = parseInt(h.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Get mode colors based on canvas mode
 */
export const getModeColors = (canvasMode: 'light' | 'dark') => {
  const lightModeColors = {
    paperBg: '#ffffff',
    plotBg: '#ffffff',
    textColor: '#111111',
    axisTextColor: '#111111',
    gridColor: '#e5e5e5', // 2D grid color (light gray)
    axisColor: '#444444'
  };
  
  const darkModeColors = {
    paperBg: '#000000',        // Pitch black background
    plotBg: '#000000',         // Pitch black plot area
    textColor: '#ffffff',      // Pure white text
    axisTextColor: '#ffffff',  // Pure white axis text
    gridColor: '#333333',      // Dark gray grid
    axisColor: '#555555'       // Medium gray axes
  };
  
  return canvasMode === 'dark' ? darkModeColors : lightModeColors;
};

/**
 * Check if traces are 3D mesh traces
 */
export const has3DMeshTraces = (traces: any[]): boolean => {
  return traces.some(trace => 
    trace.type === 'scatter3d' || 
    trace.type === 'mesh3d' || 
    trace.type === 'surface'
  );
};

/**
 * Check if trace is a 3D mesh trace
 */
export const is3DMeshTrace = (trace: any): boolean => {
  return trace.type === 'surface' || 
         trace.type === 'mesh3d' || 
         trace.type === 'scatter3d';
};

