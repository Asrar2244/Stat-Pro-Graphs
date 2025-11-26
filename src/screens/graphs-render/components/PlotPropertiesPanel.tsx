import { FC, useState, useEffect } from 'react';``
import { 
  Button, 
  Field, 
  Input, 
  Dropdown, 
  Option, 
  Text, 
  tokens,
  Slider,
  Checkbox
} from '@fluentui/react-components';
import { 
  MdExpandMore, 
  MdExpandLess, 
  MdPalette, 
  MdShowChart, 
  MdErrorOutline 
} from 'react-icons/md';
import { 
  PlotSpecificProperties, 
  DEFAULT_PLOT_PROPERTIES,
  ScatterPointProperties,
  RegressionLineProperties,
  ErrorBarProperties,
  Mesh3DProperties
} from '../utils/plotProperties';

interface PlotPropertiesPanelProps {
  properties: PlotSpecificProperties;
  onPropertiesChange: (properties: PlotSpecificProperties) => void;
  hasRegression: boolean;
  hasErrorBars: boolean;
  isCategoryPlot: boolean;
  graphConfig?: any;
}

export const PlotPropertiesPanel: FC<PlotPropertiesPanelProps> = ({
  properties,
  onPropertiesChange,
  hasRegression,
  hasErrorBars,
  isCategoryPlot,
  graphConfig
}) => {
  const [expandedSections, setExpandedSections] = useState({
    scatter: true,
    regression: false,
    errorBar: false,
    mesh3d: false
  });

  // Track if color scale has been changed from original
  const [colorScaleChanged, setColorScaleChanged] = useState(false);
  
  // Track original color scale from graph config
  const originalColorScale = properties.mesh3d?.originalColorScale || properties.mesh3d?.colorScale || 'viridis';
  

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateScatterProperties = (updates: Partial<ScatterPointProperties>) => {
    onPropertiesChange({
      ...properties,
      scatter: { ...properties.scatter, ...updates }
    });
  };

  const updateRegressionProperties = (updates: Partial<RegressionLineProperties>) => {
    onPropertiesChange({
      ...properties,
      regression: { ...properties.regression, ...updates }
    });
  };

  const updateErrorBarProperties = (updates: Partial<ErrorBarProperties>) => {
    onPropertiesChange({
      ...properties,
      errorBar: { ...properties.errorBar, ...updates }
    });
  };

  const updateMesh3DProperties = (updates: Partial<Mesh3DProperties>) => {
    // Track if color scale is being changed
    if (updates.colorScale !== undefined && updates.colorScale !== originalColorScale) {
      setColorScaleChanged(true);
    }
    
    const updatedMesh3d = { 
      ...properties.mesh3d, 
      ...updates,
      // Preserve original color scale
      originalColorScale: properties.mesh3d?.originalColorScale || originalColorScale
    };
    
    onPropertiesChange({
      ...properties,
      mesh3d: updatedMesh3d
    });
  };

  // Reset to original color scale
  const resetColorScale = () => {
    setColorScaleChanged(false);
    updateMesh3DProperties({ colorScale: originalColorScale });
  };

  const resetToDefaults = () => {
    setColorScaleChanged(false);
    // Reset to defaults but preserve the original color scale
    const resetProperties = {
      ...DEFAULT_PLOT_PROPERTIES,
      mesh3d: {
        ...DEFAULT_PLOT_PROPERTIES.mesh3d,
        colorScale: originalColorScale,
        originalColorScale: originalColorScale
      }
    };
    onPropertiesChange(resetProperties);
  };

  return (
    <div style={{ 
      padding: tokens.spacingVerticalM,
      border: `1px solid ${tokens.colorNeutralStroke2}`,
      borderRadius: tokens.borderRadiusMedium,
      backgroundColor: tokens.colorNeutralBackground1
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalM
      }}>
        <Text size={400} weight="semibold">Plot Properties</Text>
        <Button 
          size="small" 
          appearance="outline"
          onClick={resetToDefaults}
        >
          Reset to Defaults
        </Button>
      </div>

      {/* Scatter Points Properties */}
      <div style={{ marginBottom: tokens.spacingVerticalM }}>
        <Button
          appearance="transparent"
          icon={expandedSections.scatter ? <MdExpandLess /> : <MdExpandMore />}
          iconPosition="before"
          onClick={() => toggleSection('scatter')}
          style={{ 
            width: '100%', 
            justifyContent: 'flex-start',
            padding: tokens.spacingVerticalS
          }}
        >
          <MdPalette style={{ marginRight: tokens.spacingHorizontalXS }} />
          Scatter Points
        </Button>

        {expandedSections.scatter && (
          <div style={{ 
            padding: tokens.spacingVerticalS,
            paddingLeft: tokens.spacingHorizontalM,
            borderLeft: `2px solid ${tokens.colorNeutralStroke2}`
          }}>
            <Field label="Point Size" size="small">
              <Slider
                min={2}
                max={20}
                step={1}
                value={properties.scatter.pointSize}
                onChange={(_, data) => updateScatterProperties({ pointSize: data.value })}
              />
              <Text size={200}>{properties.scatter.pointSize}px</Text>
            </Field>

            <Field label="Border Width" size="small">
              <Slider
                min={0}
                max={5}
                step={0.5}
                value={properties.scatter.pointBorderWidth}
                onChange={(_, data) => updateScatterProperties({ pointBorderWidth: data.value })}
              />
              <Text size={200}>{properties.scatter.pointBorderWidth}px</Text>
            </Field>

            <Field label="Border Color" size="small">
              <Input
                type="text"
                value={properties.scatter.pointBorderColor}
                onChange={(_, data) => updateScatterProperties({ pointBorderColor: data.value })}
                style={{ width: '100%' }}
              />
            </Field>

            <Field label="Opacity" size="small">
              <Slider
                min={0.1}
                max={1}
                step={0.1}
                value={properties.scatter.pointOpacity}
                onChange={(_, data) => updateScatterProperties({ pointOpacity: data.value })}
              />
              <Text size={200}>{Math.round(properties.scatter.pointOpacity * 100)}%</Text>
            </Field>

            {isCategoryPlot && (
              <Field label="Color Mode" size="small">
                <Checkbox
                  label="Use multi-color for categories"
                  checked={properties.scatter.useMultiColor}
                  onChange={(_, data) => updateScatterProperties({ useMultiColor: Boolean(data.checked) })}
                />
              </Field>
            )}

            {(!isCategoryPlot || !properties.scatter.useMultiColor) && (
              <Field label="Point Color" size="small">
                <Input
                  type="text"
                  value={properties.scatter.singleColor}
                  onChange={(_, data) => updateScatterProperties({ singleColor: data.value })}
                  style={{ width: '100%' }}
                />
              </Field>
            )}
          </div>
        )}
      </div>

      {/* Regression Line Properties */}
      {hasRegression && (
        <div style={{ marginBottom: tokens.spacingVerticalM }}>
          <Button
            appearance="transparent"
            icon={expandedSections.regression ? <MdExpandLess /> : <MdExpandMore />}
            iconPosition="before"
            onClick={() => toggleSection('regression')}
            style={{ 
              width: '100%', 
              justifyContent: 'flex-start',
              padding: tokens.spacingVerticalS
            }}
          >
            <MdShowChart style={{ marginRight: tokens.spacingHorizontalXS }} />
            Regression Lines
          </Button>

          {expandedSections.regression && (
            <div style={{ 
              padding: tokens.spacingVerticalS,
              paddingLeft: tokens.spacingHorizontalM,
              borderLeft: `2px solid ${tokens.colorNeutralStroke2}`
            }}>
              <Field label="Line Color" size="small">
                <Input
                  type="text"
                  value={properties.regression.lineColor}
                  onChange={(_, data) => updateRegressionProperties({ lineColor: data.value })}
                  style={{ width: '100%' }}
                />
              </Field>

              <Field label="Line Width" size="small">
                <Slider
                  min={1}
                  max={8}
                  step={0.5}
                  value={properties.regression.lineWidth}
                  onChange={(_, data) => updateRegressionProperties({ lineWidth: data.value })}
                />
                <Text size={200}>{properties.regression.lineWidth}px</Text>
              </Field>

              <Field label="Line Style" size="small">
                <Dropdown
                  value={properties.regression.lineStyle}
                  onOptionSelect={(_, data) => updateRegressionProperties({ lineStyle: data.optionValue as any })}
                >
                  <Option value="solid">Solid</Option>
                  <Option value="dashed">Dashed</Option>
                  <Option value="dotted">Dotted</Option>
                  <Option value="dashdot">Dash-Dot</Option>
                </Dropdown>
              </Field>

              <Field label="Opacity" size="small">
                <Slider
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={properties.regression.lineOpacity}
                  onChange={(_, data) => updateRegressionProperties({ lineOpacity: data.value })}
                />
                <Text size={200}>{Math.round(properties.regression.lineOpacity * 100)}%</Text>
              </Field>

              <Field label="Display Options" size="small">
                <Checkbox
                  label="Show R² in legend"
                  checked={properties.regression.showRSquared}
                  onChange={(_, data) => updateRegressionProperties({ showRSquared: Boolean(data.checked) })}
                />
              </Field>
            </div>
          )}
        </div>
      )}

      {/* Error Bar Properties */}
      {hasErrorBars && (
        <div style={{ marginBottom: tokens.spacingVerticalM }}>
          <Button
            appearance="transparent"
            icon={expandedSections.errorBar ? <MdExpandLess /> : <MdExpandMore />}
            iconPosition="before"
            onClick={() => toggleSection('errorBar')}
            style={{ 
              width: '100%', 
              justifyContent: 'flex-start',
              padding: tokens.spacingVerticalS
            }}
          >
            <MdErrorOutline style={{ marginRight: tokens.spacingHorizontalXS }} />
            Error Bars
          </Button>

          {expandedSections.errorBar && (
            <div style={{ 
              padding: tokens.spacingVerticalS,
              paddingLeft: tokens.spacingHorizontalM,
              borderLeft: `2px solid ${tokens.colorNeutralStroke2}`
            }}>
              <Field label="Error Bar Color" size="small">
                <Input
                  type="text"
                  value={properties.errorBar.errorBarColor}
                  onChange={(_, data) => updateErrorBarProperties({ errorBarColor: data.value })}
                  style={{ width: '100%' }}
                />
              </Field>

              <Field label="Error Bar Width" size="small">
                <Slider
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={properties.errorBar.errorBarWidth}
                  onChange={(_, data) => updateErrorBarProperties({ errorBarWidth: data.value })}
                />
                <Text size={200}>{properties.errorBar.errorBarWidth}px</Text>
              </Field>

              <Field label="Cap Size" size="small">
                <Slider
                  min={2}
                  max={10}
                  step={1}
                  value={properties.errorBar.errorBarCapSize}
                  onChange={(_, data) => updateErrorBarProperties({ errorBarCapSize: data.value })}
                />
                <Text size={200}>{properties.errorBar.errorBarCapSize}px</Text>
              </Field>

              <Field label="Opacity" size="small">
                <Slider
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={properties.errorBar.errorBarOpacity}
                  onChange={(_, data) => updateErrorBarProperties({ errorBarOpacity: data.value })}
                />
                <Text size={200}>{Math.round(properties.errorBar.errorBarOpacity * 100)}%</Text>
              </Field>

              <Field label="Display Options" size="small">
                <Checkbox
                  label="Show in legend"
                  checked={properties.errorBar.showInLegend}
                  onChange={(_, data) => updateErrorBarProperties({ showInLegend: Boolean(data.checked) })}
                />
              </Field>
            </div>
          )}
        </div>
      )}

      {/* 3D Mesh Properties */}
      {properties.mesh3d && (
        <div style={{ marginBottom: tokens.spacingVerticalM }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: tokens.spacingVerticalS,
              backgroundColor: expandedSections.mesh3d ? tokens.colorNeutralBackground2 : 'transparent',
              borderRadius: tokens.borderRadiusSmall,
              border: `1px solid ${tokens.colorNeutralStroke2}`
            }}
            onClick={() => toggleSection('mesh3d')}
          >
            <MdShowChart style={{ marginRight: tokens.spacingHorizontalS }} />
            <Text size={300} weight="medium">3D Mesh Properties</Text>
            {expandedSections.mesh3d ? <MdExpandLess /> : <MdExpandMore />}
          </div>
          
          {expandedSections.mesh3d && (
            <div style={{ 
              padding: tokens.spacingVerticalS,
              paddingLeft: tokens.spacingHorizontalM,
              borderLeft: `2px solid ${tokens.colorNeutralStroke2}`
            }}>
              <Field label="Surface Type" size="small">
                <Dropdown
                  value={properties.mesh3d.surfaceType}
                  onOptionSelect={(_, data) => updateMesh3DProperties({ surfaceType: data.optionValue as any })}
                >
                  <Option value="surface">Surface</Option>
                  <Option value="mesh">Mesh</Option>
                  <Option value="wireframe">Wireframe</Option>
                </Dropdown>
              </Field>

              <Field label="Color Scale" size="small">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Dropdown
                    value={properties.mesh3d.colorScale}
                    onOptionSelect={(_, data) => updateMesh3DProperties({ colorScale: data.optionValue as string })}
                    style={{ flex: 1 }}
                  >
                    {/* Show only selected color scale initially, or all if changed */}
                    {!colorScaleChanged ? (
                      <Option 
                        value={properties.mesh3d.colorScale}
                        text={properties.mesh3d.colorScale.charAt(0).toUpperCase() + properties.mesh3d.colorScale.slice(1)}
                      >
                        {properties.mesh3d.colorScale.charAt(0).toUpperCase() + properties.mesh3d.colorScale.slice(1)}
                      </Option>
                    ) : (
                      <>
                        {/* Original scientific scales */}
                        <Option value="viridis" text="Viridis">Viridis</Option>
                        <Option value="plasma" text="Plasma">Plasma</Option>
                        <Option value="inferno" text="Inferno">Inferno</Option>
                        <Option value="magma" text="Magma">Magma</Option>
                        <Option value="cividis" text="Cividis">Cividis</Option>
                        <Option value="turbo" text="Turbo">Turbo</Option>
                        <Option value="jet" text="Jet">Jet</Option>
                        <Option value="hot" text="Hot">Hot</Option>
                        <Option value="cool" text="Cool">Cool</Option>
                        <Option value="rainbow" text="Rainbow">Rainbow</Option>
                        
                        {/* Scientific sequential scales */}
                        <Option value="blues" text="Blues">Blues</Option>
                        <Option value="greens" text="Greens">Greens</Option>
                        <Option value="reds" text="Reds">Reds</Option>
                        <Option value="oranges" text="Oranges">Oranges</Option>
                        <Option value="purples" text="Purples">Purples</Option>
                        <Option value="greys" text="Greys">Greys</Option>
                        
                        {/* Diverging scales */}
                        <Option value="rdbu" text="Red-Blue">Red-Blue</Option>
                        <Option value="rdylbu" text="Red-Yellow-Blue">Red-Yellow-Blue</Option>
                        <Option value="spectral" text="Spectral">Spectral</Option>
                        <Option value="rdylgn" text="Red-Yellow-Green">Red-Yellow-Green</Option>
                        
                        {/* Professional scales */}
                        <Option value="piyg" text="Pink-Yellow-Green">Pink-Yellow-Green</Option>
                        <Option value="prgn" text="Purple-Green">Purple-Green</Option>
                        <Option value="brbg" text="Brown-Green">Brown-Green</Option>
                        
                        {/* Medical/Scientific scales */}
                        <Option value="bone" text="Bone">Bone</Option>
                        <Option value="copper" text="Copper">Copper</Option>
                        <Option value="pink" text="Pink">Pink</Option>
                        
                        {/* Seasonal scales */}
                        <Option value="spring" text="Spring">Spring</Option>
                        <Option value="summer" text="Summer">Summer</Option>
                        <Option value="autumn" text="Autumn">Autumn</Option>
                        <Option value="winter" text="Winter">Winter</Option>
                        
                        {/* Professional data visualization scales */}
                        <Option value="tab10" text="Tab10">Tab10</Option>
                        <Option value="set1" text="Set1">Set1</Option>
                        <Option value="set2" text="Set2">Set2</Option>
                        <Option value="set3" text="Set3">Set3</Option>
                      </>
                    )}
                  </Dropdown>
                  
                  {/* Show expand button if not changed yet */}
                  {!colorScaleChanged && (
                    <Button
                      appearance="subtle"
                      size="small"
                      onClick={() => setColorScaleChanged(true)}
                      title="Show all color scales"
                    >
                      More...
                    </Button>
                  )}
                  
                  {/* Show reset button if changed */}
                  {colorScaleChanged && (
                    <Button
                      appearance="subtle"
                      size="small"
                      onClick={resetColorScale}
                      title="Reset to original color scale"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </Field>

              <Field label="Opacity" size="small">
                <Slider
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={properties.mesh3d.opacity}
                  onChange={(_, data) => updateMesh3DProperties({ opacity: data.value })}
                />
                <Text size={200}>{Math.round(properties.mesh3d.opacity * 100)}%</Text>
              </Field>

              <Field label="Contour Options" size="small">
                <Checkbox
                  label="Show contours"
                  checked={properties.mesh3d.showContours}
                  onChange={(_, data) => updateMesh3DProperties({ showContours: Boolean(data.checked) })}
                />
                {properties.mesh3d.showContours && (
                  <div style={{ marginTop: tokens.spacingVerticalS }}>
                    <Text size={200}>Contour Opacity</Text>
                    <Slider
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={properties.mesh3d.contourOpacity}
                      onChange={(_, data) => updateMesh3DProperties({ contourOpacity: data.value })}
                    />
                    <Text size={200}>{Math.round(properties.mesh3d.contourOpacity * 100)}%</Text>
                  </div>
                )}
              </Field>

              <Field label="Lighting Options" size="small">
                <Checkbox
                  label="Enable lighting"
                  checked={properties.mesh3d.lighting}
                  onChange={(_, data) => updateMesh3DProperties({ lighting: Boolean(data.checked) })}
                />
                <Checkbox
                  label="Smooth shading"
                  checked={properties.mesh3d.smoothShading}
                  onChange={(_, data) => updateMesh3DProperties({ smoothShading: Boolean(data.checked) })}
                />
              </Field>

              <Field label="Grid Options" size="small">
                <Checkbox
                  label="Show grid"
                  checked={properties.mesh3d.showGrid}
                  onChange={(_, data) => updateMesh3DProperties({ showGrid: Boolean(data.checked) })}
                />
                {properties.mesh3d.showGrid && (
                  <div style={{ marginTop: tokens.spacingVerticalS }}>
                    <Text size={200}>Grid Opacity</Text>
                    <Slider
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={properties.mesh3d.gridOpacity}
                      onChange={(_, data) => updateMesh3DProperties({ gridOpacity: data.value })}
                    />
                    <Text size={200}>{Math.round(properties.mesh3d.gridOpacity * 100)}%</Text>
                  </div>
                )}
              </Field>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
