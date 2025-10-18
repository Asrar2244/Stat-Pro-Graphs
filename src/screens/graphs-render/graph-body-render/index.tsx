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

  // Create liveProps with plot properties and canvas mode
  const liveProps = {
    ...props.liveProps,
    plotSpecific: plotProperties,
    canvasMode: tools.canvasMode
  };
  
  console.log('🎨 Graph Body Render - Canvas Mode:', {
    toolsCanvasMode: tools.canvasMode,
    livePropsCanvasMode: liveProps.canvasMode,
    hasTools: !!tools
  });
  
  // Track canvas mode changes
  useEffect(() => {
    console.log('🎨 Graph Body Render - Canvas Mode Changed:', {
      canvasMode: tools.canvasMode,
      timestamp: new Date().toISOString()
    });
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
