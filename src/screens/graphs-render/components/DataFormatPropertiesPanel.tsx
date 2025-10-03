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
  Switch,
  Card,
  CardHeader
} from '@fluentui/react-components';
import { 
  MdExpandMore, 
  MdExpandLess, 
  MdPalette, 
  MdRefresh,
  MdAutoFixHigh
} from 'react-icons/md';
import { 
  DataFormatProperties, 
  getDataFormatDescription,
  updateSeriesStyle,
  applyGlobalDefaults,
  getDefaultSeriesStyle
} from '../utils/dataFormatProperties';

interface DataFormatPropertiesPanelProps {
  properties: DataFormatProperties;
  onPropertiesChange: (properties: DataFormatProperties) => void;
  dataFormat: string;
  seriesLabels: string[];
}

export const DataFormatPropertiesPanel: FC<DataFormatPropertiesPanelProps> = ({
  properties,
  onPropertiesChange,
  dataFormat,
  seriesLabels
}) => {
  const [expandedSections, setExpandedSections] = useState({
    global: true,
    series: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateGlobalProperty = (key: keyof DataFormatProperties['global'], value: any) => {
    const updated = applyGlobalDefaults(properties, { [key]: value });
    onPropertiesChange(updated);
  };

  const updateSeriesProperty = (seriesLabel: string, key: keyof DataFormatProperties['seriesStyles'][string], value: any) => {
    const updated = updateSeriesStyle(properties, seriesLabel, { [key]: value });
    onPropertiesChange(updated);
  };

  const resetToDefaults = () => {
    const newProperties: DataFormatProperties = {
      dataFormat,
      seriesStyles: {},
      global: {
        defaultPointSize: 8,
        defaultPointOpacity: 1,
        defaultBorderWidth: 1,
        defaultBorderColor: 'rgba(0,0,0,0.3)',
        useAutoColors: true,
        useAutoSymbols: true
      }
    };

    // Reset all series to defaults
    seriesLabels.forEach((label, index) => {
      newProperties.seriesStyles[label] = getDefaultSeriesStyle(label, index);
    });

    onPropertiesChange(newProperties);
  };

  const autoAssignColors = () => {
    const updated = { ...properties };
    seriesLabels.forEach((label, index) => {
      const defaultStyle = getDefaultSeriesStyle(label, index);
      updated.seriesStyles[label] = {
        ...updated.seriesStyles[label],
        color: defaultStyle.color,
        symbol: defaultStyle.symbol
      };
    });
    onPropertiesChange(updated);
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
        <div>
          <Text size={400} weight="semibold">Data Format Properties</Text>
          <Text size={200} style={{ color: tokens.colorNeutralForeground2, display: 'block' }}>
            {getDataFormatDescription(dataFormat)}
          </Text>
        </div>
        <div style={{ display: 'flex', gap: tokens.spacingHorizontalS }}>
          <Button 
            size="small" 
            appearance="outline"
            icon={<MdAutoFixHigh />}
            onClick={autoAssignColors}
          >
            Auto Colors
          </Button>
          <Button 
            size="small" 
            appearance="outline"
            onClick={resetToDefaults}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Global Properties */}
      <div style={{ marginBottom: tokens.spacingVerticalM }}>
        <Button
          appearance="transparent"
          icon={expandedSections.global ? <MdExpandLess /> : <MdExpandMore />}
          iconPosition="before"
          onClick={() => toggleSection('global')}
          style={{ 
            width: '100%', 
            justifyContent: 'flex-start',
            padding: tokens.spacingVerticalS
          }}
        >
          <MdPalette style={{ marginRight: tokens.spacingHorizontalXS }} />
          Global Properties
        </Button>

        {expandedSections.global && (
          <Card style={{ marginTop: tokens.spacingVerticalS }}>
            <CardHeader>
              <Text weight="semibold">Default Settings</Text>
            </CardHeader>
            <div style={{ padding: '12px' }}>
              <Field label="Default Point Size" size="small">
                <Slider
                  min={2}
                  max={20}
                  step={1}
                  value={properties.global.defaultPointSize}
                  onChange={(_, data) => updateGlobalProperty('defaultPointSize', data.value)}
                />
                <Text size={200}>{properties.global.defaultPointSize}px</Text>
              </Field>

              <Field label="Default Opacity" size="small">
                <Slider
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={properties.global.defaultPointOpacity}
                  onChange={(_, data) => updateGlobalProperty('defaultPointOpacity', data.value)}
                />
                <Text size={200}>{Math.round(properties.global.defaultPointOpacity * 100)}%</Text>
              </Field>

              <Field label="Default Border Width" size="small">
                <Slider
                  min={0}
                  max={5}
                  step={0.5}
                  value={properties.global.defaultBorderWidth}
                  onChange={(_, data) => updateGlobalProperty('defaultBorderWidth', data.value)}
                />
                <Text size={200}>{properties.global.defaultBorderWidth}px</Text>
              </Field>

              <Field label="Default Border Color" size="small">
                <Input
                  type="color"
                  value={properties.global.defaultBorderColor}
                  onChange={(_, data) => updateGlobalProperty('defaultBorderColor', data.value)}
                  style={{ width: '100%' }}
                />
              </Field>

              <Field label="Auto Assignment" size="small">
                <Switch
                  label="Use automatic colors"
                  checked={properties.global.useAutoColors}
                  onChange={(_, data) => updateGlobalProperty('useAutoColors', data.checked)}
                />
                <Switch
                  label="Use automatic symbols"
                  checked={properties.global.useAutoSymbols}
                  onChange={(_, data) => updateGlobalProperty('useAutoSymbols', data.checked)}
                />
              </Field>
            </div>
          </Card>
        )}
      </div>

      {/* Series Properties */}
      <div style={{ marginBottom: tokens.spacingVerticalM }}>
        <Button
          appearance="transparent"
          icon={expandedSections.series ? <MdExpandLess /> : <MdExpandMore />}
          iconPosition="before"
          onClick={() => toggleSection('series')}
          style={{ 
            width: '100%', 
            justifyContent: 'flex-start',
            padding: tokens.spacingVerticalS
          }}
        >
          <MdPalette style={{ marginRight: tokens.spacingHorizontalXS }} />
          Series Properties ({seriesLabels.length} series)
        </Button>

        {expandedSections.series && (
          <div style={{ marginTop: tokens.spacingVerticalS }}>
            {seriesLabels.map((label, index) => {
              const seriesStyle = properties.seriesStyles[label];
              if (!seriesStyle) return null;

              return (
                <Card key={label} style={{ marginBottom: tokens.spacingVerticalS }}>
                  <CardHeader>
                    <Text weight="semibold">{label}</Text>
                  </CardHeader>
                  <div style={{ padding: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingHorizontalM }}>
                      <Field label="Color" size="small">
                        <Input
                          type="color"
                          value={seriesStyle.color}
                          onChange={(_, data) => updateSeriesProperty(label, 'color', data.value)}
                          style={{ width: '100%' }}
                        />
                      </Field>

                      <Field label="Symbol" size="small">
                        <Dropdown
                          value={seriesStyle.symbol}
                          onOptionSelect={(_, data) => updateSeriesProperty(label, 'symbol', data.optionValue)}
                        >
                          <Option value="circle">Circle</Option>
                          <Option value="square">Square</Option>
                          <Option value="diamond">Diamond</Option>
                          <Option value="triangle-up">Triangle Up</Option>
                          <Option value="triangle-down">Triangle Down</Option>
                          <Option value="star">Star</Option>
                          <Option value="pentagon">Pentagon</Option>
                          <Option value="hexagon">Hexagon</Option>
                        </Dropdown>
                      </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingHorizontalM, marginTop: tokens.spacingVerticalS }}>
                      <Field label="Point Size" size="small">
                        <Slider
                          min={2}
                          max={20}
                          step={1}
                          value={seriesStyle.pointSize}
                          onChange={(_, data) => updateSeriesProperty(label, 'pointSize', data.value)}
                        />
                        <Text size={200}>{seriesStyle.pointSize}px</Text>
                      </Field>

                      <Field label="Opacity" size="small">
                        <Slider
                          min={0.1}
                          max={1}
                          step={0.1}
                          value={seriesStyle.pointOpacity}
                          onChange={(_, data) => updateSeriesProperty(label, 'pointOpacity', data.value)}
                        />
                        <Text size={200}>{Math.round(seriesStyle.pointOpacity * 100)}%</Text>
                      </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingHorizontalM, marginTop: tokens.spacingVerticalS }}>
                      <Field label="Border Width" size="small">
                        <Slider
                          min={0}
                          max={5}
                          step={0.5}
                          value={seriesStyle.borderWidth}
                          onChange={(_, data) => updateSeriesProperty(label, 'borderWidth', data.value)}
                        />
                        <Text size={200}>{seriesStyle.borderWidth}px</Text>
                      </Field>

                      <Field label="Border Color" size="small">
                        <Input
                          type="color"
                          value={seriesStyle.borderColor}
                          onChange={(_, data) => updateSeriesProperty(label, 'borderColor', data.value)}
                          style={{ width: '100%' }}
                        />
                      </Field>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
