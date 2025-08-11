import { Text, Caption2, mergeClasses } from '@fluentui/react-components';
import { FC } from 'react';
import { useRunHistoryClasses } from '../styles-hook/use-run-history-style';
import { IFetchSingleOutput } from '@backend';
import { friendlyTitleForOutput } from '../utils/title';
import { CalenderTablet } from '@libs';
import { useFormatter } from '@hooks';
import dayjs from 'dayjs';

export const HistoryListRender: FC<
  IFetchSingleOutput & {
    selectedID?: number;
    selectedRun: (id: number, title: string, subTitle?: string) => void;
  }
> = ({ id, outputFor, outputType, modifiedDateTime, selectedRun, selectedID }) => {
  const classes = useRunHistoryClasses();
  const { dateTimeFormat } = useFormatter();
  const handleClick = (): void => {
    const nice = friendlyTitleForOutput(outputType, outputFor);
    selectedRun(id, nice, dateTimeFormat(modifiedDateTime as string));
  };
  const applyIfSelected = mergeClasses(
    classes.cardList,
    selectedID === id ? classes.selectedItem : '',
  );

  return (
    <li className={applyIfSelected} key={id} onClick={handleClick}>
      <div className={classes.horizontalCardImage}>
        <div className="calender">
          <CalenderTablet date={modifiedDateTime} />
        </div>
      </div>
      <div className={classes.headerTitle}>
        <Text className="header-label">{friendlyTitleForOutput(outputType, outputFor)}</Text>
        <Caption2 className={classes.caption}>
          {dayjs(modifiedDateTime).format('HH:mm:ss')}
        </Caption2>
      </div>
    </li>
  );
};
