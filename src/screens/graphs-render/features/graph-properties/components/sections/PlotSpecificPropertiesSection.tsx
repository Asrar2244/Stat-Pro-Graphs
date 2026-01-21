/**
 * Plot-Specific Properties section
 */

import { FC } from 'react';
import {
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Text,
  Card,
  CardHeader,
  Field,
  Slider,
  Switch,
} from '@fluentui/react-components';
import { MdScatterPlot, MdError, MdVisibility, MdTrendingUp, MdAreaChart } from 'react-icons/md';
import { useGraphPropertiesClasses } from '../../../../styles/use-graph-properties-style';
import { GraphPropertiesProps } from '../../types';

export const PlotSpecificPropertiesSection: FC<GraphPropertiesProps> = ({ properties }) => {
  const classes = useGraphPropertiesClasses();
  const currentPlotType = properties.getCurrentPlotType(properties.currentSubType);
  const detectedFeatures = properties.getDetectedPlotFeatures(properties.currentSubType);
  const plotProps = properties.graphProperties.plotSpecific;

  return (
    <AccordionItem value="plotSpecific">
      <AccordionHeader>
        <div className={classes.accordionHeader}>
          {(currentPlotType === 'scatter' || (currentPlotType === null && (detectedFeatures.hasScatter || detectedFeatures.hasArea))) && <MdScatterPlot size={20} />}
          {currentPlotType === 'errorBar' && <MdError size={20} />}
          {currentPlotType === 'pointPlot' && <MdVisibility size={20} />}
          {currentPlotType === 'dotPlot' && <MdVisibility size={20} />}
          {currentPlotType === 'regression' && <MdTrendingUp size={20} />}
          <Text weight="semibold">
            {(currentPlotType === 'scatter' || (currentPlotType === null && (detectedFeatures.hasScatter || detectedFeatures.hasArea))) && 'Scatter/Area Properties'}
            {currentPlotType === 'errorBar' && 'Error Bar Properties'}
            {currentPlotType === 'pointPlot' && 'Point Plot Properties'}
            {currentPlotType === 'dotPlot' && 'Dot Plot Properties'}
            {currentPlotType === 'regression' && 'Regression Properties'}
            {!currentPlotType && !detectedFeatures.hasScatter && !detectedFeatures.hasArea && 'Plot Properties'}
          </Text>
          <Text size={200} style={{ marginLeft: 'auto', color: 'rgba(0,0,0,0.6)' }}>
            (Current plot only)
          </Text>
        </div>
      </AccordionHeader>
      <AccordionPanel>
        <div className={classes.propertyContent}>
          {/* Scatter Plot Properties */}
          {(detectedFeatures.hasScatter || currentPlotType === 'scatter' || detectedFeatures.hasArea) && plotProps.scatter && (
            <Card style={{ marginBottom: '16px' }}>
              <CardHeader>
                <Text weight="semibold">Scatter/Area Points</Text>
              </CardHeader>
              <div style={{ padding: '12px' }}>
                <Field label={`Point Size: ${plotProps.scatter.pointSize}`}>
                  <Slider
                    min={1}
                    max={20}
                    value={plotProps.scatter.pointSize}
                    onChange={(_, data) => properties.updatePlotSpecificProperty('scatter', 'pointSize', data.value)}
                  />
                </Field>

                <Field label="Show Data Points">
                  <Switch
                    checked={plotProps.scatter.showDataPoints}
                    onChange={(_, data) => properties.updatePlotSpecificProperty('scatter', 'showDataPoints', data.checked)}
                  />
                </Field>

                <Field label={`Point Opacity: ${(plotProps.scatter.pointOpacity * 100).toFixed(0)}%`}>
                  <Slider
                    min={0.1}
                    max={1}
                    step={0.1}
                    value={plotProps.scatter.pointOpacity}
                    onChange={(_, data) => properties.updatePlotSpecificProperty('scatter', 'pointOpacity', data.value)}
                  />
                </Field>

                <Field label={`Border Width: ${plotProps.scatter.pointBorderWidth}`}>
                  <Slider
                    min={0}
                    max={5}
                    step={0.5}
                    value={plotProps.scatter.pointBorderWidth}
                    onChange={(_, data) => properties.updatePlotSpecificProperty('scatter', 'pointBorderWidth', data.value)}
                  />
                </Field>
                <Field label="Point Color">
                  <input
                    type="color"
                    value={plotProps.scatter.pointColor || '#1f77b4'}
                    onChange={(e) => properties.updatePlotSpecificProperty('scatter', 'pointColor', e.target.value)}
                    style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                  />
                </Field>
              </div>

              {/* Area Specific Properties - Integrated for unified Scatter/Area experience */}
              {detectedFeatures.hasArea && plotProps.area && (
                <div style={{ padding: '0 12px 12px 12px', borderTop: '2px dotted rgba(0,0,0,0.1)', marginTop: '8px', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <MdAreaChart />
                    <Text weight="semibold">Area Fill Settings</Text>
                  </div>

                  <Field label={`Area Opacity: ${(plotProps.area.fillOpacity * 100).toFixed(0)}%`}>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={plotProps.area.fillOpacity}
                      onChange={(_, data) => properties.updatePlotSpecificProperty('area', 'fillOpacity', data.value)}
                    />
                  </Field>

                  <Field label={`Line Width: ${plotProps.area.lineWidth}`}>
                    <Slider
                      min={0}
                      max={10}
                      step={0.5}
                      value={plotProps.area.lineWidth}
                      onChange={(_, data) => properties.updatePlotSpecificProperty('area', 'lineWidth', data.value)}
                    />
                  </Field>
                </div>
              )}
            </Card>
          )}

          {/* Regression Properties */}
          {(detectedFeatures.hasRegression || currentPlotType === 'regression') && plotProps.regression && (
            <Card style={{ marginBottom: '16px' }}>
              <CardHeader>
                <Text weight="semibold">Regression Lines</Text>
              </CardHeader>
              <div style={{ padding: '12px' }}>
                <Field label={`Line Width: ${plotProps.regression.lineWidth}`}>
                  <Slider
                    min={1}
                    max={10}
                    step={0.5}
                    value={plotProps.regression.lineWidth}
                    onChange={(_, data) => properties.updatePlotSpecificProperty('regression', 'lineWidth', data.value)}
                  />
                </Field>

                <Field label={`Line Opacity: ${(plotProps.regression.lineOpacity * 100).toFixed(0)}%`}>
                  <Slider
                    min={0.1}
                    max={1}
                    step={0.1}
                    value={plotProps.regression.lineOpacity}
                    onChange={(_, data) => properties.updatePlotSpecificProperty('regression', 'lineOpacity', data.value)}
                  />
                </Field>

                <Field label="Line Color">
                  <input
                    type="color"
                    value={plotProps.regression.lineColor || '#ff0000'}
                    onChange={(e) => properties.updatePlotSpecificProperty('regression', 'lineColor', e.target.value)}
                    style={{ width: '100%', height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                  />
                </Field>

                <Field label="Show Confidence Interval">
                  <Switch
                    checked={plotProps.regression.showConfidenceInterval}
                    onChange={(_, data) => properties.updatePlotSpecificProperty('regression', 'showConfidenceInterval', data.checked)}
                  />
                </Field>

                <Field label={`Confidence Interval Opacity: ${(plotProps.regression.confidenceIntervalOpacity * 100).toFixed(0)}%`}>
                  <Slider
                    min={0.1}
                    max={1}
                    step={0.1}
                    value={plotProps.regression.confidenceIntervalOpacity}
                    onChange={(_, data) => properties.updatePlotSpecificProperty('regression', 'confidenceIntervalOpacity', data.value)}
                  />
                </Field>
              </div>
            </Card>
          )}

          {/* Fallback when no specific plot type is detected */}
          {!currentPlotType && !detectedFeatures.hasScatter && !detectedFeatures.hasArea && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'rgba(0,0,0,0.6)' }}>
              <Text>No specific plot type detected.</Text>
              <Text size={200}>Current subType: {properties.currentSubType || 'None'}</Text>
              <Text size={200}>Plot properties will be available when a specific plot type is detected.</Text>
            </div>
          )}
        </div>
      </AccordionPanel>
    </AccordionItem>
  );
};
