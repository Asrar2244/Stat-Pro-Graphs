import { useGraphBodyLayout } from '../styles/use-graph-body-render';
import { GraphProperty } from './graph-property';
import { GraphTabs } from './graph-tabs';
import { FC, useState } from 'react';
import { GraphCanvas } from '../../graphs-render/plotly-canvas';
import { ToolBar as OutputToolBar } from '../../output-render/tool-bar';
import { useTools } from '../../output-render/hooks/use-tools';
import { PlotSpecificProperties, DEFAULT_PLOT_PROPERTIES } from '../../graphs-render/utils/plotProperties';
export const GraphBodyRender: FC<any> = (props) => {
  const classes = useGraphBodyLayout();
  const tools = useTools();
  
  // State for plot properties
  const [plotProperties, setPlotProperties] = useState<PlotSpecificProperties>(DEFAULT_PLOT_PROPERTIES);
  
  const handlePlotPropertiesChange = (newProperties: PlotSpecificProperties) => {
    setPlotProperties(newProperties);
  };

  // Create liveProps with plot properties
  const liveProps = {
    ...props.liveProps,
    plotSpecific: plotProperties
  };

  return (
    <div className={classes.graphBodyLayout}>
      <OutputToolBar 
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
      <GraphCanvas {...props} liveProps={liveProps} />
    </div>
  );
}; 
