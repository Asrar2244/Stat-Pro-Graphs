import { FC } from 'react';
import { Tooltip, Caption1Strong, Button, Caption2 } from '@fluentui/react-components';
import { LuChevronFirst, LuChevronLast, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import { RxDividerVertical } from 'react-icons/rx';
import { usePaginationStyles } from './styles-hook/use-pagination-style';
import { DEFAULT_PAGES } from '@constants';
import { IPagination } from '@hooks';

export const Pagination: FC<IPagination> = (props) => {
  const classes = usePaginationStyles();
  const { t } = useTranslation('table', { useSuspense: false });
  const onPageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    props.pageSizeChanged(Number(e.target.value));
  };
  const onChangeJump = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Number(e.target.value);
    if (value > 0 && value <= props.pageCount) {
      props.jumpChanged(Number(value));
    }
  };
  return (
    <div className={classes.wrapper}>
      <Caption1Strong>
        {t('totalRecords')} : {props.totalRecords}
      </Caption1Strong>

      <div className={classes.navigation}>
        <div className={classes.pageSize}>
          <div className={classes.internalPageSize}>
            <select className={classes.select} value={props.pageSize} onChange={onPageSizeChange}>
              {DEFAULT_PAGES.map((page) => (
                <option
                  key={page}
                  className={classes.selectOptions}
                  disabled={page === props.pageSize}
                  value={page}
                >
                  {page}
                </option>
              ))}
            </select>
          </div>
          <Caption2>{t('pageSize')}</Caption2>
        </div>
        <Tooltip content={t('first')} relationship="label" withArrow>
          <Button
            icon={<LuChevronFirst />}
            appearance="transparent"
            shape="square"
            onClick={props.firstPage}
            disabled={props.currentPage <= 1}
          />
        </Tooltip>
        <Tooltip content={t('previous')} relationship="label" withArrow>
          <Button
            icon={<LuChevronLeft />}
            appearance="transparent"
            shape="square"
            onClick={props.previousPage}
            disabled={props.currentPage <= 1}
          />
        </Tooltip>
        <div className={classes.jump}>
          <Tooltip content={t('jump')} relationship="label" withArrow>
            <input
              type="text"
              className={classes.select}
              defaultValue={props.currentPage}
              onChange={onChangeJump}
            />
          </Tooltip>
          <RxDividerVertical />
          <Tooltip content={t('totalPages')} relationship="label" withArrow>
            <small>{props.pageCount}</small>
          </Tooltip>
        </div>
        <Tooltip content={t('next')} relationship="label" withArrow>
          <Button
            icon={<LuChevronRight />}
            appearance="transparent"
            shape="square"
            onClick={props.nextPage}
            disabled={props.currentPage >= props.pageCount}
          />
        </Tooltip>
        <Tooltip content={t('last')} relationship="label" withArrow>
          <Button
            icon={<LuChevronLast />}
            appearance="transparent"
            shape="square"
            onClick={props.lastPage}
            disabled={props.currentPage >= props.pageCount}
          />
        </Tooltip>
      </div>
    </div>
  );
};
