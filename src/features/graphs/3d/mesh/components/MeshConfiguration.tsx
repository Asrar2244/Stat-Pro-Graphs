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
          
          {/* Scientific Color Scales */}
          <Option value="blues">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(247,251,255), rgb(222,235,247), rgb(198,219,239), rgb(158,202,225), rgb(107,174,214), rgb(66,146,198), rgb(33,113,181), rgb(8,81,156), rgb(8,48,107))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Blues</span>
            </div>
          </Option>
          
          <Option value="greens">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(247,252,245), rgb(229,245,224), rgb(199,233,192), rgb(161,217,155), rgb(116,196,118), rgb(65,171,93), rgb(35,139,69), rgb(0,109,44), rgb(0,68,27))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Greens</span>
            </div>
          </Option>
          
          <Option value="reds">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(255,245,240), rgb(254,224,210), rgb(252,187,161), rgb(252,146,114), rgb(251,106,74), rgb(239,59,44), rgb(203,24,29), rgb(165,15,21), rgb(103,0,13))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Reds</span>
            </div>
          </Option>
          
          <Option value="oranges">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(255,247,236), rgb(254,230,206), rgb(253,208,162), rgb(253,174,107), rgb(253,141,60), rgb(241,105,19), rgb(217,72,1), rgb(166,54,3), rgb(127,39,4))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Oranges</span>
            </div>
          </Option>
          
          <Option value="purples">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(252,251,253), rgb(239,237,245), rgb(218,218,235), rgb(188,189,220), rgb(158,154,200), rgb(128,125,186), rgb(106,81,163), rgb(84,39,143), rgb(63,0,125))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Purples</span>
            </div>
          </Option>
          
          <Option value="greys">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(255,255,255), rgb(240,240,240), rgb(204,204,204), rgb(150,150,150), rgb(99,99,99), rgb(37,37,37), rgb(0,0,0))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Greys</span>
            </div>
          </Option>
          
          {/* Diverging Color Scales */}
          <Option value="rdbu">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(5,10,172), rgb(106,137,247), rgb(190,190,190), rgb(220,220,220), rgb(255,255,255), rgb(255,255,255), rgb(255,255,255), rgb(250,95,60), rgb(103,0,31))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Red-Blue</span>
            </div>
          </Option>
          
          <Option value="rdylbu">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(165,0,38), rgb(215,48,39), rgb(244,109,67), rgb(253,174,97), rgb(254,224,144), rgb(255,255,191), rgb(224,243,248), rgb(171,217,233), rgb(116,173,209), rgb(69,117,180), rgb(49,54,149))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Red-Yellow-Blue</span>
            </div>
          </Option>
          
          <Option value="spectral">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(158,1,66), rgb(213,62,79), rgb(244,109,67), rgb(253,174,97), rgb(254,224,139), rgb(255,255,191), rgb(230,245,152), rgb(171,221,164), rgb(102,194,165), rgb(50,136,189), rgb(94,79,162))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Spectral</span>
            </div>
          </Option>
          
          <Option value="rdylgn">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(165,0,38), rgb(215,48,39), rgb(244,109,67), rgb(253,174,97), rgb(254,224,144), rgb(255,255,191), rgb(217,240,163), rgb(173,221,142), rgb(120,198,121), rgb(49,163,84), rgb(0,104,55))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Red-Yellow-Green</span>
            </div>
          </Option>
          
          {/* Professional Color Scales */}
          <Option value="piyg">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(142,1,82), rgb(197,27,125), rgb(222,119,174), rgb(241,182,218), rgb(253,224,239), rgb(247,247,247), rgb(230,245,208), rgb(184,225,134), rgb(127,188,65), rgb(77,146,33), rgb(39,100,25))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Pink-Yellow-Green</span>
            </div>
          </Option>
          
          <Option value="prgn">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(64,0,75), rgb(118,42,131), rgb(153,112,171), rgb(194,165,207), rgb(231,212,232), rgb(247,247,247), rgb(217,240,211), rgb(166,219,160), rgb(90,174,97), rgb(27,120,55), rgb(0,68,27))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Purple-Green</span>
            </div>
          </Option>
          
          <Option value="brbg">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(84,48,5), rgb(140,81,10), rgb(191,129,45), rgb(223,194,125), rgb(246,232,195), rgb(245,245,245), rgb(199,234,229), rgb(128,205,193), rgb(53,151,143), rgb(1,102,94), rgb(0,60,48))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Brown-Green</span>
            </div>
          </Option>
          
          {/* Medical/Scientific Scales */}
          <Option value="bone">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(0,0,0), rgb(21,21,30), rgb(42,42,60), rgb(64,64,90), rgb(85,85,120), rgb(106,106,150), rgb(128,128,180), rgb(149,149,210), rgb(170,170,240), rgb(255,255,255))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Bone</span>
            </div>
          </Option>
          
          <Option value="copper">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(0,0,0), rgb(30,17,0), rgb(60,34,0), rgb(90,51,0), rgb(120,68,0), rgb(150,85,0), rgb(180,102,0), rgb(210,119,0), rgb(240,136,0), rgb(255,153,0))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Copper</span>
            </div>
          </Option>
          
          <Option value="pink">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(30,0,0), rgb(60,0,0), rgb(90,0,0), rgb(120,0,0), rgb(150,0,0), rgb(180,0,0), rgb(210,0,0), rgb(240,0,0), rgb(255,0,0), rgb(255,255,255))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Pink</span>
            </div>
          </Option>
          
          <Option value="spring">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(255,0,255), rgb(255,51,204), rgb(255,102,153), rgb(255,153,102), rgb(255,204,51), rgb(255,255,0))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Spring</span>
            </div>
          </Option>
          
          <Option value="summer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(0,128,102), rgb(0,153,102), rgb(0,178,102), rgb(0,203,102), rgb(0,228,102), rgb(0,255,102))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Summer</span>
            </div>
          </Option>
          
          <Option value="autumn">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(255,0,0), rgb(255,64,0), rgb(255,128,0), rgb(255,192,0), rgb(255,255,0))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Autumn</span>
            </div>
          </Option>
          
          <Option value="winter">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(0,0,255), rgb(0,64,255), rgb(0,128,255), rgb(0,192,255), rgb(0,255,255))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Winter</span>
            </div>
          </Option>
          
          {/* Additional Professional Scales */}
          <Option value="tab10">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(31,119,180), rgb(255,127,14), rgb(44,160,44), rgb(214,39,40), rgb(148,103,189), rgb(140,86,75), rgb(227,119,194), rgb(127,127,127), rgb(188,189,34), rgb(23,190,207))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Tab10</span>
            </div>
          </Option>
          
          <Option value="set1">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(228,26,28), rgb(55,126,184), rgb(77,175,74), rgb(152,78,163), rgb(255,127,0), rgb(255,255,51), rgb(166,86,40), rgb(247,129,191), rgb(153,153,153))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Set1</span>
            </div>
          </Option>
          
          <Option value="set2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(102,194,165), rgb(252,141,98), rgb(141,160,203), rgb(231,138,195), rgb(166,216,84), rgb(255,217,47), rgb(229,196,148), rgb(179,179,179))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Set2</span>
            </div>
          </Option>
          
          <Option value="set3">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '12px',
                background: 'linear-gradient(to right, rgb(141,211,199), rgb(255,255,179), rgb(190,186,218), rgb(251,128,114), rgb(128,177,211), rgb(253,180,98), rgb(179,222,105), rgb(252,205,229), rgb(217,217,217), rgb(188,128,189), rgb(204,235,197), rgb(255,237,111))',
                borderRadius: '2px',
                border: '1px solid #ccc'
              }} />
              <span>Set3</span>
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