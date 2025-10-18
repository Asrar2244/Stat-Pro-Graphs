import { FC, useState } from 'react';
import { Field, Dropdown, Option, Slider, Text, tokens, Button } from '@fluentui/react-components';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import { useMeshPlotStore } from '../meshPlotSlice';
import { useMeshConfigurationStyles } from '../styles-hook/use-mesh-configuration-styles';

/**
 * Props for the MeshConfiguration component
 */
interface MeshConfigurationProps {
  classes: Record<string, string>;
}

/**
 * Component for configuring 3D mesh plot specific options
 */
export const MeshConfiguration: FC<MeshConfigurationProps> = ({ classes }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    opacity,
    surfaceType,
    colorScale,
    showContours,
    contourOpacity,
    lighting,
    smoothShading,
    showGrid,
    gridOpacity,
    setOpacity,
    setSurfaceType,
    setColorScale,
    setShowContours,
    setContourOpacity,
    setLighting,
    setSmoothShading,
    setShowGrid,
    setGridOpacity,
  } = useMeshPlotStore();

  return (
    <div className={classes.meshConfiguration}>
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
          Mesh Configuration
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
      {/* Surface Type */}
      <Field label="Surface Type">
        <Dropdown
          value={surfaceType}
          onOptionSelect={(_, data) => setSurfaceType(data.optionValue as any)}
        >
          <Option value="mesh">Mesh</Option>
          <Option value="surface">Surface</Option>
          <Option value="wireframe">Wireframe</Option>
        </Dropdown>
      </Field>

      {/* Color Scale */}
      <Field label="Color Scale">
        <Dropdown
          value={colorScale}
          onOptionSelect={(_, data) => setColorScale(data.optionValue)}
        >
          <Option value="viridis">Viridis</Option>
          <Option value="plasma">Plasma</Option>
          <Option value="inferno">Inferno</Option>
          <Option value="magma">Magma</Option>
          <Option value="cividis">Cividis</Option>
          <Option value="turbo">Turbo</Option>
          <Option value="hot">Hot</Option>
          <Option value="cool">Cool</Option>
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

      {/* Show Contours */}
      <Field label="Show Contours">
        <Dropdown
          value={showContours ? 'Yes' : 'No'}
          onOptionSelect={(_, data) => setShowContours(data.optionValue === 'Yes')}
        >
          <Option value="Yes">Yes</Option>
          <Option value="No">No</Option>
        </Dropdown>
      </Field>

      {/* Contour Opacity */}
      {showContours && (
        <Field label={`Contour Opacity: ${Math.round(contourOpacity * 100)}%`}>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={contourOpacity}
            onChange={(_, data) => setContourOpacity(data.value)}
          />
        </Field>
      )}

      {/* Lighting */}
      <Field label="Lighting">
        <Dropdown
          value={lighting ? 'Yes' : 'No'}
          onOptionSelect={(_, data) => setLighting(data.optionValue === 'Yes')}
        >
          <Option value="Yes">Yes</Option>
          <Option value="No">No</Option>
        </Dropdown>
      </Field>

      {/* Smooth Shading */}
      <Field label="Smooth Shading">
        <Dropdown
          value={smoothShading ? 'Yes' : 'No'}
          onOptionSelect={(_, data) => setSmoothShading(data.optionValue === 'Yes')}
        >
          <Option value="Yes">Yes</Option>
          <Option value="No">No</Option>
        </Dropdown>
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