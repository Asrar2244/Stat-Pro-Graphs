import { FC } from 'react';
import { WELCOME_URL } from '@constants';

export const WelcomePage: FC = () => {
  return <iframe src={WELCOME_URL} style={{ width: '100%', height: '100%', border: 'none' }} />;
};
