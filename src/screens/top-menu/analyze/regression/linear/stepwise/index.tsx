import { FC } from 'react';
import { IModal } from '@hooks';
import { StepwiseComponent } from './stepwise';

export const StepwiseModule: FC<IModal> = (props) => <StepwiseComponent {...props} />;