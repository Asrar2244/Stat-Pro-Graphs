import { memo, useContext, useState } from 'react';
import { Button, PopoverSurface, Field, Input, Caption1Stronger } from '@fluentui/react-components';
import { EmptyDataContext } from '../context';
import { useTranslation } from 'react-i18next';

import { useToolStripLayout } from '../styles-hook/use-tool-strip';
import { CellBase } from 'react-spreadsheet';
const RowsColumnsComponent = () => {
  const [noRows, setNoRows] = useState<string>('0');
  const [noColumns, setNoColumns] = useState<string>('0');
  const { t } = useTranslation('emptyDataView');
  const classes = useToolStripLayout();
  const { setData, data } = useContext(EmptyDataContext);
  const onHandlerRowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoRows(e.target.value);
  };
  const onHandlerColumnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoColumns(e.target.value);
  };
  const updateData = (noOfRows: number = 0, noOfColumns: number = 0) => {
    console.log('data==>', noOfRows, noOfColumns);
    if (setData) {
      if (noOfRows === 0 && noOfColumns > 0) {
        setData(
          data.map((row) => {
            const nextRow = [...row];
            nextRow.length += 1;
            return nextRow;
          }),
        );
      } else {
        for (let i = 0; i < noOfRows; i++) {
          const row: CellBase[] = [];
          for (let j = 0; j < noOfColumns; j++) {
            row.push({ value: '' });
          }
          data.push(row);
        }
      }

      console.log('data==>', JSON.stringify(data));
      setData([...data]);
    }
  };

  const onHandlerApply = () => {
    updateData(parseInt(noRows), parseInt(noColumns));
  };

  return (
    <PopoverSurface tabIndex={-1}>
      <div className={classes.rowColumnLayout}>
        <div className={classes.popOverTitle}>
          <Caption1Stronger>{t('noOfRowsColumns')}</Caption1Stronger>
        </div>
        <div className={classes.noOfRowsColumns}>
          <Field label={t('noOfRows')} size="small">
            <Input type="number" step={1} min={0} value={noRows} onChange={onHandlerRowChange} />
          </Field>
          <Field label={t('noOfColumns')} size="small">
            <Input
              type="number"
              step={1}
              min={0}
              value={noColumns}
              onChange={onHandlerColumnChange}
            />
          </Field>
        </div>
        <Button shape="square" size="small" onClick={onHandlerApply}>
          {t('apply')}
        </Button>
      </div>
    </PopoverSurface>
  );
};

export const RowsColumns = memo(RowsColumnsComponent);
