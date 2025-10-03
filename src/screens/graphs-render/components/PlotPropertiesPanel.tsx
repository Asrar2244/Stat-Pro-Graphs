import { FC, useState } from 'react';
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
  ErrorBarProperties
} from '../utils/plotProperties';

interface PlotPropertiesPanelProps {
  properties: PlotSpecificProperties;
  onPropertiesChange: (properties: PlotSpecificProperties) => void;
  hasRegression: boolean;
  hasErrorBars: boolean;
  isCategoryPlot: boolean;
}

export const PlotPropertiesPanel: FC<PlotPropertiesPanelProps> = ({
  properties,
  onPropertiesChange,
  hasRegression,
  hasErrorBars,
  isCategoryPlot
}) => {
  const [expandedSections, setExpandedSections] = useState({
    scatter: true,
    regression: false,
    errorBar: false
  });

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

  const resetToDefaults = () => {
    onPropertiesChange(DEFAULT_PLOT_PROPERTIES);
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
                type="color"
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
                  onChange={(_, data) => updateScatterProperties({ useMultiColor: data.checked })}
                />
              </Field>
            )}

            {(!isCategoryPlot || !properties.scatter.useMultiColor) && (
              <Field label="Point Color" size="small">
                <Input
                  type="color"
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
                  type="color"
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
                  onChange={(_, data) => updateRegressionProperties({ showRSquared: data.checked })}
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
                  type="color"
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
                  onChange={(_, data) => updateErrorBarProperties({ showInLegend: data.checked })}
                />
              </Field>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
