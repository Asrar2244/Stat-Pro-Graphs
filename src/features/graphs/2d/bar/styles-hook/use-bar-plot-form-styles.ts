import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useBarPlotFormStyles = makeStyles({
    errorBarValidationStyles: {
        backgroundColor: tokens.colorNeutralBackground2,
        borderRadius: tokens.borderRadiusMedium,
        ...shorthands.padding(tokens.spacingVerticalM),
        ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
        marginBottom: tokens.spacingVerticalM,
    },
    errorBarValidationTextStyles: {
        fontWeight: 'bold',
    },
});
