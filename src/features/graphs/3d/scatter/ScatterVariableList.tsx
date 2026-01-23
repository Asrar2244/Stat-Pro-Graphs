import { FC } from 'react';
import { Checkbox, Text, tokens } from '@fluentui/react-components';
import { useVariableListStyles } from './styles-hook/use-variable-list-styles';

export interface VariableListProps {
    list: Map<string, boolean>;
    selectAll: boolean | string | undefined; // string for 'mixed' state
    setSelectAll: (val: boolean | string | undefined) => void;
    setList: (list: Map<string, boolean>) => void;
    listName: string;
    selectAllText: string;
    maxSelected?: number;
}

export const VariableList: FC<VariableListProps> = ({
    list,
    selectAll,
    setSelectAll,
    setList,
    listName,
    selectAllText,
    maxSelected,
}) => {
    const {
        listHeaderStyles,
        selectAllCheckboxStyles,
        variableCountBadgeStyles,
        listContainerStyles,
        listItemStyles,
        listItemSelectedStyles,
        checkboxStyles,
        checkboxSelectedStyles,
        emptyListStyles,
    } = useVariableListStyles();

    // Handle select all change
    const handleSelectAllChange = (_: any, data: { checked: boolean | 'mixed' }) => {
        // If we have a max selection limit, we can't select all meaningfully 
        // effectively, or we select up to N. But simpler to just uncheck all or error?
        // Usually "select all" handles checking everything.
        // If maxSelected is set, we probably shouldn't allow Select All if count > max.

        // For now, simple logic:
        const newChecked = data.checked === true;
        const newList = new Map(list);

        // Logic for updating list
        // If checking all:
        if (newChecked) {
            // If max limit, select only first N?
            if (maxSelected !== undefined) {
                let count = 0;
                for (const key of newList.keys()) {
                    if (count < maxSelected) {
                        newList.set(key, true);
                        count++;
                    } else {
                        newList.set(key, false);
                    }
                }
            } else {
                for (const key of newList.keys()) {
                    newList.set(key, true);
                }
            }
        } else {
            // Uncheck all
            for (const key of newList.keys()) {
                newList.set(key, false);
            }
        }

        setList(newList);
        setSelectAll(newChecked);
    };

    // Handle individual checkbox change
    const handleCheckboxChange = (key: string, checked: boolean) => {
        const newList = new Map(list);

        // If we are checking an item and have a max limit
        if (checked && maxSelected !== undefined) {
            // Count current selected
            const selectedCount = Array.from(newList.values()).filter(v => v).length;
            if (selectedCount >= maxSelected) {
                // Enforce limit - maybe deselect others? Or just prevent?
                // Usually radio button behavior if max=1.
                if (maxSelected === 1) {
                    // Deselect all others
                    for (const k of newList.keys()) {
                        newList.set(k, false);
                    }
                    newList.set(key, true);
                } else {
                    // Don't allow selecting more?
                    return;
                }
            } else {
                newList.set(key, true);
            }
        } else {
            newList.set(key, checked);
        }

        setList(newList);

        // Update select all state
        const allSelected = Array.from(newList.values()).every((v) => v);
        const someSelected = Array.from(newList.values()).some((v) => v);

        if (allSelected && newList.size > 0) {
            setSelectAll(true);
        } else if (someSelected) {
            setSelectAll('mixed');
        } else {
            setSelectAll(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={listHeaderStyles}>
                <Checkbox
                    checked={selectAll === true ? true : selectAll === 'mixed' ? 'mixed' : false}
                    onChange={handleSelectAllChange}
                    label={selectAllText}
                    disabled={list.size === 0}
                    className="select-all-checkbox"
                //   styles={{ root: selectAllCheckboxStyles }} // FluentUI usage might vary, ignoring style obj for Checkbox directly if not supported
                />
                <span style={variableCountBadgeStyles}>
                    {Array.from(list.values()).filter(Boolean).length} / {list.size}
                </span>
            </div>

            <div style={listContainerStyles}>
                {list.size > 0 ? (
                    Array.from(list.entries()).map(([key, checked]) => (
                        <div
                            key={key}
                            style={checked ? listItemSelectedStyles : listItemStyles}
                            onClick={() => handleCheckboxChange(key, !checked)}
                        >
                            <Checkbox
                                checked={checked}
                                onChange={(_, data) => handleCheckboxChange(key, data.checked as boolean)}
                                label={key}
                            // styles={{ 
                            //   label: checked ? checkboxSelectedStyles : checkboxStyles
                            // }}
                            />
                        </div>
                    ))
                ) : (
                    <div style={emptyListStyles}>
                        No variables available
                    </div>
                )}
            </div>
        </div>
    );
};
