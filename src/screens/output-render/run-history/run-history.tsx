import { FC, ReactNode, memo, useEffect } from 'react';
import {
  Button,
  Text,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
} from '@fluentui/react-components';

import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import { ListSkeleton } from '@libs';
import { useActiveNode } from '@hooks';
import { useTranslation } from 'react-i18next';
import { useRunHistoryClasses } from '../styles-hook/use-run-history-style';
import { useFetchOutput } from '../hooks/use-fetch-output';
import { HistoryListRender } from './list-item';
import { IoCloseOutline } from 'react-icons/io5';
interface IHistory {
  showHistory: boolean;
  toggleShowHistory: () => void;
  setTotalRuns: (value: number) => void;
  selectedRun: (id: number, title: string) => void;
}
const RunHistoryComponent: FC<{ history: IHistory }> = ({ history }) => {
  const classes = useRunHistoryClasses();
  const { config } = useActiveNode([]);
  const { t } = useTranslation('reqLinearLeastSquareOutput');
  const { data, isLoading } = useFetchOutput(config.tabName);
  useEffect(() => {
    if (Array.isArray(data)) {
      history.setTotalRuns(data.length);
    }
  }, [data]);
  return (
    <InlineDrawer open={history.showHistory} position={'end'} className={classes.drawerContainer}>
      <DrawerHeader className={classes.drawerHeader}>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<IoCloseOutline />}
              onClick={history.toggleShowHistory}
            />
          }
        >
          <Text className={classes.runHistoryTitle}>{t('runHistory')}</Text>
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody className={classes.drawerBody}>
        <AutoSizer>
          {({ width, height }): ReactNode => (
            <div
              style={{
                width: width + 40,
                height: height - 40,
                overflow: 'auto',
                marginLeft: '-20px',
              }}
            >
              <ul className={classes.card}>
                {isLoading ? (
                  <ListSkeleton skeletonCount={20} />
                ) : (
                  data?.map((dtl, index) => (
                    <HistoryListRender key={index} {...dtl} selectedRun={history.selectedRun} />
                  ))
                )}
              </ul>
            </div>
          )}
        </AutoSizer>
      </DrawerBody>
    </InlineDrawer>
  );
};
export const RunHistory = memo(RunHistoryComponent);
