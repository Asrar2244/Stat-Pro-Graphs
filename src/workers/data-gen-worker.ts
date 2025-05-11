export const dataGenWorker = new ComlinkWorker<typeof import('./data-gen')>(
  new URL('./data-gen', import.meta.url),
  {
    name: 'dataComlink',
  },
);
