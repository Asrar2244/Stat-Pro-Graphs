import { SquareLineSkeleton } from '../skeletons';
import { FC } from 'react';

export const ListSkeleton: FC<{ skeletonCount: number }> = ({ skeletonCount }) => {
  return (
    <>
      {Array.from({ length: skeletonCount }, (_v, i: number) => (
        <SquareLineSkeleton key={i} />
      ))}
    </>
  );
};
