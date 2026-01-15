import { FC, memo, useEffect, useRef, useState } from 'react';
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
  Card,
  CardHeader,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Dropdown,
  Option,
} from '@fluentui/react-components';

import { useGraphPropertiesClasses } from '../../styles/use-graph-properties-style';
import { IoCloseOutline } from 'react-icons/io5';
import { MdSettings, MdPalette, MdVisibility, MdScatterPlot, MdError, MdTrendingUp, MdRefresh } from 'react-icons/md';
import { GraphProperties as GraphPropertiesType, GlobalGraphProperties, PlotSpecificProperties } from '../../hooks/use-tools';
import { DataFormatPropertiesPanel } from '../../components/DataFormatPropertiesPanel';
import { DataFormatProperties, createDataFormatProperties, getSeriesLabels } from '../../utils/dataFormatProperties';
import { COLOR_SCALE_DEFINITIONS, getColorScaleCSS } from '../../utils/mesh3DProperties';

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
  getDetectedPlotFeatures: (subType?: string) => {
    hasScatter: boolean;
    hasRegression: boolean;
    hasErrorBars: boolean;
    hasPointPlot: boolean;
    hasDotPlot: boolean;
    is3DMesh: boolean;
  };
  currentSubType?: string;
  // Add graphConfig for 3D mesh properties synchronization
  graphConfig?: any;
  currentLegendLabels?: string[]; // Current legend labels from the graph
  currentDataFormat?: string; // Current data format
  currentVariables?: { xNames: string[]; yNames: string[]; categoryNames: string[] }; // Current variables
}

const GraphPropertiesComponent: FC<{ properties: IGraphProperties }> = ({
  properties,
}) => {
  const classes = useGraphPropertiesClasses();
  const { graphProperties, resetAllProperties, updateGraphProperty, updatePlotSpecificProperty, updateLegendTextEntry, updateLegendSeriesColor, getCurrentPlotType, getDetectedPlotFeatures, currentSubType, currentLegendLabels, currentDataFormat, currentVariables, graphConfig } = properties;

  const currentPlotType = getCurrentPlotType(currentSubType);
  const detectedFeatures = getDetectedPlotFeatures(currentSubType);
  const globalProps = graphProperties.global;
  const gridDisabled = !globalProps.showGridLines;
  const plotProps = graphProperties.plotSpecific;


  const [drawerWidth, setDrawerWidth] = useState<number>(340);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Data format properties state
  const [dataFormatProperties, setDataFormatProperties] = useState<DataFormatProperties | null>(null);

  // Track if 3D mesh properties have been initialized to prevent overriding user changes
  const [mesh3dInitialized, setMesh3dInitialized] = useState(false);

  // Reset initialization flag when graph changes
  useEffect(() => {
    setMesh3dInitialized(false);
  }, [graphConfig]);

  // Initialize 3D mesh properties from graphConfig if available (only once)
  useEffect(() => {
    if (graphConfig && detectedFeatures.is3DMesh && !mesh3dInitialized) {
      // Extract 3D mesh properties from graph config
      const mesh3dFromConfig = {
        surfaceType: graphConfig.surfaceType || graphConfig.meshConfig?.surfaceType,
        opacity: graphConfig.opacity || graphConfig.meshConfig?.opacity,
        colorScale: graphConfig.colorScale || graphConfig.meshConfig?.colorScale,
        showContours: graphConfig.showContours || graphConfig.meshConfig?.showContours,
        contourOpacity: graphConfig.contourOpacity || graphConfig.meshConfig?.contourOpacity,
        lighting: graphConfig.lighting || graphConfig.meshConfig?.lighting,
        smoothShading: graphConfig.smoothShading || graphConfig.meshConfig?.smoothShading,
        showGrid: graphConfig.showGrid || graphConfig.meshConfig?.showGrid,
        gridOpacity: graphConfig.gridOpacity || graphConfig.meshConfig?.gridOpacity
      };

      // Update properties only if they are undefined (not yet set)
      Object.entries(mesh3dFromConfig).forEach(([key, value]) => {
        if (value !== undefined && plotProps.mesh3d?.[key as keyof typeof mesh3dFromConfig] === undefined) {
          updatePlotSpecificProperty('mesh3d', key as keyof typeof mesh3dFromConfig, value);
        }
      });

      setMesh3dInitialized(true);
    }
  }, [graphConfig, detectedFeatures.is3DMesh, updatePlotSpecificProperty, mesh3dInitialized]);

  // Create series labels based on current data format and variables
  const seriesLabels = currentDataFormat && currentVariables ?
    getSeriesLabels(currentDataFormat, currentVariables.xNames, currentVariables.yNames, currentVariables.categoryNames) :
    [];

  // Initialize data format properties when data format or variables change
  useEffect(() => {
    if (currentDataFormat && currentVariables && seriesLabels.length > 0) {
      const newProperties = createDataFormatProperties(currentDataFormat, seriesLabels);
      setDataFormatProperties(newProperties);
    }
  }, [currentDataFormat, currentVariables, seriesLabels.join(',')]);
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
                      {/* Show Z axis input for 3D graphs */}
                      {detectedFeatures.is3DMesh && (
                        <Field label="Axis (Z data)">
                          <Input
                            value={globalProps.axisZData || ''}
                            onChange={(_, data) => updateGraphProperty('axisZData', data.value)}
                          />
                        </Field>
                      )}
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
                      <Field label={`Box Spacing (inch): ${(globalProps.legendBoxSpacingInch || 0.25).toFixed(2)}`}>
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


                    </div>
                  </Card>
                </div>
              </AccordionPanel>
            </AccordionItem>



            {/* 3D Mesh Properties Section */}
            {detectedFeatures.is3DMesh && (
              <AccordionItem value="mesh3d">
                <AccordionHeader>
                  <div className={classes.accordionHeader}>
                    <MdScatterPlot size={20} />
                    <Text weight="semibold">3D Mesh Properties</Text>
                    <Text size={200} style={{ marginLeft: 'auto', color: 'rgba(0,0,0,0.6)' }}>
                      (3D Visualization Settings)
                    </Text>
                  </div>
                </AccordionHeader>
                <AccordionPanel>
                  <div className={classes.propertyContent}>
                    <Card style={{ marginBottom: '16px' }}>
                      <CardHeader>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <Text weight="semibold">Surface Configuration</Text>
                          <Button
                            appearance="secondary"
                            size="small"
                            icon={<MdRefresh />}
                            onClick={() => {
                              // Reset all 3D mesh properties to defaults
                              updatePlotSpecificProperty('mesh3d', 'surfaceType', 'surface');
                              updatePlotSpecificProperty('mesh3d', 'opacity', 1.0);
                              updatePlotSpecificProperty('mesh3d', 'colorScale', 'viridis');
                              updatePlotSpecificProperty('mesh3d', 'showContours', true);
                              updatePlotSpecificProperty('mesh3d', 'contourOpacity', 0.6);
                              updatePlotSpecificProperty('mesh3d', 'lighting', true);
                              updatePlotSpecificProperty('mesh3d', 'smoothShading', true);
                              updatePlotSpecificProperty('mesh3d', 'showGrid', true);
                              updatePlotSpecificProperty('mesh3d', 'gridOpacity', 0.5);
                            }}
                          >
                            Reset Default
                          </Button>
                        </div>
                      </CardHeader>
                      <div style={{ padding: '12px', display: 'grid', gap: '12px' }}>

                        {/* Surface Type */}
                        <Field label="Surface Type">
                          <Dropdown
                            value={plotProps.mesh3d?.surfaceType || 'mesh'}
                            onOptionSelect={(_, data) => updatePlotSpecificProperty('mesh3d', 'surfaceType', data.optionValue)}
                          >
                            <Option value="mesh">Mesh</Option>
                            <Option value="surface">Surface</Option>
                            <Option value="wireframe">Wireframe</Option>
                          </Dropdown>
                        </Field>

                        {/* Opacity */}
                        <Field label={`Opacity: ${Math.round((plotProps.mesh3d?.opacity || 1.0) * 100)}%`}>
                          <Slider
                            min={0}
                            max={1}
                            step={0.1}
                            value={plotProps.mesh3d?.opacity || 1.0}
                            onChange={(_, data) => updatePlotSpecificProperty('mesh3d', 'opacity', data.value)}
                          />
                        </Field>

                        {/* Color Scale */}
                        <Field label="Color Scale">
                          <Dropdown
                            value={plotProps.mesh3d?.colorScale ? (plotProps.mesh3d.colorScale.charAt(0).toUpperCase() + plotProps.mesh3d.colorScale.slice(1)) : 'Viridis'}
                            onOptionSelect={(_, data) => updatePlotSpecificProperty('mesh3d', 'colorScale', data.optionValue)}
                            style={{ minWidth: '100%' }}
                          >
                            {Object.keys(COLOR_SCALE_DEFINITIONS).map((scaleName) => (
                              <Option key={scaleName} value={scaleName} text={scaleName}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
                                  <span style={{ textTransform: 'capitalize' }}>{scaleName}</span>
                                  <div
                                    style={{
                                      width: '80px',
                                      height: '12px',
                                      background: getColorScaleCSS(scaleName),
                                      borderRadius: '2px',
                                      border: '1px solid rgba(0,0,0,0.1)'
                                    }}
                                  />
                                </div>
                              </Option>
                            ))}
                          </Dropdown>
                        </Field>

                        {/* Show Contours */}
                        <Field label="Show Contours">
                          <Switch
                            checked={plotProps.mesh3d?.showContours ?? true}
                            onChange={(_, data) => updatePlotSpecificProperty('mesh3d', 'showContours', data.checked)}
                          />
                        </Field>

                        {/* Contour Opacity */}
                        {(plotProps.mesh3d?.showContours ?? true) && (
                          <Field label={`Contour Opacity: ${Math.round((plotProps.mesh3d?.contourOpacity || 0.6) * 100)}%`}>
                            <Slider
                              min={0}
                              max={1}
                              step={0.1}
                              value={plotProps.mesh3d?.contourOpacity || 0.6}
                              onChange={(_, data) => updatePlotSpecificProperty('mesh3d', 'contourOpacity', data.value)}
                            />
                          </Field>
                        )}

                        {/* Lighting */}
                        <Field label="Lighting">
                          <Switch
                            checked={plotProps.mesh3d?.lighting ?? true}
                            onChange={(_, data) => updatePlotSpecificProperty('mesh3d', 'lighting', data.checked)}
                          />
                        </Field>

                        {/* Smooth Shading */}
                        <Field label="Smooth Shading">
                          <Switch
                            checked={plotProps.mesh3d?.smoothShading ?? true}
                            onChange={(_, data) => updatePlotSpecificProperty('mesh3d', 'smoothShading', data.checked)}
                          />
                        </Field>

                        {/* Show Grid */}
                        <Field label="Show 3D Grid">
                          <Switch
                            checked={plotProps.mesh3d?.showGrid ?? true}
                            onChange={(_, data) => updatePlotSpecificProperty('mesh3d', 'showGrid', data.checked)}
                          />
                        </Field>

                        {/* Grid Opacity */}
                        {(plotProps.mesh3d?.showGrid ?? true) && (
                          <Field label={`Grid Opacity: ${Math.round((plotProps.mesh3d?.gridOpacity || 0.5) * 100)}%`}>
                            <Slider
                              min={0}
                              max={1}
                              step={0.1}
                              value={plotProps.mesh3d?.gridOpacity || 0.5}
                              onChange={(_, data) => updatePlotSpecificProperty('mesh3d', 'gridOpacity', data.value)}
                            />
                          </Field>
                        )}

                      </div>
                    </Card>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            )}

            {/* Plot-Specific Properties Section */}
            {!detectedFeatures.is3DMesh && (
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
                      {!currentPlotType && 'Plot Properties'}
                    </Text>
                    <Text size={200} style={{ marginLeft: 'auto', color: 'rgba(0,0,0,0.6)' }}>
                      (Current plot only)
                    </Text>
                  </div>
                </AccordionHeader>
                <AccordionPanel>
                  <div className={classes.propertyContent}>
                    {/* Scatter Plot Properties */}
                    {(detectedFeatures.hasScatter || currentPlotType === 'scatter') && plotProps.scatter && (
                      <>
                        <Card style={{ marginBottom: '16px' }}>
                          <CardHeader>
                            <Text weight="semibold">Scatter Points</Text>
                          </CardHeader>
                          <div style={{ padding: '12px' }}>
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
                          </div>
                        </Card>
                      </>
                    )}

                    {/* Error Bar Properties */}
                    {(detectedFeatures.hasErrorBars || currentPlotType === 'errorBar') && plotProps.errorBar && (
                      <>
                        <Field label={`Error Bar Opacity: ${(plotProps.errorBar.errorBarOpacity * 100).toFixed(0)}%`}>
                          <Slider
                            min={0.1}
                            max={1}
                            step={0.1}
                            value={plotProps.errorBar.errorBarOpacity}
                            onChange={(_, data) => updatePlotSpecificProperty('errorBar', 'errorBarOpacity', data.value)}
                          />
                        </Field>

                        <Field label="Error Bar Color">
                          <input
                            type="color"
                            value={plotProps.errorBar.errorBarColor || '#1f77b4'}
                            onChange={(e) => updatePlotSpecificProperty('errorBar', 'errorBarColor', e.target.value)}
                            style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
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
                    {(detectedFeatures.hasPointPlot || currentPlotType === 'pointPlot') && plotProps.pointPlot && (
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
                    {(detectedFeatures.hasDotPlot || currentPlotType === 'dotPlot') && plotProps.dotPlot && (
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
                    {(detectedFeatures.hasRegression || currentPlotType === 'regression') && plotProps.regression && (
                      <>
                        <Card style={{ marginBottom: '16px' }}>
                          <CardHeader>
                            <Text weight="semibold">Regression Lines</Text>
                          </CardHeader>
                          <div style={{ padding: '12px' }}>
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
                          </div>
                        </Card>
                      </>
                    )}

                    {/* Fallback when no specific plot type is detected */}
                    {!currentPlotType && (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'rgba(0,0,0,0.6)' }}>
                        <Text>No specific plot type detected.</Text>
                        <Text size={200}>Current subType: {currentSubType || 'None'}</Text>
                        <Text size={200}>Plot properties will be available when a specific plot type is detected.</Text>
                      </div>
                    )}
                  </div>
                </AccordionPanel>
              </AccordionItem>
            )}

            {/* Grid Settings - Only show for 2D graphs */}
            {!detectedFeatures.is3DMesh && (
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
                                  // Toggle behavior: allow multiple selections
                                  updateGraphProperty(opt.key as any, !(globalProps as any)[opt.key]);
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
                            {(['none', 'solid', 'dashed', 'dotted'] as const).map((s) => (
                              <Button key={s} appearance={globalProps.gridLineStyle === s ? 'primary' : 'secondary'} onClick={() => updateGraphProperty('gridLineStyle', s)}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </Field>
                        <Field label={`Thickness (inch): ${(globalProps.gridThicknessInch || 0.01).toFixed(3)}`}>
                          <Slider min={0} max={0.1} step={0.001} value={globalProps.gridThicknessInch} onChange={(_, d) => updateGraphProperty('gridThicknessInch', d.value)} />
                        </Field>
                        <Field label="Color">
                          <input type="color" value={globalProps.gridColor} onChange={(e) => updateGraphProperty('gridColor', e.target.value)} style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }} />
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
            )}

            {/* Axis Lines - Only show for 2D graphs */}
            {!detectedFeatures.is3DMesh && (
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
                        <Field label={`Thickness (inch): ${(globalProps.axisLineThicknessInch || 0.01).toFixed(3)}`}>
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
            )}

            {/* Scaling Options - Only show for 2D graphs */}
            {!detectedFeatures.is3DMesh && (
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
            )}

            {/* Major Tick Labels - Only show for 2D graphs */}
            {!detectedFeatures.is3DMesh && (
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
                            {['1e-4', '1e-3', '0.1', '1', '10'].map(f => (<option key={f} value={f}>{f}</option>))}
                          </select>
                        </Field>
                      </div>
                    </Card>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            )}


            {/* Major Tick Marks Section - Only show for 2D graphs */}
            {!detectedFeatures.is3DMesh && (
              <AccordionItem value="majorTickMarks">
                <AccordionHeader>
                  <div className={classes.accordionHeader}>
                    <MdSettings size={20} />
                    <Text weight="semibold">Major Tick Marks</Text>
                  </div>
                </AccordionHeader>
                <AccordionPanel>
                  <div className={classes.propertyContent}>
                    <Card>
                      <CardHeader>
                        <Text weight="semibold">Major Tick Properties</Text>
                      </CardHeader>
                      <div style={{ display: 'grid', gap: 12 }}>
                        <Field label={`Length: ${globalProps.majorTickLength?.toFixed(3)} inches`}>
                          <Slider
                            min={0.01}
                            max={0.5}
                            step={0.01}
                            value={globalProps.majorTickLength || 0.1}
                            onChange={(_, data) => updateGraphProperty('majorTickLength', data.value)}
                          />
                        </Field>
                        <Field label={`Thickness: ${globalProps.majorTickThickness?.toFixed(4)} inches`}>
                          <Slider
                            min={0.001}
                            max={0.05}
                            step={0.001}
                            value={globalProps.majorTickThickness || 0.01}
                            onChange={(_, data) => updateGraphProperty('majorTickThickness', data.value)}
                          />
                        </Field>
                        <Field label="Color">
                          <input
                            type="color"
                            value={globalProps.majorTickColor || '#444444'}
                            onChange={(e) => updateGraphProperty('majorTickColor', e.target.value)}
                            style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                          />
                        </Field>
                        <Field label={`Transparency: ${globalProps.majorTickTransparency || 0}%`}>
                          <Slider
                            min={0}
                            max={100}
                            value={globalProps.majorTickTransparency || 0}
                            onChange={(_, data) => updateGraphProperty('majorTickTransparency', data.value)}
                          />
                        </Field>
                        <Field label="Direction">
                          <select
                            value={globalProps.majorTickDirection || 'outward'}
                            onChange={(e) => updateGraphProperty('majorTickDirection', e.target.value as any)}
                            style={{ width: '100%', height: 36 }}
                          >
                            <option value="none">None</option>
                            <option value="inward">Inward</option>
                            <option value="outward">Outward</option>
                            <option value="both">Both</option>
                          </select>
                        </Field>
                        <Field label="Interval">
                          <select
                            value={globalProps.majorTickInterval || 'automatic'}
                            onChange={(e) => updateGraphProperty('majorTickInterval', e.target.value as any)}
                            style={{ width: '100%', height: 36 }}
                          >
                            <option value="automatic">Automatic</option>
                            <option value="manual">Manual</option>
                            <option value="column">Column Based</option>
                          </select>
                        </Field>
                        {globalProps.majorTickInterval === 'manual' && (
                          <Field label={`Manual Interval: ${globalProps.majorTickManualInterval || 1}`}>
                            <Slider
                              min={0.1}
                              max={10}
                              step={0.1}
                              value={globalProps.majorTickManualInterval || 1}
                              onChange={(_, data) => updateGraphProperty('majorTickManualInterval', data.value)}
                            />
                          </Field>
                        )}
                      </div>
                    </Card>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            )}

            {/* Minor Tick Marks Section - Only show for 2D graphs */}
            {!detectedFeatures.is3DMesh && (
              <AccordionItem value="minorTickMarks">
                <AccordionHeader>
                  <div className={classes.accordionHeader}>
                    <MdSettings size={20} />
                    <Text weight="semibold">Minor Tick Marks</Text>
                  </div>
                </AccordionHeader>
                <AccordionPanel>
                  <div className={classes.propertyContent}>
                    <Card>
                      <CardHeader>
                        <Text weight="semibold">Minor Tick Properties</Text>
                      </CardHeader>
                      <div style={{ display: 'grid', gap: 12 }}>
                        <Field label={`Length: ${globalProps.minorTickLength?.toFixed(3)} inches`}>
                          <Slider
                            min={0.01}
                            max={0.3}
                            step={0.01}
                            value={globalProps.minorTickLength || 0.05}
                            onChange={(_, data) => updateGraphProperty('minorTickLength', data.value)}
                          />
                        </Field>
                        <Field label={`Thickness: ${globalProps.minorTickThickness?.toFixed(4)} inches`}>
                          <Slider
                            min={0.001}
                            max={0.025}
                            step={0.001}
                            value={globalProps.minorTickThickness || 0.005}
                            onChange={(_, data) => updateGraphProperty('minorTickThickness', data.value)}
                          />
                        </Field>
                        <Field label="Color">
                          <input
                            type="color"
                            value={globalProps.minorTickColor || '#888888'}
                            onChange={(e) => updateGraphProperty('minorTickColor', e.target.value)}
                            style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                          />
                        </Field>
                        <Field label={`Transparency: ${globalProps.minorTickTransparency || 0}%`}>
                          <Slider
                            min={0}
                            max={100}
                            value={globalProps.minorTickTransparency || 0}
                            onChange={(_, data) => updateGraphProperty('minorTickTransparency', data.value)}
                          />
                        </Field>
                        <Field label="Direction">
                          <select
                            value={globalProps.minorTickDirection || 'outward'}
                            onChange={(e) => updateGraphProperty('minorTickDirection', e.target.value as any)}
                            style={{ width: '100%', height: 36 }}
                          >
                            <option value="none">None</option>
                            <option value="inward">Inward</option>
                            <option value="outward">Outward</option>
                            <option value="both">Both</option>
                          </select>
                        </Field>
                        <Field label={`Interval: ${globalProps.minorTickInterval || 5} per Major Tick Interval`}>
                          <Slider
                            min={2}
                            max={20}
                            value={globalProps.minorTickInterval || 5}
                            onChange={(_, data) => updateGraphProperty('minorTickInterval', data.value)}
                          />
                        </Field>
                      </div>
                    </Card>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            )}


          </Accordion>
          {/* Bottom spacer so you can scroll into empty space even when collapsed */}
          <div style={{ height: 160 }} />
        </div>
      </DrawerBody>
    </InlineDrawer>
  );
};

export const GraphProperties = memo(GraphPropertiesComponent);
