import { createContext } from 'react';
import { IToolBar } from '@utils';
import type { GraphProperties } from '../hooks/use-tools';

export interface IGraphsRenderContext {
  toolBar: IToolBar;
  selectedRun?: any;
  graphProperties?: GraphProperties;
  onUpdateGraphProperty?: <K extends keyof GraphProperties['global']>(key: K, value: GraphProperties['global'][K]) => void;
}

export const GraphsRenderContext = createContext<IGraphsRenderContext>({
  toolBar: {} as IToolBar,
  selectedRun: undefined,
  graphProperties: undefined,
  onUpdateGraphProperty: undefined,
});





