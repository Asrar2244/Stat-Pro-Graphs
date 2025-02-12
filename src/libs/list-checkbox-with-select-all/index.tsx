import { Checkbox, Divider, CounterBadge, Tooltip } from '@fluentui/react-components';
import { ChangeEvent, FC, memo, } from 'react';

interface ListCheckboxWithSelectAllProps {
  list: Map<string, boolean>;
  selectAllText: string;
  requiredSelectAll?: boolean;
  listSize: number;
  onSelectAllChanged?: (status: boolean | string) => void;
  selectValue?: boolean | string;
  propKey?: string;
  setModelBulk?: any;
  listName?: string;
}

export const ListCheckboxWithSelectAll: FC<ListCheckboxWithSelectAllProps> = memo(
  ({ list, listSize, selectAllText, onSelectAllChanged, requiredSelectAll, selectValue, propKey, setModelBulk, listName }) => {
    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
      list.set(e.target.name, e.target.checked);
      const allChecked = Array.from(list.values()).every((val) => val);
      const someChecked = Array.from(list.values()).some((val) => val);
      setModelBulk?.(list, listName);
      onSelectAllChanged?.(allChecked ? true : someChecked ? "mixed" : false);
    };

    const handleSelectAllChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { checked } = e.target;
      list.forEach((_, key) => list.set(key, checked));
      setModelBulk?.(list, listName);
      onSelectAllChanged?.(checked);
    };

    return (
      <div key={propKey} >
        {requiredSelectAll && (
          <div className="select-size">
            <Checkbox label={selectAllText} onChange={handleSelectAllChange} checked={selectValue as boolean} />
            <Tooltip content={listSize} withArrow relationship="label">
              <CounterBadge count={listSize} showZero shape="rounded" size="extra-large" />
            </Tooltip>
          </div>
        )}
        <div className="dependent-list">
          {Array.from(list.entries()).map(([key, value]) => {
            return <div key={`${key}-${value}`}>
              <Checkbox label={key} name={key} checked={value} onChange={handleCheckboxChange} />
              <Divider />
            </div>
          }
          )}
        </div>
      </div>
    );
  }
);
