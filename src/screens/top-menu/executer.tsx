import { SuspenseLoad } from '@libs';
import { useModal, IModal } from '@hooks';
import { FC, lazy, useEffect, useState } from 'react';
import { exporters } from './configuration';
import { useTranslation } from 'react-i18next';
import { useLicenseStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
const BrowseFile = lazy(() =>
  import('./browse-file').then((module) => ({ default: module.BrowseFile })),
);
const LeastSquare = lazy(() =>
  import('./analyze').then((module) => ({ default: module.LeastSquare })),
);
const Ridge = lazy(() => import('./analyze').then((module) => ({ default: module.RidgeModule })));

const DescriptiveStatistics = lazy(() =>
  import('./advanced').then((module) => ({ default: module.DescriptiveStatistics })),
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

const TestsAnalysis = lazy(() => import('./advanced').then((module) => ({ default: module.TestsAnalysis })));

const Options = lazy(() => import('./advanced').then((module) => ({ default: module.Options })));

const PairedTestsAnalysis = lazy(() => import('./advanced').then((module) => ({ default: module.PairedTestsAnalysis })));


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
  const { licenseStatus } = useLicenseStore(
    useShallow((state) => ({ licenseStatus: state.licenseStatus })),
  );
  const [isLicensed, setIsLicensed] = useState(false);
  useEffect(() => {
    if (!selector || selector === exporters.openDevTools) {
      setIsLicensed(true);
      return;
    }
    if (licenseStatus.state === 'expired') {
      setIsLicensed(true);
    } else {
      setIsLicensed(false);
    }
  }, [selector]);

  if (isLicensed) {
    return <OpenDevTools {...modal} showCloseButton={true} />;
  }
  const runSelector = () => {
    switch (selector) {
      case exporters.importBusinessObject:
        return <BrowseFile {...modal} t={t} />;
      case exporters.regressionLeastSquare:
        return <LeastSquare {...modal} />;
      case exporters.regressionRidge:
        return <Ridge {...modal} />;
      case exporters.descriptiveStat:
        return <DescriptiveStatistics {...modal} />;
      case exporters.estimationOfModule:
        return <EstimationOfModule {...modal} />;
      case exporters.openDevTools:
        return <OpenDevTools {...modal} />;
      case exporters.pairwiseComparisonOfModule:
        return <PairwiseComparisonOfModule {...modal} />;
      case exporters.tests:
        return <TestsAnalysis {...modal} />
      case exporters.options:
        return <Options {...modal} />
      case exporters.pairedTTest:
        return <PairedTestsAnalysis {...modal} />
      default:
        return null;
    }
  };
  return modal.open ? <>{runSelector()}</> : <></>;
};
