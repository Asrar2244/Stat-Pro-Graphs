import { useMinMaxCloseStyles } from './style-hook/use-min-max-close';
import { FC, memo } from 'react';
import { StatusList } from '../common-messages/status-list';
import { ThemeSwitch } from '../theme-switch';

const MinMaxCloseComponent: FC = () => {
  const classes = useMinMaxCloseStyles();
  return (
    <div className={classes.minMaxClose}>
      <StatusList />
      <ThemeSwitch />
    </div>
  );
};
export const MinMaxClose = memo(MinMaxCloseComponent);
