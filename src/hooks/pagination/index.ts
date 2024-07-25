import { DEFAULT_PAGE_SIZE } from '@constants';
import { useRef, useEffect, useState } from 'react';

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
}

export const usePagination = (totalRecords: number): IPagination => {
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const dataLoaderRef = useRef<ICallback>();

  useEffect(() => {
    setPageCount(Math.ceil(totalRecords / pageSize));
  }, [totalRecords, pageSize]);

  useEffect(() => {
    if (dataLoaderRef.current) {
      const startIndex = (currentPage - 1) * pageSize;
      const stopIndex = startIndex + pageSize;
      dataLoaderRef.current(startIndex, stopIndex);
    }
  }, [currentPage, dataLoaderRef]);

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
    if (!dataLoaderRef.current) {
      dataLoaderRef.current = callback;
    }
  };
  const pageSizeChanged = (value: number): void => {
    setPageSize(value);
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
  };
};
