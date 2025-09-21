import { createContext } from 'react';
import { IToolBar } from '@utils';

export interface IGraphsRenderContext {
  toolBar: IToolBar;
  selectedRun?: any;
}

export const GraphsRenderContext = createContext<IGraphsRenderContext>({
  toolBar: {} as IToolBar,
  selectedRun: undefined,
});





