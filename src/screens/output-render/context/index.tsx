import { createContext } from 'react';
import { IToolBar } from '../hooks/use-tools';
interface IOutputRenderContext {
  selectedRun?: any;
  toolBar?: IToolBar;
}

export const OutputRenderContext = createContext<IOutputRenderContext | undefined>(undefined);
