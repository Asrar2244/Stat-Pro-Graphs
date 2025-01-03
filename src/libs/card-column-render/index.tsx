import { FC, memo, useEffect, useMemo, useState } from 'react';
import { ICardInterface, ITranslate, chunkArray, } from '@utils';
import { usePagination } from '@hooks';
import { useCardColumnStyle } from './styles-hook/use-card-column-style';
import {
  Body1Stronger,
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
} from '@fluentui/react-components';
import { Pagination } from '@libs';
import { DEFAULT_OUTPUT_TABLE_PAGE_SIZE } from '@constants';
import { useTableFetch } from '../table-creator/use-table-hook';
import get from 'lodash.get';
import { useUpdatedConfig } from './use-updated-config';
interface ICardColumnRenderProps extends ITranslate {
  card: ICardInterface;
  dbFileName: string;
  dbTableName: string;
}

export const CardColumnRender: FC<ICardColumnRenderProps> = memo(
  ({ card, dbTableName, dbFileName, ...props }) => {
    const { config, isLoading } = useUpdatedConfig({ dbName: dbFileName, tableName: dbTableName, config: card });
    if (isLoading) {
      return <div>Fetching data please wait</div>
    }
    return <ColumnsRenderer card={config} dbTableName={dbTableName} dbFileName={dbFileName} {...props} />
  }
);


const ColumnsRenderer: FC<ICardColumnRenderProps> = memo(
  ({ card, t, dbTableName, dbFileName }) => {
    const classes = useCardColumnStyle();

    const dynamicColumns = useMemo(() => card.columns.filter((f) => f.type === 'dynamic'), []);
    const staticColumns = useMemo(() => card.columns.filter((f) => f.type === 'static'), []);

    const columns = useMemo(() => {
      const cols = new Set();
      dynamicColumns.forEach((r) => {
        for (let i = 0; i < r.rows.length; i++) {
          const col = r.rows[i].path;
          if (col) {
            cols.add(col);
          }
        }
      });
      return Array.from(cols);
    }, []);
    const { totalRecords, loadTemplateView, templateView, loading } = useTableFetch({
      dbName: dbFileName,
      tableName: dbTableName,
      t,
      recordType: {
        pageSize: DEFAULT_OUTPUT_TABLE_PAGE_SIZE,
      },
      view: columns as string[],
      rawData: true,
    });
    const pageContext = usePagination(totalRecords, DEFAULT_OUTPUT_TABLE_PAGE_SIZE);
    const [chunks, setChunks] = useState<Array<any>>([]);

    useEffect(() => {
      if (totalRecords > 0) {
        loadTemplateView(pageContext.startIndex, pageContext.stopIndex);
      }
    }, [totalRecords, pageContext.startIndex, pageContext.stopIndex]);
    useEffect(() => {
      if (!loading) {
        setChunks(chunkArray(templateView, (card.columnCount as number) ?? 10));
      }
    }, [loading]);

    const TemplateGen: FC<{
      type: 'static' | 'dynamic';
      row?: Record<string, string | number | boolean>;
    }> = ({ type, row }) => {
      let list = staticColumns;
      if (type === 'dynamic') {
        list = dynamicColumns;
      }
      return (
        <>
          {list.map((cols) => {
            return cols.rows.map((r, i) => (
              <li key={i} className={`${i === 0 && card.showHeader ? classes.header : ""}`}>{type === 'static' ? t(r.label as string) : get(row, r.path as string)}</li>
            ));
          })}
        </>
      );
    };
    return (
      <div className={classes.regressionsLayout}>
        <>
          {chunks.map((chunk, chunkIndex) => {
            return (
              <Card key={chunkIndex}>
                {card.showCaption && (
                  <CardHeader header={<Body1Stronger>{t(card?.name as string)}</Body1Stronger>} />
                )}

                <CardPreview className={classes.row}>
                  <ul className={classes.ul}>
                    <TemplateGen type="static" />
                  </ul>
                  {chunk.map((row: any, rowIndex: number) => (
                    <ul key={rowIndex} className={classes.ul}>
                      <TemplateGen row={row} type="dynamic" />
                    </ul>
                  ))}
                </CardPreview>
              </Card>
            );
          })}
        </>

        <CardFooter className={classes.footer}>
          <Pagination {...pageContext} />
        </CardFooter>
      </div>
    );
  },
);
