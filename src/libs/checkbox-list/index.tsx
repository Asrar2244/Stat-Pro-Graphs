import { FC, ChangeEvent, useEffect, useState } from 'react';
import { Checkbox, Divider } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
interface IProps {
  list: { [key: string]: boolean };
  selected: boolean | 'mixed' | undefined;
  className?: string;
}
export const CheckListRender: FC<IProps> = ({ list, selected, className }) => {
  const [localList, setLocalList] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation('common');
  useEffect(() => {
    setLocalList(list);
    setLoading(true);
  }, [selected, list]);
  useEffect(() => {
    setLoading(false);
  }, [localList]);
  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    list[e.target.name] = e.target.checked;
  };
  return (
    <div className={className ?? ''}>
      {loading ? (
        <div>{t('loading')}</div>
      ) : (
        Object.keys(localList).map((key: string) => (
          <div key={key}>
            <Checkbox
              label={key}
              name={key}
              defaultChecked={localList[key]}
              onChange={onChangeHandler}
            />
            <Divider />
          </div>
        ))
      )}
    </div>
  );
};
