import {
  Button,
  Popover,
  PopoverTrigger,
  Tooltip,
  Spinner,
  Link,
  Text,
} from '@fluentui/react-components';
import { useToolStripLayout } from '../styles-hook/use-tool-strip';
import { RiFileExcel2Fill, RiLayoutGrid2Fill } from 'react-icons/ri';
import { FaFileCsv } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';
import { dataGenWorker } from '@workers/data-gen-worker';
import { memo, useState, useContext } from 'react';
import { EmptyDataContext } from '../context';
import { save } from '@tauri-apps/plugin-dialog';
import { open } from '@tauri-apps/plugin-shell';
import { saveExcelToFile, saveCsvToFile } from '@utils';
import { useToaster, useDraftData } from '@hooks';
import { MdOutlinePublish, MdHelp } from 'react-icons/md';

import { RowsColumns } from './rows-columns';
const ToolStripComp = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const { data, dataState, columns, setDataState } = useContext(EmptyDataContext);
  const classes = useToolStripLayout();
  const toaster = useToaster();
  const { generateCSVDataAndSaveCSV } = useDraftData();
  const { t } = useTranslation('emptyDataView');

  const onOpenHandler = async (pathToOpen: string) => {
    await open(pathToOpen);
  };
  const onHandleGenerateExcel = async () => {
    try {
      setLoading(true);
      const path = await save({
        title: t('exportExcel'),
        filters: [{ name: t('exportExcel'), extensions: ['xlsx'] }],
      });
      if (path) {
        const excelData = await dataGenWorker.arrayArrayString(data);
        await saveExcelToFile(path as string, excelData);
        toaster.success({
          body: t('excelExportedSuccess'),
          footer: (
            <Link href={path} target="_blank" onClick={() => onOpenHandler(path)}>
              <Text font="monospace">{path}</Text>
            </Link>
          ),
        });
      } else {
        toaster.info({ body: t('locationNotSelected') });
      }
    } catch (e) {
      console.error('error==>', e);
      toaster.error({ body: t('excelExportFailed') });
    } finally {
      setLoading(false);
    }
  };
  const onHandleGenerateCSV = async () => {
    try {
      setLoading(true);
      const path = await save({
        title: t('exportCSV'),
        filters: [{ name: t('exportCSV'), extensions: ['csv'] }],
      });
      if (path) {
        const excelData = await dataGenWorker.arrayArrayString(data);
        await saveCsvToFile(path as string, excelData);
        toaster.success({
          body: t('csvExportedSuccess'),
          footer: (
            <Link href={path} target="_blank" onClick={() => onOpenHandler(path)}>
              <Text font="monospace">{path}</Text>
            </Link>
          ),
        });
      } else {
        toaster.info({ body: t('locationNotSelected') });
      }
    } catch (e) {
      console.error('error==>', e);
      toaster.error({ body: t('csvExportFailed') });
    } finally {
      setLoading(false);
    }
  };
  const onHandlePublish = async () => {
    if (dataState === 'draft') {
      setLoading(true);
      generateCSVDataAndSaveCSV(data, columns)
        .then(() => {
          setDataState?.('published');
        })
        .catch((error) => {
          console.error('error==>', error);
          toaster.error({ body: t('csvExportFailed') });
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      toaster.info({ body: t('dataNotDraft') });
    }
  };
  //ToDo: need to enable for column addition
  // const addColumn = () => {
  //   if (setData) {
  //   }
  // };
  // const onHandlerRemoveColumn = () => {
  //   console.log('selectedCell==>', JSON.stringify(selectedCell));
  //   //@ts-ignore
  //   if (setData && selectedCell?.start && selectedCell?.end) {
  //     setData(
  //       data.map((row) => {
  //         //@ts-ignore
  //         return row.slice(selectedCell.start, selectedCell.end);
  //       }),
  //     );
  //   }
  // };
  return (
    <div className={classes.layoutToolStrip}>
      <div>
        <ul className={classes.listToolStrip}>
          <li>
            <Tooltip content={t('insertRowAndColumns')} relationship="description" withArrow>
              <div className={classes.itemWrapper}>
                <Popover withArrow size="small" appearance="brand">
                  <PopoverTrigger disableButtonEnhancement>
                    <Button
                      icon={<RiLayoutGrid2Fill />}
                      appearance="transparent"
                      shape="square"
                      size="medium"
                    ></Button>
                  </PopoverTrigger>
                  <RowsColumns />
                </Popover>
              </div>
            </Tooltip>
          </li>

          <li>
            <Tooltip content={t('exportExcel')} relationship="description" withArrow>
              <div className={classes.itemWrapper}>
                <Button
                  icon={loading ? <Spinner size="small" /> : <RiFileExcel2Fill />}
                  appearance="transparent"
                  shape="square"
                  size="medium"
                  onClick={onHandleGenerateExcel}
                ></Button>
              </div>
            </Tooltip>
          </li>
          <li>
            <Tooltip content={t('exportCSV')} relationship="description" withArrow>
              <div className={classes.itemWrapper}>
                <Button
                  icon={loading ? <Spinner size="small" /> : <FaFileCsv />}
                  appearance="transparent"
                  shape="square"
                  size="medium"
                  onClick={onHandleGenerateCSV}
                ></Button>
              </div>
            </Tooltip>
          </li>
          <li>
            <Tooltip content={t('published')} relationship="description" withArrow>
              <div className={classes.itemWrapper}>
                <Button
                  icon={loading ? <Spinner size="small" /> : <MdOutlinePublish />}
                  appearance="transparent"
                  shape="square"
                  size="medium"
                  onClick={onHandlePublish}
                ></Button>
              </div>
            </Tooltip>
          </li>
        </ul>
      </div>
      <div className={classes.dataStatus}>
        {dataState && (
          <Text font="monospace" className={dataState === 'draft' ? 'draft' : 'publish'}>
            {t(dataState as string)}
            <Tooltip
              content={t(dataState === 'draft' ? 'draftHover' : 'publishedHover')}
              relationship="description"
              positioning="below"
              withArrow
            >
              <Button icon={<MdHelp />} appearance="transparent" shape="square" size="small" />
            </Tooltip>
          </Text>
        )}
      </div>
    </div>
  );
};

export const ToolStrip = memo(ToolStripComp);
