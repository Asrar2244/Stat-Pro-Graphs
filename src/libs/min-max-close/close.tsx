import { Badge } from '@fluentui/react-components';
import { FC, memo } from 'react';
import { VscChromeClose } from 'react-icons/vsc';

export const Close: FC = memo(() => {
  return <Badge appearance="ghost" icon={<VscChromeClose />} />;
});
