import { SuspenseLoad } from '@libs';
import { useModal, IModal } from '@hooks';
import { FC, lazy, useState } from 'react';
import { exporters } from './configuration';
import { useTranslation } from 'react-i18next';
const BrowseFile = lazy(() =>
  import('./browse-file').then((module) => ({ default: module.BrowseFile })),
);
const LeastSquare = lazy(() =>
  import('./analyze').then((module) => ({ default: module.LeastSquare })),
);
const Ridge = lazy(() => import('./analyze').then((module) => ({ default: module.RidgeModule })));

const ColumnWise = lazy(() =>
  import('./analyze').then((module) => ({ default: module.ColumnWise })),
);
const OpenDevTools = lazy(() =>
  import('./open-dev-tools').then((module) => ({ default: module.OpenDevTools })),
);
const EstimationOfModule = lazy(() =>
  import('./analyze').then((module) => ({ default: module.estimationOfModule })),
);

const PairwiseComparisonOfModule = lazy(() =>
  import('./analyze').then((module) => ({ default: module.PairwiseComparisonModule })),
);


export const withMenuEvents = <P extends object>(
  translationNs: string,
  WrappedComponent: React.ComponentType<P>,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
  return function withMenuEvents(props: any) {
    const [selectedMenu, setSelectedMenu] = useState<string>('');
    const modal = useModal({});
    const setMenuItem = (item: string): void => {
      setSelectedMenu(item);
      modal.openModal();
    };
    return (
      <SuspenseLoad>
        <WrappedComponent {...props} setMenuItem={setMenuItem} />
        {selectedMenu && (
          <MenuSelector modal={modal} selector={selectedMenu} translationNs={translationNs} />
        )}
      </SuspenseLoad>
    );
  };
};

const MenuSelector: FC<{
  modal: IModal;
  selector: string;
  translationNs: string;
}> = ({ selector, modal }) => {
  const { t } = useTranslation(['common', 'errors', 'success']);
  switch (selector) {
    case exporters.importBusinessObject:
      return <BrowseFile {...modal} t={t} />;
    case exporters.regressionLeastSquare:
      return modal.open ? <LeastSquare {...modal} /> : <></>;
    case exporters.regressionRidge:
      return <Ridge {...modal} />;
    case exporters.basicStatisticsColumnWise:
      return <ColumnWise {...modal} />;
    case exporters.estimationOfModule:
      return <EstimationOfModule {...modal} />;
    case exporters.openDevTools:
      return <OpenDevTools />;
    case exporters.pairwiseComparisonOfModule:
      return <PairwiseComparisonOfModule  {...modal} />
    default:
      return null;
  }
};

