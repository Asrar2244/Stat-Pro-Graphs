import { useContext, useState } from 'react';
import { EmptyDataContext } from '../context';
import { generateExcelColumn } from '@utils/helper';
import { ColumnIndicatorProps } from 'react-spreadsheet';
import AutosizeInput from 'react-input-autosize';
import { tokens } from '@fluentui/react-components';

export const ColumnCreate = ({
  column,
  selected,
  onSelect,
  handleContextMenu,
}: ColumnIndicatorProps & {
  handleContextMenu: (event: React.MouseEvent, header: string, type: 'row' | 'column') => void;
}) => {
  const { columns } = useContext(EmptyDataContext);
  const [value, setValue] = useState<string>(columns[column] ?? generateExcelColumn(column + 1));

  const onBlurHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('blur', e.target.value);
    columns[column] = e.target.value;
  };
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  const onFocusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };
  return (
    <th
      className="Spreadsheet__header"
      onDoubleClick={() => onSelect(column, true)}
      onContextMenu={(e) => handleContextMenu(e, column.toString(), 'column')}
      style={{
        backgroundColor: selected
          ? tokens.colorBrandBackgroundStatic
          : tokens.colorNeutralBackground3,
      }}
    >
      <div className="Spreadsheet__data-editor">
        <AutosizeInput
          onBlur={onBlurHandler}
          onChange={onChangeHandler}
          value={value}
          onFocus={onFocusHandler}
        />
      </div>
    </th>
  );
};
