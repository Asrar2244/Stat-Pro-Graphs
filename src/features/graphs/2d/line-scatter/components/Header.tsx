import { FC } from 'react';
import { Text } from '@fluentui/react-components';
import { MdTimeline } from 'react-icons/md';
import { useLineScatterPlotStyles } from '../styles-hook/use-line-scatter-plot-styles';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const LineScatterHeader: FC<HeaderProps> = ({ 
  title = "Line-Scatter Plot Configuration",
  subtitle = "Configure your line-scatter plot with error bars, step plots, and spline curves"
}) => {
  const classes = useLineScatterPlotStyles();
  
  return (
    <div className={classes.header}>
      <div className={classes.headerTitleRow}>
        <MdTimeline size={24} />
        <Text size={500} weight="semibold">
          {title}
        </Text>
      </div>
      {subtitle && (
        <Text size={200} className={classes.headerSubtitle}>
          {subtitle}
        </Text>
      )}
    </div>
  );
};
