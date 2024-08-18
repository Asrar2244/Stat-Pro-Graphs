import { expose } from 'comlink';
export const graphWorker = new ComlinkWorker<typeof import('./graph-gen-worker')>(
  new URL('./graph-gen-worker', import.meta.url),
  {
    name: 'graphComlink',
  },
);

const workerTransFunction = (t: (key: string, option?: any) => string) => {
  return t('key'); // example usage of the translation function
};

expose(workerTransFunction);
