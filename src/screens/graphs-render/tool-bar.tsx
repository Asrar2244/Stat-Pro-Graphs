import { FC } from 'react';
import { Text, Toolbar, ToolbarButton, Switch, Tooltip } from '@fluentui/react-components';
import { MdHistory, MdSettings, MdLightMode, MdDarkMode } from 'react-icons/md';
import { tokens } from '@fluentui/react-components';
import { GraphProperties, GlobalGraphProperties, PlotSpecificProperties } from './hooks/use-tools';
import { useThemeStore } from '@store';
import { useShallow } from 'zustand/react/shallow';

interface IToolBar {
  fontBold: boolean;
  fontItalic: boolean;
  fontSize: number;
  fontColor: string;
  showHistory: boolean;
  showGraphProperties: boolean;
  totalRuns: number;
  graphProperties: GraphProperties;
  canvasMode: 'light' | 'dark';
  setFontBold: (value: boolean) => void;
  setFontItalic: (value: boolean) => void;
  setFontSize: (value: number) => void;
  setFontColor: (value: string) => void;
  toggleShowHistory: () => void;
  toggleGraphProperties: () => void;
  toggleCanvasMode: () => void;
  updateGraphProperty: <K extends keyof GlobalGraphProperties>(key: K, value: GlobalGraphProperties[K]) => void;
  updatePlotSpecificProperty: <T extends keyof PlotSpecificProperties>(plotType: T, key: keyof NonNullable<PlotSpecificProperties[T]>, value: any) => void;
  getCurrentPlotType: (subType?: string) => keyof PlotSpecificProperties | null;
  setTotalRuns: (value: number) => void;
}

interface IToolBarProps {
  tools: IToolBar;
  title: string;
  subTitle?: string;
}

export const ToolBar: FC<IToolBarProps> = ({ tools, title, subTitle }) => {
  const { theme } = useThemeStore(useShallow((state) => ({ theme: state.theme })));
  
  // Theme-aware colors
  const isDark = theme === 'dark';
  const backgroundColor = isDark 
    ? `linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)`
    : `linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)`;
  const borderColor = isDark ? '#404040' : '#d0d0d0';
  const boxShadow = isDark 
    ? `0 2px 8px rgba(0, 0, 0, 0.3)`
    : `0 2px 8px rgba(0, 0, 0, 0.1)`;
  const titleColor = isDark ? '#ffffff' : '#000000';
  const subtitleColor = isDark ? '#cccccc' : '#666666';

  return (
    <div style={{ 
      background: backgroundColor,
      padding: tokens.spacingVerticalM,
      borderBottom: `2px solid ${borderColor}`,
      boxShadow: boxShadow
    }}>
      <Toolbar>
        <ToolbarButton>
          <Text style={{ 
            fontWeight: 'bold', 
            color: titleColor,
            fontSize: tokens.fontSizeBase400
          }}>
            {title}
          </Text>
          {subTitle && (
            <Text style={{ 
              fontSize: tokens.fontSizeBase200, 
              color: subtitleColor, 
              marginLeft: tokens.spacingHorizontalM 
            }}>
              {subTitle}
            </Text>
          )}
        </ToolbarButton>
        
        <div 
          style={{ 
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalM
          }}
        >
          <Tooltip content="Properties" relationship="label" withArrow>
            <ToolbarButton
              icon={<MdSettings />}
              onClick={tools.toggleGraphProperties}
              appearance={tools.showGraphProperties ? 'primary' : 'subtle'}
              style={{ 
                minWidth: 'auto',
                padding: '8px 12px'
              }}
            />
          </Tooltip>
          
          <Tooltip content={`History (${tools.totalRuns})`} relationship="label" withArrow>
            <ToolbarButton
              icon={<MdHistory />}
              onClick={tools.toggleShowHistory}
              appearance={tools.showHistory ? 'primary' : 'subtle'}
              style={{ 
                minWidth: 'auto',
                padding: '8px 12px'
              }}
            />
          </Tooltip>
          
          <Tooltip content={`${tools.canvasMode === 'light' ? 'Switch to Dark' : 'Switch to Light'} Mode`} relationship="label" withArrow>
            <div 
              style={{ 
                position: 'relative'
              }}
            >
              <Switch
                checked={tools.canvasMode === 'dark'}
                onChange={() => {
                  tools.toggleCanvasMode();
                }}
                style={{
                  '--switch-thumb-size': '32px',
                  '--switch-track-width': '64px',
                  '--switch-track-height': '32px',
                  '--switch-thumb-transition': 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '--switch-track-transition': 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '--switch-track-checked-background': '#0078d4',
                  '--switch-track-unchecked-background': '#e1dfdd',
                  '--switch-thumb-checked-background': '#ffffff',
                  '--switch-thumb-unchecked-background': '#ffffff',
                  '--switch-track-border-radius': '16px',
                  '--switch-thumb-border-radius': '16px'
                } as React.CSSProperties}
              />
          {/* Light icon inside switch track (left side) */}
          <div
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '16px',
              height: '16px',
              transition: 'all 0.3s ease-in-out'
            }}
          >
            <MdLightMode 
              style={{ 
                color: tools.canvasMode === 'light' ? '#ffffff' : '#666666',
                fontSize: '12px',
                transition: 'color 0.3s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} 
            />
          </div>
          {/* Dark icon inside switch track (right side) */}
          <div
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '16px',
              height: '16px',
              transition: 'all 0.3s ease-in-out'
            }}
          >
            <MdDarkMode 
              style={{ 
                color: tools.canvasMode === 'dark' ? '#ffffff' : '#666666',
                fontSize: '12px',
                transition: 'color 0.3s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} 
            />
          </div>
            </div>
          </Tooltip>
        </div>
      </Toolbar>
    </div>
  );
};
