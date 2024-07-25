import { Badge } from '@fluentui/react-components';
import { FC, memo, useEffect, useState } from 'react';
import { VscChromeMaximize, VscChromeRestore } from 'react-icons/vsc';
import { getCurrent } from '@tauri-apps/api/window';

export const Maximize: FC = memo(() => {
  const [isMaximized, setIsMaximizes] = useState<boolean>(false);
  useEffect(() => {
    let unListen: any;
    (async () => {
      unListen = await getCurrent().onResized(async () => {
        getCurrent()
          .isMaximized()
          .then((isMax) => {
            setIsMaximizes(isMax);
          });
      });
    })();

    return () => {
      if (typeof unListen === 'function') unListen();
    };
  }, []);

  return (
    <Badge appearance="ghost" icon={isMaximized ? <VscChromeRestore /> : <VscChromeMaximize />} />
  );
});
