import React, { FC, ReactNode } from 'react';
import { Button, Text, tokens } from '@fluentui/react-components';
import { MdCheckCircle, MdInfoOutline, MdOutlineRemove, MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight, MdTrendingDown, MdTrendingUp } from 'react-icons/md';

interface VariableSelectionProps {
  classes: Record<string, string>;
  requireX: boolean;
  requireY: boolean;
  requireErrorBar?: boolean;
  requireCategory?: boolean;
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
  errorBarVariableList?: Map<string, boolean>;
  selectAllErrorBar?: boolean | string | undefined;
  setSelectAllErrorBar?: (v: boolean | string | undefined) => void;
  setErrorBarVariableList?: (v: Map<string, boolean>) => void;
  categoryVariableList?: Map<string, boolean>;
  selectAllCategory?: boolean | string | undefined;
  setSelectAllCategory?: (v: boolean | string | undefined) => void;
  setCategoryVariableList?: (v: Map<string, boolean>) => void;
  handleSendToX: () => void;
  handleSendToY: () => void;
  handleSendToErrorBar?: () => void;
  handleSendToCategory?: () => void;
  handleRemoveFromX: () => void;
  handleRemoveFromY: () => void;
  handleRemoveFromErrorBar?: () => void;
  handleRemoveFromCategory?: () => void;
  canSendToX: boolean;
  canSendToY: boolean;
  canSendToErrorBar?: boolean;
  canSendToCategory?: boolean;
}

export const VariableSelection: FC<VariableSelectionProps> = (props) => {
  const {
    classes,
    requireX,
    requireY,
    requireErrorBar,
    requireCategory,
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
    errorBarVariableList,
    selectAllErrorBar,
    setSelectAllErrorBar,
    setErrorBarVariableList,
    categoryVariableList,
    selectAllCategory,
    setSelectAllCategory,
    setCategoryVariableList,
    handleSendToX,
    handleSendToY,
    handleSendToErrorBar,
    handleSendToCategory,
    handleRemoveFromX,
    handleRemoveFromY,
    handleRemoveFromErrorBar,
    handleRemoveFromCategory,
    canSendToX,
    canSendToY,
    canSendToErrorBar,
    canSendToCategory,
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

      <div style={{ 
        display: 'flex', 
        gap: tokens.spacingHorizontalM,
        flexWrap: 'wrap',
        alignItems: 'flex-start'
      }}>
        {requireY && (
          <div className={classes.column} style={{ flex: '1', minWidth: '200px' }}>
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

        {requireErrorBar && (
          <div className={classes.column} style={{ flex: '1', minWidth: '200px' }}>
            <div className={classes.columnHeader}>
              <MdTrendingUp size={18} color={tokens.colorNeutralForeground2} />
              <Text size={300} weight="semibold" className={classes.columnHeaderTitle}>Error Bar Variables</Text>
              <div className={classes.columnHeaderBadge}>{errorBarVariableList?.size || 0}</div>
            </div>

            {errorBarVariableList && VariableListRender && (
              <VariableListRender
                list={errorBarVariableList}
                selectAll={selectAllErrorBar}
                setSelectAll={setSelectAllErrorBar}
                setList={setErrorBarVariableList}
                listName="errorBarVariableList"
                selectAllText="Select All"
                maxSelected={1}
              />
            )}

            {showVariableSelection && errorBarVariableList && errorBarVariableList.size > 0 && (
              <Button icon={<MdOutlineRemove />} appearance="outline" onClick={handleRemoveFromErrorBar} className={classes.removeBtn}>
                Remove from Error Bar
              </Button>
            )}
          </div>
        )}

        {requireCategory && (
          <div className={classes.column} style={{ flex: '1', minWidth: '200px' }}>
            <div className={classes.columnHeader}>
              <MdTrendingUp size={18} color={tokens.colorNeutralForeground2} />
              <Text size={300} weight="semibold" className={classes.columnHeaderTitle}>Category Variables</Text>
              <div className={classes.columnHeaderBadge}>{categoryVariableList?.size || 0}</div>
            </div>

            {categoryVariableList && VariableListRender && (
              <VariableListRender
                list={categoryVariableList}
                selectAll={selectAllCategory}
                setSelectAll={setSelectAllCategory}
                setList={setCategoryVariableList}
                listName="categoryVariableList"
                selectAllText="Select All"
                maxSelected={1}
              />
            )}

            {showVariableSelection && categoryVariableList && categoryVariableList.size > 0 && (
              <Button icon={<MdOutlineRemove />} appearance="outline" onClick={handleRemoveFromCategory} className={classes.removeBtn}>
                Remove from Category
              </Button>
            )}
          </div>
        )}

        <div className={classes.column} style={{ flex: '1', minWidth: '200px' }}>
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
                    {requireErrorBar && (
                      <Button icon={<MdTrendingUp />} onClick={handleSendToErrorBar} className={classes.actionBtn} disabled={!canSendToErrorBar}>
                        Send to Error Bar
                      </Button>
                    )}
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
                {requireCategory && (dataFormat === 'XY Category' || dataFormat === 'X Category' || dataFormat === 'Y Category' || dataFormat === 'Category Many Y' || dataFormat === 'Category Many X') && (
                  <Button icon={<MdTrendingUp />} onClick={handleSendToCategory} className={classes.actionBtn} disabled={!canSendToCategory}>
                    Send to Category
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



