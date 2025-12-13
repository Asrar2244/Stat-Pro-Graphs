import { FC, useState } from 'react';
import { Button, tokens } from '@fluentui/react-components';
import { MdOutlinePushPin, MdPushPin } from 'react-icons/md';
import { useGraphsStyles } from './styles-hook/use-graphs-styles';
import { useGraphs } from './use-graphs';
import { graph3DOptions } from './constants';
import type { GraphsDropdownPanelProps } from './types';
import { ComingSoonModal } from '../coming-soon';
import { useModal } from '@hooks';

// List of implemented graph types
const IMPLEMENTED_GRAPHS = [
  'open-scatter-plot-modal',
  'open-line-plot-modal',
  'open-line-scatter-plot-modal',
  '3d-mesh',
];

export const GraphsDropdownPanel: FC<GraphsDropdownPanelProps> = ({ open, onClose, setMenuItem: propSetMenuItem, pinned: propPinned, setPinned: propSetPinned }) => {
  const classes = useGraphsStyles();
  const [localPinned, setLocalPinned] = useState(false);
  const pinned = propPinned !== undefined ? propPinned : localPinned;
  const setPinned = propSetPinned || setLocalPinned;
  
  const onCloseIfNotPinned = () => { if (!pinned) onClose(); };
  const comingSoonModal = useModal({});
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  const {
    filtered2DOptions,
    filteredAdvancedOptions,
  } = useGraphs(propSetMenuItem, onCloseIfNotPinned);

  if (!open) return null;

  const renderRibbonRow = (options: any[], title: string, color: string, strokeColor: string) => {
    return (
    <div style={{ marginBottom: tokens.spacingVerticalS }}>
      <div style={{
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold,
        color: color,
        marginBottom: tokens.spacingVerticalXS,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        fontFamily: tokens.fontFamilyBase,
        textShadow: `0 1px 2px ${tokens.colorNeutralShadowAmbient}`,
        borderBottom: `1px solid ${strokeColor}`,
        paddingBottom: tokens.spacingVerticalXXS,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXXS
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 4px ${color}`
        }} />
        {title}
      </div>
      
      <div>
    <div
      className="graphsRibbon"
      style={{
        display: 'flex',
            gap: tokens.spacingHorizontalXS,
            padding: tokens.spacingVerticalXS,
            background: `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`,
            border: `1px solid ${tokens.colorNeutralStroke2}`,
            borderRadius: tokens.borderRadiusSmall,
            boxShadow: tokens.shadow2,
            minHeight: '60px',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            overflowY: 'hidden',
            maxWidth: '600px'
          }}
        >
          {options.map((category) => 
            category.children?.map((graphType: any) => {
              const IconComponent = graphType.icon;
              return (
                <Button
                  key={graphType.value}
                  type="button"
                  appearance="outline"
                  onClick={() => {
                    if (graphType.execute) {
                      // Check if this graph type is implemented
                      if (IMPLEMENTED_GRAPHS.includes(graphType.execute)) {
                        propSetMenuItem(graphType.execute);
                        if (!pinned) {
                          onClose();
                        }
                      } else {
                        // Show coming soon modal with the graph name
                        setComingSoonFeature(graphType.label);
                        comingSoonModal.openModal();
                      }
                    }
                  }}
            style={{
                    width: '100px',
                    minWidth: '100px',
                    height: '50px',
                    display: 'flex',
                    flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
                    gap: tokens.spacingVerticalXXS,
                    borderRadius: tokens.borderRadiusSmall,
                    border: `1px solid ${tokens.colorNeutralStroke2}`,
                    background: `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`,
                    boxShadow: tokens.shadow2,
              cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    flexShrink: 0
            }}
            onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${color} 0%, ${color}20 100%)`;
                    e.currentTarget.style.borderColor = strokeColor;
                    e.currentTarget.style.boxShadow = tokens.shadow8;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`;
                    e.currentTarget.style.borderColor = tokens.colorNeutralStroke2;
                    e.currentTarget.style.boxShadow = tokens.shadow2;
              e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {IconComponent && <IconComponent size={16} />}
                  <div style={{ fontSize: tokens.fontSizeBase100, fontWeight: tokens.fontWeightSemibold }}>
                    {graphType.label}
                  </div>
                </Button>
              );
            })
          )}
        </div>
          </div>
    </div>
    );
  };

  return (
    <>
      {/* Coming Soon Modal */}
      {comingSoonModal.open && (
        <ComingSoonModal 
          {...comingSoonModal} 
          featureName={comingSoonFeature ? `${comingSoonFeature} graph` : 'This graph type'}
        />
      )}
      {/* Backdrop to close the slider when clicking outside */}
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 1000,
          pointerEvents: pinned ? 'none' : 'auto' 
        }} 
        onClick={(e) => {
          if (!pinned && e.target === e.currentTarget) {
            e.stopPropagation();
            onCloseIfNotPinned();
          }
        }}
        onMouseDown={(e) => {
          if (!pinned && e.target === e.currentTarget) {
            e.stopPropagation();
          }
        }}
      />
      
      <div style={classes.container}>
        {/* Pin control */}
        <div 
          style={{ 
            position: 'absolute', 
            right: 12, 
            bottom: 8, 
            zIndex: 1002, 
            cursor: 'pointer' 
          }}
             onClick={(e) => { e.stopPropagation(); setPinned(!pinned); }}
          title={pinned ? 'Unpin panel' : 'Pin panel'}
        >
          {pinned ? <MdPushPin size={14} /> : <MdOutlinePushPin size={14} />}
        </div>

        <style>
          {`
            .graphsRibbon::-webkit-scrollbar {
              height: 6px;
            }
            .graphsRibbon::-webkit-scrollbar-track {
              background: ${tokens.colorNeutralBackground2};
              border-radius: 4px;
              border: 1px solid ${tokens.colorNeutralStroke2};
              box-shadow: inset 0 1px 2px ${tokens.colorNeutralShadowAmbient};
            }
            .graphsRibbon::-webkit-scrollbar-thumb {
              background: ${tokens.colorNeutralStroke1};
              border-radius: 4px;
              border: 1px solid ${tokens.colorNeutralStroke2};
              box-shadow: 0 1px 2px ${tokens.colorNeutralShadowAmbient};
            }
            .graphsRibbon::-webkit-scrollbar-thumb:hover {
              background: ${tokens.colorNeutralStroke1Hover};
              box-shadow: 0 2px 4px ${tokens.colorNeutralShadowKey};
            }
          `}
        </style>
        
        <div style={classes.content}>
        {/* 2D Graphs Section */}
        {renderRibbonRow(
          filtered2DOptions, 
          '2D Graphs', 
          tokens.colorBrandForeground1, 
          tokens.colorBrandStroke1
        )}

        {/* 3D Graphs Section */}
        {renderRibbonRow(
          graph3DOptions, 
          '3D Graphs', 
          tokens.colorPalettePurpleForeground2, 
          tokens.colorBrandStroke1
        )}

        {/* Advanced Graphs Section */}
        {renderRibbonRow(
          filteredAdvancedOptions, 
          'Advanced Graphs', 
          tokens.colorPaletteBlueForeground2, 
          tokens.colorBrandStroke1
        )}
        </div>
      </div>
    </>
  );
};