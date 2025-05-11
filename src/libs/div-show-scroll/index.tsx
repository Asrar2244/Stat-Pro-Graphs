import { FC, PropsWithChildren } from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { useShowScrollHover } from './styles-hook/use-show-scroll-style';

export const DivShowScrollOnHover: FC<PropsWithChildren & { customClass?: string }> = ({
  children,
  customClass,
}) => {
  const classes = useShowScrollHover();
  const mergedClasses = mergeClasses(classes.strollerBox, customClass);
  return (
    <div data-show-scroll className={mergedClasses}>
      {children}
    </div>
  );
};
