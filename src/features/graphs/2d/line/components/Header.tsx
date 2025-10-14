import { FC } from 'react';
import { Text } from '@fluentui/react-components';
import { MdShowChart } from 'react-icons/md';

/**
 * Props for the LineHeader component
 */
interface HeaderProps {
  classes: Record<string, string>;
}

/**
 * Header component for line plot configuration
 */
export const LineHeader: FC<HeaderProps> = ({ classes }) => {
  return (
    <div className={classes.header}>
      <div className={classes.headerTitleRow}>
        <MdShowChart size={24} />
        <Text size={500} weight="semibold">Line Plot Configuration</Text>
      </div>
      <Text size={200} className={classes.headerSubtitle}>
        Create professional line plots with customizable variables, data formats, and line styles
      </Text>
    </div>
  );
};



