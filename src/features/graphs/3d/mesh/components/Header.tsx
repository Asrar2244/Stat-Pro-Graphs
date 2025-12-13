import { FC } from 'react';
import { Text } from '@fluentui/react-components';
import { MdDashboard } from 'react-icons/md';

/**
 * Props for the MeshHeader component
 */
interface HeaderProps {
  classes: Record<string, string>;
}

/**
 * Header component for 3D mesh plot configuration
 */
export const MeshHeader: FC<HeaderProps> = ({ classes }) => {
  return (
    <div className={classes.header}>
      <div className={classes.headerTitleRow}>
        <MdDashboard size={24} />
        <Text size={500} weight="semibold">3D Mesh Plot Configuration</Text>
      </div>
      <Text size={200} className={classes.headerSubtitle}>
        Create professional 3D mesh plots with customizable variables, data formats, and mesh styles
      </Text>
    </div>
  );
};
























