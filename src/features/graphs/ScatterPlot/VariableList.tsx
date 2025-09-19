import React, { FC } from 'react';
import { Checkbox, tokens } from '@fluentui/react-components';

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

export const VariableList: FC<VariableListRenderProps> = ({
  list,
  selectAll,
  setSelectAll,
  setList,
  selectAllText,
  maxSelected,
  disabled
}) => {
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalS,
        padding: tokens.spacingVerticalXS,
        background: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusSmall,
        border: `1px solid ${tokens.colorNeutralStroke2}`
      }}>
        <Checkbox
          label={selectAllText}
          checked={selectAll === true}
          onChange={handleSelectAllChange}
          disabled={disabled}
          style={{ fontWeight: '500', color: tokens.colorNeutralForeground1 }}
        />
        <span style={{
          fontSize: '12px',
          color: tokens.colorNeutralForeground2,
          fontWeight: '600',
          background: tokens.colorNeutralBackground2,
          padding: '2px 8px',
          borderRadius: tokens.borderRadiusCircular
        }}>
          {list.size} variables
        </span>
      </div>

      <div style={{
        maxHeight: '280px',
        overflowY: 'auto',
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: tokens.borderRadiusSmall,
        padding: tokens.spacingVerticalXS,
        background: tokens.colorNeutralBackground1
      }}>
        {Array.from(list.entries()).map(([key, checked]) => (
          <div key={key} style={{
            marginBottom: tokens.spacingVerticalXS,
            padding: tokens.spacingVerticalXS,
            borderRadius: tokens.borderRadiusSmall,
            background: checked ? tokens.colorBrandBackground2 : 'transparent',
            border: checked ? `1px solid ${tokens.colorBrandStroke1}` : `1px solid transparent`,
            transition: 'all 0.2s ease'
          }}>
            <Checkbox
              label={key}
              name={key}
              checked={checked}
              onChange={handleItemChange}
              disabled={disabled}
              style={{
                fontWeight: checked ? '600' : '400',
                color: checked ? tokens.colorBrandForeground1 : tokens.colorNeutralForeground1
              }}
            />
          </div>
        ))}

        {list.size === 0 && (
          <div style={{
            textAlign: 'center',
            padding: tokens.spacingVerticalM,
            color: tokens.colorNeutralForeground2,
            fontStyle: 'italic',
            fontSize: '14px'
          }}>
            No variables available
          </div>
        )}
      </div>
    </div>
  );
};


