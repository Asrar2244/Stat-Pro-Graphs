import { SquareLineSkeleton } from '../skeletons';
import { FC, ReactElement, useMemo } from 'react';

export const ListSkeleton: FC<{ skeletonCount: number }> = ({ skeletonCount }) => {
  const renderSkeleton: ReactElement[] = useMemo(() => {
    return Array.from({ length: skeletonCount }, (_v, i: number) => <SquareLineSkeleton key={i} />);
  }, []);

  return renderSkeleton;
};
