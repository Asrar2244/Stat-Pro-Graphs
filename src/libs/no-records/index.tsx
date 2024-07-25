import { Body1Strong } from '@fluentui/react-components';
import { FC, memo } from 'react';
import { AiOutlineException } from 'react-icons/ai';
import { useNotFound } from './styles-hook/use-no-records-style';

const NotFound: FC = () => {
  const classes = useNotFound();
  return (
    <div className={classes.notFound}>
      <AiOutlineException />
      <Body1Strong>No Data Found</Body1Strong>
    </div>
  );
};

export const RecordNotFound = memo(NotFound);
