import { warn, debug, trace, info, error } from '@tauri-apps/plugin-log';
interface ILogs {
  debug: (message: string | Object) => void;
  info: (message: string | Object) => void;
  trace: (message: string | Object) => void;
  warn: (message: string | Object) => void;
  error: (message: string | Object) => void;
}
export const logger: ILogs = {
  debug: (message: string | Object) => {
    const loggedMessage = typeof message === 'string' ? message : JSON.stringify(message);
    debug(loggedMessage);
  },
  info: (message: string | Object) => {
    const loggedMessage = typeof message === 'string' ? message : JSON.stringify(message);
    info(loggedMessage);
  },
  trace: (message: string | Object) => {
    const loggedMessage = typeof message === 'string' ? message : JSON.stringify(message);
    trace(loggedMessage);
  },
  warn: (message: string | Object) => {
    const loggedMessage = typeof message === 'string' ? message : JSON.stringify(message);
    warn(loggedMessage);
  },
  error: (message: string | Object) => {
    const loggedMessage = typeof message === 'string' ? message : JSON.stringify(message);
    error(loggedMessage);
  },
};
