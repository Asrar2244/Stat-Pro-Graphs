import { FC, ReactNode, memo, useEffect, useState, useMemo } from 'react';
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
import { useRunHistoryClasses } from '../../styles/use-run-history-style';
import { useFetchGraphs } from '../../hooks/use-fetch-graphs';
import { HistoryListRender } from './list-item';
import { IoCloseOutline } from 'react-icons/io5';
import { CiSearch } from 'react-icons/ci';

interface IHistory {
  showHistory: boolean;
  toggleShowHistory: () => void;
  setTotalRuns: (value: number) => void;
  selectedRun: (id: number, title: string, subTitle?: string) => void;
}

const RunHistoryComponent: FC<{ history: IHistory; selectedID?: number }> = ({
  history,
  selectedID,
}) => {
  const classes = useRunHistoryClasses();
  const { config } = useActiveNode([]);
  const { t } = useTranslation('outputToolBar');
  const { data, isLoading } = useFetchGraphs(config.tabName);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!searchQuery.trim()) return data;
    
    return data.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(searchLower) ||
        item.subTitle?.toLowerCase().includes(searchLower) ||
        item.id?.toString().includes(searchLower) ||
        item.createdAt?.toLowerCase().includes(searchLower) ||
        item.updatedAt?.toLowerCase().includes(searchLower)
      );
    });
  }, [data, searchQuery]);
  
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
        <Divider />
        <Field>
          <Input
            appearance="filled-lighter"
            placeholder={t('searchQuery')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                marginLeft: '-20px',
              }}
            >
              <ul className={classes.card}>
                {isLoading ? (
                  <ListSkeleton skeletonCount={20} />
                ) : (
                  filteredData?.map((dtl, index) => (
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
