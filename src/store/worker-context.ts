import { createContext } from 'react';
import { RemoteObject } from 'comlink';
export interface IWorker {
  taskWorker: RemoteObject<typeof import('@workers/worker-tasks')>;
}
export const WorkerContext = createContext<IWorker | undefined>(undefined);
