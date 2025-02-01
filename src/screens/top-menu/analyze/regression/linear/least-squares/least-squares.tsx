import { FC, useState } from 'react';
import {
  makeStyles,
  tokens,
  Tab,
  TabList,
  SelectTabData,
  SelectTabEvent,
} from '@fluentui/react-components';
import { Modal, ITranslate, NoIdSelected } from '@libs';
import { IModal, useActiveNode } from '@hooks';
import { Model } from './model';
import { Estimation } from './estimation';
import { Options } from './options';
import { Predict } from './predict';
import { Resampling } from './resampling';
import { useShallow } from 'zustand/react/shallow';
import { useColumnsRowsCount, IColumn } from '../../../../../table-render/use-column-count';
import { useLinearLeastSquares } from './use-squares-hook';
import { usePrepareAnalysis } from './use-anayse-hook';
import { useTranslation } from 'react-i18next';
import { useStartProStore } from '@store/main-store';
// import { OUTPUT } from '@libs/constants/query-const';

const useClasses = makeStyles({
  leastSqrWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalM,
    '& .details': {
      height: '53vh',
    },
  },
});
const LeastSquareComponent: FC<IModal> = ({ ...props }) => {
  const [selectedTab, setSelectedTab] = useState<string>('model');
  const { t } = useTranslation('regLinearLeastSquare');
  const classes = useClasses();
  const { setReset } = useLinearLeastSquares(
    useShallow((state) => ({
      setReset: state.setReset,
    })),
  );
  const { id, config } = useActiveNode([props.open]);
  const { columns } = useColumnsRowsCount({
    ...config,
    noRowCount: true,
  });
  const { setBlockUI } = useStartProStore();

  const { executeAnalysis } = usePrepareAnalysis({
    config,
    columns,
    queueFor: t('title', { ns: 'regLinearLeastSquare' }),
    queueType: 'regLinearLeastSquare',

  });

  const onTabSelectHandler = (_event: SelectTabEvent, { value }: SelectTabData): void => {
    setSelectedTab(value as string);
  };
  const onCloseModal = (): void => {
    setReset();
    props.closeModal();
  };

  const onOkModal = (): void => {

    if (!id && id !== '') { props.closeModal(); return; }
    executeAnalysis(id);
    props.closeModal();
    setBlockUI({ value: true, msg: "processRequest" });
  };
  return (
    <Modal
      key={id}
      modalType="alert"
      {...props}
      cancelLabel={t('close', { ns: 'regLinearLeastSquare' })}
      okLabel={t('ok', { ns: 'regLinearLeastSquare' })}
      title={t('title', { ns: 'regLinearLeastSquare' })}
      size="medium"
      showCancel={!id || id === '' ? false : true}
      closeModal={onCloseModal}
      ok={{ onClick: onOkModal }}
    >
      <div className={classes.leastSqrWrapper}>
        {!id || id === '' ? (
          <NoIdSelected />
        ) : (
          <>
            <TabList
              selectedValue={selectedTab}
              appearance="subtle"
              onTabSelect={onTabSelectHandler}
            >
              <Tab value="model">{t('model', { ns: 'regLinearLeastSquare' })}</Tab>
              <Tab value="estimation">{t('estimation', { ns: 'regLinearLeastSquare' })}</Tab>
              <Tab value="options">{t('options', { ns: 'regLinearLeastSquare' })}</Tab>
              <Tab value="predict">{t('predict', { ns: 'regLinearLeastSquare' })}</Tab>
              <Tab value="resampling">{t('resampling', { ns: 'regLinearLeastSquare' })}</Tab>
            </TabList>
            <div className="details">
              <LoadTabDetails t={t} selectedTab={selectedTab} columns={[...columns]} />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
const LoadTabDetails: FC<ITranslate & { selectedTab: string; columns: IColumn[] }> = ({
  selectedTab,
  ...props
}) => {
  switch (selectedTab) {
    case 'model':
      return <Model />;
    case 'estimation':
      return <Estimation {...props} />;
    case 'options':
      return <Options {...props} />;
    case 'predict':
      return <Predict {...props} />;
    case 'resampling':
      return <Resampling {...props} />;
    default:
      return <p>{selectedTab}</p>;
  }
};
export const LeastSquare = LeastSquareComponent;
