import React from 'react';
import {
    makeStyles,
    shorthands,
    tokens,
    Card,
    CardHeader,
    Text,
    Subtitle1,
    Body1
} from '@fluentui/react-components';
import { availableComputers } from '../computers';
import { useAnalyticsStore } from '../store/analyticsSlice';
import { AnalyticsType } from '../computers/types';


// Styles for the component
const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
    },
    card: {
        cursor: 'pointer',
        ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
        ':hover': {
            ...shorthands.borderColor(tokens.colorBrandBackground),
        },
    },
    selectedCard: {
        ...shorthands.borderColor(tokens.colorBrandBackground),
        backgroundColor: tokens.colorBrandBackground2,
    }
});

const AnalyticsTypeSelector: React.FC = () => {
    const styles = useStyles();
    const { subType, setSubType } = useAnalyticsStore();

    return (
        <div className={styles.container}>
            <Subtitle1>Select Analysis Type</Subtitle1>
            <div className={styles.grid}>
                {availableComputers.map((computer) => (
                    <Card
                        key={computer.type}
                        className={subType === computer.type ? styles.selectedCard : styles.card}
                        onClick={() => setSubType(computer.type as AnalyticsType)}
                    >
                        <CardHeader
                            header={<Text weight="semibold">{computer.displayName}</Text>}
                        />
                        <Body1>{computer.description}</Body1>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AnalyticsTypeSelector;
