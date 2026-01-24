import { FC } from 'react';
import { Text } from '@fluentui/react-components';
import { MdPieChart } from 'react-icons/md';

interface HeaderProps {
    classes: Record<string, string>;
}

export const PieHeader: FC<HeaderProps> = ({ classes }) => {
    return (
        <div className={classes.header}>
            <div className={classes.headerTitleRow}>
                <MdPieChart size={24} />
                <Text size={500} weight="semibold">Pie Chart Configuration</Text>
            </div>
            <Text size={200} className={classes.headerSubtitle}>
                Create professional pie charts to visualize percentages and proportions
            </Text>
        </div>
    );
};
