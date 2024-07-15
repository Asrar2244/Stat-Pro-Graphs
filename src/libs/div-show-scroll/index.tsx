import { FC, PropsWithChildren } from 'react';
import { useShowScrollHover } from './styles-hook/use-show-scroll-style';

export const DivShowScrollOnHover: FC<PropsWithChildren> = ({ children }) => {
  const classes = useShowScrollHover();
  return (
    <div data-show-scroll className={classes.strollerBox}>
      {children}
    </div>
  );
};
