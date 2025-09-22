import { FC, ReactNode, memo, useEffect, useRef, useState } from 'react';
import {
  Button,
  Text,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  Divider,
  Field,
  Input,
  Slider,
  Switch,
  Label,
  Card,
  CardHeader,
  CardPreview,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
} from '@fluentui/react-components';

import { useTranslation } from 'react-i18next';
import { useGraphPropertiesClasses } from '../styles-hook/use-graph-properties-style';
import { IoCloseOutline } from 'react-icons/io5';
import { MdSettings, MdPalette, MdTune, MdVisibility, MdExpandMore, MdExpandLess, MdScatterPlot, MdError, MdTrendingUp } from 'react-icons/md';
import { GraphProperties as GraphPropertiesType, GlobalGraphProperties, PlotSpecificProperties } from '../hooks/use-tools';

interface IGraphProperties {
  showGraphProperties: boolean;
  toggleGraphProperties: () => void;
  graphProperties: GraphPropertiesType;
  updateGraphProperty: <K extends keyof GlobalGraphProperties>(key: K, value: GlobalGraphProperties[K]) => void;
  updatePlotSpecificProperty: <T extends keyof PlotSpecificProperties>(plotType: T, key: keyof NonNullable<PlotSpecificProperties[T]>, value: any) => void;
  getCurrentPlotType: (subType?: string) => keyof PlotSpecificProperties | null;
  currentSubType?: string;
}

const GraphPropertiesComponent: FC<{ properties: IGraphProperties }> = ({
  properties,
}) => {
  const classes = useGraphPropertiesClasses();
  const { t } = useTranslation('graphProperties');
  const { graphProperties, updateGraphProperty, updatePlotSpecificProperty, getCurrentPlotType, currentSubType } = properties;
  
  const currentPlotType = getCurrentPlotType(currentSubType);
  const globalProps = graphProperties.global;
  const plotProps = graphProperties.plotSpecific;

  const [drawerWidth, setDrawerWidth] = useState<number>(560);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const minWidth = 320;
  const maxWidth = 900;

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = startXRef.current - e.clientX; // dragging left increases width
      const next = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + delta));
      setDrawerWidth(next);
    };
    const onMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const beginDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = drawerWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <InlineDrawer open={properties.showGraphProperties} position={'end'} className={classes.drawerContainer} style={{ width: drawerWidth, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <DrawerHeader className={classes.drawerHeader}>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<IoCloseOutline />}
              onClick={properties.toggleGraphProperties}
            />
          }
        >
          <Text className={classes.graphPropertiesTitle}>
            <MdSettings style={{ marginRight: '8px' }} />
            Graph Properties
          </Text>
        </DrawerHeaderTitle>
        <Divider />
      </DrawerHeader>
      
      <DrawerBody className={classes.drawerBody} style={{ position: 'relative', height: '100%', overflowY: 'auto' }}>
        {/* Left-edge resizer to adjust drawer width */}
        <div
          onMouseDown={beginDrag}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: 6,
            cursor: 'ew-resize',
            // Expand hit area slightly without visible UI changes
            transform: 'translateX(-3px)',
          }}
        />
        <div className={classes.propertiesContainer}>
          
          <Accordion collapsible defaultOpenItems={["global"]}>
            {/* General Graph Settings Section */}
            <AccordionItem value="global">
              <AccordionHeader>
                <div className={classes.accordionHeader}>
                  <MdSettings size={20} />
                  <Text weight="semibold">General Graph Settings</Text>
                  <Text size={200} style={{ marginLeft: 'auto', color: 'rgba(0,0,0,0.6)' }}>
                    (Used for all graphs)
                  </Text>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <div className={classes.propertyContent}>
                  {/* General Graph Settings */}
                  <Card>
                    <CardHeader>
                      <Text weight="semibold">General Graph Settings</Text>
                    </CardHeader>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <Field label="Graph Name">
                        <Input 
                          value={globalProps.graphName}
                          onChange={(_, data) => updateGraphProperty('graphName', data.value)}
                        />
                      </Field>
                      <Field label="Axis (X data)">
                        <Input 
                          value={globalProps.axisXData || ''}
                          onChange={(_, data) => updateGraphProperty('axisXData', data.value)}
                        />
                      </Field>
                      <Field label="Axis (Y data)">
                        <Input 
                          value={globalProps.axisYData || ''}
                          onChange={(_, data) => updateGraphProperty('axisYData', data.value)}
                        />
                      </Field>
                      <Field label="Title Visibility">
                        <Switch 
                          checked={globalProps.showTitle}
                          onChange={(_, data) => updateGraphProperty('showTitle', data.checked)}
                        />
                      </Field>
                    </div>
                  </Card>

                  {/* Appearance */}
                  <Field label="Background Color">
                    <Input
                      type="color"
                      value={globalProps.backgroundColor}
                      onChange={(_, data) => updateGraphProperty('backgroundColor', data.value)}
                      style={{ width: '100%', height: '40px' }}
                    />
                  </Field>
                  <Field label="Plot Color">
                    <Input
                      type="color"
                      value={globalProps.plotColor || '#ffffff'}
                      onChange={(_, data) => updateGraphProperty('plotColor', data.value)}
                      style={{ width: '100%', height: '40px' }}
                    />
                  </Field>
                  <Field label="Series Color (points/lines)">
                    <Input
                      type="color"
                      value={globalProps.seriesColor || '#1f77b4'}
                      onChange={(_, data) => updateGraphProperty('seriesColor', data.value)}
                      style={{ width: '100%', height: '40px' }}
                    />
                  </Field>
                  
                  <Field label="Grid Lines">
                    <Switch 
                      checked={globalProps.showGridLines}
                      onChange={(_, data) => updateGraphProperty('showGridLines', data.checked)}
                    />
                  </Field>
                  
                  <Field label="Axis Labels">
                    <Switch 
                      checked={globalProps.showAxisLabels}
                      onChange={(_, data) => updateGraphProperty('showAxisLabels', data.checked)}
                    />
                  </Field>
                  
                  <Field label={`Margin Size: ${globalProps.marginSize}`}>
                    <Slider 
                      min={0} 
                      max={100} 
                      value={globalProps.marginSize}
                      onChange={(_, data) => updateGraphProperty('marginSize', data.value)}
                    />
                  </Field>
                  
                  <Field label={`Padding: ${globalProps.padding}`}>
                    <Slider 
                      min={0} 
                      max={50} 
                      value={globalProps.padding}
                      onChange={(_, data) => updateGraphProperty('padding', data.value)}
                    />
                  </Field>
                  
                </div>
              </AccordionPanel>
            </AccordionItem>

            {/* Legends Section */}
            <AccordionItem value="legends">
              <AccordionHeader>
                <div className={classes.accordionHeader}>
                  <MdSettings size={20} />
                  <Text weight="semibold">Legends</Text>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <div className={classes.propertyContent}>
                  <Card>
                    <CardHeader>
                      <Text weight="semibold">Legend Box Appearance</Text>
                    </CardHeader>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <Field label={`Number of Columns: ${globalProps.legendColumns}`}>
                        <Slider 
                          min={1} 
                          max={8} 
                          value={globalProps.legendColumns}
                          onChange={(_, data) => updateGraphProperty('legendColumns', data.value)}
                        />
                      </Field>
                      <Field label={`Box Spacing (inch): ${globalProps.legendBoxSpacingInch.toFixed(2)}`}>
                        <Slider 
                          min={0} 
                          max={2} 
                          step={0.05}
                          value={globalProps.legendBoxSpacingInch}
                          onChange={(_, data) => updateGraphProperty('legendBoxSpacingInch', data.value)}
                        />
                      </Field>
                      <Field label="Position (Front, Legend Box)">
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button 
                            appearance={globalProps.legendPosition === 'front' ? 'primary' : 'secondary'}
                            onClick={() => updateGraphProperty('legendPosition', 'front')}
                          >Front</Button>
                          <Button 
                            appearance={globalProps.legendPosition === 'legendBox' ? 'primary' : 'secondary'}
                            onClick={() => updateGraphProperty('legendPosition', 'legendBox')}
                          >Legend Box</Button>
                        </div>
                      </Field>
                    </div>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Text weight="semibold">Legend Title Options</Text>
                    </CardHeader>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Field label="Legend title" style={{ flexGrow: 1 }}>
                          <Input 
                            placeholder="Enter legend title"
                            value={globalProps.legendTitle}
                            onChange={(_, data) => updateGraphProperty('legendTitle', data.value)}
                          />
                        </Field>
                        <Button appearance="secondary">Title…</Button>
                        <Button appearance="secondary">Box…</Button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Show Legend">
                          <Switch 
                            checked={globalProps.showLegend}
                            onChange={(_, data) => updateGraphProperty('showLegend', data.checked)}
                          />
                        </Field>
                        <Field label="Framed in Box">
                          <Switch 
                            checked={globalProps.legendFramedInBox}
                            onChange={(_, data) => updateGraphProperty('legendFramedInBox', data.checked)}
                          />
                        </Field>
                        <Field label="Lock Legend">
                          <Switch 
                            checked={globalProps.legendLock}
                            onChange={(_, data) => updateGraphProperty('legendLock', data.checked)}
                          />
                        </Field>
                        <Field label="Direct Labeling">
                          <Switch 
                            checked={globalProps.legendDirectLabeling}
                            onChange={(_, data) => updateGraphProperty('legendDirectLabeling', data.checked)}
                          />
                        </Field>
                        <Field label="Allow Drag/Resize">
                          <Switch 
                            checked={globalProps.legendAllowDragResize}
                            onChange={(_, data) => updateGraphProperty('legendAllowDragResize', data.checked)}
                          />
                        </Field>
                        <Field label="Use Y Only for Legend">
                          <Switch 
                            checked={globalProps.legendUseYOnly}
                            onChange={(_, data) => updateGraphProperty('legendUseYOnly', data.checked)}
                          />
                        </Field>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                          appearance="secondary"
                          onClick={() => {
                            updateGraphProperty('showLegend', true);
                            updateGraphProperty('legendColumns', 1);
                            updateGraphProperty('legendBoxSpacingInch', 0.25);
                            updateGraphProperty('legendPosition', 'legendBox');
                            updateGraphProperty('legendLock', false);
                            updateGraphProperty('legendAllowDragResize', true);
                            updateGraphProperty('legendFramedInBox', true);
                            updateGraphProperty('legendDirectLabeling', false);
                            updateGraphProperty('legendUseYOnly', false);
                          }}
                        >Reset</Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </AccordionPanel>
            </AccordionItem>

            {/* Plot-Specific Properties Section */}
            {currentPlotType && (
              <AccordionItem value="plotSpecific">
                <AccordionHeader>
                  <div className={classes.accordionHeader}>
                    {currentPlotType === 'scatter' && <MdScatterPlot size={20} />}
                    {currentPlotType === 'errorBar' && <MdError size={20} />}
                    {currentPlotType === 'pointPlot' && <MdVisibility size={20} />}
                    {currentPlotType === 'dotPlot' && <MdVisibility size={20} />}
                    {currentPlotType === 'regression' && <MdTrendingUp size={20} />}
                    <Text weight="semibold">
                      {currentPlotType === 'scatter' && 'Scatter Plot Properties'}
                      {currentPlotType === 'errorBar' && 'Error Bar Properties'}
                      {currentPlotType === 'pointPlot' && 'Point Plot Properties'}
                      {currentPlotType === 'dotPlot' && 'Dot Plot Properties'}
                      {currentPlotType === 'regression' && 'Regression Properties'}
                    </Text>
                    <Text size={200} style={{ marginLeft: 'auto', color: 'rgba(0,0,0,0.6)' }}>
                      (Current plot only)
                    </Text>
                  </div>
                </AccordionHeader>
                <AccordionPanel>
                  <div className={classes.propertyContent}>
                    {/* Scatter Plot Properties */}
                    {currentPlotType === 'scatter' && plotProps.scatter && (
                      <>
                        <Field label={`Point Size: ${plotProps.scatter.pointSize}`}>
                          <Slider 
                            min={1} 
                            max={20} 
                            value={plotProps.scatter.pointSize}
                            onChange={(_, data) => updatePlotSpecificProperty('scatter', 'pointSize', data.value)}
                          />
                        </Field>
                        
                        <Field label="Show Data Points">
                          <Switch 
                            checked={plotProps.scatter.showDataPoints}
                            onChange={(_, data) => updatePlotSpecificProperty('scatter', 'showDataPoints', data.checked)}
                          />
                        </Field>
                        
                        <Field label={`Point Opacity: ${(plotProps.scatter.pointOpacity * 100).toFixed(0)}%`}>
                          <Slider 
                            min={0.1} 
                            max={1} 
                            step={0.1}
                            value={plotProps.scatter.pointOpacity}
                            onChange={(_, data) => updatePlotSpecificProperty('scatter', 'pointOpacity', data.value)}
                          />
                        </Field>
                        
                        <Field label={`Border Width: ${plotProps.scatter.pointBorderWidth}`}>
                          <Slider 
                            min={0} 
                            max={5} 
                            value={plotProps.scatter.pointBorderWidth}
                            onChange={(_, data) => updatePlotSpecificProperty('scatter', 'pointBorderWidth', data.value)}
                          />
                        </Field>
                        <Field label="Point Color">
                          <Input
                            type="color"
                            value={plotProps.scatter.pointColor || '#1f77b4'}
                            onChange={(_, data) => updatePlotSpecificProperty('scatter', 'pointColor', data.value)}
                            style={{ width: '100%', height: '40px' }}
                          />
                        </Field>
                      </>
                    )}

                    {/* Error Bar Properties */}
                    {currentPlotType === 'errorBar' && plotProps.errorBar && (
                      <>
                        <Field label={`Error Bar Thickness: ${plotProps.errorBar.errorBarThickness}`}>
                          <Slider 
                            min={1} 
                            max={10} 
                            value={plotProps.errorBar.errorBarThickness}
                            onChange={(_, data) => updatePlotSpecificProperty('errorBar', 'errorBarThickness', data.value)}
                          />
                        </Field>
                        
                        <Field label={`Error Bar Width: ${plotProps.errorBar.errorBarWidth}`}>
                          <Slider 
                            min={0.1} 
                            max={2} 
                            step={0.1}
                            value={plotProps.errorBar.errorBarWidth}
                            onChange={(_, data) => updatePlotSpecificProperty('errorBar', 'errorBarWidth', data.value)}
                          />
                        </Field>
                        
                        <Field label={`Error Bar Opacity: ${(plotProps.errorBar.errorBarOpacity * 100).toFixed(0)}%`}>
                          <Slider 
                            min={0.1} 
                            max={1} 
                            step={0.1}
                            value={plotProps.errorBar.errorBarOpacity}
                            onChange={(_, data) => updatePlotSpecificProperty('errorBar', 'errorBarOpacity', data.value)}
                          />
                        </Field>
                        
                        <Field label={`Cap Size: ${plotProps.errorBar.errorBarCapSize}`}>
                          <Slider 
                            min={0} 
                            max={10} 
                            value={plotProps.errorBar.errorBarCapSize}
                            onChange={(_, data) => updatePlotSpecificProperty('errorBar', 'errorBarCapSize', data.value)}
                          />
                        </Field>
                        
                        <Field label="Show Error Bars">
                          <Switch 
                            checked={plotProps.errorBar.showErrorBars}
                            onChange={(_, data) => updatePlotSpecificProperty('errorBar', 'showErrorBars', data.checked)}
                          />
                        </Field>
                      </>
                    )}

                    {/* Point Plot Properties */}
                    {currentPlotType === 'pointPlot' && plotProps.pointPlot && (
                      <>
                        <Field label={`Point Size: ${plotProps.pointPlot.pointSize}`}>
                          <Slider 
                            min={5} 
                            max={25} 
                            value={plotProps.pointPlot.pointSize}
                            onChange={(_, data) => updatePlotSpecificProperty('pointPlot', 'pointSize', data.value)}
                          />
                        </Field>
                        
                        <Field label={`Point Opacity: ${(plotProps.pointPlot.pointOpacity * 100).toFixed(0)}%`}>
                          <Slider 
                            min={0.1} 
                            max={1} 
                            step={0.1}
                            value={plotProps.pointPlot.pointOpacity}
                            onChange={(_, data) => updatePlotSpecificProperty('pointPlot', 'pointOpacity', data.value)}
                          />
                        </Field>
                        
                        <Field label={`Border Width: ${plotProps.pointPlot.pointBorderWidth}`}>
                          <Slider 
                            min={0} 
                            max={5} 
                            value={plotProps.pointPlot.pointBorderWidth}
                            onChange={(_, data) => updatePlotSpecificProperty('pointPlot', 'pointBorderWidth', data.value)}
                          />
                        </Field>
                        
                        <Field label="Border Color">
                          <Input
                            type="color"
                            value={plotProps.pointPlot.pointBorderColor}
                            onChange={(_, data) => updatePlotSpecificProperty('pointPlot', 'pointBorderColor', data.value)}
                            style={{ width: '100%', height: '40px' }}
                          />
                        </Field>
                        
                        <Field label="Show Data Points">
                          <Switch 
                            checked={plotProps.pointPlot.showDataPoints}
                            onChange={(_, data) => updatePlotSpecificProperty('pointPlot', 'showDataPoints', data.checked)}
                          />
                        </Field>
                      </>
                    )}

                    {/* Dot Plot Properties */}
                    {currentPlotType === 'dotPlot' && plotProps.dotPlot && (
                      <>
                        <Field label={`Dot Size: ${plotProps.dotPlot.dotSize}`}>
                          <Slider 
                            min={2} 
                            max={15} 
                            value={plotProps.dotPlot.dotSize}
                            onChange={(_, data) => updatePlotSpecificProperty('dotPlot', 'dotSize', data.value)}
                          />
                        </Field>
                        
                        <Field label={`Dot Opacity: ${(plotProps.dotPlot.dotOpacity * 100).toFixed(0)}%`}>
                          <Slider 
                            min={0.1} 
                            max={1} 
                            step={0.1}
                            value={plotProps.dotPlot.dotOpacity}
                            onChange={(_, data) => updatePlotSpecificProperty('dotPlot', 'dotOpacity', data.value)}
                          />
                        </Field>
                        
                        <Field label={`Dot Spacing: ${plotProps.dotPlot.dotSpacing}`}>
                          <Slider 
                            min={0.01} 
                            max={0.1} 
                            step={0.01}
                            value={plotProps.dotPlot.dotSpacing}
                            onChange={(_, data) => updatePlotSpecificProperty('dotPlot', 'dotSpacing', data.value)}
                          />
                        </Field>
                        
                        <Field label="Show Dotted Lines">
                          <Switch 
                            checked={plotProps.dotPlot.showDottedLines}
                            onChange={(_, data) => updatePlotSpecificProperty('dotPlot', 'showDottedLines', data.checked)}
                          />
                        </Field>
                        
                        <Field label={`Dotted Line Opacity: ${(plotProps.dotPlot.dottedLineOpacity * 100).toFixed(0)}%`}>
                          <Slider 
                            min={0.1} 
                            max={1} 
                            step={0.1}
                            value={plotProps.dotPlot.dottedLineOpacity}
                            onChange={(_, data) => updatePlotSpecificProperty('dotPlot', 'dottedLineOpacity', data.value)}
                          />
                        </Field>
                        <Field label="Dotted Line Color">
                          <Input
                            type="color"
                            value={plotProps.dotPlot.dottedLineColor || '#999999'}
                            onChange={(_, data) => updatePlotSpecificProperty('dotPlot', 'dottedLineColor', data.value)}
                            style={{ width: '100%', height: '40px' }}
                          />
                        </Field>
                      </>
                    )}

                    {/* Regression Properties */}
                    {currentPlotType === 'regression' && plotProps.regression && (
                      <>
                        <Field label={`Line Width: ${plotProps.regression.lineWidth}`}>
                          <Slider 
                            min={1} 
                            max={10} 
                            value={plotProps.regression.lineWidth}
                            onChange={(_, data) => updatePlotSpecificProperty('regression', 'lineWidth', data.value)}
                          />
                        </Field>
                        
                        <Field label={`Line Opacity: ${(plotProps.regression.lineOpacity * 100).toFixed(0)}%`}>
                          <Slider 
                            min={0.1} 
                            max={1} 
                            step={0.1}
                            value={plotProps.regression.lineOpacity}
                            onChange={(_, data) => updatePlotSpecificProperty('regression', 'lineOpacity', data.value)}
                          />
                        </Field>
                        
                        <Field label="Line Color">
                          <Input
                            type="color"
                            value={plotProps.regression.lineColor}
                            onChange={(_, data) => updatePlotSpecificProperty('regression', 'lineColor', data.value)}
                            style={{ width: '100%', height: '40px' }}
                          />
                        </Field>
                        
                        <Field label="Show Confidence Interval">
                          <Switch 
                            checked={plotProps.regression.showConfidenceInterval}
                            onChange={(_, data) => updatePlotSpecificProperty('regression', 'showConfidenceInterval', data.checked)}
                          />
                        </Field>
                        
                        <Field label={`Confidence Interval Opacity: ${(plotProps.regression.confidenceIntervalOpacity * 100).toFixed(0)}%`}>
                          <Slider 
                            min={0.1} 
                            max={1} 
                            step={0.1}
                            value={plotProps.regression.confidenceIntervalOpacity}
                            onChange={(_, data) => updatePlotSpecificProperty('regression', 'confidenceIntervalOpacity', data.value)}
                          />
                        </Field>
                      </>
                    )}
                  </div>
                </AccordionPanel>
              </AccordionItem>
            )}

            {/* Export Section */}
            <AccordionItem value="export">
              <AccordionHeader>
                <div className={classes.accordionHeader}>
                  <MdSettings size={20} />
                  <Text weight="semibold">Export</Text>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <div className={classes.propertyContent}>
                  <Field label={`Image Quality: ${globalProps.imageQuality}`}>
                    <Slider 
                      min={72} 
                      max={300} 
                      value={globalProps.imageQuality}
                      onChange={(_, data) => updateGraphProperty('imageQuality', data.value)}
                    />
                  </Field>
                  
                  <Field label="Image Format">
                    <Input 
                      value={globalProps.imageFormat}
                      onChange={(_, data) => updateGraphProperty('imageFormat', data.value)}
                    />
                  </Field>
                  
                  <Field label={`DPI: ${globalProps.dpi}`}>
                    <Slider 
                      min={72} 
                      max={600} 
                      value={globalProps.dpi}
                      onChange={(_, data) => updateGraphProperty('dpi', data.value)}
                    />
                  </Field>
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
          {/* Bottom spacer so you can scroll into empty space even when collapsed */}
          <div style={{ height: 160 }} />
        </div>
      </DrawerBody>
    </InlineDrawer>
  );
};

export const GraphProperties = memo(GraphPropertiesComponent);
