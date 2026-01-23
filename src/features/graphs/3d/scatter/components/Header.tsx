import { FC } from 'react';
import { Text } from '@fluentui/react-components';
import { MdDashboard } from 'react-icons/md';

/**
 * Props for the ScatterHeader component
 */
interface HeaderProps {
    classes: Record<string, string>;
}

/**
 * Header component for 3D scatter plot configuration
 */
export const ScatterHeader: FC<HeaderProps> = ({ classes }) => {
    return (
        <div className={classes.header}>
            <div className={classes.headerTitleRow}>
                <MdDashboard size={24} />
                <Text size={500} weight="semibold">3D Scatter Plot Configuration</Text>
            </div>
            <Text size={200} className={classes.headerSubtitle}>
                Create professional 3D scatter plots with customizable variables, data formats, and marker styles
            </Text>
        </div>
    );
};
