import axios from 'axios';
import dompurify from 'dompurify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
interface IWelcome {
  isLoading: boolean;
  __html: string;
}
export const useFetchWelcome = (url?: string): IWelcome => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [__html, setHtml] = useState<string>('');
  const { t } = useTranslation('errors', { useSuspense: true });
  useEffect(() => {
    if (url) {
      setLoading(true);
      fetchWelcomePage()
        .then((result: any): void => {
          setLoading(false);
          setHtml(dompurify.sanitize(result.data));
        })
        .catch((e) => {
          window.api.log('error', e.message);
          setHtml(`<p>${e.message}</p>`);
          setLoading(false);
        });
    } else {
      setHtml(`<p>${t('nothingFound')}</p>`);
    }
  }, [url]);

  const fetchWelcomePage = async (): Promise<Response> => {
    return await axios.get(`${url}`);
  };
  return {
    isLoading,
    __html,
  };
};
