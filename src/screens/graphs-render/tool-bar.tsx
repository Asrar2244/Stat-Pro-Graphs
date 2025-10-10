import { FC } from 'react';
import { Text, Toolbar, ToolbarButton } from '@fluentui/react-components';
import { MdHistory, MdSettings } from 'react-icons/md';
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
  setFontBold: (value: boolean) => void;
  setFontItalic: (value: boolean) => void;
  setFontSize: (value: number) => void;
  setFontColor: (value: string) => void;
  toggleShowHistory: () => void;
  toggleGraphProperties: () => void;
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
        
        <ToolbarButton
          icon={<MdSettings />}
          onClick={tools.toggleGraphProperties}
          appearance={tools.showGraphProperties ? 'primary' : 'subtle'}
          style={{ marginLeft: 'auto' }}
        >
          Properties
        </ToolbarButton>
        
        <ToolbarButton
          icon={<MdHistory />}
          onClick={tools.toggleShowHistory}
          appearance={tools.showHistory ? 'primary' : 'subtle'}
          style={{ marginLeft: tokens.spacingHorizontalM }}
        >
          History ({tools.totalRuns})
        </ToolbarButton>
      </Toolbar>
    </div>
  );
};
