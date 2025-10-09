import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Text,
} from '@fluentui/react-components';
import { GraphAddTraces } from './graph-add-traces';
import { useGraphPropertyLayout } from '../../styles/use-graph-property';
import { PlotPropertiesPanel } from '../../../graphs-render/components/PlotPropertiesPanel';
import { PlotSpecificProperties, DEFAULT_PLOT_PROPERTIES } from '../../../graphs-render/utils/plotProperties';
interface GraphPropertiesProps {
  graphConfig?: any;
  plotProperties?: PlotSpecificProperties;
  onPlotPropertiesChange?: (properties: PlotSpecificProperties) => void;
}

export const GraphProperties = ({ graphConfig, plotProperties, onPlotPropertiesChange }: GraphPropertiesProps) => {
  const classes = useGraphPropertyLayout();
  
  // Use passed properties or defaults
  const currentPlotProperties = plotProperties || DEFAULT_PLOT_PROPERTIES;
  
  // Determine properties based on actual graph configuration
  const hasRegression = graphConfig?.subType?.toLowerCase().includes('regression') || false;
  const hasErrorBars = graphConfig?.subType?.toLowerCase().includes('error') || false;
  const isCategoryPlot = graphConfig?.dataFormat?.toLowerCase().includes('category') || false;
  
  const handlePlotPropertiesChange = (newProperties: PlotSpecificProperties) => {
    if (onPlotPropertiesChange) {
      onPlotPropertiesChange(newProperties);
    }
    console.log('🎨 Plot properties updated:', newProperties);
  };

  return (
    <Accordion>
      <AccordionItem value="1">
        <AccordionHeader className={classes.propertyField}>
          Data Selectors &nbsp;<Text font="monospace">[Traces]</Text>
        </AccordionHeader>
        <AccordionPanel>
          <div className={classes.propertyBody}>
            <GraphAddTraces />
          </div>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="2">
        <AccordionHeader className={classes.propertyField}>Plot Properties</AccordionHeader>
        <AccordionPanel>
          <div className={classes.propertyBody}>
            <PlotPropertiesPanel
              properties={currentPlotProperties}
              onPropertiesChange={handlePlotPropertiesChange}
              hasRegression={hasRegression}
              hasErrorBars={hasErrorBars}
              isCategoryPlot={isCategoryPlot}
            />
          </div>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="3">
        <AccordionHeader className={classes.propertyField}>Traces Overview</AccordionHeader>
        <AccordionPanel>
          <div className={classes.propertyBody}>
            Here trace overview like trace1 :x:"",y:"",z:"",type:"",mode:""
          </div>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="4">
        <AccordionHeader className={classes.propertyField}>Layout Options</AccordionHeader>
        <AccordionPanel>
          <div className={classes.propertyBody}>
            Layout properties like xaxis,yaxis,title,legend,etc
          </div>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};
