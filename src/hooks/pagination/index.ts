import { DEFAULT_PAGE_SIZE } from '@constants';
import { useEffect, useRef, useState } from 'react';

type ICallback = (startIndex: number, stopIndex: number) => Promise<void>;
export interface IPagination {
  pageSize: number;
  currentPage: number;
  totalRecords: number;
  pageCount: number;
  nextPage: () => void;
  previousPage: () => void;
  pageSizeChanged: (value: number) => void;
  lastPage: () => void;
  firstPage: () => void;
  dataLoader: (callback: ICallback) => void;
  jumpChanged: (value: number) => void;
  startIndex: number;
  stopIndex: number;
  showPageSize?: boolean;
  enableJump?: boolean;
}

export const usePagination = (totalRecords: number, PageDefaultSize?: number): IPagination => {
  const [pageSize, setPageSize] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [startIndex, setStartIndex] = useState<number>(0);
  const [stopIndex, setStopIndex] = useState<number>(0);
  const dataLoaderRef = useRef<ICallback>();

  useEffect(() => {
    let _page = pageSize;
    if (PageDefaultSize) {
      _page = PageDefaultSize;
      setPageSize(PageDefaultSize);
    } else {
      _page = DEFAULT_PAGE_SIZE;
      setPageSize(DEFAULT_PAGE_SIZE);
    }
    const localPagesize = pageSize === 0 ? _page : pageSize;
    setPageCount(Math.ceil(totalRecords / localPagesize));
  }, [totalRecords, PageDefaultSize, DEFAULT_PAGE_SIZE]);

  useEffect(() => {
    if (pageSize > 0) {
      setPageCount(Math.ceil(totalRecords / pageSize));
    }
  }, [pageSize, totalRecords]);

  useEffect(() => {
    if (pageSize > 0) {
      const startIndex = (currentPage - 1) * pageSize;
      const stopIndex = startIndex + pageSize;
      setStopIndex(stopIndex);
      setStartIndex(startIndex);
    }
  }, [currentPage, pageSize]);

  const triggerData = (callback: ICallback) => {
    // store latest callback
    dataLoaderRef.current = callback;
    if (startIndex !== stopIndex) {
      callback(startIndex, stopIndex);
    }
  };
  useEffect(() => {
    if (dataLoaderRef.current && startIndex !== stopIndex) {
      dataLoaderRef.current(startIndex, stopIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startIndex, stopIndex]);
  const firstPage = (): void => {
    setCurrentPage(1);
  };
  const lastPage = (): void => {
    setCurrentPage(pageCount);
  };
  const nextPage = (): void => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, pageCount));
  };

  const previousPage = (): void => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };
  const dataLoader = (callback: ICallback): void => {
    triggerData(callback);
  };
  const pageSizeChanged = (value: number): void => {
    setPageSize(value);
    setCurrentPage(1);
  };
  const jumpChanged = (value: number): void => {
    setCurrentPage(value);
  };
  return {
    pageSize,
    currentPage,
    totalRecords,
    pageCount,
    previousPage,
    nextPage,
    pageSizeChanged,
    lastPage,
    firstPage,
    dataLoader,
    jumpChanged,
    startIndex,
    stopIndex,
  };
};
