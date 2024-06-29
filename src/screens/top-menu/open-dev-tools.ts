import { FC, useEffect } from 'react';

export const OpenDevTools: FC = () => {
  useEffect(() => {
    window.api.openDevTools();
  }, []);

  return null;
};
