import { Spinner, Text } from '@fluentui/react-components';
import { FC } from 'react';
import { useTasks, useLicenseStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { useCommonLayout } from './styles-hook/use-common-style';
import { useTranslation } from 'react-i18next';
import { licenseColors } from '@constants';
export const CommonMessages: FC = () => {
  const classes = useCommonLayout();
  const { t } = useTranslation('common');
  const { common } = useTasks(useShallow((state) => ({ common: state.commonMsg })));
  const { licenseStatus } = useLicenseStore(
    useShallow((state) => ({ licenseStatus: state.licenseStatus })),
  );

    // Helper function to get license display text
    const getLicenseDisplayText = (): string => {
      if (!licenseStatus.state) {
        return t('lookingProductLicense', { ns: 'common' });
      }
  
      // Use displayText if available (computed from license check)
      if (licenseStatus.displayText) {
        if (licenseStatus.displayText === 'lifetime') {
          return t('lifetime', { ns: 'common' });
        }
        if (licenseStatus.displayText === 'expired') {
          return t('expired', { ns: 'common' });
        }
        if (licenseStatus.displayText === 'noValidLicense') {
          return t('noValidLicense', { ns: 'common' });
        }
        if (licenseStatus.displayText === 'lookingProductLicense') {
          return t('lookingProductLicense', { ns: 'common' });
        }
        // Handle days remaining
        if (licenseStatus.displayText === 'daysRemaining') {
          const days = licenseStatus.daysRemaining ?? 0;
          return t('daysRemaining', { ns: 'common', days });
        }
      }
  
      // Fallback to state-based display
      if (licenseStatus.state === 'lifetime') {
        return t('lifetime', { ns: 'common' });
      }
      if (licenseStatus.state === 'expired') {
        return t('expired', { ns: 'common' });
      }
      if (licenseStatus.state === 'lookingProductLicense') {
        return t('lookingProductLicense', { ns: 'common' });
      }
      if (licenseStatus.state === '30Days') {
        // Show actual days remaining if available
        if (licenseStatus.daysRemaining !== null && licenseStatus.daysRemaining !== undefined) {
          return t('daysRemaining', { ns: 'common', days: licenseStatus.daysRemaining });
        }
        // Fallback to default message
        return t('30Days', { ns: 'common' });
      }
  
      return t('noValidLicense', { ns: 'common' });
    };

  return (
    <div className={classes.loaderBox}>
      {common?.spinner && <Spinner size="extra-tiny" />}
      &nbsp;{' '}
      <Text size={100} font="monospace">
        {common?.message}
      </Text>
      <Text
        size={100}
        font="monospace"
        className={classes.licenseStatus}
        style={{ color: licenseColors[licenseStatus.state as keyof typeof licenseColors] }}
      >
       ({getLicenseDisplayText()})
      </Text>
    </div>
  );
};
export interface ITranslate {
  t: (key: string | string[], option?: any) => string;
}
