import { FC, useState } from 'react';
import { Card, CardHeader, Body1Stronger } from '@fluentui/react-components';
import { useCardTableStyle } from './styles-hook/use-card-table-style';
import { TableCreator } from '../table-creator';
import { ITranslate, ITableCreator } from '@utils';

interface ICardTableRenderProps extends ITranslate {
  table: ITableCreator;
  dbFileName: string;
  dbTableName: string;
}
export const CardTableRender: FC<ICardTableRenderProps> = ({
  t,
  table,
  dbFileName,
  dbTableName,
  ...props
}) => {
  const classes = useCardTableStyle();
  const [headerClass, setHeaderClass] = useState("show");
  return <>
    {
      <div className={classes.regressionsLayout} {...props}>
        <Card className={headerClass}>
          {table.showCaption && (
            <CardHeader header={<Body1Stronger>{t(table?.name as string)}</Body1Stronger>} />
          )}
          <TableCreator t={t} table={table} dbFileName={dbFileName} dbTableName={dbTableName} setHeaderClass={setHeaderClass} />
        </Card>
      </div>
    }</>

};
