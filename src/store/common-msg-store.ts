import { create } from 'zustand';
interface ICommonMessage {
  message: string;
  spinner?: boolean;
}

interface ITask {
  status: 'available' | 'away' | 'offline' | 'blocked' | 'do-not-disturb';
  description?: string;
  startDt?: string;
  endDt?: string;
  queueFor?: string;
  queueType?: string;
  tabId?: string;
  tabName?: string;
}
interface IQueueTask {
  url?: string;
  uuid: string;
  parameters?: any;
  queueFor?: string;
  queueType?: string;
  tabId?: string;
  tabName?: string;
}
interface ICommonMsgStore {
  commonMsg?: ICommonMessage;

  tasks?: ITask[];
  queueTasks?: IQueueTask[];
  setQueueTask: (queueTask: IQueueTask) => void;
  setCommonMsg: (common: ICommonMessage) => void;
  setAddTask: (task: ITask) => void;
  setTaskArray: (task: ITask[]) => void;
}
export const useTasks = create<ICommonMsgStore>((set) => ({
  commonMsg: undefined,
  tasks: undefined,
  setCommonMsg(common): void {
    set({ commonMsg: common });
  },
  setAddTask(task): void {
    set(({ tasks }) => {
      const findTask = tasks?.find((f) => f.queueType === task.queueType && f.tabId === task.tabId);
      if (!findTask) {
        return { tasks: [...(tasks ?? []), task] };
      }
      return { tasks };
    });
  },
  setTaskArray(task): void {
    set({ tasks: task });
  },
  setQueueTask(queueTask): void {
    set((state) => {
      if (!state?.queueTasks) return { queueTasks: [queueTask] };
      const qTask = state?.queueTasks;
      qTask.push(queueTask);
      return { queueTasks: qTask };
    });
  },
}));
