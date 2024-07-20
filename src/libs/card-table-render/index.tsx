import { Card, CardHeader, Body1Stronger } from '@fluentui/react-components';
import { FC } from 'react';
import { useCardTableStyle } from './styles-hook/use-card-table-style';
import { ITableCreator } from '@libs';
interface ICardTableRenderProps {
  showCaption?: boolean;
  name: string;
  table: ITableCreator;
}
export const CardTableRender: FC<ICardTableRenderProps> = ({ showCaption, name }) => {
  const classes = useCardTableStyle();

  return (
    <div className={classes.regressionsLayout}>
      <Card>
        {showCaption && <CardHeader header={<Body1Stronger>{name}</Body1Stronger>} />}
        {/* <TableCreator {...table} /> */}
      </Card>
    </div>
  );
};
