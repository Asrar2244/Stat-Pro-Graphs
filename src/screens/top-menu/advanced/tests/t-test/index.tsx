import { FC, useEffect } from 'react';
import { IModal, useActiveNode } from '@hooks';
import { Modal, NoIdSelected } from '@libs';
import { useTranslation } from 'react-i18next';
import { useTTestsStats } from './use-t-tests';
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
import { useIndexStyles } from './styles-hook/use-index-styles';

const TestsAnalysisComponent: FC<IModal> = ({ ...props }) => {
  const { t } = useTranslation(['T_TestsAnalysys', 'common']);
  const classes = useIndexStyles();
  const { setReset } = useTTestsStats(
    useShallow((state) => ({
      setReset: state.setReset,
    })),
  );
  const { id, config } = useActiveNode([props.open]);
  const { setBlockUI } = useStartProStore();
  const { setModel: setOptionsModel } = useTestsStats();

  const { executeAnalysis } = usePrepareAnalysis({
    config,
    queueFor: t('title', { ns: 'T-testAnalysis' }),
    queueType: 'tTestModule',
  });

  useEffect(() => {
    homeDirectory().then(r => {
      join(r, COLLECTION_DIR, CONFIG_FILE).then(path => {
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
      modalType="non-modal"
      {...props}
      cancelLabel={t('close')}
      okLabel={t('ok')}
      title={t('titleData')}
      size="medium"
      showCancel={!id || id === '' ? false : true}
      closeModal={onCloseModal}
      ok={{ onClick: onOkModal }}
    >
      <div className={classes.tTestWrapper}>
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

export const TestsAnalysis = TestsAnalysisComponent;