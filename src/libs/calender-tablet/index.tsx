import { Body1Stronger, Caption2 } from '@fluentui/react-components';
import dayjs from 'dayjs';
import { FC, memo, useMemo } from 'react';
import AdvanceFormat from 'dayjs/plugin/advancedFormat';
import { useClassCalender } from './styles-hook/use-calender-style';
export interface ICalenderTab {
  date?: string;
}

const CalenderTabComponent: FC<ICalenderTab> = ({ date }) => {
  const classes = useClassCalender();
  dayjs.extend(AdvanceFormat);
  const dateObj = useMemo(() => {
    if (!date) return undefined;
    const dayJsObj = dayjs(date);
    return {
      month: dayJsObj.format('MMM'),
      year: dayJsObj.year(),
      date: dayJsObj.date(),
    };
  }, [date]);
  return (
    <div className={classes.calender}>
      <div className="inner-calender">
        <Caption2>{dateObj?.month}</Caption2>
        <Body1Stronger>{dateObj?.date}</Body1Stronger>
        <Caption2>{dateObj?.year}</Caption2>
      </div>
    </div>
  );
};

export const CalenderTablet = memo(CalenderTabComponent);
