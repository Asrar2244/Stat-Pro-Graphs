import { FC } from 'react';
import { Text } from '@fluentui/react-components';
import { MdBarChart } from 'react-icons/md';

interface HeaderProps {
    classes: Record<string, string>;
}

export const BarHeader: FC<HeaderProps> = ({ classes }) => {
    return (
        <div className={classes.header}>
            <div className={classes.headerTitleRow}>
                <MdBarChart size={24} />
                <Text size={500} weight="semibold">Bar Plot Configuration</Text>
            </div>
            <Text size={200} className={classes.headerSubtitle}>
                Create professional bar plots with customizable variables and data formats
            </Text>
        </div>
    );
};
