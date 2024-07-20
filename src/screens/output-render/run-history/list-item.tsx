import { Text, Caption2 } from '@fluentui/react-components';
import { FC } from 'react';
import { useRunHistoryClasses } from '../styles-hook/use-run-history-style';
import { IFetchSingleOutput } from '@backend';
import { CalenderTablet } from '@libs';
import { useFormatter } from '@hooks';
import dayjs from 'dayjs';

export const HistoryListRender: FC<
  IFetchSingleOutput & { selectedRun: (id: number, title: string, subTitle?: string) => void }
> = ({ id, outputFor, modifiedDateTime, selectedRun }) => {
  const classes = useRunHistoryClasses();
  const { dateTimeFormat } = useFormatter();
  const handleClick = (): void => {
    selectedRun(id, outputFor, dateTimeFormat(modifiedDateTime as string));
  };
  return (
    <li className={classes.cardList} key={id} onClick={handleClick}>
      <div className={classes.horizontalCardImage}>
        <div className="calender">
          <CalenderTablet date={modifiedDateTime} />
        </div>
      </div>
      <div className={classes.headerTitle}>
        <Text className="header-label">{outputFor}</Text>
        <Caption2 className={classes.caption}>
          {dayjs(modifiedDateTime).format('HH:mm:ss')}
        </Caption2>
      </div>
    </li>
  );
};
