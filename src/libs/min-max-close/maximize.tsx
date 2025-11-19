import { Badge } from '@fluentui/react-components';
import { FC, memo, useEffect, useState } from 'react';
import { VscChromeMaximize, VscChromeRestore } from 'react-icons/vsc';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { safeTauriCall, isTauriEnvironment } from '@utils/tauri-utils';

export const Maximize: FC = memo(() => {
  const [isMaximized, setIsMaximizes] = useState<boolean>(false);
  
  useEffect(() => {
    let unListen: any;
    
    if (isTauriEnvironment()) {
      (async () => {
        unListen = await safeTauriCall(
          async () => {
            return await getCurrentWindow().onResized(async () => {
              const isMax = await safeTauriCall(
                () => getCurrentWindow().isMaximized(),
                false
              );
              setIsMaximizes(isMax);
            });
          },
          () => {
            console.log('Development mode: Window resize listener not available');
            return () => {};
          }
        );
      })();
    }

    return () => {
      if (typeof unListen === 'function') unListen();
    };
  }, []);

  return (
    <Badge appearance="ghost" icon={isMaximized ? <VscChromeRestore /> : <VscChromeMaximize />} />
  );
});
