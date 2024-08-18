import { FC, useEffect } from 'react';
import { useRangeSliderStyle } from './styles-hook/use-range-slider-style';
import { DEFAULT_GRAPH_PAGE_SIZE } from '@constants';
import { Pagination } from '@libs';
import { usePagination } from '@hooks';
interface IRangeSelectorProps {
  totalRecords: number;
  loadPagingData: (startIndex: number, stopIndex: number) => Promise<void>;
  loading: boolean;
}
export const GraphPaging: FC<IRangeSelectorProps> = ({ totalRecords, loadPagingData, loading }) => {
  const pageContext = usePagination(totalRecords, DEFAULT_GRAPH_PAGE_SIZE);
  useEffect(() => {
    initialCall();
  }, [totalRecords]);

  const classes = useRangeSliderStyle();
  const initialCall = () => {
    pageContext.dataLoader(loadPagingData);
  };

  return (
    <div className={classes.rangeSlider}>
      <Pagination
        {...pageContext}
        showPageSize={false}
        enableJump={false}
        pageSize={DEFAULT_GRAPH_PAGE_SIZE}
      />
    </div>
  );
};
