import { FC, useEffect, useState } from 'react';
import { IModal, useActiveNode } from '@hooks';
import { Modal } from '@libs';
import { useTranslation } from 'react-i18next';
import { NoIdSelected } from '@libs/no-id-selected-msg';
import { useTTestsStats } from './use-t-tests'
import { useStartProStore } from '@store/main-store';
import { usePrepareAnalysis } from './use-prep-analysis';
import { DataFormatScreens } from './data-format';
import { readJsonFile } from '@utils';
import { useTestsStats } from '../options/use-tests-config';
import { CONFIG_FILE } from '@constants/db';
import { join } from '@tauri-apps/api/path';
import { homeDirectory } from '../../../../../utils/app-apis';
import { COLLECTION_DIR } from '@constants/home-folders';

const TestsAnalysisComponent: FC<IModal> = ({ ...props }) => {
  const [selectedDataFormat, setSelectedDataFormat] = useState("raw");
  const [appFolder, setAppFolder] = useState("");
  const [filePath, setFilePath] = useState("");
  const { t } = useTranslation(['T_TestsAnalysys', 'common']);
  const { setReset } = useTTestsStats();
  const { setModel: setOptionsModel } = useTestsStats();
  const { setBlockUI } = useStartProStore();
  const [pageIndex, setPageIndex] = useState(0);
  const { id, config } = useActiveNode([props.open]);
  const { executeAnalysis } = usePrepareAnalysis({
    config,
    queueFor: t('title', { ns: 'T-testAnalysis' }),
    queueType: 'tTestModule',
  });


  useEffect(() => {
    homeDirectory().then(r => setAppFolder(r));
    join(appFolder, COLLECTION_DIR, CONFIG_FILE).then(r => setFilePath(r));
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

  return <Modal modalType="modal"
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


export const TestsAnalysis = TestsAnalysisComponent;