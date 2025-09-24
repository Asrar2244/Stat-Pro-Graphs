import { FC, memo } from 'react';
import { Caption1, Caption2, tokens, Button, Tooltip } from '@fluentui/react-components';
import { useFormatter } from '@hooks';
import { MdBarChart } from 'react-icons/md';
import { IoTrashOutline } from 'react-icons/io5';

interface IHistoryListRender {
  id: number;
  graphType: string;
  modifiedDateTime: string;
  config: any;
  selectedRun: (id: number, title: string) => void;
  selectedID: number;
}

const HistoryListRenderComponent: FC<IHistoryListRender> = ({
  id,
  graphType,
  modifiedDateTime,
  config,
  selectedRun,
  selectedID,
}) => {
  const { dateFormat } = useFormatter();
  const isSelected = selectedID === id;
  
  const displayTitle = config?.graphConfig?.global?.graphName
    || config?.graphConfig?.subType
    || graphType
    || 'Graph';

  const handleClick = () => {
    const title = displayTitle;
    selectedRun(id, title);
  };

  return (
    <li
      className={`history-item ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      style={{
        padding: tokens.spacingVerticalM,
        cursor: 'pointer',
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
        backgroundColor: isSelected ? tokens.colorNeutralBackground1Hover : 'transparent',
        transition: 'background-color 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
        <MdBarChart size={16} color={tokens.colorNeutralForeground2} />
        <div style={{ flex: 1 }}>
          <Caption1 style={{ fontWeight: 600, color: tokens.colorNeutralForeground1 }}>
            {displayTitle}
          </Caption1>
          <Caption2 style={{ color: tokens.colorNeutralForeground3 }}>
            {dateFormat(modifiedDateTime)}
          </Caption2>
        </div>
        <Tooltip content="Delete" relationship="label">
          <Button
            appearance="subtle"
            onClick={(e) => {
              e.stopPropagation();
              const ok = window.confirm(`Delete graph "${displayTitle}"? This cannot be undone.`);
              if (!ok) return;
              const ev = new CustomEvent('statpro:deleteGraphRun', { detail: { id } });
              window.dispatchEvent(ev);
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = tokens.colorPaletteRedForeground1;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '';
            }}
            icon={<IoTrashOutline />}
          />
        </Tooltip>
      </div>
    </li>
  );
};

export const HistoryListRender = memo(HistoryListRenderComponent);
