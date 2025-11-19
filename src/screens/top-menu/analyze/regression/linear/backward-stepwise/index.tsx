import { FC } from 'react';
import { IModal } from '@hooks';
import { BackwardStepwiseComponent } from './backward-stepwise';

export const BackwardStepwiseModule: FC<IModal> = (props) => <BackwardStepwiseComponent {...props} />;