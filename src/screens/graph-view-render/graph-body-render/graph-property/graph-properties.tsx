import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Text,
} from '@fluentui/react-components';
import { GraphAddTraces } from './graph-add-traces';
import { useGraphPropertyLayout } from '../../styles-hook/use-graph-property';
export const GraphProperties = () => {
  const classes = useGraphPropertyLayout();
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
        <AccordionHeader className={classes.propertyField}>Traces Overview</AccordionHeader>
        <AccordionPanel>
          <div className={classes.propertyBody}>
            Here trace overview like trace1 :x:"",y:"",z:"",type:"",mode:""
          </div>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="3">
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
