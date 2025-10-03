import { FC } from 'react';
import { Text, Toolbar, ToolbarButton } from '@fluentui/react-components';
import { MdHistory, MdSettings } from 'react-icons/md';
import { tokens } from '@fluentui/react-components';
import { GraphProperties, GlobalGraphProperties, PlotSpecificProperties } from './hooks/use-tools';

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
  return (
    <div style={{ 
      background: `linear-gradient(135deg, ${tokens.colorBrandBackground2} 0%, ${tokens.colorBrandBackground} 100%)`,
      padding: tokens.spacingVerticalM,
      borderBottom: `2px solid ${tokens.colorBrandStroke1}`,
      boxShadow: `0 2px 8px ${tokens.colorNeutralShadowAmbient}`
    }}>
      <Toolbar>
        <ToolbarButton>
          <Text style={{ 
            fontWeight: 'bold', 
            color: tokens.colorBrandForeground1,
            fontSize: tokens.fontSizeBase400
          }}>
            {title}
          </Text>
          {subTitle && (
            <Text style={{ 
              fontSize: tokens.fontSizeBase200, 
              color: tokens.colorBrandForeground2, 
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
