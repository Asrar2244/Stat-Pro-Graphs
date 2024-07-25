import {
  Tooltip,
  Button,
  Menu,
  MenuPopover,
  MenuTrigger,
  Slider,
  CounterBadge,
} from '@fluentui/react-components';
import { FC, memo } from 'react';
import { MdOutlineFormatBold } from 'react-icons/md';
import { CgFormatColor } from 'react-icons/cg';
import { RxFontSize, RxFontItalic } from 'react-icons/rx';
import { useTranslation } from 'react-i18next';
import { LiaFontSolid } from 'react-icons/lia';
import { FaFont } from 'react-icons/fa6';
import { GoHistory } from 'react-icons/go';
import { ITools } from './hooks/use-tools';
import { useToolsStyle } from './styles-hook/use-tool-style';
const ToolBarComponent: FC<{ tools: ITools; title?: string; subTitle?: string }> = ({
  tools,
  title,
  subTitle,
}) => {
  const { t } = useTranslation('outputToolBar');
  const classes = useToolsStyle();
  return (
    <div className={classes['output-band']}>
      <div className={classes.title}>
        {title}
        <div>
          {subTitle && (
            <>
              @:<small>&nbsp;{subTitle}</small>
            </>
          )}
        </div>
      </div>
      <div className="output-tools">
        <ul>
          <li className={tools.fontBold ? 'selected' : ''}>
            <Tooltip content={t('bold')} relationship="label" withArrow>
              <Button
                icon={<MdOutlineFormatBold />}
                appearance="transparent"
                onClick={tools.toggleFontBold}
              />
            </Tooltip>
          </li>
          <li className={tools.fontItalic ? 'selected' : ''}>
            <Tooltip content={t('italic')} relationship="label" withArrow>
              <Button
                icon={<RxFontItalic />}
                appearance="transparent"
                onClick={tools.toggleFontItalic}
              />
            </Tooltip>
          </li>
          <li>
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Tooltip content={t('fontSize')} relationship="label" withArrow>
                  <Button icon={<RxFontSize />} appearance="transparent" />
                </Tooltip>
              </MenuTrigger>
              <MenuPopover>
                <div className={classes.fontSizePanel}>
                  <div>
                    <LiaFontSolid />
                  </div>
                  <Slider size="small" step={2} defaultValue={4} min={2} max={10} />
                  <div>
                    <FaFont />
                  </div>
                </div>
              </MenuPopover>
            </Menu>
          </li>
          <li>
            <Tooltip content={t('fontColor')} relationship="label" withArrow>
              <div className="color-picker">
                <Button icon={<CgFormatColor />} appearance="transparent" />
                <input type="color" />
              </div>
            </Tooltip>
          </li>
          <li className={tools.showRunHistory ? 'selected' : ''}>
            <Tooltip content={t('runHistory')} relationship="label" withArrow>
              <div className={classes.historyCounter}>
                <CounterBadge
                  count={tools.totalRuns}
                  appearance="filled"
                  size="small"
                  className="counter"
                />
                <Button
                  icon={<GoHistory />}
                  appearance="transparent"
                  onClick={tools.toggleShowHistory}
                />
              </div>
            </Tooltip>
          </li>
        </ul>
      </div>
    </div>
  );
};

export const ToolBar = memo(ToolBarComponent);
