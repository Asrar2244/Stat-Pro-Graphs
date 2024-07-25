import { useEffect, useState } from 'react';
import { IFetchSingleOutput, fetchSingleOutput } from '@backend';
import { useToaster } from '@hooks';
interface ISelectedRun {
  loading: boolean;
  selectedRun: IFetchSingleOutput | undefined;
}

export const useSelectedRun = (dbName: string, id: number): ISelectedRun | undefined => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRun, setSelectedRun] = useState<IFetchSingleOutput | undefined>(undefined);
  const toast = useToaster();
  useEffect(() => {
    if (id > 0) {
      setLoading(true);
      fetchSingleOutput(dbName, id)
        .then((result) => {
          setSelectedRun(result);
        })
        .catch((e) => {
          toast.error({ body: e.message });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  return {
    loading,
    selectedRun,
  };
};

export const useGetRunID = (): {
  id: number;
  title: string;
  subTitle?: string;

  setRunDetail: (id: number, title: string, subTitle?: string) => void;
} => {
  const [runId, setRunId] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [subTitle, setSubTitle] = useState<string | undefined>(undefined);
  const setRunDetail = (id: number, title: string, subTitle?: string): void => {
    setRunId(id);
    setTitle(title);
    setSubTitle(subTitle);
  };
  return {
    id: runId,
    title,
    setRunDetail,
    subTitle,
  };
};
