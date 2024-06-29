import { Spinner } from '@fluentui/react-components';
import { FC } from 'react';
import { useTasks } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { useExecuteTask } from '@hooks';
import { useCommonLayout } from './styles-hook/use-common-style';

export const CommonMessages: FC = () => {
  const classes = useCommonLayout();
  useExecuteTask();
  const { common } = useTasks(useShallow((state) => ({ common: state.commonMsg })));
  return (
    <div className={classes.loaderBox}>
      {common?.spinner && <Spinner size="extra-tiny" />}
      &nbsp; <label>{common?.message}</label>
    </div>
  );
};
export interface ITranslate {
  t: (key: string | string[], option?: any) => string;
}
