import { FC, ReactNode, memo, useEffect, useState, useMemo, useRef } from 'react';
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

  // Resizable drawer state
  const [drawerWidth, setDrawerWidth] = useState<number>(280);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const minWidth = 200;
  const maxWidth = 500;

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = startXRef.current - e.clientX;
      const next = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + delta));
      setDrawerWidth(next);
    };
    const onMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const beginDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = drawerWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!searchQuery.trim()) return data;

    return data.filter((item) => {
      const searchLower = searchQuery.toLowerCase();

      // Replicate the title generation logic from list-item.tsx
      const displayTitle = item.config?.graphConfig?.global?.graphName
        || item.config?.graphConfig?.subType
        || item.graphType
        || 'Graph';

      const subTitle = item.config?.graphConfig?.subType || item.config?.graphConfig?.dataFormat || '';

      return (
        displayTitle?.toLowerCase().includes(searchLower) ||
        subTitle?.toLowerCase().includes(searchLower) ||
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
    <InlineDrawer open={history.showHistory} position={'end'} className={classes.drawerContainer} style={{ width: drawerWidth, minWidth: drawerWidth, maxWidth: drawerWidth }}>
      {/* Left-edge resizer to adjust drawer width */}
      <div
        onMouseDown={beginDrag}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: 6,
          cursor: 'ew-resize',
          zIndex: 10,
        }}
      />
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
