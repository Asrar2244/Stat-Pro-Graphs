import { FC } from 'react';
import { Checkbox } from '@fluentui/react-components';
import { useVariableListStyles } from './styles-hook';

/**
 * Props for the VariableList component
 */
export interface VariableListRenderProps {
    list: Map<string, boolean>;
    selectAll: boolean | string | undefined;
    setSelectAll: (value: boolean | string | undefined) => void;
    setList: (list: Map<string, boolean>) => void;
    listName: string;
    selectAllText: string;
    maxSelected?: number;
    disabled?: boolean;
}

/**
 * Component for rendering a list of variables with checkbox selection
 */
export const VariableList: FC<VariableListRenderProps> = ({
    list,
    selectAll,
    setSelectAll,
    setList,
    selectAllText,
    maxSelected,
    disabled
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
        emptyListStyles
    } = useVariableListStyles();
    const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        if (disabled) return;
        const newList = new Map(list);
        list.forEach((_, key) => newList.set(key, checked));
        if (maxSelected && checked) {
            let count = 0;
            for (const key of newList.keys()) {
                if (count < maxSelected) {
                    newList.set(key, true);
                    count++;
                } else {
                    newList.set(key, false);
                }
            }
        }
        setList(newList);
        setSelectAll(checked);
    };

    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        if (disabled) return;
        const newList = new Map(list);
        newList.set(name, checked);

        if (maxSelected && checked) {
            const selectedKeys = Array.from(newList.entries()).filter(([, v]) => v).map(([k]) => k);
            if (selectedKeys.length > (maxSelected || Infinity)) {
                const toKeep = new Set<string>(selectedKeys.slice(-maxSelected));
                for (const [k] of newList.entries()) {
                    newList.set(k, toKeep.has(k));
                }
            }
        }

        setList(newList);
        const allChecked = Array.from(newList.values()).every((val) => val);
        const someChecked = Array.from(newList.values()).some((val) => val);
        setSelectAll(allChecked ? true : someChecked ? 'mixed' : false);
    };

    return (
        <div>
            <div style={listHeaderStyles}>
                <Checkbox
                    label={selectAllText}
                    checked={selectAll === true}
                    onChange={handleSelectAllChange}
                    disabled={disabled}
                    style={selectAllCheckboxStyles}
                />
                <span style={variableCountBadgeStyles}>
                    {list.size} variables
                </span>
            </div>

            <div style={listContainerStyles as React.CSSProperties}>
                {Array.from(list.entries()).map(([key, checked]) => (
                    <div key={key} style={checked ? listItemSelectedStyles : listItemStyles}>
                        <Checkbox
                            label={key}
                            name={key}
                            checked={checked}
                            onChange={handleItemChange}
                            disabled={disabled}
                            style={checked ? checkboxSelectedStyles : checkboxStyles}
                        />
                    </div>
                ))}

                {list.size === 0 && (
                    <div style={emptyListStyles as React.CSSProperties}>
                        No variables available
                    </div>
                )}
            </div>
        </div>
    );
};
