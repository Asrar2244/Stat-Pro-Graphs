import { Button, Caption1, Tooltip } from '@fluentui/react-components';
import { VscClose } from 'react-icons/vsc';
import { useGraphTabLayout } from '../../styles-hook/use-graph-tabs';
import { useRef } from 'react';
export const GraphTabs = () => {
  const classes = useGraphTabLayout();
  const listRef = useRef<HTMLUListElement>(null);
  const handleWheelScroll = (event: React.WheelEvent<HTMLUListElement>) => {
    if (listRef.current) {
      event.preventDefault();
      listRef.current.scrollLeft += event.deltaY;
    }
  };

  return (
    <div className={classes.historyTab}>
      <ul ref={listRef} className={classes.ul} onWheel={handleWheelScroll}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((item) => {
          return (
            <li key={item}>
              <Tooltip content={item} relationship="label" withArrow>
                <div className={classes.docIndex}>
                  <Button appearance="transparent" shape="square" size="large">
                    <Caption1 truncate wrap={false}>
                      {`Graph ${item}`}
                    </Caption1>
                  </Button>
                  <Button
                    icon={<VscClose />}
                    appearance="transparent"
                    shape="square"
                    size="small"
                  />
                </div>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
