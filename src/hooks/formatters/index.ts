import { useTranslation } from 'react-i18next';
interface IFormatter {
  dateFormat: (dateTime: string) => string;
  timeFormat: (dateTime: string) => string;
  dateTimeFormat: (dateTime: string) => string;
  numberFormat: (value: string | number) => string;
}

export const useFormatter = (): IFormatter => {
  const { i18n } = useTranslation();
  const dateFormat = (dateTime: string): string => {
    return new Date(dateTime).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };
  const timeFormat = (dateTime: string): string => {
    return new Date(dateTime).toLocaleTimeString(i18n.language, {
      hour: 'numeric',
      minute: 'numeric',
    });
  };
  const dateTimeFormat = (dateTime: string): string => {
    return new Date(dateTime).toLocaleString(i18n.language, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };
  const numberFormat = (value: string | number): string => {
    if (!Number(value)) return value?.toString();
    return new Intl.NumberFormat(i18n.language).format(Number(value));
  };
  return {
    dateFormat,
    timeFormat,
    dateTimeFormat,
    numberFormat,
  };
};
