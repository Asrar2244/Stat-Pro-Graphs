import { FC } from 'react';
import { Field, Dropdown, Option, Slider, Text, tokens } from '@fluentui/react-components';
import { useLinePlotStore } from '../linePlotSlice';
import { useLineConfigurationStyles } from '../styles-hook/use-line-configuration-styles';

/**
 * Props for the LineConfiguration component
 */
interface LineConfigurationProps {
  classes: Record<string, string>;
}

/**
 * Component for configuring line plot specific options
 */
export const LineConfiguration: FC<LineConfigurationProps> = ({ classes }) => {
  const {
    lineStyle,
    lineWidth,
    markerStyle,
    stepDirection,
    splineSmoothing,
    splineTension,
    setLineStyle,
    setLineWidth,
    setMarkerStyle,
    setStepDirection,
    setSplineSmoothing,
    setSplineTension,
    subType
  } = useLinePlotStore();

  const isStepPlot = subType?.includes('Step') || false;
  const isSplinePlot = subType?.includes('Spline') || false;

  return (
    <div className={classes.lineConfiguration}>
      <Text size={400} weight="semibold" className={classes.sectionTitle}>
        Line Configuration
      </Text>
      
      {/* Line Style */}
      <Field label="Line Style">
        <Dropdown
          value={lineStyle}
          onOptionSelect={(_, data) => setLineStyle(data.optionValue as any)}
        >
          <Option value="solid">Solid</Option>
          <Option value="dashed">Dashed</Option>
          <Option value="dotted">Dotted</Option>
          <Option value="dashdot">Dash-Dot</Option>
        </Dropdown>
      </Field>

      {/* Line Width */}
      <Field label={`Line Width: ${lineWidth}px`}>
        <Slider
          min={1}
          max={10}
          step={1}
          value={lineWidth}
          onChange={(_, data) => setLineWidth(data.value)}
        />
      </Field>

      {/* Marker Style */}
      <Field label="Marker Style">
        <Dropdown
          value={markerStyle}
          onOptionSelect={(_, data) => setMarkerStyle(data.optionValue)}
        >
          <Option value="circle">Circle</Option>
          <Option value="square">Square</Option>
          <Option value="diamond">Diamond</Option>
          <Option value="triangle-up">Triangle Up</Option>
          <Option value="triangle-down">Triangle Down</Option>
          <Option value="cross">Cross</Option>
          <Option value="x">X</Option>
        </Dropdown>
      </Field>

      {/* Step Plot Configuration */}
      {isStepPlot && (
        <Field label="Step Direction">
          <Dropdown
            value={stepDirection}
            onOptionSelect={(_, data) => setStepDirection(data.optionValue as any)}
          >
            <Option value="vertical">Vertical</Option>
            <Option value="horizontal">Horizontal</Option>
            <Option value="vertical-midpoint">Vertical Midpoint</Option>
            <Option value="horizontal-midpoint">Horizontal Midpoint</Option>
          </Dropdown>
        </Field>
      )}

      {/* Spline Plot Configuration */}
      {isSplinePlot && (
        <>
          <Field label={`Spline Smoothing: ${splineSmoothing}`}>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={splineSmoothing}
              onChange={(_, data) => setSplineSmoothing(data.value)}
            />
          </Field>
          
          <Field label={`Spline Tension: ${splineTension}`}>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={splineTension}
              onChange={(_, data) => setSplineTension(data.value)}
            />
          </Field>
        </>
      )}
    </div>
  );
};

