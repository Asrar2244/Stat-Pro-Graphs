import { FC } from 'react';
import { IModal } from '@hooks';
import { BestSubsetComponent } from './best-subset';

export const BestSubsetModule: FC<IModal> = (props) => <BestSubsetComponent {...props} />;