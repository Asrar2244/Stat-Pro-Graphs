import { FC } from 'react';
import { Skeleton, SkeletonItem } from '@fluentui/react-components';
import { useSquareLineClasses } from './styles-hook/use-square-line-style';
declare type SkeletonItemSize =
  | 8
  | 12
  | 16
  | 20
  | 24
  | 28
  | 32
  | 36
  | 40
  | 48
  | 56
  | 64
  | 72
  | 96
  | 120
  | 128;
interface ISquareLineProps {
  squareSize?: SkeletonItemSize;
  lineSize?: SkeletonItemSize;
}

export const SquareLineSkeleton: FC<ISquareLineProps> = ({ lineSize, squareSize }) => {
  const classes = useSquareLineClasses();
  return (
    <Skeleton className={classes.skeletonWrapper}>
      <SkeletonItem shape="square" size={squareSize ?? 24} />
      <SkeletonItem size={lineSize ?? 16} />
    </Skeleton>
  );
};
