import { FC, ReactNode, memo, useEffect } from 'react';
import {
  Button,
  Text,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  Divider,
  Field,
  Input,
} from '@fluentui/react-components';

import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import { ListSkeleton } from '@libs';
import { useActiveNode } from '@hooks';
import { useTranslation } from 'react-i18next';
import { useRunHistoryClasses } from '../styles-hook/use-run-history-style';
import { useFetchOutput } from '../hooks/use-fetch-output';
import { HistoryListRender } from './list-item';
import { IoCloseOutline } from 'react-icons/io5';
import { CiSearch } from 'react-icons/ci';
interface IHistory {
  showHistory: boolean;
  toggleShowHistory: () => void;
  setTotalRuns: (value: number) => void;
  selectedRun: (id: number, title: string) => void;
}
const RunHistoryComponent: FC<{ history: IHistory; selectedID?: number }> = ({
  history,
  selectedID,
}) => {
  const classes = useRunHistoryClasses();
  const { config } = useActiveNode([]);
  const { t } = useTranslation('outputToolBar');
  const { data, isLoading } = useFetchOutput(config.tabName);
  useEffect(() => {
    if (Array.isArray(data)) {
      history.setTotalRuns(data.length);
      if ((!selectedID || selectedID === 0) && data.length > 0) {
        history.selectedRun(data[0].id, data[0].outputFor);
      }
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
        <Divider />
        <Field>
          <Input
            appearance="filled-lighter"
            placeholder={t('searchQuery')}
            contentAfter={<Button appearance="transparent" icon={<CiSearch />} size="small" />}
          />
        </Field>
      </DrawerHeader>
      <DrawerBody className={classes.drawerBody}>
        <AutoSizer>
          {({ width, height }): ReactNode => (
            <div
              style={{
                width: width + 40,
                height: height,
                // overflow: 'auto',
                marginLeft: '-20px',
              }}
            >
              <ul className={classes.card}>
                {isLoading ? (
                  <ListSkeleton skeletonCount={20} />
                ) : (
                  data?.map((dtl, index) => (
                    <HistoryListRender
                      key={index}
                      {...dtl}
                      selectedRun={history.selectedRun}
                      selectedID={selectedID}
                    />
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
