import { createContext } from 'react';
import { IToolBar, ISelectedRun } from '@utils';
interface IOutputRenderContext {
  selectedRun?: ISelectedRun;
  toolBar?: IToolBar;
}

export const OutputRenderContext = createContext<IOutputRenderContext | undefined>(undefined);
