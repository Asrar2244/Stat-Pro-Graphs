import { FC } from 'react';
import { Field, Dropdown, Option, Slider, Label, Switch, Input } from '@fluentui/react-components';
import { useContourPlotStore } from '../contourPlotSlice';
import { CONTOUR_PLOT_OPTIONS } from '../constants';
import { useContourConfigurationStyles } from '../styles-hook/use-contour-configuration-styles';
import { getColorScaleCSS } from '../../../../../screens/graphs-render/utils/mesh3DProperties';

/**
 * Props for the ContourConfiguration component
 */
interface ContourConfigurationProps {
    classes: Record<string, string>;
}

/**
 * Component for configuring Contour plot specific settings
 */
export const ContourConfiguration: FC<ContourConfigurationProps> = ({ classes }) => {
    const { contourConfigurationStyles } = useContourConfigurationStyles();

    const {
        contourType,
        colorScale,
        opacity,
        showGrid,
        gridOpacity,
        zInterval,
        showLabels,
        setContourType,
        setColorScale,
        setOpacity,
        setShowGrid,
        setGridOpacity,
        setZInterval,
        setShowLabels,
    } = useContourPlotStore();

    return (
        <div className={classes.contourConfiguration}>
            <Label weight="semibold">Contour Configuration</Label>

            <div style={contourConfigurationStyles}>
                {/* Subplot Type Removed - Handled in ProjectAndType */}


                <Field label="Color Scale">
                    <Dropdown
                        value={colorScale.charAt(0).toUpperCase() + colorScale.slice(1)}
                        onOptionSelect={(_, data) => setColorScale(data.optionValue as string)}
                        style={{ minWidth: '100%' }}
                    >
                        {CONTOUR_PLOT_OPTIONS.colorScales.map((scale) => (
                            <Option key={scale} value={scale} text={scale}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
                                    <span style={{ textTransform: 'capitalize' }}>{scale}</span>
                                    <div
                                        style={{
                                            width: '80px',
                                            height: '12px',
                                            background: getColorScaleCSS(scale),
                                            borderRadius: '2px',
                                            border: '1px solid rgba(0,0,0,0.1)'
                                        }}
                                    />
                                </div>
                            </Option>
                        ))}
                    </Dropdown>
                </Field>

                {/* Opacity */}
                <Field label={`Opacity: ${opacity}`}>
                    <Slider
                        min={CONTOUR_PLOT_OPTIONS.opacityRange[0]}
                        max={CONTOUR_PLOT_OPTIONS.opacityRange[1]}
                        step={0.1}
                        value={opacity}
                        onChange={(_, data) => setOpacity(data.value)}
                    />
                </Field>

                {/* Grid Settings */}
                <Field label="Show Grid">
                    <Switch
                        checked={showGrid}
                        onChange={(_, data) => setShowGrid(data.checked)}
                    />
                </Field>

                {showGrid && (
                    <Field label={`Grid Opacity: ${gridOpacity}`}>
                        <Slider
                            min={CONTOUR_PLOT_OPTIONS.gridOpacityRange[0]}
                            max={CONTOUR_PLOT_OPTIONS.gridOpacityRange[1]}
                            step={0.1}
                            value={gridOpacity}
                            onChange={(_, data) => setGridOpacity(data.value)}
                        />
                    </Field>
                )}

                {/* Contour Specific Settings */}
                {contourType === 'contour' && (
                    <>
                        <Field label="Z Interval (Height between lines)">
                            <Input
                                type="number"
                                value={zInterval.toString()}
                                onChange={(e, data) => setZInterval(Number(data.value))}
                            />
                        </Field>

                        <Field label="Show Z Values on Lines">
                            <Switch
                                checked={showLabels}
                                onChange={(_, data) => setShowLabels(data.checked)}
                            />
                        </Field>
                    </>
                )}
            </div>
        </div>
    );
};
