import { FC } from 'react';
import { WELCOME_URL } from '@constants';
import { useThemeStore } from '@store';
import { useShallow } from 'zustand/react/shallow';

export const WelcomePage: FC = () => {
  const { theme } = useThemeStore(useShallow((state) => ({ theme: state.theme })));
  return (
    <iframe
      src={WELCOME_URL + `?theme=${theme}`}
      style={{ width: '100%', height: '100%', border: 'none' }}
    />
  );
};
