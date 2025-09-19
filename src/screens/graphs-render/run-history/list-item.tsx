import { FC, memo } from 'react';
import { Caption1, Caption2, tokens } from '@fluentui/react-components';
import { useFormatter } from '@hooks';
import { MdBarChart } from 'react-icons/md';

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
  
  const handleClick = () => {
    const title = `${graphType} - ${config?.graphConfig?.subType || 'Graph'}`;
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
            {graphType} - {config?.graphConfig?.subType || 'Graph'}
          </Caption1>
          <Caption2 style={{ color: tokens.colorNeutralForeground3 }}>
            {dateFormat(modifiedDateTime)}
          </Caption2>
        </div>
      </div>
    </li>
  );
};

export const HistoryListRender = memo(HistoryListRenderComponent);
