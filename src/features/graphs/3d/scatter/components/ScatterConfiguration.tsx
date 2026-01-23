import { FC, useState } from 'react';
import { Field, Dropdown, Option, Slider, Text, tokens, Button } from '@fluentui/react-components';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import { useScatterPlotStore } from '../scatterPlotSlice';
import { useScatterConfigurationStyles } from '../styles-hook/use-scatter-configuration-styles';

/**
 * Props for the ScatterConfiguration component
 */
interface ScatterConfigurationProps {
    classes: Record<string, string>;
}

/**
 * Component for configuring 3D scatter plot specific options
 */
export const ScatterConfiguration: FC<ScatterConfigurationProps> = ({ classes }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        opacity,
        markerSize,
        colorScale,
        showGrid,
        gridOpacity,
        setOpacity,
        setMarkerSize,
        setColorScale,
        setShowGrid,
        setGridOpacity,
    } = useScatterPlotStore();

    return (
        <div className={classes.scatterConfiguration}>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                padding: tokens.spacingVerticalS,
                borderBottom: isExpanded ? `1px solid ${tokens.colorNeutralStroke2}` : 'none',
                transition: 'all 0.2s ease-in-out'
            }} onClick={() => setIsExpanded(!isExpanded)}>
                <Text size={400} weight="semibold" className={classes.sectionTitle}>
                    Scatter Configuration
                </Text>
                <Button
                    appearance="subtle"
                    icon={isExpanded ? <MdExpandLess /> : <MdExpandMore />}
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    style={{ minWidth: 'auto', padding: '4px' }}
                />
            </div>

            {/* Collapsible Content */}
            {isExpanded && (
                <div style={{
                    padding: tokens.spacingVerticalM,
                    animation: 'fadeIn 0.2s ease-in-out'
                }}>
                    {/* Marker Size */}
                    <Field label={`Marker Size: ${markerSize}`}>
                        <Slider
                            min={1}
                            max={20}
                            step={1}
                            value={markerSize}
                            onChange={(_, data) => setMarkerSize(data.value)}
                        />
                    </Field>

                    {/* Color Scale */}
                    <Field label="Color Scale">
                        <Dropdown
                            value={colorScale}
                            onOptionSelect={(_, data) => setColorScale(data.optionValue)}
                        >
                            {/* Include color scale options - duplicate from mesh or reuse if possible. 
              Since they are JSX options, I will duplicate them here for now to keep it self contained. */}
                            <Option value="viridis">Viridis</Option>
                            <Option value="plasma">Plasma</Option>
                            <Option value="inferno">Inferno</Option>
                            <Option value="magma">Magma</Option>
                            <Option value="cividis">Cividis</Option>
                            <Option value="turbo">Turbo</Option>
                            {/* Add more common ones */}
                            <Option value="rainbow">Rainbow</Option>
                            <Option value="jet">Jet</Option>
                        </Dropdown>
                    </Field>

                    {/* Opacity */}
                    <Field label={`Opacity: ${Math.round(opacity * 100)}%`}>
                        <Slider
                            min={0}
                            max={1}
                            step={0.1}
                            value={opacity}
                            onChange={(_, data) => setOpacity(data.value)}
                        />
                    </Field>

                    {/* Show Grid */}
                    <Field label="Show Grid">
                        <Dropdown
                            value={showGrid ? 'Yes' : 'No'}
                            onOptionSelect={(_, data) => setShowGrid(data.optionValue === 'Yes')}
                        >
                            <Option value="Yes">Yes</Option>
                            <Option value="No">No</Option>
                        </Dropdown>
                    </Field>

                    {/* Grid Opacity */}
                    {showGrid && (
                        <Field label={`Grid Opacity: ${Math.round(gridOpacity * 100)}%`}>
                            <Slider
                                min={0}
                                max={1}
                                step={0.1}
                                value={gridOpacity}
                                onChange={(_, data) => setGridOpacity(data.value)}
                            />
                        </Field>
                    )}
                </div>
            )}
        </div>
    );
};
