import { FC, useEffect, useState } from 'react';
import { Tab, TabList, SelectTabData, SelectTabEvent } from '@fluentui/react-components';
import { IModal } from '@hooks';
import { Modal } from '@libs';
import { useTranslation } from 'react-i18next';
import { useCommonStyles } from './styles-hook/use-test-styles';
import { AassumptionChecking } from './assumption-checking';
import { useTestsStats } from './use-tests-config'
import { useStartProStore } from '@store/main-store';
import { Results } from './results';
import { PostHocTest } from './post-hoc-test';
import { homeDirectory, readJsonFile, saveLargeJsonToFile } from '@utils';
import { join } from '@tauri-apps/api/path';
import { CONFIG_FILE } from '@constants/db';
import { COLLECTION_DIR } from '@constants/home-folders';

const OptionsComponent: FC<IModal> = ({ ...props }) => {
  const [selectedTab, setSelectedTab] = useState<string>('assumptionChecking');
  const classes = useCommonStyles();
  const { t } = useTranslation(['optionsComponent', 'common']);
  const { model, setReset, setModel } = useTestsStats();
  const [appFolder, setAppFolder] = useState("");
  const [filePath, setFilePath] = useState("");
  const { setBlockUI } = useStartProStore();
  const onTabSelectHandler = (_event: SelectTabEvent, { value }: SelectTabData): void => {
    setSelectedTab(value as string);
  };

  useEffect(() => {
    homeDirectory().then(r => setAppFolder(r));
    join(appFolder, COLLECTION_DIR, CONFIG_FILE).then(r => setFilePath(r));
  }, [])

  useEffect(() => {
    readJsonFile(filePath).then(r => {
      setModel(r as any);
    }).catch(e => {
      console.log("error in reading config file", e)
    });
  }, [])

  const onCloseModal = (): void => {
    setReset();
    props.closeModal();
  };

  const onOkModal = () => {
    setBlockUI({ value: true, msg: "processRequest" });
    saveLargeJsonToFile(filePath, model).then(() => {
      setBlockUI({ value: false, msg: "" });
    }).catch((e) => {
      console.log(e, "error occured")
      setBlockUI({ value: true, msg: t(`${e}`) });
    });
    onCloseModal();
  }

  return <Modal
    modalType="alert"
    {...props}
    cancelLabel={t('close')}
    okLabel={t('ok')}
    title={t('title')}
    size="medium"
    closeModal={onCloseModal}
    showCancel={true}
    ok={{ onClick: onOkModal }}
  >
    <div className={classes.commonWrapper}>
      <>
        <TabList
          selectedValue={selectedTab}
          appearance="subtle"
          onTabSelect={onTabSelectHandler}
        >
          <Tab value="assumptionChecking">{t('assumptionChecking')}</Tab>
          <Tab value="results">{t('results')}</Tab>
          <Tab value="postHocTest">{t('postHocTest')}</Tab>
        </TabList>
        <div className="details">
          <LoadTabDetails selectedTab={selectedTab} />
        </div>
      </>
    </div>
  </Modal>
}

const LoadTabDetails: FC<{ selectedTab: string }> = ({ selectedTab, ...props }) => {
  switch (selectedTab) {
    case 'assumptionChecking':
      return <AassumptionChecking {...props} />;
    case 'results':
      return <Results {...props} />;
    case 'postHocTest':
      return <PostHocTest {...props} />;
    default:
      return <p>{selectedTab}</p>;
  }
};

export const Options = OptionsComponent;