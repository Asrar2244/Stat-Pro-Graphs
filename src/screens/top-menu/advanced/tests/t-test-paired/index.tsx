import { FC, useEffect, useState } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { IModal, useActiveNode } from '@hooks';
import { Modal, NoIdSelected } from '@libs';
import { useTranslation } from 'react-i18next';
import { usePairedTTestsStats } from './use-t-test-paired';
import { useStartProStore } from '@store/main-store';
import { usePrepareAnalysis } from './use-prep-analysis';
import { Model } from './model';
import { readJsonFile } from '@utils';
import { useTestsStats } from '../options/use-tests-config';
import { CONFIG_FILE } from '@constants/db';
import { join } from '@tauri-apps/api/path';
import { homeDirectory } from '../../../../../utils/app-apis';
import { COLLECTION_DIR } from '@constants/home-folders';
import { useShallow } from 'zustand/react/shallow';

const useClasses = makeStyles({
  pairedTTestWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalM,
    width: '65em',
    maxHeight: '60vh',
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalM,
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: `${tokens.colorNeutralStroke1} transparent`,
    '&::-webkit-scrollbar': {
      width: '8px',
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: '8px',
      backgroundColor: tokens.colorNeutralStroke1,
      backgroundClip: 'padding-box',
      border: '2px solid transparent',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: tokens.colorNeutralStroke2,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '& .details': {
      maxHeight: '42vh',
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: `${tokens.colorNeutralStroke1} transparent`,
      '&::-webkit-scrollbar': {
        width: '8px',
        backgroundColor: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: '8px',
        backgroundColor: tokens.colorNeutralStroke1,
        backgroundClip: 'padding-box',
        border: '2px solid transparent',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: tokens.colorNeutralStroke2,
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
      },
    },
  },
});

const PairedTestsAnalysisComponent: FC<IModal> = ({ ...props }) => {
  const { t } = useTranslation(['pairedTTestAanalysis', 'common']);
  const classes = useClasses();
  const { setReset } = usePairedTTestsStats(
    useShallow((state) => ({
      setReset: state.setReset,
    })),
  );
  const { id, config } = useActiveNode([props.open]);
  const { setBlockUI } = useStartProStore();
  const { setModel: setOptionsModel } = useTestsStats();
  const [appFolder, setAppFolder] = useState("");
  const [filePath, setFilePath] = useState("");

  const { executeAnalysis } = usePrepareAnalysis({
    config,
    queueFor: t('title', { ns: 'pairedTTestAanalysis' }),
    queueType: 'tTestModule',
  });

  useEffect(() => {
    homeDirectory().then(r => {
      setAppFolder(r);
      join(r, COLLECTION_DIR, CONFIG_FILE).then(path => {
        setFilePath(path);
        readJsonFile(path).then(configData => {
          setOptionsModel(configData as any);
        }).catch(e => {
          console.log("error in reading config file", e);
        });
      });
    });
  }, [setOptionsModel]);

  const onCloseModal = (): void => {
    setReset();
    props.closeModal();
  };

  const onOkModal = (): void => {
    if (!id || id === '') {
      props.closeModal();
      return;
    }
    executeAnalysis(id);
    props.closeModal();
    setBlockUI({ value: true, msg: 'processRequest', hideOk: true });
  };

  return (
    <Modal
      key={id}
      modalType="alert"
      {...props}
      cancelLabel={t('close')}
      okLabel={t('ok')}
      title={t('titleData')}
      size="medium"
      showCancel={!id || id === '' ? false : true}
      closeModal={onCloseModal}
      ok={{ onClick: onOkModal }}
    >
      <div className={classes.pairedTTestWrapper}>
        {!id || id === '' ? (
          <NoIdSelected />
        ) : (
          <div>
            <Model />
          </div>
        )}
      </div>
    </Modal>
  );
};

export const PairedTestsAnalysis = PairedTestsAnalysisComponent;