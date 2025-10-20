/**
 * 3D Scene Layout Builder
 * Handles 3D mesh plot scene configuration
 */

/**
 * Build 3D scene layout configuration
 */
export const build3DSceneLayout = (
  xNames: string[],
  yNames: string[],
  canvasMode: 'light' | 'dark',
  modeColors: any
): any => {
  return {
    xaxis: { 
      title: xNames[0] || 'X',
      // Ensure X-axis goes from low to high (left to right)
      autorange: true,
      showgrid: true,
      zeroline: false,
      // Ensure proper orientation: low values on left, high on right
      tickmode: 'auto',
      nticks: 12, // Extra scale - more tick marks
      // Professional canvas mode colors - 3D grid color based on mode
      gridcolor: canvasMode === 'dark' ? '#333333' : 'white',
      color: modeColors.axisTextColor,
      titlefont: { color: modeColors.axisTextColor },
      // Default Plotly 3D background - different for light/dark mode
      backgroundcolor: canvasMode === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(230, 230, 250)',
      showbackground: true
    },
    yaxis: { 
      title: yNames[0] || 'Y',
      // Ensure Y-axis goes from low to high (front to back)
      autorange: true,
      showgrid: true,
      zeroline: false,
      // Ensure proper orientation: low values in front, high in back
      tickmode: 'auto',
      nticks: 12, // Extra scale - more tick marks
      // Professional canvas mode colors - 3D grid color based on mode
      gridcolor: canvasMode === 'dark' ? '#333333' : 'white',
      color: modeColors.axisTextColor,
      titlefont: { color: modeColors.axisTextColor },
      // Default Plotly 3D background - different for light/dark mode
      backgroundcolor: canvasMode === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(230, 230, 250)',
      showbackground: true
    },
    zaxis: { 
      title: 'Z',
      // Ensure Z-axis goes from low to high (bottom to top)
      autorange: true,
      showgrid: true,
      zeroline: false,
      // Ensure proper Z-axis scaling with single range
      tickmode: 'auto',
      nticks: 12, // Extra scale - more tick marks
      // Professional canvas mode colors - 3D grid color based on mode
      gridcolor: canvasMode === 'dark' ? '#333333' : 'white',
      color: modeColors.axisTextColor,
      titlefont: { color: modeColors.axisTextColor },
      // Default Plotly 3D background - different for light/dark mode
      backgroundcolor: canvasMode === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(230, 230, 250)',
      showbackground: true
    },
    camera: {
      // Front view with X-axis on right, Y-axis on left - positioned to show proper axis orientation
      // X: -1.2 (rotated left to show X-axis on right), Y: -2.0 (front view), Z: 0.8 (elevated for better axis visibility)
      eye: { x: -1.2, y: -2.0, z: 0.8 },
      center: { x: 0, y: 0, z: 0 },
      up: { x: 0, y: 0, z: 1 }
    },
    // Enhanced 3D appearance settings
    aspectmode: 'auto',
    aspectratio: { x: 1, y: 1, z: 1 }
  };
};

