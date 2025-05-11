import { RowIndicatorProps } from 'react-spreadsheet';
import { tokens } from '@fluentui/react-components';

export const RowHeaderCreate = ({
  row,
  selected,
  onSelect,
  handleContextMenu,
}: RowIndicatorProps & {
  handleContextMenu: (event: React.MouseEvent, header: string, type: 'row' | 'column') => void;
}) => {
  return (
    <th
      className="Spreadsheet__header"
      onClick={() => onSelect(row, true)}
      onContextMenu={(e) => handleContextMenu(e, row.toString(), 'row')}
      style={{
        backgroundColor: selected
          ? tokens.colorBrandBackgroundStatic
          : tokens.colorNeutralBackground3,
      }}
    >
      {row + 1}
    </th>
  );
};
