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
  resetAllProperties: () => void;
  updateGraphProperty: <K extends keyof GlobalGraphProperties>(key: K, value: GlobalGraphProperties[K]) => void;
  updatePlotSpecificProperty: <T extends keyof PlotSpecificProperties>(plotType: T, key: keyof NonNullable<PlotSpecificProperties[T]>, value: any) => void;
  updateLegendTextEntry: (originalLabel: string, newText: string) => void;
  updateLegendSeriesColor: (label: string, color: string) => void;
  getCurrentPlotType: (subType?: string) => keyof PlotSpecificProperties | null;
  currentSubType?: string;
  currentLegendLabels?: string[]; // Current legend labels from the graph
}

const GraphPropertiesComponent: FC<{ properties: IGraphProperties }> = ({
  properties,
}) => {
  const classes = useGraphPropertiesClasses();
  const { t } = useTranslation('graphProperties');
  const { graphProperties, resetAllProperties, updateGraphProperty, updatePlotSpecificProperty, updateLegendTextEntry, updateLegendSeriesColor, getCurrentPlotType, currentSubType, currentLegendLabels } = properties;
  
  const currentPlotType = getCurrentPlotType(currentSubType);
  const globalProps = graphProperties.global;
  const gridDisabled = !globalProps.showGridLines;
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
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button appearance="secondary" onClick={resetAllProperties}>Reset Default</Button>
        </div>
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
                    <input
                      type="color"
                      value={globalProps.backgroundColor}
                      onChange={(e) => updateGraphProperty('backgroundColor', e.target.value)}
                      style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                    />
                  </Field>
                  <Field label={`Background Transparency: ${globalProps.backgroundTransparencyPct || 0}%`}>
                    <Slider min={0} max={100} value={globalProps.backgroundTransparencyPct || 0} onChange={(_, d) => updateGraphProperty('backgroundTransparencyPct', d.value)} />
                  </Field>
                  <Field label="Plot Color">
                    <input
                      type="color"
                      value={globalProps.plotColor || '#ffffff'}
                      onChange={(e) => updateGraphProperty('plotColor', e.target.value)}
                      style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                    />
                  </Field>
                  <Field label={`Plot Transparency: ${globalProps.plotTransparencyPct || 0}%`}>
                    <Slider min={0} max={100} value={globalProps.plotTransparencyPct || 0} onChange={(_, d) => updateGraphProperty('plotTransparencyPct', d.value)} />
                  </Field>
                  <Field label="Series Color (points/lines)">
                    <input
                      type="color"
                      value={globalProps.seriesColor || '#1f77b4'}
                      onChange={(e) => updateGraphProperty('seriesColor', e.target.value)}
                      style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
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

            {/* Legend Items Section */}
            <AccordionItem value="legendItems">
              <AccordionHeader>
                <div className={classes.accordionHeader}>
                  <MdSettings size={20} />
                  <Text weight="semibold">Legend Items</Text>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <div className={classes.propertyContent}>
                  <Card>
                    <CardHeader>
                      <Text weight="semibold">Legend Items Settings</Text>
                    </CardHeader>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <Field label="Editable Legend Text">
                    <Switch 
                          checked={globalProps.editableLegendText}
                          onChange={(_, data) => updateGraphProperty('editableLegendText', data.checked)}
                        />
                      </Field>
                      
                      {/* Show legend text editing when enabled and legend labels are available */}
                      {globalProps.editableLegendText && currentLegendLabels && currentLegendLabels.length > 0 && (
                        <Card>
                          <CardHeader>
                            <Text weight="semibold">Legend Text & Colors</Text>
                          </CardHeader>
                          <div style={{ display: 'grid', gap: 8 }}>
                            {currentLegendLabels.map((originalLabel, index) => (
                              <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 120px', alignItems: 'center', gap: 8 }}>
                                <Field label={`Entry ${index + 1}`}>
                                  <Input 
                                    value={globalProps.legendTextEntries[originalLabel] || originalLabel}
                                    onChange={(_, data) => updateLegendTextEntry(originalLabel, data.value)}
                                    placeholder={originalLabel}
                                  />
                                </Field>
                                <div>
                                  <input
                                    aria-label={`Color for ${originalLabel}`}
                                    type="color"
                                    value={globalProps.legendSeriesColors[originalLabel] || ''}
                                    onChange={(e) => updateLegendSeriesColor(originalLabel, e.target.value)}
                                    style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}
                      
                      {/* Show message when no legend labels are available */}
                      {globalProps.editableLegendText && (!currentLegendLabels || currentLegendLabels.length === 0) && (
                        <Card>
                          <CardHeader>
                            <Text weight="semibold">Legend Text Entries</Text>
                          </CardHeader>
                          <div style={{ padding: '12px' }}>
                            <Text size={200} style={{ color: 'rgba(0,0,0,0.6)', fontStyle: 'italic' }}>
                              No legend labels detected. Create a graph first to see legend entries.
                            </Text>
                          </div>
                        </Card>
                      )}
                      
                      <Field label="Symbol Placement">
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button 
                            appearance={globalProps.symbolPlacement === 'before' ? 'primary' : 'secondary'}
                            onClick={() => updateGraphProperty('symbolPlacement', 'before')}
                          >Before Text</Button>
                          <Button 
                            appearance={globalProps.symbolPlacement === 'after' ? 'primary' : 'secondary'}
                            onClick={() => updateGraphProperty('symbolPlacement', 'after')}
                          >After Text</Button>
                        </div>
                      </Field>
                      
                      <Field label="Style">
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button 
                            appearance={globalProps.legendStyle === 'rectangle' ? 'primary' : 'secondary'}
                            onClick={() => updateGraphProperty('legendStyle', 'rectangle')}
                          >Rectangle Only</Button>
                        </div>
                      </Field>
                      
                      <Field label={`Width: ${globalProps.legendWidth}px`}>
                        <Slider 
                          min={100} 
                          max={500} 
                          value={globalProps.legendWidth}
                          onChange={(_, data) => updateGraphProperty('legendWidth', data.value)}
                        />
                      </Field>
                      
                      <Field label={`Height: ${globalProps.legendHeight}px`}>
                        <Slider 
                          min={50} 
                          max={300} 
                          value={globalProps.legendHeight}
                          onChange={(_, data) => updateGraphProperty('legendHeight', data.value)}
                    />
                  </Field>
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
                          <input
                            type="color"
                            value={plotProps.scatter.pointColor || '#1f77b4'}
                            onChange={(e) => updatePlotSpecificProperty('scatter', 'pointColor', e.target.value)}
                            style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
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
                          <input
                            type="color"
                            value={plotProps.pointPlot.pointBorderColor}
                            onChange={(e) => updatePlotSpecificProperty('pointPlot', 'pointBorderColor', e.target.value)}
                            style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
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
                          <input
                            type="color"
                            value={plotProps.dotPlot.dottedLineColor || '#999999'}
                            onChange={(e) => updatePlotSpecificProperty('dotPlot', 'dottedLineColor', e.target.value)}
                            style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
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
                          <input
                            type="color"
                            value={plotProps.regression.lineColor}
                            onChange={(e) => updatePlotSpecificProperty('regression', 'lineColor', e.target.value)}
                            style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
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

            {/* Grid Settings */}
            <AccordionItem value="gridSettings">
              <AccordionHeader>
                <div className={classes.accordionHeader}>
                  <MdSettings size={20} />
                  <Text weight="semibold">Grid Settings</Text>
                  {gridDisabled && (
                    <Text size={200} style={{ marginLeft: 'auto', color: 'rgba(0,0,0,0.6)' }}>
                      (Disabled: turn on Grid Lines in General Settings)
                    </Text>
                  )}
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <div className={classes.propertyContent} style={{ opacity: gridDisabled ? 0.5 : 1, pointerEvents: gridDisabled ? 'none' : 'auto' }}>
                  <Card>
                    <CardHeader>
                      <Text weight="semibold">Grid Lines</Text>
                    </CardHeader>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <Field label="Plane Selection">
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button appearance={globalProps.gridPlane === 'xy2d' ? 'primary' : 'secondary'} onClick={() => updateGraphProperty('gridPlane', 'xy2d')}>XY Plane 2D</Button>
                        </div>
                      </Field>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                        {([
                          { key: 'gridXMajor', label: 'X Major' },
                          { key: 'gridYMajor', label: 'Y Major' },
                          { key: 'gridXMinor', label: 'X Minor' },
                          { key: 'gridYMinor', label: 'Y Minor' },
                        ] as const).map((opt) => (
                          <Field key={opt.key} label={opt.label}>
                            <Button
                              appearance={(globalProps as any)[opt.key] ? 'primary' : 'secondary'}
                              onClick={() => {
                                // radio-like behavior: one selection at a time
                                updateGraphProperty('gridXMajor', opt.key === 'gridXMajor');
                                updateGraphProperty('gridYMajor', opt.key === 'gridYMajor');
                                updateGraphProperty('gridXMinor', opt.key === 'gridXMinor');
                                updateGraphProperty('gridYMinor', opt.key === 'gridYMinor');
                              }}
                            >
                              {(globalProps as any)[opt.key] ? 'Selected' : 'Select'}
                            </Button>
                          </Field>
                        ))}
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Text weight="semibold">Line Properties</Text>
                    </CardHeader>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <Field label="Style">
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {(['none','solid','dashed','dotted'] as const).map((s) => (
                            <Button key={s} appearance={globalProps.gridLineStyle === s ? 'primary' : 'secondary'} onClick={() => updateGraphProperty('gridLineStyle', s)}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </Field>
                      <Field label={`Thickness (inch): ${globalProps.gridThicknessInch.toFixed(3)}`}>
                        <Slider min={0} max={0.1} step={0.001} value={globalProps.gridThicknessInch} onChange={(_, d) => updateGraphProperty('gridThicknessInch', d.value)} />
                      </Field>
                      <Field label="Color">
                        <input type="color" value={globalProps.gridColor} onChange={(e) => updateGraphProperty('gridColor', e.target.value)} style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }} />
                      </Field>
                      <Field label="Gap Color">
                        <input type="color" value={globalProps.gridGapColor} onChange={(e) => updateGraphProperty('gridGapColor', e.target.value)} style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }} />
                      </Field>
                      <Field label={`Transparency: ${globalProps.gridTransparencyPct}%`}>
                        <Slider min={0} max={100} value={globalProps.gridTransparencyPct} onChange={(_, d) => updateGraphProperty('gridTransparencyPct', d.value)} />
                      </Field>
                      <Field label="Layering">
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button appearance={globalProps.gridLayering === 'gridFront' ? 'primary' : 'secondary'} onClick={() => updateGraphProperty('gridLayering', 'gridFront')}>Grid in Front</Button>
                          <Button appearance={globalProps.gridLayering === 'plotFront' ? 'primary' : 'secondary'} onClick={() => updateGraphProperty('gridLayering', 'plotFront')}>Plot in Front</Button>
                        </div>
                      </Field>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          appearance="secondary"
                          onClick={() => {
                            updateGraphProperty('gridPlane', 'xy2d');
                            updateGraphProperty('gridXMajor', true);
                            updateGraphProperty('gridYMajor', true);
                            updateGraphProperty('gridXMinor', false);
                            updateGraphProperty('gridYMinor', false);
                            updateGraphProperty('gridLineStyle', 'solid');
                            updateGraphProperty('gridThicknessInch', 0.01);
                            updateGraphProperty('gridColor', '#e5e5e5');
                            updateGraphProperty('gridGapColor', '#ffffff');
                            updateGraphProperty('gridTransparencyPct', 0);
                            updateGraphProperty('gridLayering', 'plotFront');
                          }}
                        >Reset</Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </AccordionPanel>
            </AccordionItem>

            {/* Axis Lines */}
            <AccordionItem value="axisLines">
              <AccordionHeader>
                <div className={classes.accordionHeader}>
                  <MdSettings size={20} />
                  <Text weight="semibold">Axis Lines</Text>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <div className={classes.propertyContent}>
                  <Card>
                    <CardHeader>
                      <Text weight="semibold">Placement Options</Text>
                    </CardHeader>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Button appearance={globalProps.yAxisSide === 'left' ? 'primary' : 'secondary'} onClick={() => updateGraphProperty('yAxisSide', 'left')}>Left Axis</Button>
                      <Button appearance={globalProps.yAxisSide === 'right' ? 'primary' : 'secondary'} onClick={() => updateGraphProperty('yAxisSide', 'right')}>Right Axis</Button>
                    </div>
                  </Card>
                  <Card>
                    <CardHeader>
                      <Text weight="semibold">Line Properties</Text>
                    </CardHeader>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <Field label="Color">
                        <input type="color" value={globalProps.axisLineColor} onChange={(e) => updateGraphProperty('axisLineColor', e.target.value)} style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }} />
                      </Field>
                      <Field label={`Thickness (inch): ${globalProps.axisLineThicknessInch.toFixed(3)}`}>
                        <Slider min={0.001} max={0.1} step={0.001} value={globalProps.axisLineThicknessInch} onChange={(_, d) => updateGraphProperty('axisLineThicknessInch', d.value)} />
                      </Field>
                      <Field label={`Transparency: ${globalProps.axisLineTransparencyPct}%`}>
                        <Slider min={0} max={100} value={globalProps.axisLineTransparencyPct} onChange={(_, d) => updateGraphProperty('axisLineTransparencyPct', d.value)} />
                      </Field>
                    </div>
                  </Card>
                </div>
              </AccordionPanel>
            </AccordionItem>

            {/* Scaling Options */}
            <AccordionItem value="scalingOptions">
              <AccordionHeader>
                <div className={classes.accordionHeader}>
                  <MdSettings size={20} />
                  <Text weight="semibold">Scaling Options</Text>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <div className={classes.propertyContent}>
                  <Card>
                    <CardHeader>
                      <Text weight="semibold">Scale Type</Text>
                    </CardHeader>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <Field label="Scale Type (applies to both X and Y)">
                        <select
                          value={globalProps.xScaleType}
                          onChange={(e) => {
                            const v = e.target.value as any;
                            updateGraphProperty('xScaleType', v);
                            updateGraphProperty('yScaleType', v);
                          }}
                          style={{ width: '100%', height: 36 }}
                        >
                          <option value="linear">Linear</option>
                          <option value="log10">Log (Common)</option>
                          <option value="loge">Log (Natural)</option>
                          <option value="probability">Probability</option>
                          <option value="probit">Probit</option>
                          <option value="logit">Logit</option>
                          <option value="category">Category</option>
                          <option value="datetime">Date & Time</option>
                          <option value="weibull">Weibull</option>
                          <option value="reciprocal">Reciprocal</option>
                        </select>
                      </Field>
                    </div>
                  </Card>
                  <Card>
                    <CardHeader>
                      <Text weight="semibold">Range</Text>
                    </CardHeader>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Start">
                          <Input type="number" value={(globalProps.xRangeStart ?? '') as any} onChange={(_, d) => { updateGraphProperty('xRangeStart', Number(d.value)); updateGraphProperty('yRangeStart', Number(d.value)); }} />
                        </Field>
                        <Field label="Calculation">
                          <select
                            value={globalProps.xRangeStartMode}
                            onChange={(e) => { const v = e.target.value as any; updateGraphProperty('xRangeStartMode', v); updateGraphProperty('yRangeStartMode', v); }}
                            style={{ width: '100%', height: 36 }}
                          >
                            <option value="constant">Constant</option>
                            <option value="data">Data Range</option>
                          </select>
                        </Field>
                        <Field label="End">
                          <Input type="number" value={(globalProps.xRangeEnd ?? '') as any} onChange={(_, d) => { updateGraphProperty('xRangeEnd', Number(d.value)); updateGraphProperty('yRangeEnd', Number(d.value)); }} />
                        </Field>
                        <Field label="Calculation">
                          <select
                            value={globalProps.xRangeEndMode}
                            onChange={(e) => { const v = e.target.value as any; updateGraphProperty('xRangeEndMode', v); updateGraphProperty('yRangeEndMode', v); }}
                            style={{ width: '100%,', height: 36 }}
                          >
                            <option value="constant">Constant</option>
                            <option value="data">Data Range</option>
                          </select>
                        </Field>
                        <div style={{ gridColumn: '1 / span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <Field label="Pad 5%">
                            <Switch checked={globalProps.xPad5 || globalProps.yPad5} onChange={(_, d) => { updateGraphProperty('xPad5', d.checked); updateGraphProperty('yPad5', d.checked); }} />
                          </Field>
                          <Field label="Nearest Tick">
                            <Switch checked={globalProps.xNearestTick || globalProps.yNearestTick} onChange={(_, d) => { updateGraphProperty('xNearestTick', d.checked); updateGraphProperty('yNearestTick', d.checked); }} />
                          </Field>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </AccordionPanel>
            </AccordionItem>

            {/* Major Tick Labels */}
            <AccordionItem value="majorTicks">
              <AccordionHeader>
                <div className={classes.accordionHeader}>
                  <MdSettings size={20} />
                  <Text weight="semibold">Major Tick Labels</Text>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <div className={classes.propertyContent}>
                  <Card>
                    <CardHeader>
                      <Text weight="semibold">Visibility</Text>
                    </CardHeader>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button appearance={globalProps.majorTickShowLeft ? 'primary' : 'secondary'} onClick={() => updateGraphProperty('majorTickShowLeft', !globalProps.majorTickShowLeft)}>Left</Button>
                      <Button appearance={globalProps.majorTickShowRight ? 'primary' : 'secondary'} onClick={() => updateGraphProperty('majorTickShowRight', !globalProps.majorTickShowRight)}>Right</Button>
                    </div>
                  </Card>
                  <Card>
                    <CardHeader>
                      <Text weight="semibold">Formatting</Text>
                    </CardHeader>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <Field label="Prefix"><Input value={globalProps.majorTickPrefix} onChange={(_, d) => updateGraphProperty('majorTickPrefix', d.value)} /></Field>
                      <Field label="Suffix"><Input value={globalProps.majorTickSuffix} onChange={(_, d) => updateGraphProperty('majorTickSuffix', d.value)} /></Field>
                      <Field label="Numeric Type">
                        <select value={globalProps.majorTickNumericType} onChange={(e) => updateGraphProperty('majorTickNumericType', e.target.value as any)} style={{ width: '100%', height: 36 }}>
                          <option value="number">Number</option>
                          <option value="percent">Percent</option>
                          <option value="scientific">Scientific</option>
                          <option value="engineering">Engineering</option>
                        </select>
                      </Field>
                      <Field label="Notation">
                        <select value={globalProps.majorTickExponentFormat} onChange={(e) => updateGraphProperty('majorTickExponentFormat', e.target.value as any)} style={{ width: '100%', height: 36 }}>
                          <option value="e">Scientific (e)</option>
                          <option value="SI">Engineering (SI)</option>
                          <option value="power">Power</option>
                        </select>
                      </Field>
                      <Field label="Precision">
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button appearance={globalProps.majorTickPrecisionMode === 'auto' ? 'primary' : 'secondary'} onClick={() => updateGraphProperty('majorTickPrecisionMode', 'auto')}>Automatic</Button>
                          <Button appearance={globalProps.majorTickPrecisionMode === 'manual' ? 'primary' : 'secondary'} onClick={() => updateGraphProperty('majorTickPrecisionMode', 'manual')}>Manual</Button>
                        </div>
                        {globalProps.majorTickPrecisionMode === 'manual' && (
                          <Slider min={0} max={15} value={globalProps.majorTickPrecision} onChange={(_, d) => updateGraphProperty('majorTickPrecision', d.value)} />
                        )}
                      </Field>
                      <Field label="Factor Out">
                        <select value={globalProps.majorTickFactor} onChange={(e) => updateGraphProperty('majorTickFactor', e.target.value as any)} style={{ width: '100%', height: 36 }}>
                          {['1e-4','1e-3','0.1','1','10'].map(f => (<option key={f} value={f}>{f}</option>))}
                        </select>
                      </Field>
                    </div>
                  </Card>
                </div>
              </AccordionPanel>
            </AccordionItem>

            {/* Minor Tick Labels */}
            <AccordionItem value="minorTicks">
              <AccordionHeader>
                <div className={classes.accordionHeader}>
                  <MdSettings size={20} />
                  <Text weight="semibold">Minor Tick Labels</Text>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <div className={classes.propertyContent}>
                  <Card>
                    <CardHeader>
                      <Text weight="semibold">Visibility</Text>
                    </CardHeader>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button appearance={globalProps.minorTickShowLeft ? 'primary' : 'secondary'} onClick={() => updateGraphProperty('minorTickShowLeft', !globalProps.minorTickShowLeft)}>Left</Button>
                      <Button appearance={globalProps.minorTickShowRight ? 'primary' : 'secondary'} onClick={() => updateGraphProperty('minorTickShowRight', !globalProps.minorTickShowRight)}>Right</Button>
                    </div>
                  </Card>
                  <Card>
                    <CardHeader>
                      <Text weight="semibold">Formatting</Text>
                    </CardHeader>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <Field label="Prefix"><Input value={globalProps.minorTickPrefix} onChange={(_, d) => updateGraphProperty('minorTickPrefix', d.value)} /></Field>
                      <Field label="Suffix"><Input value={globalProps.minorTickSuffix} onChange={(_, d) => updateGraphProperty('minorTickSuffix', d.value)} /></Field>
                      <Field label="Numeric Type">
                        <select value={globalProps.minorTickNumericType} onChange={(e) => updateGraphProperty('minorTickNumericType', e.target.value as any)} style={{ width: '100%', height: 36 }}>
                          <option value="number">Number</option>
                          <option value="percent">Percent</option>
                          <option value="scientific">Scientific</option>
                          <option value="engineering">Engineering</option>
                        </select>
                      </Field>
                      <Field label="Notation">
                        <select value={globalProps.minorTickExponentFormat} onChange={(e) => updateGraphProperty('minorTickExponentFormat', e.target.value as any)} style={{ width: '100%', height: 36 }}>
                          <option value="e">Scientific (e)</option>
                          <option value="SI">Engineering (SI)</option>
                          <option value="power">Power</option>
                        </select>
                      </Field>
                      <Field label="Precision">
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button appearance={globalProps.minorTickPrecisionMode === 'auto' ? 'primary' : 'secondary'} onClick={() => updateGraphProperty('minorTickPrecisionMode', 'auto')}>Automatic</Button>
                          <Button appearance={globalProps.minorTickPrecisionMode === 'manual' ? 'primary' : 'secondary'} onClick={() => updateGraphProperty('minorTickPrecisionMode', 'manual')}>Manual</Button>
                        </div>
                        {globalProps.minorTickPrecisionMode === 'manual' && (
                          <Slider min={0} max={15} value={globalProps.minorTickPrecision} onChange={(_, d) => updateGraphProperty('minorTickPrecision', d.value)} />
                        )}
                      </Field>
                      <Field label="Factor Out">
                        <select value={globalProps.minorTickFactor} onChange={(e) => updateGraphProperty('minorTickFactor', e.target.value as any)} style={{ width: '100%', height: 36 }}>
                          {['1e-4','1e-3','0.1','1','10'].map(f => (<option key={f} value={f}>{f}</option>))}
                        </select>
                      </Field>
                    </div>
                  </Card>
                </div>
              </AccordionPanel>
            </AccordionItem>

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
