import { useGraphBodyLayout } from '../styles/use-graph-body-render';
import { GraphProperty } from './graph-property';
import { GraphTabs } from './graph-tabs';
import { FC, useState, useEffect } from 'react';
import { GraphCanvas } from '../../graphs-render/plotly-canvas';
import { ToolBar } from '../tool-bar';
import { useTools } from '../hooks/use-tools';
import { PlotSpecificProperties, DEFAULT_PLOT_PROPERTIES } from '../../graphs-render/utils/plotProperties';
export const GraphBodyRender: FC<any> = (props) => {
  const classes = useGraphBodyLayout();
  const tools = useTools();
  
  // State for plot properties
  const [plotProperties, setPlotProperties] = useState<PlotSpecificProperties>(DEFAULT_PLOT_PROPERTIES);
  
  const handlePlotPropertiesChange = (newProperties: PlotSpecificProperties) => {
    setPlotProperties(newProperties);
  };

  // Reset properties when graphConfig changes
  useEffect(() => {
    if (props?.graphConfig && props?.graphConfig?.subType?.toLowerCase().includes('mesh')) {
      setPlotProperties(DEFAULT_PLOT_PROPERTIES);
    }
  }, [props?.graphConfig?.subType]);

  // Initialize 3D mesh properties from graphConfig when available
  useEffect(() => {
    if (props?.graphConfig && props?.graphConfig?.subType?.toLowerCase().includes('mesh')) {
      // Extract 3D mesh properties from graph config
      const mesh3dFromConfig = {
        surfaceType: props.graphConfig.surfaceType || props.graphConfig.meshConfig?.surfaceType,
        opacity: props.graphConfig.opacity || props.graphConfig.meshConfig?.opacity,
        colorScale: props.graphConfig.colorScale || props.graphConfig.meshConfig?.colorScale,
        showContours: props.graphConfig.showContours || props.graphConfig.meshConfig?.showContours,
        contourOpacity: props.graphConfig.contourOpacity || props.graphConfig.meshConfig?.contourOpacity,
        lighting: props.graphConfig.lighting || props.graphConfig.meshConfig?.lighting,
        smoothShading: props.graphConfig.smoothShading || props.graphConfig.meshConfig?.smoothShading,
        showGrid: props.graphConfig.showGrid || props.graphConfig.meshConfig?.showGrid,
        gridOpacity: props.graphConfig.gridOpacity || props.graphConfig.meshConfig?.gridOpacity
      };

      // Update properties with mesh config values
      const updatedPlotProperties = { ...DEFAULT_PLOT_PROPERTIES };
      let hasChanges = false;
      
      if (!updatedPlotProperties.mesh3d) {
        updatedPlotProperties.mesh3d = {};
      }

      Object.entries(mesh3dFromConfig).forEach(([key, value]) => {
        if (value !== undefined) {
          (updatedPlotProperties.mesh3d as any)[key] = value;
          hasChanges = true;
        }
      });
      
      // Preserve original color scale
      if (mesh3dFromConfig.colorScale) {
        updatedPlotProperties.mesh3d.originalColorScale = mesh3dFromConfig.colorScale;
        hasChanges = true;
      }
      
      if (hasChanges) {
        setPlotProperties(updatedPlotProperties);
      }
    }
  }, [props?.graphConfig]);

  // Create liveProps with plot properties and canvas mode
  // Use plotProperties from state to ensure proper synchronization
  const liveProps = {
    ...props.liveProps,
    plotSpecific: plotProperties,
    global: tools.graphProperties.global,
    canvasMode: tools.canvasMode
  };
  
  
  // Track canvas mode changes
  useEffect(() => {
  }, [tools.canvasMode]);

  return (
    <div className={classes.graphBodyLayout}>
      <ToolBar 
        tools={tools} 
        title={props?.graphConfig?.subType || ''} 
        subTitle={props?.graphConfig?.dataFormat || ''} 
      />
      <GraphTabs />
      <GraphProperty 
        graphConfig={props?.graphConfig}
        plotProperties={plotProperties}
        onPlotPropertiesChange={handlePlotPropertiesChange}
      />
      <GraphCanvas 
        {...props} 
        liveProps={liveProps} 
        key={`canvas-${tools.canvasMode}`} // Force re-render when canvas mode changes
      />
    </div>
  );
}; 
