import { FC, useEffect, useState } from 'react';
import { IModal, useActiveNode } from '@hooks';
import { Modal } from '@libs';
import { useTranslation } from 'react-i18next';
import { NoIdSelected } from '@libs/no-id-selected-msg';
import { usePairedTTestsStats } from './use-t-test-paired'
import { useStartProStore } from '@store/main-store';
import { usePrepareAnalysis } from './use-prep-analysis';
import { DataFormatScreens } from './data-format';
import { homeDirectory, readJsonFile } from '@utils';
import { useTestsStats } from '../options/use-tests-config';
import { CONFIG_FILE } from '@constants/db';
import { join } from '@tauri-apps/api/path';
import { COLLECTION_DIR } from '@constants/home-folders';


const PairedTestsAnalysisComponent: FC<IModal> = ({ ...props }) => {
  const [selectedDataFormat, setSelectedDataFormat] = useState("raw");
  const [appFolder, setAppFolder] = useState("");
  const [filePath, setFilePath] = useState("");
  const { t } = useTranslation(['pairedTTestAanalysis', 'common']);
  const { setReset } = usePairedTTestsStats();
  const { setModel: setOptionsModel } = useTestsStats()
  const { setBlockUI } = useStartProStore();
  const [pageIndex, setPageIndex] = useState(0);
  const { id, config } = useActiveNode([props.open]);
  const { executeAnalysis } = usePrepareAnalysis({
    config,
    queueFor: t('title', { ns: 'pairedTTestAanalysis' }),
    queueType: 'tTestModule',
  });

  useEffect(() => {
    homeDirectory().then(r => setAppFolder(r));
    join(appFolder, COLLECTION_DIR, CONFIG_FILE).then(r => setFilePath(r));

  }, [])

  useEffect(() => {
    readJsonFile(filePath).then(r => {
      setOptionsModel(r as any);
    }).catch(e => {
      console.log("error in reading config file", e)
    });
  }, [])


  const onCloseModal = (): void => {
    setReset();
    props.closeModal();
  };
  const onNextModel = () => {
    if (pageIndex < 1) { setPageIndex((prev) => prev + 1) }
    else {
      executeAnalysis(id as string)
      onCloseModal();
      setBlockUI({ value: true, msg: "processRequest" });
    }
  };

  const onBackModel = () => {
    if (pageIndex > 0) {
      setPageIndex((prev) => prev - 1)
    }
  }

  return <Modal modalType="alert"
    {...props}
    cancelLabel={t('close')}
    nextLabel={t("next")}
    okLabel={t('back')}
    title={t('titleData')}
    size="medium"
    closeModal={onCloseModal}
    showCancel={!id || id === '' ? false : true}
    ok={{ onClick: onBackModel, disabled: pageIndex === 0 }}
    next={{ onClick: onNextModel }}
    showNext={true}>
    {!id || id === '' ? (
      <NoIdSelected />
    ) :
      <DataFormatScreens pageIndex={pageIndex} setSelectedDataFormat={setSelectedDataFormat} selectedDataFormat={selectedDataFormat} />
    }
  </Modal >
}


export const PairedTestsAnalysis = PairedTestsAnalysisComponent;