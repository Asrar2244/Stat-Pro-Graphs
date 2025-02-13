const { VITE_API } = import.meta.env;
export const DEFAULT_PAGE_SIZE = 500;
export const DEFAULT_GRAPH_PAGE_SIZE = 10000;
export const DEFAULT_PAGES = [50, 100, 200, 500, 1000];
export const DEFAULT_OUTPUT_TABLE_PAGE_SIZE = 500;
export const SLEEP_TIMEOUT = 60000; // 10000 ms = 10 seconds
export const API = {
  backendURL: VITE_API,
  analysis: 'receive-json',
};
export const DECIMAL_PLACES = 7;
