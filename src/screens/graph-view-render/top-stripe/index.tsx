import { Button, Caption1, Field, Combobox, Option, Tooltip } from '@fluentui/react-components';
import { VscChevronLeft, VscChevronRight } from 'react-icons/vsc';
import { useToolStripLayout } from '../styles-hook/use-tool-stripe';
import { GRAPH_TYPES_CONFIG } from '../configurations';
import { useEffect, useRef, useState } from 'react';
export const TopStripe = () => {
  const classes = useToolStripLayout();
  const containerRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  useEffect(() => {
    checkScroll();
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, []);
  // Scroll Function
  const scroll = (direction: number) => {
    if (containerRef.current) {
      const scrollAmount = 200;
      const newScrollPosition = containerRef.current.scrollLeft + direction * scrollAmount;

      if (newScrollPosition <= 0) {
        containerRef.current.scrollLeft = 0;
      } else if (
        newScrollPosition >
        containerRef.current.scrollWidth - containerRef.current.clientWidth
      ) {
        containerRef.current.scrollLeft =
          containerRef.current.scrollWidth - containerRef.current.clientWidth;
      } else {
        containerRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Check scroll position
  const checkScroll = () => {
    if (containerRef.current) {
      setCanScrollLeft(containerRef.current.scrollLeft > 0);
      setCanScrollRight(
        containerRef.current.scrollLeft <
          containerRef.current.scrollWidth - containerRef.current.clientWidth,
      );
    }
  };
  const onScrollLeft = () => {
    scroll(-1);
  };
  const onScrollRight = () => {
    scroll(1);
  };
  return (
    <div className={classes.layoutToolStrip}>
      <div className={classes.titleSearch}>
        <div>for Data</div>
        <Field>
          <Combobox appearance="filled-lighter" placeholder={'Search Graph'} multiselect={true}>
            {GRAPH_TYPES_CONFIG.map((item) => {
              const Icon = item.Icon;
              return (
                <Option
                  key={item.type}
                  value={item.type}
                  text={item.label}
                  className={classes.dropdownOptions}
                >
                  <div className={classes.dropDownSelection}>
                    <Icon />
                    <div>{item.label}</div>
                  </div>
                </Option>
              );
            })}
          </Combobox>
        </Field>
      </div>
      <div className={classes.toolStrip}>
        <div className={classes.navButtons}>
          <Button
            icon={<VscChevronLeft />}
            appearance="transparent"
            shape="square"
            size="large"
            onClick={onScrollLeft}
            disabled={!canScrollLeft}
          />
        </div>

        <ul ref={containerRef} className={classes.ul}>
          {GRAPH_TYPES_CONFIG.map((item) => {
            const Icon = item.Icon;
            return (
              <li key={item.type}>
                <Tooltip content={item.label} relationship="label" withArrow>
                  <div>
                    <Button icon={<Icon />} appearance="transparent" shape="square" size="large">
                      <Caption1 truncate wrap={false}>
                        {item.label}
                      </Caption1>
                    </Button>
                  </div>
                </Tooltip>
              </li>
            );
          })}
        </ul>

        <div className={classes.navButtons}>
          <Button
            icon={<VscChevronRight />}
            appearance="transparent"
            shape="square"
            size="large"
            onClick={onScrollRight}
            disabled={!canScrollRight}
          />
        </div>
      </div>
    </div>
  );
};
