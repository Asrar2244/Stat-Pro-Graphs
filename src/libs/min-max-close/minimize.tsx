import { Badge } from '@fluentui/react-components';
import { FC, memo } from 'react';
import { VscChromeMinimize } from 'react-icons/vsc';

export const Minimize: FC = memo(() => {
  return <Badge appearance="ghost" icon={<VscChromeMinimize />} />;
});
