import { Checkbox, Divider, CounterBadge, Tooltip } from '@fluentui/react-components';
import { ChangeEvent, FC, useState, memo, useEffect } from 'react';

export const ListCheckboxWithSelectAll: FC<{
  list: Map<string, boolean>;
  selectAllText: string;
  requiredSelectAll?: boolean;
  listSize: number;
  onSelectAllChanged?: (status: boolean) => void;
  selectValue?: boolean;
}> = memo(
  ({ list, listSize, selectAllText, onSelectAllChanged, requiredSelectAll, selectValue }) => {
    const [avaSelectAll, setAvaSelectAll] = useState<boolean | 'mixed' | undefined>(selectValue);

    useEffect(() => {
      setAvaSelectAll(selectValue);
    }, [selectValue]);
    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
      list.set(e.target.name, e.target.checked);
    };

    const onChangeSelectAll = (e: ChangeEvent<HTMLInputElement>): void => {
      const { checked } = e.target;
      setAvaSelectAll(checked);
      if (onSelectAllChanged) onSelectAllChanged(checked);
    };
    return (
      <>
        {requiredSelectAll && (
          <div className="select-size">
            <Checkbox label={selectAllText} onChange={onChangeSelectAll} checked={avaSelectAll} />
            <Tooltip content={listSize} withArrow relationship="label">
              <CounterBadge count={listSize} showZero shape="rounded" size="extra-large" />
            </Tooltip>
          </div>
        )}

        <div className="dependent-list">
          {Array.from(list, ([key, value]) => {
            return (
              <div key={key}>
                <Checkbox
                  label={key}
                  name={key}
                  defaultChecked={value}
                  onChange={onChangeHandler}
                />
                <Divider />
              </div>
            );
          })}
        </div>
      </>
    );
  },
);
