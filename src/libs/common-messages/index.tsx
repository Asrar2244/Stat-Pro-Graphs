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
        ({t(licenseStatus.state as string)})
      </Text>
    </div>
  );
};
export interface ITranslate {
  t: (key: string | string[], option?: any) => string;
}
