/**
 * Styles for ScatterPlotForm component
 */

import { makeStyles } from '@fluentui/react-components';

export const useScatterPlotFormStyles = makeStyles({
    container: {
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '16px',
    },
    card: {
        width: '100%',
    },
    formContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '16px',
    },
});
