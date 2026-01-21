import { FC } from 'react';
import { Text } from '@fluentui/react-components';
import { MdTrendingUp } from 'react-icons/md';

/**
 * Props for the AreaHeader component
 */
interface HeaderProps {
    classes: Record<string, string>;
}

/**
 * Header component for area plot configuration
 */
export const AreaHeader: FC<HeaderProps> = ({ classes }) => {
    return (
        <div className={classes.header}>
            <div className={classes.headerTitleRow}>
                <MdTrendingUp size={24} />
                <Text size={500} weight="semibold">Area Plot Configuration</Text>
            </div>
            <Text size={200} className={classes.headerSubtitle}>
                Create professional area plots with customizable variables and data formats
            </Text>
        </div>
    );
};
