import { Input, Button, Field, Dropdown, Option } from '@fluentui/react-components';
import { useSearchStyles } from './styles-hook/use-table-search-style';
import { useTranslation } from 'react-i18next';
import { memo, FC, useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import { useColumnsRowsCount } from './use-column-count';
import { ITableProps } from './index';
interface ItProps extends ITableProps {
  t: (key: string) => string;
}
const SearchText: FC<ItProps> = ({ t, ...props }) => {
  const [value, setValue] = useState<string>('');
  const [selected, setSelected] = useState<string[]>([]);
  const { columns } = useColumnsRowsCount({ ...props, noRowCount: true });
  const onChangeHandel = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setValue(value);
  };
  const onSelectionChange = (_e: any, data: any): void => {
    setSelected(data?.optionValue);
  };
  return (
    <>
      <Field>
        <Dropdown
          appearance="filled-lighter"
          size="small"
          onOptionSelect={onSelectionChange}
          multiselect
          selectedOptions={selected}
          placeholder={t('allColumns')}
        >
          {columns.map((column) => (
            <Option key={column.columnId}>{column.columnId}</Option>
          ))}
        </Dropdown>
      </Field>
      <Field>
        <Input
          appearance="filled-lighter"
          placeholder={t('searchQuery')}
          onChange={onChangeHandel}
          value={value}
          contentAfter={<Button appearance="transparent" icon={<CiSearch />} size="small" />}
        />
      </Field>
    </>
  );
};

export const TableSearch: FC<ITableProps> = memo((props) => {
  const { t } = useTranslation(['table']);
  const classes = useSearchStyles();
  return (
    <div className={classes.dataLayout}>
      <div className={classes.detailsStyle}>
        <div></div>
      </div>
      <SearchText t={t} {...props} />
    </div>
  );
});
