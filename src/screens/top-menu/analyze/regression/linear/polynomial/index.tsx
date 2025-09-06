import { FC } from 'react';
import { IModal } from '@hooks';
import { PolynomialComponent } from './polynomial';

export const PolynomialModule: FC<IModal> = (props) => <PolynomialComponent {...props} />;
