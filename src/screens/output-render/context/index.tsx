import { createContext } from 'react';
import { IFetchSingleOutput } from '@backend/fetch-output-table';
import { IToolBar } from '../hooks/use-tools';
interface IOutputRenderContext {
  selectedRun?: IFetchSingleOutput;
  toolBar?: IToolBar;
}

export const OutputRenderContext = createContext<IOutputRenderContext | undefined>(undefined);
