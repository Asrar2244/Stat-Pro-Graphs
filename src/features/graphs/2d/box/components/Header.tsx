import { FC } from 'react';
import { Text } from '@fluentui/react-components';
import { MdShowChart } from 'react-icons/md';

interface HeaderProps {
    classes: Record<string, string>;
}

export const BoxHeader: FC<HeaderProps> = ({ classes }) => {
    return (
        <div className={classes.header}>
            <div className={classes.headerTitleRow}>
                <MdShowChart size={24} />
                <Text size={500} weight="semibold">Box Plot Configuration</Text>
            </div>
            <Text size={200} className={classes.headerSubtitle}>
                Create professional box plots with customizable variables, orientation, and statistical options
            </Text>
        </div>
    );
};
