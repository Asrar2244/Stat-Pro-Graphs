const { VITE_API } = import.meta.env;
export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_PAGES = [50, 100, 200, 500, 1000];
export const API = {
  backendURL: VITE_API,
  analysis: 'receive-json',
};
