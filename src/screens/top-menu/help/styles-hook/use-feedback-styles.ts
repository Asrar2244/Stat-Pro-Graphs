import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useFeedbackStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalL,
        padding: tokens.spacingHorizontalL,
        minWidth: '400px',
    },
    title: {
        fontSize: tokens.fontSizeBase500,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground1,
        textAlign: 'center',
        marginBottom: tokens.spacingVerticalM,
    },
    ratingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: tokens.spacingVerticalS,
    },
    starsWrapper: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
        fontSize: '32px',
        cursor: 'pointer',
    },
    starActive: {
        color: '#FFD700', // Gold color for active stars
        transition: 'transform 0.2s, color 0.2s',
        '&:hover': {
            transform: 'scale(1.2)',
        },
    },
    starInactive: {
        color: tokens.colorNeutralForegroundDisabled,
        transition: 'transform 0.2s, color 0.2s',
        '&:hover': {
            transform: 'scale(1.2)',
            color: '#FFD70080',
        },
    },
    formField: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
    },
    textarea: {
        minHeight: '120px',
        ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
        ...shorthands.borderRadius(tokens.borderRadiusMedium),
        padding: tokens.spacingHorizontalS,
        fontSize: tokens.fontSizeBase300,
        backgroundColor: tokens.colorNeutralBackground1,
        color: tokens.colorNeutralForeground1,
        resize: 'vertical',
        '&:focus': {
            ...shorthands.outline('2px', 'solid', tokens.colorBrandStroke1),
        },
    },
    submitButton: {
        marginTop: tokens.spacingVerticalM,
        height: '40px',
        fontWeight: tokens.fontWeightSemibold,
        background: `linear-gradient(135deg, ${tokens.colorBrandBackground} 0%, ${tokens.colorBrandBackground2} 100%)`,
        color: tokens.colorNeutralForegroundOnBrand,
        ...shorthands.border('none'),
        ...shorthands.borderRadius(tokens.borderRadiusMedium),
        cursor: 'pointer',
        transition: 'opacity 0.2s, transform 0.1s',
        '&:hover': {
            opacity: 0.9,
        },
        '&:active': {
            transform: 'scale(0.98)',
        },
        '&:disabled': {
            background: tokens.colorNeutralBackgroundDisabled,
            color: tokens.colorNeutralForegroundDisabled,
            cursor: 'not-allowed',
        },
    },
    successMessage: {
        textAlign: 'center',
        color: tokens.colorPaletteGreenForeground1,
        padding: tokens.spacingVerticalM,
        fontWeight: tokens.fontWeightSemibold,
    },
});
