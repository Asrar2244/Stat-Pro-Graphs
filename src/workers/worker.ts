export const mainWorker = new ComlinkWorker<typeof import('./worker-tasks')>(
  new URL('./worker-tasks.ts', import.meta.url),
  {
    name: 'mainComlink',
  },
);
