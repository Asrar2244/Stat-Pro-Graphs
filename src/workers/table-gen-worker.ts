import { expose } from 'comlink';
export const tableWorker = new ComlinkWorker<typeof import('./table-generator')>(
  new URL('./table-generator', import.meta.url),
  {
    name: 'tableComlink',
  },
);

const workerTransFunction = (t: (key: string, option?: any) => string) => {
  return t('key'); // example usage of the translation function
};

expose(workerTransFunction);
