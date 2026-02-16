import { FC } from 'react';
import { Text } from '@fluentui/react-components';
import { MdDashboard } from 'react-icons/md';

/**
 * Props for the ContourHeader component
 */
interface HeaderProps {
    classes: Record<string, string>;
}

/**
 * Header component for Contour plot configuration
 */
export const ContourHeader: FC<HeaderProps> = ({ classes }) => {
    return (
        <div className={classes.header}>
            <div className={classes.headerTitleRow}>
                <MdDashboard size={24} />
                <Text size={500} weight="semibold">Contour Plot Configuration</Text>
            </div>
            <Text size={200} className={classes.headerSubtitle}>
                Create professional Contour plots with customizable variables, data formats, and contour styles (Contour or Filled)
            </Text>
        </div>
    );
};
