import { makeStyles, tokens } from '@fluentui/react-components';

export const useVariableListStyles = () => {
    const listHeaderStyles: React.CSSProperties = {
        marginTop: '10px',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: '10px',
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
        paddingBottom: '8px',
    };

    const selectAllCheckboxStyles: React.CSSProperties = {
        fontWeight: 'bold',
    };

    const variableCountBadgeStyles: React.CSSProperties = {
        fontSize: '11px',
        color: tokens.colorNeutralForeground2,
        backgroundColor: tokens.colorNeutralBackground2,
        padding: '2px 8px',
        borderRadius: '10px',
    };

    const listContainerStyles: React.CSSProperties = {
        maxHeight: '300px',
        overflowY: 'auto',
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: '4px',
        marginBottom: '10px',
        backgroundColor: tokens.colorNeutralBackground1,
    };

    const listItemStyles: React.CSSProperties = {
        padding: '2px 8px',
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
        transition: 'background-color 0.2s',
    };

    const listItemSelectedStyles: React.CSSProperties = {
        ...listItemStyles,
        backgroundColor: tokens.colorBrandBackground2,
    };

    const checkboxStyles: React.CSSProperties = {
        width: '100%',
    };

    const checkboxSelectedStyles: React.CSSProperties = {
        ...checkboxStyles,
        color: tokens.colorBrandForeground1,
        fontWeight: 600,
    };

    const emptyListStyles: React.CSSProperties = {
        padding: '20px',
        textAlign: 'center',
        color: tokens.colorNeutralForeground3,
        fontStyle: 'italic',
    };

    return {
        listHeaderStyles,
        selectAllCheckboxStyles,
        variableCountBadgeStyles,
        listContainerStyles,
        listItemStyles,
        listItemSelectedStyles,
        checkboxStyles,
        checkboxSelectedStyles,
        emptyListStyles,
    };
};
