import React, { FC, ReactNode } from 'react';
import { Button, Text, tokens } from '@fluentui/react-components';
import { MdCheckCircle, MdInfoOutline, MdOutlineRemove, MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight, MdTrendingDown, MdTrendingUp } from 'react-icons/md';

interface VariableSelectionProps {
  classes: Record<string, string>;
  requireX: boolean;
  requireY: boolean;
  showVariableSelection: boolean;
  dataFormat: string;
  availableList: Map<string, boolean>;
  selectAllAvailable: boolean | string | undefined;
  setSelectAllAvailable: (v: boolean | string | undefined) => void;
  setAvailableList: (v: Map<string, boolean>) => void;
  VariableListRender: FC<any>;
  yVariableList: Map<string, boolean>;
  selectAllY: boolean | string | undefined;
  setSelectAllY: (v: boolean | string | undefined) => void;
  setYVariableList: (v: Map<string, boolean>) => void;
  xVariableList: Map<string, boolean>;
  selectAllX: boolean | string | undefined;
  setSelectAllX: (v: boolean | string | undefined) => void;
  setXVariableList: (v: Map<string, boolean>) => void;
  handleSendToX: () => void;
  handleSendToY: () => void;
  handleRemoveFromX: () => void;
  handleRemoveFromY: () => void;
  canSendToX: boolean;
  canSendToY: boolean;
}

export const VariableSelection: FC<VariableSelectionProps> = (props) => {
  const {
    classes,
    requireX,
    requireY,
    showVariableSelection,
    dataFormat,
    availableList,
    selectAllAvailable,
    setSelectAllAvailable,
    setAvailableList,
    VariableListRender,
    yVariableList,
    selectAllY,
    setSelectAllY,
    setYVariableList,
    xVariableList,
    selectAllX,
    setSelectAllX,
    setXVariableList,
    handleSendToX,
    handleSendToY,
    handleRemoveFromX,
    handleRemoveFromY,
    canSendToX,
    canSendToY,
  } = props;

  return (
    <div className={classes.variableContainer}>
      <div className={classes.variableHeader}>
        <div className={classes.variableHeaderRow}>
          <MdCheckCircle size={20} color={tokens.colorPaletteGreenForeground1} />
          <Text size={400} weight="semibold" className={classes.variableHeaderTitle}>Variable Assignment</Text>
        </div>
        <Text size={200} className={classes.variableHeaderSubtitle}>
          Select variables for your scatter plot. Use the arrows to assign variables to X and Y axes.
        </Text>
      </div>

      <div className={classes.columns}>
        {requireY && (
          <div className={classes.column}>
            <div className={classes.columnHeader}>
              <MdTrendingUp size={18} color={tokens.colorNeutralForeground2} />
              <Text size={300} weight="semibold" className={classes.columnHeaderTitle}>
                {showVariableSelection && dataFormat === 'Single X' ? 'Available Variables' : 'Y Variables'}
              </Text>
              <div className={classes.columnHeaderBadge}>{yVariableList.size}</div>
            </div>

            <VariableListRender
              list={yVariableList}
              selectAll={selectAllY}
              setSelectAll={setSelectAllY}
              setList={setYVariableList}
              listName="yVariableList"
              selectAllText="Select All"
              maxSelected={dataFormat === 'Y Many X' ? 1 : undefined}
            />

            {showVariableSelection && dataFormat !== 'Single X' && yVariableList.size > 0 && (
              <Button icon={<MdOutlineRemove />} appearance="outline" onClick={handleRemoveFromY} className={classes.removeBtn}>
                Remove from Y
              </Button>
            )}
          </div>
        )}

        <div className={classes.column}>
          <div className={classes.columnHeader}>
            <MdInfoOutline size={18} color={tokens.colorNeutralForeground2} />
            <Text size={300} weight="semibold" className={classes.columnHeaderTitle}>Available Variables</Text>
            <div className={classes.columnHeaderBadge}>{availableList.size}</div>
          </div>

          <VariableListRender
            list={availableList}
            selectAll={selectAllAvailable}
            setSelectAll={setSelectAllAvailable}
            setList={setAvailableList}
            listName="availableList"
            selectAllText="Select All"
          />

          <div className={classes.actions}>
            {showVariableSelection ? (
              <>
                {(dataFormat === 'XY Pair' || dataFormat === 'XY Pairs' || dataFormat === 'XY Category' || dataFormat === 'X Many Y' || dataFormat === 'Y Many X') && (
                  <>
                    <Button icon={<MdKeyboardDoubleArrowLeft />} onClick={handleSendToY} className={classes.actionBtn} disabled={!canSendToY}>
                      Send to Y
                    </Button>
                    <Button icon={<MdKeyboardDoubleArrowRight />} iconPosition="after" onClick={handleSendToX} className={classes.actionBtn} disabled={!canSendToX}>
                      Send to X
                    </Button>
                  </>
                )}
                {(dataFormat === 'Single Y' || dataFormat === 'Many Y' || dataFormat === 'Y Category') && (
                  <Button icon={<MdKeyboardDoubleArrowLeft />} onClick={handleSendToY} className={classes.actionBtn} disabled={!canSendToY}>
                    Send to Y
                  </Button>
                )}
                {(dataFormat === 'Single X' || dataFormat === 'Many X' || dataFormat === 'X Category') && (
                  <Button icon={<MdKeyboardDoubleArrowRight />} iconPosition="after" onClick={handleSendToX} className={classes.actionBtn} disabled={!canSendToX}>
                    Send to X
                  </Button>
                )}
              </>
            ) : (
              <div style={{ padding: tokens.spacingVerticalM, textAlign: 'center', color: tokens.colorNeutralForeground2, fontSize: '14px', fontStyle: 'italic', background: tokens.colorNeutralBackground1, borderRadius: tokens.borderRadiusSmall, border: `1px dashed ${tokens.colorNeutralStroke2}` }}>
                Select a Simple Scatter sub-type to enable variable selection
              </div>
            )}
          </div>
        </div>

        {requireX && (
          <div className={classes.columnNoRightBorder}>
            <div className={classes.columnHeader}>
              <MdTrendingDown size={18} color={tokens.colorNeutralForeground2} />
              <Text size={300} weight="semibold" className={classes.columnHeaderTitle}>
                {showVariableSelection && dataFormat === 'Single Y' ? 'Available Variables' : 'X Variables'}
              </Text>
              <div className={classes.columnHeaderBadge}>{xVariableList.size}</div>
            </div>

            <VariableListRender
              list={xVariableList}
              selectAll={selectAllX}
              setSelectAll={setSelectAllX}
              setList={setXVariableList}
              listName="xVariableList"
              selectAllText="Select All"
              maxSelected={dataFormat === 'X Many Y' ? 1 : undefined}
            />

            {showVariableSelection && dataFormat !== 'Single Y' && xVariableList.size > 0 && (
              <Button icon={<MdOutlineRemove />} appearance="outline" onClick={handleRemoveFromX} className={classes.removeBtn}>
                Remove from X
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


