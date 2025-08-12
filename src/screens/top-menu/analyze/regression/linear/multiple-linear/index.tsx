import { FC } from 'react';
import { IModal } from '@hooks';
import { MultipleLinearComponent } from './multiple-linear';

export const MultipleLinearModule: FC<IModal> = (props) => <MultipleLinearComponent {...props} />;