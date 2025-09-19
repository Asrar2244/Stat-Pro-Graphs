import { useGraphBodyLayout } from '../styles-hook/use-graph-body-render';
import { GraphProperty } from './graph-property';
import { GraphTabs } from './graph-tabs';
import { FC } from 'react';
import { GraphCanvas } from './plotly-canvas';
import { ToolBar as OutputToolBar } from '../../output-render/tool-bar';
import { useTools } from '../../output-render/hooks/use-tools';
export const GraphBodyRender: FC<any> = (props) => {
  const classes = useGraphBodyLayout();
  const tools = useTools();
  return (
    <div className={classes.graphBodyLayout}>
      <OutputToolBar 
        tools={tools} 
        title={props?.graphConfig?.subType || ''} 
        subTitle={props?.graphConfig?.dataFormat || ''} 
      />
      <GraphTabs />
      <GraphProperty />
      <GraphCanvas {...props} />
    </div>
  );
}; 
