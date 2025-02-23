import { FC, ChangeEvent, useEffect, useState } from 'react';
import { Checkbox, Divider } from '@fluentui/react-components';
interface IProps {
  list: { [key: string]: boolean };
  selected: boolean | 'mixed' | undefined;
  className?: string;
  setSelectAll?: (x: boolean | 'mixed' | undefined) => void
}
export const CheckListRender: FC<IProps> = ({ list, selected, className, setSelectAll }) => {
  const [localList, setLocalList] = useState<{ [key: string]: boolean }>({});
  useEffect(() => {
    setLocalList(list);
  }, [selected, list]);
  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    list[e.target.name] = e.target.checked;
    let count = 0;
    Object.entries(list).forEach(([_key, value]) => value === true && count++);
    setSelectAll?.(count === Object.entries(list).length ? true : count === 0 ? false : "mixed")
  };
  return (
    <div className={className ?? ''}>
      {Object.keys(localList).map((key: string) => (
        <div key={key}>
          <Checkbox
            label={key}
            name={key}
            defaultChecked={localList[key]}
            onChange={onChangeHandler}
          />
          <Divider />
        </div>
      ))
      }
    </div>
  );
};
