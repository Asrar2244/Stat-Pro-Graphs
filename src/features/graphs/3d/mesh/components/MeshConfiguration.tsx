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
          <Option value="viridis">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(68,1,84), rgb(72,40,120), rgb(62,74,137), rgb(49,104,142), rgb(38,130,142), rgb(31,158,137), rgb(53,183,121), rgb(109,205,89), rgb(180,222,44), rgb(253,231,37))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Viridis</span>
            </div>
          </Option>
          <Option value="plasma">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(13,8,135), rgb(75,3,161), rgb(125,3,168), rgb(168,34,150), rgb(203,70,121), rgb(225,97,97), rgb(243,131,77), rgb(252,164,69), rgb(254,202,99), rgb(240,249,33))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Plasma</span>
            </div>
          </Option>
          <Option value="inferno">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(0,0,4), rgb(31,12,72), rgb(85,15,109), rgb(136,34,106), rgb(186,54,85), rgb(227,89,51), rgb(249,140,10), rgb(254,201,41), rgb(254,255,65))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Inferno</span>
            </div>
          </Option>
          <Option value="magma">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(0,0,4), rgb(28,16,68), rgb(79,18,123), rgb(129,37,129), rgb(181,54,122), rgb(229,80,100), rgb(251,135,97), rgb(254,194,135), rgb(255,253,164), rgb(252,255,164))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Magma</span>
            </div>
          </Option>
          <Option value="cividis">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(0,32,76), rgb(0,42,102), rgb(0,52,110), rgb(39,63,108), rgb(72,73,103), rgb(99,86,99), rgb(125,96,95), rgb(151,108,95), rgb(177,119,96), rgb(255,233,69))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Cividis</span>
            </div>
          </Option>
          <Option value="turbo">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(35,23,27), rgb(25,29,81), rgb(25,105,156), rgb(34,161,152), rgb(124,180,87), rgb(202,214,19), rgb(255,232,69), rgb(255,163,67), rgb(230,97,1), rgb(230,97,1))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Turbo</span>
            </div>
          </Option>
          <Option value="hot">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(0,0,0), rgb(128,0,0), rgb(255,0,0), rgb(255,128,0), rgb(255,255,0), rgb(255,255,128), rgb(255,255,255))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Hot</span>
            </div>
          </Option>
          <Option value="cool">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(0,255,255), rgb(0,191,255), rgb(0,128,255), rgb(0,64,255), rgb(0,0,255), rgb(64,0,255), rgb(128,0,255))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Cool</span>
            </div>
          </Option>
          <Option value="rainbow">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(255,0,0), rgb(255,128,0), rgb(255,255,0), rgb(128,255,0), rgb(0,255,0), rgb(0,255,128), rgb(0,255,255), rgb(0,128,255), rgb(0,0,255), rgb(128,0,255), rgb(255,0,255))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Rainbow</span>
            </div>
          </Option>
          <Option value="jet">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(0,0,131), rgb(0,60,170), rgb(5,255,255), rgb(255,255,0), rgb(255,0,0), rgb(200,0,0), rgb(180,0,0), rgb(160,0,0), rgb(139,0,0))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Jet</span>
            </div>
          </Option>
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